/** Town gnomes who spend their own purses. Nineteen of twenty are decent. The last came off a cruise ship. */

export type CivicTown = "capitol" | "tideham" | "greenlane" | "haven" | "sunstep";

export type CivicGnome = {
  id: string;
  name: string;
  town: CivicTown;
  job: string;
  hat: string;
  coat: string;
  good: boolean;
  purse: number;
  family: number;
  moonshine: number;
  x: number;
  y: number;
  line: string;
  departsAt?: number;
  /** Day this gnome fainted on a raid. Half HP, and grumpy, until the next rollover. */
  fainted?: number;
  archetype?: string;
};

export type CivicPlot = {
  id: string;
  town: CivicTown;
  x: number;
  y: number;
  shares: string[];
  lantern: boolean;
  stories: number;
  owner: string | null;
  rental: boolean;
  trim: string[];
};

export type CivicState = {
  gnomes: CivicGnome[];
  plots: CivicPlot[];
  word: string;
  beat: number;
  news: string;
  jarsSold: number;
  hearing: CivicTown;
  caseStage: 0 | 1 | 2 | 3;
  dock: boolean;
  pubs: PubBook[];
  mates: [string, string][];
  pint: { a: string; b: string; town: CivicTown } | null;
  party: { town: CivicTown; host: string; left: number } | null;
  atPub: CivicTown | null;
};

export type PubBook = {
  town: CivicTown;
  name: string;
  owner: string;
  bank: number;
  x: number;
  y: number;
  hat: string;
  coat: string;
};

export const TOWN_LABEL: Record<CivicTown, string> = {
  capitol: "Port Victoria",
  tideham: "Tideham",
  greenlane: "Greenlane",
  haven: "Haven",
  sunstep: "Sunstep",
};

export const COURTS: { town: CivicTown; x: number; y: number; name: string }[] = [
  { town: "capitol", x: 560, y: 250, name: "Supreme Court" },
  { town: "tideham", x: 360, y: 900, name: "Tideham Court" },
  { town: "greenlane", x: 1560, y: 960, name: "Greenlane Court" },
  { town: "haven", x: 1980, y: 880, name: "Haven Court" },
  { town: "sunstep", x: 3280, y: 620, name: "Sunstep Court" },
];

export const SUNSTEP_DOCK = { x: 3620, y: 760 };

export const BEERS = [
  { id: "mild", name: "Oldie Mild", price: 3, blurb: "Soft, brown, and older than the argument." },
  { id: "stout", name: "Nun's Stout", price: 4, blurb: "Dark as a gown. Puts a little heart back." },
  { id: "lager", name: "Sunstep Lager", price: 5, blurb: "Bright, cold, and slightly too proud." },
] as const;

export const PUBS: PubBook[] = [
  { town: "capitol", name: "Ye Golden Oldie", owner: "Mab", bank: 5400, x: 470, y: 620, hat: "hat-flower", coat: "#6a3d58" },
  { town: "tideham", name: "The Salt Nun", owner: "Kelp", bank: 5600, x: 160, y: 900, hat: "hat-straw", coat: "#3d5a6a" },
  { town: "greenlane", name: "The Crooked Pint", owner: "Wren", bank: 5100, x: 1500, y: 1080, hat: "hat-moss", coat: "#35543f" },
  { town: "haven", name: "The Lantern Eel", owner: "Pippa", bank: 6200, x: 1900, y: 980, hat: "hat-berry", coat: "#a35a42" },
  { town: "sunstep", name: "The Gilded Cactus", owner: "Rio", bank: 7000, x: 3180, y: 760, hat: "hat-night", coat: "#c4a574" },
];

const MATES: [string, string][] = [
  ["lark", "hana"],
  ["otto", "hob"],
  ["pebble", "nona"],
  ["bram", "ives"],
  ["fenna", "jory"],
  ["goldie", "reed"],
];

const PARTY_HOSTS = ["Pie & Tide", "Moss Hat Co", "Oar & Yard", "Keen Edge", "Hull & Keel"];
const TRIM = ["shutters", "awning", "bench", "vane", "boxes"];

const WORDS = ["keel", "hearth", "tide", "deed", "lantern", "honest", "quarter", "watch", "split", "cruise", "tax", "story"];

const ANCHORS: Record<CivicTown, { x: number; y: number }> = {
  capitol: { x: 340, y: 680 },
  tideham: { x: 250, y: 1040 },
  greenlane: { x: 1320, y: 1120 },
  haven: { x: 1680, y: 1060 },
  sunstep: { x: 3000, y: 880 },
};

