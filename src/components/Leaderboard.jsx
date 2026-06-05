import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactCountryFlag from 'react-country-flag';

// ISO 3166-1 alpha-2 codes for SVG flag rendering (works on all platforms)
const COUNTRY_CODES = {
  France: 'FR', Mexico: 'MX', Japan: 'JP', Algeria: 'DZ',
  'Czech Republic': 'CZ', 'Curaçao': 'CW', Morocco: 'MA', Uruguay: 'UY',
  Ecuador: 'EC', Egypt: 'EG', 'DR Congo': 'CD', 'Cape Verde': 'CV',
  Brazil: 'BR', USA: 'US', 'South Korea': 'KR', Panama: 'PA',
  Tunisia: 'TN', 'Saudi Arabia': 'SA', Netherlands: 'NL', Colombia: 'CO',
  Turkey: 'TR', Norway: 'NO', Uzbekistan: 'UZ', Jordan: 'JO',
  Portugal: 'PT', Senegal: 'SN', Austria: 'AT', 'Ivory Coast': 'CI',
  'South Africa': 'ZA', Haiti: 'HT', England: 'GB', Belgium: 'BE',
  Australia: 'AU', Sweden: 'SE', Qatar: 'QA', 'New Zealand': 'NZ',
  Spain: 'ES', Germany: 'DE', Switzerland: 'CH', Paraguay: 'PY',
  Iraq: 'IQ', Ghana: 'GH', Argentina: 'AR', Croatia: 'HR',
  'IR Iran': 'IR', Canada: 'CA', Scotland: 'GB', 'Bosnia & Herzegovina': 'BA',
};

function TeamFlag({ name, size = '2rem' }) {
  const code = COUNTRY_CODES[name];
  if (!code) return <span style={{ fontSize: size }}>🌍</span>;
  return (
    <ReactCountryFlag
      countryCode={code}
      svg
      style={{ width: size, height: size, borderRadius: '4px', objectFit: 'cover' }}
    />
  );
}

const STATUS_CFG = {
  alive:    { label: 'Alive',    pill: 'bg-emerald-500/15 text-emerald-400 border-emerald-600/40' },
  critical: { label: 'Critical', pill: 'bg-amber-500/15   text-amber-400   border-amber-600/40'  },
  rip:      { label: 'RIP',      pill: 'bg-rose-500/15    text-rose-400    border-rose-600/40'    },
};

const FLAG = {
  'France': '🇫🇷',
  'Mexico': '🇲🇽',
  'Japan': '🇯🇵',
  'Algeria': '🇩🇿',
  'Czech Republic': '🇨🇿',
  'Curaçao': '🇨🇼',
  'Morocco': '🇲🇦',
  'Uruguay': '🇺🇾',
  'Ecuador': '🇪🇨',
  'Egypt': '🇪🇬',
  'DR Congo': '🇨🇩',
  'Cape Verde': '🇨🇻',
  'Brazil': '🇧🇷',
  'USA': '🇺🇸',
  'South Korea': '🇰🇷',
  'Panama': '🇵🇦',
  'Tunisia': '🇹🇳',
  'Saudi Arabia': '🇸🇦',
  'Netherlands': '🇳🇱',
  'Colombia': '🇨🇴',
  'Turkey': '🇹🇷',
  'Norway': '🇳🇴',
  'Uzbekistan': '🇺🇿',
  'Jordan': '🇯🇴',
  'Portugal': '🇵🇹',
  'Senegal': '🇸🇳',
  'Austria': '🇦🇹',
  'Ivory Coast': '🇨🇮',
  'South Africa': '🇿🇦',
  'Haiti': '🇭🇹',
  'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Belgium': '🇧🇪',
  'Australia': '🇦🇺',
  'Sweden': '🇸🇪',
  'Qatar': '🇶🇦',
  'New Zealand': '🇳🇿',
  'Spain': '🇪🇸',
  'Germany': '🇩🇪',
  'Switzerland': '🇨🇭',
  'Paraguay': '🇵🇾',
  'Iraq': '🇮🇶',
  'Ghana': '🇬🇭',
  'Argentina': '🇦🇷',
  'Croatia': '🇭🇷',
  'IR Iran': '🇮🇷',
  'Canada': '🇨🇦',
  'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Bosnia & Herzegovina': '🇧🇦',
};

