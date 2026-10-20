/**
 * The Supreme Court of the Hollow.
 *
 * One bench. One chief justice. No player button.
 * The verdict is computed: arguments times the judge's pleadings.
 *
 * Every argument has to be *found* by the player — through a
 * conversation, a plaque, or a read of the Clarion. The verdict
 * depends on the room, not on a click.
 */

export type Pleading = "precedent" | "commerce" | "custom" | "text" | "morality";

export type CourtSide = "crown" | "sunstep";

export type CourtContext = {
  bonds: Record<string, number>;
  clarionReads: number;
  visitedCourt: boolean;
  daysPlayed: number;
  isles: Record<string, { cleared: number }>;
};

export type CourtArgument = {
  id: string;
  side: CourtSide;
  pleading: Pleading;
  weight: number;
  text: string;
  /** Short label of where the player learned it. */
  source: string;
  when: (ctx: CourtContext) => boolean;
};

export type Judge = {
  id: string;
  name: string;
  title: string;
  blurb: string;
  pleadings: Record<Pleading, number>;
};

/**
 * Justice Arbuthnot. Highest power on the island. No king above him.
 * Reads the letter of the charter and the weight of prior rulings.
 * Does not much care what is right. Respected on every sister isle.
 */
export const ARBUTHNOT: Judge = {
  id: "arbuthnot",
  name: "Justice Arbuthnot",
  title: "Lord Chief Justice of the Hollow Bench",
  blurb:
    "Old, dry, unimpressed. Rules from the letter of the charter. Respected on every sister isle, feared at every bar.",
  pleadings: {
    text: 1.6,
    precedent: 1.4,
    custom: 1.1,
    commerce: 1.0,
    morality: 0.9,
  },
};

const noUnlock = () => true;

export const ARGUMENTS: CourtArgument[] = [
  // ─────────────────────────── CROWN ───────────────────────────
  {
    id: "crown-charter",
    side: "crown",
    pleading: "text",
    weight: 5,
    text: "The charter grants the Crown cruise revenue on these shores. Those words paid for watchfires through bitter winters. We cannot erase them because a new harbour promises a brighter summer.",
    source: "the charter plaque at the Town Hall",
    when: (ctx) => ctx.visitedCourt,
  },
  {
    id: "crown-never-refused",
    side: "crown",
    pleading: "precedent",
    weight: 4,
    text: "The crown has never been refused. Not once. Not even in Corinth.",
    source: "Ol Pappy's lessons",
    when: (ctx) => (ctx.bonds.pappy ?? 0) >= 8,
  },
  {
    id: "crown-watch",
    side: "crown",
    pleading: "commerce",
    weight: 5,
    text: "Port Victoria funds the watch, the roads and this court. When goblins come ashore, it is our guards who stand there. Sunstep asks to share their protection; it must share their burden.",
    source: "Watcher Greg",
    when: (ctx) => (ctx.bonds.greg ?? 0) >= 4,
  },
  {
    id: "crown-nation-consent",
    side: "crown",
    pleading: "custom",
    weight: 4,
    text: "A nation is a people who agreed to be governed. Sunstep agreed in 840.",
    source: "The Stoic",
    when: (ctx) => (ctx.bonds.stoic ?? 0) >= 8,
  },
  {
    id: "crown-until-otherwise",
    side: "crown",
    pleading: "text",
    weight: 4,
    text: "The Sunstep charter never said 'free forever'. It said 'free until the crown rules otherwise'.",
    source: "the bench records",
    when: (ctx) => ctx.visitedCourt,
  },
  {
    id: "crown-consent",
    side: "crown",
    pleading: "morality",
    weight: 3,
    text: "A nation is not a market. It is a people who consented.",
    source: "a Clarion editorial",
    when: (ctx) => ctx.clarionReads >= 2,
  },

  // ─────────────────────────── SUNSTEP ──────────────────────────
  {
    id: "sunstep-perpetuity",
    side: "sunstep",
    pleading: "text",
    weight: 5,
    text: "The Sunstep charter says “in perpetuity”. Families built their futures on that promise. That word is not decorative, my lord, and neither are the lives beneath it.",
    source: "Wim, on the charter",
    when: (ctx) => (ctx.bonds.wim ?? 0) >= 12,
  },
  {
    id: "sunstep-never-collected",
    side: "sunstep",
    pleading: "precedent",
    weight: 5,
    text: "The crown has never collected a copper from Sunstep. Not in eighty years.",
    source: "Brine, who kept the ledger",
    when: (ctx) => (ctx.bonds.brine ?? 0) >= 8,
  },
  {
    id: "sunstep-twelve-of-nothing",
    side: "sunstep",
    pleading: "commerce",
    weight: 4,
    text: "A crown tax of fourteen drives ships east. Seven percent at Port Victoria is worth more than fourteen of nothing.",
    source: "the Exchange floor",
    when: (ctx) => (ctx.isles.reed?.cleared ?? 0) === 0,
  },
  {
    id: "sunstep-corinth-custom",
    side: "sunstep",
    pleading: "custom",
    weight: 4,
    text: "Corinth had three free ports. That was the custom that made her rich.",
    source: "Bramble",
    when: (ctx) => (ctx.bonds.bramble ?? 0) >= 8,
  },
  {
    id: "sunstep-asked-to-be-free",
    side: "sunstep",
    pleading: "morality",
    weight: 5,
    text: "The people of Sunstep asked to be free. Not free of their neighbours—free to build something their children could keep. That is the whole charter, said aloud.",
    source: "Nettie",
    when: (ctx) => (ctx.bonds.nettie ?? 0) >= 8,
  },
  {
    id: "sunstep-future-towns",
    side: "sunstep",
    pleading: "morality",
    weight: 3,
    text: "If a free port is punished for prospering, what do we tell the gnomes walking North with a deed and a hammer? Build bravely, but do not build too well?",
    source: "Miller",
    when: (ctx) => (ctx.bonds.miller ?? 0) >= 12,
  },
];

