"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useGameStore } from "@/store/useGameStore";

export function StatsChart() {
  const level = useGameStore((s) => s.level);
  const goldPocket = useGameStore((s) => s.goldPocket);
  const data = [
    { t: "-6h", gold: Math.floor(goldPocket * 0.6), xp: level * 80 },
    { t: "-4h", gold: Math.floor(goldPocket * 0.72), xp: level * 95 },
    { t: "-2h", gold: Math.floor(goldPocket * 0.88), xp: level * 110 },
    { t: "now", gold: Math.floor(goldPocket), xp: level * 125 },
  ];
  return (
    <div className="game-card p-4">
      <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted">Progress</h2>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="t" tick={{ fill: "#8e8ea3", fontSize: 12 }} />
            <YAxis tick={{ fill: "#8e8ea3", fontSize: 12 }} width={50} />
            <Tooltip />
            <Line type="monotone" dataKey="gold" stroke="#f5c518" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="xp" stroke="#7c5cff" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
