import React from 'react';

const PRIZE_PER_PLAYER = 30;

const PRIZE_STRUCTURE = [
  { label: '🥇 1st', pct: 0.7, color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-950/20' },
  { label: '🥈 2nd', pct: 0.2, color: 'text-slate-300', border: 'border-slate-500/30', bg: 'bg-slate-900/40' },
  { label: '🥉 3rd', pct: 0.1, color: 'text-orange-400', border: 'border-orange-500/30', bg: 'bg-orange-950/20' },
];

const WINNER_LINES = [
  "reportedly already shopping for a trophy shelf.",
  "planning to rub it in everyone's face for 4 years.",
  "will definitely use the cash to enter the next one and lose.",
];

const LOSER_LINES = [
  "will be last to pick their consolation beer.",
  "reportedly auditioning for a coaching role to find someone to blame.",
  "might use the downtime to finally learn the offside rule.",
];

export default function PotTracker({ players }) {
  const sorted = [...players].sort((a, b) => b.totalPoints - a.totalPoints);
  const winner = sorted[0];
  const lastPlace = sorted[sorted.length - 1];
  const prizePool = players.length * PRIZE_PER_PLAYER;

  const winnerLine = WINNER_LINES[winner.name.charCodeAt(0) % WINNER_LINES.length];
  const loserLine = LOSER_LINES[lastPlace.name.charCodeAt(0) % LOSER_LINES.length];

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
      <div className="bg-emerald-950/70 p-3 text-center border-b border-emerald-800/40">
        <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400">
          💰 Prize Pot Status
        </h3>
      </div>

      <div className="p-5">
        {/* Total pool */}
        <div className="text-center mb-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Total Prize Pool</p>
          <p className="text-5xl font-black text-emerald-400 mt-1">${prizePool}</p>
          <p className="text-xs text-slate-500 mt-1">
            {players.length} players × ${PRIZE_PER_PLAYER} entry
          </p>
        </div>

        {/* Payout splits */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {PRIZE_STRUCTURE.map(({ label, pct, color, border, bg }) => (
            <div key={label} className={`${bg} rounded-lg p-2 border ${border} text-center`}>
              <p className="text-xs text-slate-400 mb-1">{label}</p>
              <p className={`font-black text-sm ${color}`}>${prizePool * pct}</p>
            </div>
          ))}
        </div>

        {/* Projected winner */}
        <div className="bg-emerald-950/40 rounded-xl p-3 border border-emerald-900/40 mb-3">
          <p className="text-xs text-emerald-500/70 uppercase tracking-wider mb-1">
            Projected Winner 🏆
          </p>
          <p className="font-black text-emerald-400 text-lg">{winner.name}</p>
          <p className="text-xs text-slate-400 italic mt-1">
            {winner.totalPoints} pts — {winnerLine}
          </p>
        </div>

        {/* Wooden spoon */}
        <div className="bg-rose-950/40 rounded-xl p-3 border border-rose-900/40">
          <p className="text-xs text-rose-500/70 uppercase tracking-wider mb-1">
            Wooden Spoon 🥄
          </p>
          <p className="font-black text-rose-400 text-lg">{lastPlace.name}</p>
          <p className="text-xs text-slate-400 italic mt-1">
            {lastPlace.totalPoints} pts — {loserLine}
          </p>
        </div>
      </div>
    </div>
  );
}
