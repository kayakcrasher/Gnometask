import { boatById } from "./data/boats";
import { clearSeaSegment, type SeaPoint } from "./sailing";
export const DOCK_STYLES = ["timber", "mint", "slate"] as const;
export type DockStyle = (typeof DOCK_STYLES)[number];
export const DOCK_UPGRADES = [15000, 45000, 180000] as const;
/** Surveyed waterfront parcels include the shore approach and their water easement. Roads remain public. */
export const PORT_SITES = [
  {
    id: "thimble",
    name: "Thimblehaven · North Quay",
    x: 1930,
    y: -3160,
    water: { x: 1700, y: -3200 },
    price: 18000,
    north: true,
  },
  {
    id: "spruce",
    name: "Thimblehaven · Spruce Wharf",
    x: 2050,
    y: -3470,
    water: { x: 1820, y: -3470 },
    price: 24000,
    north: true,
  },
  {
    id: "south",
    name: "Tideham · South Reach",
    x: 150,
    y: 850,
    water: { x: -80, y: 850 },
    price: 12000,
    north: false,
  },
] as const;
export const NORTH_LANDING = {
  north: true,
  id: "north-landing",
  name: "Thimblehaven public landing",
  x: 1920,
  y: -3070,
  water: { x: 1650, y: -3230 },
};
export const PUBLIC_PORT = {
  id: "capital",
  name: "Tideham public harbour",
  x: 96,
  y: 520,
  water: { x: -35, y: 530 },
};
export type Dock = { site: string; level: number; style: DockStyle };
export const BOAT_PARTS = [
  {
    id: "rigging",
    name: "Silkleaf rigging",
    price: 4000,
    description:
      "12% more sailing speed. Fine-woven lines and a new mast pennant.",
  },
  {
    id: "engine",
    name: "Copper acorn drive",
    price: 7500,
    description: "20% more sailing speed. A quiet auxiliary propeller.",
  },
  {
    id: "hold",
    name: "Expanded cargo hold",
    price: 12000,
    description: "50% larger shipping loads. Visible deck crates.",
  },
  {
    id: "rack",
    name: "Fishing rail & tackle rack",
    price: 2000,
    description: "Boat casts take 2 seconds instead of 2.6.",
  },
  {
    id: "lantern",
    name: "Firefly navigation lamps",
    price: 900,
    description: "Warm glowing lights along your boat.",
  },
  {
    id: "canopy",
    name: "Mintstripe sun canopy",
    price: 1600,
    description: "A cloth shelter above the aft deck.",
  },
] as const;
export type BoatPart = (typeof BOAT_PARTS)[number]["id"];
export type Shipment = {
  leg: "outbound" | "return";
  boat: string;
  origin: string;
  destination: string;
  elapsed: number;
  duration: number;
  cargo: number;
  cost: number;
  sale: number;
};
export type Ports = {
  plots: string[];
  docks: Dock[];
  parts: Record<string, BoatPart[]>;
  shipments: Shipment[];
  earned: number;
  spent: number;
  delivered: number;
};
export const emptyPorts = (): Ports => ({
  plots: [],
  docks: [],
  parts: {},
  shipments: [],
  earned: 0,
  spent: 0,
  delivered: 0,
});
export const portSite = (id: string) => PORT_SITES.find((p) => p.id === id);
export const portDestination = (id: string) =>
  id === "capital"
    ? PUBLIC_PORT
    : id === "north-landing"
      ? NORTH_LANDING
      : portSite(id);
export const speedBonus = (parts: readonly string[] = []) =>
  1 +
  (parts.includes("rigging") ? 0.12 : 0) +
  (parts.includes("engine") ? 0.2 : 0);
