import React, { useState } from 'react';

const PLAYERS = ['Omer', 'Jiakai', 'James', 'Max', 'Michael', 'Nick', 'Stefan', 'Fabian'];

// Personal intel — baked into every roast prompt
const PLAYER_BIOS = {
  Omer: `Jewish — Jewish-themed roasts are welcome. Massive ego, always thinks he is right. Can't get a girlfriend. Has a lazy eye that makes him look like the Hunchback of Notre Dame. Good at football but thinks he's better than everyone. Can't enter certain countries. Puns around shekels, kippah and circumcision are welcome.`,

  Jiakai: `4'11" — grass tickles his genitals. Looks like every Asian race so nobody can tell if he's Korean or Chinese. Super broke, relies on Centrelink like the aboriginals. Has worked at McDonald's for 10 years. Is 25 but has the body of a 60-year-old with constant back problems. Can't talk to women and gets immediately friend-zoned. Has a crazy tennis serve though.`,

  James: `Travelled Europe with his ex including Morocco, Spain, Italy and France. Looks like a classic Australian. Started playing tennis with the boys and is absolutely awful. Supports Western Bulldogs in AFL. His World Cup teams are the least likely to win him any money.`,

  Max: `Worst hairline of all time — urgently needs a hair transplant. Biggest forehead ever seen, comparable to Gervinho, visible from outer space. Zero arm strength, flattest chest on earth. Misses a girl called Amy badly and still stalks her cousin Laura. His mum enjoys spending time with Roy and James. His sister looks like the female version of him — basically looks like a man. German, planning to move there forever. Wears speedos. No footballing ability whatsoever.`,

  Michael: `His pizza shop burned down. Greek, always travels to Greece but nowhere else. Looks like he's had a BBL. Nobody knows what he does or if he's even alive — completely disconnected. His girlfriend is taller than him. Baptised Jiakai and converted him to a ladyboy.`,

  Nick: `Completely whipped by his girlfriend — she makes every decision. Super hairy like a gorilla. Always tired. Greek but doesn't act like one, just has the same needs. Works a boring job, always on holidays. Looks like he'll have the most boring life of the group. Plays Sunday league with Omer and Max but is the only one who isn't captain.`,

  Stefan: `Extremely boring — his jokes always land flat. Likes to hit people, especially his girlfriend (the boys joke he's a wife-beater). Obsessed with trains, trams and public transport. Autistic. Serbian-Bosnian background.`,

  Fabian: `Only Stefan knows him. Zero sense of humour (he's German). Went to Bali with Omer, Max and Stefan. Nobody really knows him — he's just there to make the prize pot bigger.`,
};

export default function RoastButton({ players = [] }) {
  const [open,    setOpen]    = useState(false);
  const [target,  setTarget]  = useState('');
  const [roast,   setRoast]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  function close() { setOpen(false); setRoast(''); setTarget(''); setError(''); }

  async function generate() {
    if (!target || loading) return;
    setLoading(true);
    setRoast('');
    setError('');

    const sorted    = [...players].sort((a, b) => b.totalPoints - a.totalPoints);
    const rank      = sorted.findIndex(p => p.name === target) + 1;
    const player    = players.find(p => p.name === target);
    const teamLines = player?.teams
      .map(t => `${t.name} (${t.status}, ${t.points} pts)`)
      .join(', ') ?? 'unknown teams';
    const bio = PLAYER_BIOS[target] ?? 'Just another bloke in the syndicate.';

    const prompt = `You are the savage banter AI for DaxHub — a World Cup fantasy syndicate between 8 Australian mates. Generate one brutal, hyper-personalised roast about ${target}.

Personal intel on ${target}:
${bio}

World Cup syndicate context:
- Current rank: #${rank} of 8
- Total points: ${player?.totalPoints ?? 0}
- Their teams: ${teamLines}
- Their syndicate quote: "${player?.banterQuote ?? ''}"

Rules:
- Be EXTREMELY savage and brutal — this is lads' banter, nothing is off limits
- Reference their personal information above specifically (not just generic insults)
- Reference their actual World Cup teams and current standing
- Make it genuinely funny and punchy, not generic
- Under 50 words — one brutal punchy sentence or two. 
- No intro text, no "Here's a roast:", just launch straight into it`;

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY ?? '',
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? `HTTP ${res.status}`);
      setRoast(data.content?.[0]?.text?.trim() ?? 'Nothing came out. Even the AI felt sorry for them.');
    } catch (e) {
      setError(`Failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full bg-rose-600/15 hover:bg-rose-600/25 border border-rose-700/40
          text-rose-400 font-black text-sm uppercase tracking-wider py-3 rounded-2xl
          transition-colors flex items-center justify-center gap-2"
      >
        🔥 Roast Someone
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/75 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={close}
        >
          <div
            className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl
              animate-[slideUp_0.25s_ease-out]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-700">
              <h2 className="text-lg font-black text-rose-400 uppercase tracking-wider">🔥 Roast Machine</h2>
              <button onClick={close} className="text-slate-500 hover:text-slate-300 text-xl leading-none">✕</button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              <select
                value={target}
                onChange={e => { setTarget(e.target.value); setRoast(''); setError(''); }}
                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3
                  text-slate-200 text-sm focus:outline-none focus:border-rose-500 transition-colors"
              >
                <option value="">Select your victim…</option>
                {PLAYERS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>

              <button
                onClick={generate}
                disabled={!target || loading}
                className="w-full bg-rose-600 hover:bg-rose-500 disabled:bg-slate-700
                  disabled:text-slate-500 text-white font-black py-3 rounded-xl transition-colors
                  uppercase tracking-wider text-sm"
              >
                {loading ? '🔥 Cooking…' : '🔥 Cook Them'}
              </button>

              {error && <p className="text-rose-400 text-xs text-center">{error}</p>}

              {roast && (
                <div className="bg-slate-900/80 border border-rose-900/50 rounded-xl p-4 space-y-2">
                  <span className="text-rose-400 font-black text-xs uppercase tracking-widest">
                    🎯 {target} has been cooked:
                  </span>
                  <p className="text-slate-200 text-sm leading-relaxed italic">"{roast}"</p>
                  <button
                    onClick={generate}
                    disabled={loading}
                    className="text-[10px] text-slate-500 hover:text-slate-400 uppercase tracking-widest"
                  >
                    ↻ Another one
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
