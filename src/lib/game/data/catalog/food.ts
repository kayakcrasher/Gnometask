export type FoodKind = "breakfast" | "snack" | "supper" | "treat";

export type Food = {
  id: string;
  name: string;
  blurb: string;
  kind: FoodKind;
  price: number;
  /** How much a gnome recovers when eaten */
  fill: number;
  /** Optional farming / barter xp */
  xp?: { skill: string; amount: number };
};

export const FOOD: Food[] = [
  {
    id: "honey_cake",
    name: "Honey cake",
    blurb: "Breakfast if you baked. Bribe if you didn't.",
    kind: "breakfast",
    price: 8,
    fill: 4,
    xp: { skill: "barter", amount: 2 },
  },
  {
    id: "tea",
    name: "Kettle tea",
    blurb: "Hot, brown, slightly leafy. Does the morning.",
    kind: "breakfast",
    price: 2,
    fill: 1,
  },
  {
    id: "porridge",
    name: "Porridge",
    blurb: "The honest get-out-of-bed food.",
    kind: "breakfast",
    price: 4,
    fill: 3,
  },
  {
    id: "apple",
    name: "Apple",
    blurb: "From the whip in the garden, if it ever grew up.",
    kind: "snack",
    price: 3,
    fill: 2,
    xp: { skill: "farming", amount: 1 },
  },
  {
    id: "berries",
    name: "Berries",
    blurb: "Hat-staining. Best eaten over the trough.",
    kind: "snack",
    price: 3,
    fill: 2,
  },
  {
    id: "egg",
    name: "Egg",
    blurb: "The hens' opinion of how well you fed them.",
    kind: "snack",
    price: 4,
    fill: 2,
  },
  {
    id: "pie",
    name: "Garden pie",
    blurb: "Carrot, onion, optimism.",
    kind: "supper",
    price: 12,
    fill: 6,
    xp: { skill: "farming", amount: 3 },
  },
  {
    id: "stew",
    name: "Evening stew",
    blurb: "The 18:00 chore. Burns if you wander to the ridge.",
    kind: "supper",
    price: 10,
    fill: 7,
  },
  {
    id: "cabbage_soup",
    name: "Cabbage soup",
    blurb: "Fills the cottage. Fills you. Order matters.",
    kind: "supper",
    price: 7,
    fill: 5,
  },
  {
    id: "honey_drop",
    name: "Honey drop",
    blurb: "One sticky