const SHARE = 12;
const HOUSE = 14;
const STORY = 8;
const LAMP = 4;

// --- Newcomers -----------------------------------------------------------

/** Beats between cruise ships. With 3 civic steps per 9-sec tick, ~12 minutes. */
export const CRUISE_EVERY = 240;
/** Beats between individual newcomer actions. With batch=3, ~21 seconds. */
export const NEWCOMER_ACT_EVERY = 7;
/** Max visitors present at once. */
export const CRUISE_CAP = 3;

export const NEWCOMER_KINDS = [
  "vacationer",
  "middle",
  "vagrant",
  "hopeful",
  "builder",
  "criminal",
] as const;
export type NewcomerKind = (typeof NEWCOMER_KINDS)[number];

/** How long a visitor stays, in beats. ~3 sec per beat with batch=3. */
export const LIFETIME: Record<NewcomerKind, number> = {
  vacationer: 400,
  middle: 300,
  vagrant: 150,
  hopeful: 500,
  builder: 200,
  criminal: 350,
};

/** Which town they land in. Tourists to Sunstep, workers to the others. */
export const NEWCOMER_TOWN: Record<NewcomerKind, CivicTown> = {
  vacationer: "sunstep",
  middle: "capitol",
  vagrant: "tideham",
  hopeful: "greenlane",
  builder: "haven",
  criminal: "tideham",
};

/** Names cycle per kind, so cruise #1 and cruise #5 don't both send "Gorse." */
export const NEWCOMER_NAMES: Record<NewcomerKind, string[]> = {
  vacationer: ["Tansy", "Bly", "Marlow", "Cricket"],
  middle: ["Aldo", "Vere", "Hollis", "Prue"],
  vagrant: ["Gorse", "Tuck", "Bindle", "Wisp"],
  hopeful: ["Cora", "Felix", "Wren", "Osier"],
  builder: ["Rook", "Handy", "Tore", "Nib"],
  criminal: ["Vance", "Ratty", "Kestrel", "Bones"],
};

let newcomerCounter = 0;

// --- Roster --------------------------------------------------------------

const ROSTER: Omit<CivicGnome, "x" | "y" | "line" | "moonshine">[] = [
  { id: "lark", name: "Lark", town: "capitol", job: "mason", hat: "hat-straw", coat: "#8a6238", good: true, purse: 42, family: 1 },
  { id: "hana", name: "Hana", town: "capitol", job: "clerk", hat: "hat-flower", coat: "#6a3d58", good: true, purse: 40, family: 1 },
  { id: "otto", name: "Otto", town: "capitol", job: "lamplighter", hat: "hat-night", coat: "#2f3d34", good: true, purse: 36, family: 1 },
  { id: "sable", name: "Sable", town: "capitol", job: "baker", hat: "hat-berry", coat: "#a35a42", good: true, purse: 28, family: 2 },
  { id: "hob", name: "Hob", town: "capitol", job: "carpenter", hat: "hat-guard", coat: "#5b4230", good: true, purse: 38, family: 1 },
  { id: "pebble", name: "Pebble", town: "tideham", job: "fisher", hat: "hat-straw", coat: "#3d5a6a", good: true, purse: 34, family: 1 },
  { id: "nona", name: "Nona", town: "tideham", job: "netter", hat: "hat-moss", coat: "#35543f", good: true, purse: 30, family: 1 },
  { id: "alma", name: "Alma", town: "tideham", job: "lamplighter", hat: "hat-flower", coat: "#6a5344", good: true, purse: 26, family: 1 },
  { id: "bram", name: "Bram", town: "greenlane", job: "herder", hat: "hat-straw", coat: "#6b5340", good: true, purse: 40, family: 1 },
  { id: "ives", name: "Ives", town: "greenlane", job: "carpenter", hat: "hat-guard", coat: "#8a6238", good: true, purse: 36, family: 1 },
  { id: "cress", name: "Cress", town: "greenlane", job: "gardener", hat: "hat-moss", coat: "#4c6b47", good: true, purse: 22, family: 1 },
  { id: "della", name: "Della", town: "greenlane", job: "teacher", hat: "hat-flower", coat: "#6a3d58", good: true, purse: 24, family: 2 },
  { id: "fenna", name: "Fenna", town: "haven", job: "teacher", hat: "hat-berry", coat: "#8a7a68", good: true, purse: 32, family: 1 },
  { id: "jory", name: "Jory", town: "haven", job: "smith", hat: "hat-night", coat: "#3e2e20", good: true, purse: 44, family: 1 },
  { id: "mossie", name: "Mossie", town: "haven", job: "potter", hat: "hat-moss", coat: "#5c7a54", good: true, purse: 20, family: 1 },
  { id: "vetch", name: "Vetch", town: "sunstep", job: "clerk", hat: "hat-straw", coat: "#c4a574", good: true, purse: 30, family: 1 },
  { id: "goldie", name: "Goldie", town: "sunstep", job: "croupier", hat: "hat-flower", coat: "#a8433b", good: true, purse: 48, family: 1 },
  { id: "reed", name: "Reed", town: "sunstep", job: "mason", hat: "hat-guard", coat: "#8a5a32", good: true, purse: 34, family: 1 },
  { id: "nila", name: "Nila", town: "sunstep", job: "porter", hat: "hat-night", coat: "#2f4a3a", good: true, purse: 18, family: 1 },
  { id: "slick", name: "Slick", town: "sunstep", job: "still-runner", hat: "hat-night", coat: "#1c2430", good: false, purse: 12, family: 1 },
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0;
  return h;
}

