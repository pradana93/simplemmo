import { ECONOMY } from "@/config/economy";

export function applyFee(amount: number, feeBps: number): { net: number; fee: number } {
  const fee = Math.floor((amount * feeBps) / 10_000);
  return { net: amount - fee, fee };
}

export function marketFee(amount: number, premium: boolean): { net: number; fee: number } {
  return applyFee(amount, premium ? ECONOMY.MARKET_FEE_BPS : ECONOMY.PUBLIC_MARKET_FEE_BPS);
}

export function bankFee(amount: number, bankToBank: boolean): { net: number; fee: number } {
  return applyFee(amount, bankToBank ? ECONOMY.BANK_TO_BANK_FEE_BPS : ECONOMY.BANK_TRANSFER_FEE_BPS);
}

/** Auction anti-sniping: extend expiry if bid lands inside the window. */
export function antiSnipeExpiry(
  currentExpiresAtMs: number,
  bidAtMs: number,
  extensionSec = ECONOMY.AUCTION_SNIPING_EXTENSION_SEC,
  windowSec = ECONOMY.AUCTION_SNIPING_WINDOW_SEC,
): number {
  const remaining = currentExpiresAtMs - bidAtMs;
  if (remaining <= windowSec * 1000) {
    return bidAtMs + extensionSec * 1000;
  }
  return currentExpiresAtMs;
}
