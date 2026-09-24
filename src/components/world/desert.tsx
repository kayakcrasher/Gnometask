import { Html } from "@react-three/drei";
import { GnomeRig } from "./gnome-rig";
import { cellsOf, filledCount, townGate, townGrid } from "@/lib/game/data/grids";
import { MOUNT_NOBLE, NOBLE_BASE, NOBLE_HEIGHT, NOBLE_RADIUS, SCALE, groundY, to3 } from "@/lib/game/world3";
import { useGame } from "@/lib/game/store";

const LOTS = cellsOf(townGrid("sunstep"));

const CACTI = [
  { x: 2900, y: 620 },
  { x: 3040, y: 860 },
  { x: 2860, y: 480 },
  { x: 3180, y: 980 },
  { x: 3000, y: 1040 },
];

export function sunstepSize(days: number, deeds: string[]) {
  const bought = deeds.filter((id) => id.startsWith("d-")).length;
  const count = Math.min(LOTS.length, filledCount("sunstep", days) + Math.floor(bought / 2));
  const level = Math.min(3, 1 + Math.floor((Math.max(0, days) + bought * 2) / 8));
  return { count, level };
}

const HOUSES = [
  { name: "The Dune", accent: "#ff4fa3" },
  { name: "Gilt", accent: "#f2c14e" },
  { name: "Nightjar", accent: "#3de2ff" },
  { name: "Oasis", accent: "#7cffb2" },
  { name: "Lucky Pit", accent: "#ff4fa3" },
  { name: "Mirage", accent: "#c084fc" },
];

function Casino({ name, accent, tall }: { name: string; accent: string; tall: boolean }) {
  const h = tall ? 2.7 : 1.85;
  return (
    <group>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.35, h, 1.05]} />
        <meshStandardMaterial color="#161c28" metalness={0.55} roughness={0.28} />
      </mesh>
      <mesh position={[0, h * 0.55, 0.54]}>
        <boxGeometry args={[0.7, h * 0.45, 0.04]} />
        <meshStandardMaterial color="#9fd8ff" emissive="#7ec8ff" emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[1.42, 0.06, 1.12]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.1} />
      </mesh>
      <mesh position={[0, h + 0.22, 0]} castShadow>
        <boxGeometry args={[1.5, 0.28, 0.28]} />
        <meshStandardMaterial color="#241c28" />
      </mesh>
      <mesh position={[0, h + 0.22, 0.15]}>
        <boxGeometry args={[1.2, 0.1, 0.04]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.4} />
      </mesh>
      {[-0.42, -0.14, 0.14, 0.42].map((x) => (
        <mesh key={x} position={[x, h + 0.46, 0.12]}>
          <sphereGeometry args={[0.055, 8, 8]} />
          <meshStandardMaterial color="#fff6d0" emissive="#ffe08a" emissiveIntensity={1.2} />
        </mesh>
      ))}
      {tall ? (
        <mesh position={[0.34, h + 0.85, 0]} castShadow>
          <boxGeometry args={[0.28, 1.15, 0.28]} />
          <meshStandardMaterial color="#10141c" metalness={0.6} roughness={0.25} />
        </mesh>
      ) : null}
      <Html position={[0, h + 0.7, 0.2]} center distanceFactor={14} style={{ pointerEvents: "none" }}>
        <p className="whitespace-nowrap rounded-full px-2 py-0.5 font-display text-[10px] font-semibold" style={{ background: "#140e18", color: accent }}>
          {name}
        </p>
      </Html>
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
  const wager = useGame((s) => s.wager);
  const { count } = sunstepSize(days, deeds);
  const gate = townGate("sunstep");
  return (
    <group>
      {CACTI.map((c) => (
        <mesh key={`${c.x}-${c.y}`} position={to3(c.x, c.y, groundY(c.x, c.y) + 0.28)} castShadow>
          <capsuleGeometry args={[0.06, 0.4, 4, 6]} />
          <meshStandardMaterial color="#5f7d45" />
        </mesh>
      ))}
      <group position={to3(gate.x, gate.y, groundY(gate.x, gate.y))}>
        {[-0.7, 0.7].map((x) => (
          <mesh key={x} position={[x, 0.7, 0]} castShadow>
            <boxGeometry args={[0.12, 1.4, 0.12]} />
            <meshStandardMaterial color="#141820" />
          </mesh>
        ))}
        <mesh position={[0, 1.4, 0]}>
          <boxGeometry args={[1.6, 0.1, 0.12]} />
          <meshStandardMaterial color="#ff4fa3" emissive="#ff4fa3" emissiveIntensity={1.3} />
        </mesh>
      </group>
      {LOTS.slice(0, count).map((lot, i) => {
        const house = HOUSES[i % HOUSES.length]!;
        return (
          <group
            key={`${lot.x}-${lot.y}`}
            position={to3(lot.x, lot.y, groundY(lot.x, lot.y))}
            onClick={(e) => {
              e.stopPropagation();
              wager();
            }}
          >
            <Casino name={house.name} accent={house.accent} tall={i % 3 === 0} />
            <group position={[0.85, 0, 0.35]}>
              <GnomeRig hat={i % 2 ? "hat-straw" : "hat-night"} scale={0.72} coat="#8a6238" beard={i % 2 === 0} />
            </group>
          </group>
        );
      })}
      <Html position={to3(LOTS[0]!.x, LOTS[0]!.y, groundY(LOTS[0]!.x, LOTS[0]!.y) + 3.2)} center distanceFactor={18} style={{ pointerEvents: "none" }}>
        <p className="whitespace-nowrap rounded-full bg-ink/80 px-2 py-0.5 font-display text-[11px] font-semibold text-parchment">
          Sunstep
        </p>
      </Html>
    </group>
  );
}
