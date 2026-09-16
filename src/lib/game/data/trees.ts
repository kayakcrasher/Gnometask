import { type MetalTier } from "./tiers";

export type TreeKind = "oak" | "pine" | "birch" | "apple" | "old_oak";

export type TreeSpot = {
  id: string;
  kind: TreeKind;
  name: string;
  /** World position hint for later 3D layout */
  pos: [number, number, number];
  /** Hours until a stump is a tree again */
  growHours: number;
  logs: number;
  xp: number;
  /** Minimum hatchet tier that can drop this tree */
  minTier: MetalTier;
};

export const TREE_SPOTS: TreeSpot[] = [
  {
    id: "oak_1",
    kind: "oak",
    name: "Lane oak",
    pos: [10, 0, -1],
    growHours: 8,
    logs: 2,
    xp: 12,
    minTier: "wood",
  },
  {
    id: "oak_2",
    kind: "oak",
    name: "Stoop oak",
    pos: [8, 0, 2],
    growHours: 8,
    logs: 2,
    xp: 12,
    minTier: "wood",
  },
  {
    id: "pine_1",
    kind: "pine",
    name: "Woodlot pine",
    pos: [14, 0, -4],
    growHours: 10,
    logs: 3,
    xp: 16,
    minTier: "bronze",
  },
  {
    id: "pine_2",
    kind: "pine",
    name: "Far pine",
    pos: [16, 0, -6],
    growHours: 10,
    logs: 3,
    xp: 16,
    minTier: "bronze",
  },
  {
    id: "birch_1",
    kind: "birch",
    name: "Pale birch",
    pos: [12, 0, 3],
    growHours: 6,
    logs: 1,
    xp: 8,
    minTier: "wood",
  },
  {
    id: "apple_1",
    kind: "apple",
    name: "Garden apple",
    pos: [7, 0, -5],
    growHours: 16,
    logs: 1,
    xp: 10,
    minTier: "wood",
  },
  {
    id: "old_oak_1",
    kind: "old_oak",
    name: "Ridge oak",
    pos: [-8, 0, -12],
    growHours: 24,
    logs: 5,
    xp: 30,
    minTier: "steel",
  },
];

export function treeById(id: string): TreeSpot | undefined {
  return TREE_SPOTS.find((t) => t.id === id);
}
