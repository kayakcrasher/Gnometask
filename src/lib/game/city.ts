import {THIMBLE_HOME} from "./thimblehaven";
import { economicClimate } from "./island-economy";
import { PLACE_ANCHORS } from "./data/layout";
import { PLAYER_START } from "./types";
import type { GameSave } from "./types";
import { parcelAt, parcelAccessOpen } from "./data/parcels";
import {
  buildingSiteClear,
  civicParcelOwner,
  developedRoads,
  insideParcel,
  roadSiteClear,
} from "./land-planning";
import { nearRoad, type RoadPoint, type RoadRoute } from "./data/road-layout";
export type CityKind = "home" | "depot" | "sawmill" | "workshop" | "housing";
export const CITY_BUILDINGS: Record<
  CityKind,
  {
    name: string;
    coins: number;
    hall: number;
    description: string;
  }
> = {
  home: {
    name: "Your home",
    coins: 180,
    hall: 1,
    description:
      "Move your existing home into your city. Your furniture, upgrades and interior come with you.",
  },
  depot: {
    name: "Trade depot",
    coins: 240,
    hall: 2,
    description:
      "Donkey carts sell delivered goods here. Revenue goes straight to your wallet.",
  },
  sawmill: {
    name: "Timber factory",
    coins: 380,
    hall: 2,
    description:
      "Every 27 seconds: 1 purchased supply unit becomes 2 crates worth 8 coins each.",
  },
  workshop: {
    name: "Furniture factory",
    coins: 900,
    hall: 3,
    description:
      "Every 27 seconds: 2 purchased supply units and 2 coins become 3 crates worth 14 coins each.",
  },
  housing: {
    name: "Workers’ cottages",
    coins: 200,
    hall: 2,
    description:
      "Successful trade attracts residents. Connected cottages earn 1 coin per resident every 90 seconds.",
  },
};
export type CityBuilding = {
  id: string;
  kind: CityKind;
  parcel: string;
  x: number;
  y: number;
  level: number;
  stock: number;
  supplies: number;
  work: number;
  residents: number;
  invested?: number;
};
export type CityCart = {
  factory: string;
  depot: string;
  route: RoadPoint[];
  distance: number;
  returning: boolean;
  cargo: number;
  supplies: number;
  autoSupply: boolean;
};
export type PlayerCity = {
  name: string;
  nextId: number;
  buildings: CityBuilding[];
  roads: RoadRoute[];
  carts: CityCart[];
  beat: number;
  earned: number;
  delivered: number;
  spent: number;
};
export const emptyCity = (): PlayerCity => ({
  name: "Thimblehaven",
  nextId: 1,
  buildings: [],
  roads: [],
  carts: [],
  beat: 0,
  earned: 0,
  delivered: 0,
  spent: 0,
});
export const cityRoads = (
  s: Pick<GameSave, "roadWorks" | "estate" | "city">,
) => [...developedRoads(s.roadWorks, s.estate), ...s.city.roads];
export const cityCapacity = (b: CityBuilding) => 20 * b.level;
export const cityUpgradeCost = (b: CityBuilding) => ({
  coins: CITY_BUILDINGS[b.kind].coins * b.level ** 2,
});
export function citySiteError(
  s: GameSave,
  kind: CityKind,
  x: number,
  y: number,
): string | null {
  if (kind === "home" && s.city.buildings.some((b) => b.kind === "home"))
    return "Your home is already in your city.";
  const p = s.deeds
    .map(parcelAt)
    .find(
      (p) =>
        p && insideParcel(p, x - 27, y - 25) && insideParcel(p, x + 27, y + 25),
    );
  if (!p) return "Choose a clear footprint wholly inside land you own.";
  if (!parcelAccessOpen(p,s.roadWorks.completed))
    return "Finish this district’s road project before building here.";
  if (civicParcelOwner(p, s.civic))
    return "A resident already holds ground in this parcel.";
  if (
    !buildingSiteClear(x, y, [
      ...Object.values(s.estate),
      ...s.city.buildings,
      ...s.civic.plots.filter((p) => p.stories > 0),
    ]) ||
    s.city.roads.some((r) => nearRoad(x, y, r, 28))
  )
    return "Keep buildings clear of roads, water, mountains and other buildings.";
  if (!cityRoads(s).some((r) => nearRoad(x, y, r, 75)))
    return "Lay a road closer first; buildings need road access within 75 map units.";
  if (s.townHallLevel < CITY_BUILDINGS[kind].hall)
    return `Requires Town Hall ${CITY_BUILDINGS[kind].hall}.`;
  if (s.city.buildings.length >= 120)
    return "This city has reached its 120-building limit.";
  return null;
}
export function snapCityRoad(s: GameSave, p: RoadPoint): RoadPoint {
  let best = p,
    distance = Infinity;
  for (const r of cityRoads(s))
    for (let i = 1; i < r.points.length; i++) {
      const a = r.points[i - 1]!,
        b = r.points[i]!,
        dx = b[0] - a[0],
        dy = b[1] - a[1],
        t = Math.max(
          0,
          Math.min(
            1,
            ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) /
              (dx * dx + dy * dy || 1),
          ),
        ),
        q: RoadPoint = [a[0] + dx * t, a[1] + dy * t],
        d = Math.hypot(q[0] - p[0], q[1] - p[1]);
      if (d < distance && d <= r.width / 0.05 / 2 + 10) {
        distance = d;
        best = q;
      }
    }
  return best;
}
export function cityRoadError(
  s: GameSave,
  a: RoadPoint,
  b: RoadPoint,
): string | null {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  if (!Number.isFinite(len) || len < 20 || len > 600)
    return "Road sections must be 20–600 map units long.";
  if (s.city.roads.length >= 180)
    return "This city has reached its 180-road limit.";
  const roads = cityRoads(s);
  if (
    !roads.some(
      (r) => nearRoad(a[0], a[1], r, 10) || nearRoad(b[0], b[1], r, 10),
    )
  )
    return "Start or end your road on an existing road.";
  let newGround = false;
  const occupied = [
    ...Object.values(s.estate),
    ...s.city.buildings,
    ...s.civic.plots.filter((p) => p.stories > 0),
  ];
  for (let i = 0, n = Math.ceil(len / 6); i <= n; i++) {
    const x = a[0] + ((b[0] - a[0]) * i) / n,
      y = a[1] + ((b[1] - a[1]) * i) / n;
    const parcels = s.deeds
      .map(parcelAt)
      .filter(
        (p) =>
          p &&
          !civicParcelOwner(p, s.civic) &&
          parcelAccessOpen(p,s.roadWorks.completed),
      );
    const owned = [-13, 13].every((dx) =>
      [-13, 13].every((dy) =>
        parcels.some((p) => p && insideParcel(p, x + dx, y + dy)),
      ),
    );
    // The short junction apron can meet a public road without buying the road itself.
    const junction = developedRoads(s.roadWorks, s.estate).some((r) =>
      nearRoad(x, y, r, 6),
    );
    if (owned && !junction) newGround = true;
    if ((!owned && !junction) || !roadSiteClear(x, y, occupied))
      return "Roads must stay on your land and meet public roads without crossing homes, water or steep ground.";
  }
  return newGround
    ? null
    : "This is already served by an existing road. Extend into your own clear land instead.";
}
export const routeLength = (p: RoadPoint[]) =>
  p
    .slice(1)
    .reduce((n, b, i) => n + Math.hypot(b[0] - p[i]![0], b[1] - p[i]![1]), 0);
