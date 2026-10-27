import { NORTH_LANDING, PUBLIC_PORT } from "./ports";
import { oceanLanding, oceanLandings } from "./ocean-world";
import { seaRoute, clearSeaSegment, type SeaPoint } from "./sailing";
export type EnemyWreck = {
  id: string;
  kind: import("./data/boats").BoatId;
  x: number;
  y: number;
  seconds: number;
  looted: boolean;
  coins: number;
};
export type TowRescue = {
  boat: string;
  port: string;
  origin: SeaPoint;
  path: SeaPoint[];
  phase: "coming" | "towing";
  elapsed: number;
  duration: number;
  returnDuration: number;
};
export const rescuePorts = (x?:number,y?:number) => [
  PUBLIC_PORT,
  NORTH_LANDING,
  ...oceanLandings(x,y,16000).filter((p) => p.town),
];
export function rescuePort(id:string){return id==='capital'?PUBLIC_PORT:id==='north-landing'?NORTH_LANDING:(oceanLanding(id)?.town?oceanLanding(id):null);}
export function waterPathLength(path: SeaPoint[]) {
  return path
    .slice(1)
    .reduce((n, p, i) => n + Math.hypot(p.x - path[i]!.x, p.y - path[i]!.y), 0);
}
export function alongWaterPath(path: SeaPoint[], fraction: number) {
  let left = waterPathLength(path) * Math.max(0, Math.min(1, fraction));
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1]!,
      b = path[i]!,
      d = Math.hypot(b.x - a.x, b.y - a.y);
    if (left <= d)
      return {
        x: a.x + ((b.x - a.x) * left) / (d || 1),
        y: a.y + ((b.y - a.y) * left) / (d || 1),
        heading: Math.atan2(b.x - a.x, b.y - a.y),
      };
    left -= d;
  }
  return { ...path.at(-1)!, heading: 0 };
}
export function planTow(boat: string, origin: SeaPoint): TowRescue | null {
  for (const port of rescuePorts(origin.x,origin.y).sort(
    (a, b) =>
      Math.hypot(origin.x - a.water.x, origin.y - a.water.y) -
      Math.hypot(origin.x - b.water.x, origin.y - b.water.y),
  )) {
    const route = seaRoute(origin, port.water);
    if (!route) continue;
    const path = [origin, ...route],
      distance = waterPathLength(path);
    return {
      boat,
      port: port.id,
      origin: { ...origin },
      path,
      phase: "coming",
      elapsed: 0,
      duration: Math.max(12, Math.min(60, distance / 550)),
      returnDuration: Math.max(18, Math.min(120, distance / 380)),
    };
  }
  return null;
}
export function tugPosition(t: TowRescue) {
  const path = t.phase === "coming" ? [...t.path].reverse() : t.path;
  return alongWaterPath(path, t.elapsed / t.duration);
}
export function coerceRescue(v: unknown, owned: string[]): TowRescue | null {
  if (!v || typeof v !== "object") return null;
  const t = v as TowRescue;
  if (
    !owned.includes(t.boat) ||
    !rescuePort(t.port) ||
    !["coming", "towing"].includes(t.phase) ||
    ![t.elapsed, t.duration, t.returnDuration].every(
      (n) => Number.isFinite(n) && n >= 0,
    ) ||
    t.duration < 1 ||
    t.returnDuration < 1 ||
    !Array.isArray(t.path) ||
    t.path.length < 2 ||
    t.path.length > 128
  )
    return null;
  const path = t.path
    .filter((p) => p && Number.isFinite(p.x) && Number.isFinite(p.y))
    .map((p) => ({ x: p.x, y: p.y }));
  if (
    path.length !== t.path.length ||
    !path.slice(1).every((p, i) => clearSeaSegment(path[i]!, p))
  )
    return null;
  const port = rescuePort(t.port)!;
  if (
    Math.hypot(path.at(-1)!.x - port.water.x, path.at(-1)!.y - port.water.y) > 1
  )
    return null;
  return {
    ...t,
    path,
    origin: path[0]!,
    elapsed: Math.min(t.elapsed, t.duration,120),
    duration: Math.min(t.duration, 120),
    returnDuration: Math.min(t.returnDuration, 120),
  };
}
