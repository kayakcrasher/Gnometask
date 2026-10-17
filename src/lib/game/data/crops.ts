import { CATALOG_BY_ID } from "./catalog";
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

/** A tight bed in front of the cottage, not loose blocks in the lawn. */
export const YARD_PLOTS: { id: string; x: number; y: number }[] = [
  { id: "yard-0", x: 940, y: 710 },
  { id: "yard-1", x: 980, y: 710 },
  { id: "yard-2", x: 1020, y: 710 },
  { id: "yard-3", x: 940, y: 748 },
  { id: "yard-4", x: 980, y: 748 },
  { id: "yard-5", x: 1020, y: 748 },
];

export const PLANT_GRACE_MS = 40_000;

export type PlotSave = {
  crop: CropId;
  plantedAt: number;
  wateredAt: number | null;
};

export type PlotStage = "empty" | "thirsty" | "seed" | "sprout" | "ready" | "dead";

export function pailBonusMs(owned: string[]) {
  const advanced = Math.max(0,...owned.map(id => CATALOG_BY_ID[id]?.waterBonus ?? 0));
  if (advanced) return advanced;
  if (owned.includes("pail-adamant")) return 180_000;
  if (owned.includes("pail-steel")) return 120_000;
  if (owned.includes("pail-iron")) return 70_000;
  if (owned.includes("pail-bronze")) return 40_000;
  if (owned.includes("pail-wood")) return 0;
  return null;
}

export function plotStage(plot: PlotSave | undefined, now: number, _bonusMs?: number): PlotStage {
  // Crops never die; better pails accelerate growth only after watering.
  if (!plot) return "empty";
  const def = CROP_BY_ID[plot.crop];
  if (!def) return "empty";
  const wateredGrowth = plot.wateredAt == null ? 0 : Math.max(0, now - Math.max(plot.plantedAt, plot.wateredAt)) * Math.min(0.75, Math.max(0,_bonusMs ?? 0)/1_000_000);
  const grown = now - plot.plantedAt + wateredGrowth;
  if (grown >= def.growMs) return "ready";
  if (grown >= def.growMs * 0.45) return "sprout";
  return "seed";
}
