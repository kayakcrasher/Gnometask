import type { GoblinLanding } from "../types";

export const MUCKTOOTH = "Mucktooth Clan";
export const FLAG_MAX = 10;

/** The goblin boat floats offshore. Goblins land on the beach just north of it. */
export const LANDING_BOAT = { x: 1470, y: 1720 };

/**
 * The beachhead flag. Planted on the sand at the waterline, so the player
 * has to push past the goblins to reach it.
 */
export const LANDING_FLAG = { x: 1470, y: 1560 };

const SPAWN_X = 1470;
const SPAWN_Y = 1500;

export function makeLanding(): GoblinLanding {
  return {
    tribe: MUCKTOOTH,
    boatX: LANDING_BOAT.x,
    boatY: LANDING_BOAT.y,
    newsTold: false,
    flagHp: FLAG_MAX,
    flagDown: false,
    goblins: [
      { id: "land-0", x: SPAWN_X - 60, y: SPAWN_Y - 12, alive: true },
      { id: "land-1", x: SPAWN_X - 30, y: SPAWN_Y + 4, alive: true },
      { id: "land-2", x: SPAWN_X + 10, y: SPAWN_Y - 6, alive: true },
      { id: "land-3", x: SPAWN_X + 45, y: SPAWN_Y + 8, alive: true },
      { id: "land-4", x: SPAWN_X + 75, y: SPAWN_Y - 4, alive: true },
    ],
  };
}

export function landingAlive(landing: GoblinLanding | null | undefined) {
  return landing?.goblins.filter((g) => g.alive).length ?? 0;
}

export function landingCleared(landing: GoblinLanding | null | undefined) {
  return Boolean(landing && landing.goblins.length > 0 && landing.goblins.every((g) => !g.alive));
}
