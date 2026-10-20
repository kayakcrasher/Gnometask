export type BoatId =
  | "row"
  | "sail"
  | "fisher"
  | "barge"
  | "sloop"
  | "coaster"
  | "packet"
  | "yacht"
  | "expedition"
  | "megayacht";

export type BoatDef = {
  cargo?: number;
  id: BoatId;
  name: string;
  need: number;
  /** Sailing XP for each completed travel interval. */
  xp: number;
  price: number;
  /** Map units per second before the Sailing skill bonus. */
  speed: number;
  blurb: string;
  x: number;
  y: number;
};

/** Sailing levels are the usual curve, so the first boats open after a few trips. */
export const BOATS: BoatDef[] = [
  {
    id: "row",
    name: "Rowboat",
    need: 1,
    xp: 24,
    price: 0,
    speed: 180,
    blurb: "Two oars. Already yours.",
    x: -50,
    y: 470,
  },
  {
    id: "sail",
    name: "Sail skiff",
    need: 2,
    xp: 36,
    price: 40,
    speed: 250,
    blurb: "One white sail. Quick across the bay.",
    x: -120,
    y: 360,
  },
  {
    id: "fisher",
    name: "Fisher",
    need: 3,
    xp: 52,
    price: 75,
    speed: 220,
    blurb: "A steady fishing boat with a sheltered cabin.",
    x: -70,
    y: 590,
  },
  {
    id: "barge",
    cargo: 12,
    name: "Cargo barge",
    need: 4,
    xp: 70,
    price: 120,
    speed: 150,
    blurb: "A slow, heavy hull. Crates, rope, and a ledger.",
    x: -140,
    y: 720,
  },
  {
    id: "sloop",
    name: "Little sloop",
    need: 5,
    xp: 90,
    price: 180,
    speed: 300,
    blurb: "The fastest hull on the pier. Armed for open water.",
    x: -130,
    y: 280,
  },
  {
    id: "coaster",
    name: "Little Acorn Coaster",
    need: 8,
    xp: 115,
    price: 14000,
    speed: 230,
    cargo: 40,
    blurb:
      "A compact coastal freighter with a proper wheelhouse and working cargo deck.",
    x: -260,
    y: 900,
  },
  {
    id: "packet",
    name: "Pinewake Packet",
    need: 14,
    xp: 155,
    price: 65000,
    speed: 270,
    cargo: 100,
    blurb:
      "Twin holds, copper funnel and a sheltered wheelhouse for northern trade.",
    x: -400,
    y: 1080,
  },
  {
    id: "yacht",
    name: "Moonpetal Yacht",
    need: 25,
    xp: 220,
    price: 1250000,
    speed: 330,
    blurb:
      "Ivory hull, curved blue windows, teak terraces and a private tender.",
    x: -600,
    y: 1300,
  },
  {
    id: "expedition",
    name: "Aurora Explorer",
    need: 40,
    xp: 290,
    price: 4800000,
    speed: 310,
    cargo: 160,
    blurb:
      "A rugged explorer yacht with an observation lounge, survey mast and aft work deck.",
    x: -850,
    y: 1480,
  },
  {
    id: "megayacht",
    name: "The Gilded Acorn",
    need: 60,
    xp: 380,
    price: 12000000,
    speed: 360,
    blurb:
      "Three stepped decks, a rooftop garden, pool, grand salon and gilded bow.",
    x: -1120,
    y: 1700,
  },
];

export const BOAT_RANK: Record<BoatId, number> = {
  row: 1,
  sail: 2,
  fisher: 3,
  barge: 4,
  sloop: 5,
  coaster: 6,
  packet: 7,
  yacht: 8,
  expedition: 9,
  megayacht: 10,
};

export function boatById(id: string) {
  return BOATS.find((b) => b.id === id) ?? null;
}
