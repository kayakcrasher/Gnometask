import { PLACE_ANCHORS } from "./data/layout";
import type { PlaceId } from "./types";

export const SCALE = 0.05;

export function to3(x: number, y: number, h = 0): [number, number, number] {
  return [(x - 1400) * SCALE, h, (y - 740) * SCALE];
}

export function to2(x: number, z: number) {
  return { x: x / SCALE + 1400, y: z / SCALE + 740 };
}

/** Map-space outline (y grows south). Shared by walk collision, 3D mesh, and minimap. */
export const ISLAND_POLY: [number, number][] = [
  [80, 420],
  [110, 120],
  [420, 50],
  [720, 70],
  [1100, 40],
  [1680, 60],
  [2140, 50],
  [2520, 120],
  [2700, 260],
  [2640, 500],
  [2420, 700],
  [2140, 860],
  [1900, 1380],
  [1320, 1400],
  [940, 1320],
  [660, 1040],
  [140, 980],
  [50, 620],
];

function insidePoly(x: number, y: number, poly: [number, number][]) {
  let n = 0;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]!;
    const [xj, yj] = poly[j]!;
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + 0.0001) + xi) n += 1;
  }
  return n % 2 === 1;
}

export function expandPoly(poly: [number, number][], pad: number): [number, number][] {
  const cx = poly.reduce((s, p) => s + p[0], 0) / poly.length;
  const cy = poly.reduce((s, p) => s + p[1], 0) / poly.length;
  return poly.map(([x, y]) => {
    const dx = x - cx;
    const dy = y - cy;
    const len = Math.hypot(dx, dy) || 1;
    return [x + (dx / len) * pad, y + (dy / len) * pad];
  });
}

export const BEACH_POLY = expandPoly(ISLAND_POLY, 90);

export function onIsland(x: number, y: number) {
  return insidePoly(x, y, BEACH_POLY);
}

export function onGrass(x: number, y: number) {
  return insidePoly(x, y, ISLAND_POLY);
}

/**
 * THREE.Shape lives in XY, then we rotateX(-π/2): (x, y, 0) → (x, 0, -y).
 * Pass world X and -world Z so the mesh lands on the same coords as to3().
 */
export function shapePts(poly: [number, number][]): [number, number][] {
  return poly.map(([x, y]) => {
    const p = to3(x, y);
    return [p[0], -p[2]];
  });
}

export function groundY(x: number, y: number) {
  if (!onIsland(x, y)) return -0.4;
  const pond = Math.hypot(x - 520, y - 190);
  if (pond < 90) return -0.08;
  const ridge = Math.hypot(x - 1760, y - 340);
  if (ridge < 160) return 0.55 - ridge / 400;
  const mines = Math.hypot(x - 1380, y - 1220);
  if (mines < 140) return 0.28;
  const ruins = Math.hypot(x - 2360, y - 260);
  if (ruins < 140) return 0.35;
  if (!onGrass(x, y)) return 0.02;
  return 0.08;
}

export function nearestPlace(x: number, y: number): PlaceId {
  let best: PlaceId = "cottage";
  let d = Infinity;
  (Object.keys(PLACE_ANCHORS) as PlaceId[]).forEach((id) => {
    const a = PLACE_ANCHORS[id];
    const n = Math.hypot(a.x - x, a.y - y);
    if (n < d) {
      d = n;
      best = id;
    }
  });
  return best;
}
