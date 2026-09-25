/**
 * Ambient NPC conversations. Two shop-folk stand near each other and
 * say one line between them. Each talk can be gated by game state so
 * the pair only says it when the moment fits.
 */

export type TalkContext = {
  word: string;
  news: string;
  party: string | null;
  jars: number;
  days: number;
  dock: boolean;
};

export type Talk = {
  a: string;
  b: string;
  line: string;
  when?: (c: TalkContext) => boolean;
};

export const TALKS: Talk[] = [
  { a: "nettie", b: "miller", line: "Nettie: The hats sold. Miller: Then the pies can wait on the same purse." },
  { a: "wim", b: "brine", line: "Wim: Another hull for Oar & Yard. Brine: I'll take the rope money upstairs." },
  { a: "pipkin", b: "pappy", line: "Pipkin: The garden tiles are his. Pappy: His great-grandpa left them. Empty pockets, and a hoe." },
  { a: "greg", b: "stoic", line: "Greg: Goblins steal. Dark elves hate a rival. Stoic: Then we get rich on purpose, and we post a watch." },
  { a: "miller", b: "pipkin", line: "Miller: Flour's short. Pipkin: The co-op has a sack if the oven pays." },
  { a: "bramble", b: "nettie", line: "Bramble: Pine is not for sale. Nettie: Then the co-op buys the hats, not the trees." },
  { a: "pappy", b: "greg", line: "Pappy: The watch held the night. Greg: The watch held the night because nothing came. Pappy: That's how it works." },
  { a: "stoic", b: "wim", line: "Stoic: A share of Oar & Yard at fourteen. Wim: Then buy a hull, not a story." },
  { a: "brine", b: "miller", line: "Brine: The pie left the dock. Miller: On a boat, or in a gnome?" },
  { a: "nettie", b: "bramble", line: "Nettie: A hat is a small honesty. Bramble: A tree is a large one. Nettie: Don't start." },
  { a: "greg", b: "wim", line: "Greg: The south pier wants a second watch. Wim: Then pay for the perch, captain." },
  { a: "pipkin", b: "miller", line: "Pipkin: The wheat wants a week. Miller: The oven wants it today. Pipkin: The oven always wants today." },
  { a: "pappy", b: "stoic", line: "Pappy: Corinth fell because a rich gnome bought the story. Stoic: And a poor one sold it. Pappy: Both, yes." },
  { a: "bramble", b: "pipkin", line: "Bramble: The mushrooms are up. Pipkin: The goats noticed. Bramble: The goats always notice." },

  { a: "nettie", b: "bramble", line: "Nettie: Today's word is timber, is it? Bramble: It's whatever the co-op writes on the board. Nettie: I like that better.", when: (c) => c.word === "timber" },
  { a: "miller", b: "stoic", line: "Miller: The word is honest. Stoic: The word is expensive. Miller: Same thing, some mornings.", when: (c) => c.word === "honest" },
  { a: "wim", b: "greg", line: "Wim: The word is watch. Greg: Then I'd better stand one. Wim: You always do.", when: (c) => c.word === "watch" },
  { a: "pappy", b: "pipkin", line: "Pappy: The word is story. Pipkin: Whose? Pappy: The one we're still writing.", when: (c) => c.word === "story" },

  { a: "nettie", b: "miller", line: "Nettie: Someone's got the back room lit. Miller: Someone always does. Nettie: This one's louder.", when: (c) => Boolean(c.party) },
  { a: "wim", b: "brine", line: "Wim: Party at the pub. Brine: Whose tab? Wim: Nobody's, if we go now.", when: (c) => Boolean(c.party) },
  { a: "greg", b: "pipkin", line: "Greg: Two gnomes already asleep on the pier. Pipkin: Let them. Tomorrow's early.", when: (c) => Boolean(c.party) },

  { a: "greg", b: "brine", line: "Greg: I smell the still again. Brine: That's your own coat. Greg: My coat doesn't smell sweet.", when: (c) => c.jars > 4 },
  { a: "pappy", b: "nettie", line: "Pappy: Some gnome is getting rich off a jar. Nettie: Off a hat, if the hat's the right shape.", when: (c) => c.jars > 8 },

  { a: "wim", b: "stoic", line: "Wim: The cruise tax holds. Stoic: For now. Wim: Then we build the second dock.", when: (c) => c.dock },
  { a: "brine", b: "pappy", line: "Brine: Sunstep tied up a big one this morning. Pappy: And Port Victoria counted it. Brine: Aye. Twice.", when: (c) => c.dock },
  { a: "greg", b: "nettie", line: "Greg: I don't trust a cruise ship. Nettie: Then sell the passengers a hat. Greg: I don't trust them either.", when: (c) => c.dock },

  { a: "miller", b: "bramble", line: "Miller: Four at the co-op now. Bramble: Three. Miller: Four, if you count the one asleep.", when: (c) => c.days > 40 },
  { a: "stoic", b: "greg", line: "Stoic: The hollow is rich enough to be robbed. Greg: Which is why it won't be.", when: (c) => c.days > 60 },
  { a: "nettie", b: "wim", line: "Nettie: Sunstep is getting loud. Wim: Sunstep was always loud. Nettie: Louder, then.", when: (c) => c.days > 80 },
];