function wordFor(days: number, beat: number) {
  return WORDS[Math.abs(days + beat) % WORDS.length]!;
}

function makePlots(): CivicPlot[] {
  const out: CivicPlot[] = [];
  (Object.keys(ANCHORS) as CivicTown[]).forEach((town) => {
    const a = ANCHORS[town]!;
    for (let i = 0; i < 6; i++) {
      out.push({
        id: `${town}-${i}`,
        town,
        x: a.x + (i % 3) * 52,
        y: a.y + Math.floor(i / 3) * 48,
        shares: [],
        lantern: false,
        stories: 0,
        owner: null,
        rental: false,
        trim: [],
      });
    }
  });
  return out;
}

function placeGnome(g: CivicGnome, plots: CivicPlot[]) {
  const home = plots.find((p) => p.owner === g.id && !p.rental) ?? plots.find((p) => p.shares.includes(g.id));
  if (home) {
    const seat = Math.max(0, home.shares.indexOf(g.id));
    g.x = home.x - 16 + (seat % 4) * 10;
    g.y = home.y + 16;
    return;
  }
  const a = ANCHORS[g.town]!;
  const i = hash(g.id) % 5;
  g.x = a.x + (i - 2) * 16;
  g.y = a.y - 28;
}

function compose(actor: CivicGnome, gnomes: CivicGnome[], plots: CivicPlot[], word: string) {
  if (actor.archetype) {
    return `${actor.name}: Just off the cruise ship. ${TOWN_LABEL[actor.town]} for a spell.`;
  }
  const others = gnomes.filter((g) => g.id !== actor.id);
  const pal = others[hash(actor.name) % others.length]!;
  const gossip = others[hash(actor.name + word) % others.length]!;
  const plot = plots.find((p) => p.shares.includes(actor.id));
  const mates = (plot?.shares ?? [])
    .map((id) => gnomes.find((g) => g.id === id)?.name)
    .filter((n): n is string => Boolean(n && n !== actor.name));
  if (!actor.good) {
    return `${actor.name}: Fresh off the cruise. Word of the day is ${word}. ${pal.name}, a quiet jar? ${gossip.name} already sniffed it.`;
  }
  const business = `${actor.job} work is steady. ${pal.name} runs ${pal.job} in ${TOWN_LABEL[pal.town]}.`;
  const split = mates.length
    ? `Plot's split with ${mates.slice(0, 3).join(", ")}. Four gnomes is the law.`
    : `${gossip.name} is saving for a share. I told them the timber is not free.`;
  const family =
    gossip.family > 1
      ? `${gossip.name}'s family grew. They will want another story on the house.`
      : `${gossip.name} is still a household of one. No gossip in that, yet.`;
  const lines = [
    `${actor.name}: ${word} is the word. ${pal.name} says it means business in ${TOWN_LABEL[pal.town]}.`,
    `${actor.name}: ${business}`,
    `${actor.name}: ${split}`,
    `${actor.name}: ${family}`,
  ];
  return lines[hash(actor.id + word) % lines.length]!;
}

function ownedHomes(plots: CivicPlot[], id: string) {
  return plots.filter((p) => p.owner === id && !p.rental);
}

