import React, { useState, useEffect, useRef, useMemo } from 'react';

const STATUS_CFG = {
  alive:    { label: 'Alive',    pill: 'bg-emerald-500/15 text-emerald-400 border-emerald-600/40' },
  critical: { label: 'Critical', pill: 'bg-amber-500/15   text-amber-400   border-amber-600/40'  },
  rip:      { label: 'RIP',      pill: 'bg-rose-500/15    text-rose-400    border-rose-600/40'    },
};

// ── Player profile modal (slide-up) ──────────────────────────────────────────
function ProfileModal({ player, rank, total, onClose }) {
  const alive    = player.teams.filter(t => t.status === 'alive').length;
  const critical = player.teams.filter(t => t.status === 'critical').length;
  const rip      = player.teams.filter(t => t.status === 'rip').length;
  const gd       = player.goalDifference ?? 0;

  // Close on backdrop click
  return (
    <div
      className="fixed inset-0 bg-black/75 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 border border-slate-700 rounded-t-3xl sm:rounded-2xl w-full
          max-w-md shadow-2xl animate-[slideUp_0.3s_ease-out] pb-safe"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-slate-600" />
        </div>

        {/* Close (desktop) */}
        <div className="hidden sm:flex justify-end px-5 pt-4">
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-xl">✕</button>
        </div>

        <div className="px-6 pb-8 pt-4 sm:pt-2 flex flex-col items-center gap-5">
          {/* Avatar */}
          <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center
            text-4xl font-black uppercase shadow-lg
            ${rank === 1 ? 'border-amber-400 bg-amber-600/25' :
              rank === total ? 'border-rose-500 bg-rose-600/25' :
              'border-slate-500 bg-slate-700'}`}>
            {player.name[0]}
          </div>

          {/* Name + rank */}
          <div className="text-center">
            <h2 className="text-2xl font-black text-white">
              {player.name}
              {rank === 1 && ' 👑'}
              {rank === total && ' 🤡'}
            </h2>
            <p className="text-slate-400 text-sm italic mt-1">"{player.banterQuote}"</p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 w-full">
            {[
              { label: 'Rank',   value: `#${rank}` },
              { label: 'Points', value: player.totalPoints, cls: 'text-emerald-400' },
              { label: 'GD',     value: gd > 0 ? `+${gd}` : gd,
                cls: gd > 0 ? 'text-emerald-400' : gd < 0 ? 'text-rose-400' : 'text-slate-400' },
            ].map(({ label, value, cls }) => (
              <div key={label} className="bg-slate-900/60 rounded-xl p-3 text-center border border-slate-700">
                <p className={`text-xl font-black ${cls ?? 'text-white'}`}>{value}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Team health */}
          <div className="flex gap-3 w-full">
            {[
              { label: 'Alive',    count: alive,    cls: 'text-emerald-400 border-emerald-700/50 bg-emerald-950/30' },
              { label: 'Critical', count: critical, cls: 'text-amber-400   border-amber-700/50   bg-amber-950/30'   },
              { label: 'RIP',      count: rip,      cls: 'text-rose-400    border-rose-700/50    bg-rose-950/30'    },
            ].map(({ label, count, cls }) => (
              <div key={label} className={`flex-1 rounded-xl border p-2.5 text-center ${cls}`}>
                <p className="text-lg font-black">{count}</p>
                <p className="text-[10px] uppercase tracking-wider opacity-70">{label}</p>
              </div>
            ))}
          </div>

          {/* Teams grid */}
          <div className="grid grid-cols-2 gap-2 w-full">
            {player.teams.map((team, i) => {
              const cfg = STATUS_CFG[team.status] ?? STATUS_CFG.alive;
              return (
                <div key={i} className={`rounded-xl border p-3 bg-slate-900/50
                  ${team.status === 'rip' ? 'opacity-50 border-slate-700/40' : 'border-slate-700'}`}>
                  <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                    <span className={`font-bold text-xs ${team.status === 'rip' ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                      {team.name}
                    </span>
                    {team.status === 'rip' && <span>🪦</span>}
                    <span className={`text-[9px] font-black uppercase tracking-widest px-1 py-0.5 rounded border ${cfg.pill}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-amber-500/70 italic leading-tight">"{team.nickname}"</p>
                  <p className="text-emerald-400 font-black text-sm mt-1">{team.points} pts</p>
                </div>
              );
            })}
          </div>

          <button
            onClick={onClose}
            className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold py-3
              rounded-xl text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.alive;
  return (
    <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${cfg.pill}`}>
      {cfg.label}
    </span>
  );
}

function gdLabel(gd) {
  return gd > 0 ? `+${gd}` : `${gd}`;
}
function gdClass(gd) {
  return gd > 0 ? 'text-emerald-500' : gd < 0 ? 'text-rose-500' : 'text-slate-600';
}

export default function Leaderboard({ players }) {
  const [expandedId,   setExpandedId]   = useState(null);
  const [profileEntry, setProfileEntry] = useState(null); // { player, rank }

  // --- Live rank-change tracking ---
  // trendMap: { [playerId]: delta }  positive = moved up, negative = moved down
  const [trendMap, setTrendMap]   = useState({});
  const prevIdsRef                = useRef(null); // previous sorted id order
  const trendTimerRef             = useRef(null);

  const sorted = useMemo(() => [...players].sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    return (b.goalDifference ?? 0) - (a.goalDifference ?? 0);
  }), [players]);

  useEffect(() => {
    const currentIds = sorted.map(p => p.id);

    if (prevIdsRef.current === null) {
      // First render — initialise silently, no arrows yet
      prevIdsRef.current = currentIds;
      return;
    }

    const orderChanged = currentIds.some((id, i) => id !== prevIdsRef.current[i]);
    if (!orderChanged) return;

    // Build a rank lookup from the previous order
    const prevRankMap = Object.fromEntries(
      prevIdsRef.current.map((id, i) => [id, i + 1])
    );

    // Compute deltas (positive = moved up)
    const newTrends = {};
    currentIds.forEach((id, i) => {
      const prev = prevRankMap[id] ?? i + 1;
      const delta = prev - (i + 1);
      if (delta !== 0) newTrends[id] = delta;
    });

    setTrendMap(newTrends);
    prevIdsRef.current = currentIds;

    // Clear trend arrows after 30 s so they don't stay stale forever
    clearTimeout(trendTimerRef.current);
    trendTimerRef.current = setTimeout(() => setTrendMap({}), 30_000);

    return () => clearTimeout(trendTimerRef.current);
  }, [sorted]);

  const toggle = id => setExpandedId(prev => (prev === id ? null : id));

  return (
    <>
    {profileEntry && (
      <ProfileModal
        player={profileEntry.player}
        rank={profileEntry.rank}
        total={sorted.length}
        onClose={() => setProfileEntry(null)}
      />
    )}
    <div className="w-full bg-slate-800 rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
      <div className="bg-slate-950 p-4 border-b border-slate-700 text-center">
        <h2 className="text-xl font-bold text-amber-400 uppercase tracking-wider">
          🏆 Current Standings
        </h2>
      </div>

      <div className="divide-y divide-slate-700/70">
        {sorted.map((player, index) => {
          const isFirst    = index === 0;
          const isLast     = index === sorted.length - 1;
          const isExpanded = expandedId === player.id;

          // Live trend from tracked rank changes
          const delta = trendMap[player.id] ?? 0;
          let trendLabel = '●';
          let trendCls   = 'text-slate-600';
          if (delta > 0) { trendLabel = `▲ ${delta}`;           trendCls = 'text-emerald-400 font-black animate-pulse'; }
          if (delta < 0) { trendLabel = `▼ ${Math.abs(delta)}`; trendCls = 'text-rose-500 font-black'; }

          const gd = player.goalDifference ?? 0;

          return (
            <div
              key={player.id}
              className={`transition-all duration-200 ${isFirst ? 'bg-amber-500/5' : isLast ? 'bg-rose-500/5' : ''}`}
            >
              {/* Summary row */}
              <div
                onClick={() => toggle(player.id)}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-700/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Rank + trend */}
                  <div className="flex flex-col items-center w-8 shrink-0">
                    <span className={`text-[10px] leading-none ${trendCls}`}>{trendLabel}</span>
                    <span className={`text-lg font-black leading-tight
                      ${isFirst ? 'text-amber-400' : isLast ? 'text-rose-500' : 'text-slate-400'}`}>
                      #{index + 1}
                    </span>
                  </div>

                  {/* Avatar circle — click opens profile modal */}
                  <div
                    onClick={e => { e.stopPropagation(); setProfileEntry({ player, rank: index + 1 }); }}
                    className={`w-11 h-11 rounded-full shrink-0 border-2 flex items-center justify-center
                      text-lg font-black uppercase cursor-pointer hover:opacity-80 transition-opacity
                      ${isFirst ? 'border-amber-400 bg-amber-600/25' : isLast ? 'border-rose-500 bg-rose-600/25' : 'border-slate-500 bg-slate-700'}`}>
                    {player.name[0]}
                  </div>

                  {/* Name + quote */}
                  <div className="min-w-0">
                    <h3 className="font-bold text-base flex items-center gap-1.5 flex-wrap">
                      {player.name}
                      {isFirst && <span>👑</span>}
                      {isLast  && <span>🤡</span>}
                    </h3>
                    <p className="text-xs text-slate-400 italic leading-snug">"{player.banterQuote}"</p>
                  </div>
                </div>

                {/* Points + GD + chevron */}
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <div className="text-right">
                    <span className="text-2xl font-black text-emerald-400">{player.totalPoints}</span>
                    <span className="text-[10px] text-slate-500 block uppercase tracking-tight">pts</span>
                    <span className={`text-[10px] font-bold block ${gdClass(gd)}`}>
                      GD {gdLabel(gd)}
                    </span>
                  </div>
                  <span className="text-slate-600 text-xs">{isExpanded ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Expandable team grid */}
              {isExpanded && (
                <div className="bg-slate-900/60 px-4 pb-4 pt-1 border-t border-slate-700/50 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {player.teams.map((team, i) => {
                    const isRip  = team.status === 'rip';
                    const teamGD = team.goalDifference ?? 0;
                    return (
                      <div
                        key={i}
                        className={`p-3 rounded-lg border flex items-center justify-between gap-2
                          ${isRip
                            ? 'border-rose-900/30 bg-rose-950/10 opacity-50'
                            : 'border-slate-700 bg-slate-800/50'}`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className={`font-bold text-sm leading-tight
                              ${isRip ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                              {team.name}
                            </h4>
                            {isRip && <span className="text-sm">🪦</span>}
                            <StatusPill status={team.status} />
                          </div>
                          <p className="text-[11px] text-amber-500/80 italic mt-0.5 leading-tight">
                            "{team.nickname}"
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`text-sm font-black block px-2 py-0.5 rounded
                            ${isRip ? 'bg-slate-900 text-slate-600' : 'bg-emerald-500/10 text-emerald-400'}`}>
                            {team.points} pts
                          </span>
                          <span className={`text-[10px] font-bold block text-right mt-0.5 ${gdClass(teamGD)}`}>
                            GD {gdLabel(teamGD)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
    </>
  );
}
