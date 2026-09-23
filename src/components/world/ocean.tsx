import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGame } from "@/lib/game/store";
import { to3 } from "@/lib/game/world3";

const SCHOOLS: { cx: number; cy: number; color: string; n: number; speed: number; radius: number }[] = [
  { cx: -10, cy: 470, color: "#d5dde4", n: 5, speed: 0.35, radius: 1.4 },
  { cx: 10, cy: 620, color: "#3d8f8a", n: 4, speed: 0.28, radius: 1.8 },
  { cx: 60, cy: 760, color: "#c47b3a", n: 3, speed: 0.22, radius: 1.5 },
  { cx: 1800, cy: 1480, color: "#e07a6a", n: 4, speed: 0.3, radius: 2 },
  { cx: 2500, cy: 280, color: "#3d6ea5", n: 3, speed: 0.18, radius: 2.2 },
  { cx: 400, cy: -20, color: "#c9d6f2", n: 3, speed: 0.26, radius: 1.6 },
];

function FishBody({ color }: { color: string }) {
  return (
    <group>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <capsuleGeometry args={[0.05, 0.14, 3, 6]} />
        <meshStandardMaterial color={color} roughness={0.45} />
      </mesh>
      <mesh position={[-0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.045, 0.09, 4]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

function School({
  cx,
  cy,
  color,
  n,
  speed,
  radius,
}: {
  cx: number;
  cy: number;
  color: string;
  n: number;
  speed: number;
  radius: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const origin = to3(cx, cy, -0.22);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime * speed;
    ref.current.children.forEach((child, i) => {
      const a = t + (i / n) * Math.PI * 2;
      const wobble = Math.sin(t * 3 + i) * 0.08;
      child.position.set(Math.cos(a) * radius, wobble, Math.sin(a) * radius * 0.65);
      child.rotation.y = -a + Math.PI / 2;
    });
  });
  return (
    <group ref={ref} position={origin}>
      {Array.from({ length: n }, (_, i) => (
        <group key={i}>
          <FishBody color={color} />
        </group>
      ))}
    </group>
  );
}

function Buoy({ x, y }: { x: number; y: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.y = Math.sin(clock.elapsedTime * 1.3 + x) * 0.05;
  });
  return (
    <group ref={ref} position={to3(x, y, -0.12)}>
      <mesh castShadow>
        <sphereGeometry args={[0.12, 10, 8]} />
        <meshStandardMaterial color="#c4553a" />
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <boxGeometry args={[0.02, 0.16, 0.02]} />
        <meshStandardMaterial color="#f4efe4" />
      </mesh>
    </group>
  );
}

export function OceanLife() {
  return (
    <group>
      {SCHOOLS.map((s) => (
        <School key={`${s.cx}-${s.cy}`} {...s} />
      ))}
      <Buoy x={-30} y={430} />
      <Buoy x={20} y={700} />
      <Buoy x={120} y={820} />
    </group>
  );
}

export function CastLine() {
  const fishing = useGame((s) => s.fishing);
  const rod = useRef<THREE.Group>(null);
  const shadow = useRef<THREE.Mesh>(null);
  const fish = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!fishing || !rod.current || !shadow.current || !fish.current) return;
    const t = Math.min(1, (Date.now() - fishing.started) / 2600);
    const cast = Math.sin(Math.min(1, t / 0.28) * Math.PI);
    rod.current.rotation.x = -0.4 - cast * 1.15;
    const swim = t < 0.72 ? t / 0.72 : 1;
    const dart = t < 0.72 ? Math.sin(t * 28) * 0.18 : (t - 0.72) / 0.28;
    shadow.current.position.x = (swim - 0.5) * 0.8 + (1 - dart) * 0.3;
    shadow.current.scale.setScalar(0.7 + (1 - t) * 0.5);
    fish.current.visible = t > 0.55;
    fish.current.position.x = shadow.current.position.x;
    fish.current.position.y = t > 0.82 ? (t - 0.82) * 1.4 : -0.05;
  });
  if (!fishing) return null;
  const splash = to3(fishing.x, fishing.y, -0.2);
  return (
    <group position={splash}>
      <group ref={rod} position={[0.35, 0.7, 0.2]}>
        <mesh position={[0, 0.28, 0]} castShadow>
          <boxGeometry args={[0.03, 0.62, 0.03]} />
          <meshStandardMaterial color="#6b4423" />
        </mesh>
        <mesh position={[0.02, 0.58, -0.35]}>
          <boxGeometry args={[0.012, 0.012, 0.7]} />
          <meshStandardMaterial color="#f4efe4" />
        </mesh>
      </group>
      <mesh ref={shadow} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <circleGeometry args={[0.22, 16]} />
        <meshStandardMaterial color={fishing.shadow} transparent opacity={0.55} />
      </mesh>
      <group ref={fish}>
        <FishBody color={fishing.color} />
      </group>
    </group>
  );
}
