import { SUNSTEP } from "../world3";

/** A country this size holds five villages. The shore town is the capitol. */
export const VILLAGE_CAP = 5;

export type VillagePin = {
  id: string;
  name: string;
  x: number;
  y: number;
  capitol?: boolean;
};

export const VILLAGES: VillagePin[] = [
  { id: "capitol", name: "Capitol", x: 320, y: 550, capitol: true },
  { id: "greenlane", name: "Greenlane", x: 1210, y: 540 },
  { id: "haven", name: "Haven", x: 1860, y: 760 },
  { id: "tideham", name: "Tideham", x: 130, y: 680 },
  { id: "sunstep", name: "Sunstep", x: SUNSTEP.x, y: SUNSTEP.y },
];

if (VILLAGES.length > VILLAGE_CAP) {
  throw new Error(`This country holds ${VILLAGE_CAP} villages.`);
}
