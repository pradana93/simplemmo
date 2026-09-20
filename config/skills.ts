export type SkillType =
  | "combat"
  | "mining"
  | "fishing"
  | "woodcutting"
  | "smithing"
  | "cooking"
  | "alchemy"
  | "thieving"
  | "espionage";

export const SKILLS: { id: SkillType; label: string; kind: "combat" | "gathering" | "production" | "special" }[] = [
  { id: "combat", label: "Combat", kind: "combat" },
  { id: "mining", label: "Mining", kind: "gathering" },
  { id: "fishing", label: "Fishing", kind: "gathering" },
  { id: "woodcutting", label: "Woodcutting", kind: "gathering" },
  { id: "smithing", label: "Smithing", kind: "production" },
  { id: "cooking", label: "Cooking", kind: "production" },
  { id: "alchemy", label: "Alchemy", kind: "production" },
  { id: "thieving", label: "Thieving", kind: "special" },
  { id: "espionage", label: "Espionage", kind: "special" },
];

export type JobType = "guard" | "thief" | "chef" | "blacksmith" | "merchant";

export const JOBS: { id: JobType; label: string; bonus: string }[] = [
  { id: "guard", label: "Guard", bonus: "+10% PvP defense" },
  { id: "thief", label: "Thief", bonus: "+10% gold steal" },
  { id: "chef", label: "Chef", bonus: "+10% cooking XP" },
  { id: "blacksmith", label: "Blacksmith", bonus: "+10% smithing XP" },
  { id: "merchant", label: "Merchant", bonus: "-1% market fee" },
];

/** XP curve: xp needed to go from level L -> L+1 */
export function xpForNextLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5) + 50 * level);
}
