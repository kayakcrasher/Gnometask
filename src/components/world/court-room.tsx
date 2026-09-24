import { Canvas } from "@react-three/fiber";
import { caseBrief, TOWN_LABEL } from "@/lib/game/data/civic";
import { useGame } from "@/lib/game/store";
import { GnomeRig } from "./gnome-rig";

function Amphitheater() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[7.2, 40]} />
        <meshStandardMaterial color="#d7d0c2" />
      </mesh>
      {[3.2, 4.3, 5.4].map((r, tier) => (
        <mesh key={r} position={[0, 0.18 + tier * 0.28, 0.4]} rotation={[0.15, 0, 0]}>
          <cylinderGeometry args={[r, r, 0.22, 28, 1, true, Math.PI * 0.15, Math.PI * 0.7]} />
          <meshStandardMaterial color={tier % 2 ? "#cfc6b4" : "#e7e1d4"} side={2} />
        </mesh>
      ))}
      {[-2.2, -1.1, 0, 1.1, 2.2].map((x) => (
        <mesh key={x} position={[x, 1.15, -1.6]} castShadow>
          <cylinderGeometry args={[0.12, 0.14, 2.1, 10]} />
          <meshStandardMaterial color="#f4efe4" />
        </mesh>
      ))}
      <mesh position={[0, 2.25, -1.6]}>
        <boxGeometry args={[5.2, 0.16, 0.55]} />
        <meshStandardMaterial color="#f7f1e4" />
      </mesh>
      <mesh position={[0, 2.55, -1.6]} castShadow>
        <coneGeometry args={[2.3, 0.7, 4]} />
        <meshStandardMaterial color="#f3ecdf" />
      </mesh>
      <group position={[0, 0, -1.15]}>
        <GnomeRig hat="hat-night" scale={0.9} coat="#141414" pants="#1a1a1a" beard />
      </group>
      <group position={[-1.5, 0, 0.4]}>
        <GnomeRig hat="hat-flower" scale={0.8} coat="#c9a227" beard={false} />
      </group>
      <group position={[1.5, 0, 0.4]}>
        <GnomeRig hat="hat-guard" scale={0.8} coat="#35543f" beard />
      </group>
      <hemisphereLight args={["#fff6e8", "#8a7a68", 0.85]} />
      <directionalLight position={[4, 8, 6]} intensity={1.1} />
    </group>
  );
}

export function CourtRoom() {
  const leave = useGame((s) => s.leaveInterior);
  const civic = useGame((s) => s.civic);
  const advance = useGame((s) => s.advanceCase);
  const town = civic?.hearing ?? "capitol";
  const stage = civic?.caseStage ?? 0;
  const supreme = town === "capitol";
  return (
    <div className="fixed inset-0 z-30 bg-[#1c2430]">
      <Canvas camera={{ position: [0, 4.2, 8.4], fov: 40 }}>
        <Amphitheater />
      </Canvas>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-3">
        <div className="pointer-events-auto max-w-sm rounded-[16px] bg-parchment/95 px-3 py-2 shadow-panel">
          <p className="font-display text-lg font-semibold text-ink">
            {supreme ? "Supreme Court" : `${TOWN_LABEL[town]} Court`}
          </p>
          <p className="text-xs font-semibold text-bark/70">
            {supreme
              ? "Port Victoria. Greek bench. The judge wears the black gown. This is the island's last word."
              : "A smaller amphitheater. Elegant, and it grows when the town does. The great case is not heard here."}
          </p>
        </div>
        <button type="button" onClick={leave} className="pointer-events-auto rounded-full bg-parchment px-3 py-2 text-xs font-semibold text-ink">
          Leave
        </button>
      </div>
      <div className="absolute inset-x-0 bottom-0 z-10 p-3">
        <div className="mx-auto max-w-lg rounded-[20px] bg-parchment p-4 shadow-panel">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-bark/55">
            {supreme ? `Docket · stage ${stage + 1} of 4` : "Local bench"}
          </p>
          <p className="mt-1 text-sm font-semibold leading-snug text-ink">{caseBrief(stage, town)}</p>
          <button
            type="button"
            disabled={!supreme || stage >= 3}
            onClick={advance}
            className="mt-3 h-11 w-full rounded-[14px] bg-ink font-display text-sm font-semibold text-parchment disabled:opacity-40"
          >
            {!supreme ? "Heard in Port Victoria" : stage >= 3 ? "The dock stands" : stage === 2 ? "Accept the cruise tax" : "Hear the next side"}
          </button>
        </div>
      </div>
    </div>
  );
}
