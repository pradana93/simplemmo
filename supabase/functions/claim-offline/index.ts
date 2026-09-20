// Supabase Edge Function: claim-offline (Deno, service-role)
// Validates last_seen_at server-side with now(), enforces caps, grants rewards.
// Deploy: supabase functions deploy claim-offline
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

const OFFLINE_CAP_H = 12;
const EFFICIENCY = 0.6;
const BASE_GOLD_H = 120;
const BASE_XP_H = 220;

serve(async (req) => {
  try {
    const { playerId } = await req.json();
    if (!playerId) return Response.json({ error: "playerId required" }, { status: 400 });
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: p, error } = await sb.from("players").select("*").eq("id", playerId).single();
    if (error || !p) return Response.json({ error: "player not found" }, { status: 404 });

    const now = Date.now();
    const last = Date.parse(p.last_seen_at);
    const elapsed = Math.max(0, Math.floor((now - last) / 1000));
    const capped = Math.min(elapsed, OFFLINE_CAP_H * 3600);
    const hours = capped / 3600;
    const gated = (p.shard_balance ?? 0) < 100;
    const mult = gated ? 0.5 : 1;
    const gold = Math.floor(hours * BASE_GOLD_H * EFFICIENCY * mult * (1 + Math.min(p.level * 0.02, 1)));
    const xp = Math.floor(hours * BASE_XP_H * EFFICIENCY * (1 + Math.min(p.level * 0.02, 1)));

    // Daily cap
    const today = new Date().toISOString().slice(0, 10);
    const earnedToday = p.idle_day === today ? (p.idle_earned_today ?? 0) : 0;
    const cap = 10000 * (1 + Math.min(p.level * 0.02, 1));
    const grant = Math.max(0, Math.min(gold, Math.floor(cap - earnedToday)));

    await sb.from("players").update({
      gold_pocket: (p.gold_pocket ?? 0) + grant,
      xp: (p.xp ?? 0) + xp,
      last_seen_at: new Date(now).toISOString(),
      idle_earned_today: earnedToday + grant,
      idle_day: today,
    }).eq("id", playerId);

    return Response.json({ gold: grant, xp, hours, capped: elapsed > capped, gated });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
});
