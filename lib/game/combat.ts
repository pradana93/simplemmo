import { ECONOMY } from "@/config/economy";
import { hashSeed, mulberry32 } from "@/lib/game/rng";

export interface Combatant {
  id: string;
  level: number;
  attack: number;
  defense: number;
  hp: number;
}

export interface CombatResult {
  winnerId: string;
  loserId: string;
  rounds: number;
  damageDealt: number;
  damageTaken: number;
  goldStolen: number;
  seed: string;
  log: string[];
}

function powerOf(c: Combatant): number {
  return c.attack * 1.4 + c.defense * 1.1 + c.hp * 0.4 + c.level * 5;
}

/**
 * Turn-based server-side combat with deterministic RNG + power-ratio capping.
 * If attacker power >= 3x defender power, damage is capped to protect low-level players.
 */
export function resolveCombat(
  attacker: Combatant,
  defender: Combatant,
  opts: { seed: string; pocketGold?: number },
): CombatResult {
  const seed = opts.seed;
  const rand = mulberry32(hashSeed(seed));
  const log: string[] = [];

  const atkPower = powerOf(attacker);
  const defPower = Math.max(1, powerOf(defender));
  const ratio = atkPower / defPower;
  const capped = ratio >= ECONOMY.PVP_POWER_CAP_RATIO;
  const capMultiplier = capped ? ECONOMY.PVP_POWER_CAP_RATIO / ratio : 1;

  let atkHp = attacker.hp;
  let defHp = defender.hp;
  let damageDealt = 0;
  let damageTaken = 0;
  let rounds = 0;

  for (let r = 1; r <= 20; r++) {
    rounds = r;
    // Attacker strikes
    const critA = rand() < 0.12 ? 1.6 : 1;
    const rawA = Math.max(1, attacker.attack * critA - defender.defense * 0.6);
    const dmgA = Math.max(1, Math.floor(rawA * capMultiplier * (0.9 + rand() * 0.2)));
    defHp -= dmgA;
    damageDealt += dmgA;
    log.push(`R${r}: attacker hits ${dmgA}${critA > 1 ? " (crit)" : ""}${capped ? " [capped]" : ""}`);
    if (defHp <= 0) break;

    // Defender strikes back
    const critD = rand() < 0.1 ? 1.5 : 1;
    const rawD = Math.max(1, defender.attack * critD - attacker.defense * 0.6);
    const dmgD = Math.max(1, Math.floor(rawD * (0.9 + rand() * 0.2)));
    atkHp -= dmgD;
    damageTaken += dmgD;
    log.push(`R${r}: defender hits ${dmgD}${critD > 1 ? " (crit)" : ""}`);
    if (atkHp <= 0) break;
  }

  const attackerWins = defHp <= 0 && atkHp > 0 ? true : atkHp >= defHp;
  const winnerId = attackerWins ? attacker.id : defender.id;
  const loserId = attackerWins ? defender.id : attacker.id;
  const goldStolen = attackerWins
    ? Math.floor((opts.pocketGold ?? 0) * ECONOMY.PVP_GOLD_STEAL_PCT)
    : 0;

  return { winnerId, loserId, rounds, damageDealt, damageTaken, goldStolen, seed, log };
}