function tryCivic(actor: CivicGnome, gnomes: CivicGnome[], plots: CivicPlot[]): string | null {
  const homes = ownedHomes(plots, actor.id);
  const rental = plots.find((p) => p.owner === actor.id && p.rental);
  const sharesHeld = plots.filter((p) => p.shares.includes(actor.id)).length;
  const town = actor.town;
  const label = TOWN_LABEL[town];

  const short = homes.find((p) => p.stories > 0 && p.stories < Math.min(3, actor.family));
  if (short && actor.purse >= STORY) {
    actor.purse -= STORY;
    short.stories += 1;
    return `${actor.name} added a story in ${TOWN_LABEL[short.town]}. The new family needed the room.`;
  }

  const mine = plots.find((p) => p.shares.includes(actor.id) && p.stories === 0);
  if (mine && homes.length < 2 && mine.shares.length >= 2 && actor.purse >= HOUSE) {
    actor.purse -= HOUSE;
    mine.stories = 1;
    mine.owner = actor.id;
    mine.rental = false;
    return `${mine.shares.length} gnomes split a plot in ${TOWN_LABEL[mine.town]}. ${actor.name} paid for the timber.`;
  }

  if (homes.length >= 2 && !rental && actor.purse >= SHARE + HOUSE) {
    const lot = plots.find((p) => p.stories === 0 && p.shares.length === 0);
    if (lot) {
      actor.purse -= SHARE + HOUSE;
      lot.shares.push(actor.id);
      lot.stories = 1;
      lot.owner = actor.id;
      lot.rental = true;
      return `${actor.name} built a rental in ${TOWN_LABEL[lot.town]}. Long-stay vacationers can take it. Plot and timber, both paid.`;
    }
  }

  if (sharesHeld < 3 && actor.purse >= SHARE && homes.length < 2) {
    const seat = plots.find(
      (p) => p.town === town && p.shares.length > 0 && p.shares.length < 4 && !p.shares.includes(actor.id),
    );
    if (seat) {
      actor.purse -= SHARE;
      seat.shares.push(actor.id);
      if (seat.stories === 0 && seat.shares.length >= 2 && actor.purse >= HOUSE) {
        actor.purse -= HOUSE;
        seat.stories = 1;
        seat.owner = actor.id;
        seat.rental = false;
        return `${seat.shares.length} gnomes split a plot in ${label}. ${actor.name} paid for the timber.`;
      }
      return `${actor.name} took a share in ${label}. ${seat.shares.length} of 4 names on the plot.`;
    }
  }

  if (homes.length < 2 && sharesHeld < 3 && actor.purse >= SHARE) {
    const fresh = plots.find((p) => p.town === town && p.shares.length === 0 && p.stories === 0);
    if (fresh) {
      actor.purse -= SHARE;
      fresh.shares.push(actor.id);
      return `${actor.name} opened a plot in ${label}. Three seats left. The timber waits on a partner.`;
    }
  }

  const dark = plots.find((p) => p.shares.includes(actor.id) && !p.lantern && p.stories > 0);
  if (dark && actor.purse >= LAMP) {
    actor.purse -= LAMP;
    dark.lantern = true;
    return `${actor.name} set a lantern on the shared plot in ${TOWN_LABEL[dark.town]}.`;
  }

  void gnomes;
  return null;
}

function tryStill(actor: CivicGnome, gnomes: CivicGnome[], beat: number): { news: string | null; sold: boolean } {
  const roll = hash(`${beat}:${actor.id}`) % 100;
  if (actor.moonshine > 0) {
    const buyers = gnomes.filter((g) => g.good && g.id !== actor.id && g.purse >= 5);
    const buyer = buyers[roll % Math.max(1, buyers.length)];
    if (buyer && roll >= 35) {
      buyer.purse -= 4;
      actor.purse += 4;
      actor.moonshine -= 1;
      return { news: `${actor.name} sold a jar to ${buyer.name}. ${buyer.name} will call it tea if anyone asks.`, sold: true };
    }
    if (buyer) return { news: `${buyer.name} told ${actor.name} to take the still back to the cruise ship.`, sold: false };
  }
  if (actor.moonshine < 3 && actor.purse >= 2) {
    actor.purse -= 2;
    actor.moonshine += 1;
    return { news: `${actor.name} came off a cruise ship and fired the still. Moonshine, and not much shame.`, sold: false };
  }
  return { news: null, sold: false };
}

