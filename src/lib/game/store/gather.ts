import { bestHatchet, bestRod, CATALOG_BY_ID, gearStats } from "../catalog";
import { TREE_GROW_MS, TREE_SAPLING_MS, TREE_SPOTS, logsFor, treeSize } from "../data/trees";
import { sfx } from "../juice";
import { PLACE_ANCHORS, VILLAGE_SLOTS } from "../data/layout";
import { BOAT_RANK, boatById } from "../data/boats";
import { NEWCOMERS, supplyDue } from "../data/supply";
import { FISH_BY_ID, rollFish } from "../data/fish";
import { levelFromXp, levelsOf } from "../xp";
import { clearSeaSegment, DOCKING_RANGE, HARBOUR_APPROACH, navigableWater, SAILING_XP_DISTANCE } from "../sailing";
import { scheduleWrite, withXp } from "./persist";
import type { GameState, StoreGet, StoreSet } from "./types";

function treeStage(rec: { stage?: string; choppedAt?: number } | undefined, now: number) {
  if (rec?.stage === "gone") return "gone" as const;
  if (!rec?.choppedAt) return "grown" as const;
  const age = now - rec.choppedAt;
  if (age < TREE_SAPLING_MS) return "stump" as const;
  if (age < TREE_GROW_MS) return "sapling" as const;
  return "grown" as const;
}

