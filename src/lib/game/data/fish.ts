export type FishId =
  | "sprat"
  | "perch"
  | "crab"
  | "mackerel"
  | "eel"
  | "cod"
  | "salmon"
  | "tuna"
  | "moonfish"
  | "leviathan";

export type FishDef = {
  id: FishId;
  name: string;
  /** Higher weight is more common. */
  weight: number;
  price: number;
  xp: number;
  need: number;
  /** Deep-water fish. Shore casts never roll these. */
  sea: boolean;
  /** Minimum boat rank: row 1, skiff 2, fisher 3, barge 4, sloop 5. */
  boat: number;
  color: string;
  shadow: string;
};

export const FISH: FishDef[] = [
  { id: "sprat", name: "Sprat", weight: 42, price: 2, xp: 12, need: 1, sea: false, boat: 1, color: "#d5dde4", shadow: "#8aa0a8" },
  { id: "perch", name: "Perch", weight: 30, price: 4, xp: 16, need: 1, sea: false, boat: 1, color: "#c47b3a", shadow: "#6a5330" },
  { id: "crab", name: "Shore crab", weight: 18, price: 3, xp: 14, need: 1, sea: false, boat: 1, color: "#c4553a", shadow: "#6a3030" },
  { id: "mackerel", name: "Mackerel", weight: 16, price: 8, xp: 24, need: 3, sea: false, boat: 1, color: "#3d8f8a", shadow: "#1d4a48" },
  { id: "eel", name: "River eel", weight: 8, price: 12, xp: 32, need: 5, sea: false, boat: 1, color: "#2f3d34", shadow: "#1a2420" },
  { id: "cod", name: "Cod", weight: 22, price: 10, xp: 28, need: 2, sea: true, boat: 2, color: "#e6d3b0", shadow: "#8a7a68" },
  { id: "salmon", name: "Salmon", weight: 14, price: 18, xp: 40, need: 4, sea: true, boat: 3, color: "#e07a6a", shadow: "#8a4038" },
  { id: "tuna", name: "Tuna", weight: 8, price: 28, xp: 55, need: 7, sea: true, boat: 4, color: "#3d6ea5", shadow: "#1d3458" },
  { id: "moonfish", name: "Moonfish", weight: 4, price: 48, xp: 80, need: 10, sea: true, boat: 5, color: "#c9d6f2", shadow: "#6a78a0" },
  { id: "leviathan", name: "Little leviathan", weight: 1, price: 90, xp: 140, need: 15, sea: true, boat: 5, color: "#5c4a8a", shadow: "#2a2048" },
];

export const FISH_BY_ID: Record<string, FishDef> = Object.fromEntries(FISH.map((f) => [f.id, f]));

export function rollFish(
  where: "shore" | "sea",
  level: number,
  boatRank: number,
  rod: number,
  rng: () => number = Math.random,
): FishDef | null {
  const pool = FISH.filter((f) => {
    if (level < f.need) return false;
    if (where === "shore") return !f.sea;
    return f.sea && boatRank >= f.boat;
  });
  if (!pool.length) return null;
  const weights = pool.map((f) => f.weight * (f.weight <= 12 ? 1 + rod * 0.45 : 1));
  let roll = rng() * weights.reduce((n, w) => n + w, 0);
  for (let i = 0; i < pool.length; i++) {
    roll -= weights[i]!;
    if (roll <= 0) return pool[i]!;
  }
  return pool[pool.length - 1]!;
}

export function emptyFishBag(): Record<string, number> {
  return {};
}
