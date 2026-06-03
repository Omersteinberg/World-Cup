import React, { useState, useMemo } from 'react';
import { initialPlayers }      from './data/playersData';
import BanterTicker             from './components/BanterTicker';
import Leaderboard              from './components/Leaderboard';
import LiveScores               from './components/LiveScores';
import PotTracker               from './components/PotTracker';
import CivilWarRadar            from './components/CivilWarRadar';
import WallOfShame              from './components/WallOfShame';
import WatchAlongChat           from './components/WatchAlongChat';
import { useLiveScores, calcPlayerPoints } from './hooks/useLiveScores';

export default function App() {
  // Base player data (static structure, names, team assignments)
  const [basePlayers] = useState(initialPlayers);

  // Live match feed — polls every 60 s
  const { liveMatches, todayMatches, matches, loading, error, lastUpdated } = useLiveScores();

  // Derive points from completed matches, merge back into player objects
  const players = useMemo(
    () => calcPlayerPoints(basePlayers, matches),
    [basePlayers, matches],
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Global banter ticker — pinned to very top */}
      <BanterTicker />

      {/* Page wrapper */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">

        {/* Hero header */}
        <header className="text-center">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text
            bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 drop-shadow-lg leading-tight pb-1">
            WORLD CUP SYNDICATE
          </h1>
          <p className="text-slate-400 mt-3 text-sm sm:text-base tracking-wide max-w-xl mx-auto">
            The official dashboard keeping the fellas honest, the pot protected, and the friendships fragile.
          </p>
        </header>

        {/* Live scores strip — full width, between header and grid */}
        <LiveScores
          liveMatches={liveMatches}
          todayMatches={todayMatches}
          loading={loading}
          error={error}
          lastUpdated={lastUpdated}
        />

        {/* Main 2-col + sidebar layout */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Leaderboard — spans 2 columns on large screens */}
          <div className="lg:col-span-2">
            <Leaderboard players={players} />
          </div>

          {/* Right sidebar — stacked widgets */}
          <aside className="flex flex-col gap-6">
            <PotTracker    players={players} />
            <CivilWarRadar />
            <WallOfShame   players={players} />
            <WatchAlongChat />
          </aside>
        </main>

        {/* Footer */}
        <footer className="text-center text-xs text-slate-700 pb-2 tracking-widest uppercase">
          World Cup Syndicate Hub — Built on vibes and misplaced confidence
        </footer>
      </div>
    </div>
  );
}
