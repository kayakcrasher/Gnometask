import { PLACE_ANCHORS } from "./data/layout";
import { deckY } from "./data/country";
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

function beachPad(x: number, y: number) {
  if (y > 980) return 220;
  if (x < 400) return 36;
  return 55;
}

export const BEACH_POLY: [number, number][] = ISLAND_POLY.map(([x, y]) => {
  const cx = 1400;
  const cy = 700;
  const dx = x - cx;
  const dy = y - cy;
  const len = Math.hypot(dx, dy) || 1;
  const pad = beachPad(x, y);
  return [x + (dx / len) * pad, y + (dy / len) * pad];
});

/**
 * New land east of the old shore. Where this overlaps the green island, the grass stays grass.
 * The far point is Sunstep, on the eastern desert shore.
 */
export const DESERT_POLY: [number, number][] = [
  [2700, 260],
  [2640, 500],
  [2420, 700],
  [2140, 860],
  [1900, 1120],
  [2300, 1280],
  [3000, 1220],
  [3480, 1040],
  [3580, 760],
  [3480, 460],
  [3160, 280],
];

export const DESERT_BEACH: [number, number][] = expandPoly(DESERT_POLY, 48);

export const MOUNT_NOBLE = { x: 1540, y: 190, name: "Mount Noble" };
/** Map-space radius of the cone. The mesh uses the same number, so feet meet rock. */
export const NOBLE_RADIUS = 460;
/** World-unit height of the cone above the grass. */
export const NOBLE_HEIGHT = 6.5;
/** Visual top of the grass. Feet use this so a gnome is not buried in the bevel. */
export const LAND_TOP = 0.28;
export const NOBLE_BASE = LAND_TOP;

/** Height of the cone above the grass. Linear, so it matches ConeGeometry. */
export function nobleRise(x: number, y: number) {
  const d = Math.hypot(x - MOUNT_NOBLE.x, y - MOUNT_NOBLE.y);
  if (d >= NOBLE_RADIUS) return 0;
  return NOBLE_HEIGHT * (1 - d / NOBLE_RADIUS);
}

export const SUNSTEP = { x: 3320, y: 760, name: "Sunstep" };

export function onGrass(x: number, y: number) {
  return insidePoly(x, y, ISLAND_POLY);
}

export function onDesert(x: number, y: number) {
  return insidePoly(x, y, DESERT_POLY) && !onGrass(x, y);
}

export function onIsland(x: number, y: number) {
  return insidePoly(x, y, BEACH_POLY) || insidePoly(x, y, DESERT_BEACH);
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
  if (pond < 90 && nobleRise(x, y) === 0) return -0.08;
  let h = onDesert(x, y)
    ? 0.24 + Math.abs(Math.sin(x * 0.012) * Math.cos(y * 0.011)) * 0.05
    : onGrass(x, y)
      ? LAND_TOP
      : 0.2;
  const ridge = Math.hypot(x - 1760, y - 340);
  if (ridge < 160) h = Math.max(h, 0.55 - ridge / 400);
  const mines = Math.hypot(x - 1380, y - 1220);
  if (mines < 140) h = Math.max(h, 0.28);
  const ruins = Math.hypot(x - 2360, y - 260);
  if (ruins < 140) h = Math.max(h, 0.35);
  const eastA = Math.hypot(x - 2480, y - 420);
  if (eastA < 150) h = Math.max(h, 0.12 + (1 - eastA / 150) * 0.85);
  const eastB = Math.hypot(x - 2320, y - 560);
  if (eastB < 120) h = Math.max(h, 0.1 + (1 - eastB / 120) * 0.55);
  const eastC = Math.hypot(x - 2200, y - 720);
  if (eastC < 100) h = Math.max(h, 0.1 + (1 - eastC / 100) * 0.4);
  const rise = nobleRise(x, y);
  if (rise > 0) h = Math.max(h, NOBLE_BASE + rise);
  const deck = deckY(x, y);
  if (deck > h) h = deck;
  return h;
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
