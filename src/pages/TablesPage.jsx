import React, { useState, useMemo } from 'react';

// ── Helpers ───────────────────────────────────────────────────────────────────

function groupLabel(raw) {
  // Normalise "GROUP_A" → "Group A", or pass through if already clean
  return raw?.replace('GROUP_', 'Group ') ?? 'Unknown';
}

function buildGroupStandings(matches) {
  // teams: { [groupKey]: { [teamName]: stats } }
  const teams = {};
  // Track all teams per group from all matches (inc. scheduled)
  for (const m of matches) {
    if (m.stage !== 'GROUP_STAGE' || !m.group) continue;
    const g = m.group;
    if (!teams[g]) teams[g] = {};
    const h = m.homeTeam?.name;
    const a = m.awayTeam?.name;
    if (h && !teams[g][h]) teams[g][h] = { played:0, w:0, d:0, l:0, gf:0, ga:0 };
    if (a && !teams[g][a]) teams[g][a] = { played:0, w:0, d:0, l:0, gf:0, ga:0 };

    if (m.status !== 'FINISHED') continue;
    const hs = m.score?.fullTime?.home;
    const as = m.score?.fullTime?.away;
    if (hs == null || as == null) continue;

    teams[g][h].played++; teams[g][a].played++;
    teams[g][h].gf += hs;  teams[g][h].ga += as;
    teams[g][a].gf += as;  teams[g][a].ga += hs;

    if (hs > as)       { teams[g][h].w++; teams[g][a].l++; }
    else if (hs === as){ teams[g][h].d++; teams[g][a].d++; }
    else               { teams[g][a].w++; teams[g][h].l++; }
  }

  // Sort each group by pts → GD → GF
  const sorted = {};
  for (const [g, teamMap] of Object.entries(teams)) {
    sorted[g] = Object.entries(teamMap)
      .map(([name, s]) => ({ name, ...s, pts: s.w * 3 + s.d, gd: s.gf - s.ga }))
      .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
  }
  return sorted;
}

