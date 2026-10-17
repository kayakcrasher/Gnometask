import {CITY_BUILDINGS,routeLength} from "./city";
import { ROAD_PROJECTS } from "./data/expansion";
import { CATALOG_BY_ID, bestCraft } from "./data/catalog";
import { BOATS } from "./data/boats";
import type { GameSave } from "./types";
export function developmentWorth(
  s: Pick<
    GameSave,
    "coins" | "ownedGear" | "hulls" | "deeds" | "estate" | "roadWorks" | "city"
  >,
) {
  return (
    ROAD_PROJECTS.filter(
      (p) =>
        s.roadWorks.completed.includes(p.id) || s.roadWorks.active?.id === p.id,
    ).reduce((n, p) => n + p.coins, 0) +
    s.city.buildings.reduce((n,b)=>n+(b.invested??CITY_BUILDINGS[b.kind].coins*(1+Array.from({length:b.level-1},(_,i)=>(i+1)**2).reduce((a,b)=>a+b,0))),0) +
    s.city.roads.reduce((n,r)=>n+Math.ceil(routeLength(r.points)/2),0)+s.city.carts.length*180+
    s.coins +
    s.ownedGear.reduce((n, id) => n + (CATALOG_BY_ID[id]?.price ?? 0), 0) +
    s.hulls.reduce(
      (n, id) => n + (BOATS.find((b) => b.id === id)?.price ?? 0),
      0,
    ) +
    s.deeds.length * 80 +
    Object.values(s.estate).reduce(
      (n, h) => n + [0, 120, 440, 1220][h.level]!,
      0,
    )
  );
}
export function developmentLevel(s: Parameters<typeof developmentWorth>[0]) {
  const worth = developmentWorth(s);
  return worth >= 8000
    ? 4
    : worth >= 3000
      ? 3
      : worth >= 1000
        ? 2
        : worth >= 250
          ? 1
          : 0;
}
export const DEVELOPMENT_LABELS = [
  "Quiet hollow",
  "Local trade",
  "Growing towns",
  "Prosperous island",
  "Thriving nation",
];
export function homeBuildQuote(level: number, ownedGear: string[]) {
  const base = [
    { coins: 120, logs: 0, crafting: 1, hall: 1 },
    { coins: 320, logs: 0, crafting: 15, hall: 2 },
    { coins: 780, logs: 0, crafting: 30, hall: 3 },
  ][level];
  if (!base) return null;
  const skill = bestCraft(ownedGear);
  return {
    ...base,
    coins: Math.ceil(base.coins * (1 - Math.min(0.25, skill * 0.015))),
    logs: Math.ceil(base.logs / (1 + skill * 0.05)),
  };
}
