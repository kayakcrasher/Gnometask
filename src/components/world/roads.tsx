import { developedRoads } from "@/lib/game/land-planning";
import type { RoadWorks, EstateHome } from "@/lib/game/data/expansion";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { GnomeRig } from "./gnome-rig";
import { RUNNERS, ROAD_TOP, pathToCapitol } from "@/lib/game/data/country";
import type { RoadSurface } from "@/lib/game/data/road-layout";
import { groundY, to3 } from "@/lib/game/world3";
import { useGame } from "@/lib/game/store";
import { roadGeometry, type RoadLine } from "./road-surface";

const SURFACES: RoadSurface[] = ["dirt", "gravel", "cobble"];

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
  g.fillStyle = "#8c8170";
  g.fillRect(0, 0, 512, 512);
  const tones = ["#c3b69f", "#b9ac96", "#cfc2ac", "#b0a38e", "#c7baa4"];
  // Staggered, gently irregular setts. Draw across the tile boundary to make it seamless.
  const rows = 16;
  const columns = 12;
  const cellW = 512 / columns;
  const cellH = 512 / rows;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const x = col * cellW + (row % 2) * cellW / 2;
      const y = row * cellH;
      const inset = 0.8 + rnd() * 0.8;
      const cut = 4 + rnd() * 3;
      g.fillStyle = tones[Math.floor(rnd() * tones.length)]!;
      for (const offset of [-512, 0]) {
        const left = x + inset + offset;
        const right = x + cellW - inset + offset;
        const top = y + inset;
        const bottom = y + cellH - inset;
        g.beginPath();
        g.moveTo(left + cut, top);
        g.lineTo(right - cut, top);
        g.lineTo(right, top + cut);
        g.lineTo(right, bottom - cut);
        g.lineTo(right - cut, bottom);
        g.lineTo(left + cut, bottom);
        g.lineTo(left, bottom - cut);
        g.lineTo(left, top + cut);
        g.closePath();
        g.fill();
      }
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function earthTexture(surface: "gravel" | "dirt") {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  let seed = 73;
  const random = () => ((seed = seed * 16807 % 2147483647) - 1) / 2147483646;
  ctx.fillStyle = surface === "gravel" ? "#b3a58c" : "#ab8b61";
  ctx.fillRect(0, 0, 256, 256);
  const tones = surface === "gravel" ? ["#cfc4ab", "#918674", "#bfb39b", "#a69a83"] : ["#b79970", "#a0845e", "#c0a17a", "#967b57"];
  for (let i = 0; i < 6500; i++) {
    ctx.fillStyle = tones[Math.floor(random() * tones.length)]!;
    const size = surface === "gravel" ? 1 + random() * 3 : 1 + random();
    ctx.fillRect(random() * 256, random() * 256, size, size * 0.7);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function makeGeometries(works:RoadWorks,estate:Record<string,EstateHome>) {
  const lines = developedRoads(works,estate).map(route => ({
    ...route,
    points: route.points.map(([x, y]): [number, number] => {
      const p = to3(x, y);
      return [p[0], p[2]];
    }),
  }));
  return {
    // A single shoulder surrounds the entire network. Higher priority surfaces
    // cut out lower ones, so a gravel-to-cobble junction has no stacked faces.
    shoulder: roadGeometry(lines, ROAD_TOP - 0.025, true),
    surfaces: SURFACES.map((surface, index) => ({
      surface,
      geometry: roadGeometry(lines.filter(l => l.surface === surface), ROAD_TOP, false,
        lines.filter(l => SURFACES.indexOf(l.surface) > index)),
    })),
  };
}

function ignoreRaycast() {}

export function CountryRoads() {
  const works=useGame(s=>s.roadWorks),estate=useGame(s=>s.estate);
  const geos = useMemo(() => makeGeometries(works,estate), [works,estate]);
  const textures = useMemo(() => ({ cobble: cobbleTexture(), gravel: earthTexture("gravel"), dirt: earthTexture("dirt") }), []);
  useEffect(() => () => {
    geos.surfaces.forEach(s => s.geometry.dispose());
    geos.shoulder.dispose();
    Object.values(textures).forEach(texture => texture?.dispose());
  }, [geos, textures]);
  return (
    <group>
      <mesh geometry={geos.shoulder} receiveShadow renderOrder={1} raycast={ignoreRaycast}>
        <meshStandardMaterial color="#827b56" roughness={1} polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-1} />
      </mesh>
      {geos.surfaces.map(({surface, geometry}) => <mesh key={surface} geometry={geometry} receiveShadow renderOrder={2} raycast={ignoreRaycast}>
        <meshStandardMaterial map={textures[surface] ?? undefined}
          color={textures[surface] ? "#ffffff" : surface === "cobble" ? "#c8bda7" : surface === "gravel" ? "#b3a58c" : "#ab8b61"}
          roughness={0.96} polygonOffset polygonOffsetFactor={-3} polygonOffsetUnits={-3} />
      </mesh>)}
    </group>
  );
}

function lengthOf(pts: [number, number][]) {
  let n = 0;
  for (let i = 1; i < pts.length; i++)
    n += Math.hypot(pts[i]![0] - pts[i - 1]![0], pts[i]![1] - pts[i - 1]![1]);
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
      return {
        x: a[0] + (b[0] - a[0]) * t,
        y: a[1] + (b[1] - a[1]) * t,
        nx: b[0] - a[0],
        ny: b[1] - a[1],
      };
    }
    left -= seg;
  }
  const last = pts[pts.length - 1]!;
  const prev = pts[pts.length - 2] ?? last;
  return { x: last[0], y: last[1], nx: last[0] - prev[0], ny: last[1] - prev[1] };
}

