import { useGame } from "@/lib/game/store";
import { PHASE_FOG, PHASE_SKY } from "@/lib/game/data/daynight";

/** Sky tint follows dayPhase. The phase is locked to day until the cycle is turned on. */
export function Sky() {
  const phase = useGame((s) => s.dayPhase);
  return (
    <>
      <color attach="background" args={[PHASE_SKY[phase]]} />
      <fog attach="fog" args={[PHASE_FOG[phase], 36, 95]} />
    </>
  );
}
