"use client";

import { useGameStore } from "@/store/useGameStore";

export function CombatLog() {
  const log = useGameStore((s) => s.combatLog);
  return (
    <div className="game-card p-4">
      <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted">Combat Log</h2>
      <div aria-live="polite" className="no-scrollbar max-h-56 space-y-1 overflow-y-auto text-sm">
        {log.slice(-40).map((line, i) => (
          <div key={i} className="border-b border-[#1c1c2c] py-1 last:border-0">
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}
