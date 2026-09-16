export type MetalTier = "wood" | "bronze" | "iron" | "steel" | "adamant";

export type TierInfo = {
  id: MetalTier;
  name: string;
  /** Mesh / UI colour from the README */
  color: string;
  power: number;
  priceMul: number;
};

export const TIERS: TierInfo[] = [
  {
    id: "wood",
    name: "Wood",
    color: "#6b4a2b",
    power: 1,
    priceMul: 1,
  },
  {
    id: "bronze",
    name: "Bronze",
    color: "#6b3a1f",
    power: 2,
    priceMul: 2,
  },
  {
    id: "iron",
    name: "Iron",
    color: "#6a6e72",
    power: 3,
    priceMul: 3.5,
  },
  {
    id: "steel",
    name: "Steel",
    color: "#c5c8cc",
    power: 4,
    priceMul: 6,
  },
  {
    id: "adamant",
    name: "Adamant",
    color: "#3d8b5a",
    power: 6,
    priceMul: 12,
  },
];

export function tierById(id: string): TierInfo | undefined {
  return TIERS.find((t) => t.id === id);
}

export function tierColor(id: string): string {
  return tierById(id)?.color ?? "#6b4a2b";
}
