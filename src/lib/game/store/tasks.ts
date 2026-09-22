import { localDate, uid, yesterdayDate } from "@/lib/utils";
import { coinsForTask, MILESTONES } from "../catalog";
import { CHEERS, NUDGES, randOf } from "../quotes";
import { sfx } from "../juice";
import type { PlaceId } from "../types";
import { applyXp } from "../xp";
import { scheduleWrite } from "./persist";
import type { GameState, StoreGet, StoreSet } from "./types";

export function tasksSlice(set: StoreSet, get: StoreGet): Pick<GameState, "addTask" | "toggleTask" | "deleteTask"> {
  return {
    addTask: (text, location) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const task = {
        id: uid("task"),
        text: trimmed.slice(0, 80),
        done: false,
        builtin: false,
        location: location ?? get().selectedPlace ?? ("cottage" as PlaceId),
        createdOn: localDate(),
      };
      set((s) => ({ tasks: [task, ...s.tasks] }));
      scheduleWrite(get);
    },

    toggleTask: (id) => {
      const state = get();
      const task = state.tasks.find((t) => t.id === id);
      if (!task) return;
      const today = localDate();
      const nextDone = !task.done;

      let coins = state.coins;
      let streak = state.streak;
      let lastCompletedDate = state.lastCompletedDate;
      let speech = state.speech;
      let bounceKey = state.bounceKey;
      let coinPopKey = state.coinPopKey;
      let milestonesReached = state.milestonesReached;
      let perfectBonusOn = state.perfectBonusOn;
      let skills = state.skills;
      let woodsGreeted = state.woodsGreeted;

      const tasks = state.tasks.map((t) =>
        t.id === id ? { ...t, done: nextDone, doneOn: nextDone ? today : undefined } : t,
      );

      if (nextDone) {
        const reward = coinsForTask(task);
        coins += reward;
        coinPopKey += 1;
        if (lastCompletedDate !== today) {
          streak = lastCompletedDate === yesterdayDate() ? streak + 1 : 1;
          lastCompletedDate = today;
        }
        let planted: number | null = null;
        for (const m of MILESTONES) {
          if (streak >= m && !milestonesReached.includes(m)) {
            milestonesReached = [...milestonesReached, m];
            planted = m;
          }
        }
        const builtinsToday = tasks.filter((t) => t.builtin && t.createdOn === today);
        const allBuiltinsDone = builtinsToday.length > 0 && builtinsToday.every((t) => t.done);
        const craft = applyXp(skills, "crafting", 14);
        skills = craft.skills;
        if (task.builtinKey === "water-garden") {
          const farm = applyXp(skills, "farming", 18);
          skills = farm.skills;
        }
        if (task.builtinKey === "say-prayer") {
          const pray = applyXp(skills, "prayer", 16);
          skills = pray.skills;
        }
        if (task.builtinKey === "take-dinghy") {
          const sail = applyXp(skills, "sailing", 16);
          skills = sail.skills;
        }
        if (task.builtinKey === "chop-kindling") {
          const wc = applyXp(skills, "woodcutting", 16);
          skills = wc.skills;
        }
        if (allBuiltinsDone && perfectBonusOn !== today) {
          coins += 12;
          perfectBonusOn = today;
          speech = "A perfect little day. The land noticed. Extra coins for you.";
        } else if (planted) {
          speech = `${state.gnomeName ? state.gnomeName + ", " : ""}a tree for your ${planted}-day streak. The garden remembers.`;
        } else {
          speech = craft.ding ?? randOf(CHEERS);
        }
        if (task.builtinKey === "good-morning") woodsGreeted = true;
        bounceKey += 1;
        sfx("done");
      } else {
        speech = randOf(NUDGES);
      }

      set({
        tasks,
        coins,
        streak,
        lastCompletedDate,
        speech,
        bounceKey,
        coinPopKey,
        milestonesReached,
        perfectBonusOn,
        skills,
        woodsGreeted,
      });
      scheduleWrite(get);

      if (nextDone && task.builtinKey === "patrol") get().startPatrol("wildlands");
      if (nextDone && task.builtinKey === "mine-lanterns") get().startPatrol("mines");
      if (nextDone && task.builtinKey === "sweep-stones") get().startPatrol("ruins");
      if (nextDone && task.builtinKey === "coil-rope") get().startPatrol("dock");
      if (nextDone && task.builtinKey === "dragon-honey") get().sootheDragon();
    },

    deleteTask: (id) => {
      const task = get().tasks.find((t) => t.id === id);
      if (!task || task.builtin) return;
      set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
      scheduleWrite(get);
    },
  };
}
