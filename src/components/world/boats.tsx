import { useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { BOATS, type BoatId } from "@/lib/game/data/boats";
import { NEWCOMERS, SUPPLY_BERTH, SUPPLY_PIER, supplyDue } from "@/lib/game/data/supply";
import { useGame } from "@/lib/game/store";
import { groundY, to3 } from "@/lib/game/world3";
import { SEA_LEVEL } from "@/lib/game/data/water";
import { GnomeRig } from "./gnome-rig";

const WOOD = "#c4894a";
const WOOD_DARK = "#8a5a32";
const SAIL = "#f4efe4";

function Bob({ children, amp = 0.05, speed = 0.9 }: { children: ReactNode; amp?: number; speed?: number }) {
  const ref = useRef<THREE.Group>(null);
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime * speed + phase;
    ref.current.position.y = Math.sin(t) * amp;
    ref.current.rotation.z = Math.sin(t * 0.8) * 0.05;
    ref.current.rotation.x = Math.cos(t * 0.6) * 0.03;
  });
  return <group ref={ref}>{children}</group>;
}

function Hull({ length, width, color, lip = "#6b5340" }: { length: number; width: number; color: string; lip?: string }) {
  return (
    <group>
      <mesh position={[0, 0.08, 0]} castShadow>
        <boxGeometry args={[width, 0.16, length]} />
        <meshStandardMaterial color={color} roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[width + 0.06, 0.06, length + 0.06]} />
        <meshStandardMaterial color={lip} roughness={0.8} />
      </mesh>
    </group>
  );
}

function Mast({ h, sailW, z = 0, tint = SAIL }: { h: number; sailW: number; z?: number; tint?: string }) {
  return (
    <group position={[0, 0.2, z]}>
      <mesh position={[0, h / 2, 0]} castShadow>
        <boxGeometry args={[0.04, h, 0.04]} />
        <meshStandardMaterial color={WOOD_DARK} />
      </mesh>
      <mesh position={[sailW * 0.28, h * 0.48, 0]} castShadow>
        <boxGeometry args={[sailW, h * 0.62, 0.02]} />
        <meshStandardMaterial color={tint} roughness={0.9} />
      </mesh>
    </group>
  );
}

export function BoatMesh({ kind }: { kind: BoatId | "goblin" }) {
  if (kind === "row") {
    return (
      <group>
        <Hull length={0.95} width={0.38} color={WOOD} />
        <mesh position={[0, 0.24, 0.12]} rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[0.03, 0.7, 0.04]} />
          <meshStandardMaterial color="#5b4230" />
        </mesh>
        <mesh position={[0.22, 0.18, -0.1]}>
          <boxGeometry args={[0.16, 0.03, 0.22]} />
          <meshStandardMaterial color="#e6d3b0" />
        </mesh>
      </group>
    );
  }
  if (kind === "sail") {
    return (
      <group>
        <Hull length={1.15} width={0.42} color="#d08a45" />
        <Mast h={1.15} sailW={0.55} />
      </group>
    );
  }
  if (kind === "fisher") {
    return (
      <group>
        <Hull length={1.35} width={0.5} color="#e07a3d" lip="#2f4a6a" />
        <mesh position={[0, 0.42, -0.15]} castShadow>
          <boxGeometry args={[0.36, 0.32, 0.42]} />
          <meshStandardMaterial color="#3d6ea5" />
        </mesh>
        <mesh position={[0.1, 0.52, 0.02]}>
          <boxGeometry args={[0.12, 0.1, 0.02]} />
          <meshStandardMaterial color="#d6ecff" />
        </mesh>
        <Mast h={0.7} sailW={0.28} z={0.28} />
      </group>
    );
  }
  if (kind === "barge") {
    return (
      <group>
        <Hull length={1.8} width={0.62} color="#c47b3a" lip="#5b4230" />
        {[
          ["#3d8f8a", -0.2],
          ["#d06a45", 0.15],
          ["#3d6ea5", 0.42],
        ].map(([color, z]) => (
          <mesh key={String(z)} position={[0, 0.36, Number(z)]} castShadow>
            <boxGeometry args={[0.4, 0.22, 0.28]} />
            <meshStandardMaterial color={color as string} />
          </mesh>
        ))}
      </group>
    );
  }
  if (kind === "goblin") {
    return (
      <group>
        <Hull length={1.25} width={0.48} color="#3d6a28" lip="#24381c" />
        <Mast h={0.95} sailW={0.48} tint="#4c7a3a" />
        <mesh position={[0.16, 0.55, 0.02]}>
          <boxGeometry args={[0.16, 0.1, 0.02]} />
          <meshStandardMaterial color="#1c2a16" />
        </mesh>
      </group>
    );
  }
  return (
    <group>
      <Hull length={1.55} width={0.55} color={WOOD} lip="#a8433b" />
      <Mast h={1.25} sailW={0.5} z={0.15} />
      <Mast h={0.85} sailW={0.36} z={-0.38} />
      <mesh position={[0.28, 0.28, 0.35]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.34, 8]} />
        <meshStandardMaterial color="#2a241c" />
      </mesh>
      <mesh position={[0.28, 0.18, 0.22]}>
        <boxGeometry args={[0.16, 0.12, 0.18]} />
        <meshStandardMaterial color="#6b5340" />
      </mesh>
    </group>
  );
}

