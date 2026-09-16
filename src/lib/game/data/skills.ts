export type SkillId =
  | "woodcutting"
  | "combat"
  | "prayer"
  | "farming"
  | "barter"
  | "sailing";

export type Skill = {
  id: SkillId;
  name: string;
  blurb: string;
  /** Color used on HUD pips */
  color: string;
};

export const SKILLS: Skill[] = [
  {
    id: "woodcutting",
    name: "Woodcutting",
    blurb: "Stumps, kindling, and the woodlot. Hatchet tier matters.",
    color: "#6b4a2b",
  },
  {
    id: "combat",
    name: "Combat",
    blurb: "Rats first. The ridge later. Don't swing at neighbours.",
    color: "#8b2d2d",
  },
  {
    id: "prayer",
    name: "Prayer",
    blurb: "Teeth, bed, wash-up. The quiet skills that reset the day.",
    color: "#c9b37a",
  },
  {
    id: "farming",
    name: "Farming",
    blurb: "Garden beds, hens, stew ingredients.",
    color: "#4a7a3a",
  },
  {
    id: "barter",
    name: "Barter",
    blurb: "Hats, house bits, village pieces, saying hello.",
    color: "#b07a2a",
  },
  {
    id: "sailing",
    name: "Sailing",
    blurb: "The shore and the punt. Locked until the village has a gate.",
    color: "#2b5c7e",
  },
];

/** Simple RS-style curve: level 1 at 0, each level needs more xp. */
export function xpForLevel(level: number): number {
  const n = Math.max(1, level);
  return Math.floor(n * n * 12 + n * 8);
}

export function levelFromXp(xp: number): number {
  let level = 1;
  let spent = 0;
  while (level < 99) {
    const need = xpForLevel(level);
    if (spent + need > xp) break;
    spent += need;
    level += 1;
  }
  return level;
}

export function skillById(id: string): Skill | undefined {
  return SKILLS.find((s) => s.id === id);
}

export const STARTING_XP: Record<SkillId, number> = {
  woodcutting: 0,
  combat: 0,
  prayer: 0,
  farming: 0,
  barter: 0,
  sailing: 0,
};
