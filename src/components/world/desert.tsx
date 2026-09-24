import { Html } from "@react-three/drei";
import { GnomeRig } from "./gnome-rig";
import { cellsOf, filledCount, townGate, townGrid } from "@/lib/game/data/grids";
import { CASINO_STAGE, prosperity } from "@/lib/game/data/market";
import { MOUNT_NOBLE, NOBLE_BASE, NOBLE_HEIGHT, NOBLE_PLATEAU, NOBLE_RADIUS, SCALE, groundY, onIsland, to2, to3 } from "@/lib/game/world3";
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

function Casino({ name, accent, stage }: { name: string; accent: string; stage: number }) {
  const floors = [1, 2, 3, 4, 6][stage] ?? 1;
  const h = 0.72 * floors;
  const w = 1.15 + stage * 0.16;
  const glass = stage >= 3;
  const body = stage === 0 ? "#c4894a" : glass ? "#1a2433" : "#241820";
  return (
    <group>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, w * 0.78]} />
        <meshStandardMaterial color={body} metalness={glass ? 0.62 : 0.2} roughness={glass ? 0.22 : 0.7} />
      </mesh>
      <mesh position={[0, h * 0.62, w * 0.4]}>
        <boxGeometry args={[w * 0.55, Math.max(0.28, h * 0.28), 0.04]} />
        <meshStandardMaterial color="#b9e6ff" emissive="#8fd4ff" emissiveIntensity={stage >= 2 ? 0.45 : 0.15} />
      </mesh>
      <mesh position={[0, 0.22, w * 0.4]}>
        <boxGeometry args={[0.28, 0.4, 0.04]} />
        <meshStandardMaterial color="#5b4230" />
      </mesh>
      <mesh position={[w * 0.28, h - 0.22, w * 0.4]}>
        <boxGeometry args={[0.22, 0.16, 0.04]} />
        <meshStandardMaterial color="#f2d7a2" emissive="#e2b84a" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0, h + 0.16, 0]} castShadow>
        <boxGeometry args={[w + 0.2, 0.22, 0.24]} />
        <meshStandardMaterial color="#1a1218" />
      </mesh>
      <mesh position={[0, h + 0.16, 0.13]}>
        <boxGeometry args={[w * 0.8, 0.08, 0.04]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.7 + stage * 0.2} />
      </mesh>
      {stage >= 2 ? (
        <mesh position={[0, 0.9, w * 0.55]} castShadow>
          <boxGeometry args={[w * 0.7, 0.08, 0.45]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.5} />
        </mesh>
      ) : null}
      {stage >= 3 ? (
        <mesh position={[0, 0.08, w * 0.85]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.38, 16]} />
          <meshStandardMaterial color="#7eb0c8" emissive="#3de2ff" emissiveIntensity={0.35} />
        </mesh>
      ) : null}
      {stage >= 4 ? (
        <mesh position={[0, h + 0.7, 0]} castShadow>
          <boxGeometry args={[0.28, 0.9, 0.28]} />
          <meshStandardMaterial color="#10141c" metalness={0.7} roughness={0.2} />
        </mesh>
      ) : null}
      <Html position={[0, h + (stage >= 4 ? 1.3 : 0.55), 0]} center distanceFactor={14} style={{ pointerEvents: "none" }}>
        <p className="whitespace-nowrap rounded-full px-2 py-0.5 font-display text-[10px] font-semibold" style={{ background: "#140e18", color: accent }}>
          {name}
        </p>
      </Html>
    </group>
  );
}

export function MountNoble({ onWalk }: { onWalk: (x: number, y: number) => void }) {
  const radius = NOBLE_RADIUS * SCALE;
  const cut = NOBLE_PLATEAU / NOBLE_RADIUS;
  const rise = NOBLE_HEIGHT * (1 - cut);
  const top = radius * cut;
  const p = to3(MOUNT_NOBLE.x, MOUNT_NOBLE.y, 0);
  const climb = (e: { stopPropagation: () => void; point: { x: number; z: number } }) => {
    e.stopPropagation();
    const hit = to2(e.point.x, e.point.z);
    const d = Math.hypot(hit.x - MOUNT_NOBLE.x, hit.y - MOUNT_NOBLE.y);
    if (d <= NOBLE_PLATEAU + 12) onWalk(MOUNT_NOBLE.x, MOUNT_NOBLE.y);
    else if (onIsland(hit.x, hit.y)) onWalk(hit.x, hit.y);
  };
  return (
    <group position={p}>
      <mesh position={[0, NOBLE_BASE + rise / 2, 0]} castShadow receiveShadow onClick={climb}>
        <cylinderGeometry args={[top, radius, rise, 48]} />
        <meshStandardMaterial attach="material-0" color="#8a7a68" roughness={0.95} />
        <meshStandardMaterial attach="material-1" color="#f7f4ee" roughness={0.88} />
        <meshStandardMaterial attach="material-2" color="#6e6256" roughness={0.95} />
      </mesh>
      <mesh position={[0, NOBLE_BASE + rise + 0.35, 0]} onClick={climb}>
        <cylinderGeometry args={[0.06, 0.08, 0.7, 8]} />
        <meshStandardMaterial color="#5b4230" />
      </mesh>
      <mesh position={[0.16, NOBLE_BASE + rise + 0.58, 0]} onClick={climb}>
        <boxGeometry args={[0.28, 0.16, 0.02]} />
        <meshStandardMaterial color="#a33b32" />
      </mesh>
      <Html position={[0, NOBLE_BASE + rise + 0.9, 0]} center distanceFactor={28} style={{ pointerEvents: "none" }}>
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
  const coins = useGame((s) => s.coins);
  const enter = useGame((s) => s.enterInterior);
  const { count } = sunstepSize(days, deeds);
  const stage = prosperity(coins, days);
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
              enter("casino");
            }}
          >
            <Casino name={house.name} accent={house.accent} stage={stage} />
            <group position={[0.85, 0, 0.35]}>
              <GnomeRig hat={i % 2 ? "hat-straw" : "hat-night"} scale={1.15} coat="#8a6238" beard={i % 2 === 0} />
            </group>
          </group>
        );
      })}
      <Html position={to3(LOTS[0]!.x, LOTS[0]!.y, groundY(LOTS[0]!.x, LOTS[0]!.y) + 3.2)} center distanceFactor={18} style={{ pointerEvents: "none" }}>
        <p className="whitespace-nowrap rounded-full bg-ink/80 px-2 py-0.5 font-display text-[11px] font-semibold text-parchment">
          Sunstep · {CASINO_STAGE[stage]}
        </p>
      </Html>
    </group>
  );
}
