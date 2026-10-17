import { CAPITOL_GATE, CAPITOL_HALL, CAPITOL_SHOPS, capitolStreets, cellsOf, townGate, townGrid, townStreets, TOWN_GRIDS } from "./grids";
import { nearRoad, softenRoad, type RoadRoute } from "./road-layout";

const tide = townGate("tideham");
const lane = townGate("greenlane");
const havenGate = townGate("haven");
const sunGate = townGate("sunstep");

const capitolCell = CAPITOL_HALL;
const tideCell = cellsOf(townGrid("tideham"))[0]!;
const laneCell = cellsOf(townGrid("greenlane"))[4]!;
const havenCell = cellsOf(townGrid("haven"))[0]!;
const sunCell = cellsOf(townGrid("sunstep"))[0]!;

/** A country this size holds five villages. The shore town is the capitol. */
export const VILLAGE_CAP = 5;

/** Coins the capitol takes, per outer town, each new day the runners have been on the road. */
export const TAX_PER_TOWN = 3;

export type VillagePin = {
  id: string;
  name: string;
  x: number;
  y: number;
  capitol?: boolean;
  /** What this town is for. */
  trade: string;
  tradeBlurb: string;
};

export const VILLAGES: VillagePin[] = [
  {
    id: "capitol",
    name: "Capitol",
    x: capitolCell.x,
    y: capitolCell.y,
    capitol: true,
    trade: "Commerce",
    tradeBlurb: "The capitol keeps the ledger, takes the road tax, and is the door between this island and the rest of the world.",
  },
  {
    id: "tideham",
    name: "Tideham",
    x: tideCell.x,
    y: tideCell.y,
    trade: "Harbor",
    tradeBlurb: "Fish, rope, and freight. The boats meet the world, and the cart takes the surplus up to the capitol.",
  },
  {
    id: "greenlane",
    name: "Greenlane",
    x: laneCell.x,
    y: laneCell.y,
    trade: "Grain",
    tradeBlurb: "Fields and timber. The sacks go to the capitol. The capitol sends coin back.",
  },
  {
    id: "haven",
    name: "Haven",
    x: havenCell.x,
    y: havenCell.y,
    trade: "Steel",
    tradeBlurb: "The forges. Blades and nails ride the cart. Haven keeps what the watch needs and sells the rest.",
  },
  {
    id: "sunstep",
    name: "Sunstep",
    x: sunCell.x,
    y: sunCell.y,
    trade: "The Strip",
    tradeBlurb: "Neon and the wheel. Sunstep keeps no salt. It keeps the night, and the night pays in coin.",
  },
];

if (VILLAGES.length > VILLAGE_CAP) {
  throw new Error(`This country holds ${VILLAGE_CAP} villages.`);
}

/** Roads that join the towns. Each list runs toward the capitol, or toward the next town inland. */
export const ROADS: { id: string; points: [number, number][] }[] = [
  {
    id: "tideham",
    points: [
      [tide.x, tide.y],
      [400, 1000],
      [520, 1020],
      [CAPITOL_GATE.x, 960],
      [CAPITOL_GATE.x, CAPITOL_GATE.y],
    ],
  },
  {
    id: "greenlane",
    points: [
      [CAPITOL_GATE.x, CAPITOL_GATE.y],
      [980, 1100],
      [1180, 1310],
      [1320, 1310],
      [lane.x, 1310],
      [lane.x, lane.y],
    ],
  },
  {
    id: "haven",
    points: [
      [1320, 1310],
      [1680, 1310],
      [havenGate.x, 1310],
      [havenGate.x, havenGate.y],
    ],
  },
  {
    id: "sunstep",
    points: [
      [havenGate.x, 1310],
      [1950, 1180],
      [2060, 1080],
      [2300, 1080],
      [2800, 1040],
      [sunGate.x, 1000],
      [sunGate.x, sunGate.y],
    ],
  },
].map(road => ({ ...road, points: softenRoad(road.points as [number, number][], 32) }));