// --- Newcomer behaviour --------------------------------------------------

/**
 * Six kinds, six tiny branches. Each returns a line for the ticker, or null.
 * They spend their own purses. They do not take the roster's turn.
 */
function tryNewcomer(g: CivicGnome, state: CivicState, beat: number): string | null {
  switch (g.archetype) {
    case "vacationer": {
      const pub = state.pubs.find((p) => p.town === g.town);
      if (pub && g.purse >= 5) {
        g.purse -= 5;
        pub.bank += 5;
        return `${g.name} took a pint at ${pub.name}. On holiday, and spending like it.`;
      }
      return `${g.name} is on holiday. Says the tide is prettier here than on the boat.`;
    }
    case "middle": {
      const lot = state.plots.find(
        (p) => p.town === g.town && p.shares.length > 0 && p.shares.length < 4 && !p.shares.includes(g.id),
      );
      if (lot && g.purse >= SHARE) {
        g.purse -= SHARE;
        lot.shares.push(g.id);
        return `${g.name} put money down on a plot. Four names to a roof is the law.`;
      }
      return `${g.name} is looking at plots. Says the shore is worth the walk.`;
    }
    case "vagrant": {
      const pub = state.pubs.find((p) => p.town === g.town);
      if (pub && g.purse >= 3) {
        g.purse -= 3;
        pub.bank += 3;
        return `${g.name} nursed a mild at ${pub.name}. Paid in small coins.`;
      }
      return `${g.name} is sleeping by the harbour. Says the wind is warm enough.`;
    }
    case "hopeful": {
      const ownsHouse = state.plots.some((p) => p.owner === g.id);
      if (ownsHouse && g.departsAt && g.departsAt - beat < 60) {
        g.departsAt = undefined;
        return `${g.name} signed the lease. Stays in ${TOWN_LABEL[g.town]}.`;
      }
      return `${g.name} is saving. Asked what a company share costs.`;
    }
    case "builder": {
      const lot = state.plots.find(
        (p) => p.town === g.town && p.stories > 0 && p.stories < 3 && (p.trim?.length ?? 0) < 3,
      );
      if (lot && g.purse >= 8) {
        g.purse -= 8;
        if (!lot.trim) lot.trim = [];
        if (!lot.trim.includes("bench")) lot.trim.push("bench");
        return `${g.name} fitted a bench on the corner. Contract paid, timber cut.`;
      }
      return `${g.name} is on a contract. Two hands, one week, then the boat.`;
    }
    case "criminal": {
      const still = state.gnomes.find((n) => !n.good);
      if (still) {
        still.moonshine += 1;
        g.purse += 3;
        return `${g.name} met ${still.name} in the alley. A jar changed hands.`;
      }
      return `${g.name} came off the cruise with a coat too heavy for the weather.`;
    }
    default:
      return null;
  }
}

/** Called when a cruise ship docks. Kind rotates through the six, in order. */
function spawnCruiseNewcomer(beat: number): CivicGnome {
  const slot = Math.floor(beat / CRUISE_EVERY) % NEWCOMER_KINDS.length;
  const kind = NEWCOMER_KINDS[slot]!;
  const names = NEWCOMER_NAMES[kind];
  newcomerCounter += 1;
  return {
    id: `visitor-${kind}-${newcomerCounter}`,
    name: names[newcomerCounter % names.length]!,
    town: NEWCOMER_TOWN[kind],
    job: kind,
    hat: "hat-straw",
    coat: "#8a7a68",
    good: kind !== "criminal",
    purse: kind === "hopeful" ? 100 : 20 + Math.floor(Math.random() * 20),
    family: 1,
    moonshine: 0,
    x: 0,
    y: 0,
    line: "",
    departsAt: beat + LIFETIME[kind],
    archetype: kind,
  };
}

// --- The civic beat ------------------------------------------------------

