import { localDate, yesterdayDate } from "@/lib/utils";
import { maxHitpoints } from "./xp";
import { defaultSkills } from "./xp";
import { makeBuiltinTasks } from "./catalog";
import { BUILDING_MAX, PLAYER_START, type BuildingId, type GameSave, type Task } from "./types";
import type { Skills } from "./xp";
import type { QuestSave } from "./quests";
import { nextNewcomer, supplyDue } from "./data/supply";
import { growFolk, type Settler } from "./data/folk";
import { coerceCivic, seedCivic, stepCivic } from "./data/civic";
import { dailyRoadTax } from "./data/country";
import { totalDividend } from "./data/market";
import type { GoblinLanding, LandingGoblin } from "./types";

export const SAVE_KEY = "gnome-tasks:v2";
export const SAVE_VERSION = 10;

function daysBetween(from: string, to: string) {
  const a = Date.parse(`${from}T00:00:00`);
  const b = Date.parse(`${to}T00:00:00`);
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.round((b - a) / 86400000);
}

export function defaultSave(): GameSave {
  const today = localDate();
  const skills = defaultSkills();
  return {
    version: SAVE_VERSION,
    gnomeName: "",
    named: false,
    hat: "hat-berry",
    coins: 16,
    streak: 0,
    lastCompletedDate: null,
    lastVisitDate: today,
    tasks: makeBuiltinTasks(today),
    ownedHats: ["hat-berry"],
    houseUpgrades: [],
    cottageLevel: 0,
    flagsPlanted: 0,
    clarionReads: 0,
    isles: {},
    inventory: [],
    placed: [],
    milestonesReached: [],
    perfectBonusOn: null,
    honey: 1,
    bread: 2,
    ownedGear: ["weapon-stick", "hatchet-wood", "hoe-wood", "rod-wood", "pail-wood"],
    equipment: { weapon: "weapon-stick", shield: null, armor: null, tool: "hoe-wood" },
    wildWins: 0,
    hp: maxHitpoints(skills),
    gnomeX: PLAYER_START.x,
    gnomeY: PLAYER_START.y,
    lifeDragon: {
      name: "Ember",
      look: "ember",
      horn: "long",
      state: "lurking",
      hp: 80,
    },
    absencePending: false,
    absenceDefeatedOn: null,
    buildingHp: { cottage: BUILDING_MAX.cottage, village: BUILDING_MAX.village, haven: BUILDING_MAX.haven },
    fortLevel: 0,
    guardLevel: 0,
    townHallLevel: 1,
    daysPlayed: 1,
    emberGifts: 0,
    skills,
    quests: [],
    chicken: null,
    chickenHeld: false,
    pieHeld: false,
    woodsGreeted: false,
    logs: 0,
    saplings: 0,
    deeds: [],
    shares: {},
    waveDay: 0,
    bones: 0,
    fishBag: {},
    tank: {},
    boatRank: 1,
    plots: {},
    seeds: { carrot: 2 },
    produce: {},
    respect: 0,
    chart: false,
    surrendered: false,
    loan: null,
    claimed: [],
    hulls: [],
    settlers: [],
    supplyDay: 1,
    supplyTaken: false,
    newcomer: "Tansy",
    flotsam: [],
    goods: {},
    herd: { cows: 0, goats: 0, sheep: 0, calves: 0, coop: 0, milkDay: 0, eggDay: 0, woolDay: 0, shipped: 0 },
    expedition: null,
    muckRaiders: [true, true, true],
    trees: {},
    landing: null,
    combatStyle: "attack",
    coach: 5,
    afloat: null,
    cannons: false,
    civic: seedCivic(1),
  };
}

function asLoan(raw: unknown): import("./types").Loan | null {
  if (!raw || typeof raw !== "object") return null;
  const loan = raw as { boat?: unknown; owed?: unknown };
  if (typeof loan.boat !== "string" || typeof loan.owed !== "number") return null;
  return { boat: loan.boat, owed: Math.max(0, Math.floor(loan.owed)) };
}

function asRaiders(raw: unknown): boolean[] {
  if (!Array.isArray(raw) || raw.length !== 3) return [true, true, true];
  return raw.map((v) => v !== false);
}

