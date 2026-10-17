import { cellsOf, townGrid } from "./grids";
export const SUNSTEP_VENUES = cellsOf(townGrid("sunstep")).map((lot, i) => ({
  ...lot,
  id: `sunstep-${i}`,
  name: [
    "The Dune",
    "Gilt Palace",
    "Nightjar",
    "Oasis",
    "Lucky Pit",
    "Mirage",
    "Stardust",
    "Jade Moon",
    "Royal Spire",
    "Copper Club",
    "Starfall",
    "Desert Crown",
  ][i]!,
  accent: ["#ff4fa3", "#f2c14e", "#3de2ff", "#7cffb2", "#ff704d", "#c084fc"][
    i % 6
  ]!,
  architecture: ["tower", "dome", "spire", "terrace"][i % 4] as
    "tower" | "dome" | "spire" | "terrace",
}));
export const SUNSTEP_FEATURES = {
  fountain: { x: 3620, y: 780 },
  marquee: { x: 3520, y: 1080 },
  hotel: { x: 3810, y: 650 },
  oasis: { x: 3860, y: 1000 },
};
export const CASINO_VENUES = [
  ...SUNSTEP_VENUES,
  {
    ...SUNSTEP_FEATURES.hotel,
    id: "sunstep-hotel",
    name: "Royal Sun Hotel",
    accent: "#c084fc",
    architecture: "spire" as const,
  },
];
export const casinoVenue = (id: string | null) =>
  CASINO_VENUES.find((v) => v.id === id) ?? SUNSTEP_VENUES[0]!;