export function gatherSlice(
  set: StoreSet,
  get: StoreGet,
): Pick<GameState, "setPraying" | "chopTree" | "plantSapling" | "sellLogs" | "sailTo" | "sailStep" | "buyBoat" | "buyCannon" | "advanceCoach" | "takeSupply" | "welcomeNewcomer" | "takeFlotsam" | "castLine" | "sellFish" | "stockFish"> {
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
      const stage = treeStage(rec, Date.now());
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
      const logs = logsFor(spot) + Math.floor(Math.max(0,wc-1)/3);
      const nextLogs = s.logs + logs;
      const quests = s.quests.map((q) =>
        q.id === "pappy-timber" && q.stage === "active" ? { ...q, stage: "ready" as const } : q,
      );
      set({
        logs: nextLogs,
        saplings: s.saplings + 2,
        trees: { ...s.trees, [treeId]: { stage: "gone", choppedAt: Date.now() } },
        skills: gained.skills,
        popup: null,
        quests,
        speech:
          gained.ding ??
          `The ${treeSize(spot)} ${spot.kind} comes down. +${logs} logs, 2 saplings, +${xp} Woodcutting. The spot is clear if you want it gone.`,
        bounceKey: s.bounceKey + 1,
      });
      sfx("place");
      scheduleWrite(get);
      const chore = get().tasks.find((t) => t.builtinKey === "chop-stakes" && !t.done);
      if (chore) get().toggleTask(chore.id);
    },

    plantSapling: (treeId) => {
      const s = get();
      const spot = TREE_SPOTS.find((t) => t.id === treeId);
      if (!spot) return;
      if (treeStage(s.trees[treeId], Date.now()) !== "gone") {
        set({ speech: "Something is already growing there." });
        return;
      }
      if (s.saplings < 1) {
        set({ speech: "No sapling in the sack. Chop a tree. They drop two." });
        return;
      }
      set({
        saplings: s.saplings - 1,
        trees: { ...s.trees, [treeId]: { stage: "sapling", choppedAt: Date.now() - TREE_SAPLING_MS } },
        popup: null,
        speech: "Sapling in the ground. It will remember being a tree.",
      });
      sfx("place");
      scheduleWrite(get);
    },

    sellLogs: () => {
      const s = get();
      if (s.logs < 1) {
        set({ speech: "No logs to sell." });
        return;
      }
      set({
        logs: s.logs - 1,
        coins: s.coins + 2,
        coinPopKey: s.coinPopKey + 1,
        speech: "The counter takes a log. +2 coins.",
      });
      sfx("buy");
      scheduleWrite(get);
    },

    sailTo: (dest, boatId) => {
      const s = get();
      if (s.combat || s.fishing) return;
      if (dest === "dock") {
        if (!s.afloat) {
          set({ speech: "You are already ashore.", popup: null });
          return;
        }
        if (Math.hypot(s.gnomeX - HARBOUR_APPROACH.x, s.gnomeY - HARBOUR_APPROACH.y) > DOCKING_RANGE) {
          set({ sailHome: true, popup: null, speech: "Sailing back to the town harbour. Tap another patch of water to change course." });
          return;
        }
        set({
          gnomeX: PLACE_ANCHORS.dock.x, gnomeY: PLACE_ANCHORS.dock.y,
          afloat: null, sailHome: false, popup: null, interior: null,
          selectedPlace: "dock", speech: "Moored safely. Back on the town dock.",
        });
        sfx("open");
        scheduleWrite(get);
        return;
      }
      if (s.afloat) {
        set({ speech: "Return to the harbour before changing boats.", popup: null });
        return;
      }
      if (Math.hypot(s.gnomeX - PLACE_ANCHORS.dock.x, s.gnomeY - PLACE_ANCHORS.dock.y) > 130) {
        set({ speech: "Come to the town dock to board a boat." });
        return;
      }
      const boat = boatById(boatId ?? "row");
      if (!boat) return;
      if (boat.id !== "row" && !s.hulls.includes(boat.id)) {
        set({ speech: `${boat.name} isn't yours. Wim sells her at the dockhouse.`, popup: null });
        return;
      }
      const lv = levelFromXp(s.skills.sailing);
      if (lv < boat.need) {
        set({ speech: `${boat.name} needs Sailing ${boat.need}. Sail the boats you know to gain experience.`, popup: null });
        return;
      }
      set({
        gnomeX: boat.x, gnomeY: boat.y, afloat: boat.id, sailHome: false,
        selectedPlace: "dock", boatRank: Math.max(s.boatRank, BOAT_RANK[boat.id]),
        popup: null, interior: null,
        speech: `The ${boat.name.toLowerCase()} casts off. Tap the water to sail. Distance travelled earns Sailing XP.`,
        bounceKey: s.bounceKey + 1,
      });
      sfx("open");
      scheduleWrite(get);
    },

    sailStep: (x, y) => {
      const s = get();
      const boat = s.afloat ? boatById(s.afloat) : null;
      if (!boat || s.combat || s.atHome || s.interior || s.abroad || s.fishing) return;
      const distance = Math.hypot(x - s.gnomeX, y - s.gnomeY);
      // Only actual movement steps earn XP; boarding and port transfers do not.
      if (!Number.isFinite(distance) || distance <= 0 || distance > 50
        || !navigableWater(x, y) || !clearSeaSegment({ x: s.gnomeX, y: s.gnomeY }, { x, y })) return;
      const before = s.sailingDistance ?? 0;
      const total = before + distance;
      const xp = (Math.floor(total / SAILING_XP_DISTANCE) - Math.floor(before / SAILING_XP_DISTANCE)) * boat.xp;
      const gained = xp ? withXp(s.skills, { sailing: xp }) : null;
      set({
        gnomeX: x, gnomeY: y, sailingDistance: total,
        ...(gained ? { skills: gained.skills, speech: gained.ding ?? `+${xp} Sailing XP. Steady on the water.` } : {}),
      });
      scheduleWrite(get);
      if (xp) {
        const chore = get().tasks.find(t => t.builtinKey === "coil-watch" && !t.done);
        if (chore) get().toggleTask(chore.id);
      }
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

    buyCannon: () => {
      const s = get();
      if (s.cannons) {
        set({ speech: "The cannons are already bolted to every hull." });
        return;
      }
      if (s.coins < 45) {
        set({ speech: "A cannon is 45 coins. Wim taps the barrel." });
        sfx("error");
        return;
      }
      set({
        coins: s.coins - 45,
        cannons: true,
        coinPopKey: s.coinPopKey + 1,
        speech: "Wim bolts a cannon onto every boat you sail. Goblin hulls are the target.",
      });
      sfx("buy");
      scheduleWrite(get);
    },

    advanceCoach: () => {
      const s = get();
      const next = Math.min(5, (s.coach || 1) + 1);
      set({ coach: next });
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
      const shipped = s.herd.shipped;
      const herd = shipped
        ? { ...s.herd, calves: Math.max(0, s.herd.calves - shipped), shipped: 0 }
        : s.herd;
      set({
        supplyTaken: true,
        herd,
        bread: s.bread + 1,
        seeds: { ...s.seeds, carrot: (s.seeds.carrot ?? 0) + 1 },
        speech: shipped
          ? `Crates ashore. Bread and seed. The ship takes ${shipped} calf${shipped === 1 ? "" : "ves"} the shop already paid for.`
          : s.newcomer
            ? `Crates ashore. Bread and seed. ${s.newcomer} wants to stay. Sell what you gather at the shop.`
            : "Crates ashore. Bread and seed. Coins come from the shop counter, not the gangplank.",
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
        settlers: [
          ...s.settlers,
          {
            name: who.name,
            hat: who.hat,
            slotId: slot.id,
            arrived: s.daysPlayed,
            purse: 18,
            weapon: null,
            stall: null,
            shift: null,
          },
        ],
        bounceKey: s.bounceKey + 1,
        speech: `${who.name} buys the plot with their own coins. The house waits a day. Then they trade. Then, if the hollow still needs it, they take a watch.`,
      });
      sfx("place");
      scheduleWrite(get);
    },

    takeFlotsam: (id) => {
      const s = get();
      const key = `${s.daysPlayed}:${id}`;
      if (s.flotsam.includes(key)) return;
      const good = id.startsWith("shell") ? "shell" : "cloth";
      set({
        flotsam: [...s.flotsam, key],
        goods: { ...s.goods, [good]: (s.goods[good] ?? 0) + 1 },
        speech: good === "shell"
          ? "A shell. It is not coins until the shop says so."
          : "Cloth off the tide. The shop counter buys washed things.",
      });
      sfx("buy");
      scheduleWrite(get);
    },

    castLine: (where, x, y, boatId) => {
      const s = get();
      if (s.combat || s.fishing) return;
      if (where === "shore" && s.afloat) {
        set({ speech: "Return to the harbour before fishing from the shore.", popup: null });
        return;
      }
      const rodId = bestRod(s.ownedGear);
      if (!rodId) {
        set({ speech: "You need a rod. The armory sells a stick rod for six coins.", popup: null });
        return;
      }
      const rod = CATALOG_BY_ID[rodId]?.fish ?? 0;
      const lv = levelFromXp(s.skills.fishing);
      const activeBoat = s.afloat ? boatById(s.afloat) : null;
      if (where === "sea" && !activeBoat) {
        set({ speech: "Board a boat before fishing in open water.", popup: null });
        return;
      }
      const rank = activeBoat ? BOAT_RANK[activeBoat.id] : 1;
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
        fishing: { id, started: id, where, fishId: fish.id, color: fish.color, shadow: fish.shadow,
          x: where === "sea" ? s.gnomeX : x, y: where === "sea" ? s.gnomeY : y },
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
