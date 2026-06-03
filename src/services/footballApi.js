// src/services/footballApi.js
// All requests go through Vite's dev proxy (/football-api → api.football-data.org/v4).
// The proxy injects the X-Auth-Token header server-side, so the key never hits the browser
// and CORS is completely avoided.

const BASE = '/football-api';

// Check that a key is configured (used for the "no key" empty-state UI)
export const hasApiKey = !!(import.meta.env.VITE_FOOTBALL_API_KEY ?? '').trim();

// Map API team names → names used in our playersData
const API_NAME_MAP = {
  'United States':             'USA',
  'United States of America':  'USA',
  'Korea Republic':            'South Korea',
  'Republic of Korea':         'South Korea',
  'IR Iran':                   'Iran',
  "Côte d'Ivoire":             'Ivory Coast',
  "Cote d'Ivoire":             'Ivory Coast',
  'Türkiye':                   'Turkey',
  'Czech Republic':            'Czechia',
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

// Fetch ALL World Cup 2026 matches via the Vite proxy (no auth header needed in the browser).
export async function fetchWCMatches() {
  if (!hasApiKey) return [];

  const res = await fetch(`${BASE}/competitions/WC/matches`);

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} — ${body || res.statusText}`);
  }

  const json = await res.json();
  return (json.matches ?? []).map(applyNorm);
}
