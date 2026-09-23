import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useRef, useState } from "react";
import * as THREE from "three";
import { GnomeRig } from "./gnome-rig";
import { DeedMap } from "@/components/hud/deed-map";
import { useGame } from "@/lib/game/store";
import { isWeekend, nextGnomeRise, sharePrice, STOCKS } from "@/lib/game/data/market";
import { BOAT_LOANS, LAND_OFFERS } from "@/lib/game/data/honour";

function Walker({ hat, spot }: { hat: string; spot: THREE.Vector3 }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.position.lerp(spot, Math.min(1, dt * 4));
    const dx = spot.x - ref.current.position.x;
    const dz = spot.z - ref.current.position.z;
    if (dx * dx + dz * dz > 0.01) ref.current.rotation.y = Math.atan2(dx, dz);
  });
  return (
    <group ref={ref} position={[0, 0, 2.4]}>
      <GnomeRig hat={hat} scale={0.85} coat="#6a3d58" />
    </group>
  );
}

function Room({
  weekend,
  onTeller,
  onBoard,
}: {
  weekend: boolean;
  onTeller: () => void;
  onBoard: () => void;
}) {
  const spot = useRef(new THREE.Vector3(0, 0, 2.4));
  const [, bump] = useState(0);
  const hat = useGame((s) => s.hat);
  const move = (x: number, z: number) => {
    spot.current.set(THREE.MathUtils.clamp(x, -3.2, 3.2), 0, THREE.MathUtils.clamp(z, -1.2, 3.2));
    bump((n) => n + 1);
  };
  return (
    <>
      <color attach="background" args={["#1c2430"]} />
      <ambientLight intensity={0.55} />
      <pointLight position={[0, 3.2, 0.4]} intensity={18} color="#f2d7a2" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow onClick={(e) => { e.stopPropagation(); move(e.point.x, e.point.z); }}>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#d9d3c6" />
      </mesh>
      <mesh position={[0, 0.02, 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.2, 3.4]} />
        <meshStandardMaterial color="#8a3a32" />
      </mesh>
      {[[-4, 0], [4, 0]].map(([x]) => (
        <mesh key={x} position={[x!, 1.6, 0]}>
          <boxGeometry args={[0.2, 3.2, 7]} />
          <meshStandardMaterial color="#efe4cf" />
        </mesh>
      ))}
      <mesh position={[0, 1.6, -3.4]}>
        <boxGeometry args={[8, 3.2, 0.2]} />
        <meshStandardMaterial color="#efe4cf" />
      </mesh>
      <mesh position={[0, 3.15, 0]}>
        <boxGeometry args={[8, 0.12, 7]} />
        <meshStandardMaterial color="#5b4230" />
      </mesh>
      <mesh position={[0, 0.45, -1.5]} castShadow>
        <boxGeometry args={[3.2, 0.9, 0.7]} />
        <meshStandardMaterial color="#6b4423" />
      </mesh>
      <mesh position={[0, 0.95, -1.5]}>
        <boxGeometry args={[3.3, 0.08, 0.8]} />
        <meshStandardMaterial color="#c4a574" />
      </mesh>
      <mesh position={[-2.6, 1.1, -2.6]} castShadow>
        <boxGeometry args={[1.1, 2.2, 0.2]} />
        <meshStandardMaterial color="#8a7a68" />
      </mesh>
      <mesh position={[-2.6, 1.3, -2.48]}>
        <circleGeometry args={[0.28, 16]} />
        <meshStandardMaterial color="#d6a84c" metalness={0.4} />
      </mesh>
      <group position={[2.5, 0, 0.3]} onClick={(e) => { e.stopPropagation(); move(1.7, 0.9); onBoard(); }}>
        <mesh position={[0, 0.55, 0]} castShadow>
          <boxGeometry args={[1.1, 1.1, 0.7]} />
          <meshStandardMaterial color="#5b4230" />
        </mesh>
        <mesh position={[0, 1.15, 0.2]}>
          <boxGeometry args={[0.7, 0.45, 0.06]} />
          <meshStandardMaterial color="#1d3a34" emissive="#1d3a34" emissiveIntensity={0.4} />
        </mesh>
        <Html position={[0, 1.7, 0]} center>
          <p className="whitespace-nowrap rounded-full bg-ink/85 px-2 py-0.5 text-[11px] font-semibold text-parchment">Gnome board</p>
        </Html>
      </group>
      {weekend ? (
        <Html position={[0, 1.4, -1.2]} center>
          <p className="max-w-[14rem] rounded-[12px] bg-parchment px-2 py-1 text-center text-[11px] font-semibold text-ink">
            Quill is on the steps. The ledger waits until the week.
          </p>
        </Html>
      ) : (
        <group position={[0, 0, -2.15]} onClick={(e) => { e.stopPropagation(); move(0, -0.4); onTeller(); }}>
          <GnomeRig hat="hat-night" scale={0.9} coat="#2f3d34" beard />
          <Html position={[0, 1.7, 0]} center>
            <p className="whitespace-nowrap rounded-full bg-ink/85 px-2 py-0.5 text-[11px] font-semibold text-parchment">Quill Bram</p>
          </Html>
        </group>
      )}
      <Walker hat={hat} spot={spot.current} />
    </>
  );
}

