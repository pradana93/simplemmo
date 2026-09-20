import { ECONOMY } from "@/config/economy";
import type { SkillType } from "@/config/skills";

export interface OfflineInput {
  level: number;
  activeSkill: SkillType;
  shardBalance: number;
  elapsedSeconds: number;
  /** GOLD already earned from idle today (for daily cap enforcement). */
  earnedToday?: number;
  lastSeenAt?: string;
}

export interface OfflineRewards {
  gold: number;
  xp: number;
  skillProgress: number;
  capped: boolean;
  efficiency: number;
  hoursApplied: number;
  gated: boolean;
}

/**
 * Deterministic offline reward calculator.
 * Pure function — no I/O, no Date.now(). Caller passes elapsedSeconds.
 * Uses chunked hourly simulation (no per-second loops).
 */
export function calculateOfflineRewards(input: OfflineInput): OfflineRewards {
  const capSeconds = ECONOMY.OFFLINE_CAP_HOURS * 3600;
  const clamped = Math.max(0, Math.min(input.elapsedSeconds, capSeconds));
  const capped = input.elapsedSeconds > capSeconds;
  const hoursApplied = clamped / 3600;

  const gated = input.shardBalance < ECONOMY.SHARD_HOLD_THRESHOLD;
  const gateMultiplier = gated ? ECONOMY.FREE_PLAY_MULTIPLIER : 1;

  // Slight level scaling: +2% per level up to +100% at level 50.
  const levelMultiplier = 1 + Math.min(input.level * 0.02, 1);

  let gold =
    hoursApplied *
    ECONOMY.BASE_GOLD_PER_HOUR *
    ECONOMY.OFFLINE_EFFICIENCY *
    gateMultiplier *
    levelMultiplier;

  const xp = Math.floor(
    hoursApplied * ECONOMY.BASE_XP_PER_HOUR * ECONOMY.OFFLINE_EFFICIENCY * levelMultiplier,
  );

  // Daily cap enforcement (server re-validates with DB counters).
  const earnedToday = input.earnedToday ?? 0;
  const dailyCap = ECONOMY.DAILY_IDLE_GOLD_CAP * (1 + Math.min(input.level * 0.02, 1));
  const remaining = Math.max(0, dailyCap - earnedToday);
  gold = Math.min(Math.floor(gold), Math.floor(remaining));

  return {
    gold,
    xp,
    skillProgress: xp,
    capped,
    efficiency: ECONOMY.OFFLINE_EFFICIENCY,
    hoursApplied: Math.round(hoursApplied * 100) / 100,
    gated,
  };
}

/** Server-side anti-cheat: is this claim physically possible? */
export function isClaimPlausible(elapsedSeconds: number, claimedGold: number, level: number): boolean {
  if (elapsedSeconds < 0 || elapsedSeconds > ECONOMY.OFFLINE_CAP_HOURS * 3600 + 60) return false;
  const maxPossible = calculateOfflineRewards({
    level,
    activeSkill: "combat",
    shardBalance: Number.MAX_SAFE_INTEGER, // ungated max
    elapsedSeconds,
    earnedToday: 0,
  });
  // Allow 1% tolerance for rounding; anything above is impossible.
  return claimedGold <= Math.ceil(maxPossible.gold * 1.01) + 1;
}
