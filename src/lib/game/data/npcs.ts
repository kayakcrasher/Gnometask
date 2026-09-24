import type { BuildingId, InteriorId, PlaceId } from "../types";
import { CAPITOL_FOUNTAIN, CAPITOL_SHOPS, cellsOf, townGrid } from "./grids";

const shopAt = (id: string) => CAPITOL_SHOPS.find((s) => s.id === id)!;

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
  face: number;
}[] = [
  { id: "hatshop", x: shopAt("hatshop").x, y: shopAt("hatshop").y, label: "Hat shop", interior: "hatshop", roof: "gold", sign: "Hats", building: "village", face: Math.PI },
  { id: "armory", x: shopAt("armory").x, y: shopAt("armory").y, label: "Armory", interior: "armory", roof: "stone", sign: "Steel", building: "village", face: Math.PI },
  { id: "townhall", x: shopAt("townhall").x, y: shopAt("townhall").y, label: "Town Hall", interior: "townhall", roof: "pine", tall: true, sign: "Hall", building: "village", face: Math.PI },
  { id: "bakery", x: shopAt("bakery").x, y: shopAt("bakery").y, label: "Bakery", interior: "bakery", roof: "berry", sign: "Pies", building: "village", face: Math.PI },
  { id: "general", x: shopAt("general").x, y: shopAt("general").y, label: "Builder's yard", interior: "general", roof: "moss", sign: "Yard", building: "village", face: Math.PI },
  { id: "bank", x: shopAt("bank").x, y: shopAt("bank").y, label: "The Bank", interior: "bank", roof: "gold", tall: true, sign: "Bank", building: "village", face: Math.PI },
];

