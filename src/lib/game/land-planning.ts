import { SUNSTEP_FEATURES } from "./data/sunstep";
import polygonClipping, { type MultiPolygon } from "polygon-clipping";
import { ROAD_NETWORK } from "./data/country";
import {
  PLANNED_ROADS,
  roadPortion,
  type EstateHome,
  type RoadWorks,
} from "./data/expansion";
import { roadFootprint } from "./data/road-footprint";
import {
  onIsland,
  onGrass,
  onDesert,
  nobleRise,
  ISLAND_POLY,
  DESERT_POLY,
} from "./world3";
import { CAPITOL_SHOPS, TOWN_GRIDS, cellsOf } from "./data/grids";
import { COURTS, PUBS, type CivicState } from "./data/civic";
export type LandRect = { x: number; y: number; w: number; h: number };
const PUBLIC_ROADS = [...ROAD_NETWORK, ...PLANNED_ROADS];
const corridor = roadFootprint(
  PUBLIC_ROADS.map((r) => ({ ...r, width: r.width / 0.05 + 8 })),
);
export const publicRoadLand = corridor;
const titledLand = polygonClipping.union([ISLAND_POLY], [DESERT_POLY]);
export function parcelLand(rect: LandRect): MultiPolygon {
  const { x, y, w, h } = rect;
  const land = polygonClipping.intersection(
    [
      [
        [x, y],
        [x + w, y],
        [x + w, y + h],
        [x, y + h],
        [x, y],
      ],
    ],
    titledLand,
  );
  return land.length ? polygonClipping.difference(land, corridor, ...occupiedLand) : [];
}
export function landArea(polys: MultiPolygon) {
  return polys.reduce(
    (n, polygon) =>
      n +
      polygon.reduce((sum, ring, index) => {
        const area =
          Math.abs(
            ring.reduce((s, p, i) => {
              const next = ring[(i + 1) % ring.length]!;
              return s + p[0] * next[1] - next[0] * p[1];
            }, 0),
          ) / 2;
        return sum + (index === 0 ? area : -area);
      }, 0),
    0,
  );
}
export function insideParcel(p: LandRect, x: number, y: number) {
  return x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h;
}
export function nearestRoad(x: number, y: number) {
  let best = { x: 0, y: 0, distance: Infinity };
  for (const road of ROAD_NETWORK)
    for (let i = 1; i < road.points.length; i++) {
      const a = road.points[i - 1]!,
        b = road.points[i]!,
        dx = b[0] - a[0],
        dy = b[1] - a[1];
      const t = Math.max(
        0,
        Math.min(
          1,
          ((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy || 1),
        ),
      );
      const px = a[0] + t * dx,
        py = a[1] + t * dy,
        d = Math.hypot(px - x, py - y);
      if (d < best.distance) best = { x: px, y: py, distance: d };
    }
  return best;
}
const FIXED_BUILDINGS = [
  {...SUNSTEP_FEATURES.hotel,w:35,h:28},
  {...SUNSTEP_FEATURES.fountain,w:50,h:50},
  {...SUNSTEP_FEATURES.oasis,w:65,h:65},
  {...SUNSTEP_FEATURES.marquee,w:35,h:15},
  ...CAPITOL_SHOPS.map((p) => ({ ...p, w: 35, h: 28 })),
  ...TOWN_GRIDS.flatMap(cellsOf).map((p) => ({ ...p, w: 28, h: 22 })),
  ...COURTS.map((p) => ({
    ...p,
    w: p.town === "capitol" ? 100 : 35,
    h: p.town === "capitol" ? 70 : 30,
  })),
  ...PUBS.map((p) => ({ ...p, w: 28, h: 22 })),
  { x: 980, y: 640, w: 32, h: 28 },
  { x: 560, y: 790, w: 35, h: 28 },
];
const occupiedLand: MultiPolygon = FIXED_BUILDINGS.map(({x,y,w,h})=>[[[x-w,y-h],[x+w,y-h],[x+w,y+h],[x-w,y+h],[x-w,y-h]]]);
export function buildingSiteClear(
  x: number,
  y: number,
  others: { x: number; y: number }[] = [],
) {
  if (
    !Number.isFinite(x) ||
    !Number.isFinite(y) ||
    nobleRise(x, y) > 0.15 ||
    Math.hypot(x - 520, y - 190) < 135
  )
    return false;
  if (
    ![-26, 26].every((dx) =>
      [-24, 24].every(
        (dy) => onGrass(x + dx, y + dy) || onDesert(x + dx, y + dy),
      ),
    )
  )
    return false;
  if (
    FIXED_BUILDINGS.some(
      (b) => Math.abs(x - b.x) < b.w + 27 && Math.abs(y - b.y) < b.h + 25,
    )
  )
    return false;
  if (others.some((b) => Math.abs(x - b.x) < 56 && Math.abs(y - b.y) < 50))
    return false;
  for (const r of PUBLIC_ROADS)
    for (let i = 1; i < r.points.length; i++) {
      const a = r.points[i - 1]!,
        b = r.points[i]!,
        steps = Math.max(
          1,
          Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 8),
        );
      const half = r.width / 0.05 / 2 + 4;
      for (let step = 0; step <= steps; step++) {
        const px = a[0] + ((b[0] - a[0]) * step) / steps,
          py = a[1] + ((b[1] - a[1]) * step) / steps;
        const dx = Math.max(0, Math.abs(px - x) - 26),
          dy = Math.max(0, Math.abs(py - y) - 24);
        if (Math.hypot(dx, dy) < half) return false;
      }
    }
  return true;
}
export function parcelBuildingSpot(
  rect: LandRect,
  others: { x: number; y: number }[] = [],
) {
  const candidates: { x: number; y: number; distance: number }[] = [];
  for (let x = rect.x + 30; x <= rect.x + rect.w - 30; x += 20)
    for (let y = rect.y + 28; y <= rect.y + rect.h - 28; y += 20) {
      if (buildingSiteClear(x, y, others))
        candidates.push({ x, y, distance: nearestRoad(x, y).distance });
    }
  return candidates.sort((a, b) => a.distance - b.distance)[0] ?? null;
}
export function civicParcelOwner(rect: LandRect, civic: CivicState) {
  const plot = civic.plots.find(
    (p) =>
      (p.stories > 0 || p.shares.length > 0) && insideParcel(rect, p.x, p.y),
  );
  if (!plot) return null;
  return (
    civic.gnomes.find((g) => g.id === plot.owner || g.id === plot.shares[0])
      ?.name ?? "Town residents"
  );
}
export function estateAccess(home: EstateHome) {
  const road = nearestRoad(home.x, home.y);
  const yaw = Math.atan2(road.x - home.x, road.y - home.y);
  return {
    yaw,
    points: [
      [home.x + Math.sin(yaw) * 23, home.y + Math.cos(yaw) * 23],
      [road.x, road.y],
    ] as [number, number][],
  };
}
export function developedRoads(
  works: RoadWorks,
  estate: Record<string, EstateHome>,
) {
  return [
    ...ROAD_NETWORK.filter((r) => !PLANNED_ROADS.some((p) => p.id === r.id)),
    ...PLANNED_ROADS.map((r) =>
      works.completed.includes(r.id)
        ? r
        : { ...r, width: 0.45, surface: "dirt" as const },
    ),
    ...(works.active
      ? PLANNED_ROADS.filter((r) => r.id === works.active!.id).map((r) => ({
          ...r,
          id: `${r.id}-built`,
          points: roadPortion(r.points, works.active!.progress),
        }))
      : []),
    ...Object.entries(estate).map(([id, home]) => ({
      id: `estate-${id}`,
      points: estateAccess(home).points,
      width: 0.6,
      surface: "gravel" as const,
    })),
  ];
}

/** Narrow construction clearance for streets, distinct from a house footprint. */
export function roadSiteClear(x:number,y:number,others:{x:number;y:number}[]=[]){
 if(!Number.isFinite(x)||!Number.isFinite(y)||nobleRise(x,y)>.15)return false;
 if(![-13,13].every(dx=>[-13,13].every(dy=>onGrass(x+dx,y+dy)||onDesert(x+dx,y+dy))))return false;
 if(Math.hypot(x-520,y-190)<135)return false;
 return !FIXED_BUILDINGS.some(b=>Math.abs(x-b.x)<b.w+13&&Math.abs(y-b.y)<b.h+13)&&!others.some(b=>Math.abs(x-b.x)<39&&Math.abs(y-b.y)<37);
}
