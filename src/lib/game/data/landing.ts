import type { GoblinLanding } from "../types";

export const MUCKTOOTH = "Mucktooth Clan";
export const FLAG_MAX = 10;

export const LANDING_BOAT = { x: -36, y: 760 };

export function makeLanding(): GoblinLanding {
  return {
    tribe: MUCKTOOTH,
    boatX: LANDING_BOAT.x,
    boatY: LANDING_BOAT.y,
    newsTold: false,
    flagHp: FLAG_MAX,
    flagDown: false,
    goblins: [
      { id: "land-0", x: 70, y: 780, alive: true },
      { id: "land-1", x: 90, y: 800, alive: true },
      { id: "land-2", x: 80, y: 840, alive: true },
      { id: "land-3", x: 100, y: 880, alive: true },
      { id: "land-4", x: 85, y: 760, alive: true },
    ],
  };
}

export function landingAlive(landing: GoblinLanding | null | undefined) {
  return landing?.goblins.filter((g) => g.alive).length ?? 0;
}

export function landingCleared(landing: GoblinLanding | null | undefined) {
  return Boolean(landing && landing.goblins.length > 0 && landing.goblins.every((g) => !g.alive));
}
