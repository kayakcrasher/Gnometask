export type Stock = {
  id: string;
  name: string;
  start: number;
  blurb: string;
  sure?: boolean;
  /** Most days rise. A few red days, never a long slide. */
  climb?: boolean;
};

/** A quarter is 90 in-game days. The Gnome500 rises 15% each quarter. */
export const QUARTER_DAYS = 90;

export const STOCKS: Stock[] = [
  { id: "g500", name: "Gnome500 ETF", start: 8, sure: true, climb: true, blurb: "The whole hollow, in one share. It has red days. The year still climbs." },
  { id: "hull", name: "Hull & Keel", start: 14, blurb: "Shipwrights. Feast and famine with the tide." },
  { id: "pie", name: "Pie & Tide", start: 9, blurb: "Bakeries on three islands. Smells better than it balances." },
  { id: "salt", name: "Saltglass", start: 16, blurb: "Salt pans and bottles. A sharp stock." },
  { id: "moss", name: "Moss Hat Co", start: 7, blurb: "Hats. Some seasons everyone buys. Some seasons they don't." },
  { id: "lantern", name: "Lantern Ferry", start: 12, blurb: "Night boats. Pretty, and easily spooked." },
  { id: "keen", name: "Keen Edge", start: 18, climb: true, blurb: "Weapons. A few soft days. The rest of the year it bites upward." },
  { id: "mail", name: "Mail & Plate", start: 15, blurb: "Armour. A nervous stock, and a useful one." },
  { id: "oar", name: "Oar & Yard", start: 20, climb: true, blurb: "Boats. Wim keeps a share under the bed. The line climbs." },
  { id: "wall", name: "Watch & Wall", start: 13, climb: true, blurb: "Town defense. Palisades, towers, and a price that likes the long watch." },
];

export function isWeekend(days: number) {
  const dow = ((Math.max(1, days) - 1) % 7) + 1;
  return dow >= 6;
}

function unit(n: number) {
  const x = Math.sin(n) * 10000;
  return x - Math.floor(x);
}

/** Each day is its own coin. Climbers rise more often than they fall. The rest wander. */
export function sharePrice(id: string, days: number) {
  const stock = STOCKS.find((s) => s.id === id);
  if (!stock) return 1;
  const d = Math.max(0, Math.floor(days));
  let price = stock.start;
  const climber = Boolean(stock.sure || stock.climb);
  for (let i = 1; i <= d; i++) {
    const u = unit(i * 12.9898 + stock.start * 78.233);
    const delta = climber ? (u < 0.22 ? -1 : 1) : u < 0.46 ? -1 : u < 0.9 ? 1 : 0;
    price = Math.max(1, price + delta);
  }
  return price;
}

export function priceSeries(id: string, days: number, n = 16) {
  const last = Math.max(0, Math.floor(days));
  const start = Math.max(0, last - (n - 1));
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
