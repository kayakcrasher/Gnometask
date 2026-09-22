import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { to3, groundY } from "@/lib/game/world3";

function wander(ref: RefObject<THREE.Group | null>, origin: [number, number, number], span: number, speed: number) {
  const t = { n: Math.random() * 10 };
  return (d: number) => {
    if (!ref.current) return;
    t.n += d * speed;
    ref.current.position.x = origin[0] + Math.sin(t.n) * span;
    ref.current.position.z = origin[2] + Math.cos(t.n * 0.8) * span;
    ref.current.rotation.y = Math.atan2(
      Math.cos(t.n) * span,
      Math.sin(t.n * 0.8) * span * 0.8,
    );
  };
}

export function Chicken3({ x, y, onClick }: { x: number; y: number; onClick?: () => void }) {
  const p = to3(x, y, groundY(x, y));
  const ref = useRef<THREE.Group>(null);
  const bob = useRef(0);
  useFrame((_, d) => {
    bob.current += d * 6;
    if (ref.current) ref.current.position.y = p[1] + Math.abs(Math.sin(bob.current)) * 0.04;
  });
  return (
    <group ref={ref} position={p} onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
      <mesh position={[0, 0.18, 0]} castShadow>
        <sphereGeometry args={[0.12, 10, 8]} />
        <meshStandardMaterial color="#f2e8d5" />
      </mesh>
      <mesh position={[0.12, 0.22, 0]} castShadow>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#f2e8d5" />
      </mesh>
      <mesh position={[0.18, 0.22, 0]}>
        <coneGeometry args={[0.03, 0.08, 6]} />
        <meshStandardMaterial color="#d6a84c" />
      </mesh>
      <mesh position={[0, 0.28, -0.02]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#a8433b" />
      </mesh>
    </group>
  );
}

export function Rabbit({ x, y }: { x: number; y: number }) {
  const origin = to3(x, y, groundY(x, y));
  const ref = useRef<THREE.Group>(null);
  const fn = useRef(wander(ref, origin, 1.4, 0.6));
  useFrame((_, d) => fn.current(d));
  return (
    <group ref={ref} position={origin}>
      <mesh position={[0, 0.12, 0]} castShadow>
        <sphereGeometry args={[0.1, 10, 8]} />
        <meshStandardMaterial color="#e6d8bc" />
      </mesh>
      <mesh position={[-0.04, 0.26, -0.02]} castShadow>
        <capsuleGeometry args={[0.02, 0.12, 3, 6]} />
        <meshStandardMaterial color="#e6d8bc" />
      </mesh>
      <mesh position={[0.04, 0.26, -0.02]} castShadow>
        <capsuleGeometry args={[0.02, 0.12, 3, 6]} />
        <meshStandardMaterial color="#e6d8bc" />
      </mesh>
    </group>
  );
}

export function Duck({ x, y }: { x: number; y: number }) {
  const origin = to3(x, y, -0.12);
  const ref = useRef<THREE.Group>(null);
  const t = useRef(Math.random() * 10);
  useFrame((_, d) => {
    t.current += d * 0.5;
    if (!ref.current) return;
    ref.current.position.x = origin[0] + Math.sin(t.current) * 1.6;
    ref.current.position.z = origin[2] + Math.cos(t.current) * 1.1;
    ref.current.position.y = -0.08 + Math.sin(t.current * 2) * 0.03;
  });
  return (
    <group ref={ref} position={origin}>
      <mesh position={[0, 0.08, 0]} castShadow>
        <sphereGeometry args={[0.1, 10, 8]} />
        <meshStandardMaterial color="#c4963d" />
      </mesh>
      <mesh position={[0.1, 0.14, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#c4963d" />
      </mesh>
      <mesh position={[0.16, 0.13, 0]}>
        <coneGeometry args={[0.025, 0.07, 6]} />
        <meshStandardMaterial color="#a8433b" />
      </mesh>
    </group>
  );
}

export function Sheep({ x, y }: { x: number; y: number }) {
  const origin = to3(x, y, groundY(x, y));
  const ref = useRef<THREE.Group>(null);
  const fn = useRef(wander(ref, origin, 2.2, 0.25));
  useFrame((_, d) => fn.current(d));
  return (
    <group ref={ref} position={origin}>
      <mesh position={[0, 0.22, 0]} castShadow>
        <sphereGeometry args={[0.2, 10, 8]} />
        <meshStandardMaterial color="#f4f1ea" />
      </mesh>
      <mesh position={[0.18, 0.2, 0]} castShadow>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#2a241c" />
      </mesh>
    </group>
  );
}

export function Cat({ x, y }: { x: number; y: number }) {
  const origin = to3(x, y, groundY(x, y));
  const ref = useRef<THREE.Group>(null);
  const fn = useRef(wander(ref, origin, 1.1, 0.35));
  useFrame((_, d) => fn.current(d));
  return (
    <group ref={ref} position={origin}>
      <mesh position={[0, 0.1, 0]} castShadow>
        <capsuleGeometry args={[0.07, 0.14, 4, 8]} />
        <meshStandardMaterial color="#6b5340" />
      </mesh>
      <mesh position={[0.1, 0.16, 0]} castShadow>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#6b5340" />
      </mesh>
    </group>
  );
}

export function IslandAnimals({ chicken, onChicken }: { chicken: { x: number; y: number } | null; onChicken: () => void }) {
  return (
    <group>
      {chicken ? <Chicken3 x={chicken.x} y={chicken.y} onClick={onChicken} /> : null}
      <Rabbit x={280} y={700} />
      <Rabbit x={520} y={760} />
      <Duck x={500} y={190} />
      <Duck x={540} y={210} />
      <Sheep x={1180} y={620} />
      <Sheep x={1280} y={680} />
      <Cat x={820} y={520} />
      <Cat x={940} y={500} />
    </group>
  );
}
