"use client";

import { useEffect } from "react";
import { useGameStore } from "@/store/useGameStore";
import { useGameLoop } from "@/lib/incremental/hooks";
import { ECONOMY } from "@/config/economy";

/** Active-play tick: small gold/xp drip via rAF loop, batched in Zustand. */
export function useActiveTick(active = true) {
  const applyRewards = useGameStore((s) => s.applyRewards);
  const activeSkill = useGameStore((s) => s.activeSkill);
  const shard = useGameStore((s) => s.shard);
  const level = useGameStore((s) => s.level);
  const pushLog = useGameStore((s) => s.pushLog);

  useGameLoop(
    () => {
      const gated = shard < ECONOMY.SHARD_HOLD_THRESHOLD;
      const mult = gated ? ECONOMY.FREE_PLAY_MULTIPLIER : 1;
      const gold = ((ECONOMY.BASE_GOLD_PER_HOUR / 3600) * 5 * mult * (1 + Math.min(level * 0.02, 1))) / 1;
      const xp = (ECONOMY.BASE_XP_PER_HOUR / 3600) * 5 * (1 + Math.min(level * 0.02, 1));
      applyRewards(gold, xp, activeSkill);
    },
    5000,
    active,
  );

  useEffect(() => {
    pushLog(`Training ${activeSkill}…`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSkill]);
}
