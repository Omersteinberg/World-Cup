// src/components/BanterTicker.jsx
import React from 'react';

const ticketItems = [
  "🚨 BREAKING: Sam’s teams have combined for 0 goals in 270 minutes. Truly historic uselessness.",
  "⚠️ FRAUD RADAR: Alex is reportedly checking if he can swap his bottom 3 teams for a case of beer.",
  "📈 MARKET UPDATE: Dom's stocks are soaring, local bookies refusing to take further bets.",
  "💸 POT ALARM: Matt's entry fee has allegedly been spent on premium vape juice instead of the pot.",
  "🔮 PREDICTION: Ryan’s anchor team is looking incredibly primed for a group-stage exit.",
  "🚑 MEDICAL UPDATE: Liam’s remaining teams are currently on life support.",
];

export default function BanterTicker() {
  return (
    <div className="w-full bg-rose-600 text-white py-2 overflow-hidden border-b border-rose-700 font-bold text-sm uppercase tracking-wide shadow-md">
      <div className="flex whitespace-nowrap animate-[marquee_25s_linear_infinite] gap-12">
        {/* Render twice to ensure seamless continuous scrolling */}
        {[...ticketItems, ...ticketItems].map((item, idx) => (
          <span key={idx} className="flex items-center gap-2">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}