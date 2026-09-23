export type BoatId = "row" | "sail" | "fisher" | "barge" | "sloop";

export type BoatDef = {
  id: BoatId;
  name: string;
  need: number;
  xp: number;
  price: number;
  blurb: string;
  x: number;
  y: number;
};

/** Sailing levels are the usual curve, so the first boats open after a few trips. */
export const BOATS: BoatDef[] = [
  { id: "row", name: "Rowboat", need: 1, xp: 24, price: 0, blurb: "Two oars. Already yours.", x: -30, y: 500 },
  { id: "sail", name: "Sail skiff", need: 2, xp: 36, price: 40, blurb: "One white sail. Wim sells her.", x: -55, y: 450 },
  { id: "fisher", name: "Fisher", need: 3, xp: 52, price: 75, blurb: "A stubby cabin. Bought at the dockhouse.", x: -35, y: 560 },
  { id: "barge", name: "Cargo barge", need: 4, xp: 70, price: 120, blurb: "Crates, rope, and a ledger.", x: -60, y: 620 },
  { id: "sloop", name: "Little sloop", need: 5, xp: 90, price: 180, blurb: "Cute at the pier. Deadly past the bar.", x: -70, y: 420 },
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
