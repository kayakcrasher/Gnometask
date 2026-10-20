/** Original geography inspired by a broad island with a mountain spine and a sheltered northern bay.
 * Map units stay fixed so old homes, roads, boats and deeds keep their locations. */
export const WORLD_BOUNDS = {
  minX: -1550,
  maxX: 4650,
  minY: -4850,
  maxY: 1700,
};
export const WORLD_VIEW = `${WORLD_BOUNDS.minX} ${WORLD_BOUNDS.minY} ${WORLD_BOUNDS.maxX - WORLD_BOUNDS.minX} ${WORLD_BOUNDS.maxY - WORLD_BOUNDS.minY}`;
export const FRONTIER_LAKES = [
  { id: "mirror", name: "Mirror Lake", x: 400, y: -2480, rx: 200, ry: 290 },
  { id: "willow", name: "Willowmere", x: 2490, y: -2490, rx: 230, ry: 150 },
  { id: "tarn", name: "Snowbell Tarn", x: -390, y: -3500, rx: 100, ry: 125 },
];
export const FRONTIER_PEAKS = [
  { x: -440, y: -3930, r: 420, h: 17 },
  { x: -700, y: -3260, r: 410, h: 21 },
  { x: -500, y: -2600, r: 430, h: 19 },
  { x: -210, y: -1950, r: 380, h: 14 },
  { x: 140, y: -1450, r: 320, h: 10 },
  { x: 3160, y: -3350, r: 350, h: 9 },
  { x: 3670, y: -2790, r: 360, h: 12 },
];
export const FRONTIER_SETTLEMENTS = [
  {
    id: "fernmeadow",
    name: "Fernmeadow",
    x: 1270,
    y: -1460,
    road: "fernmeadow-road",
    price: 420,
    description:
      "A broad meadow for your next neighbourhood, with a long green belt back to Noble Reach.",
  },
  {
    id: "willowbank",
    name: "Willowbank",
    x: 2170,
    y: -2240,
    road: "willowbank-road",
    price: 680,
    description:
      "Lakeside clearings for a quiet town. Leave the water and woodland paths open.",
  },
  {
    id: "bellweather",
    name: "Bellweather Bay",
    x: 2780,
    y: -3200,
    road: "bellweather-road",
    price: 980,
    description:
      "A sheltered northern coast, separated from Willowbank by rolling woods and open pasture.",
  },
];
export const FRONTIER_SIGHTS = [
  {
    id: "mirror",
    name: "Mirror Lake",
    x: 660,
    y: -2470,
    description:
      "The whole mountain range fits inside the still water. Someone has left a tiny knitted scarf on the lookout bench.",
  },
  {
    id: "pass",
    name: "Snowbell Pass",
    x: -50,
    y: -3100,
    description:
      "Snowbells nod beside the old cairns. The western peaks rise above a long, winding walking trail.",
  },
  {
    id: "bay",
    name: "Thimble Bay",
    x: 1560,
    y: -2610,
    description:
      "A deep blue inlet between the two northern arms. There is room here for a whole new chapter of island life.",
  },
  {
    id: "grove",
    name: "Bramblewood Picnic",
    x: 800,
    y: -1900,
    description:
      "A little picnic shelter in a very large wood. The sign asks visitors to leave a crumb for the birds.",
  },
];
export function inlandWater(x: number, y: number, pad = 0) {
  return FRONTIER_LAKES.some(
    (l) =>
      ((x - l.x) / (l.rx + pad)) ** 2 + ((y - l.y) / (l.ry + pad)) ** 2 < 1,
  );
}
export function frontierRise(x: number, y: number) {
  if (y > -800) return 0;
  return Math.max(
    0,
    ...FRONTIER_PEAKS.map((p) => {
      const d = Math.hypot(x - p.x, y - p.y) / p.r;
      return d >= 1 ? 0 : p.h * (1 - d) ** 1.25;
    }),
  );
}
export function frontierBuildable(x: number, y: number, pad = 35) {
  return !inlandWater(x, y, pad) && frontierRise(x, y) < 0.15;
}
/** Waymarked footpaths exist before the player pays for wider roads. */
export const FRONTIER_TRAILS = [
  {
    id: "mirror-trail",
    points: [
      [1270, -1360],
      [1020, -1770],
      [800, -1900],
      [720, -2200],
      [660, -2470],
      [700, -2760],
      [450, -2970],
      [-50, -3100],
    ] as [number, number][],
  },
  {
    id: "thimble-trail",
    points: [
      [1900, -1940],
      [1710, -2220],
      [1560, -2610],
      [1250, -2580],
      [1050, -2820],
      [700, -2760],
    ] as [number, number][],
  },
];
export const FRONTIER_NEIGHBOURS = FRONTIER_SETTLEMENTS.flatMap((d, i) => {
  const ends = [
    [
      [1000, -1580],
      [1550, -1170],
    ],
    [
      [1900, -1940],
      [2300, -2220],
    ],
    [
      [2470, -3020],
      [2900, -3020],
    ],
  ][i]!;
  const [a, b] = ends,
    dx = b![0]! - a![0]!,
    dy = b![1]! - a![1]!,
    len = Math.hypot(dx, dy);
  return [0.2, 0.5, 0.8].flatMap((t) =>
    [-1, 1].map((side) => ({
      district: d.id,
      road: d.road,
      x: Math.round(a![0]! + dx * t - (dy / len) * side * 140),
      y: Math.round(a![1]! + dy * t + (dx / len) * side * 140),
    })),
  );
});

for (const p of FRONTIER_NEIGHBOURS) {
  if (p.district === "fernmeadow" && p.x === 1359) {
    p.x = 1470;
    p.y = -1400;
  }
  if (p.district === "willowbank" && p.x === 2140) {
    p.x = 2320;
    p.y = -2300;
  }
}
