import { BOAT_RANK } from "../data/boats";
import { ISLE_BY_ID, raidLoot, repeatTier } from "../data/isles";
import { CATALOG_BY_ID } from "../catalog";
import { ENEMIES, makeCombat } from "../combat";
import { raidAccess } from "../raid-state";
import { maxHitpoints } from "../xp";
import { sfx } from "../juice";
import { armAutoAttack, scheduleWrite, withXp } from "./persist";
import type { GameState, StoreGet, StoreSet } from "./types";

export function islandsSlice(
  set: StoreSet,
  get: StoreGet,
): Pick<GameState, "raidIsle" | "fightIsleDefender" | "claimRaidChest"> {
  return {
    raidIsle: (id) => {
      const s = get(),
        isle = ISLE_BY_ID[id];
      if (!isle || s.combat || s.naval?.battle || s.naval?.rescue || s.naval?.boarding || s.fishing || s.atHome) return;
      if (s.abroad) {
        set({ speech: "Return home before setting out for another island." });
        return;
      }
      const { boat, reason } = raidAccess(s, isle);
      if (reason || !boat) {
        set({ speech: reason ?? "Choose a seaworthy boat." });
        return;
      }
      const previous = s.raidProgress?.[id];
      const progress =
        previous && !previous.claimed
          ? previous
          : { defeated: [], claimed: false };
      const returnX = s.afloat ? s.gnomeX : boat.x,
        returnY = s.afloat ? s.gnomeY : boat.y;
      set({
        raidVisit: { isleId: id, boat: boat.id, returnX, returnY },
        raidProgress: { ...s.raidProgress, [id]: progress },
        abroad: id as GameState["abroad"],
        afloat: boat.id,
        gnomeX: returnX,
        gnomeY: returnY,
        boatRank: Math.max(s.boatRank, BOAT_RANK[boat.id]),
        interior: null,
        popup: null,
        panel: "place",
        sailHome: false,
        speech: `${isle.name}. ${progress.defeated.length ? "Your cleared path is still open." : "Clear the crew, defeat their leader, then claim the chest."}`,
      });
      sfx("open");
      scheduleWrite(get);
    },

    fightIsleDefender: (targetId) => {
      const s = get(),
        visit = s.raidVisit;
      if (
        !visit ||
        s.abroad !== visit.isleId ||
        s.combat ||
        s.fishing ||
        s.atHome
      )
        return;
      const isle = ISLE_BY_ID[visit.isleId];
      if (!isle) return;
      const progress = s.raidProgress[isle.id] ?? {
        defeated: [],
        claimed: false,
      };
      if (progress.claimed || progress.defeated.includes(targetId)) return;
      const boss = targetId === isle.boss.id;
      const target = boss
        ? isle.boss
        : isle.defenders.find((d) => d.id === targetId);
      if (!target) return;
      if (
        boss &&
        isle.defenders.some((d) => !progress.defeated.includes(d.id))
      ) {
        set({
          speech:
            "The crew still guards the approach. Defeat them before challenging the captain.",
        });
        return;
      }
      const base = ENEMIES[target.kind];
      const tier = repeatTier(s.isles[isle.id]?.cleared ?? 0);
      const name = boss
        ? isle.boss.name
        : `${base.name} ${isle.defenders.findIndex((d) => d.id === targetId) + 1}`;
      set({
        combat: makeCombat(target.kind, s.hp, {
          name,
          skills: s.skills,
          playerMax: maxHitpoints(s.skills),
          atX: s.gnomeX,
          atY: s.gnomeY,
          stats: {
            hp: Math.round(target.hp * (1 + tier * 0.08)),
            dmg: target.dmg + Math.floor(tier / 2),
            def: base.def,
            coins: boss ? 0 : base.coins,
          },
          islandTarget: { isleId: isle.id, targetId, boss },
        }),
        popup: null,
        interior: null,
        panel: "place",
        speech: `${name} blocks the path.`,
      });
      armAutoAttack(get, 1200);
    },

    claimRaidChest: () => {
      const s = get(),
        visit = s.raidVisit;
      if (!visit || s.abroad !== visit.isleId || s.combat || s.atHome) return;
      const isle = ISLE_BY_ID[visit.isleId],
        progress = s.raidProgress[visit.isleId];
      if (
        !isle ||
        !progress ||
        progress.claimed ||
        !progress.defeated.includes(isle.boss.id) ||
        isle.defenders.some((d) => !progress.defeated.includes(d.id))
      )
        return;
      const cleared = s.isles[isle.id]?.cleared ?? 0;
      const loot = raidLoot(isle.id, cleared);
      const drop = loot.drop ? CATALOG_BY_ID[loot.drop] : null;
      const gained = withXp(s.skills, {
        sailing: isle.sailNeed * (cleared ? 20 : 60),
      });
      const coins = loot.coins;
      set({
        raidProgress: {
          ...s.raidProgress,
          [isle.id]: { ...progress, claimed: true },
        },
        isles: {
          ...s.isles,
          [isle.id]: { cleared: cleared + 1, lastRaidedDay: s.daysPlayed },
        },
        flagsPlanted: (s.flagsPlanted ?? 0) + (cleared === 0 ? isle.flags : 0),
        respect: s.respect + (cleared === 0 ? isle.flags * 3 : 1),
        coins: s.coins + coins,
        bones: s.bones + loot.bones,
        skills: gained.skills,
        ownedHats:
          drop?.kind === "hat" && !s.ownedHats.includes(drop.id)
            ? [...s.ownedHats, drop.id]
            : s.ownedHats,
        ownedGear:
          drop?.slot && !s.ownedGear.includes(drop.id)
            ? [...s.ownedGear, drop.id]
            : s.ownedGear,
        surrendered: isle.id === "mucktooth" ? true : s.surrendered,
        muckRaiders:
          isle.id === "mucktooth"
            ? s.muckRaiders.map(() => false)
            : s.muckRaiders,
        coinPopKey: s.coinPopKey + 1,
        bounceKey: s.bounceKey + 1,
        speech: `${isle.boss.name} yields the island. +${coins} coins, +${loot.bones} bones.${drop ? ` ${drop.name} is yours.` : ""} ${gained.ding ?? "The voyage sharpens your Sailing."}`,
      });
      sfx("win");
      scheduleWrite(get);
    },
  };
}
