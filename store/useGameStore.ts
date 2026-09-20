import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { SkillType } from "@/config/skills";
import { xpForNextLevel } from "@/config/skills";

export interface SkillEntry {
  level: number;
  xp: number;
}

export interface GameState {
  username: string;
  level: number;
  xp: number;
  goldPocket: number;
  goldBank: number;
  shard: number;
  notoriety: number;
  reputation: number;
  lastSeenAt: string | null;
  activeSkill: SkillType;
  skills: Record<SkillType, SkillEntry>;
  combatLog: string[];
  onlineCount: number;
  setUsername: (u: string) => void;
  setActiveSkill: (s: SkillType) => void;
  applyRewards: (gold: number, xp: number, skill: SkillType) => void;
  pushLog: (line: string) => void;
  setLastSeen: (iso: string) => void;
  hydrateFromServer: (p: Partial<GameState>) => void;
}

const defaultSkills = (): Record<SkillType, SkillEntry> => ({
  combat: { level: 1, xp: 0 },
  mining: { level: 1, xp: 0 },
  fishing: { level: 1, xp: 0 },
  woodcutting: { level: 1, xp: 0 },
  smithing: { level: 1, xp: 0 },
  cooking: { level: 1, xp: 0 },
  alchemy: { level: 1, xp: 0 },
  thieving: { level: 1, xp: 0 },
  espionage: { level: 1, xp: 0 },
});

export const useGameStore = create<GameState>()(
  persist(
    immer((set) => ({
      username: "Adventurer",
      level: 1,
      xp: 0,
      goldPocket: 100,
      goldBank: 0,
      shard: 0,
      notoriety: 0,
      reputation: 0,
      lastSeenAt: null,
      activeSkill: "combat",
      skills: defaultSkills(),
      combatLog: ["Welcome to SimpleMMO."],
      onlineCount: 1,
      setUsername: (u) =>
        set((s) => {
          s.username = u.slice(0, 24);
        }),
      setActiveSkill: (sk) =>
        set((s) => {
          s.activeSkill = sk;
        }),
      applyRewards: (gold, xp, skill) =>
        set((s) => {
          s.goldPocket += Math.max(0, Math.floor(gold));
          s.xp += Math.max(0, Math.floor(xp));
          const entry = s.skills[skill];
          entry.xp += Math.max(0, Math.floor(xp));
          // Level-up skill
          let need = xpForNextLevel(entry.level);
          while (entry.xp >= need) {
            entry.xp -= need;
            entry.level += 1;
            need = xpForNextLevel(entry.level);
          }
          // Level-up player (global xp)
          let pneed = xpForNextLevel(s.level);
          while (s.xp >= pneed) {
            s.xp -= pneed;
            s.level += 1;
            pneed = xpForNextLevel(s.level);
          }
        }),
      pushLog: (line) =>
        set((s) => {
          s.combatLog.push(line);
          if (s.combatLog.length > 120) s.combatLog.splice(0, s.combatLog.length - 120);
        }),
      setLastSeen: (iso) =>
        set((s) => {
          s.lastSeenAt = iso;
        }),
      hydrateFromServer: (p) =>
        set((s) => {
          Object.assign(s, p);
        }),
    })),
    {
      name: "simplemmo-save",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        username: s.username,
        level: s.level,
        xp: s.xp,
        goldPocket: s.goldPocket,
        goldBank: s.goldBank,
        shard: s.shard,
        notoriety: s.notoriety,
        reputation: s.reputation,
        lastSeenAt: s.lastSeenAt,
        activeSkill: s.activeSkill,
        skills: s.skills,
        combatLog: s.combatLog.slice(-40),
        onlineCount: s.onlineCount,
      }) as unknown as GameState,
    },
  ),
);
