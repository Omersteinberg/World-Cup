import React from 'react';

const MATCHUPS = [
  {
    label: 'Group Stage · Matchday 2',
    note: "One goal decides who stops speaking to who for a month.",
    teamA: { player: 'Dom', initial: 'D', nation: 'Argentina', nickname: "Messi's Orthopedic Boots", color: 'sky' },
    teamB: { player: 'Jiakai', initial: 'J', nation: 'France', nickname: "Mbappé's Golden Handcuffs", color: 'blue' },
  },
  {
    label: 'Quarterfinals · Projected',
    note: "The group chat has gone dangerously quiet.",
    teamA: { player: 'Ryan', initial: 'R', nation: 'Portugal', nickname: "Ronaldo's Infinite Egos", color: 'red' },
    teamB: { player: 'Chris', initial: 'C', nation: 'Germany', nickname: 'Strictly Business FC', color: 'slate' },
  },
];

const colorMap = {
  sky:   { ring: 'border-sky-400',   bg: 'bg-sky-950/40',   text: 'text-sky-400',   avatar: 'bg-sky-600/30' },
  blue:  { ring: 'border-blue-400',  bg: 'bg-blue-950/40',  text: 'text-blue-400',  avatar: 'bg-blue-600/30' },
  red:   { ring: 'border-red-400',   bg: 'bg-red-950/40',   text: 'text-red-400',   avatar: 'bg-red-600/30' },
  slate: { ring: 'border-slate-400', bg: 'bg-slate-700/40', text: 'text-slate-300', avatar: 'bg-slate-600/30' },
};

function TeamCard({ side }) {
  const c = colorMap[side.color];
  return (
    <div className={`flex-1 ${c.bg} rounded-xl p-3 border ${c.ring}/40 text-center`}>
      <div className={`w-10 h-10 rounded-full ${c.avatar} border-2 ${c.ring} flex items-center justify-center text-lg font-black mx-auto mb-2`}>
        {side.initial}
      </div>
      <p className={`font-black text-sm ${c.text}`}>{side.player}</p>
      <p className="text-xs text-slate-400">{side.nation}</p>
      <p className="text-xs text-slate-500 italic mt-1 leading-tight">"{side.nickname}"</p>
    </div>
  );
}

export default function CivilWarRadar() {
  const matchup = MATCHUPS[0];

  return (
    <div className="bg-slate-800 rounded-2xl border border-orange-900/50 overflow-hidden shadow-xl">
      <div className="bg-orange-950/60 p-3 text-center border-b border-orange-800/40">
        <h3 className="text-sm font-black uppercase tracking-widest text-orange-400">
          ⚔️ Civil War Radar
        </h3>
      </div>

      <div className="p-5">
        <div className="text-center mb-4">
          <span className="bg-red-900/70 text-red-300 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border border-red-700/50 animate-pulse">
            FRIENDSHIP TERMINATOR
          </span>
        </div>

        <p className="text-center text-xs text-slate-400 italic mb-4">
          Two of the boys own opposing sides in this fixture. Someone's losing more than points.
        </p>

        {/* Matchup card */}
        <div className="flex items-center gap-3">
          <TeamCard side={matchup.teamA} />

          <div className="flex flex-col items-center gap-1 shrink-0">
            <span className="text-2xl">⚡</span>
            <span className="text-xs font-black text-orange-400 uppercase tracking-widest">VS</span>
          </div>

          <TeamCard side={matchup.teamB} />
        </div>

        {/* Stakes footer */}
        <div className="mt-4 bg-slate-900/60 rounded-xl p-3 border border-slate-700/50 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider">{matchup.label}</p>
          <p className="text-xs text-slate-400 italic mt-1">{matchup.note}</p>
        </div>
      </div>
    </div>
  );
}
