/**
 * Day and night are prepared, not running.
 * The sky stays on "day" until a later pass starts the clock.
 * Farm growth uses real timestamps in crops.ts and does not read this yet.
 */
export const DAY_PHASES = ["dawn", "day", "dusk", "night"] as const;
export type DayPhase = (typeof DAY_PHASES)[number];

/** Full cycle length, ready for when the clock is switched on. */
export const DAY_CYCLE_MS = 8 * 60 * 1000;

export const PHASE_SKY: Record<DayPhase, string> = {
  dawn: "#e7c39a",
  day: "#8eb8ae",
  dusk: "#c47b6a",
  night: "#1d2a3a",
};

export const PHASE_FOG: Record<DayPhase, string> = {
  dawn: "#e2c2a4",
  day: "#8aa8a4",
  dusk: "#a87870",
  night: "#1a2428",
};

/** Locked until the cycle is implemented. */
export const LOCKED_PHASE: DayPhase = "day";
