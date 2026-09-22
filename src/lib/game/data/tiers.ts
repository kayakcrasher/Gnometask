export const TIERS = ["wood", "bronze", "iron", "steel", "adamant"] as const;
export type GearTier = (typeof TIERS)[number];

export const TIER_META: Record<
  GearTier,
  { name: string; metal: string; dark: string; edge: string; hall: number; atk: number; def: number; wc: number; farm: number; price: number }
> = {
  wood: { name: "Wood", metal: "#6b4423", dark: "#3e2e20", edge: "#c4a574", hall: 1, atk: 3, def: 2, wc: 1, farm: 1, price: 0 },
  bronze: { name: "Bronze", metal: "#8c5a2b", dark: "#5b3a18", edge: "#c4963d", hall: 1, atk: 6, def: 4, wc: 2, farm: 2, price: 18 },
  iron: { name: "Iron", metal: "#6d6d70", dark: "#3a3a3c", edge: "#b0b0b4", hall: 2, atk: 9, def: 7, wc: 3, farm: 3, price: 36 },
  steel: { name: "Steel", metal: "#c5cdd6", dark: "#6a7380", edge: "#f2f5f8", hall: 3, atk: 13, def: 10, wc: 4, farm: 4, price: 58 },
  adamant: { name: "Adamant", metal: "#3d7a4a", dark: "#1d4a2c", edge: "#8cbd74", hall: 4, atk: 18, def: 14, wc: 5, farm: 5, price: 96 },
};

export function tierOf(id: string | null | undefined): GearTier | null {
  if (!id) return null;
  if (id.includes("adamant") || id.includes("mithril")) return "adamant";
  if (id.includes("steel")) return "steel";
  if (id.includes("iron")) return "iron";
  if (id.includes("bronze")) return "bronze";
  if (id.includes("wood") || id.includes("stick")) return "wood";
  return null;
}
