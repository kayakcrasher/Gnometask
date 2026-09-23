export type BoatId = "row" | "sail" | "fisher" | "barge" | "sloop";

export type BoatDef = {
  id: BoatId;
  name: string;
  need: number;
  xp: number;
  blurb: string;
  x: number;
  y: number;
};

/** Sailing levels are the usual curve, so the first boats open after a few trips. */
export const BOATS: BoatDef[] = [
  { id: "row", name: "Rowboat", need: 1, xp: 24, blurb: "Two oars. The honest start.", x: 58, y: 500 },
  { id: "sail", name: "Sail skiff", need: 2, xp: 36, blurb: "One white sail. She likes a breeze.", x: 36, y: 455 },
  { id: "fisher", name: "Fisher", need: 3, xp: 52, blurb: "A stubby cabin and a patient hull.", x: 28, y: 545 },
  { id: "barge", name: "Cargo barge", need: 4, xp: 70, blurb: "Crates, rope, and no hurry.", x: 78, y: 655 },
  { id: "sloop", name: "Little sloop", need: 5, xp: 90, blurb: "Cute from the beach. Deadly past the bar.", x: 18, y: 390 },
];

export const BOAT_RANK: Record<BoatId, number> = {
  row: 1,
  sail: 2,
  fisher: 3,
  barge: 4,
  sloop: 5,
};

export function boatById(id: string) {
  return BOATS.find((b) => b.id === id) ?? null;
}
