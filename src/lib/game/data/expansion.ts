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
    logs: 12,
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
    logs: 25,
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
    logs: 45,
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
