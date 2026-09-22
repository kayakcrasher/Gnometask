import type { EnemyId } from "./combat";
import type { BuildingId, InteriorId, PlaceId, PopupKind } from "./types";

export type Hotspot = {
  id: string;
  x: number;
  y: number;
  r: number;
  label: string;
  kind: PopupKind;
  place?: PlaceId;
  npcId?: string;
  interior?: InteriorId;
  enemyId?: EnemyId;
  packId?: string;
  building?: BuildingId;
};

export { HAVEN_ORIGIN, NPCS, TOWN_SHOPS, TOWN_SQUARE } from "./data/npcs";

export function havenLevel(villageCount: number, daysPlayed: number, wildWins: number, totalLvl = 13) {
  return Math.max(0, Math.min(5, Math.floor((villageCount + daysPlayed + Math.floor(wildWins / 2) + Math.max(0, totalLvl - 13)) / 3)));
}

export function fortBonus(fortLevel: number) {
  return fortLevel * 2;
}

export function guardBonus(guardLevel: number) {
  return guardLevel * 3;
}

export const HALL_COST = [0, 0, 80, 160, 280, 420];

export function hallUnlocks(level: number) {
  if (level >= 4) return "Adamant in the armory. Goblins bring friends.";
  if (level >= 3) return "Steel unlocked. Dark elves start sniffing the tide.";
  if (level >= 2) return "Iron unlocked. The green ones still come in packs.";
  return "Bronze and a stick. Green goblins at the dock.";
}
