export type TreeKind = "oak" | "pine" | "thin";
export type TreeStage = "grown" | "stump" | "sapling" | "gone";
export type TreeSize = "medium" | "large";

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
  /** Large trees pay 5 logs. Everything else pays 3. */
  size?: TreeSize;
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
  { id: "t30", kind: "pine", x: 2460, y: 400, model: "tree_pineTallA", scale: 1.55, size: "large" },
  { id: "t31", kind: "oak", x: 2360, y: 470, model: "tree_oak", scale: 1.4, size: "large" },
  { id: "t32", kind: "pine", x: 2280, y: 540, model: "tree_pineTallA_detailed", scale: 1.45, size: "large" },
  { id: "t33", kind: "oak", x: 2520, y: 520, model: "tree_fat", scale: 1.35, size: "large" },
  { id: "t34", kind: "thin", x: 2200, y: 640, model: "tree_tall", scale: 1.2 },
  { id: "t35", kind: "pine", x: 2340, y: 680, model: "tree_pineRoundA", scale: 1.3 },
  { id: "t36", kind: "oak", x: 2140, y: 760, model: "tree_oak_dark", scale: 1.25 },
  { id: "t37", kind: "pine", x: 2420, y: 760, model: "tree_cone", scale: 1.35, size: "large" },
  { id: "t38", kind: "thin", x: 2580, y: 340, model: "tree_thin", scale: 1.15 },
  { id: "t39", kind: "oak", x: 2480, y: 280, model: "tree_detailed", scale: 1.3 },
  { id: "t40", kind: "pine", x: 1880, y: 520, model: "tree_pineTallA", scale: 1.4, size: "large" },
  { id: "t41", kind: "oak", x: 1760, y: 620, model: "tree_oak", scale: 1.2 },
  { id: "t42", kind: "pine", x: 1620, y: 480, model: "tree_pineSmallA", scale: 1.15 },
  { id: "t43", kind: "oak", x: 980, y: 280, model: "tree_oak_dark", scale: 1.25 },
  { id: "t44", kind: "pine", x: 640, y: 180, model: "tree_pineTallA_detailed", scale: 1.4, size: "large" },
  { id: "t45", kind: "thin", x: 420, y: 140, model: "tree_small", scale: 1.05 },
  { id: "t46", kind: "oak", x: 560, y: 980, model: "tree_fat", scale: 1.3 },
  { id: "t47", kind: "pine", x: 880, y: 1100, model: "tree_cone", scale: 1.35, size: "large" },
  { id: "t48", kind: "oak", x: 1240, y: 980, model: "tree_detailed", scale: 1.2 },
  { id: "t49", kind: "thin", x: 1500, y: 1100, model: "tree_tall", scale: 1.2 },
  { id: "t50", kind: "pine", x: 2000, y: 980, model: "tree_pineRoundA", scale: 1.25 },
  { id: "t51", kind: "oak", x: 360, y: 900, model: "tree_oak", scale: 1.15 },
  { id: "t52", kind: "pine", x: 300, y: 240, model: "tree_pineTallA", scale: 1.35, size: "large" },
  { id: "f1", kind: "pine", x: 760, y: 140, model: "tree_pineTallA", scale: 1.4, size: "large" },
  { id: "f2", kind: "oak", x: 920, y: 200, model: "tree_oak", scale: 1.25 },
  { id: "f3", kind: "pine", x: 1040, y: 110, model: "tree_pineTallA_detailed", scale: 1.5, size: "large" },
  { id: "f4", kind: "oak", x: 1180, y: 170, model: "tree_oak_dark", scale: 1.3 },
  { id: "f5", kind: "thin", x: 1280, y: 250, model: "tree_tall", scale: 1.2 },
  { id: "f6", kind: "pine", x: 1360, y: 120, model: "tree_pineRoundA", scale: 1.35, size: "large" },
  { id: "f7", kind: "oak", x: 1460, y: 280, model: "tree_detailed", scale: 1.15 },
  { id: "f8", kind: "pine", x: 1680, y: 140, model: "tree_pineTallA", scale: 1.45, size: "large" },
  { id: "f9", kind: "oak", x: 1780, y: 240, model: "tree_fat", scale: 1.2 },
  { id: "f10", kind: "thin", x: 1880, y: 150, model: "tree_thin", scale: 1.15 },
  { id: "f11", kind: "pine", x: 1980, y: 260, model: "tree_cone", scale: 1.3 },
  { id: "f12", kind: "oak", x: 860, y: 300, model: "tree_oak", scale: 1.2 },
  { id: "f13", kind: "pine", x: 1120, y: 320, model: "tree_pineSmallA", scale: 1.2 },
  { id: "f14", kind: "oak", x: 1580, y: 360, model: "tree_oak_dark", scale: 1.25 },
  { id: "f15", kind: "pine", x: 2060, y: 140, model: "tree_pineTallA_detailed", scale: 1.4, size: "large" },
  { id: "f16", kind: "thin", x: 680, y: 220, model: "tree_small", scale: 1.1 },
  { id: "f17", kind: "oak", x: 1720, y: 320, model: "tree_simple", scale: 1.15 },
];

export function treeSize(spot: TreeSpot): TreeSize {
  if (spot.size) return spot.size;
  if (spot.scale >= 1.35) return "large";
  if (spot.model.includes("Tall") || spot.model.includes("fat") || spot.model === "tree_tall") return "large";
  return "medium";
}

export function logsFor(spot: TreeSpot) {
  return treeSize(spot) === "large" ? 5 : 3;
}

export const TREE_GROW_MS = 48_000;
export const TREE_SAPLING_MS = 18_000;
