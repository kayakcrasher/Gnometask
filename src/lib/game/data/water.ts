import { onDesert, onGrass, onIsland } from "../world3";

/** World Y of the sea surface. Land sits above this. Hulls float on it.
 *  Shore waves stay under 0.05 so they cannot climb the grass. Swells start past the island. */
export const SEA_LEVEL = -0.22;

/**
 * Water rules, same as most shore games:
 * - Grass is dry land.
 * - The beach is shallow. You can walk it. Waves stay small.
 * - Past the beach is deep water. You cannot walk it. Boats float. Waves grow.
 */
export function onBeach(x: number, y: number) {
  return onIsland(x, y) && !onGrass(x, y) && !onDesert(x, y);
}

export function inDeepWater(x: number, y: number) {
  return !onIsland(x, y);
}
