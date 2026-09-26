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
  const scale = big ? 1.0 : 0.62;
  const W = 6.0;
  const D = 4.6;
  const colH = 2.0;
  const colR = 0.14;
  const baseY = 0.34;

  const sideCols = big ? 5 : 4;
  const frontCols = big ? 8 : 6;
  const gapW = W / (frontCols + 1);
  const gapD = D / (sideCols + 1);

  const front = Array.from({ length: frontCols }, (_, i) => ({
    x: -W / 2 + gapW * (i + 1),
    z: D / 2,
  }));
  const back = Array.from({ length: frontCols }, (_, i) => ({
    x: -W / 2 + gapW * (i + 1),
    z: -D / 2,
  }));
  const left = Array.from({ length: sideCols }, (_, i) => ({
    x: -W / 2,
    z: -D / 2 + gapD * (i + 1),
  }));
  const right = Array.from({ length: sideCols }, (_, i) => ({
    x: W / 2,
    z: -D / 2 + gapD * (i + 1),
  }));
  const columns = [...front, ...back, ...left, ...right];

  const drumR = 1.5;
  const drumH = 0.9;
  const drumBaseY = baseY + colH + 0.5;
  const drumTopY = drumBaseY + drumH / 2;
  const domeBaseY = drumTopY + 0.04;

  const lanternCols = 8;
  const lanternR = 0.55;
  const lanternH = 0.5;
  const surfaceY = domeBaseY + Math.sqrt(drumR * drumR - lanternR * lanternR);
  const lanternCenterY = surfaceY + lanternH / 2;
  const lanternTopY = surfaceY + lanternH;
  const roofY = lanternTopY;
  const finialY = roofY + 0.7 + 0.12;

  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        onEnter();
      }}
      scale={scale}
    >
      <mesh position={[0, 0.12, 0]} receiveShadow castShadow>
        <boxGeometry args={[W + 1.4, 0.24, D + 1.4]} />
        <meshStandardMaterial color="#c9c3b4" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.28, 0]} receiveShadow castShadow>
        <boxGeometry args={[W + 0.8, 0.14, D + 0.8]} />
        <meshStandardMaterial color="#d9d3c6" roughness={0.9} />
      </mesh>

      <mesh position={[0, baseY + colH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[W - 0.35, colH, D - 0.35]} />
        <meshStandardMaterial color="#e2d9c4" roughness={0.92} />
      </mesh>
      {[0.25, 0.5, 0.75].map((f) => (
        <mesh key={f} position={[0, baseY + colH * f, 0]}>
          <boxGeometry args={[W - 0.3, 0.015, D - 0.3]} />
          <meshStandardMaterial color="#b7b1a4" />
        </mesh>
      ))}

      {columns.map((c, i) => (
        <group key={i} position={[c.x, baseY, c.z]}>
          <mesh position={[0, colH / 2, 0]} castShadow>
            <cylinderGeometry args={[colR, colR + 0.02, colH, 12]} />
            <meshStandardMaterial color="#f7f1e4" roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.06, 0]}>
            <cylinderGeometry args={[colR + 0.06, colR + 0.08, 0.12, 12]} />
            <meshStandardMaterial color="#e7e1d4" roughness={0.9} />
          </mesh>
          <mesh position={[0, colH - 0.06, 0]} castShadow>
            <boxGeometry args={[colR * 3, 0.12, colR * 3]} />
            <meshStandardMaterial color="#f3ecdf" roughness={0.85} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, baseY + colH + 0.14, 0]} castShadow receiveShadow>
        <boxGeometry args={[W + 0.5, 0.28, D + 0.5]} />
        <meshStandardMaterial color="#f3ecdf" roughness={0.85} />
      </mesh>
      <mesh position={[0, baseY + colH + 0.36, 0]} castShadow>
        <boxGeometry args={[W + 0.35, 0.14, D + 0.35]} />
        <meshStandardMaterial color="#efe6d4" roughness={0.85} />
      </mesh>


      <mesh position={[0, drumBaseY, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[drumR, drumR + 0.05, drumH, 28]} />
        <meshStandardMaterial color="#d9d3c6" roughness={0.9} />
      </mesh>
      <mesh position={[0, drumTopY, 0]}>
        <cylinderGeometry args={[drumR + 0.08, drumR + 0.08, 0.08, 28]} />
        <meshStandardMaterial color="#b7b1a4" />
      </mesh>

      <mesh position={[0, domeBaseY, 0]} castShadow receiveShadow>
        <sphereGeometry args={[drumR, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#e8dfc4" roughness={0.85} />
      </mesh>

      {Array.from({ length: lanternCols }).map((_, i) => {
        const a = (i / lanternCols) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(a) * lanternR,
              lanternCenterY,
              Math.sin(a) * lanternR,
            ]}
            castShadow
          >
            <cylinderGeometry args={[0.05, 0.06, lanternH, 8]} />
            <meshStandardMaterial color="#f7f1e4" />
          </mesh>
        );
      })}

      <mesh position={[0, roofY, 0]} castShadow>
        <sphereGeometry args={[0.7, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#d9d3c6" roughness={0.85} />
      </mesh>
      <mesh position={[0, finialY, 0]} castShadow>
        <sphereGeometry args={[0.12, 12, 10]} />
        <meshStandardMaterial color="#d6a84c" metalness={0.4} roughness={0.4} />
      </mesh>

      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          position={[0, 0.06 + i * 0.07, D / 2 + 1.0 + i * 0.22]}
          receiveShadow
        >
          <boxGeometry args={[W + 0.6, 0.14, 0.5]} />
          <meshStandardMaterial color="#cfc6b4" roughness={0.95} />
        </mesh>
      ))}

      <Html
        position={[0, finialY + 0.6, 0]}
        center
        distanceFactor={big ? 28 : 20}
        style={{ pointerEvents: "none" }}
      >
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
