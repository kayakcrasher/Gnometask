import { clamp, uid } from "@/lib/utils";
import { ABSENCE_SPOT, DRAGON_RIDGE, WORLD_PACK } from "../catalog";
import { rolledChart } from "../data/honour";
import { BEERS, caseBrief, stepCivic, type CivicTown } from "../data/civic";
import { pickStriker, tideShift, watchNames } from "../data/folk";
import { ENEMIES, makeCombat, patrolEnemy } from "../combat";
import { sfx } from "../juice";
import { maxHitpoints } from "../xp";
import type { PlaceId } from "../types";
import { armAutoAttack, clearCombatTimer, rememberLoot, scheduleWrite } from "./persist";
import { winCombat } from "./combat";
import type { GameState, StoreGet, StoreSet } from "./types";

export function worldSlice(
  set: StoreSet,
  get: StoreGet,
): Pick<
  GameState,
  "rallyWalls" | "startPatrol" | "startDragon" | "startCreature" | "startRaidFight" | "startLandingFight" | "strikeFlag" | "fireCannon" | "sipTea" | "sootheDragon" | "tickWorld" | "enterCourt" | "advanceCase" | "enterPub" | "buyPint"
> {
  return {
    rallyWalls: () => {
      const s = get();
      if (s.combat) return;
      if (s.fortLevel < 4) {
        set({ speech: "The walls are not ready. Buy palisades at the builder's yard." });
        return;
      }
      if (s.lifeDragon.state === "defeated") {
        set({ speech: `${s.lifeDragon.name} already yielded to the gate.` });
        return;
      }
      if (s.fortLevel >= 5) {
        set({
          lifeDragon: { ...s.lifeDragon, state: "defeated", hp: 0 },
          ownedHats: s.ownedHats.includes("hat-dragon") ? s.ownedHats : [...s.ownedHats, "hat-dragon"],
          hat: "hat-dragon",
          coins: s.coins + 40,
          wildWins: s.wildWins + 1,
          bounceKey: s.bounceKey + 1,
          coinPopKey: s.coinPopKey + 1,
          speech: `The dragon gate holds. ${s.lifeDragon.name} wheels off, muttering. Defeated — by timber.`,
        });
        sfx("win");
        scheduleWrite(get);
        return;
      }
      get().startDragon("dragon");
      const c = get().combat;
      if (c) {
        const dmg = 40 + s.fortLevel * 8;
        const hp = Math.max(0, c.enemyHp - dmg);
        if (hp <= 0) {
          winCombat(get, set, c, `The ballista speaks. ${s.lifeDragon.name} yields.`);
          return;
        }
        set({ combat: { ...c, enemyHp: hp, log: `The walls fire. ${dmg} to ${s.lifeDragon.name}.` } });
      }
    },

    startPatrol: (place?: PlaceId) => {
      const s = get();
      if (s.combat) return;
      const pool = WORLD_PACK.filter((p) => (!place || p.place === place) && !s.clearedPack.includes(p.id));
      const pick = pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
      const id = pick ? pick.enemy : patrolEnemy(s.wildWins);
      const at = place ?? pick?.place ?? "wildlands";
      clearCombatTimer();
      set({
        combat: makeCombat(id, s.hp, {
          packId: pick?.id,
          playerMax: maxHitpoints(s.skills),
          atX: s.gnomeX + 48,
          atY: s.gnomeY - 6,
          skills: s.skills,
        }),
        selectedPlace: at,
        popup: null,
        interior: null,
        panel: "place",
        speech: "Something on the land would like a word.",
      });
      armAutoAttack(get, 800);
    },

    startDragon: (which = "dragon") => {
      const s = get();
      if (s.combat) return;
      if (which === "absence") {
        if (!s.absencePending) {
          set({ speech: "No blue guest today. Keep skipping days and it will visit." });
          return;
        }
        clearCombatTimer();
        set({
          combat: makeCombat("absence", s.hp, {
            name: "The Absence Dragon",
            playerMax: maxHitpoints(s.skills),
            atX: ABSENCE_SPOT.x,
            atY: ABSENCE_SPOT.y,
            skills: s.skills,
          }),
          gnomeX: ABSENCE_SPOT.x - 44,
          gnomeY: ABSENCE_SPOT.y + 10,
          popup: null,
          interior: null,
          panel: "place",
          speech: "The fat blue dragon opens one eye. Mid damage. Maximum presence.",
        });
        armAutoAttack(get, 900);
        return;
      }
      if (s.townHallLevel < 3) {
        set({ speech: "The ridge is empty. Ember will not show until the town hall is level 3." });
        return;
      }
      if (s.lifeDragon.state === "defeated") {
        set({ speech: `${s.lifeDragon.name} is done with you. For now. Call a new one from the menu.` });
        return;
      }
      if (s.lifeDragon.state === "soothed") {
        set({ speech: `${s.lifeDragon.name} is napping on a honey cake. Best not.` });
        return;
      }
      const at = s.lifeDragon.state === "raiding" ? { x: 980, y: 420 } : DRAGON_RIDGE;
      const combat = makeCombat("dragon", s.hp, {
        name: s.lifeDragon.name,
        playerMax: maxHitpoints(s.skills),
        atX: at.x,
        atY: at.y,
        skills: s.skills,
      });
      combat.enemyHp = s.lifeDragon.hp > 0 ? Math.min(s.lifeDragon.hp, combat.enemyMax) : combat.enemyMax;
      clearCombatTimer();
      set({
        combat,
        gnomeX: at.x - 52,
        gnomeY: at.y + 12,
        selectedPlace: "wildlands",
        popup: null,
        interior: null,
        panel: "place",
        speech: `${s.lifeDragon.name} lifts a head. The air tastes like cinnamon and trouble.`,
      });
      armAutoAttack(get, 900);
    },

    startCreature: (packId, enemyId) => {
      const s = get();
      if (s.combat) return;
      const pack = WORLD_PACK.find((p) => p.id === packId);
      if (s.clearedPack.includes(packId)) {
        set({
          speech: "Already scurried off. For now.",
          selectedPlace: pack?.place ?? "wildlands",
        });
        return;
      }
      set({
        combat: makeCombat(enemyId, s.hp, {
          packId,
          playerMax: maxHitpoints(s.skills),
          atX: pack?.x ?? s.gnomeX + 48,
          atY: pack?.y ?? s.gnomeY,
          skills: s.skills,
        }),
        selectedPlace: pack?.place ?? "wildlands",
        popup: null,
        interior: null,
        panel: "place",
        gnomeX: (pack?.x ?? s.gnomeX) - 42,
        gnomeY: pack?.y ?? s.gnomeY,
        speech: "Something on the land wants a word.",
      });
      armAutoAttack(get, 800);
    },

    startRaidFight: (raidId) => {
      const s = get();
      if (s.combat) return;
      const raid = s.raids.find((r) => r.id === raidId);
      if (!raid) return;
      set({
        combat: makeCombat(raid.kind, s.hp, {
          raidId,
          name: ENEMIES[raid.kind].name,
          playerMax: maxHitpoints(s.skills),
          atX: raid.x,
          atY: raid.y,
          skills: s.skills,
        }),
        popup: null,
        interior: null,
        panel: "place",
        selectedPlace: "dock",
        gnomeX: raid.x - 42,
        gnomeY: raid.y,
        speech: raid.kind === "goblin" ? "A goblin. It came to steal, not to talk." : "A dark elf. The hollow is working, so they came to stop it.",
      });
      armAutoAttack(get, 800);
    },

    startLandingFight: (goblinId) => {
      const s = get();
      if (s.combat) return;
      const g = s.landing?.goblins.find((x) => x.id === goblinId && x.alive);
      if (!g || !s.landing) return;
      set({
        combat: makeCombat("runt", s.hp, {
          packId: g.id,
          name: `Mucktooth runt`,
          playerMax: maxHitpoints(s.skills),
          atX: g.x,
          atY: g.y,
          skills: s.skills,
        }),
        popup: null,
        interior: null,
        panel: "place",
        selectedPlace: "dock",
        gnomeX: g.x - 42,
        gnomeY: g.y,
        speech: `A green Mucktooth runt from the ${s.landing.tribe} boat.`,
      });
      armAutoAttack(get, 800);
    },

    strikeFlag: () => {
      const s = get();
      const landing = s.landing;
      if (s.combat || !landing) return;
      if (landing.flagDown) {
        set({ popup: null, speech: "The Mucktooth cloth is already in the sand." });
        return;
      }
      const dmg = s.combatStyle === "strength" ? 4 : 3;
      const flagHp = Math.max(0, (landing.flagHp ?? 10) - dmg);
      const flagDown = flagHp <= 0;
      const loot = flagDown ? rememberLoot(get, set, landing.boatX, landing.boatY, 1, 6) : {};
      const shoreClear = landing.goblins.every((g) => !g.alive);
      const quests =
        flagDown && shoreClear
          ? s.quests.map((q) =>
              q.id === "pappy-landing" && q.stage === "active" ? { ...q, stage: "ready" as const } : q,
            )
          : s.quests;
      set({
        ...loot,
        landing: { ...landing, flagHp, flagDown },
        quests,
        popup: null,
        gnomeX: landing.boatX + 26,
        gnomeY: landing.boatY,
        speech: flagDown
          ? shoreClear
            ? "The banner is down and the shore is clear. Bones and 6 coins. Tell Ol Pappy."
            : "Their flag is in the sand. Bones and 6 coins. The runts are still here."
          : `The banner rips. ${flagHp} left on the cloth.`,
      });
      sfx(flagDown ? "win" : "hit");
      scheduleWrite(get);
    },

    fireCannon: () => {
      const s = get();
      const landing = s.landing;
      if (!s.cannons) {
        set({ speech: "No cannon. Wim sells one at the dock for 45 coins." });
        return;
      }
      if (!s.afloat) {
        set({ speech: "The cannon wants a deck. Cast off first." });
        return;
      }
      if (!landing) {
        set({ speech: "No goblin boat on the water." });
        return;
      }
      const dist = Math.hypot(s.gnomeX - landing.boatX, s.gnomeY - landing.boatY);
      if (dist > 320) {
        set({ speech: "Too far. Sail closer to their hull." });
        return;
      }
      const goblins = landing.goblins.map((g) => ({ ...g }));
      const runt = goblins.find((g) => g.alive);
      let speech = "The cannon coughs smoke and hits water.";
      if (runt) {
        runt.alive = false;
        speech = "The cannon takes a runt off their deck.";
      }
      const flagHp = runt ? landing.flagHp : Math.max(0, (landing.flagHp ?? 10) - 4);
      const flagDown = flagHp <= 0 || landing.flagDown;
      set({
        landing: { ...landing, goblins, flagHp, flagDown },
        speech: flagDown && !landing.flagDown ? "Their flag takes the shot and drops." : speech,
      });
      sfx("hit");
      scheduleWrite(get);
    },

    sipTea: () => {
      const s = get();
      const max = maxHitpoints(s.skills);
      if (s.hp >= max) {
        set({ selectedPlace: "cottage", speech: "Already full of tea." });
        return;
      }
      set({
        hp: max,
        selectedPlace: "cottage",
        speech: "Kettle, blanket, better. Heart full again.",
      });
      scheduleWrite(get);
    },

    sootheDragon: () => {
      const st = get();
      if (st.honey < 1) {
        set({ speech: "A polite jar of nothing. Buy a honey cake at the bakery." });
        return;
      }
      if (st.lifeDragon.state === "defeated") {
        set({ speech: `${st.lifeDragon.name} already left a thank-you scale on the stoop.` });
        return;
      }
      const gifts = st.emberGifts + 1;
      set({
        honey: st.honey - 1,
        emberGifts: gifts,
        lifeDragon: { ...st.lifeDragon, state: "soothed" },
        bounceKey: st.bounceKey + 1,
        speech: `${st.lifeDragon.name} takes the cake. The roofs stop smouldering. For today.`,
      });
      sfx("win");
      scheduleWrite(get);
    },

    enterCourt: (town: CivicTown) => {
      const s = get();
      set({
        interior: "court",
        popup: null,
        panel: "place",
        civic: { ...s.civic, hearing: town },
        speech: caseBrief(s.civic.caseStage, town),
      });
    },

    advanceCase: () => {
      const s = get();
      if (s.civic.hearing !== "capitol") {
        set({ speech: "This bench keeps the lane. The dock case is at the Supreme Court in Port Victoria." });
        return;
      }
      const stage = s.civic.caseStage;
      if (stage >= 3) {
        set({ speech: "The bargain stands. Cruise ships pay Port Victoria. Sunstep has its dock." });
        return;
      }
      const next = (stage + 1) as 1 | 2 | 3;
      const dock = next >= 3;
      set({
        civic: { ...s.civic, caseStage: next, dock },
        speech: caseBrief(next, "capitol"),
      });
      sfx(dock ? "win" : "open");
      scheduleWrite(get);
    },

    enterPub: (town: CivicTown) => {
      const s = get();
      const pub = s.civic.pubs.find((p) => p.town === town);
      set({
        interior: "pub",
        popup: null,
        panel: "place",
        civic: { ...s.civic, atPub: town },
        speech: pub
          ? `${pub.owner} keeps ${pub.name}. Beloved, and the bank book already holds ${pub.bank}.`
          : "The pub is dark.",
      });
    },

    buyPint: (beerId: string) => {
      const s = get();
      const beer = BEERS.find((b) => b.id === beerId);
      const pub = s.civic.pubs.find((p) => p.town === s.civic.atPub) ?? s.civic.pubs[0];
      if (!beer || !pub) return;
      if (s.coins < beer.price) {
        set({ speech: `${beer.name} is ${beer.price} coins. ${pub.owner} taps the bar.` });
        sfx("error");
        return;
      }
      const max = maxHitpoints(s.skills);
      set({
        coins: s.coins - beer.price,
        coinPopKey: s.coinPopKey + 1,
        hp: Math.min(max, s.hp + (beer.id === "stout" ? 4 : 1)),
        civic: {
          ...s.civic,
          pubs: s.civic.pubs.map((p) => (p.town === pub.town ? { ...p, bank: p.bank + beer.price } : p)),
        },
        speech: `${pub.owner} draws ${beer.name}. ${beer.blurb} The till, and the interest, both notice.`,
      });
      sfx("buy");
      scheduleWrite(get);
    },

    tickWorld: () => {
      const s = get();
      if (!s.named || s.combat) return;
      let buildingHp = s.buildingHp;
      let speech = s.speech;
      let raids = s.raids;
      let changed = false;

      if (s.lifeDragon.state === "raiding" && s.townHallLevel >= 3) {
        const scorch = Math.max(1, 4 - s.fortLevel);
        buildingHp = {
          cottage: Math.max(0, buildingHp.cottage - scorch),
          village: Math.max(0, buildingHp.village - scorch),
          haven: buildingHp.haven,
        };
        speech = `${s.lifeDragon.name} breathes on the village. Repair the roofs — or fight.`;
        changed = true;
      }

      if (s.absencePending && Math.random() < 0.2) {
        const scorch = 3;
        buildingHp = {
          cottage: Math.max(0, buildingHp.cottage - scorch),
          village: Math.max(0, buildingHp.village - 2),
          haven: buildingHp.haven,
        };
        changed = true;
      }

      let waveDay = s.waveDay;
      if (waveDay !== s.daysPlayed) {
        const n = Math.max(1, s.daysPlayed);
        const fresh = Array.from({ length: n }, (_, i) => ({
          id: uid("wave"),
          kind: "goblin" as const,
          x: 30 + (i % 6) * 34,
          y: 790 + Math.floor(i / 6) * 30,
          hp: 8,
          swarm: true,
        }));
        raids = [...raids.filter((r) => !r.swarm), ...fresh];
        waveDay = s.daysPlayed;
        const posted = watchNames(s.daysPlayed, s.settlers).join(", ") || "the shore";
        speech =
          n === 1
            ? `One goblin on the sand. Tomorrow there will be two. ${posted} are watching.`
            : `A wave of ${n}. One more than yesterday. ${posted} take the ${tideShift(s.daysPlayed)} watch.`;
        changed = true;
      } else if (raids.some((r) => r.swarm)) {
        const who = pickStriker(s.daysPlayed, s.settlers);
        const idx = raids.findIndex((r) => r.swarm && r.hp > 0);
        if (idx >= 0) {
          const hit = Math.max(1, Math.round(who.atk / 3));
          const hp = raids[idx]!.hp - hit;
          if (hp <= 0) {
            const chart = rolledChart("goblin", get().chart);
            raids = raids.filter((_, i) => i !== idx);
            speech = chart
              ? `${who.name} drops a goblin. A hide map falls out of its belt.`
              : `${who.name} drops a goblin. The town's honour holds. +1 respect.`;
            set({
              respect: get().respect + 1,
              chart: get().chart || chart,
              coins: get().coins + 4,
            });
          } else {
            raids = raids.map((r, i) => (i === idx ? { ...r, hp } : r));
            speech = `${who.name} has an eye on the shore. The goblin has ${hp} left.`;
          }
          changed = true;
        }
      } else if (s.townHallLevel >= 3 && raids.length < 2 && Math.random() < 0.08) {
        const raid = {
          id: uid("raid"),
          kind: "darkelf" as const,
          x: 70 + Math.random() * 80,
          y: 470 + Math.random() * 70,
          hp: ENEMIES.darkelf.hp,
        };
        raids = [...raids, raid];
        speech = "Dark elves on the night tide. The goblin count still rises with the day.";
        changed = true;
      }

      let chicken = s.chicken;
      if (chicken && !s.chickenHeld) {
        chicken = {
          x: clamp(chicken.x + (Math.random() - 0.5) * 40, 140, 680),
          y: clamp(chicken.y + (Math.random() - 0.5) * 40, 580, 900),
        };
        changed = true;
      }

      const max = maxHitpoints(s.skills);
      const hp = s.hp < max ? Math.min(max, s.hp + 1) : s.hp;
      if (hp !== s.hp) changed = true;

      const civic = stepCivic(s.civic, s.daysPlayed);
      const loud = /timber|story|lantern|jar|rental|still|household|cruise|back room/;
      const newsChanged = civic.news !== s.civic.news && loud.test(civic.news);
      if (newsChanged) speech = civic.news;
      void changed;

      set({ buildingHp, raids, speech, chicken, hp, waveDay, civic });
      scheduleWrite(get);
    },
  };
}