function DonkeyCart({ crates }: { crates: { current: THREE.Group | null } }) {
  const legs = useRef<THREE.Group>(null);
  const wheels = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 7;
    const swing = Math.sin(t) * 0.6;
    legs.current?.children.forEach((leg, i) => {
      leg.rotation.x = swing * (i % 2 === 0 ? 1 : -1);
    });
    const spin = clock.elapsedTime * 5;
    wheels.current?.children.forEach((wheel) => {
      wheel.rotation.x = spin;
    });
  });
  return (
    <group>
      <group position={[0, 0, 1.05]}>
        <mesh position={[0, 0.52, 0]} castShadow>
          <boxGeometry args={[0.38, 0.32, 0.78]} />
          <meshStandardMaterial color="#8d6a45" roughness={0.82} />
        </mesh>
        <mesh position={[0, 0.62, 0.22]}>
          <boxGeometry args={[0.4, 0.08, 0.2]} />
          <meshStandardMaterial color="#6b5340" />
        </mesh>
        <mesh position={[0, 0.78, 0.42]} castShadow>
          <boxGeometry args={[0.24, 0.22, 0.28]} />
          <meshStandardMaterial color="#a68462" />
        </mesh>
        <mesh position={[0, 0.74, 0.56]}>
          <boxGeometry args={[0.1, 0.06, 0.08]} />
          <meshStandardMaterial color="#d9c4a8" />
        </mesh>
        <mesh position={[0.09, 0.96, 0.4]} rotation={[0.2, 0, 0.4]}>
          <boxGeometry args={[0.06, 0.18, 0.03]} />
          <meshStandardMaterial color="#5b4230" />
        </mesh>
        <mesh position={[-0.09, 0.96, 0.4]} rotation={[0.2, 0, -0.4]}>
          <boxGeometry args={[0.06, 0.18, 0.03]} />
          <meshStandardMaterial color="#5b4230" />
        </mesh>
        <mesh position={[0, 0.48, -0.42]} rotation={[0.8, 0, 0]}>
          <boxGeometry args={[0.06, 0.06, 0.22]} />
          <meshStandardMaterial color="#6b5340" />
        </mesh>
        <group ref={legs}>
          {[
            [-0.14, 0.16],
            [0.14, 0.16],
            [-0.14, -0.18],
            [0.14, -0.18],
          ].map(([x, z], i) => (
            <group key={i} position={[x, 0.4, z]}>
              <mesh position={[0, -0.16, 0]} castShadow>
                <boxGeometry args={[0.08, 0.32, 0.08]} />
                <meshStandardMaterial color="#4a3424" />
              </mesh>
            </group>
          ))}
        </group>
      </group>
      {[-0.1, 0.1].map((x) => (
        <mesh key={x} position={[x, 0.48, 0.35]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.85, 6]} />
          <meshStandardMaterial color="#5b4230" />
        </mesh>
      ))}
      <mesh position={[0, 0.5, -0.45]} castShadow>
        <boxGeometry args={[0.78, 0.36, 1.05]} />
        <meshStandardMaterial color="#c4894a" roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.72, -0.45]}>
        <boxGeometry args={[0.84, 0.08, 1.12]} />
        <meshStandardMaterial color="#8a5a32" />
      </mesh>
      <mesh position={[0, 0.78, -0.82]} castShadow>
        <boxGeometry args={[0.7, 0.16, 0.22]} />
        <meshStandardMaterial color="#6b4428" />
      </mesh>
      <group ref={wheels}>
        {[
          [-0.42, -0.15],
          [0.42, -0.15],
          [-0.42, -0.75],
          [0.42, -0.75],
        ].map(([x, z], i) => (
          <group key={i} position={[x, 0.24, z]}>
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.24, 0.24, 0.08, 14]} />
              <meshStandardMaterial color="#3e2e20" />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.08, 0.08, 0.1, 8]} />
              <meshStandardMaterial color="#d6c4a4" />
            </mesh>
          </group>
        ))}
      </group>
      <group ref={crates} position={[0, 0.86, -0.35]}>
        <mesh position={[-0.14, 0, 0.08]} castShadow>
          <boxGeometry args={[0.28, 0.24, 0.28]} />
          <meshStandardMaterial color="#c4a574" />
        </mesh>
        <mesh position={[0.16, 0.02, -0.1]} castShadow>
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
      <DonkeyCart crates={crates} />
      <group position={[0, 0.32, -0.72]}>
        <GnomeRig hat={hat} scale={1.15} coat={coat} beard />
      </group>
      <Html
        position={[0, 1.85, -0.72]}
        center
        distanceFactor={20}
        style={{ pointerEvents: "none" }}
      >
        <p className="whitespace-nowrap rounded-full bg-ink/75 px-2 py-0.5 text-[10px] font-semibold text-parchment">
          {name}
        </p>
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
