import { localDate, yesterdayDate } from "@/lib/utils";
import { maxHitpoints } from "./xp";
import { defaultSkills } from "./xp";
import { makeBuiltinTasks } from "./catalog";
import { BUILDING_MAX, PLAYER_START, type BuildingId, type GameSave, type Task } from "./types";
import type { Skills } from "./xp";
import type { QuestSave } from "./quests";
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
    bones: 0,
    fishBag: {},
    tank: {},
    boatRank: 1,
    plots: {},
    seeds: { carrot: 2 },
    produce: {},
    trees: {},
    landing: null,
    combatStyle: "attack",
  };
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

  return {
    ...base,
    ...s,
    version: SAVE_VERSION,
    named: Boolean(s.named || (s.gnomeName && s.gnomeName.length > 0)),
    tasks,
    ownedHats: asStringArray(s.ownedHats, base.ownedHats),
    houseUpgrades: asStringArray(s.houseUpgrades, []),
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
    bones: typeof s.bones === "number" ? s.bones : 0,
    fishBag: asFishBag(s.fishBag),
    tank: asFishBag(s.tank),
    boatRank: typeof s.boatRank === "number" ? Math.max(1, Math.min(5, s.boatRank)) : 1,
    plots: asPlots(s.plots),
    seeds: s.seeds == null ? { carrot: 2 } : asFishBag(s.seeds),
    produce: asFishBag(s.produce),
    trees: s.trees && typeof s.trees === "object" ? s.trees : {},
    landing: asLanding(s.landing),
    combatStyle: s.combatStyle === "strength" || s.combatStyle === "defence" ? s.combatStyle : "attack",
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
    return withMissingBuiltins(save, today);
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
  return withMissingBuiltins(
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
    },
    today,
  );
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
