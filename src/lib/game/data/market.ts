export type Sector = "broad" | "defense" | "shipping" | "food" | "leisure" | "media" | "luxury";

export type Stock = {
  id: string;
  name: string;
  start: number;
  blurb: string;
  sector: Sector;
  /** Coins per share per week, as a fraction of current price. 0 = no dividend. */
  yield?: number;
  sure?: boolean;
  /** Most days rise. A few red days, never a long slide. */
  climb?: boolean;
};

export const QUARTER_DAYS = 90;

export const STOCKS: Stock[] = [
  { id: "g500", name: "Gnome500 ETF", start: 8, sector: "broad", yield: 0.015, sure: true, climb: true, blurb: "The whole hollow, in one share. It has red days. The year still climbs." },
  { id: "hull", name: "Hull & Keel", start: 14, sector: "shipping", yield: 0.02, blurb: "Shipwrights. Feast and famine with the tide." },
  { id: "pie", name: "Pie & Tide", start: 9, sector: "food", yield: 0.025, blurb: "Bakeries on three islands. Smells better than it balances." },
  { id: "salt", name: "Saltglass", start: 16, sector: "food", yield: 0.02, blurb: "Salt pans and bottles. A sharp stock." },
  { id: "moss", name: "Moss Hat Co", start: 7, sector: "luxury", blurb: "Hats. Some seasons everyone buys. Some seasons they don't." },
  { id: "lantern", name: "Lantern Ferry", start: 12, sector: "shipping", yield: 0.018, blurb: "Night boats. Pretty, and easily spooked." },
  { id: "keen", name: "Keen Edge", start: 18, sector: "defense", climb: true, blurb: "Weapons. A few soft days. The rest of the year it bites upward." },
  { id: "mail", name: "Mail & Plate", start: 15, sector: "defense", yield: 0.012, blurb: "Armour. A nervous stock, and a useful one." },
  { id: "oar", name: "Oar & Yard", start: 20, sector: "shipping", yield: 0.022, climb: true, blurb: "Boats. Wim keeps a share under the bed. The line climbs." },
  { id: "wall", name: "Watch & Wall", start: 13, sector: "defense", yield: 0.02, climb: true, blurb: "Town defense. Palisades, towers, and a price that likes the long watch." },
  { id: "clarion", name: "The Clarion", start: 10, sector: "media", yield: 0.015, blurb: "The paper. Two gold a copy. Slower than the news it prints." },
  { id: "gilded", name: "Gilded Cactus", start: 11, sector: "leisure", yield: 0.03, blurb: "Sunstep's strip. Loud, high, and occasionally on fire." },
];

export function isWeekend(days: number) {
  const dow = ((Math.max(1, days) - 1) % 7) + 1;
  return dow >= 6;
}

function unit(n: number) {
  const x = Math.sin(n) * 10000;
  return x - Math.floor(x);
}

/** A small, deterministic weekly bias by sector. */
function sectorBias(sector: Sector, day: number): number {
  const weekend = isWeekend(day);
  switch (sector) {
    case "broad":    return 0;
    case "shipping": return weekend ? -1 : 0;
    case "leisure":  return weekend ? 1 : 0;
    case "defense":  return day % 5 === 0 ? 1 : 0;
    case "food":     return day % 4 === 0 ? 1 : 0;
    case "media":    return day % 6 === 0 ? 1 : 0;
    case "luxury":   return weekend ? 0 : day % 3 === 0 ? 1 : 0;
  }
}

// --- Market events -------------------------------------------------------
// One event fires every 12 days. Deterministic by day, so the chart history
// is identical for every player. NPCs read these from the same source.

export type MarketEvent = {
  id: string;
  day: number;
  sector: Sector | "all";
  delta: number;
  headline: string;
};

const EVENT_POOL: Omit<MarketEvent, "day">[] = [
  { id: "harvest", sector: "food",    delta: 3,  headline: "A bumper harvest. Pie & Tide climbs." },
  { id: "raid",    sector: "defense", delta: 4,  headline: "Goblins probe the shore. Wall & Watch gains." },
  { id: "storm",   sector: "shipping", delta: -3, headline: "A storm off the coast. Hulls sit idle." },
  { id: "cruise",  sector: "leisure", delta: 3,  headline: "A cruise ship books the strip. Sunstep celebrates." },
  { id: "scoop",   sector: "media",   delta: 2,  headline: "The Clarion breaks the dock case wide open." },
  { id: "tariff",  sector: "shipping", delta: -2, headline: "A tariff on mainland crates. Shippers grumble." },
  { id: "rally",   sector: "all",     delta: 1,  headline: "The hollow trades up on a quiet week." },
  { id: "panic",   sector: "all",     delta: -1, headline: "A nervous week on the Exchange floor." },
  { id: "drought", sector: "food",    delta: -2, headline: "Rain stayed away. The co-op eyes the sky." },
  { id: "parade",  sector: "luxury",  delta: 2,  headline: "Hats in fashion after a festival. Moss Hat Co rallies." },
];