export function BankRoom() {
  const leave = useGame((s) => s.leaveInterior);
  const days = useGame((s) => s.daysPlayed);
  const coins = useGame((s) => s.coins);
  const shares = useGame((s) => s.shares);
  const buy = useGame((s) => s.buyShare);
  const sell = useGame((s) => s.sellShare);
  const claimed = useGame((s) => s.claimed);
  const claim = useGame((s) => s.claimTile);
  const loan = useGame((s) => s.loan);
  const hulls = useGame((s) => s.hulls);
  const borrow = useGame((s) => s.takeLoan);
  const repay = useGame((s) => s.repayLoan);
  const expedition = useGame((s) => s.expedition);
  const fund = useGame((s) => s.fundExpedition);
  const collect = useGame((s) => s.collectExpedition);
  const weekend = isWeekend(days);
  const [desk, setDesk] = useState<"none" | "teller" | "board" | "map">("none");
  const rise = nextGnomeRise(days);
  return (
    <div className="fixed inset-0 z-30 bg-[#1c2430]">
      <Canvas camera={{ position: [0, 4.2, 6.2], fov: 42 }} shadows>
        <Room weekend={weekend} onTeller={() => setDesk("teller")} onBoard={() => setDesk("board")} />
      </Canvas>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between p-3">
        <div className="pointer-events-auto max-w-sm rounded-[16px] bg-parchment/95 px-3 py-2 shadow-panel">
          <p className="font-display text-lg font-semibold text-ink">Bram's Bank</p>
          <p className="text-xs font-semibold text-bark/70">
            Quill Bram kept the purse on the old ferries. He sleeps above the vault and only takes the steps on the weekend.
          </p>
        </div>
        <button type="button" onClick={leave} className="pointer-events-auto rounded-full bg-parchment px-3 py-2 text-xs font-semibold text-ink">
          Leave
        </button>
      </div>
      {desk === "teller" && !weekend ? (
        <div className="absolute inset-x-0 bottom-0 z-10 p-3">
          <div className="mx-auto max-h-[70dvh] max-w-lg overflow-y-auto rounded-[20px] bg-parchment p-4 shadow-panel">
            <p className="font-display text-lg font-semibold text-ink">Quill Bram</p>
            <p className="mt-1 text-sm font-semibold text-bark/70">
              I counted fares while the boats were still wild. The new capital needs a ledger, not a rumour. Private ground stays private. The pale parcels, I can sell.
            </p>
            <button type="button" onClick={() => setDesk("map")} className="mt-3 h-11 w-full rounded-[14px] bg-gold font-display text-sm font-semibold text-ink">
              Open the land map
            </button>
            <div className="mt-3 flex flex-col gap-1.5">
              {LAND_OFFERS.map((tile) => (
                <button key={tile.id} type="button" disabled={claimed.includes(tile.id)} onClick={() => claim(tile.id)} className="h-8 rounded-[10px] bg-parchment-dark text-[11px] font-semibold text-ink disabled:opacity-40">
                  {claimed.includes(tile.id) ? `${tile.name} is yours` : `${tile.name} · ${tile.respect} respect · ${tile.coins}`}
                </button>
              ))}
              {loan ? (
                <button type="button" onClick={repay} className="h-8 rounded-[10px] bg-pine text-[11px] font-semibold text-parchment">Repay {loan.owed}</button>
              ) : (
                BOAT_LOANS.map((offer) => (
                  <button key={offer.boat} type="button" disabled={hulls.includes(offer.boat)} onClick={() => borrow(offer.boat)} className="h-8 rounded-[10px] bg-parchment-dark text-[11px] font-semibold text-ink disabled:opacity-40">
                    {hulls.includes(offer.boat) ? `${offer.name} is yours` : `Loan the ${offer.name} · owe ${offer.owed}`}
                  </button>
                ))
              )}
              {expedition ? (
                <button type="button" onClick={collect} className="h-8 rounded-[10px] bg-pine text-[11px] font-semibold text-parchment">
                  {days >= expedition.due ? "Collect the expedition" : `Expedition back on day ${expedition.due}`}
                </button>
              ) : (
                <div className="flex gap-1.5">
                  {[10, 25, 50].map((n) => (
                    <button key={n} type="button" disabled={coins < n} onClick={() => fund(n)} className="rounded-full bg-gold px-3 py-1 text-[11px] font-semibold text-ink disabled:opacity-40">
                      Stake {n}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button type="button" onClick={() => setDesk("none")} className="mt-2 h-10 w-full rounded-[14px] bg-parchment-dark text-sm font-semibold text-ink">
              Step back
            </button>
          </div>
        </div>
      ) : null}
      {desk === "board" ? (
        <div className="absolute inset-x-0 bottom-0 z-10 max-h-[55dvh] overflow-y-auto p-3">
          <div className="mx-auto flex max-w-lg flex-col gap-2 rounded-[20px] bg-parchment p-4 shadow-panel">
            <p className="font-display text-lg font-semibold text-ink">Gnome board</p>
            <p className="text-xs font-semibold text-bark/70">
              Purse {coins}. Gnome500 starts cheap and rises 15% every 90 days. Next rise on day {rise}.
            </p>
            {STOCKS.map((stock) => {
              const price = sharePrice(stock.id, days);
              const held = shares[stock.id] ?? 0;
              return (
                <div key={stock.id} className="rounded-[12px] bg-parchment-dark/50 px-3 py-2">
                  <p className="font-display text-sm font-semibold text-ink">
                    {stock.name} · {price}
                    {stock.sure ? " · sure" : ""}
                  </p>
                  <p className="text-[11px] font-semibold text-bark/65">{stock.blurb} You hold {held}.</p>
                  <div className="mt-1 flex gap-1.5">
                    <button type="button" disabled={coins < price} onClick={() => buy(stock.id)} className="rounded-full bg-gold px-3 py-1 text-[11px] font-semibold text-ink disabled:opacity-40">
                      Buy
                    </button>
                    <button type="button" disabled={held < 1} onClick={() => sell(stock.id)} className="rounded-full bg-pine px-3 py-1 text-[11px] font-semibold text-parchment disabled:opacity-40">
                      Sell
                    </button>
                  </div>
                </div>
              );
            })}
            <button type="button" onClick={() => setDesk("none")} className="h-10 rounded-[14px] bg-parchment-dark text-sm font-semibold text-ink">
              Step back
            </button>
          </div>
        </div>
      ) : null}
      {desk === "map" ? <DeedMap onClose={() => setDesk("teller")} /> : null}
    </div>
  );
}