function asPlots(raw: unknown): Record<string, import("./data/crops").PlotSave> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, import("./data/crops").PlotSave> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!value || typeof value !== "object") continue;
    const v = value as { crop?: unknown; plantedAt?: unknown; wateredAt?: unknown };
    if (v.crop !== "carrot" && v.crop !== "turnip" && v.crop !== "cabbage" && v.crop !== "pumpkin") continue;
    if (typeof v.plantedAt !== "number") continue;
    out[key] = {
      crop: v.crop,
      plantedAt: v.plantedAt,
      wateredAt: typeof v.wateredAt === "number" ? v.wateredAt : null,
    };
  }
  return out;
}

function asFishBag(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, number> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === "number" && value > 0) out[key] = Math.floor(value);
  }
  return out;
}

function asStringArray(v: unknown, fallback: string[]) {
  return Array.isArray(v) ? v.filter((x) => typeof x === "string") : fallback;
}

function asSkills(raw: unknown): Skills {
  const base = defaultSkills();
  if (!raw || typeof raw !== "object") return base;
  const s = raw as Partial<Skills>;
  return {
    attack: typeof s.attack === "number" ? s.attack : base.attack,
    strength: typeof s.strength === "number" ? s.strength : base.strength,
    defence: typeof s.defence === "number" ? s.defence : base.defence,
    hitpoints: typeof s.hitpoints === "number" ? s.hitpoints : base.hitpoints,
    crafting: typeof s.crafting === "number" ? s.crafting : base.crafting,
    woodcutting: typeof s.woodcutting === "number" ? s.woodcutting : base.woodcutting,
    farming: typeof s.farming === "number" ? s.farming : base.farming,
    prayer: typeof s.prayer === "number" ? s.prayer : base.prayer,
    barter: typeof s.barter === "number" ? s.barter : base.barter,
    sailing: typeof s.sailing === "number" ? s.sailing : base.sailing,
    fishing: typeof s.fishing === "number" ? s.fishing : base.fishing,
  };
}

function asQuests(raw: unknown): QuestSave[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((q) => {
      if (!q || typeof q !== "object") return null;
      const id = (q as QuestSave).id;
      const stage = (q as QuestSave).stage;
      if (typeof id !== "string") return null;
      if (stage !== "active" && stage !== "ready" && stage !== "done") return null;
      return { id, stage };
    })
    .filter((q): q is QuestSave => Boolean(q));
}

function asLanding(raw: unknown): GoblinLanding | null {
  if (!raw || typeof raw !== "object") return null;
  const l = raw as Partial<GoblinLanding>;
  if (typeof l.tribe !== "string" || typeof l.boatX !== "number" || typeof l.boatY !== "number") return null;
  if (!Array.isArray(l.goblins)) return null;
  const goblins: LandingGoblin[] = l.goblins
    .map((g) => {
      if (!g || typeof g !== "object") return null;
      if (typeof g.id !== "string" || typeof g.x !== "number" || typeof g.y !== "number") return null;
      return { id: g.id, x: g.x, y: g.y, alive: Boolean(g.alive) };
    })
    .filter((g): g is LandingGoblin => Boolean(g));
  if (!goblins.length) return null;
  return {
    tribe: l.tribe,
    boatX: l.boatX,
    boatY: l.boatY,
    newsTold: Boolean(l.newsTold),
    flagHp: l.flagDown ? 0 : typeof l.flagHp === "number" ? l.flagHp : 10,
    flagDown: Boolean(l.flagDown),
    goblins,
  };
}

