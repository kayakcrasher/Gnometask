export type CropId = "carrot" | "turnip" | "cabbage" | "pumpkin";

export type CropDef = {
  id: CropId;
  name: string;
  seed: number;
  price: number;
  xp: number;
  growMs: number;
  wiltMs: number;
  color: string;
};

export const CROPS: CropDef[] = [
  { id: "carrot", name: "Carrot", seed: 2, price: 8, xp: 18, growMs: 45_000, wiltMs: 80_000, color: "#e07a3d" },
  { id: "turnip", name: "Turnip", seed: 4, price: 14, xp: 28, growMs: 75_000, wiltMs: 95_000, color: "#d8c49a" },
  { id: "cabbage", name: "Cabbage", seed: 7, price: 22, xp: 42, growMs: 110_000, wiltMs: 120_000, color: "#6f8f66" },
  { id: "pumpkin", name: "Pumpkin", seed: 12, price: 36, xp: 64, growMs: 160_000, wiltMs: 140_000, color: "#d6a84c" },
];

export const CROP_BY_ID: Record<string, CropDef> = Object.fromEntries(CROPS.map((c) => [c.id, c]));

/** In front of the cottage door. South is +y. */
export const YARD_PLOTS: { id: string; x: number; y: number }[] = [
  { id: "yard-0", x: 900, y: 760 },
  { id: "yard-1", x: 980, y: 760 },
  { id: "yard-2", x: 1060, y: 760 },
  { id: "yard-3", x: 900, y: 840 },
  { id: "yard-4", x: 980, y: 840 },
  { id: "yard-5", x: 1060, y: 840 },
];

export const PLANT_GRACE_MS = 40_000;

export type PlotSave = {
  crop: CropId;
  plantedAt: number;
  wateredAt: number | null;
};

export type PlotStage = "empty" | "thirsty" | "seed" | "sprout" | "ready" | "dead";

export function pailBonusMs(owned: string[]) {
  if (owned.includes("pail-adamant")) return 180_000;
  if (owned.includes("pail-steel")) return 120_000;
  if (owned.includes("pail-iron")) return 70_000;
  if (owned.includes("pail-bronze")) return 40_000;
  if (owned.includes("pail-wood")) return 0;
  return null;
}

export function plotStage(plot: PlotSave | undefined, now: number, bonusMs: number): PlotStage {
  if (!plot) return "empty";
  const def = CROP_BY_ID[plot.crop];
  if (!def) return "empty";
  if (plot.wateredAt == null) {
    return now - plot.plantedAt > PLANT_GRACE_MS ? "dead" : "thirsty";
  }
  if (now - plot.wateredAt > def.wiltMs + bonusMs) return "dead";
  const grown = now - plot.plantedAt;
  if (grown >= def.growMs) return "ready";
  if (grown >= def.growMs * 0.45) return "sprout";
  return "seed";
}