export const NPCS: {
  id: string;
  name: string;
  x: number;
  y: number;
  hat: string;
  job: string;
  org: string;
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
    job: "elder",
    org: "Hollow Trust",
    place: "dock",
    stay: true,
    lines: [
      "I knew your great-grandpa. He fought the Goblin King and got people off Corinth. This dock still owes him.",
      "The cottage and those garden tiles are his gift. You arrived with empty pockets. That is a fine way to start a building.",
      "Gnomes build. Goblins steal. That was the war, and it is still the tide.",
      "Corinth was a nation. The Goblin King ransacked it and set a whole region's wealth to nothing.",
      "We are the ones who got away. Homes, roads, boats. That is how an island nation stands up again.",
      "Private ground stays private. Your great-grandpa did not flee a king so a neighbour could buy his floor.",
      "Dark elves hate a rival that works. Pirates hate a hull that isn't theirs. Both will come if we look rich and asleep.",
    ],
  },
  {
    id: "stoic",
    name: "The Stoic Gnome",
    x: 420,
    y: 270,
    hat: "hat-night",
    job: "investor",
    org: "Hollow Trust",
    place: "village",
    lines: [
      "Your great-grandpa held a line so other gnomes could run. I buy shares so this line can pay for itself.",
      "Corinth's wealth was stolen, not lost. We earn the next one. We do not loot it.",
      "A deed is older than the hall. What a gnome stands on is not for sale.",
      "Goblins take. We invest. That is the whole difference, said slowly.",
      "If the hollow gets rich, dark elves will call it competition. Build anyway.",
    ],
  },
  {
    id: "nettie",
    name: "Nettie",
    x: 300,
    y: 505,
    hat: "hat-flower",
    job: "hatter",
    org: "Moss Hat Co",
    place: "village",
    tradeInterior: "hatshop",
    lines: [
      "Corinth sold hats between boats. I sell them from a shop I sleep above. That is the rebuild, one brim at a time.",
      "You came with empty pockets. Good. A hat is the first thing a gnome puts on a new life.",
      "The shop is mine. Your great-grandpa would have nodded. He did not flee so a purse could buy my floor.",
      "Goblins would take the ribbon and the head with it. We'd rather sew.",
    ],
  },
  {
    id: "bramble",
    name: "Bramble",
    x: 168,
    y: 248,
    hat: "hat-moss",
    job: "forager",
    org: "Lane Co-op",
    place: "woods",
    lines: [
      "The woods fed the folk your great-grandpa walked off Corinth. They still feed whoever works.",
      "Gnomes plant and cut and plant again. Goblins only carry off what someone else grew.",
      "My ring of mushrooms is mine. Sacred, in the old sense. Not a raid.",
      "A nation that burns its trees to look busy is just Corinth waiting to fall again. We use them. We leave some standing.",
    ],
  },
  {
    id: "greg",
    name: "Watcher Greg",
    shortName: "Watcher Greg",
    x: 140,
    y: 380,
    hat: "hat-night",
    job: "watch captain",
    org: "Watch & Wall",
    place: "dock",
    stay: true,
    tradeInterior: "watch",
    lines: [
      "Your great-grandpa fought the Goblin King. I watch the shore so his grandchildren don't have to swim for it.",
      "Goblins steal. That is the whole creed. Paint on the boat, knives in the sacks.",
      "Dark elves come when a town starts to prosper. They hate a rival that works.",
      "Pirates are the same hunger in a bigger hull. They want trouble and whatever isn't nailed down.",
      "The tower is how we say no. Upgrade it at the tower. A nation is a watch that stayed.",
    ],
  },
  {
    id: "brine",
    name: "Brine",
    x: 150,
    y: 660,
    hat: "hat-straw",
    job: "pier clerk",
    org: "Pie & Tide",
    place: "dock",
    tradeInterior: "bakery",
    lines: [
      "I count the boats that come home. Corinth counted them leaving. I like this job better.",
      "Pirates nip the tide when the hulls look fat. Coil the rope and don't look asleep.",
      "The south pier is mine. Tie a boat. Do not buy the planks.",
      "Your pockets were empty. The garden tiles weren't. Plant something. A nation eats.",
    ],
  },
  {
    id: "wim",
    name: "Wim",
    shortName: "Wim",
    x: 118,
    y: 500,
    hat: "hat-straw",
    job: "dockmaster",
    org: "Oar & Yard",
    place: "dock",
    stay: true,
    tradeInterior: "dockhouse",
    lines: [
      "The boats are going again. That is the sentence I waited my whole dock for.",
      "Your great-grandpa shipped people off a falling city. I sell hulls so their grandchildren can ship goods home.",
      "Pirates like a new harbour. They call it opportunity. I call it a locked door and a watch.",
      "The dockhouse is mine. Two floors, one deed. Buy a hull downstairs. The floor stays.",
    ],
  },
  {
    id: "pipkin",
    name: "Pipkin",
    x: 652,
    y: 505,
    hat: "hat-berry",
    job: "farmer",
    org: "Lane Co-op",
    place: "garden",
    tradeInterior: "general",
    lines: [
      "Those garden tiles were your great-grandpa's. A few rows, not a kingdom. Enough to begin.",
      "Gnomes like a crop they planted. Goblins like a crop they didn't.",
      "The co-op works the rows together. That is how scattered folk become a nation again.",
      "Water first. The Goblin King already proved what happens to a city that only spends.",
    ],
  },
  {
    id: "miller",
    name: "Miller",
    x: 476,
    y: 505,
    hat: "hat-straw",
    job: "baker",
    org: "Pie & Tide",
    place: "shop",
    tradeInterior: "bakery",
    lines: [
      "Corinth's last morning still smelled like bread. I bake so this one does too.",
      "You stepped off hungry and poor. The oven does not mind. It minds being robbed.",
      "Goblins follow the smell. Dark elves follow the queue. We keep baking.",
      "The bakery is my ground. Buy a loaf. The oven's floor is not on the menu.",
    ],
  },
];

export const HAVEN_ORIGIN = cellsOf(townGrid("haven"))[0]!;
export const TOWN_SQUARE = CAPITOL_FOUNTAIN;
