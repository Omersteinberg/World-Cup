// src/hooks/useLiveScores.js
// Polls the WC match feed every 60 s and derives per-player points.

import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchWCMatches } from '../services/footballApi';

const POLL_MS   = 60_000; // 1 minute — safe for football-data.org free tier
const TODAY_STR = () => new Date().toISOString().split('T')[0];

// Win = 3 pts, draw = 1 pt each, loss = 0.
// Only FINISHED matches contribute to the leaderboard.
export function calcPlayerPoints(players, matches) {
  const earned = {};

  for (const m of matches) {
    if (m.status !== 'FINISHED') continue;
    const h  = m.homeTeam?.name;
    const a  = m.awayTeam?.name;
    const hs = m.score?.fullTime?.home;
    const as = m.score?.fullTime?.away;
    if (h == null || a == null || hs == null || as == null) continue;

    if (hs > as) {
      earned[h] = (earned[h] ?? 0) + 3;
    } else if (hs === as) {
      earned[h] = (earned[h] ?? 0) + 1;
      earned[a] = (earned[a] ?? 0) + 1;
    } else {
      earned[a] = (earned[a] ?? 0) + 3;
    }
  }

  return players.map(p => {
    const teams = p.teams.map(t => ({ ...t, points: earned[t.name] ?? 0 }));
    return { ...p, teams, totalPoints: teams.reduce((s, t) => s + t.points, 0) };
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
    () => matches.filter(m => ['IN_PLAY', 'PAUSED', 'HALFTIME'].includes(m.status)),
    [matches],
  );

  const todayMatches = useMemo(() => {
    const today = TODAY_STR();
    return matches.filter(m => m.utcDate?.startsWith(today));
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
