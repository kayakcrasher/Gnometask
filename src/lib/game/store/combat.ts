import { localDate } from "@/lib/utils";
import { gearStats } from "../catalog";
import { ENEMIES, roll, type CombatState } from "../combat";
import { sfx } from "../juice";
import { PLAYER_START, type GameSave } from "../types";
import { hitChance, levelsOf, maxHit, maxHitpoints } from "../xp";
import { landingAlive, landingCleared } from "../data/landing";
import { armAutoAttack, clearCombatTimer, foodCount, scheduleWrite, setCombatTimer, withXp } from "./persist";
import type { StoreGet, StoreSet, GameState } from "./types";

function defencePower(s: GameSave) {
  return gearStats(s.equipment.shield).def + gearStats(s.equipment.armor).def;
}

function incoming(s: GameSave & { praying?: boolean }, raw: number, vsDragon = false) {
  let dmg = raw - defencePower(s) - Math.floor(levelsOf(s.skills).defence / 5);
  if (vsDragon) dmg -= s.fortLevel;
  if (s.praying) dmg = Math.floor(dmg * 0.5);
  return Math.max(1, dmg);
}

export function finishEnemyTurn(get: StoreGet, set: StoreSet, combat: CombatState) {
  if (combat.phase !== "enemy") return;
  const live = get().combat;
  if (!live || live.enemyId !== combat.enemyId || live.phase !== "enemy") return;
  const s = get();
  const e = ENEMIES[combat.enemyId];
  const miss = (combat.enemyId === "sprite" && Math.random() < 0.22) || (combat.enemyId === "runt" && Math.random() < 0.55);
  if (miss) {
    set({
      combat: {
        ...live,
        phase: "player",
        striking: false,
        splatOnPlayer: "miss",
        splatOnEnemy: null,
        log: combat.enemyId === "runt" ? "The runt swings at the air." : "The sprite misses. Leaves everywhere.",
      },
    });
    armAutoAttack(get, 1500);
    return;
  }
  const fire = (combat.enemyId === "dragon" || combat.enemyId === "absence") && Math.random() < 0.4;
  const raw =
    combat.enemyId === "runt" ? 1 : (combat.enemyDmg ?? e.dmg) + roll(0, 1) + (fire ? 2 : 0);
  const dmg = incoming(s, raw, combat.enemyId === "dragon" || combat.enemyId === "absence");
  const hp = Math.max(0, combat.playerHp - dmg);
  sfx("hit");
  if (fire && combat.enemyId === "dragon") {
    const scorch = Math.max(1, 5 - s.fortLevel);
    set({
      buildingHp: {
        cottage: Math.max(0, s.buildingHp.cottage - scorch),
        village: Math.max(0, s.buildingHp.village - scorch - 1),
        haven: s.buildingHp.haven,
      },
    });
  }
  const who = combat.enemyId === "dragon" ? s.lifeDragon.name : e.name;
  const defXp = withXp(s.skills, { defence: 4 * dmg });
  const oldMax = maxHitpoints(s.skills);
  const newMax = maxHitpoints(defXp.skills);
  const playerHp = Math.max(0, hp + (newMax - oldMax));
  const dingBit = defXp.ding ? ` ${defXp.ding}` : "";
  const sessionXp = {
    ...live.sessionXp,
    defence: live.sessionXp.defence + 4 * dmg,
  };
  if (playerHp <= 0) {
    clearCombatTimer();
    set({
      combat: {
        ...live,
        playerHp: 0,
        playerMax: newMax,
        phase: "lost",
        striking: false,
        splatOnPlayer: dmg,
        splatOnEnemy: null,
        sessionXp,
        lastXp: { defence: 4 * dmg },
        shake: live.shake + 1,
        log: fire
          ? `${who} breathes fire. You drop. Back to the cottage.`
          : `${who} wins this round. Back to the cottage.`,
      },
      hp: newMax,
      skills: defXp.skills,
      gnomeX: PLAYER_START.x,
      gnomeY: PLAYER_START.y,
      popup: null,
      interior: null,
    });
    scheduleWrite(get);
    return;
  }
  set({
    combat: {
      ...live,
      playerHp,
      playerMax: newMax,
      phase: "player",
      striking: false,
      splatOnPlayer: dmg,
      splatOnEnemy: null,
      sessionXp,
      lastXp: { defence: 4 * dmg },
      shake: live.shake + 1,
      log: (fire ? `${who} breathes fire for ${dmg}.` : `${who} hits ${dmg}.`) + dingBit,
    },
    hp: playerHp,
    skills: defXp.skills,
  });
  armAutoAttack(get, 1600);
}

