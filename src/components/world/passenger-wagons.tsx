import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { DonkeyCart } from "./roads";
import { GnomeRig } from "./gnome-rig";
import { useGame } from "@/lib/game/store";
import { wagonPoint, type Wagon } from "@/lib/game/transport";
import { to3, groundY } from "@/lib/game/world3";
export function TravelCartAsset({
  covered = false,
  moving = false,
  rider = false,
}: {
  covered?: boolean;
  moving?: boolean;
  rider?: boolean;
}) {
  const crates = useRef<THREE.Group>(null),
    motion = useRef(moving);
  motion.current = moving;
  useFrame(() => {
    if (crates.current) crates.current.visible = false;
  });
  const canopy = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.46, 0);
    shape.lineTo(-0.46, 0.35);
    shape.quadraticCurveTo(-0.46, 0.85, 0, 0.85);
    shape.quadraticCurveTo(0.46, 0.85, 0.46, 0.35);
    shape.lineTo(0.46, 0);
    shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: 1.12,
      bevelEnabled: false,
    });
    g.translate(0, 0, -0.98);
    return g;
  }, []);
  return (
    <group scale={covered ? 1.45 : 1}>
      <DonkeyCart crates={crates} moving={motion} />
      {covered && (
        <>
          <mesh geometry={canopy} position={[0, 0.76, 0]} castShadow>
            <meshStandardMaterial color="#e8dfbf" side={THREE.DoubleSide} />
          </mesh>
          {[-0.92, -0.62, -0.32, -0.02].map((z) => (
            <mesh key={z} position={[0, 1.1, z]}>
              <torusGeometry args={[0.46, 0.022, 4, 16, Math.PI]} />
              <meshStandardMaterial color="#9d8660" />
            </mesh>
          ))}
          <mesh position={[0.47, 1, -0.45]}>
            <boxGeometry args={[0.025, 0.18, 0.5]} />
            <meshStandardMaterial color="#62887b" />
          </mesh>
          <group position={[0, 0.74, 0.1]}>
            <GnomeRig hat="hat-straw" coat="#738b7b" scale={0.55} />
          </group>
        </>
      )}
      {rider && (
        <group position={[0, 0.76, -0.4]}>
          <GnomeRig
            hat={useGame.getState().hat}
            coat="#9d7658"
            scale={covered ? 0.4 : 0.62}
          />
        </group>
      )}
    </group>
  );
}
function PassengerWagon({
  wagon,
  pos,
}: {
  wagon: Wagon;
  pos: { x: number; y: number };
}) {
  const group = useRef<THREE.Group>(null),
    s = useGame(),
    point = wagonPoint(wagon, s.roadWorks.completed),
    initial = useRef(true);
  const nearby = point && Math.hypot(point.x - pos.x, point.y - pos.y) < 150;
  useFrame((_, dt) => {
    if (!group.current || !point) return;
    const p = to3(point.x, point.y, groundY(point.x, point.y));
    if (initial.current) {
      group.current.position.set(...p);
      initial.current = false;
    } else
      group.current.position.lerp(
        new THREE.Vector3(...p),
        1 - Math.exp(-12 * Math.min(dt, 0.1)),
      );
    group.current.rotation.y =
      point.yaw + (wagon.direction === -1 ? Math.PI : 0);
  });
  if (!point) return null;
  const hail = () => {
    s.setGnomePos(pos.x, pos.y);
    s.hailWagon(wagon.id);
  };
  return (
    <group
      ref={group}
      onClick={(e) => {
        e.stopPropagation();
        hail();
      }}
    >
      <TravelCartAsset
        covered
        moving={wagon.dwell <= 0}
        rider={s.transport.ride === wagon.id}
      />
      {nearby && (
        <Html position={[0, 2.8, 0]} center zIndexRange={[8, 0]}>
          <button
            type="button"
            aria-label={`Hail passing ${wagon.id}`}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              hail();
            }}
            className="min-h-11 whitespace-nowrap rounded-xl bg-parchment px-3 text-xs font-bold text-pine"
          >
            {s.transport.ride === wagon.id
              ? "Your ride"
              : wagon.owned
                ? "Hail your wagon"
                : "Hail wagon · 6 coins"}
          </button>
        </Html>
      )}
    </group>
  );
}
export function PassengerWagons({ pos }: { pos: { x: number; y: number } }) {
  const wagons = useGame((s) => s.transport.wagons);
  return (
    <group>
      {wagons.map((w) => (
        <PassengerWagon key={w.id} wagon={w} pos={pos} />
      ))}
    </group>
  );
}
