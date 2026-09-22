import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ArmorTint, ShieldMesh, WeaponInHand } from "./gear-mesh";

const HATS: Record<string, { peak: string; body: string; tip: string; kind: "peak" | "straw" | "crown" | "shroom" }> = {
  "hat-berry": { peak: "#c24f45", body: "#8a3a32", tip: "#d6a84c", kind: "peak" },
  "hat-moss": { peak: "#5c7a54", body: "#35543f", tip: "#d6a84c", kind: "peak" },
  "hat-straw": { peak: "#e6d8bc", body: "#c4a574", tip: "#d6a84c", kind: "straw" },
  "hat-mushroom": { peak: "#d66a58", body: "#a8433b", tip: "#f2e8d5", kind: "shroom" },
  "hat-night": { peak: "#2f3d34", body: "#1d2a22", tip: "#d6a84c", kind: "peak" },
  "hat-dragon": { peak: "#a8433b", body: "#6b2e2a", tip: "#d6a84c", kind: "peak" },
  "hat-flower": { peak: "#a8433b", body: "#d6a84c", tip: "#f2e8d5", kind: "crown" },
  "hat-guard": { peak: "#8a7a68", body: "#5b4230", tip: "#d6a84c", kind: "peak" },
};

function HatModel({ id }: { id: string }) {
  const hat = HATS[id] ?? HATS["hat-berry"]!;
  if (hat.kind === "straw") {
    return (
      <group position={[0, 1.08, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.38, 0.38, 0.04, 16]} />
          <meshStandardMaterial color={hat.body} roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.12, 0]} castShadow>
          <cylinderGeometry args={[0.16, 0.2, 0.2, 12]} />
          <meshStandardMaterial color={hat.peak} roughness={0.75} />
        </mesh>
      </group>
    );
  }
  if (hat.kind === "shroom") {
    return (
      <group position={[0, 1.08, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.32, 12, 8, 0, Math.PI * 2, 0, Math.PI / 1.7]} />
          <meshStandardMaterial color={hat.body} roughness={0.6} />
        </mesh>
        <mesh position={[-0.12, 0.12, 0.1]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color={hat.tip} />
        </mesh>
      </group>
    );
  }
  if (hat.kind === "crown") {
    return (
      <group position={[0, 1.05, 0]}>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[Math.sin((i / 5) * Math.PI * 2) * 0.18, 0.06, Math.cos((i / 5) * Math.PI * 2) * 0.18]} castShadow>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshStandardMaterial color={i % 2 ? hat.peak : hat.body} />
          </mesh>
        ))}
      </group>
    );
  }
  return (
    <group position={[0, 1.02, 0]}>
      <mesh castShadow>
        <coneGeometry args={[0.28, 0.62, 10]} />
        <meshStandardMaterial color={hat.peak} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.3, 0]} castShadow>
        <sphereGeometry args={[0.055, 8, 8]} />
        <meshStandardMaterial color={hat.tip} metalness={0.4} roughness={0.4} />
      </mesh>
    </group>
  );
}

export function GnomeRig({
  hat,
  weapon,
  shield,
  armor,
  walking,
  striking,
  scale = 1,
  coat = "#35543f",
}: {
  hat: string;
  weapon?: string | null;
  shield?: string | null;
  armor?: string | null;
  walking?: boolean;
  striking?: boolean;
  scale?: number;
  coat?: string;
}) {
  const bob = useRef<THREE.Group>(null);
  const t = useRef(0);
  const skin = useMemo(() => new THREE.Color("#e8b98c"), []);
  useFrame((_, d) => {
    t.current += d * (walking ? 8 : 2);
    if (!bob.current) return;
    bob.current.position.y = walking ? Math.abs(Math.sin(t.current)) * 0.08 : Math.sin(t.current) * 0.02;
    bob.current.rotation.z = walking ? Math.sin(t.current) * 0.08 : 0;
  });
  return (
    <group scale={scale}>
      <group ref={bob}>
        <mesh position={[0, 0.38, 0]} castShadow>
          <capsuleGeometry args={[0.24, 0.32, 6, 12]} />
          <meshStandardMaterial color={coat} roughness={0.7} />
        </mesh>
        {armor ? <ArmorTint id={armor} /> : null}
        <mesh position={[0, 0.22, 0.02]}>
          <torusGeometry args={[0.2, 0.03, 8, 16]} />
          <meshStandardMaterial color="#d6a84c" roughness={0.45} metalness={0.25} />
        </mesh>
        <mesh position={[0, 0.86, 0]} castShadow>
          <sphereGeometry args={[0.22, 14, 12]} />
          <meshStandardMaterial color={skin} roughness={0.55} />
        </mesh>
        <mesh position={[-0.08, 0.9, 0.17]}>
          <sphereGeometry args={[0.032, 8, 8]} />
          <meshStandardMaterial color="#2a241c" />
        </mesh>
        <mesh position={[0.08, 0.9, 0.17]}>
          <sphereGeometry args={[0.032, 8, 8]} />
          <meshStandardMaterial color="#2a241c" />
        </mesh>
        <mesh position={[0, 0.82, 0.2]} castShadow>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshStandardMaterial color="#dd8f72" />
        </mesh>
        <mesh position={[0, 0.72, 0.12]} castShadow>
          <sphereGeometry args={[0.09, 8, 8]} />
          <meshStandardMaterial color="#e6d8bc" roughness={0.85} />
        </mesh>
        <mesh position={[-0.13, 0.16, 0.06]} rotation={[0.35, 0, 0.15]} castShadow>
          <coneGeometry args={[0.08, 0.22, 6]} />
          <meshStandardMaterial color="#2f3d34" />
        </mesh>
        <mesh position={[0.13, 0.16, 0.06]} rotation={[0.35, 0, -0.15]} castShadow>
          <coneGeometry args={[0.08, 0.22, 6]} />
          <meshStandardMaterial color="#2f3d34" />
        </mesh>
        <HatModel id={hat} />
        <WeaponInHand weaponId={weapon ?? null} striking={striking} />
        {shield ? <ShieldMesh id={shield} /> : null}
      </group>
    </group>
  );
}
