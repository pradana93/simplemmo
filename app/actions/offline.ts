"use server";

import { z } from "@/lib/validation/zod-shim";
import { calculateOfflineRewards, isClaimPlausible } from "@/lib/game/offline";
import { ECONOMY } from "@/config/economy";
import type { SkillType } from "@/config/skills";

const schema = z.object<{ elapsedSeconds: number; activeSkill: string }>({
  elapsedSeconds: z.number(),
  activeSkill: z.string(),
});

/**
 * Server-validated offline claim.
 * Real deployment: load player row via service-role, compare server now() vs last_seen_at,
 * enforce daily caps, then UPDATE players + INSERT INTO reward audit. Client preview is untrusted.
 */
export async function claimOfflineAction(input: { elapsedSeconds: number; activeSkill: SkillType }) {
  const parsed = schema.parse(input);
  const elapsed = Math.floor(parsed.elapsedSeconds);

  if (!Number.isFinite(elapsed) || elapsed < 0) return { ok: false as const, error: "Bad timestamp" };
  if (elapsed > ECONOMY.OFFLINE_CAP_HOURS * 3600 + 60)
    return { ok: false as const, error: "Exceeds offline cap" };
  if (elapsed < 60) return { ok: false as const, error: "Nothing to claim yet" };

  // Demo server player context (DB lookup in production).
  const level = 5;
  const shardBalance = 0;
  const rewards = calculateOfflineRewards({
    level,
    activeSkill: parsed.activeSkill as SkillType,
    shardBalance,
    elapsedSeconds: elapsed,
    earnedToday: 0,
  });

  if (!isClaimPlausible(elapsed, rewards.gold, level)) {
    // Log to cheat_attempts in production.
    return { ok: false as const, error: "Impossible claim rejected + logged" };
  }

  return {
    ok: true as const,
    gold: rewards.gold,
    xp: rewards.xp,
    hoursApplied: rewards.hoursApplied,
    capped: rewards.capped,
    gated: rewards.gated,
  };
}
