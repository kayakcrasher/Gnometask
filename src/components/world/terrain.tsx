import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Kenney } from "./kenney";
import { BEACH_POLY, ISLAND_POLY, onIsland, shapePts, to2, to3 } from "@/lib/game/world3";

function polyGeom(pts: [number, number][], depth: number, y: number) {
  const shape = new THREE.Shape();
  shape.moveTo(pts[0]![0], pts[0]![1]);
  pts.slice(1).forEach(([x, z]) => shape.lineTo(x, z));
  shape.closePath();
  const g = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.18,
    bevelSize: 0.35,
    bevelSegments: 2,
  });
  g.rotateX(-Math.PI / 2);
  g.translate(0, y - depth, 0);
  g.computeVertexNormals();
  return g;
}

function IslandMesh({ onWalk }: { onWalk: (x: number, y: number) => void }) {
  const grass = useMemo(() => polyGeom(shapePts(ISLAND_POLY), 0.55, 0.08), []);
  const sand = useMemo(() => polyGeom(shapePts(BEACH_POLY), 0.4, 0.02), []);
  const walk = (e: { button?: number; point: THREE.Vector3; stopPropagation: () => void }) => {
    if (e.button != null && e.button !== 0) return;
    e.stopPropagation();
    const { x, y } = to2(e.point.x, e.point.z);
    if (onIsland(x, y)) onWalk(x, y);
  };
  return (
    <group>
      <mesh geometry={sand} receiveShadow onClick={walk}>
        <meshStandardMaterial color="#eaddb0" roughness={0.95} />
      </mesh>
      <mesh geometry={grass} receiveShadow onClick={walk}>
        <meshStandardMaterial color="#6f8f66" roughness={0.92} />
      </mesh>
    </group>
  );
}

function Water() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const m = ref.current.material as THREE.MeshStandardMaterial;
    m.emissiveIntensity = 0.06 + Math.sin(clock.elapsedTime * 0.5) * 0.03;
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.42, 0]} receiveShadow>
      <planeGeometry args={[220, 150, 1, 1]} />
      <meshStandardMaterial color="#4e7370" roughness={0.32} metalness={0.1} emissive="#2a4a48" />
    </mesh>
  );
}

function Pond() {
  const p = to3(520, 190, -0.02);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={p} receiveShadow>
      <circleGeometry args={[4.2, 24]} />
      <meshStandardMaterial color="#6a8f8a" roughness={0.28} metalness={0.12} />
    </mesh>
  );
}

function Path() {
  const spots: [number, number][] = [
    [200, 520],
    [320, 490],
    [470, 500],
    [640, 520],
    [780, 580],
    [900, 640],
    [980, 720],
  ];
  return (
    <group>
      {spots.map(([x, y], i) => (
        <Kenney key={i} name="path_stoneCircle" position={to3(x, y, 0.09)} scale={1.15} rotation={[0, i * 0.4, 0]} />
      ))}
    </group>
  );
}

export function Terrain({ onWalk }: { onWalk: (x: number, y: number) => void }) {
  return (
    <group>
      <Water />
      <IslandMesh onWalk={onWalk} />
      <Pond />
      <Path />
      <Kenney name="cliff_large_rock" position={to3(1760, 300, 0.12)} scale={1.35} />
      <Kenney name="cliff_cave_rock" position={to3(1380, 1220, 0.1)} scale={1.5} rotation={[0, 0.6, 0]} />
      <Kenney name="cliff_large_rock" position={to3(2360, 220, 0.12)} scale={1.25} />
      <Kenney name="rock_largeA" position={to3(1680, 480, 0.08)} scale={1.05} />
      <Kenney name="rock_largeB" position={to3(1900, 560, 0.08)} scale={0.95} />
      <Kenney name="rock_tallA" position={to3(2280, 180, 0.08)} scale={1.0} />
      <Kenney name="rock_smallA" position={to3(400, 500, 0.08)} scale={0.9} />
      <Kenney name="rock_smallB" position={to3(90, 520, 0.04)} scale={0.85} />
      <Kenney name="bridge_wood" position={to3(140, 470, 0.04)} scale={1.15} rotation={[0, 1.1, 0]} />
      <Kenney name="path_stoneCircle" position={to3(824, 530, 0.1)} scale={1.6} />
      <Kenney name="campfire_stones" position={to3(1680, 400, 0.08)} scale={1.0} />
      <Kenney name="statue_obelisk" position={to3(2360, 300, 0.08)} scale={1.05} />
      <Kenney name="tent_smallOpen" position={to3(1600, 620, 0.08)} scale={1.05} />
      {[
        [220, 640],
        [300, 700],
        [480, 680],
        [600, 740],
        [200, 800],
        [1100, 580],
        [1260, 640],
        [90, 300],
        [200, 200],
        [400, 560],
        [700, 600],
        [1500, 500],
      ].map(([x, y], i) => (
        <Kenney
          key={i}
          name={i % 2 ? "grass_large" : "grass"}
          position={to3(x!, y!, 0.08)}
          scale={1.05 + (i % 3) * 0.12}
          rotation={[0, i, 0]}
        />
      ))}
      {[
        [260, 660, "flower_redA"],
        [340, 720, "flower_yellowA"],
        [500, 700, "flower_purpleA"],
        [180, 240, "flower_yellowB"],
        [1180, 500, "flower_redB"],
        [700, 640, "flower_purpleA"],
      ].map(([x, y, n], i) => (
        <Kenney key={`f${i}`} name={n as "flower_redA"} position={to3(Number(x), Number(y), 0.08)} scale={1.15} />
      ))}
      <Kenney name="plant_bushLarge" position={to3(160, 280, 0.08)} scale={1.2} />
      <Kenney name="plant_bush" position={to3(240, 200, 0.08)} scale={1.05} />
      <Kenney name="plant_bushSmall" position={to3(1080, 480, 0.08)} scale={1.0} />
      <Kenney name="crops_wheatStageB" position={to3(240, 760, 0.08)} scale={1.15} />
      <Kenney name="crop_carrot" position={to3(300, 780, 0.08)} scale={1.05} />
      <Kenney name="crop_turnip" position={to3(360, 760, 0.08)} scale={1.05} />
    </group>
  );
}
