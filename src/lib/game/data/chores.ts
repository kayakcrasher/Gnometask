export type ChoreId =
  | "get_out_of_bed"
  | "brush_teeth"
  | "wash_face"
  | "make_bed"
  | "breakfast"
  | "water_garden"
  | "feed_chickens"
  | "chop_kindling"
  | "sweep_stoop"
  | "visit_shop"
  | "say_hello"
  | "evening_stew"
  | "wash_up"
  | "back_to_bed";

export type Chore = {
  id: ChoreId;
  title: string;
  hint: string;
  /** Where the player should go. Matches places.ts ids when you add that file. */
  place: string;
  /** Minutes of in-game day this unlocks (0–24). */
  hour: number;
  xp: { skill: string; amount: number };
  reward?: { item: string; qty: number };
};

export const CHORES: Chore[] = [
  {
    id: "get_out_of_bed",
    title: "Get out of bed",
    hint: "The cottage loft. Feet on the floor before the kettle boils.",
    place: "cottage",
    hour: 6,
    xp: { skill: "prayer", amount: 5 },
  },
  {
    id: "brush_teeth",
    title: "Brush your teeth",
    hint: "Basin by the window. Two minutes. No excuses, even for gnomes.",
    place: "cottage",
    hour: 6.2,
    xp: { skill: "prayer", amount: 8 },
  },
  {
    id: "wash_face",
    title: "Wash your face",
    hint: "Cold well water. Wakes the beard.",
    place: "cottage",
    hour: 6.4,
    xp: { skill: "prayer", amount: 5 },
  },
  {
    id: "make_bed",
    title: "Make the bed",
    hint: "Quilt straight, pillow fluffed, cap on the hook.",
    place: "cottage",
    hour: 6.6,
    xp: { skill: "prayer", amount: 6 },
  },
  {
    id: "breakfast",
    title: "Eat breakfast",
    hint: "Honey cake and tea at the little table.",
    place: "cottage",
    hour: 7,
    xp: { skill: "barter", amount: 4 },
    reward: { item: "honey_cake", qty: 1 },
  },
  {
    id: "water_garden",
    title: "Water the garden",
    hint: "The bigger beds behind the cottage. Don't drown the thyme.",
    place: "garden",
    hour: 8,
    xp: { skill: "farming", amount: 12 },
  },
  {
    id: "feed_chickens",
    title: "Feed the chickens",
    hint: "Scatter grain near the coop. Count heads.",
    place: "garden",
    hour: 8.5,
    xp: { skill: "farming", amount: 8 },
  },
  {
    id: "chop_kindling",
    title: "Chop kindling",
    hint: "Stump by the lane. One hatchet, small logs.",
    place: "woodlot",
    hour: 9,
    xp: { skill: "woodcutting", amount: 15 },
  },
  {
    id: "sweep_stoop",
    title: "Sweep the stoop",
    hint: "Leaves pile up where the village starts.",
    place: "village",
    hour: 10,
    xp: { skill: "prayer", amount: 6 },
  },
  {
    id: "visit_shop",
    title: "Visit the shops",
    hint: "Hats in one window, house bits in the other.",
    place: "shops",
    hour: 11,
    xp: { skill: "barter", amount: 10 },
  },
  {
    id: "say_hello",
    title: "Say hello to a neighbour",
    hint: "Anyone on the lane counts.",
    place: "village",
    hour: 12,
    xp: { skill: "barter", amount: 6 },
  },
  {
    id: "evening_stew",
    title: "Cook evening stew",
    hint: "Pot over the cottage fire. Don't burn it.",
    place: "cottage",
    hour: 18,
    xp: { skill: "farming", amount: 8 },
    reward: { item: "stew", qty: 1 },
  },
  {
    id: "wash_up",
    title: "Wash up",
    hint: "Basin again. Teeth, face, hands.",
    place: "cottage",
    hour: 20,
    xp: { skill: "prayer", amount: 8 },
  },
  {
    id: "back_to_bed",
    title: "Back to bed",
    hint: "Cap on the pillow. Tomorrow's chores reset at dawn.",
    place: "cottage",
    hour: 21,
    xp: { skill: "prayer", amount: 5 },
  },
];

export function choresForHour(hour: number): Chore[] {
  return CHORES.filter((c) => Math.abs(c.hour - hour) < 0.6);
}

export function choreById(id: ChoreId): Chore | undefined {
  return CHORES.find((c) => c.id === id);
}
