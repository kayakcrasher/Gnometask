import type { DayPhase } from "../data/daynight";
import type { StoreGet, StoreSet } from "./types";

/**
 * Harbor clock. One full day = 6 minutes of real time.
 * Not saved. Resets to dawn every page load.
 *
 * Continuous position lives here, not on the store, so React only
 * re-renders on phase change (4 times per cycle) instead of every tick.
 */
export const HARBOR_DAY_MS = 6 * 60 * 1000;

const AT_DAY = 0.17;
const AT_DUSK = 0.67;
const AT_NIGHT = 0.83;

let harborT = 0;

export function phaseFromT(t: number): DayPhase {
  const x = ((t % 1) + 1) % 1;
  if (x < AT_DAY) return "dawn";
  if (x < AT_DUSK) return "day";
  if (x < AT_NIGHT) return "dusk";
  return "night";
}

/** Read the continuous position for anything that wants to lerp. */
export function clockT(): number {
  return harborT;
}

export function clockSlice(
  set: StoreSet,
  get: StoreGet,
): { dayPhase: DayPhase; tickClock: (dtMs: number) => void } {
  return {
    dayPhase: "dawn",
    tickClock: (dtMs: number) => {
      harborT = (harborT + dtMs / HARBOR_DAY_MS) % 1;
      const phase = phaseFromT(harborT);
      if (phase !== get().dayPhase) set({ dayPhase: phase });
    },
  };
}
