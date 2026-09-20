"use client";

import { useState } from "react";
import { useGameStore } from "@/store/useGameStore";
import { calculateOfflineRewards } from "@/lib/game/offline";
import { claimOfflineAction } from "@/app/actions/offline";

export function OfflineClaim() {
  const lastSeenAt = useGameStore((s) => s.lastSeenAt);
  const level = useGameStore((s) => s.level);
  const activeSkill = useGameStore((s) => s.activeSkill);
  const shard = useGameStore((s) => s.shard);
  const applyRewards = useGameStore((s) => s.applyRewards);
  const pushLog = useGameStore((s) => s.pushLog);
  const [status, setStatus] = useState<string | null>(null);

  const elapsed = lastSeenAt ? Math.max(0, Math.floor((Date.now() - Date.parse(lastSeenAt)) / 1000)) : 0;
  const preview =
    elapsed > 60
      ? calculateOfflineRewards({ level, activeSkill, shardBalance: shard, elapsedSeconds: elapsed })
      : null;

  async function claim() {
    setStatus("Validating with server…");
    try {
      const res = await claimOfflineAction({ elapsedSeconds: elapsed, activeSkill });
      if (!res.ok) {
        setStatus(`Rejected: ${res.error}`);
        pushLog(`Offline claim rejected: ${res.error}`);
        return;
      }
      applyRewards(res.gold, res.xp, activeSkill);
      pushLog(`Claimed offline rewards: +${res.gold} GOLD, +${res.xp} XP (${res.hoursApplied}h)`);
      setStatus(`Claimed +${res.gold} GOLD, +${res.xp} XP`);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Claim failed");
    }
  }

  if (!preview) return null;
  return (
    <div className="game-card border-[#f5c518] p-4">
      <h2 className="text-sm font-bold uppercase tracking-wide">Offline rewards ready</h2>
      <p className="mt-1 text-sm text-muted">
        Away {(elapsed / 3600).toFixed(1)}h • +{preview.gold} GOLD • +{preview.xp} XP
        {preview.capped ? " (capped at 12h)" : ""} {preview.gated ? "• 50% rate (hold SHARD for 100%)" : ""}
      </p>
      <button
        onClick={claim}
        className="mt-3 min-h-[44px] w-full rounded-xl bg-[#f5c518] px-4 py-2 font-bold text-black"
      >
        Claim rewards
      </button>
      {status ? <p className="mt-2 text-sm">{status}</p> : null}
    </div>
  );
}
