import React, { useState, useEffect } from 'react';

const STORAGE_KEY_PLAYER = 'shame_player';
const STORAGE_KEY_SINCE  = 'shame_since';

function formatElapsed(ms) {
  const totalSecs = Math.max(0, Math.floor(ms / 1000));
  const days  = Math.floor(totalSecs / 86400);
  const hours = Math.floor((totalSecs % 86400) / 3600);
  const mins  = Math.floor((totalSecs % 3600) / 60);
  const secs  = totalSecs % 60;
  return `${days}d ${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
}

export default function WallOfShame({ players }) {
  const sorted = [...players].sort((a, b) => {
  if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
  return (b.goalDifference ?? 0) - (a.goalDifference ?? 0);
  });
  const lastPlace = sorted[sorted.length - 1];

  const [shameSince, setShameSince] = useState(() => {
    const storedSince = localStorage.getItem(STORAGE_KEY_SINCE);
    return storedSince ? Number(storedSince) : Date.now();
  });

  const [elapsed, setElapsed] = useState(() => formatElapsed(Date.now() - shameSince));

  // Reset the timer whenever a different player drops to last place
  useEffect(() => {
    const storedPlayer = localStorage.getItem(STORAGE_KEY_PLAYER);
    if (storedPlayer !== lastPlace.name) {
      const now = Date.now();
      localStorage.setItem(STORAGE_KEY_PLAYER, lastPlace.name);
      localStorage.setItem(STORAGE_KEY_SINCE, String(now));
      setShameSince(now);
    }
  }, [lastPlace.name]);

  useEffect(() => {
    setElapsed(formatElapsed(Date.now() - shameSince));
    const id = setInterval(() => {
      setElapsed(formatElapsed(Date.now() - shameSince));
    }, 1000);
    return () => clearInterval(id);
  }, [shameSince]);

  return (
    <div className="bg-slate-800 rounded-2xl border border-rose-900/60 overflow-hidden shadow-xl">
      <div className="bg-rose-950/70 p-3 text-center border-b border-rose-800/50">
        <h3 className="text-sm font-black uppercase tracking-widest text-rose-400">
          🫣 Wall of Shame
        </h3>
      </div>

      {/* Full shame photo — spans edge to edge */}
      {(() => {
        const shamePhotos = {
          Nick:   '/images/shame/Nick-shame.jpg',
          Stefan: '/images/shame/Stefan-shame.jpg',
          Jiakai: '/images/shame/Jiakai-shame.jpg',
          Omer:   'images/shame/Omer-shame.jpg',
          Max:    'images/shame/Max-shame.jpg',
          Michael: 'images/shame/Michael-shame.jpg',

        };
        const shamePhoto = shamePhotos[lastPlace.name];
        return shamePhoto ? (
          <div className="relative">
            <img
              src={shamePhoto}
              alt={lastPlace.name}
              className="w-full object-contain max-h-108 bg-slate-900/60"
            />
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-rose-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap shadow-lg">
              LIVE SHAME
            </span>
          </div>
        ) : (
          <div className="relative flex items-center justify-center bg-slate-900/60 py-10 border-b border-rose-900/30">
            <span className="text-7xl">😬</span>
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-rose-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap">
              LIVE SHAME
            </span>
          </div>
        );
      })()}

      <div className="p-5 text-center">
        <h3 className="text-2xl font-black text-rose-400">{lastPlace.name}</h3>

        <p className="text-xs font-black uppercase tracking-widest text-rose-300/60 mt-1">
          Tactical Bottler
        </p>

        <p className="text-xs text-slate-500 italic mt-2 px-2">
          "{lastPlace.banterQuote}"
        </p>

        {/* Points */}
        <div className="mt-4 flex items-baseline justify-center gap-1">
          <span className="text-4xl font-black text-rose-500">{lastPlace.totalPoints}</span>
          <span className="text-sm text-slate-500 uppercase tracking-wider">pts</span>
        </div>

        {/* Live shame timer */}
        <div className="mt-4 bg-slate-900/80 rounded-xl p-3 border border-rose-900/40">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">
            Time sitting in last place
          </p>
          <p className="font-mono font-black text-rose-400 text-base tracking-wider">
            {elapsed}
          </p>
        </div>

        {/* Dead teams count */}
        <p className="text-xs text-slate-600 italic mt-3">
          {lastPlace.teams.filter(t => t.status === 'eliminated').length} of{' '}
          {lastPlace.teams.length} teams already eliminated 🪦
        </p>
      </div>
    </div>
  );
}
