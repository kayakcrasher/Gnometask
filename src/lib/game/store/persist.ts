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
    saplings: s.saplings,
    deeds: s.deeds,
    shares: s.shares,
    waveDay: s.waveDay,
    bones: s.bones,
    fishBag: s.fishBag,
    tank: s.tank,
    boatRank: s.boatRank,
    plots: s.plots,
    seeds: s.seeds,
    produce: s.produce,
    respect: s.respect,
    chart: s.chart,
    surrendered: s.surrendered,
    loan: s.loan,
    claimed: s.claimed,
    hulls: s.hulls,
    settlers: s.settlers,
    supplyDay: s.supplyDay,
    supplyTaken: s.supplyTaken,
    newcomer: s.newcomer,
    flotsam: s.flotsam,
    goods: s.goods,
    herd: s.herd,
    expedition: s.expedition,
    muckRaiders: s.muckRaiders,
    trees: s.trees,
    landing: s.landing,
    combatStyle: s.combatStyle,
    coach: s.coach,
    afloat: s.afloat,
    cannons: s.cannons,
    civic: s.civic,
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
  if (landing && landingCleared(landing) && landing.flagDown && landingQ?.stage === "active") {
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

export function rememberLoot(get: StoreGet, set: StoreSet, x: number, y: number, bones: number, coins: number) {
  const s = get();
  const id = s.bounceKey + 1;
  if (typeof window !== "undefined") {
    window.setTimeout(() => {
      if (get().lootFlash?.id === id) set({ lootFlash: null });
    }, 2600);
  }
  return {
    bones: s.bones + bones,
    coins: s.coins + coins,
    coinPopKey: coins > 0 ? s.coinPopKey + 1 : s.coinPopKey,
    bounceKey: id,
    lootFlash: { id, x, y, bones, coins },
  };
}

export function foodCount(s: GameSave) {
  return s.honey + s.bread;
}

export const UI_SEED: Pick<
  GameState,
  | "hydrated"
  | "atHome"
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
  | "lootFlash"
  | "fishing"
  | "dayPhase"
  | "abroad"
> = {
  hydrated: false,
  atHome: true,
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
  lootFlash: null,
  fishing: null,
  dayPhase: "day",
  abroad: null,
};
