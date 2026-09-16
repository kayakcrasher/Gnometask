export type PlaceId =
  | "cottage"
  | "garden"
  | "shops"
  | "village"
  | "woodlot"
  | "ridge"
  | "shore";

export type Place = {
  id: PlaceId;
  name: string;
  blurb: string;
  /** Camera hint for the 3D world later */
  lookAt: [number, number, number];
};

export const PLACES: Place[] = [
  {
    id: "cottage",
    name: "The cottage",
    blurb: "Bed, basin, kettle, red door if you bought one. Chores start here.",
    lookAt: [0, 1.2, 0],
  },
  {
    id: "garden",
    name: "The garden",
    blurb: "Bigger beds behind the house. Thyme, hens, and the trough.",
    lookAt: [6, 0.8, -4],
  },
  {
    id: "shops",
    name: "The shops",
    blurb: "Hats in one window, house bits in the other. Same lane.",
    lookAt: [-4, 1.4, 8],
  },
  {
    id: "village",
    name: "The Village",
    blurb: "Grows when you place pieces. Starts as two ruts and a stoop.",
    lookAt: [0, 1.0, 10],
  },
  {
    id: "woodlot",
    name: "The woodlot",
    blurb: "Stump, kindling, and the trees you are allowed to drop.",
    lookAt: [12, 1.0, -2],
  },
  {
    id: "ridge",
    name: "Dragon ridge",
    blurb: "Up the path. Arguments live here.",
    lookAt: [-10, 4.0, -14],
  },
  {
    id: "shore",
    name: "The shore",
    blurb: "For later sailing. Pebbles and a tied punt.",
    lookAt: [8, 0.4, 18],
  },
];

export function placeById(id: string): Place | undefined {
  return PLACES.find((p) => p.id === id);
}

export function placeName(id: string): string {
  return placeById(id)?.name ?? id;
}
