"use client";

import { useMemo, useState } from "react";

interface Listing {
  id: string;
  item: string;
  rarity: string;
  price: number;
  currency: "gold" | "shard";
  premium: boolean;
}

const DEMO: Listing[] = [
  { id: "1", item: "Iron Sword", rarity: "common", price: 150, currency: "gold", premium: false },
  { id: "2", item: "Mithril Pickaxe", rarity: "rare", price: 2400, currency: "gold", premium: false },
  { id: "3", item: "Shadow Dagger", rarity: "legendary", price: 45, currency: "shard", premium: true },
  { id: "4", item: "Dragonplate", rarity: "legendary", price: 120, currency: "shard", premium: true },
];

export function MarketBrowser({ shardBalance = 0 }: { shardBalance?: number }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "public" | "premium">("all");
  const gated = shardBalance < 100;

  const rows = useMemo(() => {
    return DEMO.filter((l) => {
      if (filter === "public" && l.premium) return false;
      if (filter === "premium" && !l.premium) return false;
      if (q && !l.item.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [q, filter]);

  return (
    <div className="game-card p-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search items…"
          aria-label="Search market"
          className="min-h-[44px] flex-1 rounded-xl border border-[#26263a] bg-[#12121c] px-3 text-sm"
        />
        <div className="flex gap-2" role="group" aria-label="Market filter">
          {(["all", "public", "premium"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`min-h-[44px] rounded-xl px-4 text-sm font-semibold ${
                filter === f ? "bg-[#f5c518] text-black" : "bg-[#1e1e30]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filter === "premium" && gated ? (
        <p className="mt-3 text-sm text-muted">
          Premium Black Market requires 100 SHARD staked. You have {shardBalance}. Anonymous escrow
          listings unlock after the gate.
        </p>
      ) : null}

      <ul className="mt-3 divide-y divide-[#1c1c2c]">
        {rows.map((l) => (
          <li key={l.id} className="flex items-center justify-between py-3 text-sm">
            <div>
              <div className="font-semibold">{l.item}</div>
              <div className="text-xs text-muted">
                {l.rarity} • {l.premium ? "premium escrow" : "public"}
              </div>
            </div>
            <div className="text-right font-bold">
              {l.price.toLocaleString()} {l.currency === "gold" ? "GOLD" : "SHARD"}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
