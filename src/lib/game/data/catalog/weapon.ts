import { type MetalTier, TIERS } from "../tiers";

export type Weapon = {
  id: string;
  name: string;
  tier: MetalTier;
  price: number;
  power: number;
  color: string;
  blurb: string;
};

const SWORD_BLURB: Record<MetalTier, string> = {
  wood: "Practice stick. Rats laugh, then bite anyway.",
  bronze: "Brown short sword. First real argument.",
  iron: "Grey and plain. Does the job on the lane rats.",
  steel: "Pale blade. The ridge can see it from here.",
  adamant: "Green edge. Even the dragon comments.",
};

export const WEAPONS: Weapon[] = TIERS.map((t) => ({
  id: `${t.id}_sword`,
  name: `${t.name} sword`,
  tier: t.id,
  price: Math.round(14 * t.priceMul),
  power: t.power,
  color: t.color,
  blurb: SWORD_BLURB[t.id],
}));

export function weaponById(id: string): Weapon | undefined {
  return WEAPONS.find((w) => w.id === id);
}

export const STARTING_WEAPON = "wood_sword";
