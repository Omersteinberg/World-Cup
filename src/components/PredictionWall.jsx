import React, { useState, useEffect } from 'react';
import {
  collection, onSnapshot, addDoc, query,
  where, serverTimestamp, orderBy,
} from 'firebase/firestore';
import { db } from '../services/firebase';

const PLAYERS = ['Omer', 'Jiakai', 'James', 'Max', 'Michael', 'Nick', 'Stefan', 'Fabian'];
const COL = 'worldcup_predictions';

const configured = !!(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID
);

function getTargetMatch(matches) {
  // Prefer a live match
  const live = matches.find(m =>
    ['IN_PLAY', 'PAUSED', 'HALFTIME'].includes(m.status)
  );
  if (live) return live;

  // Otherwise the next scheduled match
  const now = Date.now();
  return matches
    .filter(m => ['SCHEDULED', 'TIMED'].includes(m.status))
    .filter(m => new Date(m.utcDate).getTime() > now)
    .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate))[0] ?? null;
}

function isLocked(match) {
  if (!match) return true;
  if (['IN_PLAY', 'PAUSED', 'HALFTIME', 'FINISHED'].includes(match.status)) return true;
  return new Date(match.utcDate).getTime() <= Date.now();
}

function formatKickoff(utcDate) {
  return new Date(utcDate).toLocaleString([], {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function PredictionWall({ matches = [] }) {
  const [predictions, setPredictions] = useState([]);
  const [playerName,  setPlayerName]  = useState(() => localStorage.getItem('daxhub_name') ?? '');
  const [homeScore,   setHomeScore]   = useState('');
  const [awayScore,   setAwayScore]   = useState('');
  const [submitting,  setSubmitting]  = useState(false);
  const [submitted,   setSubmitted]   = useState(false);

  const target = getTargetMatch(matches);
  const locked = isLocked(target);

  // Real-time predictions for this match
  useEffect(() => {
    if (!target || !configured) return;
    const q = query(
      collection(db, COL),
      where('matchId', '==', String(target.id)),
      orderBy('submittedAt', 'asc'),
    );
    return onSnapshot(q, snap => {
      setPredictions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, [target?.id]);

  async function submit() {
    if (!playerName || homeScore === '' || awayScore === '' || locked || submitting) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, COL), {
        matchId:    String(target.id),
        matchLabel: `${target.homeTeam?.name} vs ${target.awayTeam?.name}`,
        playerName,
        homeScore:  Number(homeScore),
        awayScore:  Number(awayScore),
        kickoffUtc: target.utcDate,
        submittedAt: serverTimestamp(),
      });
      localStorage.setItem('daxhub_name', playerName);
      setHomeScore('');
      setAwayScore('');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } finally {
      setSubmitting(false);
    }
  }

  // Map playerName → their prediction for this match
  const predMap = {};
  predictions.forEach(p => { predMap[p.playerName] = p; });

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="bg-slate-950 p-3 text-center border-b border-slate-700">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-300">🎯 Prediction Wall</h3>
        {target ? (
          <div className="mt-1">
            <p className="text-xs font-bold text-white">
              {target.homeTeam?.name} <span className="text-slate-500">vs</span> {target.awayTeam?.name}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">{formatKickoff(target.utcDate)}</p>
            {locked && (
              <span className="inline-block mt-1 bg-rose-900/60 text-rose-400 text-[9px] font-black
                uppercase tracking-widest px-2 py-0.5 rounded-full border border-rose-800/50">
                🔒 Predictions Locked
              </span>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-500 mt-1 italic">No upcoming match found</p>
        )}
      </div>

      <div className="p-4">
        {!configured && (
          <p className="text-slate-500 text-xs text-center italic py-2">
            ⚙️ Firebase not configured — predictions disabled.
          </p>
        )}

        {configured && target && !locked && (
          <div className="mb-4">
            <div className="flex gap-2 items-center">
              <select
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-2 py-2 text-xs
                  text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="">Your name…</option>
                {PLAYERS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>

              {/* Score inputs */}
              <input
                type="number" min="0" max="20"
                value={homeScore}
                onChange={e => setHomeScore(e.target.value)}
                placeholder="0"
                className="w-12 bg-slate-900 border border-slate-600 rounded-lg px-1 py-2 text-xs
                  text-center text-slate-200 focus:outline-none focus:border-emerald-500"
              />
              <span className="text-slate-600 font-black text-sm">–</span>
              <input
                type="number" min="0" max="20"
                value={awayScore}
                onChange={e => setAwayScore(e.target.value)}
                placeholder="0"
                className="w-12 bg-slate-900 border border-slate-600 rounded-lg px-1 py-2 text-xs
                  text-center text-slate-200 focus:outline-none focus:border-emerald-500"
              />

              <button
                onClick={submit}
                disabled={submitting || !playerName || homeScore === '' || awayScore === ''}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500
                  text-white text-xs font-black px-3 py-2 rounded-lg transition-colors shrink-0"
              >
                {submitting ? '…' : submitted ? '✓' : 'Lock'}
              </button>
            </div>
          </div>
        )}

        {/* All 8 players' picks */}
        {target && (
          <div className="grid grid-cols-2 gap-2">
            {PLAYERS.map(name => {
              const pred = predMap[name];
              return (
                <div
                  key={name}
                  className={`rounded-xl border p-2.5 text-center transition-colors
                    ${pred
                      ? 'border-emerald-600/50 bg-emerald-950/30'
                      : 'border-slate-700/50 bg-slate-900/30'}`}
                >
                  <p className="text-[11px] font-bold text-slate-400">{name}</p>
                  {pred ? (
                    <p className="text-xl font-black text-emerald-400 mt-0.5 tracking-tight">
                      {pred.homeScore}–{pred.awayScore}
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-600 mt-1.5 italic">
                      {locked ? 'No pick' : 'Waiting…'}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
