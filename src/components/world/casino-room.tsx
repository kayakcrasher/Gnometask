import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";
import { GnomeRig } from "./gnome-rig";
import { useGame } from "@/lib/game/store";
import { CASINO_STAGE, prosperity } from "@/lib/game/data/market";

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
    <group ref={ref} position={[0, 0, 2.2]}>
      <GnomeRig hat={hat} scale={0.85} coat="#6a3d58" />
    </group>
  );
}

function Pit({ stage, onWheel }: { stage: number; onWheel: () => void }) {
  const spot = useRef(new THREE.Vector3(0, 0, 2.2));
  const [, bump] = useState(0);
  const hat = useGame((s) => s.hat);
  const accent = stage >= 3 ? "#f2c14e" : stage >= 1 ? "#ff4fa3" : "#c4894a";
  const move = (x: number, z: number) => {
    spot.current.set(THREE.MathUtils.clamp(x, -3, 3), 0, THREE.MathUtils.clamp(z, -1, 3));
    bump((n) => n + 1);
  };
  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        move(e.point.x, e.point.z);
      }}
    >
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 1]} receiveShadow>
        <planeGeometry args={[8, 6]} />
        <meshStandardMaterial color={stage >= 4 ? "#1a1e28" : "#3a2a28"} />
      </mesh>
      <mesh position={[0, 1.3, -1.6]}>
        <boxGeometry args={[7.4, 2.6, 0.2]} />
        <meshStandardMaterial color="#241820" />
      </mesh>
      <mesh position={[0, 2.5, -1.4]}>
        <boxGeometry args={[3.2, 0.7, 1.4]} />
        <meshStandardMaterial color="#c4a574" />
      </mesh>
      <mesh position={[0.8, 2.7, -1.2]}>
        <boxGeometry args={[0.35, 0.28, 0.08]} />
        <meshStandardMaterial color="#f2d7a2" emissive="#e2b84a" emissiveIntensity={0.45} />
      </mesh>
      <mesh position={[0, 0.45, 0.2]} onClick={(e) => { e.stopPropagation(); onWheel(); }}>
        <cylinderGeometry args={[0.7, 0.7, 0.12, 16]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[1.6, 0.4, 0.4]}>
        <boxGeometry args={[0.9, 0.7, 0.6]} />
        <meshStandardMaterial color="#2a2030" />
      </mesh>
      <group position={[-1.5, 0, 0.3]}>
        <GnomeRig hat="hat-night" scale={0.8} coat="#2a2030" beard={false} />
      </group>
      <Walker hat={hat} spot={spot.current} />
      <hemisphereLight args={["#ffd0e0", "#2a2030", 0.7]} />
      <pointLight position={[0, 2.2, 0.4]} color={accent} intensity={stage >= 2 ? 8 : 3} />
    </group>
  );
}

export function CasinoRoom() {
  const leave = useGame((s) => s.leaveInterior);
  const coins = useGame((s) => s.coins);
  const days = useGame((s) => s.daysPlayed);
  const wager = useGame((s) => s.wager);
  const stage = prosperity(coins, days);
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed inset-0 z-30 bg-[#140e18]">
      <Canvas camera={{ position: [0, 3.4, 5.4], fov: 42 }}>
        <Pit stage={stage} onWheel={() => setOpen(true)} />
      </Canvas>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between p-3">
        <div className="pointer-events-auto max-w-sm rounded-[16px] bg-parchment/95 px-3 py-2 shadow-panel">
          <p className="font-display text-lg font-semibold text-ink">{CASINO_STAGE[stage]}</p>
          <p className="text-xs font-semibold text-bark/70">
            The pit is downstairs. The dealer lives in the flat above the wheel. Click the floor to walk. Click the table to bet.
          </p>
        </div>
        <button type="button" onClick={leave} className="pointer-events-auto rounded-full bg-parchment px-3 py-2 text-xs font-semibold text-ink">
          Leave
        </button>
      </div>
      {open ? (
        <div className="absolute inset-x-0 bottom-0 z-10 p-3">
          <div className="mx-auto max-w-lg rounded-[20px] bg-parchment p-4 shadow-panel">
            <p className="font-display text-lg font-semibold text-ink">The wheel</p>
            <p className="mt-1 text-sm font-semibold text-bark/70">Most spins lose. A few pay. A rare one hits.</p>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => wager(5)} className="h-11 flex-1 rounded-[14px] bg-pine font-display text-sm font-semibold text-parchment">
                Bet 5
              </button>
              {stage >= 2 ? (
                <button type="button" onClick={() => wager(20)} className="h-11 flex-1 rounded-[14px] bg-gold font-display text-sm font-semibold text-ink">
                  High table 20
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