export function shippingQuote(
  boat: string,
  level: number,
  parts: readonly string[] = [],
  factor = 1,
) {
  const b = boatById(boat);
  if (!b?.cargo) return null;
  const cargo = Math.floor(b.cargo * (parts.includes("hold") ? 1.5 : 1));
  const cost = cargo * 20 + Math.ceil((cargo * 2) / level);
  const sale = Math.floor(cargo * 26 * Math.max(0.65, Math.min(1.3, factor)));
  return { cargo, cost, sale };
}
/** Surveyed offshore shipping lane: deterministic, cheap to restore and clear of headlands. */
const NORTH_LANE: SeaPoint[] = [
  { x: -35, y: 530 },
  { x: -1450, y: -2100 },
  { x: -1500, y: -2650 },
  { x: -1100, y: -3900 },
  { x: -850, y: -4350 },
  { x: -250, y: -4850 },
  { x: 550, y: -4900 },
  { x: 1050, y: -4350 },
  { x: 1700, y: -3200 },
];
const routes = new Map<string, SeaPoint[] | null>();
export function shippingRoute(origin: string, destination: string) {
  const key = origin + ">" + destination;
  if (routes.has(key)) return routes.get(key) ?? null;
  const a = portDestination(origin),
    b = portDestination(destination);
  if (!a || !b || origin === destination) return null;
  const northA = "north" in a && a.north,
    northB = "north" in b && b.north;
  let route: SeaPoint[];
  if (northA === northB) route = [b.water];
  else if (northB) route = [...NORTH_LANE, b.water];
  else route = [...NORTH_LANE].reverse().concat([b.water]);
  let from: SeaPoint = a.water;
  for (const point of route) {
    if (!clearSeaSegment(from, point)) {
      routes.set(key, null);
      return null;
    }
    from = point;
  }
  routes.set(key, route);
  return route;
}
/** Harbour navigation reuses surveyed lanes, avoiding a large A* search on mobile. */
export function portNavigationRoute(
  start: SeaPoint,
  targetId: string,
): SeaPoint[] | null {
  const target = portDestination(targetId);
  if (!target) return null;
  if (clearSeaSegment(start, target.water)) return [target.water];
  const choices = [PUBLIC_PORT, NORTH_LANDING, ...PORT_SITES].sort(
    (a, b) =>
      Math.hypot(start.x - a.water.x, start.y - a.water.y) -
      Math.hypot(start.x - b.water.x, start.y - b.water.y),
  );
  for (const source of choices) {
    if (source.id === targetId || !clearSeaSegment(start, source.water))
      continue;
    const lane = shippingRoute(source.id, targetId);
    if (lane) return [source.water, ...lane];
  }
  return null;
}
export function routeLength(route: SeaPoint[], start: SeaPoint) {
  let n = 0;
  for (const p of route) {
    n += Math.hypot(p.x - start.x, p.y - start.y);
    start = p;
  }
  return n;
}
export function shipmentPosition(trip: Shipment) {
  const a = portDestination(
    trip.leg === "return" ? trip.destination : trip.origin,
  );
  const route = shippingRoute(
    trip.leg === "return" ? trip.destination : trip.origin,
    trip.leg === "return" ? trip.origin : trip.destination,
  );
  if (!a || !route) return null;
  let from: SeaPoint = a.water,
    left = routeLength(route, from) * Math.min(1, trip.elapsed / trip.duration);
  for (const p of route) {
    const d = Math.hypot(p.x - from.x, p.y - from.y);
    if (left <= d)
      return {
        x: from.x + ((p.x - from.x) * left) / (d || 1),
        y: from.y + ((p.y - from.y) * left) / (d || 1),
        heading: Math.atan2(p.x - from.x, p.y - from.y),
      };
    left -= d;
    from = p;
  }
  return { ...from, heading: 0 };
}
export function coercePorts(v: unknown, hulls: string[]): Ports {
  const p = v && typeof v === "object" ? (v as Partial<Ports>) : {};
  const out = emptyPorts();
  out.plots = [
    ...new Set(
      Array.isArray(p.plots) ? p.plots.filter((id) => !!portSite(id)) : [],
    ),
  ];
  out.docks = (Array.isArray(p.docks) ? p.docks : [])
    .filter(
      (d, i, a) =>
        d &&
        out.plots.includes(d.site) &&
        a.findIndex((x) => x?.site === d.site) === i,
    )
    .map((d) => ({
      site: d.site,
      level: Math.max(1, Math.min(3, Math.floor(d.level) || 1)),
      style: DOCK_STYLES.includes(d.style) ? d.style : "timber",
    }));
  if (p.parts && typeof p.parts === "object")
    for (const [id, parts] of Object.entries(p.parts)) {
      if (
        boatById(id) &&
        (id === "row" || hulls.includes(id)) &&
        Array.isArray(parts)
      )
        out.parts[id] = [
          ...new Set(parts.filter((x) => BOAT_PARTS.some((b) => b.id === x))),
        ];
    }
  out.shipments = (Array.isArray(p.shipments) ? p.shipments : [])
    .filter(
      (t, i, a) =>
        t &&
        hulls.includes(t.boat) &&
        !!boatById(t.boat)?.cargo &&
        out.docks.some((d) => d.site === t.origin) &&
        t.destination !== t.origin &&
        (t.destination === "capital" ||
          out.docks.some((d) => d.site === t.destination)) &&
        a.findIndex((x) => x?.boat === t.boat) === i &&
        [t.elapsed, t.duration, t.cargo, t.cost, t.sale].every(
          (x) => Number.isFinite(x) && x >= 0,
        ) &&
        t.duration >= 1 &&
        t.elapsed < t.duration &&
        !!shippingRoute(t.origin, t.destination),
    )
    .map((t) => ({ ...t, leg: t.leg === "return" ? "return" : "outbound" }));
  for (const k of ["earned", "spent", "delivered"] as const)
    out[k] =
      typeof p[k] === "number" && Number.isFinite(p[k])
        ? Math.max(0, Math.floor(p[k]!))
        : 0;
  return out;
}