export function PirateRig() {
  return (
    <group scale={0.9}>
      <mesh position={[-0.1, 0.2, 0]} castShadow>
        <boxGeometry args={[0.12, 0.28, 0.12]} />
        <meshStandardMaterial color="#a8433b" />
      </mesh>
      <mesh position={[0.1, 0.2, 0]} castShadow>
        <boxGeometry args={[0.12, 0.28, 0.12]} />
        <meshStandardMaterial color="#f2e8d5" />
      </mesh>
      <mesh position={[-0.1, 0.06, 0.02]} castShadow>
        <boxGeometry args={[0.15, 0.1, 0.18]} />
        <meshStandardMaterial color="#1c1a17" />
      </mesh>
      <mesh position={[0.1, 0.06, 0.02]} castShadow>
        <boxGeometry args={[0.15, 0.1, 0.18]} />
        <meshStandardMaterial color="#1c1a17" />
      </mesh>
      <mesh position={[0, 0.52, 0]} castShadow>
        <boxGeometry args={[0.46, 0.36, 0.28]} />
        <meshStandardMaterial color="#a8433b" roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.56, 0.15]}>
        <boxGeometry args={[0.16, 0.18, 0.02]} />
        <meshStandardMaterial color="#f7f4ee" />
      </mesh>
      <mesh position={[0, 0.38, 0]}>
        <boxGeometry args={[0.48, 0.06, 0.3]} />
        <meshStandardMaterial color="#1c1a17" />
      </mesh>
      <mesh position={[0, 0.38, 0.16]}>
        <boxGeometry args={[0.1, 0.05, 0.02]} />
        <meshStandardMaterial color="#e2b84a" metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.9, 0]} castShadow>
        <sphereGeometry args={[0.18, 12, 10]} />
        <meshStandardMaterial color="#e7b48a" />
      </mesh>
      <mesh position={[0, 0.7, 0.08]} rotation={[0.15, 0, 0]} castShadow>
        <coneGeometry args={[0.12, 0.28, 7]} />
        <meshStandardMaterial color="#8a3a32" />
      </mesh>
      <mesh position={[-0.06, 0.95, 0.14]}>
        <sphereGeometry args={[0.028, 8, 8]} />
        <meshStandardMaterial color="#f7f4ee" />
      </mesh>
      <mesh position={[0.07, 0.95, 0.13]}>
        <boxGeometry args={[0.07, 0.035, 0.02]} />
        <meshStandardMaterial color="#1c1a17" />
      </mesh>
      <mesh position={[0, 1.08, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.22, 0.05, 10]} />
        <meshStandardMaterial color="#1c1a17" />
      </mesh>
      <mesh position={[0, 1.16, 0]} rotation={[0.1, 0, 0.08]} castShadow>
        <boxGeometry args={[0.36, 0.05, 0.36]} />
        <meshStandardMaterial color="#d6a84c" />
      </mesh>
      <mesh position={[0.32, 0.46, 0.06]} rotation={[0.2, 0, -0.9]} castShadow>
        <boxGeometry args={[0.035, 0.42, 0.02]} />
        <meshStandardMaterial color="#d5dde4" metalness={0.5} roughness={0.3} />
      </mesh>
    </group>
  );
}

