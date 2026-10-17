import type { SkillId } from "./xp";
import { combatLevel, type Skills } from "./xp";
import { ENEMIES, ENEMY_BEHAVIOUR } from "./data/enemies";
import { SKILL_IDS } from "./data/skills";

export type EnemyId =
  | "rat"
  | "boar"
  | "sprite"
  | "wyrmling"
  | "dragon"
  | "absence"
  | "bat"
  | "cobble"
  | "crab"
  | "goblin"
  | "runt"
  | "raider"
  | "chief"
  | "darkelf"
  | "pirate"
  | "gunner"
  | "captain";

export type PackEnemy = Exclude<EnemyId, "dragon" | "absence" | "goblin" | "darkelf">;

export type CombatPhase = "player" | "enemy" | "won" | "lost";
export type CombatMove = "quick" | "power";
export const MAX_STAMINA = 3;

export type Splat = number | "miss" | "heal";

export type CombatState = {
  id: number;
  name: string;
  islandTarget?: { isleId: string; targetId: string; boss: boolean };
  round: number;
  autoAttack: boolean;
  guarding: boolean;
  stamina: number;
  counterReady: boolean;
  enemyIntent: EnemyIntent;
  rewardCoins: number;
  loot: { coins: number; bones: number } | null;
  pacified: boolean;
  enemyId: EnemyId;
  enemyHp: number;
  enemyMax: number;
  enemyDmg: number;
  enemyDef: number;
  playerHp: number;
  playerMax: number;
  phase: CombatPhase;
  log: string;
  shake: number;
  packId?: string;
  raidId?: string;
  atX: number;
  atY: number;
  striking: boolean;
  foeSwing: boolean;
  splatOnEnemy: Splat | null;
  splatOnPlayer: Splat | null;
  sessionXp: Record<SkillId, number>;
  lastXp: Partial<Record<SkillId, number>>;
};

export { ENEMIES };

export type EnemyIntent = { label: string; kind: "strike" | "heavy" | "fire"; bonus: number; accuracy: number };

export function enemyIntentFor(id: EnemyId, round: number): EnemyIntent {
  const behaviour = ENEMY_BEHAVIOUR[id];
  if (round % 3 === 0 && behaviour.special) return { ...behaviour.special, accuracy: 0.95 };
  return { label: behaviour.attack, kind: "strike", bonus: 0, accuracy: behaviour.accuracy };
}

let encounterId = 0;

export const PLAYER_MAX_HP = 10;

export function scaleEnemy(id: EnemyId, skills: Skills) {
  const base = ENEMIES[id];
  const cmb = combatLevel(skills);
  const grow = Math.min(12, Math.max(0, cmb - base.area));
  const f = 1 + grow * 0.08;
  return {
    hp: Math.max(3, Math.round(base.hp * f)),
    dmg: Math.max(1, Math.round(base.dmg * (1 + grow * 0.05))),
    def: Math.max(1, Math.round(base.def * (1 + grow * 0.06))),
    coins: Math.round(base.coins * (1 + grow * 0.04)),
  };
}

export function patrolEnemy(wildWins: number): EnemyId {
  if (wildWins <= 0) return Math.random() < 0.7 ? "rat" : "sprite";
  if (wildWins === 1) return Math.random() < 0.55 ? "sprite" : "crab";
  if (wildWins >= 6) return Math.random() < 0.35 ? "wyrmling" : Math.random() < 0.5 ? "boar" : "sprite";
  if (wildWins >= 3) return Math.random() < 0.5 ? "boar" : "sprite";
  return Math.random() < 0.6 ? "sprite" : "rat";
}

export function roll(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function emptySessionXp(): Record<SkillId, number> {
  return Object.fromEntries(SKILL_IDS.map((id) => [id, 0])) as Record<SkillId, number>;
}

export function raidKindForHall(townHallLevel: number): "goblin" | "darkelf" {
  const goblinChance =
    townHallLevel <= 1 ? 0.95 : townHallLevel === 2 ? 0.88 : townHallLevel === 3 ? 0.7 : townHallLevel === 4 ? 0.5 : 0.35;
  return Math.random() < goblinChance ? "goblin" : "darkelf";
}

export function makeCombat(
  enemyId: EnemyId,
  playerHp: number,
  extra?: {
    packId?: string;
    raidId?: string;
    name?: string;
    playerMax?: number;
    atX?: number;
    atY?: number;
    skills?: Skills;
    stats?: { hp: number; dmg: number; def: number; coins: number };
    islandTarget?: { isleId: string; targetId: string; boss: boolean };
  },
): CombatState {
  const e = ENEMIES[enemyId];
  const scaled = extra?.stats ?? (
    enemyId === "runt"
      ? { hp: 3, dmg: 1, def: 0, coins: e.coins }
      : extra?.skills
        ? scaleEnemy(enemyId, extra.skills)
        : { hp: e.hp, dmg: e.dmg, def: e.def, coins: e.coins });
  const label = extra?.name ?? e.name;
  const playerMax = extra?.playerMax ?? Math.max(PLAYER_MAX_HP, playerHp);
  return {
    id: ++encounterId,
    name: label,
    islandTarget: extra?.islandTarget,
    round: 1,
    autoAttack: false,
    guarding: false,
    stamina: MAX_STAMINA,
    counterReady: false,
    enemyIntent: enemyIntentFor(enemyId, 1),
    rewardCoins: scaled.coins,
    loot: null,
    pacified: false,
    enemyId,
    enemyHp: scaled.hp,
    enemyMax: scaled.hp,
    enemyDmg: scaled.dmg,
    enemyDef: scaled.def,
    playerHp: Math.min(playerHp, playerMax),
    playerMax,
    phase: "player",
    log: `${label} squares up.`,
    shake: 0,
    packId: extra?.packId,
    raidId: extra?.raidId,
    atX: extra?.atX ?? 0,
    atY: extra?.atY ?? 0,
    striking: false,
    foeSwing: false,
    splatOnEnemy: null,
    splatOnPlayer: null,
    sessionXp: emptySessionXp(),
    lastXp: {},
  };
}
