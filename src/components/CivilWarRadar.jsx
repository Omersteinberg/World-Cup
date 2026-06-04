// src/components/CivilWarRadar.jsx
// All kickoff times are in AEST (Australia/Melbourne, UTC+10, no daylight saving in June)

import React, { useState, useEffect } from 'react';

function aestToUTC(aestDateStr) {
  return new Date(aestDateStr + '+10:00');
}

function formatAEST(aestDateStr) {
  return new Date(aestDateStr + '+10:00').toLocaleString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Australia/Melbourne',
  });
}

const CIVIL_WARS = [
  // ── ROUND 1 ──────────────────────────────────────────────────────────────
  {
    kickoffAEST: '2026-06-12T05:00:00',
    label: 'Group A · Round 1',
    note: "Two crime capitals collide. The real robbery happens off the pitch.",
    teamA: { player: 'Jiakai', initial: 'J', nation: 'Mexico',       color: 'green'  },
    teamB: { player: 'Nick',   initial: 'N', nation: 'South Africa', color: 'yellow' },
  },
  {
    kickoffAEST: '2026-06-13T11:00:00',
    label: 'Group D · Round 1',
    note: "Max vs Stefan. You wouldn't want to hang out with either one",
    teamA: { player: 'Max',    initial: 'M', nation: 'USA',      color: 'blue' },
    teamB: { player: 'Stefan', initial: 'S', nation: 'Paraguay', color: 'red'  },
  },
  {
    kickoffAEST: '2026-06-14T08:00:00',
    label: 'Group C · Round 1',
    note: "Max's favela boys vs James's Desert men. Someone is getting eliminated early.",
    teamA: { player: 'Max',   initial: 'M', nation: 'Brazil',  color: 'yellow' },
    teamB: { player: 'James', initial: 'J', nation: 'Morocco', color: 'red'    },
  },
  {
    kickoffAEST: '2026-06-15T06:00:00',
    label: 'Group F · Round 1',
    note: "Michael's Dutch machine vs Jiakai's anime-fuelled hentai lovers.",
    teamA: { player: 'Michael', initial: 'M', nation: 'Netherlands', color: 'orange' },
    teamB: { player: 'Jiakai',  initial: 'J', nation: 'Japan',       color: 'blue'   },
  },
  {
    kickoffAEST: '2026-06-16T08:00:00',
    label: 'Group H · Round 1',
    note: "Max's oil money vs James's biters. Someone's getting a nibble taken out of them.",
    teamA: { player: 'Max',   initial: 'M', nation: 'Saudi Arabia', color: 'green' },
    teamB: { player: 'James', initial: 'J', nation: 'Uruguay',      color: 'blue'  },
  },
  {
    kickoffAEST: '2026-06-17T05:00:00',
    label: 'Group I · Round 1',
    note: "Mbappé dictatorship vs Nick's ooga boogas",
    teamA: { player: 'Jiakai', initial: 'J', nation: 'France',  color: 'blue'  },
    teamB: { player: 'Nick',   initial: 'N', nation: 'Senegal', color: 'green' },
  },
  {
    kickoffAEST: '2026-06-18T06:00:00',
    label: 'Group L · Round 1',
    note: "Omer's deluded Three Lions vs Fabian's Modric farewell tour pt.4.",
    teamA: { player: 'Omer',   initial: 'O', nation: 'England', color: 'red'  },
    teamB: { player: 'Fabian', initial: 'F', nation: 'Croatia', color: 'blue' },
  },

  // ── ROUND 2 ──────────────────────────────────────────────────────────────
  {
    kickoffAEST: '2026-06-19T05:00:00',
    label: 'Group B · Round 2',
    note: "Stefan's Swiss precision vs Fabian's Balkan chaos. The trains will not be on time.",
    teamA: { player: 'Stefan', initial: 'S', nation: 'Switzerland',          color: 'red'  },
    teamB: { player: 'Fabian', initial: 'F', nation: 'Bosnia & Herzegovina',  color: 'blue' },
  },
  {
    kickoffAEST: '2026-06-20T05:00:00',
    label: 'Group D · Round 2',
    note: "Max's kid shooters vs Ye nah ye nah",
    teamA: { player: 'Max',  initial: 'M', nation: 'USA',       color: 'blue'  },
    teamB: { player: 'Omer', initial: 'O', nation: 'Australia', color: 'green' },
  },
  {
    kickoffAEST: '2026-06-21T06:00:00',
    label: 'Group E · Round 2',
    note: "The humourless nation vs Fifa14 sweaty front 3",
    teamA: { player: 'Stefan', initial: 'S', nation: 'Germany', color: 'red' },
    teamB: { player: 'Nick',    initial: 'N', nation: 'Ivory Coast', color: 'white' },
  },
  {
    kickoffAEST: '2026-06-22T05:00:00',
    label: 'Group G · Round 2',
    note: "Omer can't enter either of these countries. Peak irony.",
    teamA: { player: 'Omer',   initial: 'O', nation: 'Belgium', color: 'red'   },
    teamB: { player: 'Fabian', initial: 'F', nation: 'IR Iran',  color: 'green' },
  },
  {
    kickoffAEST: '2026-06-23T03:00:00',
    label: 'Group J · Round 2',
    note: "Fabian's world champions vs Nick's Austrian understudies. Messi wakes up for this one.",
    teamA: { player: 'Fabian', initial: 'F', nation: 'Argentina', color: 'blue' },
    teamB: { player: 'Nick',   initial: 'N', nation: 'Austria',   color: 'red'  },
  },
  {
    kickoffAEST: '2026-06-25T12:00:00',
    label: 'Group K · Round 2',
    note: "Michael's South Americans vs James's crime-ridden DR Congo. Interpol is watching.",
    teamA: { player: 'Michael', initial: 'M', nation: 'Colombia', color: 'yellow' },
    teamB: { player: 'James',   initial: 'J', nation: 'DR Congo',  color: 'blue'  },
  },

  // ── ROUND 3 ──────────────────────────────────────────────────────────────
  {
    kickoffAEST: '2026-06-25T05:00:00',
    label: 'Group B · Round 3',
    note: "They were exchange student friends, both wish they could exchange their gender",
    teamA: { player: 'Stefan', initial: 'S', nation: 'Switzerland', color: 'red'  },
    teamB: { player: 'Fabian', initial: 'F', nation: 'Canada',  color: 'red' },
  },
  {
    kickoffAEST: '2026-06-25T08:00:00',
    label: 'Group C · Round 3',
    note: "Fabian's Braveheart boys vs Max's SPF-50 favela machine",
    teamA: { player: 'Fabian', initial: 'F', nation: 'Scotland', color: 'blue'   },
    teamB: { player: 'Max',    initial: 'M', nation: 'Brazil',   color: 'yellow' },
  },
  {
    kickoffAEST: '2026-06-26T12:00:00',
    label: 'Group D · Round 3',
    note: "One is supporting Australia, the other Paraguay. You know who is which ",
    teamA: { player: 'Stefan', initial: 'S', nation: 'Paraguay',  color: 'red'   },
    teamB: { player: 'Omer',   initial: 'O', nation: 'Australia', color: 'green' },
  },
  {
    kickoffAEST: '2026-06-27T05:00:00',
    label: 'Group I · Round 3',
    note: "Michael's Norse warriors vs Jiakai's cheat code",
    teamA: { player: 'Michael', initial: 'M', nation: 'Norway', color: 'red'  },
    teamB: { player: 'Jiakai',  initial: 'J', nation: 'France', color: 'blue' },
  },
  {
    kickoffAEST: '2026-06-27T10:00:00',
    label: 'Group H · Round 3',
    note: "Stefan vs Jimmy, one is getting whipped the other wishes he was.",
    teamA: { player: 'Stefan', initial: 'S', nation: 'Spain',   color: 'red'  },
    teamB: { player: 'James',  initial: 'J', nation: 'Uruguay', color: 'blue' },
  },
  {
    kickoffAEST: '2026-06-28T09:30:00',
    label: 'Group K · Round 3',
    note: "Ronaldo vs Pablo. Michael vs Nick. The greek vs the dick",
    teamA: { player: 'Michael', initial: 'M', nation: 'Colombia', color: 'yellow' },
    teamB: { player: 'Nick',    initial: 'N', nation: 'Portugal', color: 'red'    },
  },
];

