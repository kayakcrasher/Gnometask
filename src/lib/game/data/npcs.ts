import type { BuildingId, InteriorId, PlaceId } from "../types";
import { cellsOf, townGrid } from "./grids";

const capitol = cellsOf(townGrid("capitol"));

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
  { id: "hatshop", x: capitol[0]!.x, y: capitol[0]!.y, label: "Hat shop", interior: "hatshop", roof: "gold", sign: "Hats", building: "village" },
  { id: "armory", x: capitol[1]!.x, y: capitol[1]!.y, label: "Armory", interior: "armory", roof: "stone", sign: "Steel", building: "village" },
  { id: "bank", x: capitol[2]!.x, y: capitol[2]!.y, label: "The Bank", interior: "bank", roof: "gold", tall: true, sign: "Bank", building: "village" },
  { id: "townhall", x: capitol[3]!.x, y: capitol[3]!.y, label: "Town Hall", interior: "townhall", roof: "pine", tall: true, sign: "Hall", building: "village" },
  { id: "bakery", x: capitol[4]!.x, y: capitol[4]!.y, label: "Bakery", interior: "bakery", roof: "berry", sign: "Pies", building: "village" },
  { id: "general", x: capitol[5]!.x, y: capitol[5]!.y, label: "Builder's yard", interior: "general", roof: "moss", sign: "Yard", building: "village" },
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
      "We were a boat-ferrying folk before we were a town. Wild water, short tempers, long oars.",
      "The old law is short. What a gnome stands on is sacred. You do not buy another gnome's floor.",
      "The trouble is the capital. The old one is a story. This hollow has to become the new one, or the boat-folk thin out.",
      "Thrive means walls, bread, and a hall that can say no to goblins. That's the work.",
      "Wim's dockhouse is Wim's. Nettie's shop is Nettie's. The pale ground on the deed map is the only land the hollow can grant.",
      "Chop a log, raise a wall, then come tell me. A capital is built, not bought off a neighbour.",
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
      "A deed is a promise you do not shop. That is older than the hall.",
      "The boat-folk kept what their boots touched. We still do.",
      "They want a capital so the wild ones have somewhere to come home to. Wanting is not the same as taking.",
      "If it is not yours, do not buy it. If it is not true, do not say it.",
      "Strength is holding your own ground and leaving your neighbour's alone.",
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
      "The hat shop stands on my ground. The deed is not a ribbon you can buy.",
      "Island gnomes used to trade hats between boats. A new capital needs a street, not a raid on my floorboards.",
      "Old lore: you may admire a gnome's roof. You may not purchase it.",
      "If the fountain is wet, the hollow is trying to become a city. That is the hopeful version.",
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
      "The woods were wild before the boats, and the boats were wild before the town.",
      "My moss and my ring of mushrooms are mine. Sacred, in the old sense. Not for a purse.",
      "They talk of a capital. Fine. Leave the trees that already have a name.",
      "Pine is a personality. You don't buy a personality.",
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
      "Boat-folk need a watch, or the new capital is just a camp with nicer hats.",
      "My perch is mine. The law is older than the tower.",
      "Goblins come in boats with their names painted on. We came in boats too. We just learned to stay.",
      "A thriving island is one that can shoot the tide and still bake in the morning.",
      "Upgrade the tower at the tower. The capital will want the height.",
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
      "We ferried anything that would sit in a hull. Fish, kin, bad ideas.",
      "The south pier is my stretch of the old law. You can tie a boat. You cannot buy the planks out from under me.",
      "A capital needs pies and a tide table. Wild folk get hungry once they stop moving.",
      "Wim counts hulls. I count rope. Neither of us is selling the count.",
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
      "Island gnomes are a boat people. I just gave them a door that stays put.",
      "The dockhouse is mine. Two floors, one deed, and the deed does not leave with the tide.",
      "They want a new capital so the ferrying folk have a harbour that remembers their names.",
      "Buy a hull downstairs. Do not ask for the floor.",
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
      "A capital that cannot feed itself is a camp with a sign.",
      "This garden is mine. Private as a pocket. The hollow may grant the pale plots, not these rows.",
      "Boat-folk plant late. They still have to plant.",
      "Water first. Then the new city. Philosophy after the beans.",
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
      "Wild gnomes live on hardtack. A capital lives on bread.",
      "The bakery is my ground. Old law. You can buy a loaf. You cannot buy the oven's floor.",
      "They'll thrive when the boats come home to a street that smells like morning.",
      "The oven says when we open. The deed says who owns the heat.",
    ],
  },
];

export const HAVEN_ORIGIN = cellsOf(townGrid("haven"))[0]!;
export const TOWN_SQUARE = { x: 220, y: 540 };
