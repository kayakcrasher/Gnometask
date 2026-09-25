import { Canvas } from "@react-three/fiber";
import { GnomeRig } from "./gnome-rig";
import { useGame } from "@/lib/game/store";
import { priceSeries, sharePrice, latestEvent, STOCKS, type Sector } from "@/lib/game/data/market";
import { CROPS } from "@/lib/game/data/crops";
import { GOODS } from "@/lib/game/data/trade";
import { FISH } from "@/lib/game/data/fish";

const SECTOR_LABEL: Record<Sector, string> = {
  broad: "The Hollow",
  defense: "Defense",
  shipping: "Shipping",
  food: "Food & Salt",
  leisure: "Leisure",
  media: "Media",
  luxury: "Luxury",
};

const SECTOR_ORDER: Sector[] = ["broad", "defense", "shipping", "food", "leisure", "media", "luxury"];

function Hall() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 10]} />
        <meshStandardMaterial color="#cbb892" />
      </mesh>
      <mesh position={[0, 1.6, -4]}>
        <boxGeometry args={[12, 3.2, 0.3]} />
        <meshStandardMaterial color="#4a3b2e" />
      </mesh>
      <mesh position={[0, 0.55, -1.2]}>
        <boxGeometry args={[6, 1.1, 1.2]} />
        <meshStandardMaterial color="#6b4e32" />
      </mesh>
      <group position={[-2.2, 0, -1.2]}>
        <GnomeRig hat="hat-straw" scale={0.85} coat="#5b4230" beard />
      </group>
      <group position={[2.2, 0, -1.2]}>
        <GnomeRig hat="hat-night" scale={0.85} coat="#2f3d34" beard={false} />
      </group>
      <hemisphereLight args={["#fff4e0", "#6b4e32", 0.8]} />
      <pointLight position={[0, 3.2, 0]} intensity={6} />
    </group>
  );
}

function Chart({ id, days }: { id: string; days: number }) {
  const pts = priceSeries(id, days, 20);
  if (pts.length < 2) {
    return <div className="mt-2 h-16 rounded-[10px] bg-parchment-dark/40" />;
  }
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const span = Math.max(1, max - min);
  const W = 200;
  const H = 60;
  const PAD = 4;
  const plotW = W - PAD * 2;
  const plotH = H - PAD * 2;

  const xy = pts.map((p, i) => ({
    x: PAD + (i / (pts.length - 1)) * plotW,
    y: PAD + (1 - (p - min) / span) * plotH,
  }));

  const line = xy
    .map((pt, i) => `${i === 0 ? "M" : "L"}${pt.x.toFixed(1)},${pt.y.toFixed(1)}`)
    .join(" ");
  const area = `${line} L${(PAD + plotW).toFixed(1)},${(PAD + plotH).toFixed(1)} L${PAD},${(PAD + plotH).toFixed(1)} Z`;

  const last = pts[pts.length - 1]!;
  const first = pts[0]!;
  const up = last >= first;
  const changePct = ((last - first) / Math.max(1, first)) * 100;
  const lineColor = up ? "#4c6b47" : "#a8433b";

  return (
    <div className="mt-2">
      <div className="flex items-baseline justify-between">
        <span className="text-[9px] font-bold uppercase tracking-wider text-bark/50">
          {pts.length}-day chart
        </span>
        <span className="text-[10px] font-semibold tabular-nums text-bark/60">
          {min}–{max}
        </span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-1 w-full"
        style={{ height: 60 }}
        preserveAspectRatio="none"
        aria-hidden
      >
        {[0.25, 0.5, 0.75].map((f, i) => (
          <line
            key={i}
            x1={PAD}
            y1={PAD + f * plotH}
            x2={PAD + plotW}
            y2={PAD + f * plotH}
            stroke="#5b4230"
            strokeWidth="0.5"
            opacity="0.22"
            strokeDasharray="2 2"
          />
        ))}
        <path d={area} fill={lineColor} opacity="0.15" />
        <path
          d={line}
          fill="none"
          stroke={lineColor}
          strokeWidth="1.6"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <circle cx={xy[xy.length - 1]!.x} cy={xy[xy.length - 1]!.y} r="2" fill={lineColor} />
      </svg>
      <div className="mt-0.5 flex items-center justify-between">
        <span className="text-[9px] font-semibold text-bark/50">d{Math.max(1, days - pts.length + 1)}</span>
        <span className={`text-[11px] font-bold tabular-nums ${up ? "text-moss" : "text-berry"}`}>
          {up ? "+" : ""}
          {changePct.toFixed(1)}%
        </span>
        <span className="text-[9px] font-semibold text-bark/50">d{days}</span>
      </div>
    </div>
  );
}