function Gull({ radius, speed, lift }: { radius: number; speed: number; lift: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const a = clock.elapsedTime * speed;
    ref.current.position.set(Math.cos(a) * radius, lift + Math.sin(a * 3) * 0.12, Math.sin(a) * radius);
    ref.current.rotation.y = -a + Math.PI / 2;
    ref.current.rotation.z = Math.sin(a * 8) * 0.35;
  });
  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[0.28, 0.015, 0.08]} />
        <meshStandardMaterial color="#f7f3ea" />
      </mesh>
    </group>
  );
}

function Pier() {
  const posts = [-5.4, -4.2, -3.0, -1.8, -0.6, 0.4];
  return (
    <group position={to3(78, 520, 0)}>
      <mesh position={[-2.8, 0.18, 0]} castShadow receiveShadow>
        <boxGeometry args={[6.4, 0.1, 0.9]} />
        <meshStandardMaterial color="#c4894a" roughness={0.8} />
      </mesh>
      <mesh position={[-2.6, 0.28, 0.42]}>
        <boxGeometry args={[6.6, 0.06, 0.06]} />
        <meshStandardMaterial color="#6b4423" />
      </mesh>
      {posts.map((x) => (
        <mesh key={x} position={[x, -0.02, 0.32]} castShadow>
          <boxGeometry args={[0.1, 0.5, 0.1]} />
          <meshStandardMaterial color="#5b3a24" />
        </mesh>
      ))}
      <mesh position={[-5.6, 0.55, 0.32]}>
        <boxGeometry args={[0.06, 0.55, 0.06]} />
        <meshStandardMaterial color="#5b4230" />
      </mesh>
      <mesh position={[-5.6, 0.86, 0.32]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#e7c56a" emissive="#e7c56a" emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[-0.2, 0.34, 0.08]} castShadow>
        <boxGeometry args={[0.36, 0.24, 0.36]} />
        <meshStandardMaterial color="#3d6ea5" />
      </mesh>
      <mesh position={[0.7, 0.32, -0.1]} rotation={[Math.PI / 2, 0, 0.4]}>
        <torusGeometry args={[0.14, 0.03, 6, 12]} />
        <meshStandardMaterial color="#8a7a68" />
      </mesh>
    </group>
  );
}

function Dockhouse({ onEnter }: { onEnter: () => void }) {
  const p = to3(108, 515, groundY(108, 515));
  return (
    <group
      position={p}
      rotation={[0, Math.PI / 2, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onEnter();
      }}
    >
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.7, 1.1, 1.25]} />
        <meshStandardMaterial color="#efe4cf" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[1.82, 0.28, 1.35]} />
        <meshStandardMaterial color="#c9c3b4" />
      </mesh>
      <mesh position={[0, 0.42, 0.64]} castShadow>
        <boxGeometry args={[0.36, 0.62, 0.06]} />
        <meshStandardMaterial color="#5b4230" />
      </mesh>
      {[-0.48, 0.48].map((x) => (
        <mesh key={x} position={[x, 0.62, 0.64]}>
          <boxGeometry args={[0.28, 0.28, 0.04]} />
          <meshStandardMaterial color="#9ec3d6" />
        </mesh>
      ))}
      <mesh position={[0, 1.55, 0]} castShadow>
        <boxGeometry args={[1.5, 0.85, 1.08]} />
        <meshStandardMaterial color="#f3ead8" />
      </mesh>
      <mesh position={[0, 1.18, 0.62]} castShadow>
        <boxGeometry args={[1.55, 0.08, 0.32]} />
        <meshStandardMaterial color="#8a5a32" />
      </mesh>
      <mesh position={[0, 2.12, 0]} rotation={[0, 0, 0]} castShadow>
        <boxGeometry args={[1.7, 0.12, 1.3]} />
        <meshStandardMaterial color="#a33b32" />
      </mesh>
      <mesh position={[0.55, 2.45, 0]} castShadow>
        <boxGeometry args={[0.16, 0.4, 0.16]} />
        <meshStandardMaterial color="#8a7a68" />
      </mesh>
      <Html position={[0, 2.3, 0.7]} center distanceFactor={16} style={{ pointerEvents: "none" }}>
        <p className="rounded-full bg-ink/80 px-2 py-0.5 font-display text-[11px] font-semibold text-parchment">Dockhouse</p>
      </Html>
    </group>
  );
}

