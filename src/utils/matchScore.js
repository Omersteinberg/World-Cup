// football-data.org v4 score helpers — fullTime includes shootout goals when
// duration is PENALTY_SHOOTOUT; use these for display and tipping logic.

function scoreSide(obj, side) {
  if (!obj) return null;
  return side === 'home' ? (obj.home ?? obj.homeTeam ?? null) : (obj.away ?? obj.awayTeam ?? null);
}

export function wentToPenalties(match) {
  return match.score?.duration === 'PENALTY_SHOOTOUT'
    || match.status === 'PENALTY_SHOOTOUT';
}

export function wentToExtraTime(match) {
  const dur = match.score?.duration;
  return dur === 'EXTRA_TIME' || dur === 'PENALTY_SHOOTOUT';
}

/** Score after 90 min + extra time — excludes shootout goals. */
export function getEndOfPlayScore(match) {
  const score = match.score;
  if (!score) return { home: null, away: null };

  if (wentToPenalties(match)) {
    const rt = score.regularTime;
    const et = score.extraTime;
    if (rt != null || et != null) {
      return {
        home: (scoreSide(rt, 'home') ?? 0) + (scoreSide(et, 'home') ?? 0),
        away: (scoreSide(rt, 'away') ?? 0) + (scoreSide(et, 'away') ?? 0),
      };
    }
    const pens = score.penalties;
    const ftH = scoreSide(score.fullTime, 'home');
    const ftA = scoreSide(score.fullTime, 'away');
    const ph = scoreSide(pens, 'home');
    const pa = scoreSide(pens, 'away');
    if (ftH != null && ftA != null && ph != null && pa != null) {
      return { home: ftH - ph, away: ftA - pa };
    }
  }

  return {
    home: scoreSide(score.fullTime, 'home'),
    away: scoreSide(score.fullTime, 'away'),
  };
}

/** Shootout goals only — derived from fullTime minus end-of-play. */
export function getPenaltyScore(match) {
  if (!wentToPenalties(match)) return null;
  const play = getEndOfPlayScore(match);
  const ftH = scoreSide(match.score?.fullTime, 'home');
  const ftA = scoreSide(match.score?.fullTime, 'away');
  if (play.home == null || play.away == null || ftH == null || ftA == null) return null;
  const home = ftH - play.home;
  const away = ftA - play.away;
  if (home < 0 || away < 0) return null;
  return { home, away };
}

/** Running score for live matches (includes ET goals as they happen). */
export function getLiveScore(match) {
  return {
    home: scoreSide(match.score?.fullTime, 'home'),
    away: scoreSide(match.score?.fullTime, 'away'),
  };
}

export function getFinishedStatusLabel(match) {
  return wentToExtraTime(match) ? 'FT + ET' : 'FT';
}