export function migrate(raw: unknown): GameSave {
  const base = defaultSave();
  if (!raw || typeof raw !== "object") return base;
  const s = raw as Partial<GameSave> & { dragonState?: string; ownedGear?: string[] };
  const oldGear = asStringArray(s.ownedGear, []);
  const ownedGear = oldGear
    .map((id) => {
      if (id === "weapon-mithril") return "weapon-adamant";
      if (id === "shield-mithril") return "shield-adamant";
      if (id === "armor-mithril") return "armor-adamant";
      if (id === "gear-hoe") return "hoe-wood";
      if (id === "gear-shield") return "shield-wood";
      if (id === "gear-honey") return "food-honey";
      return id;
    })
    .filter((id, i, arr) => arr.indexOf(id) === i);

  if (!ownedGear.includes("weapon-stick")) ownedGear.unshift("weapon-stick");
  if (!ownedGear.includes("hatchet-wood")) ownedGear.push("hatchet-wood");
  if (!ownedGear.includes("hoe-wood")) ownedGear.push("hoe-wood");
  if (!ownedGear.includes("rod-wood")) ownedGear.push("rod-wood");
  if (!ownedGear.includes("pail-wood")) ownedGear.push("pail-wood");

  const equipment = {
    weapon: s.equipment?.weapon ?? ownedGear.find((id) => id.startsWith("weapon-")) ?? "weapon-stick",
    shield: s.equipment?.shield ?? ownedGear.find((id) => id.startsWith("shield-")) ?? null,
    armor: s.equipment?.armor ?? ownedGear.find((id) => id.startsWith("armor-")) ?? null,
    tool: s.equipment?.tool ?? ownedGear.find((id) => id.startsWith("hoe-")) ?? "hoe-wood",
  };

  const friend = s.dragonState === "friend";
  const lifeDragon = s.lifeDragon ?? {
    name: "Ember",
    look: "ember" as const,
    horn: "long" as const,
    state: friend ? ("soothed" as const) : ("lurking" as const),
    hp: 150,
  };

  const buildingHp = s.buildingHp ?? { ...base.buildingHp };
  const hpBuild = {
    cottage: typeof buildingHp.cottage === "number" ? buildingHp.cottage : BUILDING_MAX.cottage,
    village: typeof buildingHp.village === "number" ? buildingHp.village : BUILDING_MAX.village,
    haven: typeof buildingHp.haven === "number" ? buildingHp.haven : BUILDING_MAX.haven,
  };

  const skills = asSkills(s.skills);
  const chicken =
    s.chicken && typeof s.chicken.x === "number" && typeof s.chicken.y === "number"
      ? { x: s.chicken.x, y: s.chicken.y }
      : null;

  const IRL_KEYS = new Set([
    "out-of-bed",
    "brush-teeth",
    "make-bed",
    "breakfast",
    "water-garden",
    "chop-kindling",
    "say-prayer",
    "take-dinghy",
    "good-morning",
    "village-walk",
    "coil-rope",
    "sweep-stones",
    "patrol",
    "dragon-honey",
  ]);
  const rawTasks = Array.isArray(s.tasks) ? s.tasks : base.tasks;
  const stripped = rawTasks.filter((t) => !t.builtin || !t.builtinKey || !IRL_KEYS.has(t.builtinKey));
  const tasks = (s.version ?? 0) < 9 ? stripped : rawTasks;

  return freshenSupply({
    ...base,
    ...s,
    version: SAVE_VERSION,
    named: Boolean(s.named || (s.gnomeName && s.gnomeName.length > 0)),
    tasks,
    ownedHats: asStringArray(s.ownedHats, base.ownedHats),
    houseUpgrades: asStringArray(s.houseUpgrades, []),
    cottageLevel: typeof s.cottageLevel === "number" ? Math.max(0, Math.min(3, Math.floor(s.cottageLevel))) : 0,
    flagsPlanted: typeof s.flagsPlanted === "number" ? Math.max(0, Math.floor(s.flagsPlanted)) : 0,
    clarionReads: typeof s.clarionReads === "number" ? Math.max(0, Math.floor(s.clarionReads)) : 0,
    isles: s.isles && typeof s.isles === "object" ? s.isles : {},
    inventory: asStringArray(s.inventory, []),
    placed: Array.isArray(s.placed) ? s.placed : [],
    milestonesReached: Array.isArray(s.milestonesReached) ? s.milestonesReached : [],
    honey: typeof s.honey === "number" ? s.honey : 1,
    bread: typeof s.bread === "number" ? s.bread : 0,
    ownedGear,
    equipment,
    wildWins: typeof s.wildWins === "number" ? s.wildWins : 0,
    hp: typeof s.hp === "number" ? Math.min(s.hp, maxHitpoints(skills)) : maxHitpoints(skills),
    gnomeX: typeof s.gnomeX === "number" ? s.gnomeX : PLAYER_START.x,
    gnomeY: typeof s.gnomeY === "number" ? s.gnomeY : PLAYER_START.y,
    lifeDragon,
    absencePending: Boolean(s.absencePending),
    absenceDefeatedOn: typeof s.absenceDefeatedOn === "string" ? s.absenceDefeatedOn : null,
    buildingHp: hpBuild,
    fortLevel: typeof s.fortLevel === "number" ? s.fortLevel : 0,
    guardLevel: typeof s.guardLevel === "number" ? s.guardLevel : 0,
    townHallLevel: typeof s.townHallLevel === "number" ? Math.max(1, s.townHallLevel) : 1,
    daysPlayed: typeof s.daysPlayed === "number" ? s.daysPlayed : 1,
    emberGifts: typeof s.emberGifts === "number" ? s.emberGifts : 0,
    skills,
    quests: asQuests(s.quests),
    chicken,
    chickenHeld: Boolean(s.chickenHeld),
    pieHeld: Boolean(s.pieHeld),
    woodsGreeted: Boolean(s.woodsGreeted),
    logs: typeof s.logs === "number" ? s.logs : 0,
    saplings: typeof s.saplings === "number" ? Math.max(0, Math.floor(s.saplings)) : 0,
    deeds: asStringArray(s.deeds, []),
    shares: asFishBag(s.shares),
    waveDay: typeof s.waveDay === "number" ? Math.max(0, Math.floor(s.waveDay)) : 0,
    bones: typeof s.bones === "number" ? s.bones : 0,
    fishBag: asFishBag(s.fishBag),
    tank: asFishBag(s.tank),
    boatRank: typeof s.boatRank === "number" ? Math.max(1, Math.min(5, s.boatRank)) : 1,
    plots: asPlots(s.plots),
    seeds: s.seeds == null ? { carrot: 2 } : asFishBag(s.seeds),
    produce: asFishBag(s.produce),
    respect: typeof s.respect === "number" ? Math.max(0, s.respect) : 0,
    chart: Boolean(s.chart),
    surrendered: Boolean(s.surrendered),
    loan: asLoan(s.loan),
    claimed: asStringArray(s.claimed, []),
    hulls: asStringArray(s.hulls, []),
    settlers: asSettlers(s.settlers),
    supplyDay: typeof s.supplyDay === "number" ? s.supplyDay : 0,
    supplyTaken: Boolean(s.supplyTaken),
    newcomer: typeof s.newcomer === "string" ? s.newcomer : null,
    flotsam: asStringArray(s.flotsam, []),
    goods: asFishBag(s.goods),
    herd: asHerd(s.herd),
    expedition: asExpedition(s.expedition),
    muckRaiders: asRaiders(s.muckRaiders),
    trees: s.trees && typeof s.trees === "object" ? s.trees : {},
    landing: asLanding(s.landing),
    combatStyle: s.combatStyle === "strength" || s.combatStyle === "defence" ? s.combatStyle : "attack",
    coach: typeof s.coach === "number" ? Math.max(0, Math.min(5, Math.floor(s.coach))) : 5,
    afloat: typeof s.afloat === "string" ? s.afloat : null,
    cannons: Boolean(s.cannons),
    civic: coerceCivic(s.civic, typeof s.daysPlayed === "number" ? s.daysPlayed : 1),
  });
}

