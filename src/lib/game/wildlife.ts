import { npcWalkable, clearNpcSegment, type NpcObstacle } from "./npc-brain";
export type AnimalKind =
  | "chicken"
  | "rabbit"
  | "duck"
  | "sheep"
  | "cat"
  | "fox"
  | "deer"
  | "frog"
  | "hedgehog";
export const ANIMAL_TRAITS: Record<
  AnimalKind,
  { radius: number; speed: number; scale: number; line: string }
> = {
  chicken: {
    radius: 12,
    speed: 8,
    scale: 1,
    line: "She inspects your boots, then resumes her very important pecking.",
  },
  rabbit: {
    radius: 30,
    speed: 17,
    scale: 1,
    line: "A nose wiggle, two hops, and a suspicious look at your pockets.",
  },
  duck: {
    radius: 25,
    speed: 8,
    scale: 1,
    line: "A pond captain. Absolutely no passengers today.",
  },
  sheep: {
    radius: 35,
    speed: 9,
    scale: 1,
    line: "A small cloud with hooves. It has found the best patch of grass.",
  },
  cat: {
    radius: 24,
    speed: 10,
    scale: 1,
    line: "The cat blinks slowly. You may consider yourself approved.",
  },
  fox: {
    radius: 42,
    speed: 15,
    scale: 1,
    line: "A russet tail slips between the ferns. Someone has places to be.",
  },
  deer: {
    radius: 50,
    speed: 14,
    scale: 1,
    line: "The deer lifts its ears, listens, and returns to breakfast.",
  },
  frog: {
    radius: 14,
    speed: 11,
    scale: 1,
    line: "One thoughtful croak. A puddle philosopher.",
  },
  hedgehog: {
    radius: 18,
    speed: 6,
    scale: 1,
    line: "A tiny rustle under a coat of autumn needles.",
  },
};
export function wildlifeSafe(
  kind: AnimalKind,
  x: number,
  y: number,
  obstacles: NpcObstacle[] = [],
) {
  return kind === "duck"
    ? Math.hypot(x - 520, y - 190) < 72
    : npcWalkable(x, y, obstacles);
}
export function wildlifeHome(
  kind: AnimalKind,
  x: number,
  y: number,
  obstacles: NpcObstacle[] = [],
) {
  if (wildlifeSafe(kind, x, y, obstacles)) return { x, y };
  for (let r = 12; r <= 200; r += 12)
    for (let i = 0; i < 20; i++) {
      const p = {
        x: x + Math.cos((i * Math.PI) / 10) * r,
        y: y + Math.sin((i * Math.PI) / 10) * r,
      };
      if (wildlifeSafe(kind, p.x, p.y, obstacles)) return p;
    }
  return null;
}
export function wildlifeSegment(
  kind: AnimalKind,
  a: { x: number; y: number },
  b: { x: number; y: number },
  obstacles: NpcObstacle[] = [],
) {
  return kind === "duck"
    ? wildlifeSafe(kind, a.x, a.y) && wildlifeSafe(kind, b.x, b.y)
    : clearNpcSegment(a, b, obstacles);
}
export function wildlifeGoal(
  kind: AnimalKind,
  home: { x: number; y: number },
  current: { x: number; y: number },
  seed: number,
  obstacles: NpcObstacle[] = [],
) {
  const radius = ANIMAL_TRAITS[kind].radius;
  for (let i = 0; i < 12; i++) {
    const angle = seed * 2.399963 + i * 0.73,
      r = radius * (0.35 + ((seed * 13 + i * 7) % 17) / 26),
      p = { x: home.x + Math.cos(angle) * r, y: home.y + Math.sin(angle) * r };
    if (
      wildlifeSafe(kind, p.x, p.y, obstacles) &&
      wildlifeSegment(kind, current, p, obstacles)
    )
      return p;
  }
  return current;
}
