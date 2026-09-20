import { describe, expect, it } from "vitest";
import { resolveCombat } from "@/lib/game/combat";

describe("pvp combat", () => {
  it("is deterministic for same seed", () => {
    const a = { id: "a", level: 8, attack: 42, defense: 28, hp: 220 };
    const d = { id: "d", level: 7, attack: 38, defense: 30, hp: 205 };
    const r1 = resolveCombat(a, d, { seed: "match-1", pocketGold: 1000 });
    const r2 = resolveCombat(a, d, { seed: "match-1", pocketGold: 1000 });
    expect(r1).toEqual(r2);
  });

  it("caps damage for 3x+ power gaps", () => {
    const whale = { id: "w", level: 50, attack: 500, defense: 400, hp: 5000 };
    const noob = { id: "n", level: 1, attack: 5, defense: 5, hp: 50 };
    const r = resolveCombat(whale, noob, { seed: "gap", pocketGold: 100 });
    expect(r.log.some((l) => l.includes("[capped]"))).toBe(true);
  });
});