function asHerd(raw: unknown): GameSave["herd"] {
  const base = { cows: 0, goats: 0, sheep: 0, calves: 0, coop: 0, milkDay: 0, eggDay: 0, woolDay: 0, shipped: 0 };
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Record<string, unknown>;
  const n = (k: keyof GameSave["herd"]) => (typeof r[k] === "number" ? Math.max(0, Math.floor(r[k] as number)) : 0);
  return {
    cows: Math.min(4, n("cows")),
    goats: Math.min(4, n("goats")),
    sheep: Math.min(4, n("sheep")),
    calves: Math.min(8, n("calves")),
    coop: Math.min(3, n("coop")),
    milkDay: n("milkDay"),
    eggDay: n("eggDay"),
    woolDay: n("woolDay"),
    shipped: n("shipped"),
  };
}

function asExpedition(raw: unknown): GameSave["expedition"] {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as { stake?: unknown; due?: unknown };
  if (typeof r.stake !== "number" || typeof r.due !== "number" || r.stake <= 0) return null;
  return { stake: Math.floor(r.stake), due: Math.floor(r.due) };
}

function asSettlers(raw: unknown): Settler[] {
  if (!Array.isArray(raw)) return [];
  const shifts = new Set(["dawn", "day", "dusk"]);
  return raw.flatMap((row) => {
    if (!row || typeof row !== "object") return [];
    const r = row as {
      name?: string;
      hat?: string;
      slotId?: string;
      arrived?: number;
      purse?: number;
      weapon?: string | null;
      stall?: string | null;
      shift?: string | null;
    };
    if (!r.name || !r.slotId) return [];
    return [
      {
        name: String(r.name),
        hat: r.hat || "hat-straw",
        slotId: String(r.slotId),
        arrived: typeof r.arrived === "number" ? Math.floor(r.arrived) : 0,
        purse: typeof r.purse === "number" ? Math.max(0, Math.floor(r.purse)) : 12,
        weapon: r.weapon ? String(r.weapon) : null,
        stall: r.stall ? String(r.stall) : null,
        shift: r.shift && shifts.has(r.shift) ? (r.shift as Settler["shift"]) : null,
      },
    ];
  });
}

