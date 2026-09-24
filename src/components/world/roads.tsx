import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { GnomeRig } from "./gnome-rig";
import { ROADS, RUNNERS, ROAD_TOP, pathToCapitol } from "@/lib/game/data/country";
import { TOWN_GRIDS, capitolStreets, townStreets } from "@/lib/game/data/grids";
import { groundY, to3 } from "@/lib/game/world3";
import { useGame } from "@/lib/game/store";

const COUNTRY_WIDTH = 1.65;

function cobbleTexture() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const g = c.getContext("2d");
  if (!g) return null;
  let seed = 19;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed & 2147483647) / 2147483647;
  };
  g.fillStyle = "#c4b49a";
  g.fillRect(0, 0, 512, 512);
  const tones = ["#d9cbb6", "#b7a690", "#e6d8c4", "#a89480", "#cfc3ae", "#8f8170", "#efe4d4"];
  for (let i = 0; i < 90; i++) {
    const x = rnd() * 512;
    const y = rnd() * 512;
    const w = 28 + rnd() * 64;
    const h = 22 + rnd() * 46;
    g.fillStyle = tones[Math.floor(rnd() * tones.length)]!;
    g.beginPath();
    g.moveTo(x + rnd() * 8, y);
    g.lineTo(x + w, y + rnd() * 8);
    g.lineTo(x + w - rnd() * 8, y + h);
    g.lineTo(x + rnd() * 6, y + h - rnd() * 6);
    g.closePath();
    g.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function roadGeometry() {
  const positions: number[] = [];
  const uvs: number[] = [];
  const up = (a: number[], b: number[], c: number[]) => {
    const abx = b[0]! - a[0]!;
    const abz = b[2]! - a[2]!;
    const acx = c[0]! - a[0]!;
    const acz = c[2]! - a[2]!;
    return abz * acx - abx * acz;
  };
  const tri = (a: number[], b: number[], c: number[], ua: number[], ub: number[], uc: number[]) => {
    const order = up(a, b, c) >= 0 ? [a, b, c, ua, ub, uc] : [a, c, b, ua, uc, ub];
    for (let i = 0; i < 3; i++) {
      positions.push(order[i]![0]!, order[i]![1]!, order[i]![2]!);
      uvs.push(order[i + 3]![0]!, order[i + 3]![1]!);
    }
  };
  const push = (ax: number, ay: number, bx: number, by: number, width: number) => {
    const a = to3(ax, ay, 0);
    const b = to3(bx, by, 0);
    const dx = b[0] - a[0];
    const dz = b[2] - a[2];
    const len = Math.hypot(dx, dz);
    if (len < 0.02) return;
    const px = (-dz / len) * (width / 2);
    const pz = (dx / len) * (width / 2);
    const top = ROAD_TOP;
    const bot = ROAD_TOP - 0.07;
    const p1 = [a[0] + px, top, a[2] + pz];
    const p2 = [a[0] - px, top, a[2] - pz];
    const p3 = [b[0] + px, top, b[2] + pz];
    const p4 = [b[0] - px, top, b[2] - pz];
    const u1 = len / 1.6;
    const v1 = width / 1.6;
    tri(p1, p3, p4, [0, 0], [u1, 0], [u1, v1]);
    tri(p1, p4, p2, [0, 0], [u1, v1], [0, v1]);
    const s1 = [p1[0]!, bot, p1[2]!];
    const s2 = [p2[0]!, bot, p2[2]!];
    const s3 = [p3[0]!, bot, p3[2]!];
    const s4 = [p4[0]!, bot, p4[2]!];
    tri(p1, s1, s3, [0, 0], [0, 0.2], [u1, 0.2]);
    tri(p1, s3, p3, [0, 0], [u1, 0.2], [u1, 0]);
    tri(p2, p4, s4, [0, 0], [u1, 0], [u1, 0.2]);
    tri(p2, s4, s2, [0, 0], [u1, 0.2], [0, 0.2]);
  };
  for (const road of ROADS) {
    for (let i = 1; i < road.points.length; i++) {
      const [ax, ay] = road.points[i - 1]!;
      const [bx, by] = road.points[i]!;
      push(ax, ay, bx, by, COUNTRY_WIDTH);
    }
  }
  for (const town of TOWN_GRIDS) {
    for (const seg of townStreets(town)) push(seg.ax, seg.ay, seg.bx, seg.by, seg.width ?? 1.8);
  }
  for (const seg of capitolStreets()) push(seg.ax, seg.ay, seg.bx, seg.by, seg.width ?? 2.4);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.computeVertexNormals();
  return geo;
}

function ignoreRaycast() {}

export function CountryRoads() {
  const geo = useMemo(() => roadGeometry(), []);
  const map = useMemo(() => cobbleTexture(), []);
  return (
    <mesh geometry={geo} receiveShadow renderOrder={2} raycast={ignoreRaycast}>
      <meshStandardMaterial
        map={map ?? undefined}
        color={map ? "#ffffff" : "#d7c7a4"}
        roughness={0.92}
        side={THREE.DoubleSide}
        polygonOffset
        polygonOffsetFactor={-2}
        polygonOffsetUnits={-2}
      />
    </mesh>
  );
}

function lengthOf(pts: [number, number][]) {
  let n = 0;
  for (let i = 1; i < pts.length; i++) n += Math.hypot(pts[i]![0] - pts[i - 1]![0], pts[i]![1] - pts[i - 1]![1]);
  return n;
}

function at(pts: [number, number][], dist: number) {
  let left = dist;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]!;
    const b = pts[i]!;
    const seg = Math.hypot(b[0] - a[0], b[1] - a[1]) || 0.001;
    if (left <= seg) {
      const t = left / seg;
      return { x: a[0] + (b[0] - a[0]) * t, y: a[1] + (b[1] - a[1]) * t, nx: b[0] - a[0], ny: b[1] - a[1] };
    }
    left -= seg;
  }
  const last = pts[pts.length - 1]!;
  const prev = pts[pts.length - 2] ?? last;
  return { x: last[0], y: last[1], nx: last[0] - prev[0], ny: last[1] - prev[1] };
}

