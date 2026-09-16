export type NpcRole = "shopkeep" | "neighbour" | "dragon" | "notice";

export type Npc = {
  id: string;
  name: string;
  role: NpcRole;
  place: string;
  blurb: string;
  /** Shop catalog they sell, if any */
  shop?: "hats" | "house" | "food" | "tools";
  line: string;
};

export const NPCS: Npc[] = [
  {
    id: "brim",
    name: "Brim",
    role: "shopkeep",
    place: "shops",
    shop: "hats",
    blurb: "Keeps the hat window. Judges sleep caps on sight.",
    line: "A brim is a promise. That cap is a confession.",
  },
  {
    id: "hearth",
    name: "Hearth",
    role: "shopkeep",
    place: "shops",
    shop: "house",
    blurb: "Sells ladders, glass, kettles. Wants you to stand up indoors.",
    line: "Glass first. Kettle second. Second room when you can afford dignity.",
  },
  {
    id: "pip",
    name: "Pip",
    role: "neighbour",
    place: "village",
    blurb: "Lives in the first hut. Counts chickens that are not theirs.",
    line: "It is a village when two doors face the same mud.",
  },
  {
    id: "noll",
    name: "Noll",
    role: "neighbour",
    place: "village",
    blurb: "Second hut. Sweeps the stoop if you forget, then tells you.",
    line: "I already swept it. You can thank me or do it tomorrow.",
  },
  {
    id: "crust",
    name: "Crust",
    role: "shopkeep",
    place: "village",
    shop: "food",
    blurb: "Baker stall. Honey cakes gone by noon.",
    line: "Buy it warm or don't bother. Cold cake is just bread in a costume.",
  },
  {
    id: "edge",
    name: "Edge",
    role: "shopkeep",
    place: "woodlot",
    shop: "tools",
    blurb: "Leans on the stump. Sells hatchets like they are opinions.",
    line: "Wood first. Adamant when the stump files a complaint.",
  },
  {
    id: "board",
    name: "Notice board",
    role: "notice",
    place: "village",
    blurb: "Chores, prices, dragon sightings. Mostly chores.",
    line: "TEETH. BED. HENS. KINDLING. Ridge: still occupied.",
  },
  {
    id: "ash",
    name: "Ash",
    role: "dragon",
    place: "ridge",
    blurb: "The argument on the ridge. Not a shop. Not a friend. Yet.",
    line: "You built a lane and called it a village. I am almost impressed.",
  },
];

export function npcById(id: string): Npc | undefined {
  return NPCS.find((n) => n.id === id);
}

export function npcsAt(place: string): Npc[] {
  return NPCS.filter((n) => n.place === place);
}

export function shopkeep(shop: NonNullable<Npc["shop"]>): Npc | undefined {
  return NPCS.find((n) => n.shop === shop);
}