const PLAYER_PROFILES = {
  Omer: {
    signature: 'The Shekel Collector',
    banterStat: { label: 'Countries banned from', value: '13' },
    banterStat2: { label: 'Girlfriends secured', value: '0' },
    threatLevel: 'Diplomatically Radioactive',
    threatIcon: '😤',
    secretWeapon: 'Blames the lazy eye',
    biggestRisk: 'Getting deported again',
  },
  Jiakai: {
    signature: 'Ding Ding Bong',
    banterStat: { label: 'Villages built', value: '10' },
    banterStat2: { label: 'Bank balance', value: '0' },
    threatLevel: 'Vertically Challenged',
    threatIcon: '💸',
    secretWeapon: 'Chronically Friendzoned',
    biggestRisk: 'Centrelink cuts him off',
  },
  James: {
    signature: 'Jimmy! Jimmy! Jimmy! — Local Legend, Wrong Continent ',
    banterStat: { label: 'Exes haunting him', value: '1' },
    banterStat2: { label: 'Countries visited with her', value: '4' },
    threatLevel: 'Genuinely Harmless',
    threatIcon: '💔',
    secretWeapon: 'Morocco (surprisingly)',
    biggestRisk: 'Travel insurance wont cover a single one of his teams',
  },
  Max: {
    signature: 'The SPF-50 Speedo King',
    banterStat: { label: 'Hair follicles remaining', value: '4' },
    banterStat2: { label: 'Forehead size (km²)', value: '2.4' },
    threatLevel: 'Cosmetically Challenged',
    threatIcon: '🦱',
    secretWeapon: 'Aerodynamic Lycra compensates for zero athleticism',
    biggestRisk: 'Still stalking Laura',
  },
  Michael: {
    signature: 'Greece\'s Most Loyal Tourist',
    banterStat: { label: 'Pizza shops remaining', value: '0' },
    banterStat2: { label: 'Countries visited', value: '1' },
    threatLevel: 'Dangerously Disconnected',
    threatIcon: '👻',
    secretWeapon: 'Nobody knows what he does',
    biggestRisk: 'Girlfriend taller than his ambitions',
  },
  Nick: {
    signature: 'The Whipped One',
    banterStat: { label: 'Decisions made alone', value: '0' },
    banterStat2: { label: 'Permission slips needed', value: '∞' },
    threatLevel: 'Domestically Controlled',
    threatIcon: '🐕',
    secretWeapon: 'Always on holiday',
    biggestRisk: 'Girlfriend vetoes his picks',
  },
  Stefan: {
    signature: 'The Autistic Schedule Keeper',
    banterStat: { label: 'Trams caught this week', value: '14' },
    banterStat2: { label: 'Jokes that landed', value: '0' },
    threatLevel: 'Statistically Boring',
    threatIcon: '🚃',
    secretWeapon: 'Has a spreadsheet for everything including this',
    biggestRisk: 'Spends prize money on a rail pass',
  },
  Fabian: {
    signature: 'Stefan\'s Plus One',
    banterStat: { label: 'Personality traits identified', value: '0' },
    banterStat2: { label: 'Times asked "who?"', value: '∞' },
    threatLevel: 'Enigmatically Useless',
    threatIcon: '🕵️',
    secretWeapon: 'Argentina (thanks Messi)',
    biggestRisk: 'Nobody knows his last name',
  },
};

