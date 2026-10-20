import { useMemo, useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import {
  FRONTIER_LAKES,
  FRONTIER_SIGHTS,
  FRONTIER_SETTLEMENTS,
  frontierRise,
  inlandWater,
} from "@/lib/game/data/frontier";
import { onGrass, onIsland, groundY, to3, to2 } from "@/lib/game/world3";
import { ROAD_NETWORK } from "@/lib/game/data/country";
import { nearRoad } from "@/lib/game/data/road-layout";
import { useGame } from "@/lib/game/store";
function terrainGeometry() {
  const positions: number[] = [],
    colors: number[] = [],
    color = new THREE.Color();
  const add = (p: [number, number]) => {
    const h = groundY(...p);
    positions.push(...to3(...p, h + 0.015));
    color.set(
      h > 14 ? "#e5e4ce" : h > 7 ? "#8b8f7c" : h > 2 ? "#819476" : "#78976c",
    );
    colors.push(color.r, color.g, color.b);
  };
  for (let x = -1250; x < 4400; x += 50)
    for (let y = -4650; y < -700; y += 50) {
      for (const tri of [
        [
          [x, y],
          [x + 50, y + 50],
          [x + 50, y],
        ],
        [
          [x, y],
          [x, y + 50],
          [x + 50, y + 50],
        ],
      ] as [number, number][][]) {
        if (
          tri.every((p) => onGrass(...p)) &&
          !inlandWater(
            tri.reduce((s, p) => s + p[0], 0) / 3,
            tri.reduce((s, p) => s + p[1], 0) / 3,
          )
        )
          tri.forEach(add);
      }
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  g.computeVertexNormals();
  return g;
}
type Tree = { x: number; y: number; size: number };
const TREES: Tree[] = [];
for (let x = -1000; x < 4200; x += 90)
  for (let y = -4350; y < -850; y += 90) {
    const seed = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453,
      f = seed - Math.floor(seed);
    if (f < 0.3) continue;
    const px = x + f * 65,
      py = y + Math.sin(seed) * 32;
    if (
      !onGrass(px, py) ||
      inlandWater(px, py, 40) ||
      frontierRise(px, py) > 4 ||
      FRONTIER_SETTLEMENTS.some((d) => Math.hypot(px - d.x, py - d.y) < 125) ||
      FRONTIER_SIGHTS.some((d) => Math.hypot(px - d.x, py - d.y) < 85) ||
      ROAD_NETWORK.some((r) => nearRoad(px, py, r, 24))
    )
      continue;
    TREES.push({ x: px, y: py, size: 0.65 + f * 0.6 });
  }
function Grove({ trees }: { trees: Tree[] }) {
  const trunks = useRef<THREE.InstancedMesh>(null),
    crowns = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const o = new THREE.Object3D();
    trees.forEach((t, i) => {
      const p = to3(t.x, t.y, groundY(t.x, t.y));
      o.position.set(p[0], p[1] + 0.7 * t.size, p[2]);
      o.scale.set(0.16 * t.size, 1.4 * t.size, 0.16 * t.size);
      o.updateMatrix();
      trunks.current!.setMatrixAt(i, o.matrix);
      o.position.y = p[1] + 2.1 * t.size;
      o.scale.set(1.15 * t.size, 2.9 * t.size, 1.15 * t.size);
      o.updateMatrix();
      crowns.current!.setMatrixAt(i, o.matrix);
    });
    for (const ref of [trunks, crowns]) {
      ref.current!.instanceMatrix.needsUpdate = true;
      ref.current!.computeBoundingSphere();
    }
  }, [trees]);
  return (
    <group>
      <instancedMesh ref={trunks} args={[undefined, undefined, trees.length]}>
        <cylinderGeometry args={[1, 1, 1, 5]} />
        <meshStandardMaterial color="#806349" />
      </instancedMesh>
      <instancedMesh ref={crowns} args={[undefined, undefined, trees.length]}>
        <coneGeometry args={[1, 1, 7]} />
        <meshStandardMaterial color="#486c53" roughness={1} />
      </instancedMesh>
    </group>
  );
}
const GROVES = [
  ...new Set(
    TREES.map((t) => `${Math.floor(t.x / 600)},${Math.floor(t.y / 600)}`),
  ),
].map((key) => ({
  key,
  trees: TREES.filter(
    (t) => `${Math.floor(t.x / 600)},${Math.floor(t.y / 600)}` === key,
  ),
}));
export function FrontierLandscape({
  onWalk,
  pos,
}: {
  onWalk: (x: number, y: number) => void;
  pos: { x: number; y: number };
}) {
  const geometry = useMemo(terrainGeometry, []),
    x = pos.x,
    y = pos.y,
    open = useGame((s) => s.openPopup),
    buildings = useGame((s) => s.city.buildings),
    estate = useGame((s) => s.estate),
    plots = useGame((s) => s.civic.plots);
  const groves = useMemo(() => {
    const occupied = [
      ...buildings,
      ...Object.values(estate),
      ...plots.filter((p) => p.stories > 0),
    ];
    return GROVES.map((g) => ({
      ...g,
      trees: g.trees.filter(
        (t) => !occupied.some((b) => Math.hypot(t.x - b.x, t.y - b.y) < 65),
      ),
    })).filter((g) => g.trees.length > 0);
  }, [buildings, estate, plots]);
  return (
    <group>
      <mesh
        geometry={geometry}
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          const p = to2(e.point.x, e.point.z);
          if (onIsland(p.x, p.y)) onWalk(p.x, p.y);
        }}
      >
        <meshStandardMaterial vertexColors roughness={1} />
      </mesh>
      {FRONTIER_LAKES.map((l) => (
        <group key={l.id} position={to3(l.x, l.y, 0.31)}>
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            scale={[l.rx * 0.05, l.ry * 0.05, 1]}
            onClick={(e) => e.stopPropagation()}
          >
            <circleGeometry args={[1, 48]} />
            <meshStandardMaterial
              color="#7bacac"
              roughness={0.3}
              metalness={0.1}
            />
          </mesh>
        </group>
      ))}
      {groves
        .filter((g) => g.trees.some((t) => Math.hypot(t.x - x, t.y - y) < 1550))
        .map((g) => (
          <Grove key={g.key} trees={g.trees} />
        ))}
      {[...FRONTIER_SIGHTS, ...FRONTIER_SETTLEMENTS]
        .filter((s) => Math.hypot(s.x - x, s.y - y) < 500)
        .map((s) => (
          <group
            key={s.id}
            position={to3(s.x, s.y, groundY(s.x, s.y))}
            onClick={(e) => {
              e.stopPropagation();
              open({
                kind: "place",
                hotspotId: `frontier-${s.id}`,
                title: s.name,
                blurb: s.description,
                x: s.x,
                y: s.y,
              });
            }}
          >
            <mesh position={[0, 0.65, 0]}>
              <boxGeometry args={[0.12, 1.3, 0.12]} />
              <meshStandardMaterial color="#8d7050" />
            </mesh>
            <mesh position={[0, 1.25, 0]}>
              <boxGeometry args={[1.1, 0.42, 0.12]} />
              <meshStandardMaterial color="#d9c595" />
            </mesh>
            <Html position={[0, 2.2, 0]} center zIndexRange={[5, 0]}>
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  open({
                    kind: "place",
                    hotspotId: `frontier-${s.id}`,
                    title: s.name,
                    blurb: s.description,
                    x: s.x,
                    y: s.y,
                  });
                }}
                className="min-h-11 whitespace-nowrap rounded-xl bg-parchment/95 px-3 text-xs font-bold text-pine"
              >
                {s.name}
              </button>
            </Html>
          </group>
        ))}
    </group>
  );
}
