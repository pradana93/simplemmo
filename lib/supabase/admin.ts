import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client for Edge Functions / Server Actions ONLY.
 * Bypasses RLS. Never import from client components.
 */
export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error("Missing Supabase service-role env vars");
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}
