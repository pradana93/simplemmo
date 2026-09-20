// Supabase Edge Function: resolve-pvp (Deno, service-role, deterministic RNG)
// Deploy: supabase functions deploy resolve-pvp
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

function hash(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

serve(async (req) => {
  try {
    const { attackerId, defenderId, channel } = await req.json();
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const seed = `${attackerId}:${defenderId}:${Date.now()}`;
    const rand = rng(hash(seed));
    // Load combatants in production; demo stats here.
    const atk = { atk: 42, def: 28, hp: 220 };
    const dfn = { atk: 38, def: 30, hp: 205 };
    const ratio = (atk.atk * 1.4) / Math.max(1, dfn.atk * 1.4);
    const cap = ratio >= 3 ? 3 / ratio : 1;
    let ahp = atk.hp, dhp = dfn.hp, rounds = 0;
    for (let r = 1; r <= 20; r++) {
      rounds = r;
      dhp -= Math.max(1, Math.floor((atk.atk - dfn.def * 0.6) * cap * (0.9 + rand() * 0.2)));
      if (dhp <= 0) break;
      ahp -= Math.max(1, Math.floor((dfn.atk - atk.def * 0.6) * (0.9 + rand() * 0.2)));
      if (ahp <= 0) break;
    }
    const attackerWins = dhp <= 0 || ahp >= dhp;
    await sb.from("pvp_logs").insert({
      attacker_id: attackerId, defender_id: defenderId,
      result: attackerWins ? "attacker_win" : "defender_win",
      gold_stolen: attackerWins ? 96 : 0,
    });
    return Response.json({ winner: attackerWins ? attackerId : defenderId, rounds, channel, seed });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
});
