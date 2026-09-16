export type HatTier = "cloth" | "felt" | "wool" | "silk" | "star";

export type Hat = {
  id: string;
  name: string;
  blurb: string;
  tier: HatTier;
  price: number;
  color: string;
  brim: boolean;
  /** Extra prayer xp while worn */
  prayerBonus: number;
};

export const HAT_TIERS: Record<
  HatTier,
  { label: string; priceMul: number }
> = {
  cloth: { label: "Cloth", priceMul: 1 },
  felt: { label: "Felt", priceMul: 2 },
  wool: { label: "Wool", priceMul: 3.5 },
  silk: { label: "Silk", priceMul: 6 },
  star: { label: "Star-thread", priceMul: 12 },
};

export const HATS: Hat[] = [
  {
    id: "sleep_cap",
    name: "Sleep cap",
    blurb: "The one you wake up in. Not for the lane.",
    tier: "cloth",
    price: 0,
    color: "#c45c4a",
    brim: false,
    prayerBonus: 0,
  },
  {
    id: "garden_floppy",
    name: "Garden floppy",
    blurb: "Wide brim. Keeps sun off the nose while watering.",
    tier: "cloth",
    price: 12,
    color: "#d9a441",
    brim: true,
    prayerBonus: 1,
  },
  {
    id: "market_felt",
    name: "Market felt",
    blurb: "Neat pinch at the crown. Shopkeepers nod at this.",
    tier: "felt",
    price: 28,
    color: "#5b3a29",
    brim: true,
    prayerBonus: 2,
  },
  {
    id: "rain_wool",
    name: "Rain wool",
    blurb: "Heavy, damp-proof, slightly itchy. Honest weather hat.",
    tier: "wool",
    price: 45,
    color: "#3d4a3a",
    brim: true,
    prayerBonus: 3,
  },
  {
    id: "feather_felt",
    name: "Feather felt",
    blurb: "One jay feather. Neighbours will comment.",
    tier: "felt",
    price: 60,
    color: "#2b4c7e",
    brim: true,
    prayerBonus: 3,
  },
  {
    id: "silk_evening",
    name: "Evening silk",
    blurb: "For stew night if you have company.",
    tier: "silk",
    price: 90,
    color: "#6b2d5b",
    brim: false,
    prayerBonus: 5,
  },
  {
    id: "mayor_brim",
    name: "Mayor brim",
    blurb: "The village looks bigger when you wear this.",
    tier: "silk",
    price: 140,
    color: "#1f1a16",
    brim: true,
    prayerBonus: 6,
  },
  {
    id: "star_nightcap",
    name: "Star nightcap",
    blurb: "Thread that holds a little dawn. Wear to bed or don't.",
    tier: "star",
    price: 220,
    color: "#c9b37a",
    brim: false,
    prayerBonus: 10,
  },
];

export function hatById(id: string): Hat | undefined {
  return HATS.find((h) => h.id === id);
}

export function hatsForSale(): Hat[] {
  return HATS.filter((h) => h.price > 0);
}
