import { useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BOATS, type BoatId } from "@/lib/game/data/boats";
import { to3 } from "@/lib/game/world3";

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
  return (
    <group position={to3(118, 512, 0)} rotation={[0, 0.15, 0]}>
      <mesh position={[-1.15, 0.18, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.6, 0.08, 0.72]} />
        <meshStandardMaterial color="#c4894a" roughness={0.8} />
      </mesh>
      {[-2.2, -1.2, -0.2, 0.8].map((x) => (
        <mesh key={x} position={[x, -0.05, 0.28]} castShadow>
          <boxGeometry args={[0.08, 0.42, 0.08]} />
          <meshStandardMaterial color="#6b4423" />
        </mesh>
      ))}
      <mesh position={[-2.15, 0.34, 0.28]}>
        <boxGeometry args={[0.06, 0.5, 0.06]} />
        <meshStandardMaterial color="#5b4230" />
      </mesh>
      <mesh position={[-2.15, 0.58, 0.28]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#e7c56a" emissive="#e7c56a" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[-0.4, 0.28, 0.05]} castShadow>
        <boxGeometry args={[0.28, 0.2, 0.28]} />
        <meshStandardMaterial color="#3d6ea5" />
      </mesh>
      <mesh position={[0.35, 0.26, -0.08]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.12, 0.025, 6, 12]} />
        <meshStandardMaterial color="#8a7a68" />
      </mesh>
    </group>
  );
}

export function Harbor3({
  onBoat,
  onCaptain,
}: {
  onBoat: (id: BoatId, x: number, y: number, title: string, blurb: string) => void;
  onCaptain: () => void;
}) {
  const yard = to3(48, 520, 0);
  return (
    <group>
      {BOATS.map((boat) => {
        const p = to3(boat.x, boat.y, -0.02);
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
              <BoatMesh kind={boat.id} />
            </Bob>
          </group>
        );
      })}
      <group
        position={to3(48, 430, 0.02)}
        onClick={(e) => {
          e.stopPropagation();
          onCaptain();
        }}
      >
        <PirateRig />
      </group>
      <Pier />
      <group position={yard}>
        <Gull radius={1.6} speed={0.35} lift={1.8} />
        <Gull radius={2.2} speed={0.22} lift={2.3} />
        <Gull radius={1.1} speed={0.5} lift={1.4} />
      </group>
    </group>
  );
}
