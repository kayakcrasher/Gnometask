import type { BuildingId, InteriorId, PlaceId } from "../types";

export const TOWN_SHOPS: {
  id: string;
  x: number;
  y: number;
  label: string;
  interior: InteriorId;
  roof: "gold" | "stone" | "pine" | "berry" | "moss";
  tall?: boolean;
  sign: string;
  building?: BuildingId;
}[] = [
  { id: "hatshop", x: 628, y: 448, label: "Hat shop", interior: "hatshop", roof: "gold", sign: "Hats", building: "village" },
  { id: "armory", x: 718, y: 430, label: "Armory", interior: "armory", roof: "stone", sign: "Steel", building: "village" },
  { id: "townhall", x: 824, y: 398, label: "Town Hall", interior: "townhall", roof: "pine", tall: true, sign: "Hall", building: "village" },
  { id: "bakery", x: 930, y: 430, label: "Bakery", interior: "bakery", roof: "berry", sign: "Pies", building: "village" },
  { id: "general", x: 1022, y: 448, label: "Builder's yard", interior: "general", roof: "moss", sign: "Yard", building: "village" },
];

export const NPCS: {
  id: string;
  name: string;
  x: number;
  y: number;
  hat: string;
  place: PlaceId;
  lines: string[];
  tradeInterior?: InteriorId;
  stay?: boolean;
  shortName?: string;
}[] = [
  {
    id: "pappy",
    name: "Ol Pappy St. Francis",
    shortName: "Ol Pappy",
    x: 448,
    y: 508,
    hat: "hat-straw",
    place: "cottage",
    stay: true,
    lines: [
      "Ho there, young root! The hollow's still standing. That's a good start, that is.",
      "Goblins by sea, pirates by cheek, and a dragon with opinions. We'll handle 'em.",
      "A town that grows is a town that holds. Plant a roof, plant a neighbour.",
      "I been waving at this chimney since it was a rumour. Now look at us.",
      "Cheer up the palisade and it'll cheer you back. That's timber law.",
      "Prosperity isn't gold, child. It's a kettle on and a gate that shuts.",
      "Ha! I like you. You've got a walk that means business.",
    ],
  },
  {
    id: "stoic",
    name: "The Stoic Gnome",
    x: 824,
    y: 560,
    hat: "hat-night",
    place: "village",
    lines: [
      "You have power over your mind — not outside events. Realise this, and you will find strength.",
      "Waste no more time arguing what a good gnome should be. Be one.",
      "The obstacle is the path.",
      "He who lives in harmony with himself lives in harmony with the village.",
      "It is not death a gnome should fear, but never beginning to live.",
      "The best revenge is not to be like your enemy.",
      "If it is not right, do not do it. If it is not true, do not say it.",
      "Luck is what happens when preparation meets a goblin.",
      "Begin at once to live, and count each day as a life by itself.",
      "We suffer more in imagination than in the wildlands.",
    ],
  },
  {
    id: "nettie",
    name: "Nettie",
    x: 650,
    y: 520,
    hat: "hat-flower",
    place: "village",
    tradeInterior: "hatshop",
    lines: [
      "If the fountain is wet, the village is trying.",
      "I sold a turnip to a rumour. The rumour paid in gossip.",
      "Have you brushed your teeth? I can tell. I don't know how.",
      "The Guardsgnome salutes the weather. Very professional.",
    ],
  },
  {
    id: "bramble",
    name: "Bramble",
    x: 168,
    y: 248,
    hat: "hat-moss",
    place: "woods",
    lines: [
      "The mushrooms send their regards. Slowly.",
      "I once raced a tree. Still waiting on the result.",
      "Pine is a personality, not a colour.",
    ],
  },
  {
    id: "greg",
    name: "Watcher Greg",
    shortName: "Watcher Greg",
    x: 214,
    y: 488,
    hat: "hat-night",
    place: "dock",
    stay: true,
    tradeInterior: "watch",
    lines: [
      "News from the watch! I never get tired of saying that.",
      "A perch is a promise. Cheap wood now, longbows later.",
      "Goblins come in boats with their names painted on. Rude, and useful.",
      "Upgrade the tower at the tower. I don't do ladders for free.",
      "Mucktooth Clan. Green. Low. Loud about pies.",
      "If you can see the tide, you can shoot the tide.",
    ],
  },
  {
    id: "brine",
    name: "Brine",
    x: 168,
    y: 468,
    hat: "hat-straw",
    place: "dock",
    tradeInterior: "bakery",
    lines: [
      "Tide's in. So are the opinions.",
      "If it arrives by sea, it wants something.",
      "I coil rope so I don't have to coil thoughts.",
    ],
  },
  {
    id: "pipkin",
    name: "Pipkin",
    x: 520,
    y: 700,
    hat: "hat-berry",
    place: "garden",
    tradeInterior: "general",
    lines: [
      "Water first. Philosophy later.",
      "The beans are plotting. I support them.",
      "A scarecrow is just a gnome who retired from talking.",
    ],
  },
  {
    id: "miller",
    name: "Miller",
    x: 940,
    y: 500,
    hat: "hat-straw",
    place: "shop",
    tradeInterior: "bakery",
    lines: [
      "Bread is a kind of courage you can butter.",
      "The bakery opens when the oven says so.",
      "Goblins smell pie from the next tide.",
    ],
  },
];

export const HAVEN_ORIGIN = { x: 1340, y: 820 };
export const TOWN_SQUARE = { x: 824, y: 530 };
