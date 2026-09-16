export type QuestStep = {
  id: string;
  hint: string;
  /** Chore, place, item, or village piece id */
  need: string;
};

export type Quest = {
  id: string;
  name: string;
  blurb: string;
  giver: string;
  steps: QuestStep[];
  reward: { coins: number; xp: { skill: string; amount: number } };
};

export const QUESTS: Quest[] = [
  {
    id: "morning_person",
    name: "Morning person",
    blurb: "Get out of bed, brush your teeth, make the bed. In that order.",
    giver: "board",
    steps: [
      { id: "q1a", hint: "Feet on the floor.", need: "get_out_of_bed" },
      { id: "q1b", hint: "Two minutes at the basin.", need: "brush_teeth" },
      { id: "q1c", hint: "Quilt straight.", need: "make_bed" },
    ],
    reward: { coins: 8, xp: { skill: "prayer", amount: 20 } },
  },
  {
    id: "open_the_lane",
    name: "Open the lane",
    blurb: "Put down the dirt lane and both shops. Then it is The Village.",
    giver: "pip",
    steps: [
      { id: "q2a", hint: "Two ruts from the stoop.", need: "dirt_lane" },
      { id: "q2b", hint: "Hats in one window.", need: "hat_shop" },
      { id: "q2c", hint: "House bits in the other.", need: "house_shop" },
    ],
    reward: { coins: 25, xp: { skill: "barter", amount: 30 } },
  },
  {
    id: "green_thumb",
    name: "Green thumb",
    blurb: "Water the garden and feed the hens before noon.",
    giver: "noll",
    steps: [
      { id: "q3a", hint: "Don't drown the thyme.", need: "water_garden" },
      { id: "q3b", hint: "Scatter grain. Count heads.", need: "feed_chickens" },
    ],
    reward: { coins: 12, xp: { skill: "farming", amount: 24 } },
  },
  {
    id: "kindling_day",
    name: "Kindling day",
    blurb: "Chop kindling and put a wood shed on the lane.",
    giver: "edge",
    steps: [
      { id: "q4a", hint: "Stump by the lane.", need: "chop_kindling" },
      { id: "q4b", hint: "Kindling off the stoop.", need: "wood_shed" },
    ],
    reward: { coins: 18, xp: { skill: "woodcutting", amount: 24 } },
  },
  {
    id: "name_the_gate",
    name: "Name the gate",
    blurb: "Grow the lane until the village gate can go up. Then visit Ash.",
    giver: "ash",
    steps: [
      { id: "q5a", hint: "Cobbles, not mud.", need: "cobble_lane" },
      { id: "q5b", hint: "A beam with a name.", need: "village_gate" },
    ],
    reward: { coins: 80, xp: { skill: "barter", amount: 50 } },
  },
];

export function questById(id: string): Quest | undefined {
  return QUESTS.find((q) => q.id === id);
}
