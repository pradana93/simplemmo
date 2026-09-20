"use client";

import { useGameStore } from "@/store/useGameStore";
import { xpForNextLevel } from "@/config/skills";

export function WalletBar() {
  const goldPocket = useGameStore((s) => s.goldPocket);
  const goldBank = useGameStore((s) => s.goldBank);
  const shard = useGameStore((s) => s.shard);
  const level = useGameStore((s) => s.level);
  const xp = useGameStore((s) => s.xp);
  const need = xpForNextLevel(level);

  return (
    <div className="game-card grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
      <div>
        <div className="text-xs text-muted">Level</div>
        <div className="text-xl font-bold">
          {level} <span className="text-xs font-normal text-muted">({xp}/{need} XP)</span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded bg-[#26263a]">
          <div className="h-full bg-[#7c5cff]" style={{ width: `${Math.min(100, (xp / need) * 100)}%` }} />
        </div>
      </div>
      <div>
        <div className="text-xs text-muted">Pocket GOLD</div>
        <div className="gold-text text-xl font-bold">{Math.floor(goldPocket).toLocaleString()}</div>
      </div>
      <div>
        <div className="text-xs text-muted">Bank GOLD</div>
        <div className="text-xl font-bold">{Math.floor(goldBank).toLocaleString()}</div>
      </div>
      <div>
        <div className="text-xs text-muted">SHARD</div>
        <div className="shard-text text-xl font-bold">{Math.floor(shard).toLocaleString()}</div>
      </div>
    </div>
  );
}
