// Supabase Edge Function: settle-auction (anti-sniping settlement)
// Deploy: supabase functions deploy settle-auction
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

serve(async (req) => {
  try {
    const { listingId, bidAtMs, currentExpiresAtMs } = await req.json();
    const remaining = currentExpiresAtMs - bidAtMs;
    const extended = remaining <= 15_000;
    const newExpiry = extended ? bidAtMs + 15_000 : currentExpiresAtMs;
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    await sb.from("market_listings").update({ expires_at: new Date(newExpiry).toISOString() }).eq("id", listingId);
    return Response.json({ newExpiresAtMs: newExpiry, extended });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
});
