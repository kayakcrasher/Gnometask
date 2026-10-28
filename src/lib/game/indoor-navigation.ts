import {emptyHomeRoom,homeLayout} from "./home-room";
import type { InteriorId } from "./types";
export type IndoorPoint = { x: number; z: number };
export type IndoorBox = IndoorPoint & { w: number; d: number };
export type IndoorLayout = {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  spawn: IndoorPoint;
  boxes: IndoorBox[];
};
export function indoorLayout(id: InteriorId): IndoorLayout {
  if(id==="cottage")return homeLayout(emptyHomeRoom());
  const base = {
    minX: -3.05,
    maxX: 3.05,
    minZ: -2.35,
    maxZ: 2.55,
    spawn: { x: 0, z: 2.2 },
  };
  const plant = { x: 2.6, z: 1.8, w: 0.35, d: 0.35 };
  if (id === "neighbor" || id === "ship-cabin")
    return {
      ...base,
      boxes: [
        { x: -1.4, z: 0.2, w: 0.75, d: 0.45 },
        { x: 2, z: -1.3, w: 0.7, d: 1.05 },
        { x: -2.4, z: -1.6, w: 0.6, d: 0.4 },
        plant,
        ...(id==="ship-cabin"?[{x:0,z:-1.8,w:1.1,d:.4}]:[]),
        ...(id==="neighbor"?[{x:0,z:-1.5,w:.4,d:.4}]:[]),
      ],
    };
  if (id === "bank")
    return {
      ...base,
      boxes: [
        { x: 0, z: -1.5, w: 1.7, d: 0.45 },
        { x: 2.5, z: 0.3, w: 0.6, d: 0.4 },
        { x: -2.6, z: -2.6, w: 0.65, d: 0.3 },
      ],
    };
  if (id === "pub")
    return {
      ...base,
      boxes: [
        { x: 0, z: -1.4, w: 2.15, d: 0.45 },
        { x: -1.5, z: 0.3, w: 0.35, d: 0.35 },
        { x: 0.75, z: 0.8, w: 0.8, d: 0.35 },
      ],
    };
  if (id === "exchange")
    return {
      ...base,
      minX: -5.5,
      maxX: 5.5,
      minZ: -3.4,
      maxZ: 3.7,
      boxes: [{ x: 0, z: -1.2, w: 3.1, d: 0.65 }],
    };
  if (id === "court")
    return {
      ...base,
      minX: -2.65,
      maxX: 2.65,
      minZ: -2,
      maxZ: 2.55,
      boxes: [
        { x: 0, z: -1.5, w: 1.65, d: 0.95 },
        { x: -1.7, z: 0.35, w: 0.4, d: 0.5 },
        { x: 1.7, z: 0.35, w: 0.4, d: 0.5 },
      ],
    };
  if (id === "casino")
    return {
      ...base,
      minX: -4.3,
      maxX: 4.3,
      minZ: -2.9,
      maxZ: 3.2,
      boxes: [
        { x: -0.9, z: 0, w: 1.05, d: 1.05 },
        ...[1.8, 2.6, 3.4].map((x) => ({ x, z: -1.9, w: 0.4, d: 0.55 })),
        { x: -2, z: -1, w: 0.35, d: 0.35 },
      ],
    };
  return {
    ...base,
    boxes: [
      { x: 0, z: 0.2, w: 0.75, d: 0.45 },
      { x: 0, z: -1.3, w: 2.55, d: 0.45 },
      plant,
    ],
  };
}
export function indoorClear(layout: IndoorLayout, p: IndoorPoint) {
  return (
    Number.isFinite(p.x) &&
    Number.isFinite(p.z) &&
    p.x >= layout.minX &&
    p.x <= layout.maxX &&
    p.z >= layout.minZ &&
    p.z <= layout.maxZ &&
    !layout.boxes.some(
      (b) =>
        Math.abs(p.x - b.x) < b.w + 0.22 && Math.abs(p.z - b.z) < b.d + 0.22,
    )
  );
}
export function indoorSegment(l: IndoorLayout, a: IndoorPoint, b: IndoorPoint) {
  const n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.z - a.z) / 0.08));
  for (let i = 0; i <= n; i++)
    if (
      !indoorClear(l, {
        x: a.x + ((b.x - a.x) * i) / n,
        z: a.z + ((b.z - a.z) * i) / n,
      })
    )
      return false;
  return true;
}
export function indoorRoute(
  l: IndoorLayout,
  a: IndoorPoint,
  b: IndoorPoint,
): IndoorPoint[] | null {
  if (!indoorClear(l, b)) return null;
  if (indoorSegment(l, a, b)) return [b];
  const step = 0.2,
    key = (p: IndoorPoint) =>
      `${Math.round(p.x / step)},${Math.round(p.z / step)}`,
    first = {
      x: Math.round(a.x / step) * step,
      z: Math.round(a.z / step) * step,
    };
  if (!indoorSegment(l, a, first)) return null;
  const open = [first],
    seen = new Set([key(first)]),
    prev = new Map<string, IndoorPoint>();
  let end: IndoorPoint | null = null;
  for (let i = 0; i < open.length && i < 4000; i++) {
    const p = open[i]!;
    if (Math.hypot(p.x - b.x, p.z - b.z) < 0.3 && indoorSegment(l, p, b)) {
      end = p;
      break;
    }
    for (const [dx, dz] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ]) {
      const next = { x: p.x + dx! * step, z: p.z + dz! * step },
        id = key(next);
      if (seen.has(id) || !indoorSegment(l, p, next)) continue;
      seen.add(id);
      prev.set(id, p);
      open.push(next);
    }
  }
  if (!end) return null;
  const path = [end, b];
  while (key(end) !== key(first)) {
    end = prev.get(key(end))!;
    path.unshift(end);
  }
  return path;
}
export function indoorStep(
  l: IndoorLayout,
  p: IndoorPoint,
  direction: IndoorPoint,
  distance: number,
) {
  const out = { ...p },
    len = Math.hypot(direction.x, direction.z);
  if (!len) return out;
  for (const axis of ["x", "z"] as const) {
    const delta = (direction[axis] / len) * distance;
    if (!delta) continue;
    const next = { ...out, [axis]: out[axis] + delta };
    if (indoorSegment(l, out, next)) Object.assign(out, next);
  }
  return out;
}
