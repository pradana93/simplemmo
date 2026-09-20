import { describe, expect, it } from "vitest";
import { marketFee, bankFee, antiSnipeExpiry } from "@/lib/game/market";

describe("market", () => {
  it("applies 5% premium / 3% public fees", () => {
    expect(marketFee(1000, true)).toEqual({ net: 950, fee: 50 });
    expect(marketFee(1000, false)).toEqual({ net: 970, fee: 30 });
  });

  it("applies bank fees", () => {
    expect(bankFee(1000, false).fee).toBe(20);
    expect(bankFee(1000, true).fee).toBe(40);
  });

  it("extends auctions on last-second bids", () => {
    const exp = 1_000_000;
    const bidAt = exp - 10_000;
    expect(antiSnipeExpiry(exp, bidAt)).toBe(bidAt + 15_000);
    expect(antiSnipeExpiry(exp, exp - 60_000)).toBe(exp);
  });
});