export function winCombat(get: StoreGet, set: StoreSet, c: CombatState, log: string) {
  const s = get();
  const e = ENEMIES[c.enemyId];
  const hats =
    (c.enemyId === "dragon" || c.enemyId === "absence") && !s.ownedHats.includes("hat-dragon")
      ? [...s.ownedHats, "hat-dragon"]
      : s.ownedHats;
  const cleared = c.packId && !s.clearedPack.includes(c.packId) ? [...s.clearedPack, c.packId] : s.clearedPack;
  const raids = c.raidId ? s.raids.filter((r) => r.id !== c.raidId) : s.raids;
  let landing = s.landing;
  let quests = s.quests;
  let speech: string | undefined;
  if (landing && c.packId && landing.goblins.some((g) => g.id === c.packId)) {
    landing = {
      ...landing,
      goblins: landing.goblins.map((g) => (g.id === c.packId ? { ...g, alive: false } : g)),
    };
    const left = landingAlive(landing);
    if (landingCleared(landing)) {
      quests = quests.map((q) =>
        q.id === "pappy-landing" && q.stage !== "done" ? { ...q, stage: "ready" as const } : q,
      );
      speech = "The Mucktooth boat is empty. Tell Ol Pappy — or Watcher Greg.";
    } else {
      speech = `A runt down. ${left} still green on the shore.`;
    }
  }
  let lifeDragon = s.lifeDragon;
  let absencePending = s.absencePending;
  if (c.enemyId === "dragon") {
    lifeDragon = { ...lifeDragon, state: "defeated", hp: 0 };
  }
  if (c.enemyId === "absence") {
    absencePending = false;
  }
  clearCombatTimer();
  set({
    combat: { ...c, enemyHp: 0, phase: "won", shake: c.shake + 1, log },
    coins: s.coins + e.coins,
    wildWins: s.wildWins + 1,
    lifeDragon,
    absencePending,
    absenceDefeatedOn: c.enemyId === "absence" ? localDate() : s.absenceDefeatedOn,
    ownedHats: hats,
    hat: c.enemyId === "dragon" || c.enemyId === "absence" ? "hat-dragon" : s.hat,
    clearedPack: cleared,
    raids,
    landing,
    quests,
    coinPopKey: s.coinPopKey + 1,
    bounceKey: s.bounceKey + 1,
    ...(speech ? { speech } : {}),
  });
  sfx("win");
  scheduleWrite(get);
}

