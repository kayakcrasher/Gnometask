import { LOCKED_PHASE, type DayPhase } from "../data/daynight";

/**
 * Clock slice. The phase does not advance yet.
 * When day/night starts, replace the locked return with a timestamp in the save.
 */
export function clockSlice(): { dayPhase: DayPhase } {
  return { dayPhase: LOCKED_PHASE };
}
