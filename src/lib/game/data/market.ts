export type Stock = {
  id: string;
  name: string;
  start: number;
  blurb: string;
  sure?: boolean;
};

/** A quarter is 90 in-game days. The Gnome500 rises 15% each quarter. */
export const QUARTER_DAYS = 90;

export const STOCKS: Stock[] = [
  { id: "g500", name: "Gnome500 ETF", start: 8, sure: true, blurb: "The whole hollow, in one share. Slow, and it does not go down." },
  { id: "hull", name: "Hull & Keel", start: 14, blurb: "Shipwrights. Feast and famine with the tide." },
  { id: "pie", name: "Pie & Tide", start: 9, blurb: "Bakeries on three islands. Smells better than it balances." },
  { id: "salt", name: "Saltglass", start: 16, blurb: "Salt pans and bottles. A sharp stock." },
  { id: "moss", name: "Moss Hat Co", start: 7, blurb: "Hats. Some seasons everyone buys. Some seasons they don't." },
  { id: "lantern", name: "Lantern Ferry", start: 12, blurb: "Night boats. Pretty, and easily spooked." },
  { id: "keen", name: "Keen Edge", start: 18, blurb: "Weapons. When this climbs, the armory hangs meaner steel." },
  { id: "mail", name: "Mail & Plate", start: 15, blurb: "Armour. A nervous stock, and a useful one." },
  { id: "oar", name: "Oar & Yard", start: 20, blurb: "Boats. Hulls for the ferry folk. Wim keeps a share under the bed." },
  { id: "wall", name: "Watch & Wall", start: 13, blurb: "Town defense. Palisades, towers, and the night shift." },
];

export function isWeekend(days: number) {
  const dow = ((Math.max(1, days) - 1) % 7) + 1;
  return dow >= 6;
}

export function sharePrice(id: string, days: number) {
  const stock = STOCKS.find((s) => s.id === id);
  if (!stock) return 1;
  if (stock.sure) {
    const quarters = Math.floor(Math.max(0, days - 1) / QUARTER_DAYS);
    return Math.max(1, Math.round(stock.start * Math.pow(1.15, quarters)));
  }
  const wobble = Math.sin(days * 0.65 + stock.start) * 0.28 + Math.cos(days * 0.27 + stock.start) * 0.12;
  return Math.max(1, Math.round(stock.start * (1 + wobble)));
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
