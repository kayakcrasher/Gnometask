export type PlantKind = "herb" | "veg" | "flower" | "tree" | "coop";

export type GardenPlot = {
  id: string;
  name: string;
  blurb: string;
  kind: PlantKind;
  price: number;
  /** In-game hours until harvest / grown */
  growHours: number;
  harvest?: { item: string; qty: number };
  farmingXp: number;
  /** How many tiles this plant occupies */
  tiles: number;
};

export const GARDEN_PLOTS: GardenPlot[] = [
  {
    id: "thyme",
    name: "Thyme patch",
    blurb: "Small, stubborn, good in stew.",
    kind: "herb",
    price: 6,
    growHours: 4,
    harvest: { item: "thyme", qty: 2 },
    farmingXp: 6,
    tiles: 1,
  },
  {
    id: "mint",
    name: "Mint",
    blurb: "Takes over if you let it. Don't let it.",
    kind: "herb",
    price: 6,
    growHours: 3,
    harvest: { item: "mint", qty: 3 },
    farmingXp: 5,
    tiles: 1,
  },
  {
    id: "carrot_row",
    name: "Carrot row",
    blurb: "Orange flags under dirt. Chickens will try.",
    kind: "veg",
    price: 10,
    growHours: 8,
    harvest: { item: "carrot", qty: 4 },
    farmingXp: 10,
    tiles: 2,
  },
  {
    id: "onion_bed",
    name: "Onion bed",
    blurb: "Makes the whole cottage smell like dinner.",
    kind: "veg",
    price: 10,
    growHours: 10,
    harvest: { item: "onion", qty: 4 },
    farmingXp: 10,
    tiles: 2,
  },
  {
    id: "cabbage",
    name: "Cabbage",
    blurb: "One head, many opinions.",
    kind: "veg",
    price: 12,
    growHours: 12,
    harvest: { item: "cabbage", qty: 1 },
    farmingXp: 12,
    tiles: 2,
  },
  {
    id: "sunflower",
    name: "Sunflower",
    blurb: "Faces the ridge. Tall enough to hide a gnome.",
    kind: "flower",
    price: 8,
    growHours: 6,
    harvest: { item: "sunflower_seed", qty: 3 },
    farmingXp: 7,
    tiles: 1,
  },
  {
    id: "lavender",
    name: "Lavender",
    blurb: "For the wash basin and the pillow.",
    kind: "flower",
    price: 9,
    growHours: 7,
    harvest: { item: "lavender", qty: 2 },
    farmingXp: 8,
    tiles: 1,
  },
  {
    id: "apple_whip",
    name: "Apple whip",
    blurb: "Not a real orchard yet. One hopeful stick.",
    kind: "tree",
    price: 25,
    growHours: 24,
    harvest: { item: "apple", qty: 3 },
    farmingXp: 20,
    tiles: 4,
  },
  {
    id: "berry_hedge",
    name: "Berry hedge",
    blurb: "Marks the edge of the big garden. Stains hats.",
    kind: "tree",
    price: 18,
    growHours: 16,
    harvest: { item: "berries", qty: 5 },
    farmingXp: 14,
    tiles: 3,
  },
  {
    id: "chicken_coop",
    name: "Chicken coop",
    blurb: "Three hens if you feed them. Eggs if you remember.",
    kind: "coop",
    price: 40,
    growHours: 0,
    harvest: { item: "egg", qty: 2 },
    farmingXp: 8,
    tiles: 4,
  },
  {
    id: "well_trough",
    name: "Water trough",
    blurb: "The water-the-garden chore is faster with this.",
    kind: "coop",
    price: 22,
    growHours: 0,
    farmingXp: 0,
    tiles: 2,
  },
];

export function gardenById(id: string): GardenPlot | undefined {
  return GARDEN_PLOTS.find((p) => p.id === id);
}

export function gardenTilesUsed(placedIds: string[]): number {
  return placedIds.reduce((sum, id) => {
    const p = gardenById(id);
    return sum + (p?.tiles ?? 0);
  }, 0);
}

/** Big garden behind the cottage. Expand later if you buy more land. */
export const GARDEN_CAPACITY = 24;
