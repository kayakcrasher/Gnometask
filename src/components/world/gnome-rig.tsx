import { useRef, type ReactNode } from "react";
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
    <group position={[0, 1.1, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.24, 0.26, 0.06, 12]} />
        <meshStandardMaterial color={hat.peak} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.38, 0]} castShadow>
        <coneGeometry args={[0.24, 0.74, 10]} />
        <meshStandardMaterial color={hat.peak} roughness={0.55} />
      </mesh>
    </group>
  );
}

export function FighterMotion({
  striking,
  recoil,
  children,
}: {
  striking?: boolean;
  recoil?: boolean;
  children: ReactNode;
}) {
  const g = useRef<THREE.Group>(null);
  const t = useRef(0);
  const live = useRef(false);
  useFrame((_, d) => {
    const on = Boolean(striking || recoil);
    if (on && !live.current) t.current = 0;
    live.current = on;
    if (on) t.current = Math.min(1, t.current + d * 3.6);
    else t.current = Math.max(0, t.current - d * 5);
    if (!g.current) return;
    const a = Math.sin(Math.min(1, t.current) * Math.PI);
    if (striking) {
      g.current.position.z = a * 0.38;
      g.current.rotation.x = -a * 0.7;
    } else if (recoil) {
      g.current.position.z = -a * 0.22;
      g.current.rotation.x = a * 0.28;
    } else {
      g.current.position.z = 0;
      g.current.rotation.x = 0;
    }
  });
  return <group ref={g}>{children}</group>;
}

