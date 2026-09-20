"use server";

import { resolveCombat } from "@/lib/game/combat";
import { z } from "@/lib/validation/zod-shim";

const schema = z.object<{ defenderId: string; channel: string }>({ defenderId: z.string(), channel: z.string() });

/**
 * Server-side PvP resolution with deterministic RNG.
 * Production: load both combatants from DB, seed = matchId + server secret,
 * write pvp_logs row, apply gold steal with OCC (optimistic concurrency).
 */
export async function pvpAttackAction(input: { defenderId: string; channel: string }) {
  try {
    const p = schema.parse(input);
    const seed = `${Date.now()}-${p.defenderId}-${p.channel}`;
    const result = resolveCombat(
      { id: "attacker", level: 8, attack: 42, defense: 28, hp: 220 },
      { id: p.defenderId, level: 7, attack: 38, defense: 30, hp: 205 },
      { seed, pocketGold: 1200 },
    );
    return { ok: true as const, ...result };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "PvP failed" };
  }
}
