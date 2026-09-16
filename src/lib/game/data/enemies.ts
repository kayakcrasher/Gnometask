export type EnemyId = "rat" | "big_rat" | "fox" | "boar" | "ash_shadow";

export type Enemy = {
  id: EnemyId;
  name: string;
  blurb: string;
  hp: number;
  attack: number;
  defence: number;
  xp: number;
  coins: number;
  /** layout slot ids they can spawn on */
  spawnSlots: string[];
};

export const ENEMIES: Enemy[] = [
  {
    id: "rat",
    name: "Lane rat",
    blurb: "Starts easy. Still has teeth.",
    hp: 6,
    attack: 2,
    defence: 0,
    xp: 8,
    coins: 2,
    spawnSlots: ["pack_rats_a", "pack_rats_b"],
  },
  {
    id: "big_rat",
    name: "Stoop rat",
    blurb: "Ate the kindling. Personal now.",
    hp: 12,
    attack: 4,
    defence: 1,
    xp: 16,
    coins: 5,
    spawnSlots: ["pack_rats_a"],
  },
  {
    id: "fox",
    name: "Garden fox",
    blurb: "Wants hens. You want hens. Talk with a sword.",
    hp: 18,
    attack: 5,
    defence: 2,
    xp: 24,
    coins: 8,
    spawnSlots: ["garden_coop"],
  },
  {
    id: "boar",
    name: "Woodlot boar",
    blurb: "Owns a pine until you say otherwise.",
    hp: 28,
    attack: 7,
    defence: 3,
    xp: 36,
    coins: 12,
    spawnSlots: ["woodlot"],
  },
  {
    id: "ash_shadow",
    name: "Ridge shadow",
    blurb: "Not Ash. Ash's patience, given teeth.",
    hp: 40,
    attack: 9,
    defence: 4,
    xp: 60,
    coins: 20,
    spawnSlots: ["dragon_ridge"],
  },
];

export function enemyById(id: string): Enemy | undefined {
  return ENEMIES.find((e) => e.id === id);
}

export function enemiesAtSlot(slotId: string): Enemy[] {
  return ENEMIES.filter((e) => e.spawnSlots.includes(slotId));
}
