import { SUNSTEP } from "../world3";

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
    x: 320,
    y: 550,
    capitol: true,
    trade: "Commerce",
    tradeBlurb: "The capitol keeps the ledger, takes the road tax, and is the door between this island and the rest of the world.",
  },
  {
    id: "tideham",
    name: "Tideham",
    x: 130,
    y: 680,
    trade: "Harbor",
    tradeBlurb: "Fish, rope, and freight. The boats meet the world, and the cart takes the surplus up to the capitol.",
  },
  {
    id: "greenlane",
    name: "Greenlane",
    x: 1210,
    y: 540,
    trade: "Grain",
    tradeBlurb: "Fields and timber. The sacks go to the capitol. The capitol sends coin back.",
  },
  {
    id: "haven",
    name: "Haven",
    x: 1860,
    y: 760,
    trade: "Steel",
    tradeBlurb: "The forges. Blades and nails ride the cart. Haven keeps what the watch needs and sells the rest.",
  },
  {
    id: "sunstep",
    name: "Sunstep",
    x: SUNSTEP.x,
    y: SUNSTEP.y,
    trade: "Salt",
    tradeBlurb: "Salt pans and clay. A long road, and the jars are worth the walk.",
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
      [145, 940],
      [520, 1000],
      [860, 980],
      [860, 680],
      [540, 500],
    ],
  },
  {
    id: "greenlane",
    points: [
      [860, 680],
      [1100, 820],
      [1420, 860],
      [1700, 900],
    ],
  },
  {
    id: "haven",
    points: [
      [1700, 900],
      [1860, 940],
      [2080, 920],
    ],
  },
  {
    id: "sunstep",
    points: [
      [2080, 920],
      [2300, 980],
      [2620, 1020],
      [3000, 1040],
      [3240, 1000],
      [3360, 960],
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

function roadById(id: string) {
  return ROADS.find((r) => r.id === id)?.points ?? [];
}

/** Waypoints from a town's gate to the capitol steps. */
export function pathToCapitol(townId: string): [number, number][] {
  const gate: [number, number] = [540, 500];
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