/** One map-space network for rendering, standing height, and the fallback map. Widths are world units. */
export const ROAD_NETWORK: RoadRoute[] = [
  ...ROADS.map(r => ({ ...r, width: 2.1, surface: "cobble" as const })),
  ...TOWN_GRIDS.flatMap(grid => townStreets(grid).map((s, i) => ({
    id: `${grid.id}-street-${i}`, points: [[s.ax, s.ay], [s.bx, s.by]] as [number, number][],
    width: s.alley ? 0.6 : 1.3, surface: s.alley ? "dirt" as const : "gravel" as const,
  }))),
  ...capitolStreets().map((s, i) => ({
    id: `capitol-street-${i}`, points: [[s.ax, s.ay], [s.bx, s.by]] as [number, number][],
    width: s.width ?? 1.5, surface: s.alley ? "dirt" as const : "cobble" as const,
  })),
  { id: "harbour-town", points: softenRoad([[108, 570], [130, 595], [185, 610], [230, 610]]), width: 1.8, surface: "cobble" },
  { id: "cottage-lane", points: softenRoad([[930, 475], [980, 500], [1015, 570], [1015, 675], [980, 675]]), width: 0.85, surface: "dirt" },
  { id: "cottage-gate", points: [[980, 675], [980, 658]], width: 0.7, surface: "dirt" },
  { id: "mine-trail", points: softenRoad([[1180, 1310], [1240, 1275], [1300, 1240], [1380, 1190]], 25), width: 0.7, surface: "dirt" },
  { id: "woods-trail", points: softenRoad([[230, 310], [195, 300], [175, 280], [160, 270]], 18), width: 0.6, surface: "dirt" },
  ...CAPITOL_SHOPS.filter(s => s.id !== "townhall").flatMap(s => [
    { id: `${s.id}-walk`, points: [[s.x, 475], [s.x, 525]] as [number, number][], width: 0.85, surface: "cobble" as const },
    { id: `${s.id}-apron`, points: [[s.x - 10, 525], [s.x + 10, 525]] as [number, number][], width: 0.65, surface: "cobble" as const },
  ]),
  ...[420, 490, 560, 660].map(x => ({ id: `exchange-walk-${x}`, points: [[x, 848], [x, 807]] as [number, number][], width: x === 560 ? 1.2 : 0.6, surface: "gravel" as const })),
  ...TOWN_GRIDS.flatMap(grid => cellsOf(grid).map((cell, i) => {
    const row = townStreets(grid).filter(s => s.ay === s.by && s.ay > cell.y).sort((a, b) => a.ay - b.ay)[0]!;
    return { id: `${grid.id}-door-${i}`, points: [[cell.x, row.ay], [cell.x, cell.y + 20]] as [number, number][], width: 0.55, surface: "dirt" as const };
  })),
];

/** True when a point sits on the capitol's road. That ground is not for sale. */
export function onCapitolRoad(x: number, y: number, reach = 70) {
  for (const road of ROADS) {
    for (let i = 1; i < road.points.length; i++) {
      const [ax, ay] = road.points[i - 1]!;
      const [bx, by] = road.points[i]!;
      const dx = bx - ax;
      const dy = by - ay;
      const len2 = dx * dx + dy * dy || 1;
      const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / len2));
      const px = ax + dx * t;
      const py = ay + dy * t;
      if (Math.hypot(x - px, y - py) <= reach) return true;
    }
  }
  return false;
}

/** Top of the cobble, in world units. Sits above the grass mesh. */
export const ROAD_TOP = 0.36;

/** Height to stand on when a point is on cobble, otherwise 0. */
export function deckY(x: number, y: number) {
  return ROAD_NETWORK.some(road => nearRoad(x, y, road)) ? ROAD_TOP : 0;
}

function roadById(id: string) {
  return ROADS.find((r) => r.id === id)?.points ?? [];
}

/** Waypoints from a town's gate to the capitol steps. */
export function pathToCapitol(townId: string): [number, number][] {
  if (townId === "tideham") return roadById("tideham");
  if (townId === "greenlane") return [...roadById("greenlane")].reverse();
  const appendTowardCapitol = (path: [number, number][], roadId: string) => {
    const road = [...roadById(roadId)].reverse();
    const end = path[path.length - 1]!;
    let nearest = 0;
    for (let i = 1; i < road.length; i++) {
      if (Math.hypot(road[i]![0] - end[0], road[i]![1] - end[1]) < Math.hypot(road[nearest]![0] - end[0], road[nearest]![1] - end[1])) nearest = i;
    }
    return [...path, ...road.slice(nearest)];
  };
  if (townId === "haven") {
    const haven = [...roadById("haven")].reverse();
    return appendTowardCapitol(haven, "greenlane");
  }
  if (townId === "sunstep") {
    const sun = [...roadById("sunstep")].reverse();
    return appendTowardCapitol(appendTowardCapitol(sun, "haven"), "greenlane");
  }
  return [];
}

export type SupplyRunner = {
  id: string;
  name: string;
  townId: string;
  hat: string;
  coat: string;
  line: string;
};

/** One runner from each town that is not the capitol. */
export const RUNNERS: SupplyRunner[] = [
  {
    id: "pell",
    name: "Pell",
    townId: "tideham",
    hat: "hat-night",
    coat: "#3d5a6a",
    line: "Pell of Tideham. The cart takes fish up the road. The capitol takes its tax. The ship takes the rest into the world.",
  },
  {
    id: "hemp",
    name: "Hemp",
    townId: "greenlane",
    hat: "hat-straw",
    coat: "#6b5340",
    line: "Hemp of Greenlane. Grain and timber. Full on the way in, empty on the way home. That is the job.",
  },
  {
    id: "sedge",
    name: "Sedge",
    townId: "haven",
    hat: "hat-guard",
    coat: "#5b4230",
    line: "Sedge of Haven. Steel for the capitol, and the tax comes off the top. The forges stay in Haven.",
  },
  {
    id: "sola",
    name: "Sola",
    townId: "sunstep",
    hat: "hat-straw",
    coat: "#a36b3a",
    line: "Sola of Sunstep. Salt and clay, the long road. The jars ride full. The donkey walks back light.",
  },
];

export function dailyRoadTax() {
  return RUNNERS.length * TAX_PER_TOWN;
}
