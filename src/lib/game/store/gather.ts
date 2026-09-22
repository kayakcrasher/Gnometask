import { bestHatchet, gearStats } from "../catalog";
import { TREE_GROW_MS, TREE_SAPLING_MS, TREE_SPOTS } from "../data/trees";
import { sfx } from "../juice";
import { PLACE_ANCHORS } from "../data/layout";
import { levelsOf } from "../xp";
import { scheduleWrite, withXp } from "./persist";
import type { GameState, StoreGet, StoreSet } from "./types";

function treeStage(choppedAt: number | undefined, now: number) {
  if (!choppedAt) return "grown" as const;
  const age = now - choppedAt;
  if (age < TREE_SAPLING_MS) return "stump" as const;
  if (age < TREE_GROW_MS) return "sapling" as const;
  return "grown" as const;
}

export function gatherSlice(
  set: StoreSet,
  get: StoreGet,
): Pick<GameState, "setPraying" | "chopTree" | "sailTo"> {
  return {
    setPraying: (on) => {
      const s = get();
      if (on && levelsOf(s.skills).prayer < 1 && s.skills.prayer === 0) {
        const gained = withXp(s.skills, { prayer: 12 });
        set({ praying: true, skills: gained.skills, speech: gained.ding ?? "A small prayer. The next bruise will be politer." });
        scheduleWrite(get);
        const chore = get().tasks.find((t) => t.builtinKey === "bless-gate" && !t.done);
        if (chore) get().toggleTask(chore.id);
        return;
      }
      set({ praying: on, speech: on ? "Protect melee. Half the bruise, twice the humming." : "Prayer down." });
      if (on) {
        const chore = s.tasks.find((t) => t.builtinKey === "bless-gate" && !t.done);
        if (chore) get().toggleTask(chore.id);
      }
    },

    chopTree: (treeId) => {
      const s = get();
      if (s.combat) return;
      const spot = TREE_SPOTS.find((t) => t.id === treeId);
      if (!spot) return;
      const rec = s.trees[treeId];
      const stage = treeStage(rec?.choppedAt, Date.now());
      if (stage !== "grown") {
        set({ speech: stage === "stump" ? "A stump. Give it a minute to remember being a tree." : "A sapling. Not yet." });
        return;
      }
      const hatchet = s.equipment.weapon?.startsWith("hatchet-")
        ? s.equipment.weapon
        : bestHatchet(s.ownedGear);
      if (!hatchet) {
        set({ speech: "Need a hatchet. The yard sells wooden ones." });
        return;
      }
      const wc = gearStats(hatchet).wc || 1;
      const xp = 18 + wc * 8;
      const gained = withXp(s.skills, { woodcutting: xp });
      const nextLogs = s.logs + 1;
      const quests = s.quests.map((q) =>
        q.id === "pappy-timber" && q.stage === "active" ? { ...q, stage: "ready" as const } : q,
      );
      set({
        logs: nextLogs,
        trees: { ...s.trees, [treeId]: { stage: "stump", choppedAt: Date.now() } },
        skills: gained.skills,
        popup: null,
        quests,
        speech:
          gained.ding ??
          (quests.some((q) => q.id === "pappy-timber" && q.stage === "ready")
            ? `A log for Ol Pappy. +${xp} Woodcutting. He's by the cottage.`
            : `The ${spot.kind} yields. +1 log. +${xp} Woodcutting.`),
        bounceKey: s.bounceKey + 1,
      });
      sfx("place");
      scheduleWrite(get);
      const chore = get().tasks.find((t) => t.builtinKey === "chop-stakes" && !t.done);
      if (chore) get().toggleTask(chore.id);
    },

    sailTo: (dest) => {
      const s = get();
      if (s.combat) return;
      const target = dest === "haven" ? PLACE_ANCHORS.haven : PLACE_ANCHORS.dock;
      const gained = withXp(s.skills, { sailing: 22 });
      set({
        gnomeX: target.x,
        gnomeY: target.y,
        selectedPlace: dest === "haven" ? "haven" : "dock",
        skills: gained.skills,
        popup: null,
        interior: null,
        speech: gained.ding ?? (dest === "haven" ? "The dinghy noses into Haven's quiet water." : "Back to the town dock. Rope coiled."),
        bounceKey: s.bounceKey + 1,
      });
      sfx("open");
      scheduleWrite(get);
      const chore = get().tasks.find((t) => t.builtinKey === "coil-watch" && !t.done);
      if (chore) get().toggleTask(chore.id);
    },
  };
}
