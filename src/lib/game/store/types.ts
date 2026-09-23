import type { StoreApi } from "zustand";
import type { CropId } from "../data/crops";
import type { CombatState, EnemyId } from "../combat";
import type {
  BuildingId,
  DragonHorn,
  DragonLook,
  GamePopup,
  GameSave,
  GameUi,
  InteriorId,
  MetricId,
  PanelId,
  PlaceId,
  CombatStyle,
} from "../types";

export type GameState = GameSave &
  GameUi & {
    combat: CombatState | null;
    hydrate: () => void;
    persist: () => void;
    setName: (name: string) => void;
    continueGame: () => void;
    beginGame: (name: string) => void;
    goHome: () => void;
    setDragonLook: (patch: Partial<{ name: string; look: DragonLook; horn: DragonHorn }>) => void;
    newLifeDragon: () => void;
    selectPlace: (place: PlaceId | null) => void;
    setHover: (place: PlaceId | null) => void;
    setMetric: (metric: MetricId) => void;
    setPanel: (panel: PanelId) => void;
    openPopup: (popup: GamePopup) => void;
    closePopup: () => void;
    enterInterior: (id: InteriorId) => void;
    leaveInterior: () => void;
    setGnomePos: (x: number, y: number) => void;
    setFollowWalk: (on: boolean) => void;
    setPraying: (on: boolean) => void;
    chopTree: (treeId: string) => void;
    sailTo: (dest: "haven" | "dock", boatId?: string) => void;
    buyBoat: (id: string) => void;
    castLine: (where: "shore" | "sea", x: number, y: number, boatId?: string) => void;
    sellFish: (id: string) => void;
    stockFish: (id: string) => void;
    plantPlot: (plotId: string, cropId: CropId) => void;
    waterPlot: (plotId: string) => void;
    harvestPlot: (plotId: string) => void;
    clearPlot: (plotId: string) => void;
    buySeed: (cropId: CropId) => void;
    sellProduce: (cropId: CropId) => void;
    sailChart: () => void;
    leaveIsle: () => void;
    startIsleFight: (which: "chief" | number) => void;
    claimTile: (id: string) => void;
    takeLoan: (boat: string) => void;
    repayLoan: () => void;
    speak: (text: string, bounce?: boolean) => void;
    addTask: (text: string, location?: PlaceId) => void;
    toggleTask: (id: string) => void;
    deleteTask: (id: string) => void;
    buy: (catalogId: string) => boolean;
    startPlacing: (catalogId: string) => void;
    placeAt: (slotId: string) => boolean;
    cancelPlace: () => void;
    equipHat: (id: string) => void;
    equipGear: (id: string) => void;
    repairBuilding: (id: BuildingId) => void;
    upgradeGuard: () => void;
    upgradeHall: () => void;
    upgradeTower: (slotId: string) => void;
    rallyWalls: () => void;
    startPatrol: (place?: PlaceId) => void;
    startDragon: (which?: "dragon" | "absence") => void;
    startCreature: (packId: string, enemyId: EnemyId) => void;
    startRaidFight: (raidId: string) => void;
    startLandingFight: (goblinId: string) => void;
    strikeFlag: () => void;
    sipTea: () => void;
    sootheDragon: () => void;
    tickWorld: () => void;
    talkTo: (npcId: string) => void;
    tradeWith: (npcId: string) => void;
    pickChicken: () => void;
    greetMushrooms: () => void;
    combatAttack: () => void;
    combatEat: () => void;
    combatFlee: () => void;
    combatEnd: () => void;
    setCombatStyle: (style: CombatStyle) => void;
  };

export type StoreGet = StoreApi<GameState>["getState"];
export type StoreSet = StoreApi<GameState>["setState"];
