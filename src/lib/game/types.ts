import type { QuestSave } from "./quests";
import type { SkillId, Skills } from "./xp";
import type { TreeStage } from "./data/trees";

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
  | "haven";

export type PanelId = "place" | "chores" | "inventory" | "menu";

export type InteriorId =
  | "cottage"
  | "hatshop"
  | "armory"
  | "bakery"
  | "general"
  | "haven-shop"
  | "townhall";

export type DragonLook = "ember" | "moss" | "night" | "gold";
export type DragonHorn = "short" | "long" | "crown";
export type LifeDragonState = "lurking" | "raiding" | "soothed" | "defeated";

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
};

export type PopupKind = "npc" | "building" | "enemy" | "place" | "dragon" | "raid" | "quest" | "tree" | "boat";

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
  slotPrefix?: "g" | "gf" | "v";
  slot?: EquipSlot;
  atk?: number;
  def?: number;
  heal?: number;
  wc?: number;
  farm?: number;
  fortLevel?: number;
  reqSkill?: SkillId;
  reqLevel?: number;
  reqHall?: number;
};

export type TreeSave = {
  stage: TreeStage;
  choppedAt: number;
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
  inventory: string[];
  placed: PlacedItem[];
  milestonesReached: number[];
  perfectBonusOn: string | null;
  honey: number;
  bread: number;
  logs: number;
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
  chicken: { x: number; y: number } | null;
  chickenHeld: boolean;
  pieHeld: boolean;
  woodsGreeted: boolean;
  trees: Record<string, TreeSave>;
};

export type GameUi = {
  hydrated: boolean;
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
};

export { BUILDING_MAX, METRICS, PLACES, PLAYER_START } from "./data/places";