function buildKnockoutRounds(matches) {
  const stages = ['ROUND_OF_32', 'ROUND_OF_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'FINAL'];
  const result = {};
  for (const s of stages) {
    const ms = matches.filter(m => m.stage === s);
    if (ms.length) result[s] = ms;
  }
  return result;
}

const KNOCKOUT_STAGE_LABELS = {
  ROUND_OF_32:    'Round of 32',
  ROUND_OF_16:    'Round of 16',
  QUARTER_FINALS: 'Quarter-Finals',
  SEMI_FINALS:    'Semi-Finals',
  FINAL:          'Final',
};

// Group stage ends ~June 28; knockout starts ~July 1
const KNOCKOUT_STARTS = new Date('2026-07-01T00:00:00Z');

// ── Sub-components ─────────────────────────────────────────────────────────────

function GroupTable({ groupKey, rows }) {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      {/* Group header */}
      <div className="bg-slate-950/60 px-4 py-2 border-b border-slate-700">
        <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400">
          {groupLabel(groupKey)}
        </h3>
      </div>

      <table className="w-full text-xs">
        <thead>
          <tr className="text-slate-500 uppercase tracking-wider border-b border-slate-700/50">
            <th className="px-3 py-2 text-left w-6">#</th>
            <th className="px-3 py-2 text-left">Team</th>
            <th className="px-2 py-2 text-center">P</th>
            <th className="px-2 py-2 text-center">W</th>
            <th className="px-2 py-2 text-center">D</th>
            <th className="px-2 py-2 text-center">L</th>
            <th className="px-2 py-2 text-center">GD</th>
            <th className="px-2 py-2 text-center font-black text-slate-400">Pts</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/30">
          {rows.map((row, i) => {
            const advances = i < 2;
            return (
              <tr
                key={row.name}
                className={`transition-colors ${advances ? 'bg-emerald-950/20' : ''}`}
              >
                <td className="px-3 py-2.5 text-slate-500 font-bold">{i + 1}</td>
                <td className="px-3 py-2.5 font-semibold text-slate-200 flex items-center gap-1.5">
                  {advances && <span className="w-1 h-4 rounded-full bg-emerald-500 inline-block shrink-0" />}
                  {row.name}
                </td>
                <td className="px-2 py-2.5 text-center text-slate-400">{row.played}</td>
                <td className="px-2 py-2.5 text-center text-slate-400">{row.w}</td>
                <td className="px-2 py-2.5 text-center text-slate-400">{row.d}</td>
                <td className="px-2 py-2.5 text-center text-slate-400">{row.l}</td>
                <td className={`px-2 py-2.5 text-center font-semibold
                  ${row.gd > 0 ? 'text-emerald-400' : row.gd < 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                  {row.gd > 0 ? `+${row.gd}` : row.gd}
                </td>
                <td className="px-2 py-2.5 text-center font-black text-white">{row.pts}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function KnockoutMatch({ match }) {
  const h  = match.homeTeam?.name ?? 'TBD';
  const a  = match.awayTeam?.name ?? 'TBD';
  const hs = match.score?.fullTime?.home;
  const as = match.score?.fullTime?.away;
  const done = match.status === 'FINISHED';
  const live = ['IN_PLAY', 'PAUSED', 'HALFTIME'].includes(match.status);

  return (
    <div className={`bg-slate-800 border rounded-xl overflow-hidden text-xs
      ${live ? 'border-emerald-600/60' : 'border-slate-700'}`}>
      {live && (
        <div className="bg-emerald-900/40 text-emerald-400 text-[10px] font-black uppercase
          tracking-widest text-center py-0.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1" />
          Live
        </div>
      )}
      {[{ name: h, score: hs }, { name: a, score: as }].map((side, i) => (
        <div key={i} className={`flex items-center justify-between px-3 py-2
          ${i === 0 ? 'border-b border-slate-700/50' : ''}`}>
          <span className={`font-semibold ${side.name === 'TBD' ? 'text-slate-600 italic' : 'text-slate-200'}`}>
            {side.name}
          </span>
          <span className={`font-black ml-2 ${done || live ? 'text-white' : 'text-slate-600'}`}>
            {(done || live) && side.score != null ? side.score : '–'}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function TablesPage({ matches = [] }) {
  const [tab, setTab] = useState('groups');

  const standings = useMemo(() => buildGroupStandings(matches), [matches]);
  const knockout  = useMemo(() => buildKnockoutRounds(matches),  [matches]);

  const groupKeys = Object.keys(standings).sort();
  const hasGroups = groupKeys.length > 0;
  const knockoutLive = Date.now() >= KNOCKOUT_STARTS.getTime();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
      {/* Header */}
      <header className="text-center">
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text
          bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 leading-tight pb-1">
          TABLES
        </h1>
        <p className="text-slate-400 mt-2 text-sm tracking-wide">
          Live standings updated after every match
        </p>
      </header>

      {/* Tab switcher */}
      <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700 gap-1">
        {[
          { key: 'groups',   label: '🏟️ Group Stage' },
          { key: 'knockout', label: '⚔️ Knockout' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-2 rounded-lg text-sm font-black uppercase tracking-wider transition-colors
              ${tab === key
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-slate-200'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Group tables ── */}
      {tab === 'groups' && (
        <>
          {!hasGroups ? (
            <div className="text-center py-16 text-slate-500 text-sm italic">
              <p className="text-3xl mb-3">🏗️</p>
              <p>Group tables will populate once the tournament kicks off on 12 June.</p>
              <p className="text-xs mt-2 text-slate-600">
                {matches.length === 0
                  ? 'No match data loaded yet — check your API key.'
                  : `${matches.length} matches loaded, none finished yet.`}
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60 inline-block" />
                Top 2 + 8 best third-place teams advance to Round of 32
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {groupKeys.map(g => (
                  <GroupTable key={g} groupKey={g} rows={standings[g]} />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* ── Knockout bracket ── */}
      {tab === 'knockout' && (
        <>
          {!knockoutLive ? (
            <div className="text-center py-16 text-slate-500 text-sm italic">
              <p className="text-3xl mb-3">⚔️</p>
              <p>The knockout bracket unlocks after the group stage ends.</p>
              <p className="text-xs mt-2 text-slate-600">Check back from 1 July 2026.</p>
            </div>
          ) : Object.keys(knockout).length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-sm italic">
              <p>No knockout matches available yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {Object.entries(KNOCKOUT_STAGE_LABELS).map(([stage, label]) => {
                const ms = knockout[stage];
                if (!ms?.length) return null;
                return (
                  <div key={stage}>
                    <h2 className="text-sm font-black uppercase tracking-widest text-amber-400 mb-3">
                      {label}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {ms.map(m => <KnockoutMatch key={m.id} match={m} />)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