export function routePosition(p: RoadPoint[], distance: number) {
  for (let i = 1; i < p.length; i++) {
    const a = p[i - 1]!,
      b = p[i]!,
      len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (distance <= len || i === p.length - 1) {
      const t = Math.max(0, Math.min(1, distance / (len || 1)));
      return {
        x: a[0] + (b[0] - a[0]) * t,
        y: a[1] + (b[1] - a[1]) * t,
        yaw: Math.atan2(b[0] - a[0], b[1] - a[1]),
      };
    }
    distance -= len;
  }
  return { x: p[0]?.[0] ?? 0, y: p[0]?.[1] ?? 0, yaw: 0 };
}
// Split actual road centre lines at intersections and building access points, then
// find a shortest route. A cart never earns by cutting straight across the island.
export function cityPath(
  s: GameSave,
  from: CityBuilding,
  to: CityBuilding,
): RoadPoint[] | null {
  type Seg = { a: RoadPoint; b: RoadPoint; cuts: number[] };
  const segments: Seg[] = cityRoads(s).flatMap((r) =>
    r.points.slice(1).map((b, i) => ({ a: r.points[i]!, b, cuts: [0, 1] })),
  );
  const project = (p: RoadPoint, g: Seg) => {
    const dx = g.b[0] - g.a[0],
      dy = g.b[1] - g.a[1];
    return Math.max(
      0,
      Math.min(
        1,
        ((p[0] - g.a[0]) * dx + (p[1] - g.a[1]) * dy) /
          (dx * dx + dy * dy || 1),
      ),
    );
  };
  const point = (g: Seg, t: number): RoadPoint => [
    g.a[0] + (g.b[0] - g.a[0]) * t,
    g.a[1] + (g.b[1] - g.a[1]) * t,
  ];
  const access = (building: CityBuilding) => {
    const p: RoadPoint = [building.x, building.y];
    let best: { g: Seg; t: number; d: number } | null = null;
    for (const g of segments) {
      const t = project(p, g),
        q = point(g, t),
        d = Math.hypot(q[0] - p[0], q[1] - p[1]);
      if (!best || d < best.d) best = { g, t, d };
    }
    if (!best || best.d > 100) return null;
    const q = point(best.g, best.t);
    const obstacles = [
      ...Object.values(s.estate),
      ...s.city.buildings.filter((b) => b.id !== building.id),
      ...s.civic.plots.filter((b) => b.stories > 0),
    ];
    for (let i = 1, n = Math.ceil(best.d / 6); i <= n; i++) {
      const x = p[0] + ((q[0] - p[0]) * i) / n,
        y = p[1] + ((q[1] - p[1]) * i) / n;
      if (
        obstacles.some((b) => Math.abs(x - b.x) < 26 && Math.abs(y - b.y) < 24)
      )
        return null;
    }
    best.g.cuts.push(best.t);
    return { p, q };
  };
  const start = access(from),
    end = access(to);
  if (!start || !end) return null;
  for (let i = 0; i < segments.length; i++)
    for (let j = i + 1; j < segments.length; j++) {
      const a = segments[i]!,
        b = segments[j]!,
        rx = a.b[0] - a.a[0],
        ry = a.b[1] - a.a[1],
        sx = b.b[0] - b.a[0],
        sy = b.b[1] - b.a[1],
        cross = rx * sy - ry * sx;
      if (Math.abs(cross) < 1e-8) {
        for (const p of [a.a, a.b]) {
          const t = project(p, b),
            q = point(b, t);
          if (Math.hypot(p[0] - q[0], p[1] - q[1]) < 0.002) b.cuts.push(t);
        }
        for (const p of [b.a, b.b]) {
          const t = project(p, a),
            q = point(a, t);
          if (Math.hypot(p[0] - q[0], p[1] - q[1]) < 0.002) a.cuts.push(t);
        }
        continue;
      }
      const dx = b.a[0] - a.a[0],
        dy = b.a[1] - a.a[1],
        t = (dx * sy - dy * sx) / cross,
        u = (dx * ry - dy * rx) / cross;
      if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
        a.cuts.push(t);
        b.cuts.push(u);
      }
    }
  const nodes: RoadPoint[] = [],
    edges = new Map<number, Map<number, number>>(),
    keys = new Map<string, number>();
  const node = (p: RoadPoint) => {
    const key = p.map((v) => v.toFixed(3)).join(",");
    let id = keys.get(key);
    if (id === undefined) {
      id = nodes.length;
      keys.set(key, id);
      nodes.push(p);
      edges.set(id, new Map());
    }
    return id;
  };
  const link = (a: RoadPoint, b: RoadPoint) => {
    const i = node(a),
      j = node(b),
      d = Math.hypot(a[0] - b[0], a[1] - b[1]);
    edges.get(i)!.set(j, d);
    edges.get(j)!.set(i, d);
  };
  for (const g of segments) {
    const cuts = [...new Set(g.cuts)].sort((a, b) => a - b);
    for (let i = 1; i < cuts.length; i++)
      link(point(g, cuts[i - 1]!), point(g, cuts[i]!));
  }
  link(start.p, start.q);
  link(end.p, end.q);
  const first = node(start.p),
    last = node(end.p),
    dist = new Map([[first, 0]]),
    prev = new Map<number, number>(),
    open = new Set([first]);
  while (open.size) {
    let current = -1,
      best = Infinity;
    for (const i of open)
      if (dist.get(i)! < best) {
        current = i;
        best = dist.get(i)!;
      }
    if (current === last) break;
    open.delete(current);
    for (const [j, d] of edges.get(current) ?? []) {
      if (best + d < (dist.get(j) ?? Infinity)) {
        dist.set(j, best + d);
        prev.set(j, current);
        open.add(j);
      }
    }
  }
  if (!dist.has(last)) return null;
  const route: RoadPoint[] = [];
  let i = last;
  while (i !== first) {
    route.unshift(nodes[i]!);
    i = prev.get(i)!;
  }
  route.unshift(nodes[first]!);
  return route;
}
export function stepCity(s: GameSave): {
  city: PlayerCity;
  coins: number;
} {
  const city: PlayerCity = {
    ...s.city,
    beat: (s.city.beat + 1) % 10,
    buildings: s.city.buildings.map((b) => ({ ...b })),
    carts: s.city.carts.map((c) => ({ ...c })),
  };
  let coins = s.coins;
  for (const b of city.buildings) {
    if (b.kind !== "sawmill" && b.kind !== "workshop") continue;
    b.work = (b.work + 1) % 3;
    if (b.work !== 0) continue;
    const timber = b.kind === "sawmill" ? 1 : 2,
      goods = b.kind === "sawmill" ? 2 : 3,
      cost = b.kind === "sawmill" ? 0 : 2;
    const batches = Math.min(
      b.level,
      Math.floor(b.supplies / timber),
      Math.floor((cityCapacity(b) - b.stock) / goods),
      cost ? Math.floor(coins / cost) : b.level,
    );
    b.supplies -= batches * timber;
    b.stock += batches * goods;
    coins -= batches * cost;
    city.spent += batches * cost;
  }
  for (const cart of city.carts) {
    const factory = city.buildings.find((b) => b.id === cart.factory),
      depot = city.buildings.find((b) => b.id === cart.depot);
    if (!factory || !depot) continue;
    const len = routeLength(cart.route);
    if (!len) continue;
    if (!cart.returning && cart.distance === 0 && cart.cargo === 0) {
      cart.cargo = Math.min(factory.stock, 6 * depot.level);
      factory.stock -= cart.cargo;
      if (
        !cart.cargo &&
        !(
          cart.autoSupply &&
          coins >= CITY_SUPPLY_PRICE &&
          factory.supplies < 100
        )
      )
        continue;
    }
    cart.distance += 54;
    if (cart.distance >= len) {
      cart.distance = 0;
      if (cart.returning) {
        factory.supplies += cart.supplies;
        cart.supplies = 0;
        cart.returning = false;
      } else {
        const income = cart.cargo * (factory.kind === "sawmill" ? 8 : 14);
        coins += income;
        city.earned += income;
        city.delivered += cart.cargo;
        cart.cargo = 0;
        cart.supplies = cart.autoSupply
          ? Math.min(
              10,
              Math.floor(coins / CITY_SUPPLY_PRICE),
              100 - factory.supplies,
            )
          : 0;
        coins -= cart.supplies * CITY_SUPPLY_PRICE;
        city.spent += cart.supplies * CITY_SUPPLY_PRICE;
        cart.returning = true;
      }
    }
  }
  if (city.beat === 0 && city.delivered > 0) {
    for (const b of city.buildings.filter((b) => b.kind === "housing")) {
      const connected = city.buildings.some(
        (d) => d.kind === "depot" && cityPath({ ...s, city }, b, d),
      );
      if (!connected) continue;
      const jobs=economicClimate(s).jobs;
      b.residents = jobs>=2?Math.min(b.level*4,b.residents+1):Math.max(0,b.residents-1);
      const tax=jobs>0?b.residents:0;
      coins += tax;city.earned += tax;
    }
  }
  return { city, coins };
}
// Rebuild routes from validated buildings and roads; never trust stored cargo paths.
export function coerceCity(raw: unknown, s: GameSave): PlayerCity {
  const out = emptyCity();
  if (!raw || typeof raw !== "object") return out;
  const r = raw as Partial<PlayerCity>;
  out.name =
    typeof r.name === "string"
      ? r.name.trim().slice(0, 28) || out.name
      : out.name;
  const whole = (v: unknown, max = 1e9) =>
    typeof v === "number" && Number.isFinite(v)
      ? Math.max(0, Math.min(max, Math.floor(v)))
      : 0;
  out.earned = whole(r.earned);
  out.spent = whole(r.spent);
  out.delivered = whole(r.delivered);
  out.beat = whole(r.beat, 9);
  const state = { ...s, city: out };
  for (const road of Array.isArray(r.roads) ? r.roads.slice(0, 180) : []) {
    if (!road || !Array.isArray(road.points) || road.points.length !== 2)
      continue;
    const [a, b] = road.points;
    if (
      !Array.isArray(a) ||
      !Array.isArray(b) ||
      a.length !== 2 ||
      b.length !== 2 ||
      ![...a, ...b].every(Number.isFinite)
    )
      continue;
    if (cityRoadError(state, a, b)) continue;
    out.roads.push({
      id: `city-road-${out.nextId++}`,
      points: [a, b],
      width: 1.2,
      surface: "gravel",
    });
  }
  const ids = new Set<string>();
  for (const b of Array.isArray(r.buildings) ? r.buildings.slice(0, 120) : []) {
    if (
      !b ||
      !Object.prototype.hasOwnProperty.call(CITY_BUILDINGS, b.kind) ||
      typeof b.id !== "string" ||
      ids.has(b.id) ||
      !Number.isFinite(b.x) ||
      !Number.isFinite(b.y)
    )
      continue;
    // Saved buildings retain their progression even if the Hall is later reset.
    if (!(b.kind==='home'&&b.parcel==='thimble-home'&&b.x===THIMBLE_HOME.x&&b.y===THIMBLE_HOME.y)&&citySiteError({ ...state, townHallLevel: 5 }, b.kind, b.x, b.y))
      continue;
    const p = s.deeds.map(parcelAt).find((p) => p && insideParcel(p, b.x, b.y));
    if (!p) continue;
    const level = Math.max(1, whole(b.level, 3));
    out.buildings.push({
      id: b.id,
      kind: b.kind,
      parcel: p.id,
      x: b.x,
      y: b.y,
      level,
      stock: whole(b.stock, 20 * level),
      supplies: whole(b.supplies, 100),
      work: whole(b.work, 2),
      residents: whole(b.residents, 4 * level),
      invested:
        whole(b.invested) ||
        CITY_BUILDINGS[b.kind].coins *
          (1 +
            Array.from({ length: level - 1 }, (_, i) => (i + 1) ** 2).reduce(
              (a, b) => a + b,
              0,
            )),
    });
    ids.add(b.id);
  }
  for (const c of Array.isArray(r.carts) ? r.carts.slice(0, 120) : []) {
    if (!c || out.carts.some((a) => a.factory === c.factory)) continue;
    const f = out.buildings.find(
        (b) =>
          b.id === c.factory && (b.kind === "sawmill" || b.kind === "workshop"),
      ),
      d = out.buildings.find((b) => b.id === c.depot && b.kind === "depot");
    if (!f || !d) continue;
    const route = cityPath(state, f, d);
    if (!route) continue;
    out.carts.push({
      factory: f.id,
      depot: d.id,
      route,
      returning: c.returning === true,
      distance: Math.min(
        whole(c.distance),
        Math.max(0, routeLength(route) - 0.001),
      ),
      cargo: c.returning === true ? 0 : whole(c.cargo, 6 * d.level),
      supplies:
        c.returning === true
          ? whole(c.supplies, Math.min(10, 100 - f.supplies))
          : 0,
      autoSupply: c.autoSupply === true,
    });
  }
  out.nextId = Math.max(
    out.nextId,
    whole(r.nextId, 1000000),
    ...out.buildings
      .map((b) => Number(b.id.split("-").at(-1)) + 1)
      .filter(Number.isFinite),
  );
  return out;
}

