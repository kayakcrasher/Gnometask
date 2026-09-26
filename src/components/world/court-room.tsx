import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { caseBrief, TOWN_LABEL } from "@/lib/game/data/civic";
import {
  ARBUTHNOT,
  contextFromSave,
  rule,
  rulingText,
  type CourtArgument,
  type Verdict,
} from "@/lib/game/data/court";
import { useGame } from "@/lib/game/store";
import { GnomeRig } from "./gnome-rig";

/** Alternating sides for drama. Defense opens, crown answers. */
function interleave(sunstep: CourtArgument[], crown: CourtArgument[]): CourtArgument[] {
  const out: CourtArgument[] = [];
  const max = Math.max(sunstep.length, crown.length);
  for (let i = 0; i < max; i++) {
    if (sunstep[i]) out.push(sunstep[i]!);
    if (crown[i]) out.push(crown[i]!);
  }
  return out;
}

function Tier({ r, y, tint }: { r: number; y: number; tint: string }) {
  return (
    <mesh position={[0, y, 0.3]} rotation={[0.12, 0, 0]} receiveShadow>
      <cylinderGeometry args={[r, r, 0.24, 32, 1, true, Math.PI * 0.12, Math.PI * 0.76]} />
      <meshStandardMaterial color={tint} side={2} roughness={0.92} />
    </mesh>
  );
}

function Bench() {
  return (
    <group position={[0, 0, -1.35]}>
      <mesh position={[0, 0.12, 0]} receiveShadow>
        <boxGeometry args={[3.2, 0.24, 1.2]} />
        <meshStandardMaterial color="#c9c3b4" />
      </mesh>
      <mesh position={[0, 0.42, -0.35]} castShadow>
        <boxGeometry args={[3.0, 0.6, 0.18]} />
        <meshStandardMaterial color="#8a7a68" />
      </mesh>
      <mesh position={[0, 0.28, 0.2]} castShadow>
        <boxGeometry args={[2.4, 0.06, 0.6]} />
        <meshStandardMaterial color="#5b4230" />
      </mesh>
      <group position={[0, 0.24, 0.15]}>
        <GnomeRig hat="hat-night" scale={1.05} coat="#141414" pants="#1a1a1a" beard />
      </group>
    </group>
  );
}

function Lectern({ side, coat, hat, beard }: { side: -1 | 1; coat: string; hat: string; beard: boolean }) {
  const x = side * 1.7;
  return (
    <group position={[x, 0, 0.35]}>
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[0.55, 0.5, 0.42]} />
        <meshStandardMaterial color="#e6d8bc" />
      </mesh>
      <mesh position={[0, 0.55, -0.12]} rotation={[0.5, 0, 0]} castShadow>
        <boxGeometry args={[0.6, 0.04, 0.36]} />
        <meshStandardMaterial color="#5b4230" />
      </mesh>
      <group position={[side * 0.05, 0.15, -0.25]}>
        <GnomeRig hat={hat} scale={0.92} coat={coat} beard={beard} />
      </group>
    </group>
  );
}

function GadsdenBanner({ raised }: { raised: boolean }) {
  if (!raised) return null;
  return (
    <group position={[0, 2.6, -1.8]}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[2.6, 0.06, 0.06]} />
        <meshStandardMaterial color="#5b4230" />
      </mesh>
      <mesh position={[0, 0.75, 0.02]} rotation={[0, 0, 0.12]}>
        <boxGeometry args={[2.2, 0.9, 0.02]} />
        <meshStandardMaterial color="#F2C230" />
      </mesh>
      <mesh position={[0, 0.75, 0.05]}>
        <torusGeometry args={[0.18, 0.03, 6, 14]} />
        <meshStandardMaterial color="#1C1A17" />
      </mesh>
    </group>
  );
}

function Amphitheater({ verdict }: { verdict: Verdict | null }) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[8.4, 48]} />
        <meshStandardMaterial color="#d7d0c2" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[2.3, 2.55, 32, 1, Math.PI * 0.1, Math.PI * 0.8]} />
        <meshStandardMaterial color="#b7b1a4" />
      </mesh>

      <Tier r={3.2} y={0.22} tint="#e7e1d4" />
      <Tier r={4.3} y={0.5} tint="#cfc6b4" />
      <Tier r={5.4} y={0.78} tint="#e7e1d4" />
      <Tier r={6.5} y={1.06} tint="#cfc6b4" />

      {[-3.4, -2.2, -1.1, 0, 1.1, 2.2, 3.4].map((x) => (
        <mesh key={x} position={[x, 1.95, -2.55]} castShadow>
          <cylinderGeometry args={[0.14, 0.16, 2.6, 12]} />
          <meshStandardMaterial color="#f4efe4" />
        </mesh>
      ))}
      <mesh position={[0, 3.35, -2.55]} castShadow>
        <boxGeometry args={[7.6, 0.18, 0.7]} />
        <meshStandardMaterial color="#f7f1e4" />
      </mesh>
      <mesh position={[0, 3.75, -2.55]} castShadow>
        <coneGeometry args={[3.1, 0.9, 4]} />
        <meshStandardMaterial color="#f3ecdf" />
      </mesh>

      <Bench />
      <Lectern side={-1} coat="#35543f" hat="hat-straw" beard />
      <Lectern side={1} coat="#2f3d34" hat="hat-night" beard={false} />

      <GadsdenBanner raised={verdict?.side === "sunstep"} />

      <hemisphereLight args={["#fff6e8", "#8a7a68", 0.85]} />
      <directionalLight
        position={[5, 9, 7]}
        intensity={1.15}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={40}
      />
    </group>
  );
}

type Phase = "idle" | "streaming" | "ruled";

