import polygonClipping, { type Polygon, type Ring } from "polygon-clipping";

export type RoadLine = { points: [number, number][]; width: number };

/** Round-ended strips, merged before triangulation so junctions have no seams. */
export function roadFootprint(
  lines: RoadLine[],
  shoulder = false,
  exclude: RoadLine[] = [],
) {
  const strips: Polygon[] = [];
  for (const line of lines) {
    const radius =
      line.width / 2 + (shoulder ? Math.min(0.18, line.width * 0.12) : 0);
    for (let i = 1; i < line.points.length; i++) {
      const a = line.points[i - 1]!;
      const b = line.points[i]!;
      if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 0.0001) continue;
      const angle = Math.atan2(b[1] - a[1], b[0] - a[0]);
      const ring: Ring = [];
      for (const [center, start] of [
        [b, angle - Math.PI / 2],
        [a, angle + Math.PI / 2],
      ] as const) {
        for (let step = 0; step <= 8; step++) {
          const theta = start + (step * Math.PI) / 8;
          // Snap away trigonometric noise before the polygon union.
          ring.push([
            Math.round((center[0] + Math.cos(theta) * radius) * 1e6) / 1e6,
            Math.round((center[1] + Math.sin(theta) * radius) * 1e6) / 1e6,
          ]);
        }
      }
      ring.push([...ring[0]!] as [number, number]);
      strips.push([ring]);
    }
  }
  const merged = strips.length
    ? polygonClipping.union(strips[0]!, ...strips.slice(1))
    : [];
  const mask = exclude.length ? roadFootprint(exclude) : [];
  return merged.length && mask.length
    ? polygonClipping.difference(merged, mask)
    : merged;
}
