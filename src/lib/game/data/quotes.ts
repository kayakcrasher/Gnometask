export type QuoteLine = {
  id: string;
  speaker: "gnome" | "neighbour" | "shop" | "dragon" | "notice";
  text: string;
  /** Optional: only used near this place id */
  place?: string;
};

export const QUOTES: QuoteLine[] = [
  {
    id: "wake_1",
    speaker: "gnome",
    place: "cottage",
    text: "Feet on the floor. The kettle is already judging you.",
  },
  {
    id: "teeth_1",
    speaker: "gnome",
    place: "cottage",
    text: "Two minutes. The dragon does not brush. Be better than the dragon.",
  },
  {
    id: "bed_1",
    speaker: "gnome",
    place: "cottage",
    text: "Quilt straight. Tomorrow-you will thank today-you. Reluctantly.",
  },
  {
    id: "garden_1",
    speaker: "gnome",
    place: "garden",
    text: "Water the thyme, not the path. The path is already wet enough.",
  },
  {
    id: "hens_1",
    speaker: "neighbour",
    place: "garden",
    text: "They remember who forgot the grain. So do I.",
  },
  {
    id: "shop_hat",
    speaker: "shop",
    place: "shops",
    text: "A brim is a promise. That sleep cap is a confession.",
  },
  {
    id: "shop_house",
    speaker: "shop",
    place: "shops",
    text: "Glass first, kettle second, second room when you can stand up indoors.",
  },
  {
    id: "lane_1",
    speaker: "neighbour",
    place: "village",
    text: "It is a village when two doors face the same mud.",
  },
  {
    id: "well_1",
    speaker: "neighbour",
    place: "village",
    text: "News travels one bucket at a time.",
  },
  {
    id: "notice_1",
    speaker: "notice",
    place: "village",
    text: "CHORES: teeth, bed, hens, kindling. DRAGON: still on the ridge. Fine.",
  },
  {
    id: "wood_1",
    speaker: "gnome",
    place: "woodlot",
    text: "Small logs. The stump has heard every excuse.",
  },
  {
    id: "dragon_1",
    speaker: "dragon",
    place: "ridge",
    text: "You built a lane and called it a village. I am almost impressed.",
  },
  {
    id: "dragon_2",
    speaker: "dragon",
    place: "ridge",
    text: "Come back when the gate has a name. Or don't. I have a ridge.",
  },
  {
    id: "stew_1",
    speaker: "gnome",
    place: "cottage",
    text: "If it sticks, it is rustic. If it burns, it is the ridge's fault.",
  },
  {
    id: "bedtime_1",
    speaker: "gnome",
    place: "cottage",
    text: "Cap on the pillow. The island will still be here. So will the list.",
  },
];

export function quotesFor(place?: string): QuoteLine[] {
  if (!place) return QUOTES;
  return QUOTES.filter((q) => !q.place || q.place === place);
}

export function randomQuote(place?: string): QuoteLine {
  const pool = quotesFor(place);
  return pool[Math.floor(Math.random() * pool.length)] ?? QUOTES[0];
}