export function GnomeRig({
  hat,
  weapon,
  shield,
  armor,
  walking,
  striking,
  scale = 1,
  coat = "#3c9a46",
  pants = "#c4622d",
  beard = true,
  ears = false,
  skinColor = "#e7b48a",
}: {
  hat: string;
  weapon?: string | null;
  shield?: string | null;
  armor?: string | null;
  walking?: boolean;
  striking?: boolean;
  scale?: number;
  coat?: string;
  pants?: string;
  beard?: boolean;
  ears?: boolean;
  skinColor?: string;
}) {
  const bob = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const t = useRef(0);
  useFrame((_, d) => {
    t.current += d * (walking ? 8 : 1.6);
    const swing = walking ? Math.sin(t.current) * 0.5 : 0;
    if (legL.current) legL.current.rotation.x = swing;
    if (legR.current) legR.current.rotation.x = -swing;
    if (!bob.current) return;
    bob.current.position.y = walking ? Math.abs(Math.sin(t.current)) * 0.045 : Math.sin(t.current) * 0.015;
  });
  const beardColor = skinColor === "#6f8f40" ? "#dfe7c8" : "#f7f4ee";
  return (
    <group scale={scale}>
      <FighterMotion striking={striking}>
        <group ref={bob}>
          <group ref={legL} position={[-0.11, 0, 0]}>
            <mesh position={[0, 0.22, 0]} castShadow>
              <boxGeometry args={[0.13, 0.32, 0.14]} />
              <meshStandardMaterial color={pants} roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.06, 0.02]} castShadow>
              <boxGeometry args={[0.16, 0.12, 0.2]} />
              <meshStandardMaterial color="#1c1a17" roughness={0.85} />
            </mesh>
          </group>
          <group ref={legR} position={[0.11, 0, 0]}>
            <mesh position={[0, 0.22, 0]} castShadow>
              <boxGeometry args={[0.13, 0.32, 0.14]} />
              <meshStandardMaterial color={pants} roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.06, 0.02]} castShadow>
              <boxGeometry args={[0.16, 0.12, 0.2]} />
              <meshStandardMaterial color="#1c1a17" roughness={0.85} />
            </mesh>
          </group>

          <mesh position={[0, 0.55, 0]} castShadow>
            <boxGeometry args={[0.46, 0.4, 0.28]} />
            <meshStandardMaterial color={coat} roughness={0.7} />
          </mesh>
          {armor ? <ArmorTint id={armor} /> : null}
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[0.48, 0.07, 0.3]} />
            <meshStandardMaterial color="#1c1a17" roughness={0.65} />
          </mesh>
          <mesh position={[0, 0.4, 0.16]}>
            <boxGeometry args={[0.12, 0.06, 0.02]} />
            <meshStandardMaterial color="#e2b84a" metalness={0.35} roughness={0.4} />
          </mesh>

          <group position={[-0.26, 0.68, 0.04]} rotation={[0.25, 0, 0.35]}>
            <mesh position={[0, -0.14, 0]} castShadow>
              <boxGeometry args={[0.1, 0.26, 0.1]} />
              <meshStandardMaterial color={coat} roughness={0.7} />
            </mesh>
            <mesh position={[0, -0.3, 0.04]} castShadow>
              <boxGeometry args={[0.08, 0.08, 0.08]} />
              <meshStandardMaterial color={skinColor} roughness={0.6} />
            </mesh>
            {shield ? (
              <group position={[0, -0.28, 0.06]}>
                <ShieldMesh id={shield} />
              </group>
            ) : null}
          </group>
          <group position={[0.2, 0.78, 0.06]} rotation={[0.55, 0.1, weapon ? -0.85 : -0.25]}>
            <mesh position={[0, -0.16, 0]} castShadow>
              <boxGeometry args={[0.1, 0.28, 0.1]} />
              <meshStandardMaterial color={coat} roughness={0.7} />
            </mesh>
          </group>
          <group position={[0.34, 0.58, 0.24]} rotation={[0.1, 0, striking ? -1.15 : -0.18]}>
            <mesh castShadow>
              <boxGeometry args={[0.09, 0.08, 0.1]} />
              <meshStandardMaterial color={skinColor} roughness={0.6} />
            </mesh>
            {weapon ? <WeaponInHand weaponId={weapon} striking={false} /> : null}
          </group>

          <mesh position={[0, 0.92, 0]} castShadow>
            <sphereGeometry args={[0.2, 14, 12]} />
            <meshStandardMaterial color={skinColor} roughness={0.55} />
          </mesh>
          <mesh position={[-0.07, 0.98, 0.16]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshStandardMaterial color="#f7f4ee" />
          </mesh>
          <mesh position={[0.07, 0.98, 0.16]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshStandardMaterial color="#f7f4ee" />
          </mesh>
          <mesh position={[-0.07, 0.985, 0.185]}>
            <sphereGeometry args={[0.016, 8, 8]} />
            <meshStandardMaterial color="#2a241c" />
          </mesh>
          <mesh position={[0.07, 0.985, 0.185]}>
            <sphereGeometry args={[0.016, 8, 8]} />
            <meshStandardMaterial color="#2a241c" />
          </mesh>
          <mesh position={[0, 0.9, 0.18]} rotation={[0.4, 0, 0]} castShadow>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshStandardMaterial color={skinColor} />
          </mesh>
          {beard ? (
            <>
              <mesh position={[0, 0.84, 0.16]} castShadow>
                <boxGeometry args={[0.16, 0.04, 0.06]} />
                <meshStandardMaterial color={beardColor} roughness={0.9} />
              </mesh>
              <mesh position={[0, 0.7, 0.1]} rotation={[0.2, 0, 0]} castShadow>
                <coneGeometry args={[0.16, 0.46, 8]} />
                <meshStandardMaterial color={beardColor} roughness={0.9} />
              </mesh>
            </>
          ) : null}
          {ears ? (
            <>
              <mesh position={[-0.18, 0.94, 0]} rotation={[0, 0, 0.7]} castShadow>
                <coneGeometry args={[0.05, 0.16, 5]} />
                <meshStandardMaterial color={skinColor} />
              </mesh>
              <mesh position={[0.18, 0.94, 0]} rotation={[0, 0, -0.7]} castShadow>
                <coneGeometry args={[0.05, 0.16, 5]} />
                <meshStandardMaterial color={skinColor} />
              </mesh>
            </>
          ) : null}
          <HatModel id={hat} />
        </group>
      </FighterMotion>
    </group>
  );
}