// ── Profile Modal ─────────────────────────────────────────────────────────────
function ProfileModal({ player, rank, total, onClose }) {
  const profile = PLAYER_PROFILES[player.name] ?? {};

  return (
    <div
      className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl
          overflow-y-auto max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <div className="flex justify-end px-5 pt-4">
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-xl leading-none">✕</button>
        </div>

        <div className="px-6 pb-8 pt-2 flex flex-col items-center gap-5">

          {/* Avatar */}
          <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center
            text-4xl font-black uppercase shadow-lg
            ${rank === 1 ? 'border-amber-400 bg-amber-600/25' :
              rank === total ? 'border-rose-500 bg-rose-600/25' :
              'border-slate-500 bg-slate-700'}`}>
            {player.name[0]}
          </div>

          {/* Name + signature */}
          <div className="text-center">
            <h2 className="text-2xl font-black text-white">
              {player.name}
              {rank === 1 && ' 👑'}
              {rank === total && ' 🤡'}
            </h2>
            <p className="text-slate-400 text-sm mt-1 italic">"{profile.signature}"</p>
          </div>

          {/* Banter stats */}
          <div className="grid grid-cols-2 gap-3 w-full">
            {[profile.banterStat, profile.banterStat2].map((stat, i) => stat && (
              <div key={i} className="bg-slate-900/60 rounded-xl p-3 text-center border border-slate-700">
                <p className="text-xl font-black text-emerald-400">{stat.value}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5 leading-tight">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Threat / weapon / risk */}
          <div className="w-full bg-slate-900/40 rounded-xl border border-slate-700 overflow-hidden">
            {[
              { icon: profile.threatIcon ?? '⚠️', label: 'Threat level',   value: profile.threatLevel },
              { icon: '⚔️',                        label: 'Secret weapon',  value: profile.secretWeapon },
              { icon: '💣',                        label: 'Biggest risk',   value: profile.biggestRisk },
            ].map(({ icon, label, value }, i) => (
              <div key={i} className={`flex items-center justify-between px-4 py-3
                ${i < 2 ? 'border-b border-slate-700/50' : ''}`}>
                <span className="text-xs text-slate-400 flex items-center gap-2">
                  <span>{icon}</span>{label}
                </span>
                <span className="text-xs font-bold text-slate-200 text-right ml-3 leading-tight max-w-[55%]">
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Teams grid */}
          <div className="w-full">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-3">Teams</p>
            <div className="grid grid-cols-3 gap-2">
              {player.teams.map((team, i) => (
                <div key={i} className="rounded-xl border border-slate-700 bg-slate-900/60 p-2.5 text-center">
                  <div className="flex justify-center mb-1.5">
                    <TeamFlag name={team.name} size="2rem" />
                  </div>
                  <p className="text-[10px] leading-tight font-semibold text-slate-300">
                    {team.name}
                  </p>
                </div>
              ))}
            </div>
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

function gdLabel(gd) { return gd > 0 ? `+${gd}` : `${gd}`; }
function gdClass(gd) {
  return gd > 0 ? 'text-emerald-500' : gd < 0 ? 'text-rose-500' : 'text-slate-600';
}

export default function Leaderboard({ players }) {
  const [expandedId,   setExpandedId]   = useState(null);
  const [profileEntry, setProfileEntry] = useState(null);
  const [trendMap,     setTrendMap]     = useState({});
  const prevIdsRef    = useRef(null);
  const trendTimerRef = useRef(null);

  const sorted = useMemo(() => [...players].sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    return (b.goalDifference ?? 0) - (a.goalDifference ?? 0);
  }), [players]);

  useEffect(() => {
    const currentIds = sorted.map(p => p.id);
    if (prevIdsRef.current === null) { prevIdsRef.current = currentIds; return; }
    const orderChanged = currentIds.some((id, i) => id !== prevIdsRef.current[i]);
    if (!orderChanged) return;
    const prevRankMap = Object.fromEntries(prevIdsRef.current.map((id, i) => [id, i + 1]));
    const newTrends = {};
    currentIds.forEach((id, i) => {
      const prev = prevRankMap[id] ?? i + 1;
      const delta = prev - (i + 1);
      if (delta !== 0) newTrends[id] = delta;
    });
    setTrendMap(newTrends);
    prevIdsRef.current = currentIds;
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
            const delta      = trendMap[player.id] ?? 0;
            const gd         = player.goalDifference ?? 0;

            let trendLabel = '●';
            let trendCls   = 'text-slate-600';
            if (delta > 0) { trendLabel = `▲ ${delta}`;           trendCls = 'text-emerald-400 font-black animate-pulse'; }
            if (delta < 0) { trendLabel = `▼ ${Math.abs(delta)}`; trendCls = 'text-rose-500 font-black'; }

            return (
              <div
                key={player.id}
                className={`transition-all duration-200 ${isFirst ? 'bg-amber-500/5' : isLast ? 'bg-rose-500/5' : ''}`}
              >
                <div
                  onClick={() => toggle(player.id)}
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-700/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex flex-col items-center w-8 shrink-0">
                      <span className={`text-[10px] leading-none ${trendCls}`}>{trendLabel}</span>
                      <span className={`text-lg font-black leading-tight
                        ${isFirst ? 'text-amber-400' : isLast ? 'text-rose-500' : 'text-slate-400'}`}>
                        #{index + 1}
                      </span>
                    </div>

                    {/* Avatar — opens profile */}
                    <div
                      onClick={e => { e.stopPropagation(); setProfileEntry({ player, rank: index + 1 }); }}
                      className={`w-11 h-11 rounded-full shrink-0 border-2 flex items-center justify-center
                        text-lg font-black uppercase cursor-pointer hover:opacity-80 transition-opacity
                        ${isFirst ? 'border-amber-400 bg-amber-600/25' : isLast ? 'border-rose-500 bg-rose-600/25' : 'border-slate-500 bg-slate-700'}`}>
                      {player.name[0]}
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-bold text-base flex items-center gap-1.5 flex-wrap">
                        {player.name}
                        {isFirst && <span>👑</span>}
                        {isLast  && <span>🤡</span>}
                      </h3>
                      <p className="text-xs text-slate-400 italic leading-snug">"{player.banterQuote}"</p>
                    </div>
                  </div>

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

                {isExpanded && (
                  <div className="bg-slate-900/60 px-4 pb-4 pt-1 border-t border-slate-700/50 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {player.teams.map((team, i) => {
                      const isRip  = team.status === 'rip';
                      const teamGD = team.goalDifference ?? 0;
                      return (
                        <div
                          key={i}
                          className={`p-3 rounded-lg border flex items-center justify-between gap-2
                            ${isRip ? 'border-rose-900/30 bg-rose-950/10 opacity-50' : 'border-slate-700 bg-slate-800/50'}`}
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