export function stepCivic(state: CivicState, days: number): CivicState {
  const gnomes = state.gnomes.map((g) => ({ ...g }));
  const plots = state.plots.map((p) => ({ ...p, shares: [...p.shares], trim: [...(p.trim ?? [])] }));
  const beat = state.beat + 1;
  const regulars = gnomes.filter((g) => !g.archetype);
  const actor = regulars[beat % regulars.length];
  if (!actor) return state;
  const word = wordFor(days, beat);
  let news: string | null = null;
  let jarsSold = state.jarsSold;
  if (actor.good) actor.purse += 6 + actor.family;
  else actor.purse += 2;

  if (!actor.good) {
    const still = tryStill(actor, gnomes, beat);
    news = still.news;
    if (still.sold) jarsSold += 1;
  } else {
    news = tryCivic(actor, gnomes, plots);
    const hasRoof = plots.some((p) => p.owner === actor.id);
    if (hasRoof && actor.family < 4 && hash(`${beat}:fam:${actor.id}`) % 5 === 0) {
      actor.family += 1;
      news = news ?? `${actor.name}'s household grew to ${actor.family}. Another story, when the purse allows.`;
    }
  }
  actor.line = compose(actor, gnomes, plots, word);
  const pal = gnomes[(beat + 3) % gnomes.length];
  if (pal && pal.id !== actor.id) pal.line = compose(pal, gnomes, plots, word);
  for (const g of gnomes) placeGnome(g, plots);

  const pubs = (state.pubs?.length ? state.pubs : PUBS).map((p) => ({ ...p }));
  if (beat % 20 === 0) {
    for (const pub of pubs) {
      const interest = Math.max(12, Math.round(pub.bank * 0.004));
      pub.bank = Math.max(5000, pub.bank + interest + 18);
    }
  }
  let party = state.party ? { ...state.party, left: state.party.left - 1 } : null;
  if (party && party.left <= 0) party = null;
  if (!party && beat % 24 === 0) {
    const pub = pubs[beat % pubs.length]!;
    const host = PARTY_HOSTS[Math.floor(beat / 24) % PARTY_HOSTS.length]!;
    party = { town: pub.town, host, left: 14 };
    pub.bank += 40;
    news = news ?? `${host} took the back room at ${pub.name}. The town is invited.`;
  }
  const mates = state.mates?.length ? state.mates : MATES;
  let pint = state.pint;
  if (beat % 16 === 0) {
    const pair = mates[Math.floor(beat / 16) % mates.length]!;
    const host = gnomes.find((g) => g.id === pair[0]);
    if (host) pint = { a: pair[0], b: pair[1], town: host.town };
  }
  if (pint) {
    const pub = pubs.find((p) => p.town === pint!.town) ?? pubs[0]!;
    for (const id of [pint.a, pint.b]) {
      const g = gnomes.find((n) => n.id === id);
      const mate = gnomes.find((n) => n.id === (id === pint!.a ? pint!.b : pint!.a));
      if (!g || !mate) continue;
      g.x = pub.x + (id === pint.a ? -10 : 10);
      g.y = pub.y + 14;
      g.line = `${g.name}: Pint with ${mate.name} at ${pub.name}. Best mates. ${word} can wait.`;
    }
  }

  const owned = plots.find((p) => p.owner === actor.id && p.stories > 0);
  if (actor.good && owned && actor.purse >= 8) {
    if (!owned.trim) owned.trim = [];
    if (owned.trim.length < 3) {
      const pick = TRIM[hash(`${beat}:trim:${actor.id}`) % TRIM.length]!;
      if (!owned.trim.includes(pick)) {
        actor.purse -= 8;
        owned.trim.push(pick);
        news = news ?? `${actor.name} fitted ${pick} on the house. Paid from the purse.`;
      }
    }
  }

  // --- Newcomers ---------------------------------------------------------

  // 1. Departures. Remove visitors whose beat has come.
  const leaving = gnomes.filter((g) => g.archetype && g.departsAt && g.departsAt <= beat);
  if (leaving.length) {
    const who = leaving[0]!;
    news = news ?? `${who.name} took the afternoon boat out. ${TOWN_LABEL[who.town]} keeps the plot.`;
    for (let i = gnomes.length - 1; i >= 0; i--) {
      const g = gnomes[i]!;
      if (g.archetype && g.departsAt && g.departsAt <= beat) gnomes.splice(i, 1);
    }
  }

  // 2. One visitor acts every NEWCOMER_ACT_EVERY beats.
  const visitors = gnomes.filter((g) => g.archetype);
  if (visitors.length && beat % NEWCOMER_ACT_EVERY === 0) {
    const idx = Math.floor(beat / NEWCOMER_ACT_EVERY) % visitors.length;
    const visitor = visitors[idx]!;
    const line = tryNewcomer(visitor, { ...state, gnomes, plots }, beat);
    if (line) {
      news = news ?? line;
      visitor.line = line;
    }
  }

  // 3. A cruise ship docks every CRUISE_EVERY beats, if the island has room.
  if (beat > 0 && beat % CRUISE_EVERY === 0 && visitors.length < CRUISE_CAP) {
    const g = spawnCruiseNewcomer(beat);
    placeGnome(g, plots);
    gnomes.push(g);
    news = news ?? `A cruise ship tied up at ${TOWN_LABEL[g.town]}. One passenger came ashore.`;
  }

  // --- End newcomers -----------------------------------------------------

  return {
    ...state,
    gnomes,
    plots,
    word,
    beat,
    news: news ?? state.news,
    jarsSold,
    pubs,
    mates,
    pint,
    party,
  };
}

