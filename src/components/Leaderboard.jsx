import React, { useState } from 'react';

const STATUS_CFG = {
  alive:    { label: 'Alive',    pill: 'bg-emerald-500/15 text-emerald-400 border-emerald-600/40' },
  critical: { label: 'Critical', pill: 'bg-amber-500/15   text-amber-400   border-amber-600/40'  },
  rip:      { label: 'RIP',      pill: 'bg-rose-500/15    text-rose-400    border-rose-600/40'    },
};

function StatusPill({ status }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.alive;
  return (
    <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${cfg.pill}`}>
      {cfg.label}
    </span>
  );
}

export default function Leaderboard({ players }) {
  const sorted = [...players].sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    return (b.goalDifference ?? 0) - (a.goalDifference ?? 0); // tiebreaker
  });
  const [expandedId, setExpandedId] = useState(null);

  const toggle = id => setExpandedId(prev => (prev === id ? null : id));

  return (
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

          // Trend arrow based on rank numbers in data
          const delta = player.previousRank - player.currentRank;
          let trendLabel = '●';
          let trendCls   = 'text-slate-600';
          if (delta > 0) { trendLabel = `▲ ${delta}`;          trendCls = 'text-emerald-400 font-black animate-pulse'; }
          if (delta < 0) { trendLabel = `▼ ${Math.abs(delta)}`; trendCls = 'text-rose-500 font-black'; }

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

                  {/* Avatar circle */}
                  <div className={`w-11 h-11 rounded-full shrink-0 border-2 flex items-center justify-center text-lg font-black uppercase
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
                    <p className="text-xs text-slate-400 italic truncate">"{player.banterQuote}"</p>
                  </div>
                </div>

                {/* Points + GD + chevron */}
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <div className="text-right">
                    <span className="text-2xl font-black text-emerald-400">{player.totalPoints}</span>
                    <span className="text-[10px] text-slate-500 block uppercase tracking-tight">pts</span>
                    {(() => {
                      const gd = player.goalDifference ?? 0;
                      const gdStr = gd > 0 ? `+${gd}` : `${gd}`;
                      const gdCls = gd > 0 ? 'text-emerald-500' : gd < 0 ? 'text-rose-500' : 'text-slate-600';
                      return (
                        <span className={`text-[10px] font-bold block ${gdCls}`}>
                          GD {gdStr}
                        </span>
                      );
                    })()}
                  </div>
                  <span className="text-slate-600 text-xs">{isExpanded ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Expandable team grid */}
              {isExpanded && (
                <div className="bg-slate-900/60 px-4 pb-4 pt-1 border-t border-slate-700/50 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {player.teams.map((team, i) => {
                    const isRip = team.status === 'rip';
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
                          {(() => {
                            const gd = team.goalDifference ?? 0;
                            const gdStr = gd > 0 ? `+${gd}` : `${gd}`;
                            const gdCls = gd > 0 ? 'text-emerald-500' : gd < 0 ? 'text-rose-500' : 'text-slate-600';
                            return (
                              <span className={`text-[10px] font-bold block text-right mt-0.5 ${gdCls}`}>
                                GD {gdStr}
                              </span>
                            );
                          })()}
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
  );
}
