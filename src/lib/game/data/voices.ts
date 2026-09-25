/**
 * Voices. Each NPC's own way of speaking — greetings gated by bond,
 * and context barks in their own register. This is the character sheet
 * for speech.
 *
 * Priority when you click an NPC:
 *   1. raid   (something is attacking)
 *   2. hurt   (you are below 40% HP)
 *   3. rich   (you have more than 200 coins)
 *   4. broke  (you have fewer than 15 coins)
 *   5. greeting — filtered by how well they know you
 *
 * If none of those fire, talkTo falls back to npc.lines as before.
 */

export type VoiceCtx = {
  bond: number;
  raid: boolean;
  hurt: boolean;
  rich: boolean;
  broke: boolean;
};

export type Voice = {
  id: string;
  name: string;
  /** What this NPC reaches for when they reach for an image. */
  metaphor: string;
  /** Greetings, gated by bond. Highest matching wins. */
  greetings: { min: number; line: string }[];
  /** Barks, filtered by context. One pick per context. */
  onRaid: string[];
  onHurt: string[];
  onRich: string[];
  onBroke: string[];
};

export const VOICES: Record<string, Voice> = {
  pappy: {
    id: "pappy",
    name: "Ol Pappy St. Francis",
    metaphor: "Corinth, the long watch, the thing that outlives a gnome",
    greetings: [
      { min: 0, line: "There you are. I knew your great-grandpa. Sit or stand — we have work either way." },
      { min: 4, line: "Back. Good. Most gnomes run the first time the wind turns." },
      { min: 12, line: "You walk like a gnome who means it now." },
      { min: 50, line: "Sit, grandchild. No hurry on this dock." },
    ],
    onRaid: [
      "Green ones on the sand. That is not a rumour, that is a Tuesday.",
      "Mucktooth leftovers. They still practice the old creed.",
    ],
    onHurt: [
      "You are bleeding on my dock. Sit. Tea first, wall after.",
      "Get off the sand. The kettle is on the sill.",
    ],
    onRich: [
      "Fat purse. Good. Buy timber before someone else notices.",
      "Coin like that builds a keep, or loses one. Your call.",
    ],
    onBroke: [
      "Empty pockets again. That is how your great-grandpa started.",
      "No coin? Hands work. Use them.",
    ],
  },

  greg: {
    id: "greg",
    name: "Watcher Greg",
    metaphor: "watch reports, walls, the long count",
    greetings: [
      { min: 0, line: "Eyes on you. Report yourself." },
      { min: 4, line: "Still walking the shore. Good. I notice that." },
      { min: 12, line: "You are on the roster. Not for shifts — just so the wall knows your name." },
      { min: 50, line: "Stand beside me if it comes at night. Don't tell Pappy I said that." },
    ],
    onRaid: [
      "Contact at the shore. Five runts, low as weeds. That is the report.",
      "Goblin boat on the water. Not a drill.",
    ],
    onHurt: [
      "You are not standing straight. Get behind the line.",
      "Off the sand. That is an order and a kindness.",
    ],
    onRich: [
      "Purse like that is a target. Buy a tower.",
      "Coin-heavy makes you interesting to pirates. Fix that.",
    ],
    onBroke: [
      "Broke is fine. Broke and asleep is not. Chop something.",
      "No coin, no wall. Swing the axe.",
    ],
  },

  wim: {
    id: "wim",
    name: "Wim",
    metaphor: "hulls, ledgers, the third boat home",
    greetings: [
      { min: 0, line: "Boats on the water. That is the sentence I waited my whole dock for." },
      { min: 4, line: "Boats still on the water. Sentence keeps coming true." },
      { min: 12, line: "If Sunstep wins its dock, I want you at the reading. Some things you hear in person." },
      { min: 50, line: "The third hull. I named it after your great-grandpa. Don't make it a thing." },
    ],
    onRaid: [
      "Their boat is on my water. My hulls are not built for that conversation.",
      "Pirates or goblins — either way, the pier stays mine.",
    ],
    onHurt: [
      "You look like a bent nail. Go home. The dock will keep.",
      "Sit on that crate. You are dripping on the ledger.",
    ],
    onRich: [
      "Purse that fat, you can buy a sloop. I will even rig it.",
      "Coin-heavy. Buy the sloop, not the hat.",
    ],
    onBroke: [
      "You will need coin for a boat. Chop first, buy later.",
      "Empty purse, empty dock. Get to work.",
    ],
  },

  brine: {
    id: "brine",
    name: "Brine",
    metaphor: "rope, tide, the count of boats that came home",
    greetings: [
      { min: 0, line: "I count the boats that come home. Corinth counted them leaving. I like this job better." },
      { min: 4, line: "Coil that rope when you pass. Half the dock thinks it ties itself." },
      { min: 12, line: "You count boats the way I do. Leaving, then coming home. That is a clerk's eye." },
      { min: 50, line: "There is a ledger under the south pier. Every hull that came home the first year. You are on the last page." },
    ],
    onRaid: [
      "Goblins at the south pier. Coil the rope, then run.",
      "Their flag is up. My ledger does not count their kind.",
    ],
    onHurt: [
      "Sit on the crate. Sit. You are dripping on the ledger.",
      "Get off the boards before you fall through.",
    ],
    onRich: [
      "Coin-heavy. The harbour likes that. The pirates like it more.",
      "Purse like that, buy a second pier. Then count it.",
    ],
    onBroke: [
      "No coin, no rope? Then we are counting the same tide.",
      "Empty purse, empty ledger. Move.",
    ],
  },

  nettie: {
    id: "nettie",
    name: "Nettie",
    metaphor: "brims, ribbons, the shop she sleeps above",
    greetings: [
      { min: 0, line: "Corinth sold hats between boats. I sell them from a shop I sleep above. That is the rebuild, one brim at a time." },
      { min: 4, line: "Back for the brim, or just the gossip? Either suits me." },
      { min: 12, line: "I set aside a ribbon for you. Do not tell the others. There are not others." },
      { min: 50, line: "I make one hat a year I never sell. This year's is yours." },
    ],
    onRaid: [
      "Goblins on the beach. Do not expect the milliner to fight them for you.",
      "They would take the ribbon and the head with it. We would rather sew.",
    ],
    onHurt: [
      "You have a hole in you. Sit. I will fetch the tea, Pappy will fetch the sermon.",
      "Sit down. You are making my stitches nervous.",
    ],
    onRich: [
      "I see that purse. I will show you the expensive hats, then.",
      "Coin-heavy? Then you want the brim with the feather.",
    ],
    onBroke: [
      "No coin, no brim. Come back when the logs are sold.",
      "Empty-handed. That is fine. Look, do not touch.",
    ],
  },

  miller: {
    id: "miller",
    name: "Miller",
    metaphor: "bread, the oven, the morning it has to smell right",
    greetings: [
      { min: 0, line: "Corinth's last morning still smelled like bread. I bake so this one does too." },
      { min: 4, line: "There is a day-old loaf on the sill. Take it. The oven overbaked." },
      { min: 12, line: "Every morning I bake, I check. This one smells right." },
      { min: 50, line: "I bake for the ones who might not come back. You always come back." },
    ],
    onRaid: [
      "The ovens are ready if the shore falls. Bread does not stop for goblins.",
      "Goblins do not stop the morning bake. They try. They fail.",
    ],
    onHurt: [
      "Sit at the bench. I will bring a heel of bread. Do not argue.",
      "You look like a burnt crust. Sit down.",
    ],
    onRich: [
      "That purse would buy a whole sack of flour. Buy one. Feed a watch.",
      "Coin-heavy. Buy the mill, then buy the oven.",
    ],
    onBroke: [
      "No coin? Take the day-old loaf. The oven overbaked.",
      "Empty purse, full oven. Same as yesterday. Sit.",
    ],
  },

  pipkin: {
    id: "pipkin",
    name: "Pipkin",
    metaphor: "rows, seeds, the plot behind the shed",
    greetings: [
      { min: 0, line: "Those garden tiles were your great-grandpa's. A few rows, not a kingdom. Enough to begin." },
      { min: 4, line: "You walk between rows like you mean it. Most just run through." },
      { min: 12, line: "There is a plot behind the shed I keep for friends. Yours if you want it." },
      { min: 50, line: "Cluckers follows you now. I do not mind. She knows a farmer when she sees one." },
    ],
    onRaid: [
      "Cluckers hides when she smells them. She is smart. So should you be.",
      "They take what someone else grew. That is the whole creed.",
    ],
    onHurt: [
      "Wash that cut in the trough. The chickens drink from it. Sorry.",
      "Sit in the shade. The rows will wait.",
    ],
    onRich: [
      "Money like that, you can buy a cow. Cows are the real wealth.",
      "Coin-heavy. Buy a herd, not a hat.",
    ],
    onBroke: [
      "Broke is fine. The garden does not ask for a deposit.",
      "Empty pockets. Good. Hands are what we need.",
    ],
  },

  bramble: {
    id: "bramble",
    name: "Bramble",
    metaphor: "the woods, mushrooms, what the trees already know",
    greetings: [
      { min: 0, line: "The woods fed the folk your great-grandpa walked off Corinth. They still feed whoever works." },
      { min: 4, line: "The woods know your step now. That is not nothing." },
      { min: 12, line: "I leave the flat mushrooms for you. The ones on the south bank. You will see why." },
      { min: 50, line: "The south bank is yours if you want a quiet plot. I will not tell anyone." },
    ],
    onRaid: [
      "The woods heard them land. Trees are worried. So am I.",
      "Goblins in the trees. The mushrooms closed up. That is how I know.",
    ],
    onHurt: [
      "You are hurt. Yarrow on the south bank. Chew it. Do not thank me yet.",
      "Sit under the oak. The shade will do half the work.",
    ],
    onRich: [
      "Wealth is a fine thing. Plant a tree and it becomes a proper one.",
      "Coin-heavy. Buy saplings. The woods remember.",
    ],
    onBroke: [
      "Pockets empty, hands free. Good morning to work.",
      "No coin. No problem. The forest does not invoice.",
    ],
  },

  stoic: {
    id: "stoic",
    name: "The Stoic Gnome",
    metaphor: "shares, ledgers, what pays for itself",
    greetings: [
      { min: 0, line: "Your great-grandpa held a line so other gnomes could run. I buy shares so this line can pay for itself." },
      { min: 4, line: "You again. The purse holds. So does the line." },
      { min: 12, line: "I mark you down as a buyer, not a tourist. There is a difference, and it pays." },
      { min: 50, line: "I have stopped counting your trades. I just know they land." },
    ],
    onRaid: [
      "Raiders. Buy a share of the wall or stop asking me about yields.",
      "Defense rallies. The timing is obvious.",
    ],
    onHurt: [
      "You look like a bad trade. Go sit down.",
      "Off your feet. The market will not move.",
    ],
    onRich: [
      "That purse is starting to make you interesting. Not always a compliment.",
      "Coin-heavy. Reinvest or lose it. Pick.",
    ],
    onBroke: [
      "Coin-poor is fine. Coin-poor and idle is not.",
      "Empty purse, empty ledger. Same page. Turn it.",
    ],
  },
};

/** Deterministic pick from a list, by key. */
function pick<T>(arr: T[], key: number): T | undefined {
  if (!arr.length) return undefined;
  return arr[Math.abs(key) % arr.length];
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * One line for this NPC, given context. Context beats greeting —
 * a raid bark fires whether they know you or not.
 */
export function pickLine(id: string, ctx: VoiceCtx): string | null {
  const v = VOICES[id];
  if (!v) return null;

  const key = hash(id + ":" + ctx.bond);

  if (ctx.raid)  return pick(v.onRaid, key) ?? null;
  if (ctx.hurt)  return pick(v.onHurt, key) ?? null;
  if (ctx.rich)  return pick(v.onRich, key) ?? null;
  if (ctx.broke) return pick(v.onBroke, key) ?? null;

  let greeting: string | null = null;
  for (const g of v.greetings) {
    if (ctx.bond >= g.min) greeting = g.line;
  }
  return greeting;
}
