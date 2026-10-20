import { economicClimate, liveSharePrice, marketCycle } from "@/lib/game/island-economy";
import { useMemo, useState } from "react";
import { useGame } from "@/lib/game/store";
import { latestEvent, STOCKS, type Sector } from "@/lib/game/data/market";
import { quoteShareTrade } from "@/lib/game/trading";

const SECTORS: Record<Sector, string> = {
  broad: "The Hollow", defense: "Defense", shipping: "Shipping", food: "Food & Salt",
  leisure: "Leisure", media: "Media", luxury: "Luxury",
};
const signed = (n: number) => `${n > 0 ? "+" : ""}${n.toLocaleString()}`;
const movement = (n: number) => n > 0 ? "text-moss" : n < 0 ? "text-berry" : "text-bark/65";
const control = "min-h-11 rounded-xl bg-parchment-dark px-3 text-xs font-semibold text-ink disabled:opacity-40";

function PriceChart({ id, day, range }: { id: string; day: number; range: number }) {
  const world=useGame(),current=economicClimate(world);
  const first=Math.max(0,day-range+1);
  const prices=Array.from({length:day-first+1},(_,i)=>{const d=first+i;return liveSharePrice(id,d,d===day?current.factor:world.economy.history[String(d)]?.factor??marketCycle(d));});
  const low = Math.min(...prices);
  const high = Math.max(...prices);
  const spread = Math.max(2, high - low);
  const middle = (low + high) / 2;
  const xy = prices.map((price, i) => [12 + i / Math.max(1, prices.length - 1) * 456, 90 - (price - middle) / spread * 130]);
  const line = xy.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join(" ");
  const change = prices[prices.length - 1]! - prices[0]!;
  const color = change < 0 ? "#a8433b" : "#4c6b47";
  const firstDay = Math.max(0, Math.floor(day)) - prices.length + 1;
  return (
    <div className="mt-4 rounded-xl bg-parchment-dark/40 p-3">
      <div className="flex justify-between text-[11px] font-semibold text-bark/65">
        <span>{prices.length}-day history</span><span>Low {low} · High {high}</span>
      </div>
      <svg viewBox="0 0 480 180" className="my-2 h-40 w-full" role="img" aria-label={`${prices.length}-day price chart. Low ${low}, high ${high}, latest ${prices[prices.length - 1]} coins.`}>
        {[25, 90, 155].map(y => <line key={y} x1="12" x2="468" y1={y} y2={y} stroke="#5b4230" strokeOpacity="0.15" strokeDasharray="4 4" />)}
        <path d={`${line} L${xy[xy.length - 1]![0]},170 L12,170 Z`} fill={color} opacity="0.1" />
        <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={xy[xy.length - 1]![0]} cy={xy[xy.length - 1]![1]} r="4" fill={color} />
      </svg>
      <div className="flex justify-between text-[11px] font-semibold text-bark/65">
        <span>Day {firstDay}</span><span className={movement(change)}>{signed(change)} coins ({signed(Number((change / prices[0]! * 100).toFixed(1)))}%)</span><span>Day {Math.floor(day)}</span>
      </div>
    </div>
  );
}