function DonkeyCart({ crates }: { crates: { current: THREE.Group | null } }) {
  return (
    <group position={[0.42, 0, 0.15]}>
      <group position={[0, 0, 0.72]}>
        <mesh position={[0, 0.42, 0]} castShadow>
          <boxGeometry args={[0.32, 0.28, 0.62]} />
          <meshStandardMaterial color="#8d6a45" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.58, 0.28]} castShadow>
          <boxGeometry args={[0.22, 0.18, 0.24]} />
          <meshStandardMaterial color="#a68462" />
        </mesh>
        <mesh position={[0.08, 0.72, 0.3]} rotation={[0.4, 0, 0.5]}>
          <boxGeometry args={[0.05, 0.16, 0.02]} />
          <meshStandardMaterial color="#5b4230" />
        </mesh>
        <mesh position={[-0.08, 0.72, 0.3]} rotation={[0.4, 0, -0.5]}>
          <boxGeometry args={[0.05, 0.16, 0.02]} />
          <meshStandardMaterial color="#5b4230" />
        </mesh>
        <mesh position={[0, 0.5, 0.4]}>
          <boxGeometry args={[0.06, 0.04, 0.04]} />
          <meshStandardMaterial color="#2a241c" />
        </mesh>
        <mesh position={[0, 0.42, -0.36]}>
          <boxGeometry args={[0.08, 0.16, 0.08]} />
          <meshStandardMaterial color="#6b5340" />
        </mesh>
        {[-0.14, 0.14].map((x) =>
          [-0.16, 0.16].map((z) => (
            <mesh key={`${x}-${z}`} position={[x, 0.16, z]} castShadow>
              <boxGeometry args={[0.07, 0.28, 0.07]} />
              <meshStandardMaterial color="#4a3424" />
            </mesh>
          )),
        )}
      </group>
      <mesh position={[0.12, 0.38, 0.28]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.7, 6]} />
        <meshStandardMaterial color="#5b4230" />
      </mesh>
      <mesh position={[-0.12, 0.38, 0.28]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.7, 6]} />
        <meshStandardMaterial color="#5b4230" />
      </mesh>
      <mesh position={[0, 0.46, -0.15]} castShadow>
        <boxGeometry args={[0.7, 0.28, 0.85]} />
        <meshStandardMaterial color="#c4894a" roughness={0.78} />
      </mesh>
      <mesh position={[0, 0.64, -0.15]}>
        <boxGeometry args={[0.76, 0.06, 0.9]} />
        <meshStandardMaterial color="#8a5a32" />
      </mesh>
      {[-0.32, 0.32].map((x) => (
        <group key={x} position={[x, 0.2, -0.15]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.2, 0.2, 0.08, 14]} />
            <meshStandardMaterial color="#3e2e20" />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.08, 0.1, 8]} />
            <meshStandardMaterial color="#d6c4a4" />
          </mesh>
        </group>
      ))}
      <group ref={crates} position={[0, 0.78, -0.15]}>
        <mesh position={[-0.12, 0, 0.05]} castShadow>
          <boxGeometry args={[0.28, 0.24, 0.28]} />
          <meshStandardMaterial color="#c4a574" />
        </mesh>
        <mesh position={[0.16, 0.02, -0.08]} castShadow>
          <boxGeometry args={[0.24, 0.22, 0.24]} />
          <meshStandardMaterial color="#8a6238" />
        </mesh>
      </group>
    </group>
  );
}

function Runner({
  index,
  name,
  hat,
  coat,
  line,
  path,
}: {
  index: number;
  name: string;
  hat: string;
  coat: string;
  line: string;
  path: [number, number][];
}) {
  const ref = useRef<THREE.Group>(null);
  const crates = useRef<THREE.Group>(null);
  const speak = useGame((s) => s.speak);
  const total = lengthOf(path);
  useFrame(({ clock }) => {
    if (!ref.current || total < 1) return;
    const speed = 26;
    const loop = total * 2;
    const walked = (clock.elapsedTime * speed + index * total * 0.5) % loop;
    const outbound = walked < total;
    const along = outbound ? walked : loop - walked;
    const here = at(path, along);
    const p = to3(here.x, here.y, groundY(here.x, here.y));
    ref.current.position.set(p[0], p[1], p[2]);
    const face = outbound ? 1 : -1;
    ref.current.rotation.y = Math.atan2(here.nx * face, here.ny * face);
    if (crates.current) crates.current.visible = outbound;
  });
  return (
    <group
      ref={ref}
      onClick={(e) => {
        e.stopPropagation();
        speak(line);
      }}
    >
      <GnomeRig hat={hat} scale={1.15} coat={coat} beard />
      <DonkeyCart crates={crates} />
      <Html position={[0, 1.9, 0]} center distanceFactor={20} style={{ pointerEvents: "none" }}>
        <p className="whitespace-nowrap rounded-full bg-ink/75 px-2 py-0.5 text-[10px] font-semibold text-parchment">{name}</p>
      </Html>
    </group>
  );
}

export function SupplyRunners() {
  return (
    <group>
      {RUNNERS.map((runner, index) => (
        <Runner
          key={runner.id}
          index={index}
          name={runner.name}
          hat={runner.hat}
          coat={runner.coat}
          line={runner.line}
          path={pathToCapitol(runner.townId)}
        />
      ))}
    </group>
  );
}
