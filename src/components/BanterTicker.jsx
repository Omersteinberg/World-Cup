// src/components/BanterTicker.jsx
import React, { useState, useEffect, useRef } from 'react';

const FALLBACK_ITEMS = [
  "🚨 BREAKING: The AI banter machine is warming up. Stand by for personalised roasts.",
  "⚙️ Crunching the match data. Someone's about to get cooked.",
  "📡 Connecting to the banter mainframe. This may take a moment.",
  "🔄 Generating fresh takes. Your suffering will be televised shortly.",
];

const REFRESH_MS = 5 * 60 * 1000; // Regenerate every 5 minutes

async function generateBanter(players, matches) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  // Build leaderboard summary
  const sorted = [...players].sort((a, b) => b.totalPoints - a.totalPoints);
  const leaderboard = sorted.map((p, i) => {
    const teamNames = p.teams.map(t => t.name).join(', ');
    const deadTeams = p.teams.filter(t => t.status === 'rip').length;
    return `#${i + 1} ${p.name} — ${p.totalPoints} pts — Teams: ${teamNames} — ${deadTeams} dead teams`;
  }).join('\n');

  // Build recent results summary
  const finished = matches
    .filter(m => m.status === 'FINISHED')
    .slice(-10)
    .map(m => {
      const h = m.homeTeam?.name ?? '?';
      const a = m.awayTeam?.name ?? '?';
      const hs = m.score?.fullTime?.home ?? '?';
      const as = m.score?.fullTime?.away ?? '?';
      return `${h} ${hs} - ${as} ${a}`;
    }).join('\n');

  const live = matches
    .filter(m => ['IN_PLAY', 'PAUSED', 'HALFTIME'].includes(m.status))
    .map(m => {
      const h  = m.homeTeam?.name ?? '?';
      const a  = m.awayTeam?.name ?? '?';
      const hs = m.score?.fullTime?.home ?? m.score?.halfTime?.home ?? '?';
      const as = m.score?.fullTime?.away ?? m.score?.halfTime?.away ?? '?';
      return `LIVE: ${h} ${hs} - ${as} ${a} (${m.minute ?? '?'}')`;
    }).join('\n');

  const prompt = `You are the official banter AI for a World Cup fantasy syndicate between 8 mates. Your job is to generate savage, funny, personalised roast ticker messages based on the current standings and match results.

Current Leaderboard:
${leaderboard}

${finished ? `Recent Results:\n${finished}` : 'No completed matches yet.'}

${live ? `Live Right Now:\n${live}` : ''}

Generate exactly 8 short, punchy banter ticker messages (one per player if possible). Rules:
- Each must reference a specific player by name and ideally their specific teams
- Be extremely savage — football banter energy
- Reference actual results where possible (if their team won, lost, or is live right now)
- Mix breaking news format, fake market updates, medical bulletins, predictions
- Each message should start with a relevant emoji
- Keep each under 120 characters
- Make them genuinely funny, not generic

Return ONLY a JSON array of strings, no other text. Example format:
["🚨 message one", "📈 message two"]`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) throw new Error(`Anthropic API error: ${response.status}`);

  const data = await response.json();
  const text = data.content?.[0]?.text ?? '';

  // Strip markdown code fences if present
  const clean = text.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(clean);
  if (!Array.isArray(parsed)) throw new Error('Expected array');
  return parsed;
}

export default function BanterTicker({ players = [], matches = [] }) {
  const [items, setItems] = useState(FALLBACK_ITEMS);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  async function refresh() {
    if (!import.meta.env.VITE_ANTHROPIC_API_KEY) return;
    setLoading(true);
    try {
      const banter = await generateBanter(players, matches);
      if (banter && banter.length > 0) setItems(banter);
    } catch (e) {
      console.warn('Banter generation failed:', e);
      // Keep existing items on failure — no jarring fallback
    } finally {
      setLoading(false);
    }
  }

  // Regenerate when match data changes or on a timer
  useEffect(() => {
    if (players.length === 0) return;
    refresh();
    timerRef.current = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(timerRef.current);
  }, [matches.length]); // Re-trigger when number of matches changes (new results in)

  return (
    <div className="relative w-full bg-rose-600 text-white py-2 overflow-hidden border-b border-rose-700 font-bold text-sm uppercase tracking-wide shadow-md">
      {/* Loading pulse overlay */}
      {loading && (
        <div className="absolute inset-0 bg-rose-700/40 flex items-center justify-center z-10 pointer-events-none">
          <span className="text-[10px] tracking-widest animate-pulse">⚡ GENERATING BANTER...</span>
        </div>
      )}

      <div className="flex whitespace-nowrap animate-[marquee_40s_linear_infinite] gap-12">
        {/* Render twice for seamless loop */}
        {[...items, ...items].map((item, idx) => (
          <span key={idx} className="flex items-center gap-2">
            {item}
            <span className="text-rose-400 mx-4">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}