const colorMap = {
  green:  { ring: 'border-green-400',  bg: 'bg-green-950/40',  text: 'text-green-400',  avatar: 'bg-green-600/30'  },
  yellow: { ring: 'border-yellow-400', bg: 'bg-yellow-950/40', text: 'text-yellow-400', avatar: 'bg-yellow-600/30' },
  blue:   { ring: 'border-blue-400',   bg: 'bg-blue-950/40',   text: 'text-blue-400',   avatar: 'bg-blue-600/30'   },
  red:    { ring: 'border-red-400',    bg: 'bg-red-950/40',    text: 'text-red-400',    avatar: 'bg-red-600/30'    },
  orange: { ring: 'border-orange-400', bg: 'bg-orange-950/40', text: 'text-orange-400', avatar: 'bg-orange-600/30' },
};

function getCurrentMatchup() {
  const now = new Date();
  const twoHours = 2 * 60 * 60 * 1000;

  const live = CIVIL_WARS.find(m => {
    const kickoff = aestToUTC(m.kickoffAEST);
    const end = new Date(kickoff.getTime() + twoHours);
    return now >= kickoff && now <= end;
  });
  if (live) return { matchup: live, isLive: true, isOver: false };

  const upcoming = CIVIL_WARS.find(m => now < aestToUTC(m.kickoffAEST));
  if (upcoming) return { matchup: upcoming, isLive: false, isOver: false };

  return { matchup: CIVIL_WARS[CIVIL_WARS.length - 1], isLive: false, isOver: true };
}

