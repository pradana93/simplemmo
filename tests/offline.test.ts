import { describe, expect, it } from "vitest";
import { calculateOfflineRewards, isClaimPlausible } from "@/lib/game/offline";

describe("offline rewards", () => {
  it("caps at 12h and applies 60% efficiency + gate", () => {
    const r = calculateOfflineRewards({
      level: 10,
      activeSkill: "combat",
      shardBalance: 0, // gated => 50%
      elapsedSeconds: 24 * 3600,
      earnedToday: 0,
    });
    expect(r.capped).toBe(true);
    expect(r.hoursApplied).toBeCloseTo(12, 1);
    expect(r.gated).toBe(true);
    expect(r.gold).toBeGreaterThan(0);
  });

  it("rejects impossible claims", () => {
    expect(isClaimPlausible(60, 1_000_000, 1)).toBe(false);
    expect(isClaimPlausible(3600, 50, 5)).toBe(true);
  });

  it("enforces daily cap", () => {
    const r = calculateOfflineRewards({
      level: 1,
      activeSkill: "mining",
      shardBalance: 1000,
      elapsedSeconds: 12 * 3600,
      earnedToday: 999_999,
    });
    expect(r.gold).toBe(0);
  });
});
