import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Kenney } from "./kenney";
import { BEACH_POLY, DESERT_POLY, ISLAND_POLY, onIsland, shapePts, to2, to3 } from "@/lib/game/world3";
import { SEA_LEVEL } from "@/lib/game/data/water";

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

function grassTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d");
  if (!g) return null;
  g.fillStyle = "#6a8a58";
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 700; i++) {
    const blade = i % 5 === 0 ? "#3f5c38" : i % 3 === 0 ? "#8faf6e" : "#7ea062";
    g.fillStyle = blade;
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    g.fillRect(x, y, 1.5, 5 + Math.random() * 9);
  }
  for (let i = 0; i < 40; i++) {
    g.fillStyle = i % 2 ? "#d6c56a" : "#c46a5a";
    g.beginPath();
    g.arc(Math.random() * 256, Math.random() * 256, 1.2, 0, Math.PI * 2);
    g.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(10, 7);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function IslandMesh({ onWalk }: { onWalk: (x: number, y: number) => void }) {
  const grass = useMemo(() => polyGeom(shapePts(ISLAND_POLY), 0.55, 0.08), []);
  const sand = useMemo(() => polyGeom(shapePts(BEACH_POLY), 0.4, 0.02), []);
  const desert = useMemo(() => polyGeom(shapePts(DESERT_POLY), 0.42, 0.05), []);
  const tex = useMemo(() => grassTexture(), []);
  const walk = (e: { button?: number; point: THREE.Vector3; stopPropagation: () => void }) => {
    if (e.button != null && e.button !== 0) return;
    e.stopPropagation();
    const { x, y } = to2(e.point.x, e.point.z);
    if (onIsland(x, y)) onWalk(x, y);
  };
  return (
    <group>
      <mesh geometry={sand} receiveShadow onClick={walk}>
        <meshStandardMaterial color="#ecd9a2" roughness={0.96} />
      </mesh>
      <mesh geometry={desert} receiveShadow onClick={walk}>
        <meshStandardMaterial color="#e4b56a" roughness={0.94} />
      </mesh>
      <mesh geometry={grass} receiveShadow onClick={walk}>
        <meshStandardMaterial map={tex ?? undefined} color={tex ? "#ffffff" : "#6f8f66"} roughness={0.88} />
      </mesh>
    </group>
  );
}

const waterVert = `
  uniform float uTime;
  varying float vWave;
  varying float vDist;
  void main() {
    vec3 p = position;
    float dist = length(p.xy);
    float far = smoothstep(16.0, 52.0, dist);
    float amp = mix(0.012, 0.2, far);
    float w = sin(p.x * 0.42 + uTime * 1.15) * amp + cos(p.y * 0.28 + uTime * 0.75) * amp * 0.75;
    p.z += w;
    vWave = w;
    vDist = dist;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const waterFrag = `
  uniform vec3 uShallow;
  uniform vec3 uDeep;
  uniform vec3 uFoam;
  varying float vWave;
  varying float vDist;
  void main() {
    float deep = smoothstep(14.0, 46.0, vDist);
    vec3 col = mix(uShallow, uDeep, deep);
    float crest = smoothstep(0.06, 0.16, vWave) * deep;
    float shore = 1.0 - smoothstep(12.0, 22.0, vDist);
    col = mix(col, uFoam, max(crest, shore * 0.55));
    gl_FragColor = vec4(col, mix(0.72, 0.94, deep));
  }
`;

function Water() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uShallow: { value: new THREE.Color("#8ecfc6") },
          uDeep: { value: new THREE.Color("#143e4c") },
          uFoam: { value: new THREE.Color("#e7f4f1") },
        },
        vertexShader: waterVert,
        fragmentShader: waterFrag,
        transparent: true,
      }),
    [],
  );
  useFrame(({ clock }) => {
    mat.uniforms.uTime!.value = clock.elapsedTime;
  });
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, SEA_LEVEL, 0]} material={mat} receiveShadow>
      <planeGeometry args={[240, 170, 90, 60]} />
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

export function Terrain({ onWalk }: { onWalk: (x: number, y: number) => void }) {
  return (
    <group>
      <Water />
      <IslandMesh onWalk={onWalk} />
      <Pond />
      <Kenney name="cliff_large_rock" position={to3(1760, 300, 0.12)} scale={1.35} />
      <Kenney name="cliff_cave_rock" position={to3(1380, 1220, 0.1)} scale={1.5} rotation={[0, 0.6, 0]} />
      <Kenney name="cliff_large_rock" position={to3(2360, 220, 0.12)} scale={1.25} />
      <Kenney name="rock_largeA" position={to3(1680, 480, 0.08)} scale={1.05} />
      <Kenney name="rock_largeB" position={to3(1900, 560, 0.08)} scale={0.95} />
      <Kenney name="rock_tallA" position={to3(2280, 180, 0.08)} scale={1.0} />
      <Kenney name="rock_smallB" position={to3(90, 520, 0.04)} scale={0.85} />
      <Kenney name="bridge_wood" position={to3(140, 470, 0.04)} scale={1.15} rotation={[0, 1.1, 0]} />
      <Kenney name="campfire_stones" position={to3(1680, 400, 0.08)} scale={1.0} />
      <Kenney name="statue_obelisk" position={to3(2360, 300, 0.08)} scale={1.05} />
      <Kenney name="tent_smallOpen" position={to3(1600, 620, 0.08)} scale={1.05} />
      <Kenney name="plant_bushLarge" position={to3(160, 280, 0.08)} scale={1.2} />
      <Kenney name="plant_bush" position={to3(240, 200, 0.08)} scale={1.05} />
    </group>
  );
}
