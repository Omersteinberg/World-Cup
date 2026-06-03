import React, { useState, useRef, useEffect } from 'react';

const SEED_MESSAGES = [
  { id: 1, name: 'Dom',   text: "Tell Jiakai that France haven't won anything without Zidane 😂",  time: '20:03' },
  { id: 2, name: 'Ryan',  text: "My keeper just palmed a tap-in into his own net. I'm fine.",      time: '20:07' },
  { id: 3, name: 'Chris', text: "Germany looking structured as always. Zero joy, 3 points.",        time: '20:11' },
  { id: 4, name: 'Liam',  text: "Anyone watching the Argentina game? This is genuinely painful.",   time: '20:15' },
];

const NAME_COLORS = [
  'text-emerald-400',
  'text-sky-400',
  'text-amber-400',
  'text-rose-400',
  'text-purple-400',
  'text-orange-400',
  'text-teal-400',
];

function nameColor(name) {
  return NAME_COLORS[(name.charCodeAt(0) + name.length) % NAME_COLORS.length];
}

function nowHHMM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function WatchAlongChat() {
  const [messages, setMessages] = useState(SEED_MESSAGES);
  const [senderName, setSenderName]   = useState('');
  const [msgText,    setMsgText]      = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function send() {
    const name = senderName.trim();
    const text = msgText.trim();
    if (!name || !text) return;
    setMessages(prev => [...prev, { id: Date.now(), name, text, time: nowHHMM() }]);
    setMsgText('');
  }

  function onKeyDown(e) {
    if (e.key === 'Enter') send();
  }

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl flex flex-col">
      {/* Header */}
      <div className="bg-slate-950 p-3 border-b border-slate-700 text-center">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-300">
          📺 Live Watch-Along
        </h3>
        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
          LIVE
        </span>
      </div>

      {/* Message log — fixed height, scrollable */}
      <div className="h-52 overflow-y-auto p-3 bg-slate-900/60 font-mono text-xs space-y-2">
        {messages.map(msg => (
          <div key={msg.id} className="flex items-start gap-2 leading-relaxed">
            <span className="text-slate-600 shrink-0 pt-px select-none">{msg.time}</span>
            <span className={`font-bold shrink-0 ${nameColor(msg.name)}`}>{msg.name}:</span>
            <span className="text-slate-300 break-words min-w-0">{msg.text}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="p-3 border-t border-slate-700 flex flex-col gap-2 bg-slate-800">
        <input
          type="text"
          placeholder="Your name..."
          value={senderName}
          onChange={e => setSenderName(e.target.value)}
          className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
        />
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Drop a hot take..."
            value={msgText}
            onChange={e => setMsgText(e.target.value)}
            onKeyDown={onKeyDown}
            className="flex-1 min-w-0 bg-slate-900 border border-slate-600 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <button
            onClick={send}
            className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-black px-4 py-1.5 rounded-lg transition-colors shrink-0"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