function StockRow({
  stockId,
  days,
  shares,
  onBuy,
  onSell,
}: {
  stockId: string;
  days: number;
  shares: Record<string, number>;
  onBuy: (id: string) => void;
  onSell: (id: string) => void;
}) {
  const stock = STOCKS.find((s) => s.id === stockId);
  if (!stock) return null;
  const price = sharePrice(stock.id, days);
  const held = shares[stock.id] ?? 0;
  const yieldPct = stock.yield ? `${(stock.yield * 100).toFixed(1)}%/wk` : "—";
  return (
    <li className="rounded-[14px] bg-parchment-dark/60 px-3 py-2">
      <div className="flex items-baseline justify-between gap-2">
        <p className="min-w-0 flex-1 truncate font-display text-sm font-semibold text-ink">
          {stock.name}
        </p>
        <p className="shrink-0 text-xs font-bold tabular-nums text-ink">{price}</p>
      </div>
      <p className="mt-0.5 text-[11px] font-semibold text-bark/70">
        held {held} · div {yieldPct}
      </p>
      <p className="mt-0.5 text-[11px] font-semibold text-bark/60">{stock.blurb}</p>
      <Chart id={stock.id} days={days} />
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => onBuy(stock.id)}
          className="h-8 rounded-full bg-gold px-3 text-[11px] font-semibold text-ink"
        >
          Buy {price}
        </button>
        <button
          type="button"
          onClick={() => onSell(stock.id)}
          disabled={held < 1}
          className="h-8 rounded-full bg-ink px-3 text-[11px] font-semibold text-parchment disabled:opacity-40"
        >
          Sell {price}
        </button>
      </div>
    </li>
  );
}

export function ExchangeRoom() {
  const leave = useGame((s) => s.leaveInterior);
  const days = useGame((s) => s.daysPlayed);
  const coins = useGame((s) => s.coins);
  const shares = useGame((s) => s.shares);
  const buy = useGame((s) => s.buyShare);
  const sell = useGame((s) => s.sellShare);
  const bulk = useGame((s) => s.sellBulk);
  const logs = useGame((s) => s.logs);
  const fishBag = useGame((s) => s.fishBag);
  const produce = useGame((s) => s.produce);
  const goods = useGame((s) => s.goods);
  const fishN = FISH.reduce((n, f) => n + (fishBag[f.id] ?? 0), 0);
  const cropN = CROPS.reduce((n, c) => n + (produce[c.id] ?? 0), 0);
  const goodN = GOODS.reduce((n, g) => n + (goods[g.id] ?? 0), 0);
  const held = Object.values(shares).reduce((n, v) => n + v, 0);
  const event = latestEvent(days);
  const nextDivIn = 7 - (days % 7 || 7);
  const nextDivDay = days + (nextDivIn === 0 ? 7 : nextDivIn);

  return (
    <div className="fixed inset-0 z-30 bg-[#2a2118]">
      <Canvas camera={{ position: [0, 4.6, 7.2], fov: 42 }}>
        <Hall />
      </Canvas>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-3">
        <div className="pointer-events-auto max-w-sm rounded-[16px] bg-parchment/95 px-3 py-2 shadow-panel">
          <p className="font-display text-lg font-semibold text-ink">Gnome Exchange</p>
          <p className="text-xs font-semibold text-bark/70">
            Purse {coins}. Holding {held} shares.
          </p>
        </div>
        <button
          type="button"
          onClick={leave}
          className="pointer-events-auto rounded-full bg-parchment px-3 py-2 text-xs font-semibold text-ink"
        >
          Leave
        </button>
      </div>
      <div className="absolute inset-x-0 bottom-0 z-10 max-h-[62dvh] overflow-y-auto p-3">
        <div className="mx-auto max-w-lg rounded-[20px] bg-parchment p-4 shadow-panel">
          {event ? (
            <div className="mb-3 rounded-[14px] bg-gold/25 px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-bark/60">
                Market news · Day {event.day}
              </p>
              <p className="mt-0.5 text-sm font-semibold text-ink">{event.headline}</p>
            </div>
          ) : null}

          {held > 0 ? (
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-moss">
              Next dividend paid on day {nextDivDay}
            </p>
          ) : null}

          <p className="font-display text-base font-semibold text-ink">Bulk floor</p>
          <p className="mt-1 text-xs font-semibold text-bark/70">
            Logs {logs}. Fish {fishN}. Crops {cropN}. Goods {goodN}.
          </p>
          <button
            type="button"
            onClick={bulk}
            className="mt-2 h-11 w-full rounded-[14px] bg-pine font-display text-sm font-semibold text-parchment"
          >
            Sell the bulk
          </button>

          <p className="mt-4 font-display text-base font-semibold text-ink">The board</p>
          {SECTOR_ORDER.map((sector) => {
            const inSector = STOCKS.filter((s) => s.sector === sector);
            if (!inSector.length) return null;
            return (
              <div key={sector} className="mt-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-bark/55">
                  {SECTOR_LABEL[sector]}
                </p>
                <ul className="mt-1.5 flex flex-col gap-2">
                  {inSector.map((stock) => (
                    <StockRow
                      key={stock.id}
                      stockId={stock.id}
                      days={days}
                      shares={shares}
                      onBuy={buy}
                      onSell={sell}
                    />
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
