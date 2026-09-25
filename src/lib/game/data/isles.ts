import type { EnemyId } from "../combat";

/**
 * Enemy islands. Each is a small fort you sail to, clear, and plant a
 * flag on. Repeats give better loot. The Reed holds Haven for ransom
 * while it stands.
 *
 * Coordinates are map-space, in the same system as world3.ts.
 */

export type RaidDefender = {
  id: string;
  kind: EnemyId;
  x: number;
  y: number;
  hp: number;
  dmg: number;
};

export type RaidBoss = {
  id: string;
  name: string;
  kind: EnemyId;
  x: number;
  y: number;
  hp: number;
  dmg: number;
  /** Catalog id dropped on first clear only. */
  drop?: string;
  /** Bones and coins dropped by the boss itself, in addition to the chest. */
  bones: number;
  coins: number;
};

export type IsleDef = {
  id: string;
  name: string;
  faction: string;
  /** Map-space origin. The fort is drawn around this point. */
  worldX: number;
  worldY: number;
  /** Minimum Sailing level to attempt. */
  sailNeed: number;
  blurb: string;
  /** Defenders guarding the approach and the yard. */
  defenders: RaidDefender[];
  /** The keep. Defeating the boss is what plants the flag. */
  boss: RaidBoss;
  /** Chest reward on first clear. */
  firstCoins: number;
  firstBones: number;
  /** Additional coins per successful repeat. Loot gets richer, not exhausted. */
  repeatCoins: number;
  repeatBones: number;
  /** Flags planted when you clear it. */
  flags: number;
  /** Coins drained from your purse every day this island stands uncleared. */
  ransomPerDay?: number;
  /** Enemy faction that raids YOUR island on its raid days. */
  raidsWith: "goblin" | "darkelf" | "pirate";
};

