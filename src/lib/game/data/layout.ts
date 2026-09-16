export type SlotKind =
  | "cottage"
  | "garden"
  | "village"
  | "shop"
  | "woodlot"
  | "spawn"
  | "ridge";

export type MapSlot = {
  id: string;
  kind: SlotKind;
  pos: [number, number, number];
  /** Yaw in radians, optional facing */
  rot?: number;
};

export const MAP_SLOTS: MapSlot[] = [
  { id: "cottage", kind: "cottage", pos: [0, 0, 0], rot: 0 },
  { id: "garden_bed_a", kind: "garden", pos: [5, 0, -4] },
  { id: "garden_bed_b", kind: "garden", pos: [7, 0, -4] },
  { id: "garden_bed_c", kind: "garden", pos: [5, 0, -6] },
  { id: "garden_bed_d", kind: "garden", pos: [7, 0, -6] },
  { id: "garden_coop", kind: "garden", pos: [9, 0, -5] },
  { id: "lane_0", kind: "village", pos: [0, 0, 6] },
  { id: "lane_1", kind: "village", pos: [0, 0, 9] },
  { id: "lane_2", kind: "village", pos: [0, 0, 12] },
  { id: "lane_3", kind: "village", pos: [0, 0, 15] },
  { id: "shop_hats", kind: "shop", pos: [-4, 0, 8], rot: Math.PI / 2 },
  { id: "shop_house", kind: "shop", pos: [4, 0, 8], rot: -Math.PI / 2 },
  { id: "woodlot", kind: "woodlot", pos: [13, 0, -2] },
  { id: "player_spawn", kind: "spawn", pos: [1.5, 0, 2] },
  { id: "pack_rats_a", kind: "spawn", pos: [11, 0, 4] },
  { id: "pack_rats_b", kind: "spawn", pos: [15, 0, 1] },
  { id: "dragon_ridge", kind: "ridge", pos: [-10, 2.5, -14] },
];

export function slotsOf(kind: SlotKind): MapSlot[] {
  return MAP_SLOTS.filter((s) => s.kind === kind);
}

export function slotById(id: string): MapSlot | undefined {
  return MAP_SLOTS.find((s) => s.id === id);
}

/** How many village lane slots are unlocked at this growth score */
export function unlockedLaneSlots(growth: number): MapSlot[] {
  const lanes = slotsOf("village");
  const n = Math.min(lanes.length, 1 + Math.floor(growth / 4));
  return lanes.slice(0, n);
}
