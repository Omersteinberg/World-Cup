import React, { useState, useEffect, useRef } from 'react';
import {
  collection, onSnapshot, addDoc,
  updateDoc, doc, serverTimestamp,
  query, orderBy, arrayUnion, arrayRemove,
} from 'firebase/firestore';
import { db } from '../services/firebase';

const COL = 'worldcup_messages';
const QUICK_REACTIONS = ['👍', '😂', '😭', '🔥', '💀', '🤡', '😤', '🗿'];
const NAME_COLORS    = [
  'text-emerald-400', 'text-sky-400', 'text-amber-400',
  'text-rose-400',    'text-purple-400', 'text-orange-400', 'text-teal-400',
];

const configured = !!(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID
);

function nameColor(name = '') {
  return NAME_COLORS[(name.charCodeAt(0) + name.length) % NAME_COLORS.length];
}

function formatTime(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString([], {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ── Single message row ────────────────────────────────────────────────────────
function Message({ msg, currentUser, onReact }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const reactions = msg.reactions ?? {};
  const hasReactions = Object.values(reactions).some(arr => arr.length > 0);

  return (
    <div className="group flex items-start gap-2 py-1">
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-full bg-slate-700 border border-slate-600 flex items-center
        justify-center text-xs font-black shrink-0 uppercase ${nameColor(msg.name)}`}>
        {msg.name?.[0] ?? '?'}
      </div>

      <div className="flex-1 min-w-0">
        {/* Name + time */}
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className={`text-xs font-bold ${nameColor(msg.name)}`}>{msg.name}</span>
          <span className="text-[10px] text-slate-600">{formatTime(msg.timestamp)}</span>
        </div>

        {/* Bubble + react button */}
        <div className="flex items-end gap-1.5">
          <p className="text-sm text-slate-200 bg-slate-700/60 rounded-2xl rounded-tl-sm
            px-3 py-1.5 break-words max-w-[85%] leading-snug">
            {msg.text}
          </p>

          {/* React button — visible on hover (desktop) or always on touch */}
          {currentUser && (
            <button
              onClick={() => setPickerOpen(p => !p)}
              className="text-slate-600 hover:text-slate-300 text-base transition-colors
              opacity-100 shrink-0 pb-0.5"
              title="React"
            >
              🙂
            </button>
          )}
        </div>

        {/* Emoji picker */}
        {pickerOpen && (
          <div className="flex flex-wrap gap-1 mt-1.5 bg-slate-900/80 border border-slate-700
            rounded-xl p-2 w-fit">
            {QUICK_REACTIONS.map(emoji => (
              <button
                key={emoji}
                onClick={() => { onReact(msg.id, emoji); setPickerOpen(false); }}
                className="text-lg hover:scale-125 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Existing reactions */}
        {hasReactions && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {Object.entries(reactions)
              .filter(([, users]) => users.length > 0)
              .map(([emoji, users]) => {
                const reacted = currentUser && users.includes(currentUser);
                return (
                  <button
                    key={emoji}
                    onClick={() => currentUser && onReact(msg.id, emoji)}
                    className={`flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full
                      border transition-all ${reacted
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                        : 'bg-slate-700/50 border-slate-600/50 text-slate-300 hover:border-slate-400'
                      }`}
                    title={users.join(', ')}
                  >
                    {emoji} <span className="font-semibold">{users.length}</span>
                  </button>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main chat ─────────────────────────────────────────────────────────────────
export default function WatchAlongChat() {
  const [messages, setMessages] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [name,     setName]     = useState(() => localStorage.getItem('daxhub_name') ?? '');
  const [text,     setText]     = useState('');
  const bottomRef               = useRef(null);
  const nameInputRef            = useRef(null);

  // Persist name
  useEffect(() => {
    if (name.trim()) localStorage.setItem('daxhub_name', name.trim());
  }, [name]);

  // Real-time Firestore listener
  useEffect(() => {
    if (!configured) { setLoading(false); return; }
    const q = query(collection(db, COL), orderBy('timestamp', 'asc'));
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, err => {
      console.error('Chat error:', err);
      setLoading(false);
    });
    return unsub;
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send() {
    const n = name.trim();
    const t = text.trim();
    if (!n || !t) {
      if (!n) nameInputRef.current?.focus();
      return;
    }
    setText('');
    await addDoc(collection(db, COL), {
      name: n, text: t,
      timestamp: serverTimestamp(),
      reactions: {},
    });
  }

  async function toggleReaction(msgId, emoji) {
    const n = name.trim();
    if (!n) return;
    const msg = messages.find(m => m.id === msgId);
    const reactors = msg?.reactions?.[emoji] ?? [];
    const alreadyReacted = reactors.includes(n);
    await updateDoc(doc(db, COL, msgId), {
      [`reactions.${emoji}`]: alreadyReacted ? arrayRemove(n) : arrayUnion(n),
    });
  }

  // ── Not configured ──────────────────────────────────────────────────────────
  if (!configured) {
    return (
      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
        <div className="bg-slate-950 p-3 border-b border-slate-700 text-center">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-300">
            📺 Watch-Along Chat
          </h3>
        </div>
        <div className="p-5 text-center text-slate-500 text-sm space-y-1">
          <p>⚙️ Firebase not configured.</p>
          <p className="text-xs">Add your Firebase env vars to enable the live group chat.</p>
        </div>
      </div>
    );
  }

  // ── Main render ─────────────────────────────────────────────────────────────
  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl flex flex-col">
      {/* Header */}
      <div className="bg-slate-950 p-3 border-b border-slate-700 text-center flex items-center justify-center gap-2">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-300">
          📺 Watch-Along Chat
        </h3>
        <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
          LIVE
        </span>
      </div>

      {/* Message list */}
      <div className="h-72 overflow-y-auto p-3 space-y-0.5 bg-slate-900/40">
        {loading && (
          <p className="text-slate-600 text-xs text-center pt-4 animate-pulse">
            Loading chat…
          </p>
        )}
        {!loading && messages.length === 0 && (
          <p className="text-slate-600 text-xs text-center pt-4 italic">
            No messages yet. Be the first to drop a take.
          </p>
        )}
        {messages.map(msg => (
          <Message
            key={msg.id}
            msg={msg}
            currentUser={name.trim() || null}
            onReact={toggleReaction}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="p-3 border-t border-slate-700 flex flex-col gap-2 bg-slate-800">
        {/* Name — pre-filled from localStorage */}
        <input
          ref={nameInputRef}
          type="text"
          placeholder="Your name…"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-1.5 text-xs
            text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
        />
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Drop a take… (Enter to send)"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            className="flex-1 min-w-0 bg-slate-900 border border-slate-600 rounded-lg px-3 py-1.5
              text-xs text-slate-200 placeholder-slate-500 focus:outline-none
              focus:border-emerald-500 transition-colors"
          />
          <button
            onClick={send}
            className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white
              text-xs font-black px-4 py-1.5 rounded-lg transition-colors shrink-0"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
