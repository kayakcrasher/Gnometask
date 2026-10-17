import { boatById } from "./data/boats";
import { onIsland } from "./world3";
import { levelFromXp } from "./xp";

export type SeaPoint = { x: number; y: number };
export const HARBOUR_APPROACH: SeaPoint = { x: -35, y: 530 };
export const DOCKING_RANGE = 100;
export const SAILING_XP_DISTANCE = 600;
export const SEA_BOUNDS = { minX: -600, maxX: 4900, minY: -480, maxY: 1840 };

export function sailingSpeed(id: string, xp: number) {
  return (boatById(id)?.speed ?? 180) * (1 + Math.min(0.25, (levelFromXp(xp) - 1) * 0.01));
}

/** Leave clearance for the hull instead of letting its centre scrape the beach. */
export function navigableWater(x: number, y: number) {
  if (!Number.isFinite(x) || !Number.isFinite(y) || x < SEA_BOUNDS.minX || x > SEA_BOUNDS.maxX
    || y < SEA_BOUNDS.minY || y > SEA_BOUNDS.maxY) return false;
  return [[0, 0], [12, 0], [-12, 0], [0, 12], [0, -12]].every(([dx, dy]) => !onIsland(x + dx!, y + dy!));
}

export function clearSeaSegment(a: SeaPoint, b: SeaPoint) {
  if (![a.x, a.y, b.x, b.y].every(Number.isFinite)) return false;
  const steps = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 10));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    if (!navigableWater(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t)) return false;
  }
  return true;
}

/** A* water routes, simplified into visible legs. Boats can sail around headlands. */
export function seaRoute(start: SeaPoint, target: SeaPoint): SeaPoint[] | null {
  if (!navigableWater(start.x, start.y) || !navigableWater(target.x, target.y)) return null;
  if (clearSeaSegment(start, target)) return [target];
  const grid = 48;
  const key = (x: number, y: number) => `${x},${y}`;
  const water = new Map<string, boolean>();
  const allowed = (x: number, y: number) => {
    const id = key(x, y);
    if (!water.has(id)) water.set(id, navigableWater(x * grid, y * grid));
    return water.get(id)!;
  };
  const anchor = (point: SeaPoint) => {
    const candidates: SeaPoint[] = [];
    const cx = Math.round(point.x / grid), cy = Math.round(point.y / grid);
    for (let dx = -2; dx <= 2; dx++) for (let dy = -2; dy <= 2; dy++) {
      if (allowed(cx + dx, cy + dy)) candidates.push({ x: cx + dx, y: cy + dy });
    }
    return candidates.sort((a, b) => Math.hypot(a.x * grid - point.x, a.y * grid - point.y)
      - Math.hypot(b.x * grid - point.x, b.y * grid - point.y))
      .find(p => clearSeaSegment(point, { x: p.x * grid, y: p.y * grid }));
  };
  const first = anchor(start), last = anchor(target);
  if (!first || !last) return null;
  type Node = SeaPoint & { cost: number; score: number; parent?: Node };
  const open: Node[] = [];
  const costs = new Map<string, number>();
  const push = (node: Node) => {
    let lo = 0, hi = open.length;
    while (lo < hi) { const mid = (lo + hi) >>> 1; if (open[mid]!.score > node.score) lo = mid + 1; else hi = mid; }
    open.splice(lo, 0, node);
  };
  push({ ...first, cost: 0, score: Math.hypot(last.x - first.x, last.y - first.y) });
  costs.set(key(first.x, first.y), 0);
  while (open.length) {
    const current = open.pop()!;
    if (current.cost > costs.get(key(current.x, current.y))!) continue;
    if (current.x === last.x && current.y === last.y) {
      const points: SeaPoint[] = [target];
      for (let node: Node | undefined = current; node; node = node.parent) points.push({ x: node.x * grid, y: node.y * grid });
      points.push(start);
      points.reverse();
      const route: SeaPoint[] = [];
      let from = 0;
      while (from < points.length - 1) {
        let next = points.length - 1;
        while (next > from + 1 && !clearSeaSegment(points[from]!, points[next]!)) next--;
        route.push(points[next]!);
        from = next;
      }
      return route;
    }
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
      if (!dx && !dy) continue;
      const x = current.x + dx, y = current.y + dy;
      if (!allowed(x, y) || !clearSeaSegment({ x: current.x * grid, y: current.y * grid }, { x: x * grid, y: y * grid })) continue;
      const cost = current.cost + Math.hypot(dx, dy);
      if (cost >= (costs.get(key(x, y)) ?? Infinity)) continue;
      costs.set(key(x, y), cost);
      push({ x, y, cost, score: cost + Math.hypot(last.x - x, last.y - y), parent: current });
    }
  }
  return null;
}
