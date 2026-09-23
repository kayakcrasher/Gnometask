import type { PackEnemy } from "../combat";
import type { PlaceId } from "../types";

export const GARDEN_SLOTS: { id: string; x: number; y: number }[] = [];
for (let row = 0; row < 4; row++) {
  for (let col = 0; col < 8; col++) {
    GARDEN_SLOTS.push({
      id: `g${row * 8 + col}`,
      x: 150 + col * 68,
      y: 640 + row * 72,
    });
  }
}

export const GARDEN_FEATURE_SLOTS: { id: string; x: number; y: number }[] = [
  { id: "gf0", x: 120, y: 600 },
  { id: "gf1", x: 700, y: 620 },
  { id: "gf2", x: 90, y: 780 },
  { id: "gf3", x: 720, y: 790 },
  { id: "gf4", x: 400, y: 590 },
  { id: "gf5", x: 560, y: 880 },
];

export const VILLAGE_SLOTS: { id: string; x: number; y: number }[] = [
  { id: "v0", x: 1124, y: 428 },
  { id: "v1", x: 1210, y: 414 },
  { id: "v2", x: 1296, y: 428 },
  { id: "v3", x: 1124, y: 548 },
  { id: "v4", x: 1210, y: 562 },
  { id: "v5", x: 1296, y: 548 },
  { id: "v6", x: 1110, y: 668 },
  { id: "v7", x: 1200, y: 682 },
  { id: "v8", x: 1290, y: 668 },
  { id: "v9", x: 1380, y: 500 },
];

export const PLACE_ANCHORS: Record<PlaceId, { x: number; y: number }> = {
  cottage: { x: 980, y: 640 },
  garden: { x: 980, y: 800 },
  shop: { x: 300, y: 540 },
  village: { x: 1200, y: 540 },
  pond: { x: 520, y: 190 },
  woods: { x: 160, y: 240 },
  wildlands: { x: 1760, y: 420 },
  mines: { x: 1380, y: 1220 },
  ruins: { x: 2360, y: 260 },
  dock: { x: 120, y: 520 },
  haven: { x: 1860, y: 760 },
};

export const WORLD_PACK: { id: string; enemy: PackEnemy; x: number; y: number; place: PlaceId }[] = [
  { id: "pack-rat", enemy: "rat", x: 460, y: 560, place: "garden" },
  { id: "pack-boar-a", enemy: "boar", x: 1560, y: 520, place: "wildlands" },
  { id: "pack-sprite", enemy: "sprite", x: 1680, y: 700, place: "wildlands" },
  { id: "pack-wyrm", enemy: "wyrmling", x: 1940, y: 480, place: "wildlands" },
  { id: "pack-boar-b", enemy: "boar", x: 1740, y: 360, place: "wildlands" },
  { id: "pack-bat-a", enemy: "bat", x: 1240, y: 1180, place: "mines" },
  { id: "pack-bat-b", enemy: "bat", x: 1520, y: 1280, place: "mines" },
  { id: "pack-cobble", enemy: "cobble", x: 2280, y: 180, place: "ruins" },
  { id: "pack-cobble-b", enemy: "cobble", x: 2500, y: 320, place: "ruins" },
  { id: "pack-crab", enemy: "crab", x: 20, y: 860, place: "dock" },
];

export const EMPTY_LOTS: { id: string; x: number; y: number }[] = [
  { id: "lot-inn", x: 430, y: 430 },
  { id: "lot-chapel", x: 500, y: 500 },
  { id: "lot-market", x: 430, y: 700 },
  { id: "lot-school", x: 510, y: 680 },
];

export const TOWER_SLOTS: { id: string; x: number; y: number }[] = [
  { id: "t0", x: 186, y: 528 },
  { id: "t1", x: 292, y: 358 },
  { id: "t2", x: 108, y: 388 },
  { id: "t3", x: 470, y: 268 },
  { id: "t4", x: 1088, y: 372 },
];

export const DRAGON_RIDGE = { x: 1760, y: 340 };
export const ABSENCE_SPOT = { x: 96, y: 430 };

export const FENCE_SLOTS: { id: string; x: number; y: number }[] = [
  { id: "f0", x: 175, y: 400 },
  { id: "f1", x: 175, y: 460 },
  { id: "f2", x: 175, y: 520 },
  { id: "f3", x: 175, y: 580 },
  { id: "f4", x: 175, y: 640 },
  { id: "f5", x: 175, y: 700 },
  { id: "f6", x: 175, y: 760 },
  { id: "f7", x: 230, y: 800 },
];

export function slotsForPrefix(prefix: "g" | "gf" | "v" | "t" | "f") {
  if (prefix === "g") return GARDEN_SLOTS;
  if (prefix === "gf") return GARDEN_FEATURE_SLOTS;
  if (prefix === "t") return TOWER_SLOTS;
  if (prefix === "f") return FENCE_SLOTS;
  return VILLAGE_SLOTS;
}