export function CourtRoom() {
  const leave = useGame((s) => s.leaveInterior);
  const civic = useGame((s) => s.civic);
  const advance = useGame((s) => s.advanceCase);
  const bonds = useGame((s) => s.bonds);
  const clarionReads = useGame((s) => s.clarionReads ?? 0);
  const days = useGame((s) => s.daysPlayed);
  const isles = useGame((s) => s.isles);

  const town = civic?.hearing ?? "capitol";
  const stage = civic?.caseStage ?? 0;
  const supreme = town === "capitol";

  const [phase, setPhase] = useState<Phase>(stage >= 3 ? "ruled" : "idle");
  const [argIndex, setArgIndex] = useState(0);
  const [verdict, setVerdict] = useState<Verdict | null>(null);

  // Begin the trial: compute the verdict up front, then reveal arguments one
  // at a time. The outcome never depends on the reveal — only on what the
  // player has unlocked.
  function begin() {
    const ctx = contextFromSave({
      bonds,
      clarionReads,
      caseStage: stage,
      daysPlayed: days,
      isles,
    });
    const v = rule(ctx, ARBUTHNOT);
    setVerdict(v);
    setArgIndex(0);
    setPhase("streaming");
  }

  const sequence = verdict
    ? interleave(verdict.sunstepArgs, verdict.crownArgs)
    : [];

  useEffect(() => {
    if (phase !== "streaming") return;
    if (argIndex >= sequence.length) {
      const id = setTimeout(() => {
        setPhase("ruled");
        advance();
      }, 2200);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => setArgIndex((i) => i + 1), 3000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, argIndex, sequence.length]);

  const current = phase === "streaming" ? sequence[argIndex] : null;

  const footer = (() => {
    if (!supreme) return null;
    if (phase === "idle" && stage < 3) return "Hear the case";
    if (phase === "idle" && stage >= 3) return "The bench has ruled";
    if (phase === "streaming") return `Argument ${argIndex + 1} of ${sequence.length}`;
    return "The bench has ruled";
  })();

  const canBegin = supreme && stage < 3 && phase === "idle";

  return (
    <div className="fixed inset-0 z-30 bg-[#1c2430]">
      <Canvas camera={{ position: [0, 5.4, 10.5], fov: 44 }}>
        <Amphitheater verdict={phase === "ruled" ? verdict : null} />
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-3">
        <div className="pointer-events-auto max-w-sm rounded-[16px] bg-parchment/95 px-3 py-2 shadow-panel">
          <p className="font-display text-lg font-semibold text-ink">
            {supreme ? "Supreme Court" : `${TOWN_LABEL[town]} Court`}
          </p>
          <p className="text-[11px] font-semibold leading-snug text-bark/70">
            {supreme
              ? "Port Victoria. Lord Chief Justice Arbuthnot presides. The black gown does not take sides."
              : "A smaller bench. The great case is not heard here."}
          </p>
        </div>
        <button
          type="button"
          onClick={leave}
          className="pointer-events-auto rounded-full bg-parchment px-3 py-2 text-xs font-semibold text-ink"
        >
          Leave
        </button>
      </div>

      {current ? (
        <div className="pointer-events-none absolute inset-x-0 top-24 z-10 flex justify-center px-3">
          <div
            className={
              current.side === "sunstep"
                ? "pointer-events-none max-w-lg rounded-[16px] bg-[#F2C230]/95 px-4 py-3 shadow-panel"
                : "pointer-events-none max-w-lg rounded-[16px] bg-parchment/95 px-4 py-3 shadow-panel"
            }
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-bark/70">
              {current.side === "sunstep" ? "For Sunstep · Wim" : "For the Crown · Stoic"} ·{" "}
              {current.pleading}
            </p>
            <p className="mt-1 font-display text-base font-semibold leading-snug text-ink">
              {current.text}
            </p>
            <p className="mt-1 text-[11px] font-semibold italic text-bark/60">
              — entered from {current.source}
            </p>
          </div>
        </div>
      ) : null}

      {phase === "ruled" && verdict ? (
        <div className="pointer-events-none absolute inset-x-0 top-24 z-10 flex justify-center px-3">
          <div className="pointer-events-none max-w-lg rounded-[18px] bg-ink/95 px-4 py-3 shadow-panel">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-parchment/60">
              {ARBUTHNOT.name} · ruling
            </p>
            <p className="mt-1 font-display text-lg font-semibold text-parchment">
              {verdict.side === "crown" ? "For the Crown" : "For Sunstep"}
            </p>
            <p className="mt-2 text-sm font-semibold leading-snug text-parchment/85">
              {rulingText(verdict)}
            </p>
            <p className="mt-2 text-[11px] font-bold uppercase tracking-wide text-parchment/55">
              Crown {verdict.crownScore.toFixed(1)} · Sunstep {verdict.sunstepScore.toFixed(1)} · margin{" "}
              {verdict.margin.toFixed(1)}
            </p>
          </div>
        </div>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 z-10 p-3">
        <div className="mx-auto max-w-lg rounded-[20px] bg-parchment p-4 shadow-panel">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-bark/55">
            {supreme ? "Docket" : "Local bench"}
          </p>
          <p className="mt-1 text-sm font-semibold leading-snug text-ink">
            {phase === "ruled" && verdict
              ? rulingText(verdict)
              : caseBrief(Math.min(stage, 3), town)}
          </p>
          {footer ? (
            <button
              type="button"
              disabled={!canBegin}
              onClick={begin}
              className="mt-3 h-11 w-full rounded-[14px] bg-ink font-display text-sm font-semibold text-parchment disabled:opacity-40"
            >
              {footer}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
