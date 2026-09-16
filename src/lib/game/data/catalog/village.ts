export type VillageKind =
  | "lane"
  | "shop"
  | "home"
  | "green"
  | "craft"
  | "gate";

export type VillagePiece = {
  id: string;
  name: string;
  blurb: string;
  kind: VillageKind;
  price: number;
  /** How much the lane grows when this is placed */
  growth: number;
  requires: string[];
};

export const VILLAGE_PIECES: VillagePiece[] = [
  {
    id: "dirt_lane",
    name: "Dirt lane",
    blurb: "Two ruts from the cottage stoop. This is The Village.",
    kind: "lane",
    price: 0,
    growth: 1,
    requires: [],
  },
  {
    id: "hat_shop",
    name: "Hat shop",
    blurb: "One window, one hook, every brim you can afford.",
    kind: "shop",
    price: 50,
    growth: 2,
    requires: ["dirt_lane"],
  },
  {
    id: "house_shop",
    name: "House shop",
    blurb: "Ladders, glass, kettles. The cottage shopping list.",
    kind: "shop",
    price: 50,
    growth: 2,
    requires: ["dirt_lane"],
  },
  {
    id: "lamp_post",
    name: "Lamp post",
    blurb: "Evening stew light. Neighbours linger.",
    kind: "lane",
    price: 15,
    growth: 1,
    requires: ["dirt_lane"],
  },
  {
    id: "well",
    name: "Village well",
    blurb: "Middle of the lane. Gossip radius: one bucket.",
    kind: "green",
    price: 35,
    growth: 2,
    requires: ["dirt_lane"],
  },
  {
    id: "bench",
    name: "Green bench",
    blurb: "Say-hello chore is easier if someone is already sitting.",
    kind: "green",
    price: 12,
    growth: 1,
    requires: ["well"],
  },
  {
    id: "neighbour_hut",
    name: "Neighbour hut",
    blurb: "Someone else lives here now. They will judge your hat.",
    kind: "home",
    price: 70,
    growth: 3,
    requires: ["hat_shop", "lamp_post"],
  },
  {
    id: "second_hut",
    name: "Second hut",
    blurb: "The lane is a street if two doors face it.",
    kind: "home",
    price: 80,
    growth: 3,
    requires: ["neighbour_hut", "house_shop"],
  },
  {
    id: "baker_stall",
    name: "Baker stall",
    blurb: "Honey cakes in the morning. Gone by noon.",
    kind: "shop",
    price: 45,
    growth: 2,
    requires: ["hat_shop", "well"],
  },
  {
    id: "wood_shed",
    name: "Wood shed",
    blurb: "Kindling from the woodlot stops living on the stoop.",
    kind: "craft",
    price: 30,
    growth: 1,
    requires: ["dirt_lane"],
  },
  {
    id: "notice_board",
    name: "Notice board",
    blurb: "Chores, prices, dragon sightings. Mostly chores.",
    kind: "green",
    price: 18,
    growth: 1,
    requires: ["lamp_post"],
  },
  {
    id: "cobble_lane",
    name: "Cobble lane",
    blurb: "Dirt was fine. This is showing off.",
    kind: "lane",
    price: 90,
    growth: 3,
    requires: ["dirt_lane", "well", "lamp_post"],
  },
  {
    id: "village_gate",
    name: "Village gate",
    blurb: "A name carved in the beam. The island notices.",
    kind: "gate",
    price: 160,
    growth: 4,
    requires: ["cobble_lane", "neighbour_hut", "second_hut"],
  },
];

export function villageById(id: string): VillagePiece | undefined {
  return VILLAGE_PIECES.find((p) => p.id === id);
}

export function villageForSale(placed: string[]): VillagePiece[] {
  return VILLAGE_PIECES.filter(
    (p) =>
      !placed.includes(p.id) &&
      p.requires.every((req) => placed.includes(req)),
  );
}

export function villageGrowth(placed: string[]): number {
  return VILLAGE_PIECES.filter((p) => placed.includes(p.id)).reduce(
    (sum, p) => sum + p.growth,
    0,
  );
}

export function villageTitle(growth: number): string {
  if (growth >= 20) return "The Village";
  if (growth >= 12) return "The Lane";
  if (growth >= 6) return "The Stoop End";
  return "A Dirt Track";
}
