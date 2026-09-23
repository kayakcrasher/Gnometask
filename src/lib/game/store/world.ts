import { clamp, uid } from "@/lib/utils";
import { ABSENCE_SPOT, DRAGON_RIDGE, WORLD_PACK } from "../catalog";
import { DEFENDERS, NPC_STATS, rolledChart } from "../data/honour";
import { ENEMIES, makeCombat, patrolEnemy, raidKindForHall } from "../combat";
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
  "rallyWalls" | "startPatrol" | "startDragon" | "startCreature" | "startRaidFight" | "startLandingFight" | "strikeFlag" | "sipTea" | "sootheDragon" | "tickWorld"
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
        speech: raid.kind === "goblin" ? "A green goblin from the raft. It wants pie." : "A dark elf from the night tide.",
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

      if (!raids.some((r) => r.swarm) && raids.length === 0 && Math.random() < 0.08) {
        raids = [0, 1, 2, 3].map((i) => ({
          id: uid("swarm"),
          kind: "goblin" as const,
          x: 48 + i * 26,
          y: 490 + (i % 2) * 34,
          hp: 10,
          swarm: true,
        }));
        speech = "A swarm at the dock. Greg, Brine, and Ol Pappy take the shore.";
        changed = true;
      } else if (raids.some((r) => r.swarm)) {
        const who = DEFENDERS[Math.floor(Math.random() * DEFENDERS.length)]!;
        const stat = NPC_STATS[who]!;
        const idx = raids.findIndex((r) => r.swarm && r.hp > 0);
        if (idx >= 0) {
          const hit = Math.max(1, Math.round(stat.atk / 3));
          const hp = raids[idx]!.hp - hit;
          const name = who === "pappy" ? "Ol Pappy" : who === "greg" ? "Watcher Greg" : who[0]!.toUpperCase() + who.slice(1);
          if (hp <= 0) {
            const chart = rolledChart("goblin", get().chart);
            raids = raids.filter((_, i) => i !== idx);
            speech = chart
              ? `${name} drops a goblin. A hide map falls out of its belt.`
              : `${name} drops a goblin. The town's honour holds. +1 respect.`;
            set({
              respect: get().respect + 1,
              chart: get().chart || chart,
              coins: get().coins + 4,
            });
          } else {
            raids = raids.map((r, i) => (i === idx ? { ...r, hp } : r));
            speech = `${name} strikes from the shore. The goblin has ${hp} left.`;
          }
          changed = true;
        }
      } else if (raids.length < 2 && Math.random() < 0.38) {
        const kind = raidKindForHall(s.townHallLevel);
        if (kind === "goblin" && s.guardLevel >= 3 && Math.random() < 0.7) {
          speech = "The Guardsgnome sees off a goblin raft. Haven's spear, town's peace.";
          changed = true;
        } else if (kind === "darkelf" && s.guardLevel >= 5 && Math.random() < 0.55) {
          speech = "The Guardsgnome stares a dark elf back onto the tide. Impressive.";
          changed = true;
        } else {
          const raid = {
            id: uid("raid"),
            kind,
            x: 70 + Math.random() * 80,
            y: 470 + Math.random() * 70,
            hp: ENEMIES[kind].hp,
          };
          raids = [...raids, raid];
          speech = kind === "goblin" ? "Goblins at the dock!" : "Dark elves on the night tide!";
          changed = true;
        }
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

      if (!changed) return;
      set({ buildingHp, raids, speech, chicken, hp });
      scheduleWrite(get);
    },
  };
}