export const CITY_SUPPLY_PRICE = 3;
export function playerHome(s: Pick<GameSave, "city">) {
  return (
    s.city.buildings.find((b) => b.kind === "home") ?? THIMBLE_HOME
  );
}
export function playerHomeDoor(s: Pick<GameSave, "city">) {
  const h = s.city.buildings.find((b) => b.kind === "home");
  return h ? { x: h.x, y: h.y + 34 } : {x:THIMBLE_HOME.x,y:THIMBLE_HOME.y+34};
}

export function cityDeedDeveloped(
  city: PlayerCity,
  parcel: { id: string; x: number; y: number; w: number; h: number },
) {
  if (city.buildings.some((b) => b.parcel === parcel.id)) return true;
  return city.roads.some((r) =>
    r.points.slice(1).some((b, i) => {
      const a = r.points[i]!;
      let enter = 0,
        leave = 1;
      for (const [start, end, min, max] of [
        [a[0], b[0], parcel.x - 12, parcel.x + parcel.w + 12],
        [a[1], b[1], parcel.y - 12, parcel.y + parcel.h + 12],
      ]) {
        const delta = end! - start!;
        if (Math.abs(delta) < 1e-8) {
          if (start! < min! || start! > max!) return false;
          continue;
        }
        const t1 = (min! - start!) / delta,
          t2 = (max! - start!) / delta;
        enter = Math.max(enter, Math.min(t1, t2));
        leave = Math.min(leave, Math.max(t1, t2));
        if (enter > leave) return false;
      }
      return true;
    }),
  );
}

export function citySetupCost(city: PlayerCity, kind: CityKind) {
  return Math.ceil(
    CITY_BUILDINGS[kind].coins *
      (1 + city.buildings.filter((b) => b.kind === kind).length * 0.25),
  );
}
export const HOME_UPGRADE_COST = [0, 240, 720, 2160];
