"use client";

import { useGameStore } from "@/store/useGameStore";
import { pvpAttackAction } from "@/app/actions/pvp";
import { useState } from "react";

export function PvpPanel() {
  const pushLog = useGameStore((s) => s.pushLog);
  const [status, setStatus] = useState<string | null>(null);

  async function duel(channel: "arena" | "contested" | "bounty") {
    setStatus("Resolving on server…");
    const res = await pvpAttackAction({ defenderId: "demo-defender", channel });
    if (!res.ok) {
      setStatus(res.error);
      return;
    }
    pushLog(`PvP ${channel}: ${res.log[0] ?? "resolved"} — winner ${res.winnerId.slice(0, 6)}`);
    setStatus(`Winner ${res.winnerId.slice(0, 8)} • stolen ${res.goldStolen} GOLD • ${res.rounds} rounds`);
  }

  return (
    <div className="game-card space-y-2 p-4">
      <h2 className="text-sm font-bold uppercase tracking-wide text-muted">PvP channels</h2>
      {(
        [
          ["arena", "Arena Duel — mutual consent, spar or stakes, 0 notoriety"],
          ["contested", "Contested Zone — entering = consent, gold steal, high notoriety"],
          ["bounty", "Bounty Hunt — steal % of pocket gold"],
        ] as const
      ).map(([id, label]) => (
        <button
          key={id}
          onClick={() => duel(id)}
          className="min-h-[44px] w-full rounded-xl bg-[#1e1e30] px-4 py-2 text-left text-sm font-semibold hover:bg-[#26263a]"
        >
          {label}
        </button>
      ))}
      {status ? <p className="text-sm">{status}</p> : null}
    </div>
  );
}
