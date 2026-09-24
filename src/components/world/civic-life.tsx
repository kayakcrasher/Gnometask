import { Html } from "@react-three/drei";
import { COURTS, SUNSTEP_DOCK, TOWN_LABEL, civicBlurb } from "@/lib/game/data/civic";
import type { CivicPlot, CivicTown } from "@/lib/game/data/civic";
import { useGame } from "@/lib/game/store";
import { groundY, to3 } from "@/lib/game/world3";
import { GnomeRig } from "./gnome-rig";

function House({ plot }: { plot: CivicPlot }) {
  const h = 0.48 + plot.stories * 0.42;
  return (
    <group>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.95, h, 0.78]} />
        <meshStandardMaterial color={plot.rental ? "#e7d7b0" : "#efe6d4"} />
      </mesh>
      <mesh position={[0, h + 0.08, 0]} castShadow>
        <boxGeometry args={[1.1, 0.12, 0.92]} />
        <meshStandardMaterial color={plot.rental ? "#c9a227" : "#a35a42"} />
      </mesh>
      {Array.from({ length: plot.stories }, (_, i) => (
        <mesh key={i} position={[0.2, 0.35 + i * 0.42, 0.4]}>
          <boxGeometry args={[0.16, 0.16, 0.02]} />
          <meshStandardMaterial color="#9ec7e6" />
        </mesh>
      ))}
      {plot.rental ? (
        <Html position={[0, h + 0.35, 0]} center distanceFactor={16} style={{ pointerEvents: "none" }}>
          <span className="rounded-full bg-gold px-1.5 py-0.5 text-[9px] font-bold text-ink">Let</span>
        </Html>
      ) : null}
      {plot.trim?.includes("shutters") || plot.trim?.includes("boxes") ? (
        <mesh position={[0.28, 0.45, 0.4]}>
          <boxGeometry args={[0.16, 0.12, 0.03]} />
          <meshStandardMaterial color={plot.trim.includes("boxes") ? "#6b8f4e" : "#35543f"} />
        </mesh>
      ) : null}
      {plot.trim?.includes("awning") ? (
        <mesh position={[0, h * 0.72, 0.48]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.7, 0.03, 0.28]} />
          <meshStandardMaterial color="#a33b32" />
        </mesh>
      ) : null}
      {plot.trim?.includes("bench") ? (
        <mesh position={[0.55, 0.16, 0.35]}>
          <boxGeometry args={[0.28, 0.05, 0.1]} />
          <meshStandardMaterial color="#6b4428" />
        </mesh>
      ) : null}
      {plot.trim?.includes("vane") ? (
        <mesh position={[0.2, h + 0.28, 0]}>
          <boxGeometry args={[0.22, 0.02, 0.05]} />
          <meshStandardMaterial color="#c9a227" metalness={0.4} />
        </mesh>
      ) : null}
    </group>
  );
}

