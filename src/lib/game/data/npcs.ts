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
  { id: "hatshop", x: 250, y: 400, label: "Hat shop", interior: "hatshop", roof: "gold", sign: "Hats", building: "village" },
  { id: "armory", x: 270, y: 490, label: "Armory", interior: "armory", roof: "stone", sign: "Steel", building: "village" },
  { id: "townhall", x: 320, y: 560, label: "Town Hall", interior: "townhall", roof: "pine", tall: true, sign: "Hall", building: "village" },
  { id: "bakery", x: 270, y: 640, label: "Bakery", interior: "bakery", roof: "berry", sign: "Pies", building: "village" },
  { id: "general", x: 250, y: 730, label: "Builder's yard", interior: "general", roof: "moss", sign: "Yard", building: "village" },
  { id: "bank", x: 400, y: 560, label: "The Bank", interior: "bank", roof: "gold", tall: true, sign: "Bank", building: "village" },
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
    x: 96,
    y: 555,
    hat: "hat-straw",
    place: "dock",
    stay: true,
    lines: [
      "Ho there. You made my dock in one piece. That's the whole interview.",
      "The cottage is up the path. The dockhouse is Wim's. Boats live downstairs.",
      "Every other day the supply ship ties up on the south pier. Crates, coins, and sometimes a new neighbour.",
      "Goblins by sea, pirates by cheek. We'll hold the hollow if you hold the gate.",
      "Chop a log, raise a wall, then come tell me. I don't leave this pier for gossip.",
      "Ha! You've got a walk that means business. The tide noticed.",
    ],
  },
  {
    id: "stoic",
    name: "The Stoic Gnome",
    x: 190,
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
    x: 180,
    y: 420,
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
    x: 140,
    y: 380,
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
    x: 150,
    y: 660,
    hat: "hat-straw",
    place: "dock",
    tradeInterior: "bakery",
    lines: [
      "Tide's in. So are the opinions.",
      "Wim counts hulls. I count rope. We don't share ledgers.",
      "If the supply ship whistles, the south pier is open. Pies ride in the crates.",
    ],
  },
  {
    id: "wim",
    name: "Wim",
    shortName: "Wim",
    x: 118,
    y: 500,
    hat: "hat-straw",
    place: "dock",
    stay: true,
    tradeInterior: "dockhouse",
    lines: [
      "Dockhouse. Two floors. Boats down, bunk up. I live in both.",
      "The rowboat is yours. Anything with a sail, you buy it here.",
      "Supply ship stops on the south pier. Crates first. If a gnome walks off, the island just got bigger.",
      "Mind the pier. The pilings are older than my knees.",
    ],
  },
  {
    id: "pipkin",
    name: "Pipkin",
    x: 1100,
    y: 800,
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
    x: 200,
    y: 650,
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

export const HAVEN_ORIGIN = { x: 1860, y: 760 };
export const TOWN_SQUARE = { x: 220, y: 540 };
