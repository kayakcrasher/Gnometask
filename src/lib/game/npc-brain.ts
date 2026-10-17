import { COURTS, PUBS } from "./data/civic";
import { SUNSTEP_FEATURES } from "./data/sunstep";
import { onIsland, nobleRise } from "./world3";
import { ROAD_NETWORK } from "./data/country";
import { CAPITOL_SHOPS, cellsOf, TOWN_GRIDS } from "./data/grids";
import type { DayPhase } from "./data/daynight";

export type NpcHome = {
  id: string;
  x: number;
  y: number;
  stay?: boolean;
  job?: string;
};
export type NpcActivity =
  "working" | "patrolling" | "visiting" | "resting" | "chatting";
export type WalkPoint = { x: number; y: number };
const BUILDINGS = [
  ...COURTS.map(c => ({...c, w: c.town === "capitol" ? 90 : 28, h: c.town === "capitol" ? 62 : 24})),
  ...PUBS.map(p => ({...p, w: 24, h: 19})),
  { ...SUNSTEP_FEATURES.hotel, w: 35, h: 25 },
  ...CAPITOL_SHOPS.map((p) => ({
    ...p,
    w: p.id === "townhall" ? 50 : 27,
    h: p.id === "townhall" ? 42 : 23,
  })),
  ...TOWN_GRIDS.flatMap(cellsOf).map((p) => ({ ...p, w: 24, h: 19 })),
  { x: 980, y: 640, w: 28, h: 24 },
  { x: 560, y: 790, w: 30, h: 23 },
  ...[420, 490, 660].map((x) => ({ x, y: 790, w: 22, h: 19 })),
];
export function npcWalkable(x: number, y: number) {
  return (
    Number.isFinite(x) &&
    Number.isFinite(y) &&
    onIsland(x, y) &&
    Math.hypot(x - 520, y - 190) > 99 &&
    Math.hypot(
      x - SUNSTEP_FEATURES.fountain.x,
      y - SUNSTEP_FEATURES.fountain.y,
    ) > 52 &&
    Math.hypot(x - SUNSTEP_FEATURES.oasis.x, y - SUNSTEP_FEATURES.oasis.y) >
      60 &&
    !BUILDINGS.some(
      (b) => Math.abs(x - b.x) < b.w + 5 && Math.abs(y - b.y) < b.h + 5,
    )
  );
}
export function clearNpcSegment(a: WalkPoint, b: WalkPoint) {
  const distance = Math.hypot(b.x - a.x, b.y - a.y),
    steps = Math.max(1, Math.ceil(distance / 5));
  for (let i = 0; i <= steps; i++) {
    const x = a.x + ((b.x - a.x) * i) / steps,
      y = a.y + ((b.y - a.y) * i) / steps;
    if (!npcWalkable(x, y)) return false;
  }
  return (
    Math.abs(nobleRise(a.x, a.y) - nobleRise(b.x, b.y)) <
    Math.max(0.8, distance * 0.06)
  );
}
export function safeNpcSpot(point: WalkPoint): WalkPoint {
  if (npcWalkable(point.x, point.y)) return point;
  for (let radius = 8; radius <= 160; radius += 8)
    for (let i = 0; i < 16; i++) {
      const candidate = {
        x: point.x + Math.cos((i * Math.PI) / 8) * radius,
        y: point.y + Math.sin((i * Math.PI) / 8) * radius,
      };
      if (npcWalkable(candidate.x, candidate.y)) return candidate;
    }
  return point;
}
/** Bounded local A*: short visits can go around a shop without cutting through it. */
export function npcRoute(
  start: WalkPoint,
  goal: WalkPoint,
): WalkPoint[] | null {
  if (!npcWalkable(start.x, start.y) || !npcWalkable(goal.x, goal.y))
    return null;
  if (clearNpcSegment(start, goal)) return [goal];
  const grid = 18,
    key = (x: number, y: number) => `${x},${y}`;
  type Node = WalkPoint & { cost: number; score: number; parent?: Node };
  const first: Node = {
    ...start,
    cost: 0,
    score: Math.hypot(goal.x - start.x, goal.y - start.y),
  };
  const open = [first],
    costs = new Map<string, number>([[key(0, 0), 0]]);
  let visited = 0;
  while (open.length && visited++ < 1800) {
    open.sort((a, b) => b.score - a.score);
    const current = open.pop()!;
    if (
      Math.hypot(current.x - goal.x, current.y - goal.y) < grid * 2 &&
      clearNpcSegment(current, goal)
    ) {
      const path: WalkPoint[] = [goal];
      let node: Node | undefined = current;
      while (node?.parent) {
        path.push({ x: node.x, y: node.y });
        node = node.parent;
      }
      path.reverse();
      return path;
    }
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ]) {
      const next = { x: current.x + dx! * grid, y: current.y + dy! * grid };
      if (
        Math.hypot(next.x - start.x, next.y - start.y) > 360 ||
        !clearNpcSegment(current, next)
      )
        continue;
      const id = key(
        Math.round((next.x - start.x) / grid),
        Math.round((next.y - start.y) / grid),
      );
      const cost = current.cost + Math.hypot(dx!, dy!) * grid;
      if (cost >= (costs.get(id) ?? Infinity)) continue;
      costs.set(id, cost);
      open.push({
        ...next,
        cost,
        score: cost + Math.hypot(next.x - goal.x, next.y - goal.y),
        parent: current,
      });
    }
  }
  return null;
}
function hash(id: string) {
  return [...id].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 17);
}
export function npcRoutine(
  home: NpcHome,
  phase: DayPhase,
  cycle: number,
): { point: WalkPoint; activity: NpcActivity; wait: number } {
  const seed = hash(home.id) + cycle * 97;
  const guard = /guard|watch|soldier/i.test(home.job ?? "");
  const activity: NpcActivity = home.stay
    ? "working"
    : phase === "night" && !guard
      ? "resting"
      : guard
        ? "patrolling"
        : cycle % 4 === 2
          ? "visiting"
          : cycle % 4 === 3
            ? "chatting"
            : "working";
  if (activity === "resting")
    return { point: safeNpcSpot(home), activity, wait: 12 + (seed % 7) };
  const radius = home.stay ? 12 : activity === "working" ? 35 : 140;
  const angle = ((seed % 360) * Math.PI) / 180;
  let point = {
    x: home.x + Math.cos(angle) * radius,
    y: home.y + Math.sin(angle) * radius * 0.8,
  };
  if (!home.stay && activity !== "working") {
    let distance = Infinity;
    const desired = { ...point };
    for (const road of ROAD_NETWORK)
      for (let i = 1; i < road.points.length; i++) {
        const a = road.points[i - 1]!,
          b = road.points[i]!,
          dx = b[0] - a[0],
          dy = b[1] - a[1];
        const t = Math.max(
          0,
          Math.min(
            1,
            ((desired.x - a[0]) * dx + (desired.y - a[1]) * dy) /
              (dx * dx + dy * dy || 1),
          ),
        );
        const p = { x: a[0] + t * dx, y: a[1] + t * dy };
        const d = Math.hypot(p.x - desired.x, p.y - desired.y);
        if (
          d < distance &&
          Math.hypot(p.x - home.x, p.y - home.y) < 200 &&
          npcWalkable(p.x, p.y)
        ) {
          point = p;
          distance = d;
        }
      }
  }
  return { point: safeNpcSpot(point), activity, wait: 4 + (seed % 7) };
}