export function freshenSupply(save: GameSave): GameSave {
  if (!supplyDue(save.daysPlayed)) return { ...save, newcomer: null };
  if (save.supplyDay === save.daysPlayed) return save;
  const who = nextNewcomer(
    save.daysPlayed,
    save.settlers.map((n) => n.name),
  );
  return {
    ...save,
    supplyDay: save.daysPlayed,
    supplyTaken: false,
    newcomer: who?.name ?? null,
  };
}

function withMissingBuiltins(save: GameSave, today: string): GameSave {
  const have = new Set(
    save.tasks.filter((t) => t.builtin && t.createdOn === today).map((t) => t.builtinKey),
  );
  const missing = makeBuiltinTasks(today).filter((t) => t.builtinKey && !have.has(t.builtinKey));
  if (!missing.length) return save;
  return { ...save, tasks: [...missing, ...save.tasks] };
}

export function applyDailyRollover(save: GameSave): GameSave {
  const today = localDate();
  if (save.lastVisitDate === today) {
    const grown = growFolk(withMissingBuiltins(save, today), false);
    return { ...withMissingBuiltins(save, today), settlers: grown.settlers, placed: grown.placed };
  }
  const missed = Math.max(0, daysBetween(save.lastVisitDate, today));
  const streakBroken = save.lastCompletedDate !== yesterdayDate() && save.lastCompletedDate !== today;
  const absencePending =
    missed >= 2 && save.absenceDefeatedOn !== today ? true : missed === 0 ? save.absencePending : save.absencePending;
  const raiding = Math.random() < 0.28 + Math.min(missed, 4) * 0.08;
  const scorch = raiding ? Math.max(2, 6 - save.fortLevel) : 0;
  const buildingHp = {
    cottage: Math.max(0, save.buildingHp.cottage - scorch),
    village: Math.max(0, save.buildingHp.village - scorch - (raiding ? 1 : 0)),
    haven: save.buildingHp.haven,
  };
  const rolled = freshenSupply(
    withMissingBuiltins(
    {
      ...save,
      lastVisitDate: today,
      daysPlayed: save.daysPlayed + 1,
      streak: streakBroken ? 0 : save.streak,
      tasks: [
        ...makeBuiltinTasks(today),
        ...save.tasks.filter((t) => !t.builtin),
      ],
      absencePending,
      lifeDragon:
        save.lifeDragon.state === "defeated"
          ? save.lifeDragon
          : {
              ...save.lifeDragon,
              state: raiding ? "raiding" : save.lifeDragon.state === "soothed" ? "lurking" : save.lifeDragon.state,
            },
      buildingHp,
      hp: maxHitpoints(save.skills),
      coins: save.coins + dailyRoadTax(),
    },
    today,
  ),
  );
  const grown = growFolk(rolled, true);
  let civic = stepCivic(rolled.civic, rolled.daysPlayed);
  const extra = Math.min(2, Math.max(0, missed - 1));
  for (let i = 0; i < extra; i++) civic = stepCivic(civic, rolled.daysPlayed);
  const dividend = totalDividend(rolled.daysPlayed, rolled.shares);
    return { ...rolled, coins: rolled.coins + grown.wage + dividend, settlers: grown.settlers, placed: grown.placed, civic };
}

export function loadSave(): GameSave {
  if (typeof window === "undefined") return defaultSave();
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return defaultSave();
    return migrate(JSON.parse(raw) as unknown);
  } catch {
    return defaultSave();
  }
}

export function writeSave(save: GameSave) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch {
    /* quota */
  }
}
