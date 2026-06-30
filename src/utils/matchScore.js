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

function shootoutWinner(penH, penA) {
  if (penH > penA) return 'HOME_TEAM';
  if (penA > penH) return 'AWAY_TEAM';
  return 'DRAW';
}

function pensMatchWinner(pens, winner) {
  if (!winner || winner === 'DRAW') return true;
  return shootoutWinner(pens.home, pens.away) === winner;
}

/** Count scored kicks from the match-level penalties array (most reliable). */
function countShootoutFromEvents(match) {
  const kicks = match.penalties;
  if (!Array.isArray(kicks) || kicks.length === 0) return null;

  const homeId = match.homeTeam?.id;
  const awayId = match.awayTeam?.id;
  const homeName = match.homeTeam?.name;
  const awayName = match.awayTeam?.name;

  let home = 0;
  let away = 0;

  for (const kick of kicks) {
    if (!kick.scored) continue;
    const tid = kick.team?.id;
    const tname = kick.team?.name;
    if (tid != null && tid === homeId) home++;
    else if (tid != null && tid === awayId) away++;
    else if (tname && tname === homeName) home++;
    else if (tname && tname === awayName) away++;
  }

  if (home === 0 && away === 0) return null;
  return { home, away };
}

/** End of play from regular time + extra time (0-0 ET is valid, e.g. 1-1 after ET). */
function getPlayFromRegularAndExtra(score) {
  const rtH = scoreSide(score.regularTime, 'home');
  const rtA = scoreSide(score.regularTime, 'away');
  if (rtH == null || rtA == null) return null;

  const etH = scoreSide(score.extraTime, 'home') ?? 0;
  const etA = scoreSide(score.extraTime, 'away') ?? 0;
  return { home: rtH + etH, away: rtA + etA };
}

/** Pens that exactly reconcile play + shootout with fullTime and winner. */
function findExactPens(play, ftH, ftA, winner) {
  const penH = ftH - play.home;
  const penA = ftA - play.away;
  if (penH < 0 || penA < 0 || penH + penA < 2) return null;
  const pens = { home: penH, away: penA };
  if (!pensMatchWinner(pens, winner)) return null;
  return pens;
}

/** Resolve end-of-play + shootout scores for penalty-decided matches. */
function resolvePenaltyShootoutScores(match) {
  const score = match.score;
  const ftH = scoreSide(score?.fullTime, 'home');
  const ftA = scoreSide(score?.fullTime, 'away');
  if (ftH == null || ftA == null) return null;

  const winner = score.winner;
  const play = getPlayFromRegularAndExtra(score);
  const fromEvents = countShootoutFromEvents(match);

  // Kick-by-kick list + known 90+ET score (e.g. 1-1 after ET, pens 2-3)
  if (fromEvents && play) {
    return { play, pens: fromEvents };
  }

  if (fromEvents) {
    const playFromFt = { home: ftH - fromEvents.home, away: ftA - fromEvents.away };
    if (playFromFt.home >= 0 && playFromFt.away >= 0) {
      return { play: playFromFt, pens: fromEvents };
    }
  }

  if (play) {
    const exact = findExactPens(play, ftH, ftA, winner);
    if (exact) return { play, pens: exact };

    const ph = scoreSide(score.penalties, 'home');
    const pa = scoreSide(score.penalties, 'away');
    if (ph != null && pa != null) {
      const nodePens = { home: ph, away: pa };
      if (pensMatchWinner(nodePens, winner)) {
        return { play, pens: nodePens };
      }
    }
  }

  // No regularTime — fall back to fullTime minus penalties node or events
  const ph = scoreSide(score.penalties, 'home');
  const pa = scoreSide(score.penalties, 'away');
  if (fromEvents) {
    const playFromFt = { home: ftH - fromEvents.home, away: ftA - fromEvents.away };
    if (playFromFt.home >= 0 && playFromFt.away >= 0) {
      return { play: playFromFt, pens: fromEvents };
    }
  }
  if (ph != null && pa != null) {
    return {
      play: { home: ftH - ph, away: ftA - pa },
      pens: { home: ph, away: pa },
    };
  }

  return null;
}

/** Score after 90 min + extra time — excludes shootout goals. */
export function getEndOfPlayScore(match) {
  const score = match.score;
  if (!score) return { home: null, away: null };

  if (wentToPenalties(match)) {
    const resolved = resolvePenaltyShootoutScores(match);
    if (resolved) return resolved.play;
  }

  return {
    home: scoreSide(score.fullTime, 'home'),
    away: scoreSide(score.fullTime, 'away'),
  };
}

/** Shootout goals only. */
export function getPenaltyScore(match) {
  if (!wentToPenalties(match)) return null;
  return resolvePenaltyShootoutScores(match)?.pens ?? null;
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
