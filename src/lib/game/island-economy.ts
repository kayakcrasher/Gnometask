import { sharePrice, STOCKS } from "./data/market";
import type { GameSave, Raid } from "./types";
export type EconomyState = {
  threats: Raid[];
  day: number;
  beat: number;
  relief: number;
  gateway: boolean;
  deedBasis: Record<string, { paid: number; day: number }>;
  landProfit: number;
  lastDividend: number;
  gatewayEarned: number;
  history: Record<string, { factor: number; index: number }>;
};
export const emptyEconomy = (): EconomyState => ({
  threats: [],
  day: 1,
  beat: 0,
  relief: 0,
  gateway: false,
  deedBasis: {},
  landProfit: 0,
  lastDividend: 0,
  gatewayEarned: 0,
  history: {},
});
export type EconomyWorld = Pick<
  GameSave,
  "daysPlayed" | "economy" | "buildingHp" | "landing" | "lifeDragon"
> & { raids?: Raid[] };
export function quoteDay(s: Pick<GameSave, "daysPlayed" | "economy">) {
  return Math.max(1, s.daysPlayed, s.economy?.day ?? 1);
}
export function marketCycle(day: number) {
  return 1 + 0.3 * Math.sin(((Math.max(1, day) - 1) * Math.PI) / 24);
}
export function securityPressure(s: EconomyWorld) {
  const enemies = (s.raids ?? s.economy?.threats ?? []).filter(
    (r) => r.hp > 0,
  ).length;
  const ruins = Object.values(s.buildingHp ?? {}).filter((h) => h < 20).length;
  return Math.min(
    1,
    enemies * 0.065 +
      (s.landing?.goblins.filter((g) => g.alive).length ?? 0) * 0.025 +
      ruins * 0.2 +
      (s.lifeDragon?.state === "raiding" ? 0.25 : 0),
  );
}
export function economicClimate(s: EconomyWorld) {
  const day = quoteDay(s),
    security = securityPressure(s),
    factor = s.economy
      ? Math.max(0.3, marketCycle(day) * (1 - security * 0.65))
      : 1;
  const phase =
    factor < 0.56
      ? "depression"
      : factor < 0.86
        ? "recession"
        : factor > 1.14
          ? "boom"
          : "stable";
  const jobs =
    phase === "depression"
      ? 0
      : phase === "recession"
        ? 1
        : phase === "boom"
          ? 4
          : 3;
  const basket =
    STOCKS.reduce((sum, stock) => sum + sharePrice(stock.id, day), 0) /
    STOCKS.reduce((sum, stock) => sum + stock.start, 0);
  return {
    day,
    factor,
    security,
    phase,
    jobs,
    index: Math.round(basket * factor * 100),
    headline:
      phase === "depression"
        ? "Shops shutter as raids and falling confidence drain the island."
        : phase === "recession"
          ? "Orders slow. Families delay building and stretch their savings."
          : phase === "boom"
            ? "The Exchange is buoyant. Work, homes and northern demand are growing."
            : "Trade is steady. Households can save and plan their next move.",
  };
}
export const liveSharePrice = (id: string, day: number, factor: number) =>
  Math.max(1, Math.round(sharePrice(id, day) * factor));
export function advanceEconomy(s: GameSave): EconomyState {
  const beat = s.economy.beat + 1,
    next = {
      ...s.economy,
      beat: beat % 40,
      day: Math.max(s.daysPlayed, s.economy.day) + (beat >= 40 ? 1 : 0),
    },
    c = economicClimate({ ...s, economy: next });
  return {
    ...next,
    history: Object.fromEntries([
      ...Object.entries(s.economy.history).filter(
        ([d]) => Number(d) > next.day - 100,
      ),
      [String(c.day), { factor: c.factor, index: c.index }],
    ]),
  };
}
export function coerceEconomy(raw: unknown, deeds: string[]): EconomyState {
  const out = emptyEconomy();
  if (!raw || typeof raw !== "object") return out;
  const r = raw as Partial<EconomyState>;
  out.threats = (Array.isArray(r.threats) ? r.threats : [])
    .filter(
      (t) =>
        t &&
        typeof t.id === "string" &&
        (t.kind === "goblin" || t.kind === "darkelf") &&
        Number.isFinite(t.x) &&
        Number.isFinite(t.y) &&
        Number.isFinite(t.hp) &&
        t.hp > 0,
    )
    .slice(0, 64)
    .map((t) => ({ ...t, hp: Math.min(10000, t.hp) }));
  const whole = (v: unknown, max = 1e7) =>
    typeof v === "number" && Number.isFinite(v)
      ? Math.max(0, Math.min(max, Math.floor(v)))
      : 0;
  out.day = Math.max(1, whole(r.day, 100000));
  out.lastDividend = whole(r.lastDividend, 100000);
  out.gatewayEarned = whole(r.gatewayEarned);
  for (const [day, h] of Object.entries(r.history ?? {}).slice(-100)) {
    if (
      /^\d+$/.test(day) &&
      h &&
      Number.isFinite(h.factor) &&
      h.factor >= 0.3 &&
      h.factor <= 1.5 &&
      Number.isFinite(h.index)
    )
      out.history[day] = {
        factor: h.factor,
        index: Math.max(0, Math.floor(h.index)),
      };
  }
  out.beat = whole(r.beat, 39);
  out.relief = whole(r.relief);
  out.gateway = r.gateway === true;
  out.landProfit =
    typeof r.landProfit === "number" && Number.isFinite(r.landProfit)
      ? Math.max(-1e9, Math.min(1e9, Math.floor(r.landProfit)))
      : 0;
  for (const id of deeds) {
    const b = r.deedBasis?.[id];
    if (
      b &&
      typeof b.paid === "number" &&
      Number.isFinite(b.paid) &&
      b.paid > 0
    )
      out.deedBasis[id] = {
        paid: whole(b.paid),
        day: Math.max(1, whole(b.day)),
      };
  }
  return out;
}

export function economicDividend(s: GameSave) {
  const c = economicClimate(s);
  if (c.day % 7 !== 0 || c.day <= s.economy.lastDividend)
    return { economy: s.economy, pay: 0 };
  const pay = STOCKS.reduce((sum, stock) => {
    const held = s.shares[stock.id] ?? 0;
    return (
      sum +
      (held > 0 && stock.yield
        ? Math.max(
            1,
            Math.floor(
              liveSharePrice(stock.id, c.day, c.factor) * stock.yield * held,
            ),
          )
        : 0)
    );
  }, 0);
  return { economy: { ...s.economy, lastDividend: c.day }, pay };
}
