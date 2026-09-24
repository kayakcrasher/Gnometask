export type FolkShift = "dawn" | "day" | "dusk";

export type Settler = {
  name: string;
  hat: string;
  slotId: string;
  arrived: number;
  purse: number;
  weapon: string | null;
  stall: string | null;
  shift: FolkShift | null;
};

const STALLS = ["nets", "salt", "bread", "hats", "rope", "oil", "pots", "wool"];
const WEAPONS = ["wood sword", "hatchet", "short bow"];
const SHIFTS: FolkShift[] = ["dawn", "day", "dusk"];

export const WATCH_POSTS: { id: string; name: string; shift: FolkShift; atk: number }[] = [
  { id: "greg", name: "Watcher Greg", shift: "dawn", atk: 10 },
  { id: "brine", name: "Brine", shift: "day", atk: 6 },
  { id: "stoic", name: "The Stoic Gnome", shift: "dusk", atk: 5 },
];

export function tideShift(days: number): FolkShift {
  return SHIFTS[((days % 3) + 3) % 3]!;
}

export function settlerRank(n: Settler, days: number) {
  const age = Math.max(0, days - n.arrived);
  if (n.weapon) return "watch" as const;
  if (n.stall || age >= 2) return "trade" as const;
  if (age >= 1) return "house" as const;
  return "plot" as const;
}

export function economyOf(src: {
  coins: number;
  goods: Record<string, number>;
  fishBag: Record<string, number>;
  herd: { cows: number; goats: number; sheep: number; calves: number };
}) {
  const goods = Object.values(src.goods).reduce((a, b) => a + b, 0);
  const fish = Object.values(src.fishBag).reduce((a, b) => a + b, 0);
  const beasts = src.herd.cows + src.herd.goats + src.herd.sheep + src.herd.calves;
  return src.coins + goods * 3 + fish * 2 + beasts * 8;
}

export function armedSettlers(settlers: Settler[]) {
  return settlers.filter((n) => n.weapon).length;
}

/** A hall and a real watch. Until then the goblins do not stop. */
export function hollowLed(hall: number, settlers: Settler[]) {
  return hall >= 3 && armedSettlers(settlers) + WATCH_POSTS.length >= 6;
}

export function watchNames(days: number, settlers: Settler[]) {
  const shift = tideShift(days);
  const names = WATCH_POSTS.filter((p) => p.shift === shift).map((p) => p.name);
  for (const n of settlers) {
    if (n.shift === shift && n.weapon) names.push(n.name);
  }
  return names;
}

export function pickStriker(days: number, settlers: Settler[]) {
  const shift = tideShift(days);
  const pool: { name: string; atk: number }[] = [{ name: "Ol Pappy", atk: 3 }];
  for (const post of WATCH_POSTS) {
    pool.push({ name: post.name, atk: post.shift === shift ? post.atk : 2 });
  }
  settlers.forEach((n) => {
    if (!n.weapon) return;
    pool.push({ name: n.name, atk: n.shift === shift ? 5 : 2 });
  });
  return pool[Math.floor(Math.random() * pool.length)]!;
}

export function folkLine(n: Settler, days: number) {
  const rank = settlerRank(n, days);
  if (rank === "plot") return `${n.name} paid for this plot and is pacing the corners. The house is next. Private ground, already.`;
  if (rank === "house") return `${n.name}'s roof is up. They nod, and not much else yet.`;
  if (rank === "trade") {
    return `${n.name} runs ${n.stall ?? "a stall"} from the ground floor and sleeps above it. Purse ${n.purse}. The Lane Co-op splits what the island earns.`;
  }
  return `${n.name} keeps a ${n.weapon} by the door and volunteered the ${n.shift} watch. Purse ${n.purse}. The army is one gnome longer.`;
}

export function heartLine(id: string, days: number, settlers: Settler[], hall: number) {
  const shift = tideShift(days);
  const posted = watchNames(days, settlers);
  const led = hollowLed(hall, settlers);
  if (id === "pappy") {
    return led
      ? `The ${shift} watch can hold. A leader in the hall, and the boat-folk have a capital worth staying for.`
      : "They have heart, and they keep an eye on the water. Until this hollow has a strong leader, the goblins will keep coming.";
  }
  const post = WATCH_POSTS.find((p) => p.id === id);
  if (!post) return null;
  const who = posted.length ? posted.join(", ") : post.name;
  if (post.shift === shift) return `${post.name} has the ${shift} watch. Posted: ${who}.`;
  return `${post.name} volunteered the ${post.shift} shift. This tide is ${shift}. ${who} are up.`;
}

type Placed = { id: string; catalogId: string; slotId: string };

export function growFolk<T extends Placed>(
  save: {
    daysPlayed: number;
    coins: number;
    goods: Record<string, number>;
    fishBag: Record<string, number>;
    herd: { cows: number; goats: number; sheep: number; calves: number };
    settlers: Settler[];
    placed: T[];
  },
  pay: boolean,
): { settlers: Settler[]; placed: T[]; wage: number } {
  let placed = save.placed;
  const purseCut = Math.max(1, Math.round(economyOf(save) / 40));
  let wage = 0;
  const settlers = save.settlers.map((n, i) => {
    const age = Math.max(0, save.daysPlayed - n.arrived);
    const next: Settler = { ...n };
    if (age >= 1 && !placed.some((p) => p.id === `ship-${n.name}`)) {
      placed = [...placed, { id: `ship-${n.name}`, catalogId: "village-cottage", slotId: n.slotId } as T];
    }
    if (age >= 2 && !next.stall) next.stall = STALLS[i % STALLS.length]!;
    if (age >= 2 && pay) {
      next.purse += purseCut;
      wage += 1;
    }
    if (age >= 3 && pay && next.purse >= 12 && i % 2 === 0) {
      next.purse -= 4;
      wage += 4;
    }
    if (age >= 4 && !next.weapon && next.purse >= 8) {
      next.weapon = WEAPONS[i % WEAPONS.length]!;
      next.shift = SHIFTS[i % SHIFTS.length]!;
      next.purse -= 8;
    }
    return next;
  });
  const trading = settlers.filter((n) => n.stall).length;
  if (pay && trading >= 3) wage += 3;
  if (pay) wage += 8;
  return { settlers, placed, wage };
}
