import { ROADS } from "./data/country";
import { ROAD_PROJECTS } from "./data/expansion";
import { routeLength, routePosition } from "./city";
import { walkableLand } from "./world3";
import type { GameSave } from "./types";
export const CART_PRICE = 480,
  WAGON_PRICE = 1800,
  BUS_FARE = 6,
  CART_SPEED = 370,
  BUS_SPEED = 420;
export type Wagon = {
  id: string;
  route: string;
  owned: boolean;
  distance: number;
  direction: 1 | -1;
  dwell: number;
};
export type Transport = {
  cart: boolean;
  mounted: boolean;
  wagons: Wagon[];
  ride: string | null;
  earned: number;
  spent: number;
};
export const emptyTransport = (): Transport => ({
  cart: false,
  mounted: false,
  wagons: [
    {
      id: "public-tideham",
      route: "tideham",
      owned: false,
      distance: 0,
      direction: 1,
      dwell: 6,
    },
    {
      id: "public-greenlane",
      route: "greenlane",
      owned: false,
      distance: 0,
      direction: 1,
      dwell: 6,
    },
  ],
  ride: null,
  earned: 0,
  spent: 0,
});
export function transportRoutes(completed: string[]) {
  return [
    ...ROADS.map((r) => ({
      ...r,
      name:
        r.id === "tideham"
          ? "Tideham — Capitol"
          : r.id === "greenlane"
            ? "Capitol — Greenlane"
            : r.id === "haven"
              ? "Greenlane — Haven"
              : "Haven — Sunstep",
    })),
    ...ROAD_PROJECTS.filter((r) => completed.includes(r.id)).map((r) => ({
      id: r.id,
      name: r.name,
      points: r.points,
    })),
  ];
}
export function wagonPoint(w: Wagon, completed: string[]) {
  const r = transportRoutes(completed).find((r) => r.id === w.route);
  return r ? routePosition(r.points, w.distance) : null;
}
export const wagonQuote = (t: Transport) =>
  WAGON_PRICE * (1 + t.wagons.filter((w) => w.owned).length) ** 2;
export function coerceTransport(raw: unknown, completed: string[]): Transport {
  const out = emptyTransport();
  if (!raw || typeof raw !== "object") return out;
  const r = raw as Partial<Transport>,
    routes = transportRoutes(completed);
  out.cart = r.cart === true;
  out.mounted = out.cart && r.mounted === true;
  const seen = new Set<string>();
  for (const item of Array.isArray(r.wagons) ? r.wagons.slice(0, 8) : []) {
    if (!item || typeof item.id !== "string" || seen.has(item.id)) continue;
    const route = routes.find(
      (p) =>
        p.id ===
        (out.wagons.find((w) => w.id === item.id)?.route ?? item.route),
    );
    if (!route) continue;
    const original = out.wagons.find((w) => w.id === item.id);
    if (!original && (!item.owned || !/^owned-[1-6]$/.test(item.id))) continue;
    const w: Wagon = {
      id: item.id,
      route: original?.route ?? route.id,
      owned: !original,
      distance: Number.isFinite(item.distance)
        ? Math.max(0, Math.min(routeLength(route.points), item.distance))
        : 0,
      direction: item.direction === -1 ? -1 : 1,
      dwell: Number.isFinite(item.dwell)
        ? Math.max(0, Math.min(6, item.dwell))
        : 0,
    };
    seen.add(w.id);
    if (original) Object.assign(original, w);
    else out.wagons.push(w);
  }
  out.ride =
    typeof r.ride === "string" && out.wagons.some((w) => w.id === r.ride)
      ? r.ride
      : null;
  if (out.ride) out.mounted = false;
  for (const k of ["earned", "spent"] as const)
    out[k] =
      typeof r[k] === "number" && Number.isFinite(r[k])
        ? Math.max(0, Math.min(1e9, Math.floor(r[k])))
        : 0;
  return out;
}
export function stepTransport(s: GameSave, dt: number) {
  const t: Transport = {
    ...s.transport,
    wagons: s.transport.wagons.map((w) => ({ ...w })),
  };
  let civic = s.civic,
    coins = s.coins;
  for (const w of t.wagons) {
    const route = transportRoutes(s.roadWorks.completed).find(
      (r) => r.id === w.route,
    );
    if (!route) continue;
    if (w.owned && coins < 2) continue;
    if (w.dwell > 0) {
      w.dwell = Math.max(0, w.dwell - dt);
      continue;
    }
    const length = routeLength(route.points),
      next = w.distance + w.direction * BUS_SPEED * dt;
    if (next >= length || next <= 0) {
      w.distance = Math.max(0, Math.min(length, next));
      w.direction = w.direction === 1 ? -1 : 1;
      w.dwell = 6;
      if (w.owned) {
        const stop = routePosition(route.points, w.distance),
          payer = civic.gnomes.find(
            (g) =>
              g.good &&
              g.purse >= BUS_FARE &&
              Math.hypot(g.x - stop.x, g.y - stop.y) < 550,
          );
        const fare = payer ? BUS_FARE : 0;
        if (coins + fare < 2) {
          w.dwell = 12;
          continue;
        }
        if (payer)
          civic = {
            ...civic,
            gnomes: civic.gnomes.map((g) =>
              g.id === payer.id ? { ...g, purse: g.purse - fare } : g,
            ),
          };
        coins += fare - 2;
        t.earned += fare;
        t.spent += 2;
      }
    } else w.distance = next;
  }
  const rider = t.ride ? t.wagons.find((w) => w.id === t.ride) : null,
    point = rider ? wagonPoint(rider, s.roadWorks.completed) : null;
  return {
    transport: t,
    civic,
    coins,
    ...(point ? { gnomeX: point.x, gnomeY: point.y } : {}),
  };
}
export function roadsideExit(x: number, y: number) {
  for (const [dx, dy] of [
    [28, 0],
    [-28, 0],
    [0, 28],
    [0, -28],
    [0, 0],
  ])
    if (walkableLand(x + dx!, y + dy!)) return { x: x + dx!, y: y + dy! };
  return { x, y };
}
