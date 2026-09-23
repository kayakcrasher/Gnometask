export type { SkillId, Skills } from "./data/skills";
export { SKILL_LABEL, SKILL_ORDER, COMBAT_SKILLS, SKILL_BLURB } from "./data/skills";

import { SKILL_IDS, SKILL_LABEL, type SkillId, type Skills } from "./data/skills";

export function xpForLevel(level: number) {
  if (level <= 1) return 0;
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += Math.floor(i + 300 * Math.pow(2, i / 7));
  }
  return Math.floor(total / 4);
}

export function levelFromXp(xp: number) {
  let level = 1;
  while (level < 99 && xpForLevel(level + 1) <= xp) level += 1;
  return level;
}

export function xpToNext(xp: number) {
  const level = levelFromXp(xp);
  if (level >= 99) return 0;
  return xpForLevel(level + 1) - xp;
}

export function defaultSkills(): Skills {
  return {
    attack: 0,
    strength: 0,
    defence: 0,
    hitpoints: xpForLevel(10),
    woodcutting: 0,
    farming: 0,
    prayer: 0,
    barter: 0,
    sailing: 0,
    fishing: 0,
    crafting: 0,
  };
}

export function levelsOf(skills: Skills) {
  const out = {} as Record<SkillId, number>;
  SKILL_IDS.forEach((id) => {
    out[id] = levelFromXp(skills[id] ?? 0);
  });
  return out;
}

export function totalLevel(skills: Skills) {
  return SKILL_IDS.reduce((n, id) => n + levelFromXp(skills[id] ?? 0), 0);
}

export function combatLevel(skills: Skills) {
  const l = levelsOf(skills);
  return Math.max(3, Math.floor(0.25 * (l.defence + l.hitpoints) + 0.325 * (l.attack + l.strength)));
}

export function maxHitpoints(skills: Skills) {
  return Math.max(10, levelsOf(skills).hitpoints);
}

export function maxHit(strLevel: number, weaponAtk: number, fort = 0) {
  return Math.max(1, 1 + Math.floor((strLevel + weaponAtk * 2) / 8) + Math.floor(fort / 2));
}

export function hitChance(attLevel: number, weaponAtk: number, enemyDef = 1) {
  const atkRoll = attLevel + weaponAtk + 8;
  const defRoll = Math.max(1, enemyDef + 8);
  return Math.min(0.94, Math.max(0.2, atkRoll / (atkRoll + defRoll)));
}

export function applyXp(skills: Skills, id: SkillId, amount: number) {
  const before = levelFromXp(skills[id] ?? 0);
  const next = { ...skills, [id]: Math.max(0, (skills[id] ?? 0) + Math.floor(amount)) };
  const after = levelFromXp(next[id] ?? 0);
  return {
    skills: next,
    ding: after > before ? `Your ${SKILL_LABEL[id]} is now ${after}.` : null,
    gained: Math.floor(amount),
  };
}
