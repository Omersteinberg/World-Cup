const LIVE_STATUSES = ['IN_PLAY', 'PAUSED', 'HALFTIME', 'EXTRA_TIME', 'PENALTY_SHOOTOUT'];

/** Best available live minute from the API (list endpoint often omits match.minute). */
export function getMatchMinute(match) {
  if (match.minute != null) return match.minute;

  const goals = match.goals;
  if (Array.isArray(goals) && goals.length > 0 && LIVE_STATUSES.includes(match.status)) {
    const fromGoals = Math.max(
      ...goals.map(g => (g.minute ?? 0) + (g.injuryTime ?? 0)),
    );
    if (fromGoals > 0) return fromGoals;
  }

  // List endpoint often omits minute — estimate from kickoff (ignores half-time break)
  if (['IN_PLAY', 'EXTRA_TIME'].includes(match.status) && match.utcDate) {
    const elapsed = Math.floor((Date.now() - new Date(match.utcDate).getTime()) / 60000);
    if (elapsed > 0 && elapsed <= 130) return elapsed;
  }

  return null;
}

export function formatLiveMinute(match) {
  if (match.status === 'HALFTIME') return 'HT';
  if (match.status === 'PENALTY_SHOOTOUT') return 'PENS';
  if (match.status === 'EXTRA_TIME') {
    const m = getMatchMinute(match);
    return m != null ? `${m}'` : 'ET';
  }
  const m = getMatchMinute(match);
  return m != null ? `${m}'` : 'LIVE';
}
