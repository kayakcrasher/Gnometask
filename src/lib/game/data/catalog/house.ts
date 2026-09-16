export type HouseKind = "room" | "furnish" | "hearth" | "yard" | "roof";

export type HouseUpgrade = {
  id: string;
  name: string;
  blurb: string;
  kind: HouseKind;
  price: number;
  /** Must own these ids first */
  requires: string[];
  /** Cottage comfort score added when placed */
  comfort: number;
};

export const HOUSE_UPGRADES: HouseUpgrade[] = [
  {
    id: "loft_ladder",
    name: "Loft ladder",
    blurb: "Stops you jumping the last three rungs every morning.",
    kind: "room",
    price: 20,
    requires: [],
    comfort: 2,
  },
  {
    id: "real_mattress",
    name: "Real mattress",
    blurb: "Straw was character-building. This is sleep.",
    kind: "furnish",
    price: 35,
    requires: ["loft_ladder"],
    comfort: 4,
  },
  {
    id: "quilt_chest",
    name: "Quilt chest",
    blurb: "One extra blanket and a place to hide hats.",
    kind: "furnish",
    price: 22,
    requires: [],
    comfort: 2,
  },
  {
    id: "stone_hearth",
    name: "Stone hearth",
    blurb: "Stew that does not taste of smoke. Mostly.",
    kind: "hearth",
    price: 55,
    requires: [],
    comfort: 5,
  },
  {
    id: "iron_kettle",
    name: "Iron kettle",
    blurb: "Boils before you have finished brushing your teeth.",
    kind: "hearth",
    price: 18,
    requires: ["stone_hearth"],
    comfort: 2,
  },
  {
    id: "window_glass",
    name: "Window glass",
    blurb: "Rain stays out. Dawn still comes in.",
    kind: "room",
    price: 40,
    requires: [],
    comfort: 3,
  },
  {
    id: "wash_basin",
    name: "Wash basin",
    blurb: "Teeth, face, hands. The chore actually has a place now.",
    kind: "furnish",
    price: 16,
    requires: ["window_glass"],
    comfort: 2,
  },
  {
    id: "porch_stoop",
    name: "Porch stoop",
    blurb: "Two steps and a rail. Village starts at the bottom one.",
    kind: "yard",
    price: 30,
    requires: [],
    comfort: 3,
  },
  {
    id: "herb_shelf",
    name: "Herb shelf",
    blurb: "Thyme indoors when the garden is sulking.",
    kind: "furnish",
    price: 14,
    requires: ["stone_hearth"],
    comfort: 1,
  },
  {
    id: "thatch_patch",
    name: "Thatch patch",
    blurb: "The drip over the bed is not charming.",
    kind: "roof",
    price: 28,
    requires: [],
    comfort: 3,
  },
  {
    id: "red_door",
    name: "Red door",
    blurb: "Neighbours can find you. So can the dragon, but still.",
    kind: "yard",
    price: 24,
    requires: ["porch_stoop"],
    comfort: 2,
  },
  {
    id: "second_room",
    name: "Second room",
    blurb: "Hats in one, bed in the other. Civilization.",
    kind: "room",
    price: 120,
    requires: ["loft_ladder", "window_glass", "thatch_patch"],
    comfort: 8,
  },
];

export function houseById(id: string): HouseUpgrade | undefined {
  return HOUSE_UPGRADES.find((h) => h.id === id);
}

export function houseForSale(owned: string[]): HouseUpgrade[] {
  return HOUSE_UPGRADES.filter((h) =>
    h.requires.every((req) => owned.includes(req)),
  );
}

export function comfortTotal(owned: string[]): number {
  return HOUSE_UPGRADES.filter((h) => owned.includes(h.id)).reduce(
    (sum, h) => sum + h.comfort,
    0,
  );
}
