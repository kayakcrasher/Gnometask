import { softenRoad, type RoadPoint, type RoadRoute } from "./road-layout";
export type RoadWorks = {
  completed: string[];
  active: { id: string; progress: number } | null;
};
export type EstateHome = { x: number; y: number; level: number };
export const ROAD_PROJECTS = [
  {
    id: "woodland-pass",
    name: "Woodland approach",
    coins: 180,
    logs: 0,
    hall: 2,
    wealth: 600,
    points: softenRoad(
      [
        [930, 475],
        [970, 360],
        [985, 180],
      ],
      24,
    ),
  },
  {
    id: "noble-pass",
    name: "Mount Noble bypass",
    coins: 450,
    logs: 0,
    hall: 3,
    wealth: 1800,
    points: softenRoad(
      [
        [985, 180],
        [1000, -50],
        [1120, -300],
        [1250, -450],
      ],
      32,
    ),
  },
  {
    id: "noble-reach",
    name: "Noble Reach avenue",
    coins: 950,
    logs: 0,
    hall: 4,
    wealth: 4000,
    points: softenRoad(
      [
        [1250, -450],
        [1450, -510],
        [1700, -520],
        [1930, -470],
      ],
      32,
    ),
  },
 {id:'fernmeadow-road',name:'Fernmeadow country road',coins:1900,logs:0,hall:4,wealth:6500,points:softenRoad([[1930,-470],[2040,-850],[1650,-1100],[1270,-1360],[1000,-1580]],32)},
 {id:'willowbank-road',name:'Willowbank lakeside road',coins:3800,logs:0,hall:4,wealth:11000,points:softenRoad([[1270,-1360],[1550,-1700],[1900,-1940],[2170,-2140],[2300,-2220]],32)},
 {id:'bellweather-road',name:'Bellweather coast road',coins:7600,logs:0,hall:5,wealth:18000,points:softenRoad([[2170,-2140],[2020,-2500],[2150,-2850],[2470,-3020],[2780,-3100],[2960,-3060]],32)},
 {id:'thimble-road',name:'Thimblehaven harbour road',coins:14000,logs:0,hall:5,wealth:30000,points:softenRoad([[2470,-3020],[2330,-3050],[2290,-3200],[2250,-3390],[2130,-3470]],26)}

];
export const FRONTIER_HOMES = [
  { x: 1400, y: -610 },
  { x: 1500, y: -610 },
  { x: 1600, y: -610 },
  { x: 1700, y: -610 },
  { x: 1810, y: -590 },
  { x: 1920, y: -550 },
];
export const PLANNED_ROADS: RoadRoute[] = ROAD_PROJECTS.map((p) => ({
  id: p.id,
  points: p.points,
  width: 1.8,
  surface: "gravel",
}));
export function roadLength(points: RoadPoint[]) {
  return points
    .slice(1)
    .reduce(
      (n, p, i) => n + Math.hypot(p[0] - points[i]![0], p[1] - points[i]![1]),
      0,
    );
}
export function roadPortion(
  points: RoadPoint[],
  progress: number,
): RoadPoint[] {
  let left = roadLength(points) * Math.max(0, Math.min(1, progress));
  const out: RoadPoint[] = [[...points[0]!]];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]!,
      b = points[i]!,
      length = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (left >= length) {
      out.push([...b]);
      left -= length;
      continue;
    }
    if (left > 0)
      out.push([
        a[0] + ((b[0] - a[0]) * left) / length,
        a[1] + ((b[1] - a[1]) * left) / length,
      ]);
    break;
  }
  return out;
}
export function coerceRoadWorks(raw: unknown): RoadWorks {
  const r = raw && typeof raw === "object" ? (raw as Partial<RoadWorks>) : {};
  const completed: string[] = [];
  for (const p of ROAD_PROJECTS) {
    if (Array.isArray(r.completed) && r.completed.includes(p.id))
      completed.push(p.id);
    else break;
  }
  const next = ROAD_PROJECTS[completed.length],
    a = r.active;
  return {
    completed,
    active:
      a &&
      next?.id === a.id &&
      typeof a.progress === "number" &&
      Number.isFinite(a.progress)
        ? { id: a.id, progress: Math.max(0, Math.min(0.999, a.progress)) }
        : null,
  };
}
