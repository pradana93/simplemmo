"use server";

import { marketFee, antiSnipeExpiry } from "@/lib/game/market";
import { z } from "@/lib/validation/zod-shim";

const buySchema = z.object<{ listingId: string; price: number; premium: boolean }>({ listingId: z.string(), price: z.number(), premium: z.boolean() });
const bidSchema = z.object<{
  listingId: string;
  amount: number;
  currentExpiresAtMs: number;
  bidAtMs: number;
}>({
  listingId: z.string(),
  amount: z.number(),
  currentExpiresAtMs: z.number(),
  bidAtMs: z.number(),
});

export async function buyListingAction(input: { listingId: string; price: number; premium: boolean }) {
  const p = buySchema.parse(input);
  const { net, fee } = marketFee(p.price, p.premium);
  // Production: OCC update market_listings SET sold=true WHERE id AND sold=false; move gold; log.
  return { ok: true as const, net, fee };
}

export async function placeBidAction(input: {
  listingId: string;
  amount: number;
  currentExpiresAtMs: number;
  bidAtMs: number;
}) {
  const p = bidSchema.parse(input);
  const newExpiry = antiSnipeExpiry(p.currentExpiresAtMs, p.bidAtMs);
  // Production: INSERT INTO market_bids + UPDATE listing expiry atomically.
  return { ok: true as const, newExpiresAtMs: newExpiry, extended: newExpiry !== p.currentExpiresAtMs };
}