function Lantern() {
  return (
    <group position={[0.55, 0, 0.35]}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.04, 0.9, 0.04]} />
        <meshStandardMaterial color="#5b4230" />
      </mesh>
      <mesh position={[0, 0.95, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#f2d48a" emissive="#e2b84a" emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

function CourtHouse({ town, level, onEnter }: { town: CivicTown; level: number; onEnter: () => void }) {
  const big = town === "capitol";
  const cols = (big ? 6 : 4) + Math.max(0, level - 1);
  const w = big ? 2.6 : 1.7;
  const span = w * 0.42;
  return (
    <group onClick={(e) => { e.stopPropagation(); onEnter(); }}>
      <mesh position={[0, 0.12, 0.35]} receiveShadow>
        <boxGeometry args={[w + 0.4, 0.16, 1.5]} />
        <meshStandardMaterial color="#d9d3c6" />
      </mesh>
      <mesh position={[0, 0.28, 0.7]} receiveShadow>
        <boxGeometry args={[w + 0.15, 0.12, 0.7]} />
        <meshStandardMaterial color="#cfc6b6" />
      </mesh>
      {Array.from({ length: cols }, (_, i) => {
        const x = -span + (i * (span * 2)) / Math.max(1, cols - 1);
        return (
          <mesh key={i} position={[x, 0.85, 0.55]} castShadow>
            <cylinderGeometry args={[0.06, 0.07, 1.05, 8]} />
            <meshStandardMaterial color="#f4efe4" />
          </mesh>
        );
      })}
      <mesh position={[0, 1.42, 0.55]} castShadow>
        <boxGeometry args={[w, 0.1, 0.42]} />
        <meshStandardMaterial color="#efe6d4" />
      </mesh>
      <mesh position={[0, 1.72, 0.55]} castShadow>
        <coneGeometry args={[w * 0.48, 0.46, 4]} />
        <meshStandardMaterial color="#f7f1e4" />
      </mesh>
      <Html position={[0, 2.15, 0]} center distanceFactor={18} style={{ pointerEvents: "none" }}>
        <span className="whitespace-nowrap rounded-full bg-ink/85 px-2 py-0.5 font-display text-[10px] font-semibold text-parchment">
          {big ? "Port Victoria · Supreme Court" : `${TOWN_LABEL[town]} court`}
        </span>
      </Html>
    </group>
  );
}

export function CivicLife() {
  const civic = useGame((s) => s.civic);
  const enter = useGame((s) => s.enterCourt);
  const enterPub = useGame((s) => s.enterPub);
  const open = useGame((s) => s.openPopup);
  const speak = useGame((s) => s.speak);
  const gx = useGame((s) => s.gnomeX);
  const gy = useGame((s) => s.gnomeY);
  if (!civic?.gnomes?.length) return null;
  const speaker = civic.beat % civic.gnomes.length;
  return (
    <group>
      {civic.plots.map((plot) => (
        <group key={plot.id} position={to3(plot.x, plot.y, groundY(plot.x, plot.y))}>
          <mesh position={[0, 0.04, 0]} receiveShadow>
            <boxGeometry args={[1.15, 0.06, 0.9]} />
            <meshStandardMaterial color={plot.shares.length ? "#c4b49a" : "#b7c4a4"} />
          </mesh>
          {plot.shares.slice(0, 4).map((id, i) => (
            <mesh key={id} position={[-0.4 + i * 0.22, 0.12, -0.38]}>
              <boxGeometry args={[0.05, 0.16, 0.05]} />
              <meshStandardMaterial color="#6b5340" />
            </mesh>
          ))}
          {plot.stories > 0 ? <House plot={plot} /> : null}
          {plot.lantern ? <Lantern /> : null}
        </group>
      ))}
      {civic.gnomes.map((g, i) => {
        const talk = i === speaker || i === (speaker + 1) % civic.gnomes.length || !g.good;
        const near = Math.hypot(g.x - gx, g.y - gy) < 85;
        const atPint = civic.pint && (civic.pint.a === g.id || civic.pint.b === g.id);
        const working = i === speaker && !near;
        const gesture = near || atPint ? "wave" : working && (g.job === "mason" || g.job === "smith") ? "hammer" : working && (g.job === "carpenter") ? "saw" : working && (g.job === "gardener" || g.job === "herder") ? "hoe" : null;
        return (
          <group
            key={g.id}
            position={to3(g.x, g.y, groundY(g.x, g.y))}
            onClick={(e) => {
              e.stopPropagation();
              speak(g.line);
              open({
                kind: "npc",
                hotspotId: g.id,
                title: g.name,
                blurb: civicBlurb(g, civic),
                place: "village",
              });
            }}
          >
            <GnomeRig hat={g.hat} coat={g.coat} scale={1.15} beard={g.good} walking={i === speaker} gesture={gesture} />
            {g.job === "mason" || g.job === "carpenter" ? (
              <mesh position={[0.22, 0.55, 0.16]} rotation={[0.4, 0, 0.6]} castShadow>
                <boxGeometry args={[0.05, 0.28, 0.05]} />
                <meshStandardMaterial color="#6b4428" />
              </mesh>
            ) : null}
            {talk && g.line ? (
              <Html position={[0, 1.85, 0]} center distanceFactor={18} style={{ pointerEvents: "none" }} zIndexRange={[8, 0]}>
                <p className="max-w-[200px] rounded-2xl bg-parchment/95 px-2 py-1 text-center font-display text-[10px] font-semibold leading-snug text-ink shadow-panel">
                  {g.line}
                </p>
              </Html>
            ) : null}
          </group>
        );
      })}
      {COURTS.map((court) => {
        const houses = civic.plots.filter((p) => p.town === court.town && p.stories > 0).length;
        const level = Math.min(4, 1 + Math.floor(houses / 2));
        return (
          <group key={court.town} position={to3(court.x, court.y, groundY(court.x, court.y))} scale={court.town === "capitol" ? 1.25 : 1}>
            <CourtHouse town={court.town} level={level} onEnter={() => enter(court.town)} />
          </group>
        );
      })}
      {(civic.pubs ?? []).map((pub) => {
        const party = civic.party?.town === pub.town;
        const py = groundY(pub.x, pub.y);
        return (
          <group
            key={pub.name}
            position={to3(pub.x, pub.y, py)}
            onClick={(e) => {
              e.stopPropagation();
              enterPub(pub.town);
            }}
          >
            <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.7, 1.05, 1.15]} />
              <meshStandardMaterial color="#6b3a32" />
            </mesh>
            <mesh position={[0, 1.35, 0]} castShadow>
              <boxGeometry args={[1.45, 0.7, 0.95]} />
              <meshStandardMaterial color="#efe6d4" />
            </mesh>
            <mesh position={[0, 1.78, 0]}>
              <boxGeometry args={[1.6, 0.1, 1.1]} />
              <meshStandardMaterial color="#5b4230" />
            </mesh>
            <mesh position={[0, 0.45, 0.59]}>
              <boxGeometry args={[0.36, 0.55, 0.04]} />
              <meshStandardMaterial color="#2a2118" />
            </mesh>
            <mesh position={[0.42, 1.35, 0.49]}>
              <boxGeometry args={[0.18, 0.18, 0.03]} />
              <meshStandardMaterial color="#f2d48a" emissive="#e2b84a" emissiveIntensity={0.45} />
            </mesh>
            <group position={[0.95, 0, 0.2]}>
              <GnomeRig hat={pub.hat} coat={pub.coat} scale={1.15} beard gesture="wave" />
            </group>
            <Html position={[0, 2.15, 0]} center distanceFactor={16} style={{ pointerEvents: "none" }}>
              <span className="whitespace-nowrap rounded-full bg-ink/85 px-2 py-0.5 font-display text-[10px] font-semibold text-parchment">
                {pub.name}
                {party ? " · party" : ""}
              </span>
            </Html>
          </group>
        );
      })}
      {civic.dock ? (
        <group position={to3(SUNSTEP_DOCK.x, SUNSTEP_DOCK.y, -0.08)}>
          <mesh position={[0, 0.12, 0]} castShadow>
            <boxGeometry args={[0.7, 0.1, 2.4]} />
            <meshStandardMaterial color="#8a6238" />
          </mesh>
          <mesh position={[0, 0.45, 0.9]}>
            <boxGeometry args={[0.06, 0.7, 0.06]} />
            <meshStandardMaterial color="#5b4230" />
          </mesh>
          <Html position={[0, 1.1, 0]} center distanceFactor={18} style={{ pointerEvents: "none" }}>
            <span className="whitespace-nowrap rounded-full bg-ink/85 px-2 py-0.5 text-[10px] font-semibold text-parchment">
              Port Sunstep · cruise tax
            </span>
          </Html>
        </group>
      ) : null}
    </group>
  );
}