export function eventsThrough(day: number): MarketEvent[] {
  const d = Math.max(0, Math.floor(day));
  const out: MarketEvent[] = [];
  for (let i = 12; i <= d; i += 12) {
    const idx = (Math.floor(i / 12) - 1) % EVENT_POOL.length;
    out.push({ ...EVENT_POOL[idx]!, day: i });
  }
  return out;
}

export function eventsOn(day: number): MarketEvent[] {
  const d = Math.floor(day);
  if (!Number.isFinite(d) || d < 12 || d % 12 !== 0) return [];
  return [{ ...EVENT_POOL[(d / 12 - 1) % EVENT_POOL.length]!, day: d }];
}

export function latestEvent(day: number): MarketEvent | null {
  return eventsOn(Math.floor(day / 12) * 12)[0] ?? null;
}

function eventBias(sector: Sector, day: number): number {
  return eventsOn(day)
    .filter((e) => e.sector === sector || e.sector === "all")
    .reduce((sum, e) => sum + e.delta, 0);
}

// --- Pricing -------------------------------------------------------------

const priceHistory = new Map<string, number[]>();

export function sharePrice(id: string, days: number) {
  const stock = STOCKS.find((s) => s.id === id);
  if (!stock) return 1;
  const d = Number.isFinite(days) ? Math.max(0, Math.floor(days)) : 0;
  const history = priceHistory.get(id) ?? [stock.start];
  priceHistory.set(id, history);
  let price = history[history.length - 1]!;
  const climber = Boolean(stock.sure || stock.climb);
  for (let i = history.length; i <= d; i++) {
    const u = unit(i * 12.9898 + stock.start * 78.233);
    const walk = climber ? (u < 0.22 ? -1 : 1) : u < 0.46 ? -1 : u < 0.9 ? 1 : 0;
    const bias = sectorBias(stock.sector, i);
    const ev = eventBias(stock.sector, i);
    price = Math.max(1, price + walk + bias + ev);
    history.push(price);
  }
  return history[d]!;
}

export function priceSeries(id: string, days: number, n = 16) {
  const last = Number.isFinite(days) ? Math.max(0, Math.floor(days)) : 0;
  const count = Number.isFinite(n) ? Math.max(1, Math.floor(n)) : 16;
  const start = Math.max(0, last - (count - 1));
  const out: number[] = [];
  for (let d = start; d <= last; d++) out.push(sharePrice(id, d));
  return out;
}

export function nextGnomeRise(days: number) {
  const quarters = Math.floor(Math.max(0, days - 1) / QUARTER_DAYS);
  return (quarters + 1) * QUARTER_DAYS + 1;
}

/** Coins plus the days the hollow has been earning. Shops and the strip read this. */
export function hollowWorth(coins: number, days: number) {
  return Math.max(0, coins) + Math.max(0, days) * 3;
}

/** 0 sawdust pit, 1 motel, 2 strip resort, 3 fountain house, 4 glass tower. */
export function prosperity(coins: number, days: number) {
  const worth = hollowWorth(coins, days);
  if (worth >= 900) return 4;
  if (worth >= 420) return 3;
  if (worth >= 180) return 2;
  if (worth >= 70) return 1;
  return 0;
}

export const CASINO_STAGE = [
  "Sawdust pit",
  "Motel casino",
  "Strip resort",
  "Fountain house",
  "Glass tower",
] as const;

/** Weekly dividend on a holding. Pays on days divisible by 7. */
export function dividendOn(id: string, days: number, shares: number): number {
  if (days < 7 || days % 7 !== 0 || shares < 1) return 0;
  const stock = STOCKS.find((s) => s.id === id);
  if (!stock || !stock.yield) return 0;
  const price = sharePrice(id, days);
  return Math.max(1, Math.floor(price * stock.yield * shares));
}

/** Total dividend across every holding for a given day. */
export function totalDividend(days: number, shares: Record<string, number>): number {
  let total = 0;
  for (const [id, count] of Object.entries(shares)) {
    total += dividendOn(id, days, count);
  }
  return total;
}
