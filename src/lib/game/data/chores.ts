import type { PlaceId, Task } from "../types";

export const BUILTIN_CHORES: {
  key: string;
  text: string;
  location: PlaceId;
  coins: number;
}[] = [
  { key: "stack-timber", text: "Stack timber for the walls", location: "woods", coins: 7 },
  { key: "chop-stakes", text: "Chop stakes for the palisade", location: "woods", coins: 7 },
  { key: "water-beds", text: "Water the garden beds", location: "garden", coins: 6 },
  { key: "coil-watch", text: "Coil the dock watch-rope", location: "dock", coins: 6 },
  { key: "hall-report", text: "Report to Town Hall", location: "village", coins: 6 },
  { key: "inspect-roofs", text: "Inspect village roofs", location: "village", coins: 6 },
  { key: "patrol-ridge", text: "Patrol the wildlands", location: "wildlands", coins: 8 },
  { key: "ridge-honey", text: "Leave honey on the ridge", location: "wildlands", coins: 6 },
  { key: "mine-lanterns", text: "Check the mine lanterns", location: "mines", coins: 7 },
  { key: "bless-gate", text: "Bless the gate", location: "cottage", coins: 5 },
  { key: "kettle-watch", text: "Keep the cottage kettle on", location: "cottage", coins: 5 },
  { key: "train-guard", text: "Drill with the Guardsgnome", location: "haven", coins: 7 },
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
