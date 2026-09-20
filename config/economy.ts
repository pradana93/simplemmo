/**
 * Central economy tuning. Change values here — never hardcode elsewhere.
 * All reward logic must import from this file so seasons can rebalance easily.
 */
export const ECONOMY = {
  /** Minimum SHARD to unlock full reward multipliers (Hold-to-Earn gate). */
  SHARD_HOLD_THRESHOLD: 100,
  /** GOLD rate multiplier without the SHARD gate. */
  FREE_PLAY_MULTIPLIER: 0.5,

  /** Offline/idle rules */
  OFFLINE_CAP_HOURS: 12,
  OFFLINE_EFFICIENCY: 0.6,
  /** Max GOLD/day from idle at base level (scales slightly with level). */
  DAILY_IDLE_GOLD_CAP: 10_000,

  /** Base idle GOLD per hour per skill, before multipliers. */
  BASE_GOLD_PER_HOUR: 120,
  /** Base XP per hour while training. */
  BASE_XP_PER_HOUR: 220,

  /** Sinks */
  MARKET_FEE_BPS: 500, // 5% Black Market fee
  PUBLIC_MARKET_FEE_BPS: 300, // 3% public fee
  BANK_TRANSFER_FEE_BPS: 200, // 2% pocket -> bank
  BANK_TO_BANK_FEE_BPS: 400, // 4% bank -> bank

  /** PvP */
  PVP_POWER_CAP_RATIO: 3, // attacker >= 3x defender => damage capped
  PVP_GOLD_STEAL_PCT: 0.08, // 8% of pocket gold on contested win
  AUCTION_SNIPING_EXTENSION_SEC: 15,
  AUCTION_SNIPING_WINDOW_SEC: 15,
} as const;

export type EconomyConfig = typeof ECONOMY;
