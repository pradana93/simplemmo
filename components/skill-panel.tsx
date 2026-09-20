"use client";

import { SKILLS, xpForNextLevel } from "@/config/skills";
import { useGameStore } from "@/store/useGameStore";

export function SkillPanel() {
  const skills = useGameStore((s) => s.skills);
  const activeSkill = useGameStore((s) => s.activeSkill);
  const setActiveSkill = useGameStore((s) => s.setActiveSkill);

  return (
    <div className="game-card p-4">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted">Train a skill</h2>
      <div className="grid gap-2">
        {SKILLS.map((sk) => {
          const e = skills[sk.id];
          const need = xpForNextLevel(e.level);
          const pct = Math.min(100, (e.xp / need) * 100);
          const active = activeSkill === sk.id;
          return (
            <button
              key={sk.id}
              onClick={() => setActiveSkill(sk.id)}
              aria-pressed={active}
              className={`rounded-xl border p-3 text-left transition ${
                active ? "border-[#f5c518] bg-[#1e1e30]" : "border-[#26263a] bg-[#12121c]"
              }`}
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">
                  {sk.label} <span className="text-xs text-muted">Lv {e.level}</span>
                </span>
                <span className="text-xs text-muted">
                  {e.xp}/{need} XP
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded bg-[#26263a]">
                <div className="h-full bg-[#f5c518]" style={{ width: `${pct}%` }} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
