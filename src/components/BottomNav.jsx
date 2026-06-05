import React from 'react';
import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/',        label: 'Home',    icon: '⚽', end: true  },
  { to: '/tables',  label: 'Tables',  icon: '🏆', end: false },
  { to: '/tipping', label: 'Tipping', icon: '🎯', end: false },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-700 flex">
      {TABS.map(({ to, label, icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-xs font-bold
             uppercase tracking-widest transition-colors
             ${isActive ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`
          }
        >
          <span className="text-xl">{icon}</span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
