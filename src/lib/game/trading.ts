import { sharePrice, STOCKS } from "./data/market";

/** One quote is used for both order validation and the resulting balances. */
export function quoteShareTrade(
  id: string,
  day: number,
  coins: number,
  shares: Record<string, number>,
  side: "buy" | "sell",
  quantity = 1,
) {
  if (!STOCKS.some((stock) => stock.id === id) || !Number.isSafeInteger(quantity) || quantity < 1) return null;
  const held = shares[id] ?? 0;
  const price = sharePrice(id, day);
  const total = price * quantity;
  const nextCoins = coins + (side === "buy" ? -total : total);
  const nextHeld = held + (side === "buy" ? quantity : -quantity);
  if (!Number.isSafeInteger(total) || !Number.isSafeInteger(nextCoins) || nextCoins < 0
    || !Number.isSafeInteger(nextHeld) || nextHeld < 0) return null;
  const holdings = { ...shares };
  if (nextHeld) holdings[id] = nextHeld;
  else delete holdings[id];
  return { price, total, coins: nextCoins, shares: holdings };
}
