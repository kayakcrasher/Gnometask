import { useState } from "react";
import { InteriorCanvas as Canvas, RoomDecor } from "./interior-assets";
import { GnomeRig } from "./gnome-rig";
import { useGame } from "@/lib/game/store";
import { StockMarket } from "@/components/hud/stock-market";
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

export function ExchangeRoom() {
  const [boardOpen, setBoardOpen] = useState(false);
  const leave = useGame((s) => s.leaveInterior);
  const coins = useGame((s) => s.coins);
  const shares = useGame((s) => s.shares);
  const bulk = useGame((s) => s.sellBulk);
  const logs = useGame((s) => s.logs);
  const fishBag = useGame((s) => s.fishBag);
  const produce = useGame((s) => s.produce);
  const goods = useGame((s) => s.goods);
  const fishN = FISH.reduce((n, f) => n + (fishBag[f.id] ?? 0), 0);
  const cropN = CROPS.reduce((n, c) => n + (produce[c.id] ?? 0), 0);
  const goodN = GOODS.reduce((n, g) => n + (goods[g.id] ?? 0), 0);
  const held = Object.values(shares).reduce((n, v) => n + v, 0);

  return (
    <div className="fixed inset-0 z-30 bg-[#2a2118]">
      <Canvas camera={{ position: [0, 4.6, 7.2], fov: 42 }}>
        <RoomDecor theme="exchange" />
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
      <div className="absolute inset-x-0 bottom-0 z-10 max-h-[82dvh] overflow-y-auto p-3">
        <div className="mx-auto max-w-5xl rounded-[20px] bg-parchment p-4 shadow-panel">
          <button type="button" aria-expanded={boardOpen} onClick={() => setBoardOpen(!boardOpen)} className="min-h-11 w-full rounded-xl bg-pine px-3 text-sm font-bold text-parchment">{boardOpen ? "Close market board" : "Open market board"}</button>
          {boardOpen && <StockMarket />}
          <div className="mt-5 border-t border-bark/15 pt-4">
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
          </div>
        </div>
      </div>
    </div>
  );
}