export function combatSlice(
  set: StoreSet,
  get: StoreGet,
): Pick<GameState, "combatAttack" | "combatEat" | "combatFlee" | "combatEnd"> {
  return {
    combatAttack: () => {
      const s = get();
      const c = s.combat;
      if (!c || c.phase !== "player") return;
      clearCombatTimer();
      const lv = levelsOf(s.skills);
      const weaponAtk = gearStats(s.equipment.weapon).atk;
      const vsDragon = c.enemyId === "dragon" || c.enemyId === "absence";
      const soft = !vsDragon && (c.enemyId === "runt" || (c.enemyDef ?? 9) <= 2);
      let chance = hitChance(lv.attack, weaponAtk, c.enemyDef ?? 4);
      if (soft) chance = Math.max(chance, 0.9);
      if (Math.random() > chance) {
        sfx("error");
        const next: CombatState = {
          ...c,
          phase: "enemy",
          striking: true,
          splatOnEnemy: "miss",
          splatOnPlayer: null,
          lastXp: {},
          log: "You miss.",
          shake: c.shake + 1,
        };
        set({ combat: next });
        setCombatTimer(() => finishEnemyTurn(get, set, { ...next, striking: false }), 700);
        return;
      }
      const cap = Math.max(soft ? 2 : 1, maxHit(lv.strength, weaponAtk, vsDragon ? s.fortLevel : 0));
      const dmg = Math.max(soft ? 2 : 1, roll(1, cap) + (vsDragon ? Math.floor(s.fortLevel / 2) : 0));
      const crit = dmg >= cap && cap > 2;
      const enemyHp = Math.max(0, c.enemyHp - dmg);
      sfx("hit");
      const atkXp = 4 * dmg;
      const strXp = Math.floor(1.33 * dmg);
      const hpXp = Math.floor(1.33 * dmg);
      const gained = withXp(s.skills, {
        attack: atkXp,
        strength: strXp,
        hitpoints: hpXp,
      });
      const grown = maxHitpoints(gained.skills) - maxHitpoints(s.skills);
      const playerHp = c.playerHp + grown;
      const playerMax = maxHitpoints(gained.skills);
      const xpBit = ` +${atkXp} Atk`;
      const dingBit = gained.ding ? ` ${gained.ding}` : "";
      const sessionXp = {
        ...c.sessionXp,
        attack: c.sessionXp.attack + atkXp,
        strength: c.sessionXp.strength + strXp,
        hitpoints: c.sessionXp.hitpoints + hpXp,
      };
      const lastXp = { attack: atkXp, strength: strXp, hitpoints: hpXp };
      if (c.enemyId === "dragon") {
        set({ lifeDragon: { ...s.lifeDragon, hp: enemyHp } });
      }
      if (enemyHp <= 0) {
        const e = ENEMIES[c.enemyId];
        const who = c.enemyId === "dragon" ? s.lifeDragon.name : e.name;
        clearCombatTimer();
        set({ skills: gained.skills, hp: Math.min(playerHp, playerMax) });
        winCombat(
          get,
          set,
          {
            ...c,
            enemyHp: 0,
            playerHp,
            playerMax,
            striking: true,
            splatOnEnemy: dmg,
            splatOnPlayer: null,
            sessionXp,
            lastXp,
          },
          `${who} yields. +${e.coins} coins.${xpBit}${dingBit}`,
        );
        return;
      }
      const next: CombatState = {
        ...c,
        enemyHp,
        playerHp,
        playerMax,
        phase: "enemy",
        striking: true,
        splatOnEnemy: dmg,
        splatOnPlayer: null,
        sessionXp,
        lastXp,
        log: (crit ? `Critical! You hit ${dmg}.` : `You hit ${dmg}.`) + xpBit + dingBit,
        shake: c.shake + 1,
      };
      set({ combat: next, skills: gained.skills, hp: Math.min(playerHp, playerMax) });
      setCombatTimer(() => finishEnemyTurn(get, set, { ...next, striking: false }), 700);
    },

    combatEat: () => {
      const s = get();
      const c = s.combat;
      if (!c || c.phase !== "player") return;
      clearCombatTimer();
      if (foodCount(s) < 1) {
        sfx("error");
        set({ combat: { ...c, log: "Satchel empty. The bakery sells loaves." } });
        armAutoAttack(get, 400);
        return;
      }
      if (c.enemyId === "dragon" && s.honey > 0) {
        set({
          combat: {
            ...c,
            phase: "won",
            striking: false,
            splatOnEnemy: "heal",
            log: `${s.lifeDragon.name} eats the cake. The fire goes out of the day.`,
          },
          honey: s.honey - 1,
          lifeDragon: { ...s.lifeDragon, state: "soothed" },
          wildWins: s.wildWins + 1,
          coins: s.coins + 20,
          bounceKey: s.bounceKey + 1,
          coinPopKey: s.coinPopKey + 1,
          speech: `${s.lifeDragon.name} is a neighbour today. A warm, slightly smoky neighbour.`,
        });
        sfx("win");
        scheduleWrite(get);
        return;
      }
      const useHoney = s.honey > 0;
      const healAmt = useHoney ? 10 : 8;
      const max = maxHitpoints(s.skills);
      const heal = Math.min(max - c.playerHp, healAmt);
      const next: CombatState = {
        ...c,
        playerHp: c.playerHp + heal,
        playerMax: max,
        phase: "enemy",
        striking: false,
        splatOnPlayer: "heal",
        splatOnEnemy: null,
        log: heal ? `You eat. +${heal} heart.` : "Already stuffed.",
      };
      set({
        combat: next,
        honey: useHoney ? s.honey - 1 : s.honey,
        bread: useHoney ? s.bread : Math.max(0, s.bread - 1),
        hp: c.playerHp + heal,
      });
      scheduleWrite(get);
      setCombatTimer(() => finishEnemyTurn(get, set, next), 550);
    },

    combatFlee: () => {
      const s = get();
      const c = s.combat;
      if (!c || (c.phase !== "player" && c.phase !== "lost")) return;
      if (c.phase === "player" && Math.random() < 0.35) {
        const next: CombatState = { ...c, phase: "enemy", striking: false, log: "The path is blocked. They noticed." };
        set({ combat: next });
        setCombatTimer(() => finishEnemyTurn(get, set, next), 500);
        return;
      }
      clearCombatTimer();
      if (c.enemyId === "dragon") {
        set({ lifeDragon: { ...s.lifeDragon, hp: c.enemyHp } });
      }
      set({
        combat: null,
        selectedPlace: "cottage",
        gnomeX: PLAYER_START.x,
        gnomeY: PLAYER_START.y,
        speech: "A tactical cottage. Very brave.",
        hp: Math.max(c.playerHp, 8),
      });
      scheduleWrite(get);
    },

    combatEnd: () => {
      const s = get();
      const c = s.combat;
      if (!c) return;
      clearCombatTimer();
      const won = c.phase === "won";
      const max = maxHitpoints(s.skills);
      set({
        combat: null,
        hp: won ? Math.min(max, c.playerHp + 4) : max,
        gnomeX: won ? s.gnomeX : PLAYER_START.x,
        gnomeY: won ? s.gnomeY : PLAYER_START.y,
        speech: won
          ? s.lifeDragon.state === "soothed" || s.lifeDragon.state === "defeated"
            ? "The wildlands hum. The ridge is quieter."
            : "The wildlands respect a sword."
          : "Kettle on. Tomorrow we try again.",
        bounceKey: s.bounceKey + 1,
        popup: null,
      });
      scheduleWrite(get);
    },
  };
}
