import { Canvas } from "@react-three/fiber";
import { GnomeRig } from "./gnome-rig";
import { useGame } from "@/lib/game/store";
import { priceSeries, sharePrice, STOCKS } from "@/lib/game/data/market";
import { CROPS } from "@/lib/game/data/crops";
import { GOODS } from "@/lib/game/data/trade";
import { FISH } from "@/lib/game/data/fish";

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

function Spark({ id, days }: { id: string; days: number }) {
  const pts = priceSeries(id, days, 16);
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const span = max - min || 1;
  const d = pts
    .map((p, i) => {
      const x = (i / Math.max(1, pts.length - 1)) * 76;
      const y = 22 - ((p - min) / span) * 18;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const up = pts[pts.length - 1]! >= pts[0]!;
  const last = pts[pts.length - 1] ?? 0;
  const prev = pts[pts.length - 2] ?? last;
  return (
    <div className="flex items-center gap-2">
      <svg width="76" height="24" aria-hidden>
        <path d={d} fill="none" stroke={up ? "#2f6b4a" : "#a33b32"} strokeWidth="1.6" />
      </svg>
      <span className={`text-[10px] font-bold ${last >= prev ? "text-moss" : "text-berry"}`}>
        {last >= prev ? "up" : "down"} today
      </span>
    </div>
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
  return (
    <div className="fixed inset-0 z-30 bg-[#2a2118]">
      <Canvas camera={{ position: [0, 4.6, 7.2], fov: 42 }}>
        <Hall />
      </Canvas>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-3">
        <div className="pointer-events-auto max-w-sm rounded-[16px] bg-parchment/95 px-3 py-2 shadow-panel">
          <p className="font-display text-lg font-semibold text-ink">Gnome Exchange</p>
          <p className="text-xs font-semibold text-bark/70">
            Runners drop orders here and pick up the next load. The floor buys bulk. The board trades shares. Purse {coins}.
          </p>
        </div>
        <button type="button" onClick={leave} className="pointer-events-auto rounded-full bg-parchment px-3 py-2 text-xs font-semibold text-ink">
          Leave
        </button>
      </div>
      <div className="absolute inset-x-0 bottom-0 z-10 max-h-[58dvh] overflow-y-auto p-3">
        <div className="mx-auto max-w-lg rounded-[20px] bg-parchment p-4 shadow-panel">
          <p className="font-display text-base font-semibold text-ink">Bulk floor</p>
          <p className="mt-1 text-xs font-semibold text-bark/70">
            Logs {logs}. Fish {fishN}. Crops {cropN}. Goods {goodN}.
          </p>
          <button type="button" onClick={bulk} className="mt-2 h-11 w-full rounded-[14px] bg-pine font-display text-sm font-semibold text-parchment">
            Sell the bulk
          </button>
          <p className="mt-4 font-display text-base font-semibold text-ink">The board</p>
          <ul className="mt-2 flex flex-col gap-2">
            {STOCKS.map((stock) => {
              const price = sharePrice(stock.id, days);
              const held = shares[stock.id] ?? 0;
              return (
                <li key={stock.id} className="rounded-[14px] bg-parchment-dark/60 px-3 py-2">
                  <p className="font-display text-sm font-semibold text-ink">
                    {stock.name} · {price} · held {held}
                  </p>
                  <p className="text-[11px] font-semibold text-bark/70">{stock.blurb}</p>
                  <Spark id={stock.id} days={days} />
                  <div className="mt-1 flex gap-2">
                    <button type="button" onClick={() => buy(stock.id)} className="h-8 rounded-full bg-gold px-3 text-[11px] font-semibold text-ink">
                      Buy
                    </button>
                    <button type="button" onClick={() => sell(stock.id)} className="h-8 rounded-full bg-ink px-3 text-[11px] font-semibold text-parchment">
                      Sell
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