function TeamCard({ side }) {
  const c = colorMap[side.color] ?? colorMap.blue;
  return (
    <div className={`flex-1 ${c.bg} rounded-xl p-3 border ${c.ring}/40 text-center`}>
      <div className={`w-10 h-10 rounded-full ${c.avatar} border-2 ${c.ring} flex items-center justify-center text-lg font-black mx-auto mb-2`}>
        {side.initial}
      </div>
      <p className={`font-black text-sm ${c.text}`}>{side.player}</p>
      <p className="text-xs text-slate-400">{side.nation}</p>
    </div>
  );
}

export default function CivilWarRadar() {
  const [state, setState] = useState(() => getCurrentMatchup());

  useEffect(() => {
    const id = setInterval(() => setState(getCurrentMatchup()), 60_000);
    return () => clearInterval(id);
  }, []);

  const { matchup, isLive, isOver } = state;

  return (
    <div className="bg-slate-800 rounded-2xl border border-orange-900/50 overflow-hidden shadow-xl">
      <div className="bg-orange-950/60 p-3 text-center border-b border-orange-800/40">
        <h3 className="text-sm font-black uppercase tracking-widest text-orange-400">
          ⚔️ Civil War Radar
        </h3>
      </div>

      <div className="p-5">
        <div className="text-center mb-4">
          {isLive ? (
            <span className="bg-red-900/70 text-red-300 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border border-red-700/50 animate-pulse">
              🔴 LIVE — FRIENDSHIP TERMINATOR
            </span>
          ) : isOver ? (
            <span className="bg-slate-700 text-slate-400 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border border-slate-600">
              GROUP STAGE COMPLETE
            </span>
          ) : (
            <span className="bg-orange-900/70 text-orange-300 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border border-orange-700/50">
              NEXT CIVIL WAR
            </span>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 italic mb-4">
          {matchup.note}
        </p>

        <div className="flex items-center gap-3">
          <TeamCard side={matchup.teamA} />
          <div className="flex flex-col items-center gap-1 shrink-0">
            <span className="text-2xl">⚡</span>
            <span className="text-xs font-black text-orange-400 uppercase tracking-widest">VS</span>
          </div>
          <TeamCard side={matchup.teamB} />
        </div>

        <div className="mt-4 bg-slate-900/60 rounded-xl p-3 border border-slate-700/50 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider">{matchup.label}</p>
          <p className="text-xs text-slate-400 mt-1">
            🕐 {formatAEST(matchup.kickoffAEST)} AEST
          </p>
        </div>
      </div>
    </div>
  );
}