/** The bank and Exchange share the same quotes, controls, and portfolio view. */
export function StockMarket() {
  const world=useGame(),climate=economicClimate(world),days=climate.day;
  const coins = useGame(s => s.coins);
  const shares = useGame(s => s.shares);
  const buy = useGame(s => s.buyShare);
  const sell = useGame(s => s.sellShare);
  const [selected, setSelected] = useState("g500");
  const [range, setRange] = useState(30);
  const [quantity, setQuantity] = useState("1");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const rows = useMemo(() => STOCKS.map(stock => {
    const price = liveSharePrice(stock.id, days,climate.factor);
    const change = price - liveSharePrice(stock.id, Math.max(0,days-1),world.economy.history[String(days-1)]?.factor??marketCycle(days-1));
    const held = shares[stock.id] ?? 0;
    return { ...stock, price, change, held };
  }), [days, shares,climate.factor,world.economy.history]);
  const stock = rows.find(s => s.id === selected)!;
  const value = rows.reduce((sum, row) => sum + row.price * row.held, 0);
  const daily = rows.reduce((sum, row) => sum + row.change * row.held, 0);
  const nextDividend = (Math.floor(days / 7) + 1) * 7;
  // Use today's quotes for an estimate, rather than exposing future prices.
  const estimatedDividend = rows.reduce((sum, row) => sum + (row.held && row.yield ? Math.max(1, Math.floor(row.price * row.yield * row.held)) : 0), 0);
  const event = latestEvent(days);
  const visible = rows.filter(row => (filter === "all" || (filter === "held" ? row.held > 0 : row.sector === filter))
    && `${row.name} ${row.id}`.toLowerCase().includes(search.toLowerCase().trim()));
  const count = Number(quantity);
  const canBuy = quoteShareTrade(stock.id, days, coins, shares, "buy", count,climate.factor);
  const canSell = quoteShareTrade(stock.id, days, coins, shares, "sell", count,climate.factor);
  const validCount = Number.isSafeInteger(count) && count > 0;
  const trade = (side: "buy" | "sell") => {
    (side === "buy" ? buy : sell)(stock.id, count);
    setNotice(useGame.getState().speech);
  };
  return (
    <section aria-label="Stock market" className="text-ink">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-xl font-semibold">The Gnome Exchange</h2>
        <p className="text-xs font-semibold text-bark/60">Market day {days} · Quotes follow trade and town safety</p>
      </div>
      <div className="mt-3 rounded-xl bg-gold/20 p-3 text-xs" role="status"><strong className="capitalize">{climate.phase} · Island index {climate.index}</strong><p>{climate.headline}</p><p className="mt-1">Markets shape wages, housebuilding and land demand. Clearing raids and repairing towns restores confidence. One market day passes after roughly six minutes of active island play.</p></div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[["Available coins", coins.toLocaleString()], ["Portfolio value", value.toLocaleString()], ["Holdings today", `${signed(daily)} coins`], ["Weekly income est.", `${estimatedDividend} coins`]].map(([label, number]) => (
          <div key={label} className="rounded-xl bg-parchment-dark/60 p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-bark/60">{label}</p><p className={`mt-1 text-lg font-bold tabular-nums ${label === "Holdings today" ? movement(daily) : ""}`}>{number}</p></div>
        ))}
      </div>
      {event && <p className="mt-3 rounded-xl bg-gold/20 p-3 text-xs font-semibold"><span className="text-bark/60">Day {event.day} · </span>{event.headline}</p>}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <div className="flex gap-2">
            <input aria-label="Search stocks" type="search" placeholder="Find a company…" value={search} onChange={e => setSearch(e.target.value)} className={`${control} w-0 min-w-0 flex-1`} />
            <select aria-label="Filter stocks" value={filter} onChange={e => setFilter(e.target.value)} className={`${control} max-w-[45%]`}>
              <option value="all">All stocks</option><option value="held">My holdings</option>
              {Object.entries(SECTORS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </select>
          </div>
          <div className="mt-2 flex justify-between px-3 text-[10px] font-bold uppercase tracking-wide text-bark/55"><span>Company · owned</span><span>Price · today</span></div>
          <div className="mt-1 max-h-80 space-y-1 overflow-y-auto">
            {visible.map(row => <button key={row.id} type="button" aria-pressed={row.id === selected} onClick={() => { setSelected(row.id); setNotice(""); }} className={`flex min-h-14 w-full items-center justify-between gap-2 rounded-xl border-2 px-3 py-2 text-left ${row.id === selected ? "border-pine bg-pine/10" : "border-transparent bg-parchment-dark/40"}`}>
              <span><span className="block text-sm font-bold">{row.name}</span><span className="text-[11px] text-bark/65">{SECTORS[row.sector]} · {row.held} owned</span></span>
              <span className="shrink-0 text-right tabular-nums"><span className="block text-sm font-bold">{row.price}</span><span className={`text-[11px] font-semibold ${movement(row.change)}`}>{signed(row.change)} coins</span></span>
            </button>)}
            {!visible.length && <p className="p-4 text-sm text-bark/65">{filter === "held" ? "No holdings match. Browse all stocks to buy your first shares." : "No companies match your search."}</p>}
          </div>
        </div>
        <div className="rounded-2xl border border-bark/15 p-3 sm:p-4">
          <div className="flex items-start justify-between gap-3"><div><h3 className="font-display text-lg font-semibold">{stock.name}</h3><p className="text-xs text-bark/65">{SECTORS[stock.sector]} · {stock.held} shares owned</p></div><p className="text-xl font-bold tabular-nums">{stock.price}<span className="block text-right text-[10px] font-semibold text-bark/60">coins / share</span></p></div>
          <p className="mt-2 text-xs leading-relaxed text-bark/75">{stock.blurb}</p>
          <div className="mt-3 flex gap-1" aria-label="Chart period">{[7, 30, 90].map(n => <button key={n} type="button" aria-pressed={range === n} onClick={() => setRange(n)} className={`min-h-9 rounded-lg px-3 text-xs font-bold ${range === n ? "bg-pine text-parchment" : "bg-parchment-dark"}`}>{n}D</button>)}</div>
          <PriceChart id={stock.id} day={days} range={range} />
          <p className="mt-3 text-[11px] font-semibold text-bark/65">{stock.yield ? `${(stock.yield * 100).toFixed(1)}% weekly dividend · next payout day ${nextDividend}. Estimates use today's price.` : "No dividend. Returns depend on the sale price."}</p>
          <div className="mt-4 flex items-end gap-2">
            <label className="min-w-0 flex-1 text-xs font-bold">Shares<input type="number" min="1" step="1" inputMode="numeric" value={quantity} onChange={e => setQuantity(e.target.value)} className={`${control} mt-1 w-full tabular-nums`} /></label>
            <button type="button" className={control} disabled={coins < stock.price} onClick={() => setQuantity(String(Math.floor(coins / stock.price)))}>Max buy</button>
            <button type="button" className={control} disabled={!stock.held} onClick={() => setQuantity(String(stock.held))}>All held</button>
          </div>
          <p className="mt-2 text-xs font-semibold text-bark/65">{validCount && Number.isSafeInteger(count * stock.price) ? `Order total: ${(count * stock.price).toLocaleString()} coins · no trading fee` : "Enter a positive whole number of shares."}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button type="button" disabled={!canBuy} onClick={() => trade("buy")} className="min-h-11 rounded-xl bg-gold text-sm font-bold disabled:opacity-40">Buy shares</button>
            <button type="button" disabled={!canSell} onClick={() => trade("sell")} className="min-h-11 rounded-xl bg-pine text-sm font-bold text-parchment disabled:opacity-40">Sell shares</button>
          </div>
          <p role="status" className="mt-2 min-h-4 text-xs font-semibold text-moss">{notice}</p>
        </div>
      </div>
    </section>
  );
}
