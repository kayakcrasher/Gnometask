import type { BuildingId, MetricId, PlaceId } from "../types";

export const PLACES: { id: PlaceId; name: string; blurb: string }[] = [
  {
    id: "cottage",
    name: "The Cottage",
    blurb: "A squat little house with a stubborn chimney and a door that never quite sits straight.",
  },
  {
    id: "garden",
    name: "The Garden",
    blurb: "Rows of beds that feed the village. Water them and they forgive yesterday.",
  },
  {
    id: "shop",
    name: "Town shops",
    blurb: "A row of houses on the square. Click a door and you are inside.",
  },
  {
    id: "village",
    name: "The Village",
    blurb: "Quaint rowhouses grow from the square. Place a neighbour and the lane gets longer.",
  },
  {
    id: "pond",
    name: "The Pond",
    blurb: "Still water, lily pads, and a good spot to think about the next timber run.",
  },
  {
    id: "woods",
    name: "The Woods",
    blurb: "Pine shade and polite mushrooms. They like to be greeted. They do not like to be rushed.",
  },
  {
    id: "dock",
    name: "The Dock",
    blurb: "Goblins and dark elves come in by sea. Coil the rope. Mind the pier.",
  },
  {
    id: "mines",
    name: "The Mines",
    blurb: "Lanterns, drips, and bats who think they own the dark.",
  },
  {
    id: "ruins",
    name: "The Ruins",
    blurb: "Old stones with opinions. Rubble sprites live in the gaps and do not share.",
  },
  {
    id: "wildlands",
    name: "The Wildlands",
    blurb: "Past the village the ground gets honest. Boars, sprites, wyrmlings — and the dragon on the ridge.",
  },
  {
    id: "haven",
    name: "Haven",
    blurb: "A second village that arrives slowly. Unique steel, and a Guardsgnome who takes the job seriously.",
  },
];

export const METRICS: { id: MetricId; name: string; unit: string }[] = [
  { id: "care", name: "Care", unit: "chores done here" },
  { id: "bloom", name: "Bloom", unit: "how lush this patch is" },
  { id: "prosperity", name: "Prosperity", unit: "what you've built" },
];

export const BUILDING_MAX: Record<BuildingId, number> = {
  cottage: 40,
  village: 60,
  haven: 40,
};

export const PLAYER_START = { x: 400, y: 478 };