export function seedCivic(days = 1): CivicState {
  const plots = makePlots();
  const gnomes: CivicGnome[] = ROSTER.map((g) => ({
    ...g,
    moonshine: g.id === "slick" ? 1 : 0,
    x: 0,
    y: 0,
    line: "",
  }));
  let state: CivicState = {
    gnomes,
    plots,
    word: wordFor(days, 0),
    beat: 0,
    news: "The towns are pacing empty plots. Purses out. Timber next.",
    jarsSold: 0,
    hearing: "capitol",
    caseStage: 0,
    dock: false,
    pubs: PUBS.map((p) => ({ ...p })),
    mates: MATES.map((pair) => [pair[0], pair[1]] as [string, string]),
    pint: null,
    party: null,
    atPub: null,
  };
  for (const g of state.gnomes) {
    g.line = compose(g, state.gnomes, state.plots, state.word);
    placeGnome(g, state.plots);
  }
  const rounds = Math.min(8, Math.max(0, Math.floor(days) - 1));
  for (let i = 0; i < rounds * state.gnomes.length; i++) state = stepCivic(state, days);
  return state;
}

export function civicBlurb(g: CivicGnome, state: CivicState) {
  const homes = ownedHomes(state.plots, g.id);
  const rental = state.plots.find((p) => p.owner === g.id && p.rental);
  const plot = state.plots.find((p) => p.shares.includes(g.id));
  const mates = (plot?.shares ?? []).length;
  const kind = g.good ? "Upstanding. One of the ninety-five." : "Cruise-ship troublemaker. One of the five.";
  const rooms = homes.length ? homes.map((h) => `${h.stories} stor${h.stories === 1 ? "y" : "ies"}`).join(", ") : "no house yet";
  return `${kind} ${g.job} in ${TOWN_LABEL[g.town]}. Purse ${g.purse}. Family ${g.family}. Homes ${homes.length}/2 (${rooms}).${rental ? " Lets one house to vacationers." : " No rental yet."} ${mates ? `Shares a plot with ${mates}.` : ""} ${g.good ? "" : `Jars on the still: ${g.moonshine}.`} ${g.line}`;
}

export function caseBrief(stage: number, town: CivicTown) {
  if (town !== "capitol") {
    return `${TOWN_LABEL[town]} keeps a local bench. The first great case, Sunstep's dock, is filed at the Supreme Court in Port Victoria.`;
  }
  if (stage <= 0) {
    return "Sunstep's representative asks for a dock on the eastern water. Cruise ships would land there instead of Port Victoria.";
  }
  if (stage === 1) {
    return "Port Victoria answers. A Sunstep dock would cut the capital's cruise tax. The gown has not ruled.";
  }
  if (stage === 2) {
    return "The bench offers a bargain. Sunstep may build the dock if every cruise ship pays Port Victoria a tax to tie up.";
  }
  return "Agreed. Sunstep pays the cruise tax. The dock stands on the eastern water.";
}

const TOWNS = new Set<CivicTown>(["capitol", "tideham", "greenlane", "haven", "sunstep"]);

