import type { GameSave } from "../types";
import { writeSave } from "../save";
import { applyXp, type SkillId, type Skills } from "../xp";
import { pickStartingQuests } from "../quests";
import type { GameState, StoreGet } from "./types";

let saveTimer: ReturnType<typeof setTimeout> | null = null;
export let combatTimer: ReturnType<typeof setTimeout> | null = null;
export let leaveBound = false;
export function markLeaveBound() {
  leaveBound = true;
}

export function clearCombatTimer() {
  if (combatTimer) {
    clearTimeout(combatTimer);
    combatTimer = null;
  }
}

export function setCombatTimer(fn: () => void, delay: number) {
  clearCombatTimer();
  combatTimer = setTimeout(() => {
    combatTimer = null;
    fn();
  }, delay);
}

export function armAutoAttack(get: StoreGet, delay: number) {
  setCombatTimer(() => {
    const c = get().combat;
    if (!c || c.phase !== "player") return;
    get().combatAttack();
  }, delay);
}

export function snap(s: GameSave): GameSave {
  return {
    version: s.version,
    gnomeName: s.gnomeName,
    named: s.named,
    hat: s.hat,
    coins: s.coins,
    streak: s.streak,
    lastCompletedDate: s.lastCompletedDate,
    lastVisitDate: s.lastVisitDate,
    tasks: s.tasks,
    ownedHats: s.ownedHats,
    houseUpgrades: s.houseUpgrades,
    inventory: s.inventory,
    placed: s.placed,
    milestonesReached: s.milestonesReached,
    perfectBonusOn: s.perfectBonusOn,
    honey: s.honey,
    bread: s.bread,
    ownedGear: s.ownedGear,
    equipment: s.equipment,
    wildWins: s.wildWins,
    hp: s.hp,
    gnomeX: s.gnomeX,
    gnomeY: s.gnomeY,
    lifeDragon: s.lifeDragon,
    absencePending: s.absencePending,
    absenceDefeatedOn: s.absenceDefeatedOn,
    buildingHp: s.buildingHp,
    fortLevel: s.fortLevel,
    guardLevel: s.guardLevel,
    daysPlayed: s.daysPlayed,
    emberGifts: s.emberGifts,
    skills: s.skills,
    quests: s.quests,
    chicken: s.chicken,
    chickenHeld: s.chickenHeld,
    pieHeld: s.pieHeld,
    woodsGreeted: s.woodsGreeted,
    townHallLevel: s.townHallLevel,
    logs: s.logs,
    trees: s.trees,
  };
}

export function scheduleWrite(get: StoreGet) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => writeSave(snap(get())), 120);
}

export function withXp(skills: Skills, grants: Partial<Record<SkillId, number>>) {
  let next = skills;
  let ding: string | null = null;
  (Object.keys(grants) as SkillId[]).forEach((id) => {
    const amt = grants[id];
    if (!amt) return;
    const r = applyXp(next, id, amt);
    next = r.skills;
    if (r.ding) ding = r.ding;
  });
  return { skills: next, ding };
}

export function seedQuests(s: Pick<GameSave, "quests" | "chicken">) {
  const quests = s.quests.length ? s.quests : pickStartingQuests();
  const needsChicken = quests.some((q) => q.id === "lost-chicken" && q.stage !== "done");
  const chicken = s.chicken ?? (needsChicken ? { x: 280, y: 780 } : null);
  return { quests, chicken };
}

export function foodCount(s: GameSave) {
  return s.honey + s.bread;
}

export const UI_SEED: Pick<
  GameState,
  | "hydrated"
  | "selectedPlace"
  | "hoverPlace"
  | "metric"
  | "panel"
  | "placingId"
  | "bounceKey"
  | "coinPopKey"
  | "combat"
  | "clearedPack"
  | "popup"
  | "interior"
  | "raids"
  | "followWalk"
  | "praying"
> = {
  hydrated: false,
  selectedPlace: null,
  hoverPlace: null,
  metric: "care",
  panel: "place",
  placingId: null,
  bounceKey: 0,
  coinPopKey: 0,
  combat: null,
  clearedPack: [],
  popup: null,
  interior: null,
  raids: [],
  followWalk: true,
  praying: false,
};
