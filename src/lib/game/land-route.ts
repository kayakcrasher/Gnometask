import { walkableLand } from "./world3";
export type LandPoint = { x: number; y: number };
export function clearLandSegment(a: LandPoint, b: LandPoint) {
  if (![a.x, a.y, b.x, b.y].every(Number.isFinite)) return false;
  const steps = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 10));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    if (!walkableLand(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t))
      return false;
  }
  return true;
}

/** A* walking routes around lakes and coastal bays, simplified into long clear legs. */
export function landRoute(
  start: LandPoint,
  target: LandPoint,
): LandPoint[] | null {
  if (!walkableLand(start.x, start.y) || !walkableLand(target.x, target.y))
    return null;
  if (clearLandSegment(start, target)) return [target];
  const grid = 64;
  const key = (x: number, y: number) => `${x},${y}`;
  const water = new Map<string, boolean>();
  const allowed = (x: number, y: number) => {
    const id = key(x, y);
    if (!water.has(id)) water.set(id, walkableLand(x * grid, y * grid));
    return water.get(id)!;
  };
  const anchor = (point: LandPoint) => {
    const candidates: LandPoint[] = [];
    const cx = Math.round(point.x / grid),
      cy = Math.round(point.y / grid);
    for (let dx = -2; dx <= 2; dx++)
      for (let dy = -2; dy <= 2; dy++) {
        if (allowed(cx + dx, cy + dy))
          candidates.push({ x: cx + dx, y: cy + dy });
      }
    return candidates
      .sort(
        (a, b) =>
          Math.hypot(a.x * grid - point.x, a.y * grid - point.y) -
          Math.hypot(b.x * grid - point.x, b.y * grid - point.y),
      )
      .find((p) => clearLandSegment(point, { x: p.x * grid, y: p.y * grid }));
  };
  const first = anchor(start),
    last = anchor(target);
  if (!first || !last) return null;
  type Node = LandPoint & { cost: number; score: number; parent?: Node };
  const open: Node[] = [];
  const costs = new Map<string, number>();
  const push = (node: Node) => {
    let lo = 0,
      hi = open.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (open[mid]!.score > node.score) lo = mid + 1;
      else hi = mid;
    }
    open.splice(lo, 0, node);
  };
  push({
    ...first,
    cost: 0,
    score: Math.hypot(last.x - first.x, last.y - first.y),
  });
  costs.set(key(first.x, first.y), 0);
  while (open.length) {
    const current = open.pop()!;
    if (current.cost > costs.get(key(current.x, current.y))!) continue;
    if (current.x === last.x && current.y === last.y) {
      const points: LandPoint[] = [target];
      for (let node: Node | undefined = current; node; node = node.parent)
        points.push({ x: node.x * grid, y: node.y * grid });
      points.push(start);
      points.reverse();
      const route: LandPoint[] = [];
      let from = 0;
      while (from < points.length - 1) {
        let next = points.length - 1;
        while (
          next > from + 1 &&
          !clearLandSegment(points[from]!, points[next]!)
        )
          next--;
        route.push(points[next]!);
        from = next;
      }
      return route;
    }
    for (let dx = -1; dx <= 1; dx++)
      for (let dy = -1; dy <= 1; dy++) {
        if (!dx && !dy) continue;
        const x = current.x + dx,
          y = current.y + dy;
        if (
          !allowed(x, y) ||
          !clearLandSegment(
            { x: current.x * grid, y: current.y * grid },
            { x: x * grid, y: y * grid },
          )
        )
          continue;
        const cost = current.cost + Math.hypot(dx, dy);
        if (cost >= (costs.get(key(x, y)) ?? Infinity)) continue;
        costs.set(key(x, y), cost);
        push({
          x,
          y,
          cost,
          score: cost + Math.hypot(last.x - x, last.y - y),
          parent: current,
        });
      }
  }
  return null;
}