export const ISLES: IsleDef[] = [
  // ───────────────────────────── 1. Mucktooth Landing ─────────────
  {
    id: "mucktooth",
    name: "Mucktooth Landing",
    faction: "Mucktooth Clan",
    worldX: 1470,
    worldY: 2100,
    sailNeed: 1,
    blurb:
      "The clan you have been fighting. A staked yard on a flat rock. Grubtail keeps the chieftain's hut at the back. Tutorial raid — bring iron.",
    defenders: [
      { id: "mt-0", kind: "runt", x: -70, y: 40, hp: 3, dmg: 1 },
      { id: "mt-1", kind: "runt", x: -30, y: 25, hp: 3, dmg: 1 },
      { id: "mt-2", kind: "runt", x: 20, y: 30, hp: 3, dmg: 1 },
      { id: "mt-3", kind: "runt", x: 60, y: 20, hp: 3, dmg: 1 },
      { id: "mt-4", kind: "runt", x: 100, y: 35, hp: 3, dmg: 1 },
      { id: "mt-5", kind: "runt", x: 140, y: 30, hp: 3, dmg: 1 },
      { id: "mt-6", kind: "goblin", x: -50, y: -40, hp: 10, dmg: 3 },
      { id: "mt-7", kind: "goblin", x: 30, y: -55, hp: 10, dmg: 3 },
      { id: "mt-8", kind: "goblin", x: 110, y: -50, hp: 10, dmg: 3 },
    ],
    boss: {
      id: "grubtail",
      name: "Grubtail, the Mucktooth Chief",
      kind: "goblin",
      x: 30,
      y: -150,
      hp: 40,
      dmg: 4,
      drop: "hat-grubtail",
      bones: 6,
      coins: 20,
    },
    firstCoins: 60,
    firstBones: 12,
    repeatCoins: 20,
    repeatBones: 4,
    flags: 1,
    raidsWith: "goblin",
  },

  // ───────────────────────────── 2. The Reed ──────────────────────
  {
    id: "reed",
    name: "The Reed",
    faction: "Reed Company",
    worldX: 2600,
    worldY: 1250,
    sailNeed: 5,
    blurb:
      "Dark elves. They hold Haven for ransom — one hundred coins a day the black gown does not rule. Break them and the ledger forgives.",
    defenders: [
      { id: "rd-0", kind: "darkelf", x: -90, y: 20, hp: 12, dmg: 4 },
      { id: "rd-1", kind: "darkelf", x: -50, y: 0, hp: 12, dmg: 4 },
      { id: "rd-2", kind: "darkelf", x: -10, y: 15, hp: 12, dmg: 4 },
      { id: "rd-3", kind: "darkelf", x: 40, y: 5, hp: 12, dmg: 4 },
      { id: "rd-4", kind: "darkelf", x: 90, y: 25, hp: 12, dmg: 4 },
      { id: "rd-5", kind: "darkelf", x: 130, y: 10, hp: 12, dmg: 4 },
      { id: "rd-6", kind: "darkelf", x: -70, y: -70, hp: 14, dmg: 5 },
      { id: "rd-7", kind: "darkelf", x: 50, y: -80, hp: 14, dmg: 5 },
    ],
    boss: {
      id: "vesh",
      name: "Warden Vesh",
      kind: "darkelf",
      x: 20,
      y: -190,
      hp: 90,
      dmg: 7,
      drop: "sword-steel",
      bones: 20,
      coins: 60,
    },
    firstCoins: 180,
    firstBones: 30,
    repeatCoins: 60,
    repeatBones: 10,
    flags: 2,
    ransomPerDay: 100,
    raidsWith: "darkelf",
  },

  // ───────────────────────────── 3. Salt Holm ─────────────────────
  {
    id: "salt",
    name: "Salt Holm",
    faction: "Salt Holm Corsairs",
    worldX: 3400,
    worldY: 1450,
    sailNeed: 8,
    blurb:
      "The end of the map. A triple wall, a harbour gun, and Captain Sallow in the vault. They send pirates, not goblins. Bring adamant or bring a will.",
    defenders: [
      { id: "sl-0", kind: "darkelf", x: -120, y: 30, hp: 16, dmg: 6 },
      { id: "sl-1", kind: "darkelf", x: -80, y: 10, hp: 16, dmg: 6 },
      { id: "sl-2", kind: "darkelf", x: -40, y: 25, hp: 16, dmg: 6 },
      { id: "sl-3", kind: "darkelf", x: 0, y: 5, hp: 16, dmg: 6 },
      { id: "sl-4", kind: "darkelf", x: 40, y: 25, hp: 16, dmg: 6 },
      { id: "sl-5", kind: "darkelf", x: 80, y: 10, hp: 16, dmg: 6 },
      { id: "sl-6", kind: "darkelf", x: 120, y: 30, hp: 16, dmg: 6 },
      { id: "sl-7", kind: "darkelf", x: -100, y: -60, hp: 18, dmg: 7 },
      { id: "sl-8", kind: "darkelf", x: -20, y: -70, hp: 18, dmg: 7 },
      { id: "sl-9", kind: "darkelf", x: 60, y: -65, hp: 18, dmg: 7 },
      { id: "sl-10", kind: "darkelf", x: 130, y: -50, hp: 18, dmg: 7 },
    ],
    boss: {
      id: "sallow",
      name: "Captain Sallow",
      kind: "darkelf",
      x: 15,
      y: -200,
      hp: 180,
      dmg: 12,
      drop: "hat-sallow",
      bones: 50,
      coins: 200,
    },
    firstCoins: 500,
    firstBones: 80,
    repeatCoins: 200,
    repeatBones: 30,
    flags: 4,
    raidsWith: "pirate",
  },
];

export const ISLE_BY_ID: Record<string, IsleDef> = Object.fromEntries(
  ISLES.map((i) => [i.id, i]),
);

/** True while the island is uncleared and its ransom applies. */
export function isleStands(
  id: string,
  isles: Record<string, { cleared: number }> | undefined,
): boolean {
  const def = ISLE_BY_ID[id];
  if (!def || !def.ransomPerDay) return false;
  return (isles?.[id]?.cleared ?? 0) === 0;
}

/** Total ransom drained per day across every standing island. */
export function totalRansom(isles: Record<string, { cleared: number }> | undefined): number {
  let sum = 0;
  for (const def of ISLES) {
    if (def.ransomPerDay && isleStands(def.id, isles)) sum += def.ransomPerDay;
  }
  return sum;
}

/** Loot for a raid on this island, given how many times you've cleared it. */
export function raidLoot(id: string, cleared: number) {
  const def = ISLE_BY_ID[id];
  if (!def) return { coins: 0, bones: 0, drop: null };
  if (cleared === 0) {
    return { coins: def.firstCoins + def.boss.coins, bones: def.firstBones + def.boss.bones, drop: def.boss.drop ?? null };
  }
  return { coins: def.repeatCoins + def.boss.coins, bones: def.repeatBones + def.boss.bones, drop: null };
}

/** Bonus multiplier per raid beyond the first. Keeps repeats worth doing. */
export function repeatTier(cleared: number) {
  return Math.min(6, Math.floor(cleared / 3));
}
