import type { GameSave } from "../types";
import { writeSave } from "../save";
import { applyXp, type SkillId, type Skills } from "../xp";
import { pickStartingQuests } from "../quests";
import { landingCleared, makeLanding } from "../data/landing";
import type { GameState, StoreGet, StoreSet } from "./types";

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
    landing: s.landing,
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

export function seedQuests(s: Pick<GameSave, "quests" | "chicken" | "landing">) {
  let quests = s.quests.length ? [...s.quests] : pickStartingQuests();
  if (!quests.some((q) => q.id === "pappy-timber")) {
    quests = [{ id: "pappy-timber", stage: "active" }, ...quests];
  }
  if (!quests.some((q) => q.id === "pappy-expand")) {
    quests = [...quests, { id: "pappy-expand", stage: "active" }];
  }
  if (!quests.some((q) => q.id === "pappy-landing")) {
    quests = [...quests, { id: "pappy-landing", stage: "active" }];
  }
  const needsChicken = quests.some((q) => q.id === "lost-chicken" && q.stage !== "done");
  const chicken = s.chicken ?? (needsChicken ? { x: 280, y: 780 } : null);
  const landingQ = quests.find((q) => q.id === "pappy-landing");
  let landing = s.landing ?? null;
  if (landingQ && landingQ.stage !== "done") {
    landing = landing ?? makeLanding();
  }
  if (landing && landingCleared(landing) && landingQ?.stage === "active") {
    quests = quests.map((q) => (q.id === "pappy-landing" ? { ...q, stage: "ready" as const } : q));
  }
  return { quests, chicken, landing };
}

export function markPappyExpand(get: StoreGet, set: StoreSet) {
  const s = get();
  if (!s.quests.some((q) => q.id === "pappy-expand" && q.stage === "active")) return;
  set({
    quests: s.quests.map((q) =>
      q.id === "pappy-expand" && q.stage === "active" ? { ...q, stage: "ready" as const } : q,
    ),
  });
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