export function coerceCivic(raw: unknown, days: number): CivicState {
  if (!raw || typeof raw !== "object") return seedCivic(days);
  const r = raw as Partial<CivicState>;
  if (!Array.isArray(r.gnomes) || r.gnomes.length < 15 || !Array.isArray(r.plots) || r.plots.length < 15) {
    return seedCivic(days);
  }
  const gnomes = r.gnomes.flatMap((row) => {
    if (!row || typeof row !== "object") return [];
    const g = row as Partial<CivicGnome>;
    if (typeof g.id !== "string" || typeof g.name !== "string") return [];
    const town = TOWNS.has(g.town as CivicTown) ? (g.town as CivicTown) : "capitol";
    return [
      {
        id: g.id,
        name: g.name,
        town,
        job: typeof g.job === "string" ? g.job : "gnome",
        hat: typeof g.hat === "string" ? g.hat : "hat-straw",
        coat: typeof g.coat === "string" ? g.coat : "#6b5340",
        good: g.good !== false,
        purse: typeof g.purse === "number" ? Math.max(0, Math.floor(g.purse)) : 0,
        family: typeof g.family === "number" ? Math.max(1, Math.min(4, Math.floor(g.family))) : 1,
        moonshine: typeof g.moonshine === "number" ? Math.max(0, Math.floor(g.moonshine)) : 0,
        x: typeof g.x === "number" ? g.x : 0,
        y: typeof g.y === "number" ? g.y : 0,
        line: typeof g.line === "string" ? g.line : "",
        departsAt: typeof g.departsAt === "number" ? g.departsAt : undefined,
        archetype: typeof g.archetype === "string" ? g.archetype : undefined,
      },
    ];
  });
  if (gnomes.length < 15) return seedCivic(days);
  const plots = r.plots.flatMap((row) => {
    if (!row || typeof row !== "object") return [];
    const p = row as Partial<CivicPlot>;
    if (typeof p.id !== "string") return [];
    const town = TOWNS.has(p.town as CivicTown) ? (p.town as CivicTown) : "capitol";
    const shares = Array.isArray(p.shares) ? p.shares.filter((id) => typeof id === "string").slice(0, 4) : [];
    return [
      {
        id: p.id,
        town,
        x: typeof p.x === "number" ? p.x : 0,
        y: typeof p.y === "number" ? p.y : 0,
        shares,
        lantern: Boolean(p.lantern),
        stories: typeof p.stories === "number" ? Math.max(0, Math.min(3, Math.floor(p.stories))) : 0,
        owner: typeof p.owner === "string" ? p.owner : null,
        rental: Boolean(p.rental),
        trim: Array.isArray(p.trim) ? p.trim.filter((id) => typeof id === "string").slice(0, 4) : [],
      },
    ];
  });
  if (plots.length < 15) return seedCivic(days);
  const stage = r.caseStage === 1 || r.caseStage === 2 || r.caseStage === 3 ? r.caseStage : 0;
  return {
    gnomes,
    plots,
    word: typeof r.word === "string" ? r.word : wordFor(days, 0),
    beat: typeof r.beat === "number" ? Math.max(0, Math.floor(r.beat)) : 0,
    news: typeof r.news === "string" ? r.news : "",
    jarsSold: typeof r.jarsSold === "number" ? Math.max(0, Math.floor(r.jarsSold)) : 0,
    hearing: TOWNS.has(r.hearing as CivicTown) ? (r.hearing as CivicTown) : "capitol",
    caseStage: stage,
    dock: Boolean(r.dock) || stage >= 3,
    pubs: coercePubs(r.pubs),
    mates: Array.isArray(r.mates) && r.mates.length ? (r.mates as [string, string][]) : MATES.map((pair) => [pair[0], pair[1]] as [string, string]),
    pint:
      r.pint && typeof r.pint === "object" && typeof r.pint.a === "string" && typeof r.pint.b === "string" && TOWNS.has(r.pint.town as CivicTown)
        ? { a: r.pint.a, b: r.pint.b, town: r.pint.town as CivicTown }
        : null,
    party:
      r.party && typeof r.party === "object" && TOWNS.has(r.party.town as CivicTown) && typeof r.party.host === "string"
        ? { town: r.party.town as CivicTown, host: r.party.host, left: typeof r.party.left === "number" ? r.party.left : 0 }
        : null,
    atPub: TOWNS.has(r.atPub as CivicTown) ? (r.atPub as CivicTown) : null,
  };
}

function coercePubs(raw: unknown): PubBook[] {
  const byTown = new Map<CivicTown, Partial<PubBook>>();
  if (Array.isArray(raw)) {
    for (const row of raw) {
      if (!row || typeof row !== "object") continue;
      const p = row as Partial<PubBook>;
      if (!TOWNS.has(p.town as CivicTown)) continue;
      byTown.set(p.town as CivicTown, p);
    }
  }
  return PUBS.map((base) => {
    const saved = byTown.get(base.town);
    const bank = typeof saved?.bank === "number" ? Math.max(5000, Math.floor(saved.bank)) : base.bank;
    return { ...base, bank };
  });
                               }
