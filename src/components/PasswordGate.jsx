import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'daxhub_auth';
const PASSWORD    = import.meta.env.VITE_APP_PASSWORD ?? '';

export default function PasswordGate({ children }) {
  const [unlocked, setUnlocked] = useState(false);
  const [input,    setInput]    = useState('');
  const [shake,    setShake]    = useState(false);

  // Check localStorage on first render
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === 'true') setUnlocked(true);
  }, []);

  // If no password is configured, just show the app
  if (!PASSWORD) return children;
  if (unlocked)  return children;

  function attempt() {
    if (input === PASSWORD) {
      localStorage.setItem(STORAGE_KEY, 'true');
      setUnlocked(true);
    } else {
      setShake(true);
      setInput('');
      setTimeout(() => setShake(false), 600);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className={`bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-sm shadow-2xl text-center
        ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>

        {/* Logo / icon */}
        <div className="text-5xl mb-4">🔒</div>

        <h1 className="text-2xl font-black text-white tracking-tight mb-1">DaxHub</h1>
        <p className="text-slate-400 text-sm mb-6">Members only. Enter the password to continue.</p>

        <input
          type="password"
          placeholder="Password"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && attempt()}
          autoFocus
          className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white
            placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors mb-3"
        />

        <button
          onClick={attempt}
          className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700
            text-white font-black py-3 rounded-xl transition-colors text-sm uppercase tracking-wider"
        >
          Enter
        </button>
      </div>
    </div>
  );
}