function SupplyHull() {
  return (
    <group scale={3.2}>
      <mesh position={[0, 0.22, 0]} castShadow>
        <boxGeometry args={[0.95, 0.28, 3.6]} />
        <meshStandardMaterial color="#a86b3c" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.38, 0]} castShadow>
        <boxGeometry args={[1.05, 0.08, 3.7]} />
        <meshStandardMaterial color="#c4894a" roughness={0.75} />
      </mesh>
      {[-1.2, -0.4, 0.4, 1.2].map((z) => (
        <mesh key={z} position={[0, 0.22, z]}>
          <boxGeometry args={[0.98, 0.04, 0.06]} />
          <meshStandardMaterial color="#6b4423" />
        </mesh>
      ))}
      <mesh position={[0, 0.62, -0.15]} castShadow>
        <boxGeometry args={[0.62, 0.42, 1.2]} />
        <meshStandardMaterial color="#d8c4a0" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.88, -0.15]} castShadow>
        <boxGeometry args={[0.72, 0.08, 1.35]} />
        <meshStandardMaterial color="#8a3a32" />
      </mesh>
      <mesh position={[0.22, 1.15, -0.05]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, 0.4, 8]} />
        <meshStandardMaterial color="#3a2a22" />
      </mesh>
      <mesh position={[0, 0.58, 1.2]} castShadow>
        <boxGeometry args={[0.42, 0.28, 0.42]} />
        <meshStandardMaterial color="#c4894a" />
      </mesh>
      <mesh position={[-0.28, 0.56, -1.35]} castShadow>
        <boxGeometry args={[0.34, 0.24, 0.4]} />
        <meshStandardMaterial color="#6b4423" />
      </mesh>
      <mesh position={[0, 0.7, -1.7]}>
        <boxGeometry args={[0.08, 0.7, 0.08]} />
        <meshStandardMaterial color="#5b4230" />
      </mesh>
    </group>
  );
}

function SupplyPier() {
  const posts = [-3.8, -2.4, -1.0, 0.4];
  return (
    <group position={to3(SUPPLY_PIER.x, SUPPLY_PIER.y, 0)}>
      <mesh position={[-1.6, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[5.2, 0.12, 1.15]} />
        <meshStandardMaterial color="#b87840" roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.32, 0.52]}>
        <boxGeometry args={[3.2, 0.08, 0.08]} />
        <meshStandardMaterial color="#5b3a24" />
      </mesh>
      {posts.map((x) => (
        <mesh key={x} position={[x, -0.05, 0.4]} castShadow>
          <boxGeometry args={[0.12, 0.55, 0.12]} />
          <meshStandardMaterial color="#4a3020" />
        </mesh>
      ))}
      {[-1.2, 1.1].map((x) => (
        <mesh key={`b${x}`} position={[x, 0.38, 0.48]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.22, 8]} />
          <meshStandardMaterial color="#2a241c" />
        </mesh>
      ))}
      <mesh position={[0.9, 0.42, -0.1]} castShadow>
        <boxGeometry args={[0.4, 0.32, 0.4]} />
        <meshStandardMaterial color="#c4553a" />
      </mesh>
      <mesh position={[1.15, 0.58, -0.1]} castShadow>
        <boxGeometry args={[0.32, 0.24, 0.32]} />
        <meshStandardMaterial color="#d6a84c" />
      </mesh>
      <Html position={[0, 0.9, 0]} center distanceFactor={16} style={{ pointerEvents: "none" }}>
        <p className="rounded-full bg-ink/80 px-2 py-0.5 font-display text-[11px] font-semibold text-parchment">Supply</p>
      </Html>
    </group>
  );
}

