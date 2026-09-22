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
    <group scale={0.85}>
      <mesh position={[0, 0.42, 0]} castShadow>
        <capsuleGeometry args={[0.26, 0.28, 6, 10]} />
        <meshStandardMaterial color="#a8433b" roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.28, 0.12]} castShadow>
        <sphereGeometry args={[0.16, 10, 8]} />
        <meshStandardMaterial color="#f2e8d5" />
      </mesh>
      <mesh position={[0, 0.22, 0.14]}>
        <boxGeometry args={[0.22, 0.05, 0.02]} />
        <meshStandardMaterial color="#a8433b" />
      </mesh>
      <mesh position={[0, 0.72, 0]} castShadow>
        <sphereGeometry args={[0.2, 12, 10]} />
        <meshStandardMaterial color="#e8b98c" />
      </mesh>
      <mesh position={[0, 0.62, 0.1]} castShadow>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#8a3a32" />
      </mesh>
      <mesh position={[-0.06, 0.76, 0.16]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#2a241c" />
      </mesh>
      <mesh position={[0.07, 0.76, 0.15]}>
        <boxGeometry args={[0.07, 0.04, 0.02]} />
        <meshStandardMaterial color="#1c1a17" />
      </mesh>
      <mesh position={[0, 0.98, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.2, 0.08, 10]} />
        <meshStandardMaterial color="#1c1a17" />
      </mesh>
      <mesh position={[0, 1.08, 0]} rotation={[0.15, 0, 0.1]} castShadow>
        <boxGeometry args={[0.34, 0.06, 0.34]} />
        <meshStandardMaterial color="#d6a84c" />
      </mesh>
      <mesh position={[0.32, 0.38, 0.08]} rotation={[0.2, 0, -0.8]} castShadow>
        <boxGeometry args={[0.04, 0.36, 0.04]} />
        <meshStandardMaterial color="#cfd6dc" metalness={0.45} roughness={0.35} />
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
      <group position={yard}>
        <Gull radius={1.6} speed={0.35} lift={1.8} />
        <Gull radius={2.2} speed={0.22} lift={2.3} />
        <Gull radius={1.1} speed={0.5} lift={1.4} />
      </group>
    </group>
  );
}
