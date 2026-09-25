import type { DayPhase } from "./data/daynight";
import type { PlotSave } from "./data/crops";
import type { QuestSave } from "./quests";
import type { SkillId, Skills } from "./xp";
import type { TreeStage } from "./data/trees";
import type { Settler } from "./data/folk";
import type { CivicState } from "./data/civic";

export type PlaceId =
  | "cottage"
  | "garden"
  | "shop"
  | "village"
  | "pond"
  | "woods"
  | "wildlands"
  | "mines"
  | "ruins"
  | "dock"
  | "haven";

export type MetricId = "care" | "bloom" | "prosperity";

export type ShopKind =
  | "hat"
  | "house"
  | "garden"
  | "village"
  | "weapon"
  | "shield"
  | "armor"
  | "tool"
  | "food"
  | "fort"
  | "tower"
  | "haven";

export type PanelId = "place" | "chores" | "inventory" | "menu";

export type InteriorId =
  | "cottage"
  | "hatshop"
  | "armory"
  | "bakery"
  | "general"
  | "haven-shop"
  | "townhall"
  | "watch"
  | "bank"
  | "dockhouse"
  | "casino"
  | "exchange"
  | "court"
  | "pub"
  | "chart";

export type DragonLook = "ember" | "moss" | "night" | "gold";
export type DragonHorn = "short" | "long" | "crown";
export type LifeDragonState = "lurking" | "raiding" | "soothed" | "defeated";

export type CombatStyle = "attack" | "strength" | "defence";

export type EquipSlot = "weapon" | "shield" | "armor" | "tool";

export type Equipment = {
  weapon: string | null;
  shield: string | null;
  armor: string | null;
  tool: string | null;
};

export type BuildingId = "cottage" | "village" | "haven";

export type LifeDragon = {
  name: string;
  look: DragonLook;
  horn: DragonHorn;
  state: LifeDragonState;
  hp: number;
};

export type RaidKind = "goblin" | "darkelf";

export type Raid = {
  id: string;
  kind: RaidKind;
  x: number;
  y: number;
  hp: number;
  swarm?: boolean;
};

export type Loan = { boat: string; owed: number };

export type LandingGoblin = {
  id: string;
  x: number;
  y: number;
  alive: boolean;
};

export type GoblinLanding = {
  tribe: string;
  boatX: number;
  boatY: number;
  newsTold: boolean;
  flagHp: number;
  flagDown: boolean;
  goblins: LandingGoblin[];
};

export type LootFlash = {
  id: number;
  x: number;
  y: number;
  bones: number;
  coins: number;
};

export type PopupKind = "npc" | "building" | "enemy" | "place" | "dragon" | "raid" | "quest" | "tree" | "boat" | "tower" | "flag" | "fish" | "plot";

export type GamePopup = {
  kind: PopupKind;
  hotspotId: string;
  title: string;
  blurb: string;
  place?: PlaceId;
  npcId?: string;
  interior?: InteriorId;
  enemyId?: string;
  packId?: string;
  raidId?: string;
  building?: BuildingId;
  treeId?: string;
  x?: number;
  y?: number;
};

export type Task = {
  id: string;
  text: string;
  done: boolean;
  builtin: boolean;
  location: PlaceId;
  createdOn: string;
  doneOn?: string;
  builtinKey?: string;
};

export type PlacedItem = {
  id: string;
  catalogId: string;
  slotId: string;
};

export type CatalogItem = {
  id: string;
  name: string;
  blurb: string;
  price: number;
  kind: ShopKind;
  slotPrefix?: "g" | "gf" | "v" | "t" | "f";
  slot?: EquipSlot;
  atk?: number;
  def?: number;
  heal?: number;
  wc?: number;
  farm?: number;
  fish?: number;
  fortLevel?: number;
  towerRank?: number;
  reqSkill?: SkillId;
  reqLevel?: number;
  reqHall?: number;
  reqWealth?: number;
};

export type TreeSave = {
  stage: TreeStage;
  choppedAt: number;
};

export type FishingCast = {
  id: number;
  started: number;
  where: "shore" | "sea";
  fishId: string;
  color: string;
  shadow: string;
  x: number;
  y: number;
};

export type GameSave = {
  version: number;
  gnomeName: string;
  named: boolean;
  hat: string;
  coins: number;
  streak: number;
  lastCompletedDate: string | null;
  lastVisitDate: string;
  tasks: Task[];
  ownedHats: string[];
  houseUpgrades: string[];
  cottageLevel: number;
  /** Number of enemy flags planted across all islands. */
  flagsPlanted: number;
  /** Per-isle: how many times cleared, and the day of the last raid. */
  isles: Record<string, { cleared: number; lastRaidedDay: number }>;
  inventory: string[];
  placed: PlacedItem[];
  milestonesReached: number[];
  perfectBonusOn: string | null;
  honey: number;
  bread: number;
  logs: number;
  saplings: number;
  deeds: string[];
  shares: Record<string, number>;
  waveDay: number;
  bones: number;
  fishBag: Record<string, number>;
  tank: Record<string, number>;
  boatRank: number;
  plots: Record<string, PlotSave>;
  seeds: Record<string, number>;
  produce: Record<string, number>;
  respect: number;
  chart: boolean;
  surrendered: boolean;
  loan: Loan | null;
  claimed: string[];
  hulls: string[];
  settlers: Settler[];
  supplyDay: number;
  supplyTaken: boolean;
  newcomer: string | null;
  flotsam: string[];
  goods: Record<string, number>;
  herd: {
    cows: number;
    goats: number;
    sheep: number;
    calves: number;
    coop: number;
    milkDay: number;
    eggDay: number;
    woolDay: number;
    shipped: number;
  };
  expedition: { stake: number; due: number } | null;
  muckRaiders: boolean[];
  ownedGear: string[];
  equipment: Equipment;
  wildWins: number;
  hp: number;
  gnomeX: number;
  gnomeY: number;
  lifeDragon: LifeDragon;
  absencePending: boolean;
  absenceDefeatedOn: string | null;
  buildingHp: Record<BuildingId, number>;
  fortLevel: number;
  guardLevel: number;
  townHallLevel: number;
  daysPlayed: number;
  emberGifts: number;
  skills: Skills;
  quests: QuestSave[];
  bonds: Record<string, number>;
  chicken: { x: number; y: number } | null;
  chickenHeld: boolean;
  pieHeld: boolean;
  woodsGreeted: boolean;
  trees: Record<string, TreeSave>;
  landing: GoblinLanding | null;
  combatStyle: CombatStyle;
  /** 0 unused, 1–4 Pappy's lessons, 5 finished. */
  coach: number;
  afloat: string | null;
  cannons: boolean;
  civic: CivicState;
};

export type GameUi = {
  hydrated: boolean;
  atHome: boolean;
  selectedPlace: PlaceId | null;
  hoverPlace: PlaceId | null;
  metric: MetricId;
  panel: PanelId;
  placingId: string | null;
  speech: string;
  bounceKey: number;
  coinPopKey: number;
  clearedPack: string[];
  popup: GamePopup | null;
  interior: InteriorId | null;
  raids: Raid[];
  followWalk: boolean;
  praying: boolean;
  lootFlash: LootFlash | null;
  fishing: FishingCast | null;
  dayPhase: DayPhase;
  abroad: "mucktooth" | "reed" | "salt" | "holm" | null;
};

export { BUILDING_MAX, METRICS, PLACES, PLAYER_START } from "./data/places";