/**
 * Build a CourtContext from the pieces the store actually has.
 * Pass in whatever the caller has handy — this stays pure.
 */
export function contextFromSave(input: {
  bonds: Record<string, number> | undefined;
  clarionReads: number | undefined;
  caseStage: number;
  daysPlayed: number;
  isles: Record<string, { cleared: number }> | undefined;
}): CourtContext {
  return {
    bonds: input.bonds ?? {},
    clarionReads: input.clarionReads ?? 0,
    visitedCourt: (input.caseStage ?? 0) >= 1,
    daysPlayed: input.daysPlayed ?? 1,
    isles: input.isles ?? {},
  };
}

export function unlockedArguments(ctx: CourtContext): CourtArgument[] {
  return ARGUMENTS.filter((a) => (a.when ?? noUnlock)(ctx));
}

export function scoreFor(
  side: CourtSide,
  unlocked: CourtArgument[],
  judge: Judge,
): number {
  return unlocked
    .filter((a) => a.side === side)
    .reduce((sum, a) => sum + a.weight * (judge.pleadings[a.pleading] ?? 1), 0);
}

export type Verdict = {
  side: CourtSide;
  crownScore: number;
  sunstepScore: number;
  margin: number;
  crownArgs: CourtArgument[];
  sunstepArgs: CourtArgument[];
  /** Which pleadings Arbuthnot leaned on most in his ruling. */
  leanedOn: Pleading[];
};

export function rule(ctx: CourtContext, judge: Judge = ARBUTHNOT): Verdict {
  const unlocked = unlockedArguments(ctx);
  const crownArgs = unlocked.filter((a) => a.side === "crown");
  const sunstepArgs = unlocked.filter((a) => a.side === "sunstep");
  const crownScore = scoreFor("crown", unlocked, judge);
  const sunstepScore = scoreFor("sunstep", unlocked, judge);
  const margin = Math.abs(crownScore - sunstepScore);
  const side: CourtSide = crownScore > sunstepScore ? "crown" : "sunstep";
  const leanedOn = (Object.entries(judge.pleadings) as [Pleading, number][])
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([p]) => p);
  return { side, crownScore, sunstepScore, margin, crownArgs, sunstepArgs, leanedOn };
}

/** How many of the twelve arguments the player has unlocked. */
export function progress(ctx: CourtContext): { found: number; total: number } {
  return { found: unlockedArguments(ctx).length, total: ARGUMENTS.length };
}

/** Boilerplate ruling text, decided by the algorithm. */
export function rulingText(v: Verdict): string {
  if (v.side === "crown") {
    return `The bench rules for the Crown. Sunstep's dock is granted, and every cruise ship tying up there pays fourteen percent. Port Victoria keeps its authority. That authority now carries a duty: protect the work this harbour brings, and do not let its families bear the whole burden. The rattlesnake flies at half-mast.`;
  }
  return `The bench rules for Sunstep. The charter's word "perpetuity" is held to be literal. Cruise ships tying up at the eastern dock pay half of one percent, and no more. Port Victoria keeps its 7%. Sunstep must now prove that a promise honoured can become a harbour that welcomes its neighbours. The rattlesnake flies full.`;
}

export type CourtLine={id:string;side:CourtSide|'bench';pleading:string;text:string;source:string};
/** Drama frames the discovered evidence; it never changes weights or the judge's decision. */
export function hearingLines(v:Verdict):CourtLine[]{
 const out:CourtLine[]=[
 {id:'bench-open',side:'bench',pleading:'Opening the hearing',source:'Justice Arbuthnot',text:'A harbour is never only a harbour. It is a promise of work, a road home, and a duty to those left behind. Speak plainly. I will hear the charter—and I will hear the people who must live beneath it.'},
 {id:'wim-open',side:'sunstep',pleading:'Opening address',source:'Wim, for Sunstep',text:'My lord, I have watched our young gnomes leave with everything they own tied in a cloth. We are asking for a dock so they might come home with work waiting. Do not call that hope a threat to the Crown.'},
 {id:'crown-open',side:'crown',pleading:'Opening address',source:'Stoic, for the Crown',text:'And I have watched a guard stand on a broken wall while the treasury counted its last coins. Freedom cannot mean enjoying a safe coast while another town buries the cost. The charter binds all of us, especially when it is inconvenient.'},
 ];
 for(let i=0;i<Math.max(v.sunstepArgs.length,v.crownArgs.length);i++){for(const a of [v.sunstepArgs[i],v.crownArgs[i]])if(a)out.push(a);}
 out.push({id:'wim-close',side:'sunstep',pleading:'Closing address',source:'Wim, for Sunstep',text:'If “in perpetuity” can be taken back the moment it becomes valuable, what promise can a new town trust? Think of the families buying land in the North. We ask them to build a life on our word. Let that word be worth something.'},
 {id:'crown-close',side:'crown',pleading:'Closing address',source:'Stoic, for the Crown',text:'I will not pretend a tax feels like bread on an empty table. But neither will I pretend that roads mend themselves or enemies stop at a customs gate. Give Sunstep its harbour with a duty it can bear, and give the rest of this island a reason to stand beside it.'},
 {id:'bench-close',side:'bench',pleading:'Before judgment',source:'Justice Arbuthnot',text:'You have both spoken of families. Remember them after this room is empty. The victorious party inherits a responsibility, not permission to gloat. I will now give the judgment this charter and this evidence require.'});return out;
}
