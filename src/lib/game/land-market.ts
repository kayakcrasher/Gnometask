import type { Parcel } from "./data/parcels";
import type { GameSave } from "./types";
import { economicClimate } from "./island-economy";
export function landQuote(s: GameSave, p: Parcel) {
  const climate = economicClimate(s),
    road = p.requiredRoad ?? (p.northern ? "noble-reach" : null),
    access = road && s.roadWorks.completed.includes(road) ? 1.3 : 1;
  const nearby = s.civic.plots.filter(
    (h) =>
      h.stories > 0 &&
      Math.hypot(h.x - p.x - p.w / 2, h.y - p.y - p.h / 2) < 600,
  ).length;
  const demand =
    1 +
    Math.min(0.45, nearby * 0.025) +
    (p.northern && s.economy.gateway ? 0.15 : 0);
  const maturity = 1 + Math.min(0.4, (climate.day - 1) * 0.006);
  const buy = Math.max(
      8,
      Math.round(p.price * climate.factor * access * demand * maturity),
    ),
    sell = Math.max(1, Math.floor(buy * 0.85));
  return {
    buy,
    sell,
    basis: s.economy.deedBasis[p.id]?.paid ?? p.price,
    phase: climate.phase,
  };
}
