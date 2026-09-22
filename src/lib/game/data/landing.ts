import type { GoblinLanding } from "../types";

export const MUCKTOOTH = "Mucktooth Clan";
export const FLAG_MAX = 10;

export const LANDING_BOAT = { x: 52, y: 572 };

export function makeLanding(): GoblinLanding {
  return {
    tribe: MUCKTOOTH,
    boatX: LANDING_BOAT.x,
    boatY: LANDING_BOAT.y,
    newsTold: false,
    flagHp: FLAG_MAX,
    flagDown: false,
    goblins: [
      { id: "land-0", x: 78, y: 548, alive: true },
      { id: "land-1", x: 38, y: 544, alive: true },
      { id: "land-2", x: 92, y: 596, alive: true },
      { id: "land-3", x: 28, y: 604, alive: true },
      { id: "land-4", x: 64, y: 622, alive: true },
    ],
  };
}

export function landingAlive(landing: GoblinLanding | null | undefined) {
  return landing?.goblins.filter((g) => g.alive).length ?? 0;
}

export function landingCleared(landing: GoblinLanding | null | undefined) {
  return Boolean(landing && landing.goblins.length > 0 && landing.goblins.every((g) => !g.alive));
}
