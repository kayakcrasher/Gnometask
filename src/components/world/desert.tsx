import { Html } from "@react-three/drei";
import { GnomeRig } from "./gnome-rig";
import { MOUNT_NOBLE, NOBLE_BASE, NOBLE_HEIGHT, NOBLE_RADIUS, SCALE, SUNSTEP, groundY, to3 } from "@/lib/game/world3";
import { useGame } from "@/lib/game/store";

const LOTS = [
  { x: 3180, y: 700 },
  { x: 3300, y: 740 },
  { x: 3220, y: 820 },
  { x: 3360, y: 840 },
  { x: 3120, y: 780 },
  { x: 3400, y: 700 },
];

const CACTI = [
  { x: 2900, y: 620 },
  { x: 3040, y: 860 },
  { x: 2860, y: 480 },
  { x: 3180, y: 980 },
  { x: 3000, y: 1040 },
];

export function sunstepSize(days: number, deeds: string[]) {
  const bought = deeds.filter((id) => id.startsWith("d-")).length;
  const count = Math.min(LOTS.length, 1 + Math.floor(Math.max(0, days) / 4) + Math.floor(bought / 2));
  const level = Math.min(3, 1 + Math.floor((Math.max(0, days) + bought * 2) / 8));
  return { count, level };
}

function Adobe({ level }: { level: number }) {
  const h = 0.45 + level * 0.28;
  const stone = level >= 3;
  return (
    <group>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7 + level * 0.08, h, 0.62]} />
        <meshStandardMaterial color={stone ? "#d9d3c6" : "#e2b56a"} />
      </mesh>
      <mesh position={[0, h + 0.12, 0]} castShadow>
        <boxGeometry args={[0.9 + level * 0.06, 0.12, 0.78]} />
        <meshStandardMaterial color={level >= 2 ? "#a8433b" : "#c4894a"} />
      </mesh>
      {level >= 3 ? (
        <mesh position={[0.22, h + 0.42, 0]} castShadow>
          <boxGeometry args={[0.22, 0.46, 0.22]} />
          <meshStandardMaterial color="#d9d3c6" />
        </mesh>
      ) : null}
    </group>
  );
}

export function MountNoble() {
  const radius = NOBLE_RADIUS * SCALE;
  const snow = NOBLE_HEIGHT * 0.16;
  const p = to3(MOUNT_NOBLE.x, MOUNT_NOBLE.y, 0);
  return (
    <group position={p}>
      <mesh position={[0, NOBLE_BASE + NOBLE_HEIGHT / 2, 0]} castShadow receiveShadow>
        <coneGeometry args={[radius, NOBLE_HEIGHT, 36]} />
        <meshStandardMaterial color="#8a7a68" roughness={0.95} />
      </mesh>
      <mesh position={[0, NOBLE_BASE + NOBLE_HEIGHT - snow / 2, 0]} castShadow>
        <coneGeometry args={[radius * (snow / NOBLE_HEIGHT), snow, 24]} />
        <meshStandardMaterial color="#f2efe6" roughness={0.82} />
      </mesh>
      <Html position={[0, NOBLE_BASE + NOBLE_HEIGHT + 0.4, 0]} center distanceFactor={28} style={{ pointerEvents: "none" }}>
        <p className="whitespace-nowrap rounded-full bg-ink/80 px-2 py-0.5 font-display text-[11px] font-semibold text-parchment">
          Mount Noble
        </p>
      </Html>
    </group>
  );
}

export function Sunstep() {
  const days = useGame((s) => s.daysPlayed);
  const deeds = useGame((s) => s.deeds);
  const { count, level } = sunstepSize(days, deeds);
  return (
    <group>
      {CACTI.map((c) => (
        <mesh key={`${c.x}-${c.y}`} position={to3(c.x, c.y, groundY(c.x, c.y) + 0.28)} castShadow>
          <capsuleGeometry args={[0.06, 0.4, 4, 6]} />
          <meshStandardMaterial color="#5f7d45" />
        </mesh>
      ))}
      {LOTS.slice(0, count).map((lot, i) => (
        <group key={`${lot.x}-${lot.y}`} position={to3(lot.x, lot.y, groundY(lot.x, lot.y))}>
          <Adobe level={level} />
          <group position={[0.55, 0, 0.2]}>
            <GnomeRig hat={i % 2 ? "hat-straw" : "hat-night"} scale={0.72} coat="#8a6238" beard={i % 2 === 0} />
          </group>
        </group>
      ))}
      <Html position={to3(SUNSTEP.x, SUNSTEP.y, groundY(SUNSTEP.x, SUNSTEP.y) + 1.8)} center distanceFactor={18} style={{ pointerEvents: "none" }}>
        <p className="whitespace-nowrap rounded-full bg-ink/80 px-2 py-0.5 font-display text-[11px] font-semibold text-parchment">
          Sunstep
        </p>
      </Html>
    </group>
  );
}
