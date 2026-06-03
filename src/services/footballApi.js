// src/services/footballApi.js
// Thin wrapper around football-data.org v4 API.
// Requires VITE_FOOTBALL_API_KEY in .env (get a free key at football-data.org).
// Free tier: 10 req/min — we poll at 60s so we're well within limits.

const KEY  = import.meta.env.VITE_FOOTBALL_API_KEY ?? '';
const BASE = 'https://api.football-data.org/v4';

// Map API team names → names used in our playersData
const API_NAME_MAP = {
  'United States':        'USA',
  'United States of America': 'USA',
  'Korea Republic':       'South Korea',
  'Republic of Korea':    'South Korea',
  'IR Iran':              'Iran',
  "Côte d'Ivoire":        'Ivory Coast',
  "Cote d'Ivoire":        'Ivory Coast',
  'Türkiye':              'Turkey',
  'Czech Republic':       'Czechia',
};

export function normalizeTeamName(name = '') {
  return API_NAME_MAP[name] ?? name;
}

function applyNorm(match) {
  return {
    ...match,
    homeTeam: { ...match.homeTeam, name: normalizeTeamName(match.homeTeam?.name ?? '') },
    awayTeam: { ...match.awayTeam, name: normalizeTeamName(match.awayTeam?.name ?? '') },
  };
}

// Fetch ALL World Cup 2026 matches (scheduled + live + finished).
// Returns an empty array if no API key is configured.
export async function fetchWCMatches() {
  if (!KEY) return [];

  const res = await fetch(`${BASE}/competitions/WC/matches`, {
    headers: { 'X-Auth-Token': KEY },
  });

  if (!res.ok) {
    throw new Error(`football-data.org API error: HTTP ${res.status}`);
  }

  const json = await res.json();
  return (json.matches ?? []).map(applyNorm);
}
