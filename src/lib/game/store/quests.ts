import { NPCS } from "../world";
import { QUEST_BY_ID } from "../quests";
import { randOf } from "../quotes";
import { lineForBond } from "../data/bonds";
import { sfx } from "../juice";
import { maxHitpoints } from "../xp";
import { landingAlive, landingCleared } from "../data/landing";
import { scheduleWrite, withXp } from "./persist";
import type { GameState, StoreGet, StoreSet } from "./types";

export function questsSlice(
  set: StoreSet,
  get: StoreGet,
): Pick<GameState, "talkTo" | "tradeWith" | "pickChicken" | "greetMushrooms"> {
  return {
    talkTo: (npcId) => {
      const npc = NPCS.find((n) => n.id === npcId);
      if (!npc) return;
      const s = get();
      const bonds = { ...(s.bonds ?? {}) };
      const bond = bonds[npcId] ?? 0;
      const bondLine = lineForBond(npcId, bond);
      let speech = bondLine ?? randOf(npc.lines);
      let quests = s.quests.map((q) => ({ ...q }));
      let coins = s.coins;
      let skills = s.skills;
      let chickenHeld = s.chickenHeld;
      let chicken = s.chicken;
      let pieHeld = s.pieHeld;
      let ding: string | null = null;
      let coinPop = false;
      let bounce = false;
      let landing = s.landing;

      const finish = (id: string) => {
        const def = QUEST_BY_ID[id];
        if (!def) return;
        const xp = withXp(skills, def.xp);
        skills = xp.skills;
        if (xp.ding) ding = xp.ding;
        coins += def.coins;
        coinPop = true;
        bounce = true;
        speech = def.done;
        quests = quests.map((q) => (q.id === id ? { ...q, stage: "done" as const } : q));
        bonds[def.giver] = (bonds[def.giver] ?? 0) + 5;
        sfx("win");
      };

      const timberAtStart = s.quests.find((q) => q.id === "pappy-timber");
      const grew =
        s.placed.length > 0 || s.fortLevel > 0 || s.houseUpgrades.length > 0;

      for (const q of quests) {
        if (q.stage === "done") continue;
        const def = QUEST_BY_ID[q.id];
        if (!def) continue;
        if (q.id === "pappy-timber" && npcId === "pappy") {
          if (s.logs >= 1 || q.stage === "ready") {
            finish(q.id);
          } else {
            speech = def.offer;
          }
        } else if (q.id === "pappy-expand" && npcId === "pappy") {
          if (timberAtStart && timberAtStart.stage !== "done") continue;
          if (grew || q.stage === "ready") {
            finish(q.id);
          } else {
            speech = def.offer;
          }
        } else if (q.id === "pappy-landing" && (npcId === "pappy" || npcId === "greg")) {
          if (npcId === "pappy" && timberAtStart && timberAtStart.stage !== "done") continue;
          const cleared = landingCleared(s.landing) || q.stage === "ready";
          if (cleared && npcId === "pappy") {
            finish(q.id);
          } else if (cleared && npcId === "greg") {
            speech =
              "Shore's quiet. Banner's drooping. Tell Ol Pappy — then come back and buy a perch if you haven't.";
          } else if (npcId === "greg") {
            speech =
              "News from the watch! A Mucktooth Clan boat — five green runts, low as weeds. Stakes perch is twelve coins. Plant it, then pick them off the shore.";
            if (landing && !landing.newsTold) landing = { ...landing, newsTold: true };
          } else if (npcId === "pappy") {
            const left = landingAlive(s.landing);
            speech =
              left > 0
                ? `${def.offer} ${left} still on the sand.`
                : def.offer;
          }
        } else if (q.id === "lost-chicken" && npcId === "pipkin") {
          if (chickenHeld || q.stage === "ready") {
            finish(q.id);
            chickenHeld = false;
            chicken = null;
          } else {
            speech = def.offer;
          }
        } else if (q.id === "pie-run") {
          if (npcId === "miller" && q.stage === "active" && !pieHeld) {
            pieHeld = true;
            quests = quests.map((x) => (x.id === q.id ? { ...x, stage: "ready" as const } : x));
            speech = "A pie, still warm. Brine is at the dock. Don't let the goblins sniff it.";
            bounce = true;
          } else if (npcId === "brine" && pieHeld) {
            finish(q.id);
            pieHeld = false;
          } else if (npcId === "miller" && pieHeld) {
            speech = def.hint;
          } else if (npcId === def.giver) {
            speech = def.offer;
          }
        } else if (q.id === "mushroom-hello" && npcId === "bramble") {
          if (s.woodsGreeted || q.stage === "ready") {
            finish(q.id);
          } else {
            speech = def.offer;
          }
        }
      }

      bonds[npcId] = (bonds[npcId] ?? 0) + 1;

      if (ding) speech = `${speech} ${ding}`;
      const grown = maxHitpoints(skills) - maxHitpoints(s.skills);
      set({
        speech,
        quests,
        coins,
        skills,
        chickenHeld,
        chicken,
        pieHeld,
        landing,
        bonds,
        hp: s.hp + grown,
        bounceKey: bounce ? s.bounceKey + 1 : s.bounceKey,
        coinPopKey: coinPop ? s.coinPopKey + 1 : s.coinPopKey,
      });
      scheduleWrite(get);
    },

    tradeWith: (npcId) => {
      const npc = NPCS.find((n) => n.id === npcId);
      if (!npc) return;
      if (npc.tradeInterior) {
        set({ interior: npc.tradeInterior, popup: null, panel: "place" });
        return;
      }
      set({ speech: `${npc.name} isn't selling. They're here for the conversation.` });
    },

    pickChicken: () => {
      const s = get();
      const q = s.quests.find((quest) => quest.id === "lost-chicken");
      if (!q || q.stage === "done" || s.chickenHeld) return;
      set({
        chickenHeld: true,
        quests: s.quests.map((quest) =>
          quest.id === "lost-chicken" ? { ...quest, stage: "ready" as const } : quest,
        ),
        speech: "Got you, Cluckers. Pipkin is in the garden.",
        bounceKey: s.bounceKey + 1,
        popup: null,
      });
      sfx("done");
      scheduleWrite(get);
    },

    greetMushrooms: () => {
      const s = get();
      set({
        woodsGreeted: true,
        quests: s.quests.map((q) =>
          q.id === "mushroom-hello" && q.stage === "active" ? { ...q, stage: "ready" as const } : q,
        ),
        speech: s.woodsGreeted
          ? "The mushrooms already know you. They still appreciate the hello."
          : "Hello, mushrooms. They nod, in their way.",
        bounceKey: s.bounceKey + 1,
        popup: null,
      });
      sfx("done");
      scheduleWrite(get);
    },
  };
}
