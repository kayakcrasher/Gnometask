import { bestHatchet, bestRod, CATALOG_BY_ID, gearStats } from "../catalog";
import { TREE_GROW_MS, TREE_SAPLING_MS, TREE_SPOTS } from "../data/trees";
import { sfx } from "../juice";
import { PLACE_ANCHORS, VILLAGE_SLOTS } from "../data/layout";
import { BOAT_RANK, boatById } from "../data/boats";
import { NEWCOMERS, supplyDue } from "../data/supply";
import { FISH_BY_ID, rollFish } from "../data/fish";
import { levelFromXp, levelsOf } from "../xp";
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
): Pick<GameState, "setPraying" | "chopTree" | "sailTo" | "buyBoat" | "takeSupply" | "welcomeNewcomer" | "takeFlotsam" | "castLine" | "sellFish" | "stockFish"> {
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

    sailTo: (dest, boatId) => {
      const s = get();
      if (s.combat) return;
      if (dest === "dock" && s.selectedPlace !== "haven") {
        set({ speech: "The town dock is already under your boots.", popup: null });
        return;
      }
      const boat = boatById(boatId ?? "row") ?? boatById("row")!;
      const lv = levelFromXp(s.skills.sailing);
      const owned = boat.id === "row" || s.hulls.includes(boat.id);
      if (!owned) {
        set({
          speech: `${boat.name} isn't yours. Wim sells her at the dockhouse.`,
          popup: null,
        });
        return;
      }
      if (lv < boat.need && s.loan?.boat !== boat.id) {
        set({
          speech: `${boat.name} wants Sailing ${boat.need}. You are ${lv}. Take the rowboat a few more times.`,
          popup: null,
        });
        return;
      }
      const target = dest === "haven" ? PLACE_ANCHORS.haven : PLACE_ANCHORS.dock;
      const gained = withXp(s.skills, { sailing: boat.xp });
      set({
        gnomeX: target.x,
        gnomeY: target.y,
        selectedPlace: dest === "haven" ? "haven" : "dock",
        skills: gained.skills,
        boatRank: Math.max(s.boatRank, BOAT_RANK[boat.id]),
        popup: null,
        interior: null,
        speech:
          gained.ding ??
          (dest === "haven"
            ? `The ${boat.name.toLowerCase()} noses into Haven. +${boat.xp} Sailing.`
            : `Back to the town dock in the ${boat.name.toLowerCase()}. +${boat.xp} Sailing.`),
        bounceKey: s.bounceKey + 1,
      });
      sfx("open");
      scheduleWrite(get);
      const chore = get().tasks.find((t) => t.builtinKey === "coil-watch" && !t.done);
      if (chore) get().toggleTask(chore.id);
    },

    buyBoat: (id) => {
      const s = get();
      const boat = boatById(id);
      if (!boat) return;
      if (boat.id === "row" || boat.price <= 0) {
        set({ speech: "The rowboat is already yours. She's on the pier." });
        return;
      }
      if (s.hulls.includes(boat.id)) {
        set({ speech: `${boat.name} is already on your line.` });
        return;
      }
      const lv = levelFromXp(s.skills.sailing);
      if (lv < boat.need) {
        set({ speech: `Wim wants Sailing ${boat.need} before he sells a ${boat.name.toLowerCase()}. You are ${lv}.` });
        sfx("error");
        return;
      }
      if (s.coins < boat.price) {
        set({ speech: `${boat.name} is ${boat.price} coins. The ledger does not blush.` });
        sfx("error");
        return;
      }
      set({
        coins: s.coins - boat.price,
        hulls: [...s.hulls, boat.id],
        boatRank: Math.max(s.boatRank, BOAT_RANK[boat.id]),
        coinPopKey: s.coinPopKey + 1,
        speech: `Wim slides the ${boat.name.toLowerCase()} onto your account. She's at the pier.`,
      });
      sfx("buy");
      scheduleWrite(get);
    },

    takeSupply: () => {
      const s = get();
      if (!supplyDue(s.daysPlayed) || s.supplyDay !== s.daysPlayed) {
        set({ speech: "The south pier is empty. The supply ship ties up every other day." });
        return;
      }
      if (s.supplyTaken) {
        set({
          speech: s.newcomer
            ? `${s.newcomer} is still on the gangplank. The crates are already ashore.`
            : "The crates are ashore. The mainland ledger is updated.",
        });
        return;
      }
      const pay = 12 + s.townHallLevel * 6;
      set({
        supplyTaken: true,
        coins: s.coins + pay,
        bread: s.bread + 1,
        seeds: { ...s.seeds, carrot: (s.seeds.carrot ?? 0) + 1 },
        coinPopKey: s.coinPopKey + 1,
        speech: s.newcomer
          ? `Crates from the mainland. +${pay} coins, bread, and seed. ${s.newcomer} wants to stay.`
          : `Crates from the mainland. +${pay} coins, bread, and seed. The hollow is on a trade route.`,
      });
      sfx("buy");
      scheduleWrite(get);
    },

    welcomeNewcomer: () => {
      const s = get();
      const who = NEWCOMERS.find((n) => n.name === s.newcomer);
      if (!who) {
        set({ speech: "No one came ashore this tide." });
        return;
      }
      const taken = new Set([...s.placed.map((p) => p.slotId), ...s.settlers.map((n) => n.slotId)]);
      const slot = VILLAGE_SLOTS.find((v) => !taken.has(v.id));
      if (!slot) {
        set({ speech: `${who.name} likes the island, but every lane is full. They'll try the next ship.` });
        return;
      }
      set({
        newcomer: null,
        settlers: [...s.settlers, { name: who.name, hat: who.hat, slotId: slot.id }],
        placed: [...s.placed, { id: `ship-${who.name}`, catalogId: "village-cottage", slotId: slot.id }],
        bounceKey: s.bounceKey + 1,
        speech: `${who.name} takes a rowhouse up the lane. One more gnome. The island gets longer.`,
      });
      sfx("place");
      scheduleWrite(get);
    },

    takeFlotsam: (id) => {
      const s = get();
      const key = `${s.daysPlayed}:${id}`;
      if (s.flotsam.includes(key)) return;
      const pay = id.startsWith("shell") ? 2 : 4;
      set({
        flotsam: [...s.flotsam, key],
        coins: s.coins + pay,
        coinPopKey: s.coinPopKey + 1,
        speech: id.startsWith("shell")
          ? `A shell off the tide. +${pay} coins. The beach keeps a ledger too.`
          : `Something from a larger wardrobe washed in. +${pay} coins.`,
      });
      sfx("buy");
      scheduleWrite(get);
    },

    castLine: (where, x, y, boatId) => {
      const s = get();
      if (s.combat || s.fishing) return;
      const rodId = bestRod(s.ownedGear);
      if (!rodId) {
        set({ speech: "You need a rod. The armory sells a stick rod for six coins.", popup: null });
        return;
      }
      const rod = CATALOG_BY_ID[rodId]?.fish ?? 0;
      const lv = levelFromXp(s.skills.fishing);
      const rank = boatId && BOAT_RANK[boatId as keyof typeof BOAT_RANK] ? BOAT_RANK[boatId as keyof typeof BOAT_RANK] : s.boatRank;
      if (where === "sea" && rank < 2) {
        set({
          speech: "The rowboat stays in the shallows. Sail a skiff or bigger, then cast in the open water.",
          popup: null,
        });
        return;
      }
      const fish = rollFish(where, lv, rank, rod);
      if (!fish) {
        set({
          speech:
            where === "sea"
              ? `Nothing out here will take a Fishing ${lv} line from a rank ${rank} hull.`
              : "The shallows are empty for your Fishing level.",
          popup: null,
        });
        return;
      }
      const id = Date.now();
      set({
        fishing: { id, started: id, where, fishId: fish.id, color: fish.color, shadow: fish.shadow, x, y },
        popup: null,
        speech: where === "sea" ? "The rod bends over the deep water." : "The line kisses the shallows.",
        gnomeX: where === "shore" ? 96 : s.gnomeX,
        gnomeY: where === "shore" ? 548 : s.gnomeY,
      });
      sfx("place");
      if (typeof window === "undefined") return;
      window.setTimeout(() => {
        const now = get();
        if (!now.fishing || now.fishing.id !== id) return;
        const caught = FISH_BY_ID[now.fishing.fishId];
        if (!caught) {
          set({ fishing: null });
          return;
        }
        const gained = withXp(now.skills, { fishing: caught.xp });
        set({
          fishing: null,
          fishBag: { ...now.fishBag, [caught.id]: (now.fishBag[caught.id] ?? 0) + 1 },
          skills: gained.skills,
          speech:
            gained.ding ??
            `A ${caught.name.toLowerCase()}! +${caught.xp} Fishing. Sell it, or keep it in the town hall tank.`,
          bounceKey: now.bounceKey + 1,
        });
        sfx("buy");
        scheduleWrite(get);
      }, 2600);
    },

    sellFish: (id) => {
      const s = get();
      const have = s.fishBag[id] ?? 0;
      const fish = FISH_BY_ID[id];
      if (!fish || have < 1) return;
      const next = { ...s.fishBag };
      if (have === 1) delete next[id];
      else next[id] = have - 1;
      set({
        fishBag: next,
        coins: s.coins + fish.price,
        coinPopKey: s.coinPopKey + 1,
        speech: `Sold a ${fish.name.toLowerCase()} for ${fish.price} coins.`,
      });
      sfx("buy");
      scheduleWrite(get);
    },

    stockFish: (id) => {
      const s = get();
      const have = s.fishBag[id] ?? 0;
      const fish = FISH_BY_ID[id];
      if (!fish || have < 1) return;
      const next = { ...s.fishBag };
      if (have === 1) delete next[id];
      else next[id] = have - 1;
      set({
        fishBag: next,
        tank: { ...s.tank, [id]: (s.tank[id] ?? 0) + 1 },
        speech: `The ${fish.name.toLowerCase()} joins the hall tank.`,
      });
      sfx("open");
      scheduleWrite(get);
    },
  };
}
