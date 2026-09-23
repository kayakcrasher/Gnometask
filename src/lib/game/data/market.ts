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
