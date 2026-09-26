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

function cobbleTexture(tint = "#c4b49a") {
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
  g.fillStyle = tint;
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

type TriFn = (
  buf: number[],
  uvs: number[],
  a: number[],
  b: number[],
  c: number[],
  ua: number[],
  ub: number[],
  uc: number[],
) => void;

const up = (a: number[], b: number[], c: number[]) => {
  const abx = b[0]! - a[0]!;
  const abz = b[2]! - a[2]!;
  const acx = c[0]! - a[0]!;
  const acz = c[2]! - a[2]!;
  return abz * acx - abx * acz;
};

const tri: TriFn = (buf, uvs, a, b, c, ua, ub, uc) => {
  const order =
    up(a, b, c) >= 0 ? [a, b, c, ua, ub, uc] : [a, c, b, ua, uc, ub];
  for (let i = 0; i < 3; i++) {
    buf.push(order[i]![0]!, order[i]![1]!, order[i]![2]!);
    uvs.push(order[i + 3]![0]!, order[i + 3]![1]!);
  }
};

/** One straight segment of road at a given width and height. */
function pushSegment(
  roadBuf: number[],
  roadUvs: number[],
  shoulderBuf: number[],
  shoulderUvs: number[],
  ax: number,
  ay: number,
  bx: number,
  by: number,
  roadWidth: number,
) {
  const a = to3(ax, ay, 0);
  const b = to3(bx, by, 0);
  const dx = b[0] - a[0];
  const dz = b[2] - a[2];
  const len = Math.hypot(dx, dz);
  if (len < 0.02) return;
  const ux = dx / len;
  const uz = dz / len;
  const px = -uz;
  const pz = ux;

  // Shoulder: wider, sits just below the road, darker, with a small drop.
  const sw = roadWidth + 0.55;
  const sTop = ROAD_TOP - 0.02;
  const sBot = ROAD_TOP - 0.14;
  const sp1 = [a[0] + px * (sw / 2), sTop, a[2] + pz * (sw / 2)];
  const sp2 = [a[0] - px * (sw / 2), sTop, a[2] - pz * (sw / 2)];
  const sp3 = [b[0] + px * (sw / 2), sTop, b[2] + pz * (sw / 2)];
  const sp4 = [b[0] - px * (sw / 2), sTop, b[2] - pz * (sw / 2)];
  const sb1 = [sp1[0]!, sBot, sp1[2]!];
  const sb2 = [sp2[0]!, sBot, sp2[2]!];
  const sb3 = [sp3[0]!, sBot, sp3[2]!];
  const sb4 = [sp4[0]!, sBot, sp4[2]!];
  const su1 = len / 1.6;
  const sv1 = sw / 1.6;
  tri(shoulderBuf, shoulderUvs, sp1, sp3, sp4, [0, 0], [su1, 0], [su1, sv1]);
  tri(shoulderBuf, shoulderUvs, sp1, sp4, sp2, [0, 0], [su1, sv1], [0, sv1]);
  tri(shoulderBuf, shoulderUvs, sp1, sb1, sb3, [0, 0], [0, 0.18], [su1, 0.18]);
  tri(shoulderBuf, shoulderUvs, sp1, sb3, sp3, [0, 0], [su1, 0.18], [su1, 0]);
  tri(shoulderBuf, shoulderUvs, sp2, sp4, sb4, [0, 0], [su1, 0], [su1, 0.18]);
  tri(shoulderBuf, shoulderUvs, sp2, sb4, sb2, [0, 0], [su1, 0.18], [0, 0.18]);

  // Road on top.
  const rTop = ROAD_TOP;
  const rp1 = [a[0] + px * (roadWidth / 2), rTop, a[2] + pz * (roadWidth / 2)];
  const rp2 = [a[0] - px * (roadWidth / 2), rTop, a[2] - pz * (roadWidth / 2)];
  const rp3 = [b[0] + px * (roadWidth / 2), rTop, b[2] + pz * (roadWidth / 2)];
  const rp4 = [b[0] - px * (roadWidth / 2), rTop, b[2] - pz * (roadWidth / 2)];
  const ru1 = len / 1.6;
  const rv1 = roadWidth / 1.6;
  tri(roadBuf, roadUvs, rp1, rp3, rp4, [0, 0], [ru1, 0], [ru1, rv1]);
  tri(roadBuf, roadUvs, rp1, rp4, rp2, [0, 0], [ru1, rv1], [0, rv1]);
}

/**
 * Corner patch: a small polygon disc at a waypoint that fills the wedge
 * left behind when two straight segments meet at an angle. Sized a bit
 * larger than the road so the seam is hidden.
 */
function pushFan(
  buf: number[],
  uvs: number[],
  cx: number,
  cy: number,
  radius: number,
  top: number,
  segs = 12,
) {
  const p = to3(cx, cy, 0);
  const center = [p[0], top, p[2]];
  const inner: number[][] = [];
  const innerUvs: number[][] = [];
  for (let i = 0; i <= segs; i++) {
    const a = (i / segs) * Math.PI * 2;
    inner.push([p[0] + Math.cos(a) * radius, top, p[2] + Math.sin(a) * radius]);
    innerUvs.push([(1 + Math.cos(a)) * radius / 1.6, (1 + Math.sin(a)) * radius / 1.6]);
  }
  for (let i = 0; i < segs; i++) {
    tri(
      buf,
      uvs,
      center,
      inner[i]!,
      inner[i + 1]!,
      [radius / 1.6, radius / 1.6],
      innerUvs[i]!,
      innerUvs[i + 1]!,
    );
  }
}

function makeGeometries() {
  const roadBuf: number[] = [];
  const roadUvs: number[] = [];
  const shoulderBuf: number[] = [];
  const shoulderUvs: number[] = [];

  const addLine = (points: [number, number][], width: number) => {
    for (let i = 1; i < points.length; i++) {
      const [ax, ay] = points[i - 1]!;
      const [bx, by] = points[i]!;
      pushSegment(roadBuf, roadUvs, shoulderBuf, shoulderUvs, ax, ay, bx, by, width);
    }
    // Corner fans at every interior waypoint, both layers.
    for (let i = 1; i < points.length - 1; i++) {
      const [cx, cy] = points[i]!;
      pushFan(roadBuf, roadUvs, cx, cy, width / 2 + 0.08, ROAD_TOP);
      pushFan(
        shoulderBuf,
        shoulderUvs,
        cx,
        cy,
        (width + 0.55) / 2 + 0.08,
        ROAD_TOP - 0.02,
      );
    }
  };

  for (const road of ROADS) addLine(road.points, COUNTRY_WIDTH);

  for (const town of TOWN_GRIDS) {
    for (const seg of townStreets(town)) {
      addLine(
        [
          [seg.ax, seg.ay],
          [seg.bx, seg.by],
        ],
        seg.width ?? 1.8,
      );
    }
  }

  for (const seg of capitolStreets()) {
    addLine(
      [
        [seg.ax, seg.ay],
        [seg.bx, seg.by],
      ],
      seg.width ?? 2.4,
    );
  }

  const mk = (positions: number[], uvs: number[]) => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geo.computeVertexNormals();
    return geo;
  };

  return {
    road: mk(roadBuf, roadUvs),
    shoulder: mk(shoulderBuf, shoulderUvs),
  };
}

function ignoreRaycast() {}

export function CountryRoads() {
  const geos = useMemo(() => makeGeometries(), []);
  const roadMap = useMemo(() => cobbleTexture("#c4b49a"), []);
  const shoulderMap = useMemo(() => cobbleTexture("#8f8170"), []);
  return (
    <group>
      <mesh
        geometry={geos.shoulder}
        receiveShadow
        renderOrder={1}
        raycast={ignoreRaycast}
      >
        <meshStandardMaterial
          map={shoulderMap ?? undefined}
          color={shoulderMap ? "#b7a690" : "#8f8170"}
          roughness={0.98}
          side={THREE.DoubleSide}
          polygonOffset
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-1}
        />
      </mesh>
      <mesh
        geometry={geos.road}
        receiveShadow
        renderOrder={2}
        raycast={ignoreRaycast}
      >
        <meshStandardMaterial
          map={roadMap ?? undefined}
          color={roadMap ? "#ffffff" : "#d7c7a4"}
          roughness={0.9}
          side={THREE.DoubleSide}
          polygonOffset
          polygonOffsetFactor={-3}
          polygonOffsetUnits={-3}
        />
      </mesh>
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
