export type RoadPoint = [number, number];
export type RoadSurface = "cobble" | "gravel" | "dirt";
export type RoadRoute = { id: string; points: RoadPoint[]; width: number; surface: RoadSurface };

/** Short quadratic bends stay within each corner's approach; endpoints never move. */
export function softenRoad(points: RoadPoint[], radius = 28): RoadPoint[] {
  if (points.length < 3) return points.map(p => [...p]);
  const result: RoadPoint[] = [[...points[0]!]];
  for (let i = 1; i < points.length - 1; i++) {
    const a = points[i - 1]!, b = points[i]!, c = points[i + 1]!;
    const incoming = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const outgoing = Math.hypot(c[0] - b[0], c[1] - b[1]);
    if (incoming < 0.001 || outgoing < 0.001) continue;
    const trim = Math.min(radius, incoming * 0.25, outgoing * 0.25);
    const start: RoadPoint = [b[0] + (a[0] - b[0]) * trim / incoming, b[1] + (a[1] - b[1]) * trim / incoming];
    const end: RoadPoint = [b[0] + (c[0] - b[0]) * trim / outgoing, b[1] + (c[1] - b[1]) * trim / outgoing];
    for (let step = 0; step <= 6; step++) {
      const t = step / 6, u = 1 - t;
      result.push([u * u * start[0] + 2 * u * t * b[0] + t * t * end[0], u * u * start[1] + 2 * u * t * b[1] + t * t * end[1]]);
    }
  }
  result.push([...points[points.length - 1]!]);
  return result;
}

export function nearRoad(x: number, y: number, route: Pick<RoadRoute, "points" | "width">, extra = 0) {
  const half = route.width / 0.05 / 2 + extra;
  return route.points.some((b, i) => {
    if (!i) return false;
    const a = route.points[i - 1]!;
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy || 1)));
    return Math.hypot(x - a[0] - dx * t, y - a[1] - dy * t) <= half;
  });
}
