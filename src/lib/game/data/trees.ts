export type TreeKind = "oak" | "pine" | "thin";
export type TreeStage = "grown" | "stump" | "sapling";

export type TreeModel =
  | "tree_oak"
  | "tree_oak_dark"
  | "tree_pineTallA"
  | "tree_pineTallA_detailed"
  | "tree_pineSmallA"
  | "tree_pineRoundA"
  | "tree_detailed"
  | "tree_thin"
  | "tree_fat"
  | "tree_tall"
  | "tree_cone"
  | "tree_simple"
  | "tree_small";

export type TreeSpot = {
  id: string;
  kind: TreeKind;
  x: number;
  y: number;
  model: TreeModel;
  scale: number;
};

export const TREE_SPOTS: TreeSpot[] = [
  { id: "t0", kind: "oak", x: 92, y: 168, model: "tree_oak", scale: 1.35 },
  { id: "t1", kind: "oak", x: 148, y: 210, model: "tree_oak_dark", scale: 1.2 },
  { id: "t2", kind: "pine", x: 54, y: 248, model: "tree_pineTallA", scale: 1.45 },
  { id: "t3", kind: "pine", x: 188, y: 126, model: "tree_pineTallA_detailed", scale: 1.5 },
  { id: "t4", kind: "thin", x: 44, y: 188, model: "tree_thin", scale: 1.25 },
  { id: "t5", kind: "oak", x: 210, y: 268, model: "tree_detailed", scale: 1.15 },
  { id: "t6", kind: "pine", x: 118, y: 318, model: "tree_pineRoundA", scale: 1.3 },
  { id: "t7", kind: "oak", x: 70, y: 360, model: "tree_fat", scale: 1.15 },
  { id: "t8", kind: "pine", x: 240, y: 180, model: "tree_pineSmallA", scale: 1.2 },
  { id: "t9", kind: "oak", x: 1480, y: 188, model: "tree_oak", scale: 1.3 },
  { id: "t10", kind: "pine", x: 1544, y: 268, model: "tree_pineTallA", scale: 1.4 },
  { id: "t11", kind: "thin", x: 1400, y: 128, model: "tree_tall", scale: 1.35 },
  { id: "t12", kind: "oak", x: 80, y: 980, model: "tree_oak_dark", scale: 1.25 },
  { id: "t13", kind: "pine", x: 40, y: 860, model: "tree_cone", scale: 1.15 },
  { id: "t14", kind: "oak", x: 2320, y: 90, model: "tree_simple", scale: 1.2 },
  { id: "t15", kind: "pine", x: 2680, y: 180, model: "tree_pineTallA_detailed", scale: 1.45 },
  { id: "t16", kind: "oak", x: 168, y: 248, model: "tree_oak", scale: 1.4 },
  { id: "t17", kind: "thin", x: 200, y: 330, model: "tree_small", scale: 1.1 },
  { id: "t18", kind: "pine", x: 280, y: 150, model: "tree_pineTallA", scale: 1.35 },
  { id: "t19", kind: "oak", x: 340, y: 210, model: "tree_oak", scale: 1.2 },
  { id: "t20", kind: "pine", x: 860, y: 560, model: "tree_pineRoundA", scale: 1.15 },
  { id: "t21", kind: "oak", x: 1140, y: 580, model: "tree_oak_dark", scale: 1.2 },
  { id: "t22", kind: "thin", x: 760, y: 640, model: "tree_thin", scale: 1.1 },
  { id: "t23", kind: "pine", x: 500, y: 260, model: "tree_pineSmallA", scale: 1.25 },
  { id: "t24", kind: "oak", x: 1680, y: 240, model: "tree_fat", scale: 1.2 },
  { id: "t25", kind: "pine", x: 1840, y: 360, model: "tree_pineTallA_detailed", scale: 1.4 },
  { id: "t26", kind: "oak", x: 720, y: 1000, model: "tree_detailed", scale: 1.15 },
  { id: "t27", kind: "pine", x: 1080, y: 1120, model: "tree_cone", scale: 1.2 },
  { id: "t28", kind: "thin", x: 1460, y: 640, model: "tree_tall", scale: 1.25 },
  { id: "t29", kind: "oak", x: 2100, y: 180, model: "tree_simple", scale: 1.2 },
];

export const TREE_GROW_MS = 48_000;
export const TREE_SAPLING_MS = 18_000;
