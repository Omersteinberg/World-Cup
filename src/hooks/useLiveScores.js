// src/hooks/useLiveScores.js
// Polls the WC match feed every 60 s and derives per-player points.

import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchWCMatches } from '../services/footballApi';
import { todayLocal, matchLocalDate } from '../utils/matchDates';

const POLL_MS = 60_000;

const LIVE_STATUSES = ['IN_PLAY', 'PAUSED', 'HALFTIME', 'EXTRA_TIME', 'PENALTY_SHOOTOUT'];

const DISPLAY_ORDER = {
  IN_PLAY: 0, PAUSED: 1, HALFTIME: 2, EXTRA_TIME: 3, PENALTY_SHOOTOUT: 4,
  FINISHED: 5, TIMED: 6, SCHEDULED: 7,
};

function sortTodayMatches(a, b) {
  const oa = DISPLAY_ORDER[a.status] ?? 8;
  const ob = DISPLAY_ORDER[b.status] ?? 8;
  if (oa !== ob) return oa - ob;
  return new Date(a.utcDate) - new Date(b.utcDate);
}

// Win = 3 pts, draw = 1 pt each, loss = 0.
// Goal difference is tracked as a tiebreaker (GD = goals scored − goals conceded).
// Only FINISHED matches contribute.
export function calcPlayerPoints(players, matches) {
  const earned = {}; // teamName → points
  const teamGD  = {}; // teamName → goal difference

  for (const m of matches) {
    if (m.status !== 'FINISHED') continue;
    const h  = m.homeTeam?.name;
    const a  = m.awayTeam?.name;
    const hs = m.score?.fullTime?.home;
    const as = m.score?.fullTime?.away;
    if (h == null || a == null || hs == null || as == null) continue;

    // Points
    if (hs > as) {
      earned[h] = (earned[h] ?? 0) + 3;
    } else if (hs === as) {
      earned[h] = (earned[h] ?? 0) + 1;
      earned[a] = (earned[a] ?? 0) + 1;
    } else {
      earned[a] = (earned[a] ?? 0) + 3;
    }

    // Goal difference per team
    teamGD[h] = (teamGD[h] ?? 0) + (hs - as);
    teamGD[a] = (teamGD[a] ?? 0) + (as - hs);
  }

  return players.map(p => {
    const teams = p.teams.map(t => ({
      ...t,
      points:         earned[t.name] ?? 0,
      goalDifference: teamGD[t.name]  ?? 0,
    }));
    return {
      ...p,
      teams,
      totalPoints:    teams.reduce((s, t) => s + t.points, 0),
      goalDifference: teams.reduce((s, t) => s + t.goalDifference, 0),
    };
  });
}

export function useLiveScores() {
  const [matches,     setMatches]     = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchWCMatches();
      setMatches(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_MS);
    return () => clearInterval(id);
  }, [load]);

  // Derived slices — memoised to avoid downstream re-renders
  const liveMatches = useMemo(
    () => matches.filter(m => LIVE_STATUSES.includes(m.status)),
    [matches],
  );

  const todayMatches = useMemo(() => {
    const today = todayLocal();
    return matches
      .filter(m => matchLocalDate(m.utcDate) === today)
      .sort(sortTodayMatches);
  }, [matches]);

  const recentMatches = useMemo(() => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    return matches.filter(
      m => m.status === 'FINISHED' && new Date(m.utcDate).getTime() >= cutoff,
    );
  }, [matches]);

  return {
    matches,
    liveMatches,
    todayMatches,
    recentMatches,
    loading,
    error,
    lastUpdated,
    refresh: load,
  };
}
