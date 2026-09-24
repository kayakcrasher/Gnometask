import { CAPITOL_GATE, CAPITOL_HALL, capitolStreets, cellsOf, townGate, townGrid, townStreets, TOWN_GRIDS } from "./grids";

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
      [145, 760],
      [tide.west, tide.midY],
      [tide.west, tide.y],
      [tide.x, tide.y],
      [520, 1020],
      [CAPITOL_GATE.x, 960],
      [CAPITOL_GATE.x, CAPITOL_GATE.y],
    ],
  },
  {
    id: "greenlane",
    points: [
      [CAPITOL_GATE.x, CAPITOL_GATE.y],
      [980, 940],
      [lane.x, 980],
      [lane.x, lane.y],
    ],
  },
  {
    id: "haven",
    points: [
      [lane.x, 980],
      [1500, 980],
      [havenGate.x, 980],
      [havenGate.x, havenGate.y],
    ],
  },
  {
    id: "sunstep",
    points: [
      [havenGate.x, 980],
      [2200, 1000],
      [2700, 1020],
      [sunGate.x, 1000],
      [sunGate.x, sunGate.y],
    ],
  },
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
  const near = (ax: number, ay: number, bx: number, by: number, half: number) => {
    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / len2));
    return Math.hypot(x - ax - dx * t, y - ay - dy * t) <= half;
  };
  for (const road of ROADS) {
    for (let i = 1; i < road.points.length; i++) {
      const a = road.points[i - 1]!;
      const b = road.points[i]!;
      if (near(a[0], a[1], b[0], b[1], 18)) return ROAD_TOP;
    }
  }
  const segs = [...TOWN_GRIDS.flatMap((g) => townStreets(g)), ...capitolStreets()];
  for (const s of segs) {
    const world = s.width ?? (s.alley ? 0.85 : 1.8);
    if (near(s.ax, s.ay, s.bx, s.by, world / 0.05 / 2)) return ROAD_TOP;
  }
  return 0;
}

function roadById(id: string) {
  return ROADS.find((r) => r.id === id)?.points ?? [];
}

/** Waypoints from a town's gate to the capitol steps. */
export function pathToCapitol(townId: string): [number, number][] {
  const gate: [number, number] = [CAPITOL_GATE.x, CAPITOL_GATE.y];
  if (townId === "tideham") return roadById("tideham");
  if (townId === "greenlane") return [...[...roadById("greenlane")].reverse(), gate];
  if (townId === "haven") {
    const haven = [...roadById("haven")].reverse();
    const lane = [...roadById("greenlane")].reverse().slice(1);
    return [...haven, ...lane, gate];
  }
  if (townId === "sunstep") {
    const sun = [...roadById("sunstep")].reverse();
    const haven = [...roadById("haven")].reverse().slice(1);
    const lane = [...roadById("greenlane")].reverse().slice(1);
    return [...sun, ...haven, ...lane, gate];
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
