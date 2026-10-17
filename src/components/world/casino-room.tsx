import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import type { Group } from "three";
import { GnomeRig } from "./gnome-rig";
import { InteriorCanvas, RoomDecor } from "./interior-assets";
import { useGame } from "@/lib/game/store";
import { prosperity } from "@/lib/game/data/market";
import { casinoVenue } from "@/lib/game/data/sunstep";
import { WHEEL_ODDS } from "@/lib/game/casino";

function PrizeWheel({
  spinning,
  spin,
  accent,
  onOpen,
}: {
  spinning: boolean;
  spin: number;
  accent: string;
  onOpen: () => void;
}) {
  const wheel = useRef<Group>(null);
  useFrame((_, dt) => {
    if (wheel.current) {
      const target = spin * Math.PI * 6 + 0.8;
      wheel.current.rotation.y = spinning
        ? wheel.current.rotation.y + dt * 12
        : wheel.current.rotation.y +
          (target - wheel.current.rotation.y) * Math.min(1, dt * 3);
    }
  });
  return (
    <group
      position={[-0.9, 0, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onOpen();
      }}
    >
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[1, 0.75, 0.18, 32]} />
        <meshStandardMaterial color="#9d8054" metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.22, 0.35, 0.45, 12]} />
        <meshStandardMaterial color="#735337" />
      </mesh>
      <group ref={wheel} position={[0, 0.56, 0]}>
        {Array.from({ length: 16 }, (_, i) => (
          <mesh key={i} rotation={[-Math.PI / 2, 0, (i * Math.PI) / 8]}>
            <ringGeometry args={[0.25, 0.86, 3, 1, 0, Math.PI / 8]} />
            <meshStandardMaterial
              color={i % 4 === 0 ? "#d5b76b" : i % 2 ? accent : "#293b3a"}
              side={2}
            />
          </mesh>
        ))}
      </group>
      <mesh position={[0, 0.67, 0]}>
        <sphereGeometry args={[0.12, 12, 8]} />
        <meshStandardMaterial color="#e7c982" metalness={0.6} />
      </mesh>
      <mesh position={[0, 0.65, 0.95]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.08, 0.2, 6]} />
        <meshStandardMaterial color="#f2ddac" />
      </mesh>
    </group>
  );
}
function SlotCabinet({
  x,
  accent,
  onOpen,
}: {
  x: number;
  accent: string;
  onOpen: () => void;
}) {
  return (
    <group
      position={[x, 0, -1.9]}
      onClick={(e) => {
        e.stopPropagation();
        onOpen();
      }}
    >
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[0.65, 1.5, 0.55]} />
        <meshStandardMaterial color="#222b39" metalness={0.25} />
      </mesh>
      <mesh position={[0, 1.05, 0.29]}>
        <boxGeometry args={[0.53, 0.48, 0.02]} />
        <meshStandardMaterial
          color="#d7cfb6"
          emissive={accent}
          emissiveIntensity={0.18}
        />
      </mesh>
      {[-0.16, 0, 0.16].map((x, i) => (
        <mesh key={x} position={[x, 1.05, 0.31]}>
          <boxGeometry args={[0.08, 0.18, 0.02]} />
          <meshStandardMaterial
            color={i === 1 ? "#dd9963" : accent}
            emissive={accent}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
      <mesh position={[0, 1.5, 0.05]}>
        <boxGeometry args={[0.67, 0.12, 0.62]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={1}
        />
      </mesh>
      <mesh position={[0, 0.7, 0.34]}>
        <boxGeometry args={[0.55, 0.08, 0.2]} />
        <meshStandardMaterial color="#c9a356" />
      </mesh>
      <mesh position={[0, 0.35, 0.85]}>
        <cylinderGeometry args={[0.22, 0.22, 0.1, 12]} />
        <meshStandardMaterial color="#80445d" />
      </mesh>
      <mesh position={[0, 0.15, 0.85]}>
        <cylinderGeometry args={[0.035, 0.1, 0.3, 8]} />
        <meshStandardMaterial color="#a58a51" />
      </mesh>
    </group>
  );
}
function CasinoScene({
  accent,
  spinning,
  spin,
  onTable,
  onSlots,
}: {
  accent: string;
  spinning: boolean;
  spin: number;
  onTable: () => void;
  onSlots: () => void;
}) {
  return (
    <>
      <color attach="background" args={["#141b2a"]} />
      <ambientLight intensity={1.5} />
      <directionalLight position={[3, 6, 5]} intensity={1.7} />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial color="#343140" />
      </mesh>
      <mesh position={[0, 0.01, 1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.2, 5.5]} />
        <meshStandardMaterial color="#7d3654" />
      </mesh>
      <mesh position={[0, 1.6, -3.4]}>
        <boxGeometry args={[10, 3.2, 0.15]} />
        <meshStandardMaterial color="#293044" />
      </mesh>
      {[-4.8, 4.8].map((x) => (
        <mesh key={x} position={[x, 1.6, -0.8]}>
          <boxGeometry args={[0.15, 3.2, 5]} />
          <meshStandardMaterial color="#30384a" />
        </mesh>
      ))}
      {[-2.8, 2.8].map((x) => (
        <mesh key={x} position={[x, 1.8, -3.27]}>
          <boxGeometry args={[0.09, 2.8, 0.06]} />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={2}
          />
        </mesh>
      ))}
      <RoomDecor theme="casino" />
      <PrizeWheel
        accent={accent}
        spinning={spinning}
        spin={spin}
        onOpen={onTable}
      />
      {[1.8, 2.6, 3.4].map((x) => (
        <SlotCabinet key={x} x={x} accent={accent} onOpen={onSlots} />
      ))}
      <group position={[-2, 0, -1]}>
        <GnomeRig hat="hat-night" scale={0.85} coat="#74475f" beard={false} />
      </group>
      <group position={[-3, 0, 1.7]}>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.08, 20]} />
          <meshStandardMaterial color="#b49c68" />
        </mesh>
        <GnomeRig hat="hat-straw" scale={0.8} coat="#39726b" />
      </group>
      <group position={[0, 0, 2]}>
        <GnomeRig hat="hat-straw" scale={0.85} coat="#4d6d68" />
      </group>
      <pointLight
        position={[0, 2, -1]}
        color={accent}
        intensity={6}
        distance={8}
      />
    </>
  );
}
export function CasinoRoom() {
  const leave = useGame((s) => s.leaveInterior),
    coins = useGame((s) => s.coins),
    days = useGame((s) => s.daysPlayed),
    wager = useGame((s) => s.wager);
  const venueId = useGame((s) => s.casinoVenue),
    result = useGame((s) => s.casinoResult);
  const venue = casinoVenue(venueId),
    stage = prosperity(coins, days);
  const [game, setGame] = useState<"wheel" | "slots">("wheel"),
    [spinning, setSpinning] = useState(false);
  const busy = useRef(false),
    timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const play = (stake: number) => {
    if (busy.current) return;
    const before = useGame.getState().casinoResult?.spin;
    wager(stake);
    if (useGame.getState().casinoResult?.spin === before) return;
    busy.current = true;
    setSpinning(true);
    timer.current = setTimeout(() => {
      busy.current = false;
      setSpinning(false);
    }, 1100);
  };
  return (
    <div
      className="fixed inset-0 z-30 bg-[#141b2a]"
      role="region"
      aria-label="Casino"
    >
      <InteriorCanvas camera={{ position: [0, 5.8, 8.8], fov: 48 }}>
        <CasinoScene
          accent={venue.accent}
          spinning={spinning}
          spin={result?.spin ?? 0}
          onTable={() => setGame("wheel")}
          onSlots={() => setGame("slots")}
        />
      </InteriorCanvas>
      <header className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
        <div className="max-w-[75%] rounded-2xl bg-parchment/95 p-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-bark/60">
            Sunstep · casino & lounge
          </p>
          <h1 className="font-display text-xl font-semibold text-ink">
            {venue.name}
          </h1>
          <p className="text-xs font-bold text-bark">Purse {coins} coins</p>
        </div>
        <button
          type="button"
          onClick={leave}
          className="pointer-events-auto min-h-11 rounded-xl bg-parchment px-4 text-xs font-bold"
        >
          Leave
        </button>
      </header>
      <section
        aria-label="Casino games"
        className="absolute inset-x-3 bottom-3 mx-auto max-h-[48dvh] max-w-lg overflow-y-auto rounded-2xl bg-parchment p-3 shadow-panel"
      >
        <div className="grid grid-cols-2 gap-2">
          {(["wheel", "slots"] as const).map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={game === id}
              disabled={spinning}
              onClick={() => setGame(id)}
              className={`min-h-11 rounded-xl text-sm font-bold ${game === id ? "bg-pine text-parchment" : "bg-parchment-dark text-ink"}`}
            >
              {id === "wheel" ? "Prize wheel" : "Lucky reels"}
            </button>
          ))}
        </div>
        {game === "slots" && (
          <div aria-hidden="true" className="mt-2 flex justify-center gap-2">
            {(spinning
              ? ["?", "?", "?"]
              : result?.pay === result?.stake * 10
                ? ["7", "7", "7"]
                : result?.pay === result?.stake * 3
                  ? ["★", "★", "★"]
                  : result?.pay
                    ? ["7", "7", "◇"]
                    : ["◇", "★", "7"]
            ).map((symbol, i) => (
              <span
                key={i}
                className="flex h-12 w-12 items-center justify-center rounded-lg bg-ink font-display text-2xl text-gold"
              >
                {symbol}
              </span>
            ))}
          </div>
        )}
        <p
          role="status"
          aria-live="polite"
          className="mt-3 rounded-xl bg-parchment-dark p-2 text-sm font-bold text-ink"
        >
          {spinning
            ? "Spinning…"
            : result
              ? `${result.label} · payout ${result.pay} · ${result.pay - result.stake >= 0 ? "+" : ""}${result.pay - result.stake} coins net`
              : "Choose your stake. Both games use the payouts below."}
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={spinning || coins < 5}
            onClick={() => play(5)}
            className="min-h-11 rounded-xl bg-pine font-bold text-parchment disabled:opacity-40"
          >
            Bet 5 coins
          </button>
          <button
            type="button"
            disabled={spinning || coins < 20 || stage < 2}
            onClick={() => play(20)}
            className="min-h-11 rounded-xl bg-gold font-bold text-ink disabled:opacity-40"
          >
            {stage < 2 ? "High table · town growth 2" : "Bet 20 coins"}
          </button>
        </div>
        <details className="mt-2 text-[11px] font-semibold text-bark/75">
          <summary className="cursor-pointer">Payouts & odds</summary>
          <p className="mt-1">
            {WHEEL_ODDS}. Payout includes the stake; a losing spin returns zero.
          </p>
        </details>
      </section>
    </div>
  );
}
