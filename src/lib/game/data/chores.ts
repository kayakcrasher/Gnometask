import type { PlaceId, Task } from "../types";

export const BUILTIN_CHORES: {
  key: string;
  text: string;
  location: PlaceId;
  coins: number;
}[] = [
  { key: "out-of-bed", text: "Get out of bed", location: "cottage", coins: 6 },
  { key: "brush-teeth", text: "Brush your teeth", location: "cottage", coins: 6 },
  { key: "make-bed", text: "Make the bed", location: "cottage", coins: 5 },
  { key: "breakfast", text: "Have a little breakfast", location: "cottage", coins: 5 },
  { key: "water-garden", text: "Water the garden", location: "garden", coins: 7 },
  { key: "chop-kindling", text: "Chop a tree for kindling", location: "woods", coins: 7 },
  { key: "say-prayer", text: "Say a small prayer", location: "cottage", coins: 5 },
  { key: "take-dinghy", text: "Take the dinghy out", location: "dock", coins: 6 },
  { key: "good-morning", text: "Say good morning to the mushrooms", location: "woods", coins: 5 },
  { key: "village-walk", text: "Walk the village path", location: "village", coins: 5 },
  { key: "coil-rope", text: "Coil the dock rope", location: "dock", coins: 6 },
  { key: "mine-lanterns", text: "Check the mine lanterns", location: "mines", coins: 7 },
  { key: "sweep-stones", text: "Sweep the old stones", location: "ruins", coins: 6 },
  { key: "patrol", text: "Patrol the wildlands", location: "wildlands", coins: 8 },
  { key: "dragon-honey", text: "Leave honey for the dragon", location: "wildlands", coins: 6 },
];

export function makeBuiltinTasks(today: string): Task[] {
  return BUILTIN_CHORES.map((c) => ({
    id: `b-${c.key}-${today}`,
    text: c.text,
    done: false,
    builtin: true,
    location: c.location,
    createdOn: today,
    builtinKey: c.key,
  }));
}

export function coinsForTask(task: Task) {
  if (task.builtinKey) {
    const chore = BUILTIN_CHORES.find((c) => c.key === task.builtinKey);
    if (chore) return chore.coins;
  }
  return 5;
}