function SupplyShip() {
  const days = useGame((s) => s.daysPlayed);
  const supplyDay = useGame((s) => s.supplyDay);
  const newcomer = useGame((s) => s.newcomer);
  const take = useGame((s) => s.takeSupply);
  const welcome = useGame((s) => s.welcomeNewcomer);
  const due = supplyDue(days) && supplyDay === days;
  const ref = useRef<THREE.Group>(null);
  const t = useRef(0);
  const spoke = useRef(false);
  const who = NEWCOMERS.find((n) => n.name === newcomer);
  useFrame((_, dt) => {
    if (!due || !ref.current) return;
    t.current = Math.min(1, t.current + dt / 8);
    const eased = 1 - Math.pow(1 - t.current, 3);
    const x = -220 + eased * (SUPPLY_BERTH.x - -220);
    const p = to3(x, SUPPLY_BERTH.y, 0);
    ref.current.position.set(p[0], SEA_LEVEL + 0.08 + Math.sin(eased * 8) * 0.03, p[2]);
    ref.current.rotation.y = 0;
    if (!spoke.current && t.current > 0.92) {
      spoke.current = true;
      const name = useGame.getState().newcomer;
      useGame.getState().speak(
        name
          ? `Supply ship tied up. Crates on the south pier, and ${name} is coming ashore.`
          : "Supply ship tied up on the south pier. The mainland sent crates.",
      );
    }
  });
  if (!due) return null;
  return (
    <group>
      <group ref={ref}>
        <group
          onClick={(e) => {
            e.stopPropagation();
            take();
          }}
        >
          <SupplyHull />
        </group>
      </group>
      <mesh
        position={to3((SUPPLY_PIER.x + SUPPLY_BERTH.x) / 2, (SUPPLY_PIER.y + SUPPLY_BERTH.y) / 2, 0.35)}
        rotation={[0.4, 0, 0]}
        castShadow
      >
        <boxGeometry args={[0.7, 0.06, 0.28]} />
        <meshStandardMaterial color="#c4894a" />
      </mesh>
      <group
        position={to3(SUPPLY_PIER.x + 20, SUPPLY_PIER.y + 8, 0.28)}
        onClick={(e) => {
          e.stopPropagation();
          take();
        }}
      >
        <mesh castShadow>
          <boxGeometry args={[0.34, 0.28, 0.34]} />
          <meshStandardMaterial color="#8a6238" />
        </mesh>
      </group>
      {who ? (
        <group
          position={to3(SUPPLY_PIER.x - 10, SUPPLY_PIER.y + 18, groundY(SUPPLY_PIER.x, SUPPLY_PIER.y))}
          onClick={(e) => {
            e.stopPropagation();
            welcome();
          }}
        >
          <GnomeRig hat={who.hat} scale={0.9} beard={false} />
          <Html position={[0, 1.6, 0]} center distanceFactor={14} style={{ pointerEvents: "none" }}>
            <p className="whitespace-nowrap rounded-full bg-ink/80 px-2 py-0.5 font-display text-[11px] font-semibold text-parchment">
              {who.name}
            </p>
          </Html>
        </group>
      ) : null}
    </group>
  );
}

export function Harbor3({
  onBoat,
  onCaptain,
  onHouse,
}: {
  onBoat: (id: BoatId, x: number, y: number, title: string, blurb: string) => void;
  onCaptain: () => void;
  onHouse: () => void;
}) {
  const yard = to3(90, 430, 0);
  return (
    <group>
      {BOATS.map((boat) => {
        const p = to3(boat.x, boat.y, SEA_LEVEL + 0.06);
        return (
          <group
            key={boat.id}
            position={p}
            rotation={[0, boat.id === "barge" ? 0.4 : -0.5, 0]}
            onClick={(e) => {
              e.stopPropagation();
              onBoat(boat.id, boat.x, boat.y, boat.name, boat.blurb);
            }}
          >
            <Bob speed={0.7 + boat.need * 0.05}>
              <group scale={2.4}>
                <BoatMesh kind={boat.id} />
              </group>
            </Bob>
          </group>
        );
      })}
      <group
        position={to3(90, 470, 0.02)}
        onClick={(e) => {
          e.stopPropagation();
          onCaptain();
        }}
      >
        <PirateRig />
      </group>
      <Pier />
      <SupplyPier />
      <Dockhouse onEnter={onHouse} />
      <SupplyShip />
      <group position={yard}>
        <Gull radius={1.6} speed={0.35} lift={1.8} />
        <Gull radius={2.2} speed={0.22} lift={2.3} />
        <Gull radius={1.1} speed={0.5} lift={1.4} />
      </group>
    </group>
  );
}
