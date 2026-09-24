import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { GnomeRig } from "./gnome-rig";
import { ROADS, RUNNERS, pathToCapitol } from "@/lib/game/data/country";
import { groundY, to3 } from "@/lib/game/world3";
import { useGame } from "@/lib/game/store";

function steps(ax: number, ay: number, bx: number, by: number) {
  const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / 36));
  const out: [number, number, number, number][] = [];
  for (let i = 0; i < n; i++) {
    const t0 = i / n;
    const t1 = (i + 1) / n;
    out.push([ax + (bx - ax) * t0, ay + (by - ay) * t0, ax + (bx - ax) * t1, ay + (by - ay) * t1]);
  }
  return out;
}

function Strip({ ax, ay, bx, by }: { ax: number; ay: number; bx: number; by: number }) {
  const a = to3(ax, ay, 0);
  const b = to3(bx, by, 0);
  const len = Math.hypot(b[0] - a[0], b[2] - a[2]);
  if (len < 0.02) return null;
  const y = groundY((ax + bx) / 2, (ay + by) / 2) + 0.05;
  return (
    <mesh
      position={[(a[0] + b[0]) / 2, y, (a[2] + b[2]) / 2]}
      rotation={[0, Math.atan2(b[0] - a[0], b[2] - a[2]), 0]}
      receiveShadow
    >
      <boxGeometry args={[0.62, 0.045, len + 0.04]} />
      <meshStandardMaterial color="#c4b49a" roughness={0.92} />
    </mesh>
  );
}

export function CountryRoads() {
  return (
    <group>
      {ROADS.flatMap((road) =>
        road.points.slice(1).flatMap(([bx, by], i) => {
          const [ax, ay] = road.points[i]!;
          return steps(ax, ay, bx, by).map(([x0, y0, x1, y1], k) => (
            <Strip key={`${road.id}-${i}-${k}`} ax={x0} ay={y0} bx={x1} by={y1} />
          ));
        }),
      )}
    </group>
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
    <group>
      <group position={[-0.05, 0.22, 0.28]}>
        <mesh castShadow>
          <boxGeometry args={[0.34, 0.22, 0.16]} />
          <meshStandardMaterial color="#8a7a68" />
        </mesh>
        <mesh position={[0, 0.08, 0.16]} castShadow>
          <boxGeometry args={[0.14, 0.12, 0.14]} />
          <meshStandardMaterial color="#9a8b78" />
        </mesh>
        <mesh position={[0.05, 0.18, 0.22]} rotation={[0.3, 0, 0.3]}>
          <boxGeometry args={[0.04, 0.12, 0.02]} />
          <meshStandardMaterial color="#6b5340" />
        </mesh>
        <mesh position={[-0.05, 0.18, 0.22]} rotation={[0.3, 0, -0.3]}>
          <boxGeometry args={[0.04, 0.12, 0.02]} />
          <meshStandardMaterial color="#6b5340" />
        </mesh>
      </group>
      <mesh position={[0, 0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.36, 6]} />
        <meshStandardMaterial color="#5b4230" />
      </mesh>
      <mesh position={[0, 0.28, -0.22]} castShadow>
        <boxGeometry args={[0.42, 0.14, 0.36]} />
        <meshStandardMaterial color="#a67c52" />
      </mesh>
      {[-0.2, 0.2].map((x) => (
        <mesh key={x} position={[x, 0.14, -0.22]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.1, 0.1, 0.04, 10]} />
          <meshStandardMaterial color="#3e2e20" />
        </mesh>
      ))}
      <group ref={crates} position={[0, 0.42, -0.22]}>
        <mesh position={[-0.08, 0, 0]} castShadow>
          <boxGeometry args={[0.16, 0.14, 0.16]} />
          <meshStandardMaterial color="#c4a574" />
        </mesh>
        <mesh position={[0.1, 0.02, 0]} castShadow>
          <boxGeometry args={[0.14, 0.16, 0.14]} />
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
      <GnomeRig hat={hat} scale={0.72} coat={coat} beard />
      <DonkeyCart crates={crates} />
      <Html position={[0, 1.35, 0]} center distanceFactor={20} style={{ pointerEvents: "none" }}>
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
