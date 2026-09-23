export const GOODS: { id: string; name: string; price: number }[] = [
  { id: "shell", name: "Shell", price: 2 },
  { id: "cloth", name: "Washed cloth", price: 4 },
  { id: "egg", name: "Egg", price: 3 },
  { id: "milk", name: "Milk", price: 5 },
  { id: "wool", name: "Wool", price: 6 },
];

export const ANIMALS = [
  { id: "cows" as const, name: "Cow", price: 40, cap: 4 },
  { id: "goats" as const, name: "Goat", price: 28, cap: 4 },
  { id: "sheep" as const, name: "Sheep", price: 24, cap: 4 },
];

export const COOP_COST = [0, 30, 55, 80];
export const CALF_PRICE = 18;

export const FAR_ISLES = [
  { id: "reed" as const, name: "Reed Isle", fare: 8, x: 80, y: 80, blurb: "A pasture island. Quiet jetty, long grass." },
  { id: "salt" as const, name: "Saltmarket", fare: 16, x: 2620, y: 160, blurb: "They pay a fifth more for whatever you carried." },
  { id: "holm" as const, name: "Far Holm", fare: 24, x: 2480, y: 1320, blurb: "A lighthouse rock. Nothing here is in a hurry." },
];

export type IsleId = (typeof FAR_ISLES)[number]["id"];

export function goodById(id: string) {
  return GOODS.find((g) => g.id === id) ?? null;
}

/** Interest on a funded expedition. Rare rolls are checked first so they stay rare. */
export function expeditionReturn(stake: number) {
  const roll = Math.random();
  if (roll < 0.001) return { payout: stake * 3, note: "One in a thousand. The expedition brought back 200%." };
  if (roll < 0.003) return { payout: stake * 2, note: "One in five hundred. 100% interest." };
  if (roll < 0.003 + 1 / 30) return { payout: Math.floor(stake * 1.5), note: "A good tide. 50% interest." };
  if (roll < 0.003 + 1 / 30 + 1 / 20) return { payout: 0, note: "The expedition is lost. The stake does not come home." };
  return { payout: Math.floor(stake * 1.25), note: "They came home. 25% interest, as agreed." };
}
