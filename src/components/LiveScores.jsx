import React from 'react';
import { hasApiKey } from '../services/footballApi';

// Country name → flag emoji
const FLAG = {
  France: '🇫🇷', Germany: '🇩🇪', Spain: '🇪🇸', England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  Portugal: '🇵🇹', Netherlands: '🇳🇱', Argentina: '🇦🇷', Brazil: '🇧🇷',
  Belgium: '🇧🇪', Italy: '🇮🇹', Morocco: '🇲🇦', USA: '🇺🇸',
  Colombia: '🇨🇴', Uruguay: '🇺🇾', Japan: '🇯🇵', 'South Korea': '🇰🇷',
  Canada: '🇨🇦', Ecuador: '🇪🇨', Senegal: '🇸🇳', Croatia: '🇭🇷',
  Denmark: '🇩🇰', Turkey: '🇹🇷', Nigeria: '🇳🇬', Cameroon: '🇨🇲',
  Mexico: '🇲🇽', 'Saudi Arabia': '🇸🇦', Iran: '🇮🇷', Australia: '🇦🇺',
  'Ivory Coast': '🇨🇮', Serbia: '🇷🇸', Ghana: '🇬🇭', Egypt: '🇪🇬',
  Scotland: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', Switzerland: '🇨🇭', Austria: '🇦🇹', Bolivia: '🇧🇴',
  Jamaica: '🇯🇲', 'New Zealand': '🇳🇿', Hungary: '🇭🇺', Panama: '🇵🇦',
  Honduras: '🇭🇳', Iraq: '🇮🇶', 'South Africa': '🇿🇦', Venezuela: '🇻🇪',
  Algeria: '🇩🇿', Paraguay: '🇵🇾', Uzbekistan: '🇺🇿', 'Costa Rica': '🇨🇷',
};

function flag(name) { return FLAG[name] ?? '🏴'; }

function formatKickoff(utcDate) {
  if (!utcDate) return '--:--';
  return new Date(utcDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function StatusBadge({ match }) {
  const { status, minute } = match;

  if (['IN_PLAY', 'PAUSED', 'HALFTIME'].includes(status)) {
    const label = status === 'HALFTIME' ? 'HT' : `${minute ?? '?'}'`;
    return (
      <span className="inline-flex items-center gap-1 bg-emerald-600/30 text-emerald-400 text-[10px] font-black px-1.5 py-0.5 rounded border border-emerald-500/40">
        <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse inline-block" />
        {label}
      </span>
    );
  }
  if (status === 'FINISHED') {
    return (
      <span className="inline-block bg-slate-700 text-slate-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-600">
        FT
      </span>
    );
  }
  // SCHEDULED / TIMED
  return (
    <span className="inline-block text-slate-500 text-[10px] font-medium px-0.5">
      {formatKickoff(match.utcDate)}
    </span>
  );
}

function MatchCard({ match }) {
  const h  = match.homeTeam?.name ?? '?';
  const a  = match.awayTeam?.name ?? '?';
  const hs = match.score?.fullTime?.home;
  const as = match.score?.fullTime?.away;
  const isLive = ['IN_PLAY', 'PAUSED', 'HALFTIME'].includes(match.status);
  const isDone = match.status === 'FINISHED';
  const showScore = isLive || isDone;

  return (
    <div className={`shrink-0 bg-slate-800 rounded-xl border px-4 py-3 min-w-[200px] flex flex-col items-center gap-1.5 shadow
      ${isLive ? 'border-emerald-600/50 shadow-emerald-950/40' : 'border-slate-700'}`}>

      {/* Home */}
      <div className="flex items-center gap-1.5 w-full justify-between">
        <span className="text-sm">{flag(h)}</span>
        <span className={`text-xs font-semibold truncate flex-1 ${isLive ? 'text-white' : 'text-slate-300'}`}>{h}</span>
        <span className={`text-base font-black w-5 text-right ${isLive ? 'text-emerald-400' : isDone ? 'text-slate-200' : 'text-slate-600'}`}>
          {showScore ? hs ?? '-' : ''}
        </span>
      </div>

      {/* Status badge centred */}
      <StatusBadge match={match} />

      {/* Away */}
      <div className="flex items-center gap-1.5 w-full justify-between">
        <span className="text-sm">{flag(a)}</span>
        <span className={`text-xs font-semibold truncate flex-1 ${isLive ? 'text-white' : 'text-slate-300'}`}>{a}</span>
        <span className={`text-base font-black w-5 text-right ${isLive ? 'text-emerald-400' : isDone ? 'text-slate-200' : 'text-slate-600'}`}>
          {showScore ? as ?? '-' : ''}
        </span>
      </div>
    </div>
  );
}

function NoApiKeyState() {
  return (
    <div className="flex items-center gap-3 text-slate-500 text-sm italic px-2">
      <span>⚙️</span>
      <span>
        Add <code className="bg-slate-700 text-slate-300 text-xs px-1 rounded">VITE_FOOTBALL_API_KEY</code>
        {' '}to <code className="bg-slate-700 text-slate-300 text-xs px-1 rounded">.env</code>
        {' '}for live scores — free key at <span className="text-slate-400">football-data.org</span>
      </span>
    </div>
  );
}

export default function LiveScores({ liveMatches, todayMatches, loading, error, lastUpdated }) {
  const hasKey = hasApiKey;

  // Deduplicate: live first, then rest of today's
  const liveIds  = new Set(liveMatches.map(m => m.id));
  const display  = [
    ...liveMatches,
    ...todayMatches.filter(m => !liveIds.has(m.id)),
  ];

  return (
    <div className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-700 bg-slate-900/40">
        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-slate-300 uppercase tracking-wider">⚽ Today's Fixtures</span>
          {liveMatches.length > 0 && (
            <span className="flex items-center gap-1 bg-emerald-900/60 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-700/50">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse inline-block" />
              {liveMatches.length} LIVE
            </span>
          )}
        </div>
        {lastUpdated && (
          <span className="text-[10px] text-slate-600">
            Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      {/* Scrollable match strip */}
      <div className="overflow-x-auto">
        <div className="flex gap-3 p-3">
          {!hasKey && <NoApiKeyState />}

          {hasKey && loading && (
            <p className="text-slate-500 text-sm italic px-2 py-1">Fetching fixtures…</p>
          )}

          {hasKey && error && (
            <p className="text-rose-400 text-sm italic px-2 py-1">
              API error: {error}. Check your API key.
            </p>
          )}

          {hasKey && !loading && !error && display.length === 0 && (
            <p className="text-slate-500 text-sm italic px-2 py-1">
              No World Cup fixtures today — check back on match days.
            </p>
          )}

          {display.map(m => <MatchCard key={m.id} match={m} />)}
        </div>
      </div>
    </div>
  );
}
