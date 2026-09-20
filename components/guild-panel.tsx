"use client";

import { useState } from "react";

const NODES = [
  { id: "ember-mine", name: "Ember Mine", resource: "ore", guild: "Iron Pact" },
  { id: "whisper-docks", name: "Whisper Docks", resource: "fish", guild: null },
  { id: "thornwood", name: "Thornwood", resource: "logs", guild: "Night Ledger" },
];

export function GuildPanel() {
  const [guild, setGuild] = useState<string | null>(null);
  return (
    <div className="space-y-4">
      <div className="game-card p-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted">Your guild</h2>
        {guild ? (
          <p className="mt-1 text-sm">
            Member of <b>{guild}</b>. Territory income accrues every hour. Guild wars scheduled
            Sundays.
          </p>
        ) : (
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => setGuild("Iron Pact")}
              className="min-h-[44px] flex-1 rounded-xl bg-[#f5c518] px-4 py-2 font-bold text-black"
            >
              Create / Join (costs SHARD)
            </button>
          </div>
        )}
      </div>
      <div className="game-card p-4">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted">
          Territory map
        </h2>
        <ul className="divide-y divide-[#1c1c2c] text-sm">
          {NODES.map((n) => (
            <li key={n.id} className="flex items-center justify-between py-3">
              <div>
                <div className="font-semibold">{n.name}</div>
                <div className="text-xs text-muted">Resource: {n.resource}</div>
              </div>
              <div className="text-xs">{n.guild ? `Held by ${n.guild}` : "Unclaimed"}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
