import React, { useState, useMemo } from 'react';
import { Routes, Route } from 'react-router-dom';
import { initialPlayers }  from './data/playersData';
import BanterTicker        from './components/BanterTicker';
import Leaderboard         from './components/Leaderboard';
import LiveScores          from './components/LiveScores';
import PotTracker          from './components/PotTracker';
import CivilWarRadar       from './components/CivilWarRadar';
import WallOfShame         from './components/WallOfShame';
import WatchAlongChat      from './components/WatchAlongChat';
import RoastButton         from './components/RoastButton';
import BottomNav           from './components/BottomNav';
import TablesPage          from './pages/TablesPage';
import TippingPage         from './pages/TippingPage';
import { useLiveScores, calcPlayerPoints } from './hooks/useLiveScores';

export default function App() {
  const [basePlayers] = useState(initialPlayers);
  const { liveMatches, todayMatches, matches, loading, error, lastUpdated } = useLiveScores();
  const players = useMemo(() => calcPlayerPoints(basePlayers, matches), [basePlayers, matches]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col pb-16">
      <BanterTicker players={players} matches={matches} />

      <Routes>
        {/* ── Home ── */}
        <Route path="/" element={
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
            <header className="text-center">
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text
                bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 drop-shadow-lg leading-tight pb-1">
                DAXHUB
              </h1>
              <p className="text-slate-400 mt-3 text-sm sm:text-base tracking-wide max-w-xl mx-auto">
                The official dashboard keeping the fellas honest, the friendships fragile, and a guarantee that Jimmy won't be touching the prize pot
              </p>
            </header>

            <LiveScores
              liveMatches={liveMatches}
              todayMatches={todayMatches}
              loading={loading}
              error={error}
              lastUpdated={lastUpdated}
            />

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2">
                <Leaderboard players={players} />
              </div>
              <aside className="flex flex-col gap-6">
                <PotTracker  players={players} />
                <RoastButton players={players} />
                <CivilWarRadar />
                <WallOfShame players={players} loading={loading} />
                <WatchAlongChat />
              </aside>
            </main>

            <footer className="text-center text-xs text-slate-700 pb-2 tracking-widest uppercase">
              Max plays with dildos for fun
            </footer>
          </div>
        } />

        {/* ── Tables ── */}
        <Route path="/tables"  element={<TablesPage  matches={matches} />} />

        {/* ── Tipping ── */}
        <Route path="/tipping" element={<TippingPage matches={matches} />} />
      </Routes>

      <BottomNav />
    </div>
  );
}
