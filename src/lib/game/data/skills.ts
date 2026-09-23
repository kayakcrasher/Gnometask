export const SKILL_IDS = [
  "attack",
  "strength",
  "defence",
  "hitpoints",
  "woodcutting",
  "farming",
  "prayer",
  "barter",
  "sailing",
  "fishing",
  "crafting",
] as const;

export type SkillId = (typeof SKILL_IDS)[number];

export type Skills = Record<SkillId, number>;

export const SKILL_ORDER: SkillId[] = [...SKILL_IDS];

export const COMBAT_SKILLS: SkillId[] = ["attack", "strength", "defence", "hitpoints"];

export const SKILL_LABEL: Record<SkillId, string> = {
  attack: "Attack",
  strength: "Strength",
  defence: "Defence",
  hitpoints: "Hitpoints",
  woodcutting: "Woodcutting",
  farming: "Farming",
  prayer: "Prayer",
  barter: "Barter",
  sailing: "Sailing",
  fishing: "Fishing",
  crafting: "Crafting",
};

export const SKILL_BLURB: Record<SkillId, string> = {
  attack: "How often the sword finds its mark.",
  strength: "How hard the mark minds being found.",
  defence: "How little of you the wildlands get.",
  hitpoints: "How much gnome there is to go around.",
  woodcutting: "Trees, stumps, and the patience between.",
  farming: "Water, soil, and the beans' conspiracy.",
  prayer: "A quiet word. Half the bruise.",
  barter: "Coins, gossip, and a fair price.",
  sailing: "Tide, rope, and the next shore.",
  fishing: "Line, patience, and what the tide keeps.",
  crafting: "Hats, fences, and things that stay put.",
};
