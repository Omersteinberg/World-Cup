import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  collection, onSnapshot, setDoc, doc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../services/firebase';

// ── Constants ─────────────────────────────────────────────────────────────────
const PLAYERS   = ['Omer', 'Jiakai', 'James', 'Max', 'Michael', 'Nick', 'Stefan', 'Fabian'];
const TIPS_COL  = 'worldcup_tips';
const PREDS_COL = 'worldcup_predictions';
const NAME_KEY  = 'syndicate_name';

const configured = !!(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID
);

// ── AEST helpers ──────────────────────────────────────────────────────────────
const TZ = 'Australia/Melbourne';

function todayAEST() {
  return new Date().toLocaleDateString('en-CA', { timeZone: TZ }); // YYYY-MM-DD
}

function matchDateAEST(utcDate) {
  return new Date(utcDate).toLocaleDateString('en-CA', { timeZone: TZ });
}

function formatTimeAEST(utcDate) {
  return new Date(utcDate).toLocaleTimeString('en-AU', {
    timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

function formatDateHeader(dateStr) {
  // dateStr is YYYY-MM-DD — parse as local date to avoid timezone shift in header
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-AU', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

// ── Game logic ─────────────────────────────────────────────────────────────────
function getActualResult(match) {
  if (match.status !== 'FINISHED') return null;
  const hs = match.score?.fullTime?.home;
  const as = match.score?.fullTime?.away;
  if (hs == null || as == null) return null;
  return hs > as ? 'home' : hs < as ? 'away' : 'draw';
}

function isLocked(match) {
  if (['IN_PLAY', 'PAUSED', 'HALFTIME', 'FINISHED'].includes(match.status)) return true;
  return new Date(match.utcDate).getTime() <= Date.now();
}

function docId(matchId, playerName) {
  return `${matchId}_${playerName}`;
}

function groupLabel(g) {
  return g?.replace('GROUP_', 'Group ') ?? '';
}

// ── Manual adjustments ───────────────────────────────────────────────────────
// One-off corrections for tips that never made it into Firestore (e.g. called
// verbally/missed the app) — added on top of the auto-calculated totals.
const MANUAL_ADJUSTMENTS = {
  Max:  6, // got everyone's tips right but forgot to submit them in the app
  Omer: 1, // got the exact score right but forgot to select home/draw/away
};

// ── Points calculation ─────────────────────────────────────────────────────────
function calcPoints(finishedMatches, tipMap, predMap) {
  const total = {};
  const todayPts = {};
  PLAYERS.forEach(p => { total[p] = MANUAL_ADJUSTMENTS[p] ?? 0; todayPts[p] = 0; });
  const today = todayAEST();

  for (const m of finishedMatches) {
    const result = getActualResult(m);
    if (!result) continue;
    const hs = m.score?.fullTime?.home;
    const as = m.score?.fullTime?.away;
    const isToday = matchDateAEST(m.utcDate) === today;

    for (const player of PLAYERS) {
      const tip  = tipMap[m.id]?.[player];
      const pred = predMap[m.id]?.[player];
      let pts = 0;

      // Exact score → 2pts (replaces result tip)
      if (pred != null && pred.homeScore === hs && pred.awayScore === as) {
        pts = 2;
      } else if (tip === result) {
        pts = 1;
      }

      total[player]    += pts;
      if (isToday) todayPts[player] += pts;
    }
  }
  return { total, todayPts };
}

// ── TipButton ─────────────────────────────────────────────────────────────────
function TipBtn({ value, label, selected, onClick, disabled }) {
  const colorMap = {
    home: selected ? 'bg-blue-600 text-white border-blue-500'   : 'bg-slate-900 border-slate-600 text-slate-400 hover:border-blue-500 hover:text-blue-400',
    draw: selected ? 'bg-amber-600 text-white border-amber-500' : 'bg-slate-900 border-slate-600 text-slate-400 hover:border-amber-500 hover:text-amber-400',
    away: selected ? 'bg-rose-600 text-white border-rose-500'   : 'bg-slate-900 border-slate-600 text-slate-400 hover:border-rose-500 hover:text-rose-400',
  };
  return (
    <button
      onClick={() => !disabled && onClick(value)}
      disabled={disabled}
      className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${colorMap[value]}`}
    >
      {label}
    </button>
  );
}

// ── MatchCard ─────────────────────────────────────────────────────────────────
function MatchCard({ match, tipMap, predMap, playerName, onTip, onPred }) {
  const locked   = isLocked(match);
  const result   = getActualResult(match);
  const isLive   = ['IN_PLAY', 'PAUSED', 'HALFTIME'].includes(match.status);
  const isDone   = match.status === 'FINISHED';
  const hs       = match.score?.fullTime?.home;
  const as       = match.score?.fullTime?.away;

  const myTip  = playerName ? tipMap[match.id]?.[playerName]  : null;
  const myPred = playerName ? predMap[match.id]?.[playerName] : null;

  const [pendH, setPendH] = useState(myPred?.homeScore ?? '');
  const [pendA, setPendA] = useState(myPred?.awayScore ?? '');

  // Sync local score state if Firestore updates
  useEffect(() => {
    if (myPred != null) {
      setPendH(myPred.homeScore);
      setPendA(myPred.awayScore);
    }
  }, [myPred?.homeScore, myPred?.awayScore]);

  function handlePredSubmit() {
    if (pendH === '' || pendA === '' || locked) return;
    onPred(match, Number(pendH), Number(pendA));
  }

  return (
    <div className="bg-slate-800 border border-slate-700/80 rounded-2xl overflow-hidden">
      {/* Match header */}
      <div className={`p-4 ${isLive ? 'bg-emerald-950/30' : ''}`}>
        <div className="flex items-center justify-between text-[10px] text-slate-500 mb-2 uppercase tracking-wider">
          <span>{groupLabel(match.group)}</span>
          <span>{formatTimeAEST(match.utcDate)} AEST</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-bold text-sm text-slate-200 flex-1">{match.homeTeam?.name ?? 'TBD'}</span>
          <div className="shrink-0 text-center min-w-[60px]">
            {isDone ? (
              <span className="text-white font-black text-lg">{hs} – {as}</span>
            ) : isLive ? (
              <span className="text-emerald-400 font-black text-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                LIVE
              </span>
            ) : (
              <span className="text-slate-600 text-xs">vs</span>
            )}
          </div>
          <span className="font-bold text-sm text-slate-200 flex-1 text-right">{match.awayTeam?.name ?? 'TBD'}</span>
        </div>

        {isDone && (
          <p className="text-center text-[10px] text-slate-600 uppercase tracking-wider mt-1">Full Time</p>
        )}
        {locked && !isDone && !isLive && (
          <p className="text-center text-[10px] text-rose-500/70 uppercase tracking-wider mt-1">🔒 Locked</p>
        )}
      </div>

      {/* My pick (only if name selected and not locked) */}
      {playerName && !locked && (
        <div className="px-4 pb-4 pt-0 border-t border-slate-700/50 bg-slate-900/20">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-3 mb-2">Your Pick</p>

          {/* Tip buttons */}
          <div className="flex gap-2 mb-3">
            <TipBtn
              value="home" label={match.homeTeam?.name?.split(' ')[0] ?? 'Home'}
              selected={myTip === 'home'} onClick={v => onTip(match, v)} disabled={false}
            />
            <TipBtn value="draw" label="Draw" selected={myTip === 'draw'} onClick={v => onTip(match, v)} disabled={false} />
            <TipBtn
              value="away" label={match.awayTeam?.name?.split(' ')[0] ?? 'Away'}
              selected={myTip === 'away'} onClick={v => onTip(match, v)} disabled={false}
            />
          </div>

          {/* Score prediction */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 shrink-0">Score:</span>
            <input
              type="number" min="0" max="20" value={pendH}
              onChange={e => setPendH(e.target.value)}
              className="w-12 bg-slate-900 border border-slate-600 rounded-lg py-1.5 text-center
                text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            />
            <span className="text-slate-600">–</span>
            <input
              type="number" min="0" max="20" value={pendA}
              onChange={e => setPendA(e.target.value)}
              className="w-12 bg-slate-900 border border-slate-600 rounded-lg py-1.5 text-center
                text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={handlePredSubmit}
              disabled={pendH === '' || pendA === ''}
              className="ml-auto bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700
                disabled:text-slate-500 text-white text-xs font-black px-3 py-1.5 rounded-lg transition-colors"
            >
              {myPred != null ? '✓ Update' : 'Submit'}
            </button>
          </div>
        </div>
      )}

      {/* All players' picks */}
      <div className="px-4 pb-4 pt-3 border-t border-slate-700/40">
        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">All Picks</p>
        <div className="grid grid-cols-2 gap-1.5">
          {PLAYERS.map(name => {
            const tip  = tipMap[match.id]?.[name];
            const pred = predMap[match.id]?.[name];

            let pts = 0;
            let tipOk  = null;
            let predOk = null;

            if (isDone && result) {
              if (pred != null && pred.homeScore === hs && pred.awayScore === as) {
                predOk = true;
                pts = 2;
              } else if (tip === result) {
                tipOk = true;
                pts = 1;
              } else {
                if (tip) tipOk = false;
                if (pred != null) predOk = false;
              }
            }

            const tipColors = {
              home: 'bg-blue-900/40 text-blue-400',
              draw: 'bg-amber-900/40 text-amber-400',
              away: 'bg-rose-900/40 text-rose-400',
            };
            const tipShort = { home: 'H', draw: 'D', away: 'A' };

            return (
              <div key={name}
                className="bg-slate-900/60 border border-slate-700/40 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-400 w-11 shrink-0 truncate">{name}</span>

                {tip ? (
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide ${tipColors[tip] ?? ''}`}>
                    {tipShort[tip]}{isDone && tipOk !== null ? (tipOk ? '✅' : '❌') : ''}
                  </span>
                ) : (
                  <span className="text-[9px] text-slate-600 italic">—</span>
                )}

                {pred != null && (
                  <span className={`text-[10px] font-semibold ml-0.5 ${predOk === true ? 'text-emerald-400' : predOk === false ? 'text-slate-500 line-through' : 'text-slate-400'}`}>
                    {pred.homeScore}–{pred.awayScore}
                    {isDone && predOk === true && ' ✅'}
                  </span>
                )}

                {isDone && pts > 0 && (
                  <span className="ml-auto text-[10px] font-black text-emerald-400">+{pts}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Tipping Leaderboard ───────────────────────────────────────────────────────
function TippingLeaderboard({ finishedMatches, tipMap, predMap }) {
  const [sortBy, setSortBy] = useState('total'); // 'total' | 'today'
  const { total, todayPts } = useMemo(
    () => calcPoints(finishedMatches, tipMap, predMap),
    [finishedMatches, tipMap, predMap],
  );

  const rows = useMemo(() =>
    PLAYERS
      .map(p => ({ name: p, total: total[p], today: todayPts[p] }))
      .sort((a, b) => sortBy === 'today'
        ? b.today - a.today || b.total - a.total
        : b.total - a.total || b.today - a.today
      ),
    [total, todayPts, sortBy],
  );

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
      <div className="bg-slate-950 p-4 text-center border-b border-slate-700">
        <h2 className="text-lg font-black text-amber-400 uppercase tracking-wider">🏅 Tipping Leaderboard</h2>
        <p className="text-xs text-slate-500 mt-1">Points from correct tips (1pt) and exact scores (2pts)</p>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700 text-xs text-slate-500 uppercase tracking-wider">
            <th className="px-4 py-3 text-left w-8">#</th>
            <th className="px-4 py-3 text-left">Player</th>
            <th
              className={`px-3 py-3 text-right cursor-pointer select-none transition-colors
                ${sortBy === 'today' ? 'text-emerald-400 font-black' : 'hover:text-slate-300'}`}
              onClick={() => setSortBy('today')}
            >
              Today {sortBy === 'today' && '▲'}
            </th>
            <th
              className={`px-4 py-3 text-right cursor-pointer select-none transition-colors
                ${sortBy === 'total' ? 'text-emerald-400 font-black' : 'hover:text-slate-300'}`}
              onClick={() => setSortBy('total')}
            >
              Total {sortBy === 'total' && '▲'}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/50">
          {rows.map((row, i) => {
            const isFirst = i === 0;
            const isLast  = i === rows.length - 1;
            return (
              <tr key={row.name}
                className={`transition-colors ${isFirst ? 'bg-amber-500/5' : isLast ? 'bg-rose-500/5' : ''}`}>
                <td className={`px-4 py-3 font-black ${isFirst ? 'text-amber-400' : isLast ? 'text-rose-500' : 'text-slate-500'}`}>
                  #{i + 1}
                </td>
                <td className="px-4 py-3 font-semibold text-slate-200">
                  {row.name}
                  {isFirst && ' 🏅'}
                  {isLast  && ' 🤡'}
                </td>
                <td className="px-3 py-3 text-right font-bold text-slate-300">{row.today}</td>
                <td className="px-4 py-3 text-right font-black text-emerald-400 text-base">{row.total}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Main TippingPage ──────────────────────────────────────────────────────────
export default function TippingPage({ matches = [] }) {
  const [playerName, setPlayerName] = useState(() => localStorage.getItem(NAME_KEY) ?? '');
  const [tipMap,  setTipMap]  = useState({}); // { matchId: { playerName: 'home'|'draw'|'away' } }
  const [predMap, setPredMap] = useState({}); // { matchId: { playerName: { homeScore, awayScore } } }
  const [tab, setTab] = useState('matches');
  const todayRef = useRef(null);
  const hasScrolledRef = useRef(false);

  // Persist name
  useEffect(() => {
    if (playerName) localStorage.setItem(NAME_KEY, playerName);
  }, [playerName]);

  // Subscribe to all tips
  useEffect(() => {
    if (!configured) return;
    return onSnapshot(collection(db, TIPS_COL), snap => {
      const map = {};
      snap.docs.forEach(d => {
        const { matchId, playerName: pn, tip } = d.data();
        if (!matchId || !pn) return;
        if (!map[matchId]) map[matchId] = {};
        map[matchId][pn] = tip;
      });
      setTipMap(map);
    });
  }, []);

  // Subscribe to all predictions
  useEffect(() => {
    if (!configured) return;
    return onSnapshot(collection(db, PREDS_COL), snap => {
      const map = {};
      snap.docs.forEach(d => {
        const { matchId, playerName: pn, homeScore, awayScore, timestamp } = d.data();
        if (!matchId || !pn) return;
        if (!map[matchId]) map[matchId] = {};
        const ts = timestamp?.seconds ?? 0;
        const existing = map[matchId][pn];
        if (!existing || ts >= (existing._ts ?? 0)) {
          map[matchId][pn] = { homeScore, awayScore, _ts: ts };
        }
      });
      setPredMap(map);
    });
  }, []);

  // Group matches by AEST date, sorted chronologically
  const grouped = useMemo(() => {
    const g = {};
    for (const m of matches) {
      const date = matchDateAEST(m.utcDate);
      if (!g[date]) g[date] = [];
      g[date].push(m);
    }
    Object.values(g).forEach(arr => arr.sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate)));
    return g;
  }, [matches]);

  const sortedDates = useMemo(() => Object.keys(grouped).sort(), [grouped]);

  // Auto-scroll to today's matches once, the first time they're available
  useEffect(() => {
    if (hasScrolledRef.current || tab !== 'matches') return;
    if (!sortedDates.includes(todayAEST()) || !todayRef.current) return;
    todayRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    hasScrolledRef.current = true;
  }, [tab, sortedDates]);
  const finishedMatches = useMemo(() => matches.filter(m => m.status === 'FINISHED'), [matches]);

  async function handleTip(match, tip) {
    if (!playerName || isLocked(match) || !configured) return;
    await setDoc(doc(db, TIPS_COL, docId(match.id, playerName)), {
      matchId: String(match.id),
      playerName,
      tip,
      timestamp: serverTimestamp(),
    });
  }

  async function handlePred(match, homeScore, awayScore) {
    if (!playerName || isLocked(match) || !configured) return;
    await setDoc(doc(db, PREDS_COL, docId(match.id, playerName)), {
      matchId:   String(match.id),
      playerName,
      homeScore,
      awayScore,
      timestamp: serverTimestamp(),
    });
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
      {/* Header */}
      <header className="text-center">
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text
          bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 leading-tight pb-1">
          TIPPING
        </h1>
        <p className="text-slate-400 mt-2 text-sm">Pick results · Predict scores · Claim bragging rights</p>
      </header>

      {/* Name selector */}
      <div className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3">
        <span className="text-sm text-slate-400 shrink-0">Playing as:</span>
        <select
          value={playerName}
          onChange={e => setPlayerName(e.target.value)}
          className="flex-1 bg-transparent text-sm font-bold text-emerald-400 focus:outline-none cursor-pointer"
        >
          <option value="" className="bg-slate-800 text-slate-400">Select your name…</option>
          {PLAYERS.map(p => <option key={p} value={p} className="bg-slate-800 text-slate-200">{p}</option>)}
        </select>
      </div>

      {!configured && (
        <div className="text-center text-slate-500 text-sm italic bg-slate-800 border border-slate-700 rounded-2xl p-6">
          ⚙️ Firebase not configured — tipping disabled.
        </div>
      )}

      {configured && (
        <>
          {/* Tab switcher */}
          <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700 gap-1">
            {[
              { key: 'matches',     label: '⚽ Matches'     },
              { key: 'leaderboard', label: '🏅 Leaderboard' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-1 py-2 rounded-lg text-sm font-black uppercase tracking-wider transition-colors
                  ${tab === key ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Matches tab */}
          {tab === 'matches' && (
            <div className="flex flex-col gap-6">
              {sortedDates.length === 0 && (
                <p className="text-center text-slate-500 italic py-8">
                  No matches loaded yet. Check back once the tournament kicks off.
                </p>
              )}
              {sortedDates.map(date => (
                <div
                  key={date}
                  ref={date === todayAEST() ? todayRef : null}
                  className="flex flex-col gap-3"
                >
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 px-1">
                    {formatDateHeader(date)}
                    {date === todayAEST() && (
                      <span className="ml-2 text-emerald-400 text-[10px] bg-emerald-900/40
                        border border-emerald-700/50 px-2 py-0.5 rounded-full normal-case tracking-normal">
                        Today
                      </span>
                    )}
                  </h2>
                  {grouped[date].map(match => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      tipMap={tipMap}
                      predMap={predMap}
                      playerName={playerName}
                      onTip={handleTip}
                      onPred={handlePred}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Leaderboard tab */}
          {tab === 'leaderboard' && (
            <TippingLeaderboard
              finishedMatches={finishedMatches}
              tipMap={tipMap}
              predMap={predMap}
            />
          )}
        </>
      )}
    </div>
  );
}
