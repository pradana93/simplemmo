import type { JobType } from "@/config/skills";

/** Job XP drip per hour of relevant skill training. */
export const JOB_XP_PER_HOUR: Record<JobType, number> = {
  guard: 40,
  thief: 40,
  chef: 50,
  blacksmith: 50,
  merchant: 35,
};

export interface WorldBoss {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  rewardGold: number;
  rewardShard: number;
}

export function bossRewardShare(damage: number, totalDamage: number, boss: WorldBoss) {
  const share = totalDamage > 0 ? damage / totalDamage : 0;
  return {
    gold: Math.floor(boss.rewardGold * share),
    shard: Math.floor(boss.rewardShard * share),
    share,
  };
}

/** Spy action: success chance vs level gap; costs energy. Pure helper (server validates). */
export function spySuccessChance(spyLevel: number, targetLevel: number): number {
  const base = 0.65 + (spyLevel - targetLevel) * 0.05;
  return Math.max(0.05, Math.min(0.95, base));
}
