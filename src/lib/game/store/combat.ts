import { localDate } from "@/lib/utils";
import { gearStats } from "../catalog";
import { ENEMIES, enemyIntentFor, roll, type CombatState } from "../combat";
import type { CombatStyle } from "../types";
import { sfx } from "../juice";
import { PLAYER_START, type GameSave } from "../types";
import { hitChance, levelsOf, maxHit, maxHitpoints } from "../xp";
import { landingAlive, landingCleared } from "../data/landing";
import { rolledChart } from "../data/honour";
import { armAutoAttack, clearCombatTimer, foodCount, rememberLoot, scheduleWrite, setCombatTimer, withXp } from "./persist";
import type { StoreGet, StoreSet, GameState } from "./types";

function defencePower(s: GameSave) {
  return gearStats(s.equipment.shield).def + gearStats(s.equipment.armor).def;
}

function incoming(s: GameSave & { praying?: boolean }, raw: number, vsDragon = false) {
  let dmg = raw - defencePower(s) - Math.floor(levelsOf(s.skills).defence / 5);
  if (vsDragon) dmg -= s.fortLevel;
  if (s.praying) dmg = Math.floor(dmg * 0.5);
  return Math.max(0, dmg);
}

function windUpFoe(get: StoreGet, set: StoreSet, next: CombatState) {
  setCombatTimer(() => {
    const live = get().combat;
    if (!live || live.id !== next.id || live.phase !== "enemy") return;
    set({ combat: { ...live, striking: false, foeSwing: true, splatOnEnemy: null } });
    setCombatTimer(() => finishEnemyTurn(get, set, next), 420);
  }, next.enemyIntent.kind === "strike" ? 480 : 850);
}

export function finishEnemyTurn(get: StoreGet, set: StoreSet, expected: CombatState) {
  const s = get();
  const live = s.combat;
  if (!live || live.id !== expected.id || live.phase !== "enemy") return;
  const e = ENEMIES[live.enemyId];
  const who = live.enemyId === "dragon" ? s.lifeDragon.name : live.name;
  const intent = live.enemyIntent;
  const nextRound = live.round + 1;
  const nextIntent = enemyIntentFor(live.enemyId, nextRound);
  if (Math.random() > intent.accuracy) {
    set({ combat: {
      ...live, phase: "player", round: nextRound, enemyIntent: nextIntent,
      guarding: false, striking: false, foeSwing: false,
      splatOnPlayer: "miss", splatOnEnemy: null, lastXp: {}, shake: live.shake + 1,
      log: `${who}'s ${intent.label.toLowerCase()} misses.`,
    } });
    armAutoAttack(get, 1600);
    return;
  }
  const vsDragon = live.enemyId === "dragon" || live.enemyId === "absence";
  const raw = live.enemyDmg + roll(0, 1) + intent.bonus;
  const damage = Math.max(0, incoming(s, raw, vsDragon) - (s.combatStyle === "defence" ? 1 : 0));
  const taken = Math.min(live.playerHp, live.guarding ? Math.floor(damage * 0.45) : damage);
  const hp = Math.max(0, live.playerHp - taken);
  if (taken > 0) sfx("hit");
  if (intent.kind === "fire" && live.enemyId === "dragon") {
    const scorch = Math.max(1, 5 - s.fortLevel);
    set({ buildingHp: {
      cottage: Math.max(0, s.buildingHp.cottage - scorch),
      village: Math.max(0, s.buildingHp.village - scorch - 1), haven: s.buildingHp.haven,
    } });
  }
  const defGain = 4 * Math.max(taken, 1);
  const gained = withXp(s.skills, { defence: defGain });
  const max = maxHitpoints(gained.skills);
  const playerHp = hp <= 0 ? 0 : Math.min(max, hp + max - maxHitpoints(s.skills));
  const lost = playerHp <= 0;
  const sessionXp = { ...live.sessionXp, defence: live.sessionXp.defence + defGain };
  const log = lost ? `${who} wins this round. Your cottage is a safe place to recover.`
    : taken === 0 ? `You block ${who}'s ${intent.label.toLowerCase()}.`
    : `${intent.label} hits for ${taken}.${live.guarding ? " Your guard softens the blow." : ""}${gained.ding ? ` ${gained.ding}` : ""}`;
  set({
    combat: {
      ...live, playerHp, playerMax: max, phase: lost ? "lost" : "player",
      round: nextRound, enemyIntent: nextIntent, guarding: false, striking: false, foeSwing: false,
      splatOnPlayer: taken, splatOnEnemy: null, sessionXp, lastXp: { defence: defGain },
      shake: live.shake + 1, log,
    },
    skills: gained.skills,
    hp: lost ? max : playerHp,
    ...(lost ? { gnomeX: PLAYER_START.x, gnomeY: PLAYER_START.y, afloat: null, sailHome: false,
      abroad: null, raidVisit: null, popup: null, interior: null } : {}),
  });
  if (lost) { clearCombatTimer(); scheduleWrite(get); }
  else armAutoAttack(get, 1600);
}

export function winCombat(get: StoreGet, set: StoreSet, c: CombatState, log: string) {
  const s = get();
  if (!s.combat || s.combat.id !== c.id || s.combat.phase === "won" || s.combat.phase === "lost") return;
  const islandTarget = c.islandTarget;
  const raid = islandTarget ? s.raidProgress[islandTarget.isleId] : null;
  if (islandTarget && (!raid || s.raidVisit?.isleId !== islandTarget.isleId || raid.claimed || raid.defeated.includes(islandTarget.targetId))) return;
  const raidProgress = islandTarget && raid ? { ...s.raidProgress, [islandTarget.isleId]: { ...raid, defeated: [...raid.defeated, islandTarget.targetId] } } : s.raidProgress;
  const raidBoss = Boolean(islandTarget?.boss);
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
      const banner = landing.flagDown;
      if (banner) {
        quests = quests.map((q) =>
          q.id === "pappy-landing" && q.stage !== "done" ? { ...q, stage: "ready" as const } : q,
        );
      }
      speech = banner
        ? "Shore and banner are clear. Tell Ol Pappy — or Watcher Greg."
        : "The runts are down. Their flag still flies. Tear it down.";
    } else {
      speech = `A runt down. ${left} still green on the shore.`;
    }
  }
  const lootLine = raidBoss ? `${c.name} is down. The island chest is unguarded.` : `Drops bones and ${c.rewardCoins} coins.`;
  const chart = rolledChart(c.enemyId, s.chart);
  let respect = s.respect;
  let muckRaiders = s.muckRaiders;
  let surrendered = s.surrendered;
  let bonusCoins = 0;
  if (c.enemyId === "goblin") respect += c.raidId ? 2 : 1;
  if (c.enemyId === "raider") {
    const idx = Number(c.packId?.replace("muck-r", ""));
    if (idx >= 0 && idx < muckRaiders.length) {
      muckRaiders = muckRaiders.map((alive, i) => (i === idx ? false : alive));
    }
    respect += 1;
  }
  if (c.enemyId === "chief" && !islandTarget) {
    surrendered = true;
    respect += 8;
    bonusCoins = 40;
    speech = "Chief Mucktooth drops. The town puts its knives down and pays 40 coins. The hollow hears of it.";
  }
  speech = speech ? `${speech} ${lootLine}` : lootLine;
  if (chart) speech = `${speech} A hide map shows their island.`;
  const loot = raidBoss ? {} : rememberLoot(get, set, c.atX, c.atY, 1, c.rewardCoins + bonusCoins);
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
    ...loot,
    raidProgress,
    combat: { ...c, enemyHp: 0, phase: "won", guarding: false, foeSwing: false, loot: raidBoss ? null : { coins: c.rewardCoins + bonusCoins, bones: 1 }, shake: c.shake + 1, log },
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
    respect,
    chart: s.chart || chart,
    surrendered,
    muckRaiders,
    ...(speech ? { speech } : {}),
  });
  sfx("win");
  scheduleWrite(get);
}

export function combatSlice(
  set: StoreSet,
  get: StoreGet,
): Pick<GameState, "combatAttack" | "combatGuard" | "setCombatAuto" | "combatEat" | "combatFlee" | "combatEnd" | "setCombatStyle"> {
  return {
    combatAttack: () => {
      const s = get();
      const c = s.combat;
      if (!c || c.phase !== "player") return;
      clearCombatTimer();
      const lv = levelsOf(s.skills);
      const weaponAtk = gearStats(s.equipment.weapon).atk;
      const vsDragon = c.enemyId === "dragon" || c.enemyId === "absence";
      const style: CombatStyle = s.combatStyle ?? "attack";
      const soft = !vsDragon && (c.enemyId === "runt" || (c.enemyDef ?? 9) <= 2);
      let chance = hitChance(lv.attack + (style === "attack" ? 3 : 0), weaponAtk, c.enemyDef ?? 4);
      if (soft) chance = Math.max(chance, 0.9);
      if (style === "attack") chance = Math.min(0.97, chance + 0.08);
      if (Math.random() > chance) {
        sfx("error");
        const next: CombatState = {
          ...c,
          phase: "enemy",
          striking: true,
          foeSwing: false,
          splatOnEnemy: "miss",
          splatOnPlayer: null,
          lastXp: {},
          log: "You miss.",
          shake: c.shake + 1,
        };
        set({ combat: next });
        windUpFoe(get, set, next);
        return;
      }
      const cap =
        Math.max(soft ? 2 : 1, maxHit(lv.strength + (style === "strength" ? 3 : 0), weaponAtk, vsDragon ? s.fortLevel : 0)) +
        (style === "strength" ? 1 : 0);
      const rolledDamage = Math.max(soft ? 2 : 1, roll(1, cap) + (vsDragon ? Math.floor(s.fortLevel / 2) : 0));
      const dmg = Math.min(c.enemyHp, rolledDamage);
      const crit = rolledDamage >= cap && cap > 2;
      const enemyHp = Math.max(0, c.enemyHp - dmg);
      sfx("hit");
      const hitXp = 4 * dmg;
      const hpXp = Math.floor(1.33 * dmg);
      const trained = style === "attack" ? "attack" : style === "strength" ? "strength" : "defence";
      const trainedLabel = style === "attack" ? "Attack" : style === "strength" ? "Strength" : "Defence";
      const gained = withXp(s.skills, {
        [trained]: hitXp,
        hitpoints: hpXp,
      });
      const grown = maxHitpoints(gained.skills) - maxHitpoints(s.skills);
      const playerHp = c.playerHp + grown;
      const playerMax = maxHitpoints(gained.skills);
      const xpBit = ` +${hitXp} ${trainedLabel}`;
      const dingBit = gained.ding ? ` ${gained.ding}` : "";
      const sessionXp = {
        ...c.sessionXp,
        [trained]: c.sessionXp[trained] + hitXp,
        hitpoints: c.sessionXp.hitpoints + hpXp,
      };
      const lastXp = { [trained]: hitXp, hitpoints: hpXp };
      if (c.enemyId === "dragon") {
        set({ lifeDragon: { ...s.lifeDragon, hp: enemyHp } });
      }
      if (enemyHp <= 0) {
        const e = ENEMIES[c.enemyId];
        const who = c.enemyId === "dragon" ? s.lifeDragon.name : c.name;
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
            foeSwing: false,
            splatOnEnemy: dmg,
            splatOnPlayer: null,
            sessionXp,
            lastXp,
          },
          `${who} yields.${xpBit}${dingBit}`,
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
        foeSwing: false,
        splatOnEnemy: dmg,
        splatOnPlayer: null,
        sessionXp,
        lastXp,
        log: (crit ? `Critical! You hit ${dmg}.` : `You hit ${dmg}.`) + xpBit + dingBit,
        shake: c.shake + 1,
      };
      set({ combat: next, skills: gained.skills, hp: Math.min(playerHp, playerMax) });
      windUpFoe(get, set, next);
    },

    combatGuard: () => {
      const c = get().combat;
      if (!c || c.phase !== "player") return;
      clearCombatTimer();
      const next: CombatState = { ...c, phase: "enemy", guarding: true, striking: false,
        foeSwing: false, splatOnEnemy: null, splatOnPlayer: null, lastXp: {}, log: "You brace. The next hit deals 55% less damage." };
      set({ combat: next });
      windUpFoe(get, set, next);
    },

    setCombatAuto: (on) => {
      const c = get().combat;
      if (!c || (c.phase !== "player" && c.phase !== "enemy")) return;
      set({ combat: { ...c, autoAttack: on } });
      if (c.phase === "player") {
        clearCombatTimer();
        if (on) armAutoAttack(get, 1600);
      }
    },

    combatEat: () => {
      const s = get();
      const c = s.combat;
      if (!c || c.phase !== "player") return;
      if (foodCount(s) < 1) {
        sfx("error");
        set({ combat: { ...c, log: "Satchel empty. The bakery sells loaves." } });
        return;
      }
      if (c.enemyId === "dragon" && s.honey > 0) {
        clearCombatTimer();
        set({
          combat: { ...c, phase: "won", pacified: true, guarding: false, striking: false, foeSwing: false,
            splatOnEnemy: "heal", loot: { coins: 20, bones: 0 },
            log: `${s.lifeDragon.name} eats the cake. You settle this peacefully.` },
          honey: s.honey - 1, lifeDragon: { ...s.lifeDragon, state: "soothed" },
          wildWins: s.wildWins + 1, coins: s.coins + 20, bounceKey: s.bounceKey + 1, coinPopKey: s.coinPopKey + 1,
          speech: `${s.lifeDragon.name} is a neighbour today. A warm, slightly smoky neighbour.`,
        });
        sfx("win");
        scheduleWrite(get);
        return;
      }
      const max = maxHitpoints(s.skills);
      if (c.playerHp >= max) {
        set({ combat: { ...c, log: "Your heart is full. Save the food for when you need it." } });
        return;
      }
      clearCombatTimer();
      const useHoney = s.bread < 1;
      const heal = Math.min(max - c.playerHp, useHoney ? 10 : 8);
      const next: CombatState = { ...c, playerHp: c.playerHp + heal, playerMax: max, phase: "enemy",
        guarding: false, striking: false, foeSwing: false, splatOnPlayer: "heal", splatOnEnemy: null,
        lastXp: {}, log: `You eat ${useHoney ? "honey cake" : "bread"}. +${heal} heart.` };
      set({ combat: next, honey: useHoney ? s.honey - 1 : s.honey,
        bread: useHoney ? s.bread : s.bread - 1, hp: c.playerHp + heal });
      scheduleWrite(get);
      windUpFoe(get, set, next);
    },

    combatFlee: () => {
      const s = get();
      const c = s.combat;
      if (!c || c.phase !== "player") return;
      if (c.phase === "player" && Math.random() < 0.35) {
        clearCombatTimer();
        const next: CombatState = { ...c, phase: "enemy", guarding: false, striking: false, foeSwing: false, lastXp: {}, log: "The path is blocked. They noticed." };
        set({ combat: next });
        windUpFoe(get, set, next);
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
        speech: "You retreat to the cottage. Keep some food for the next trip.",
        afloat: null, sailHome: false, abroad: null, raidVisit: null, popup: null,
        hp: Math.max(1, c.playerHp),
      });
      scheduleWrite(get);
    },

    combatEnd: () => {
      const s = get();
      const c = s.combat;
      if (!c || (c.phase !== "won" && c.phase !== "lost")) return;
      clearCombatTimer();
      const won = c.phase === "won";
      const max = maxHitpoints(s.skills);
      set({
        combat: null,
        hp: won ? Math.min(max, c.playerHp + 4) : max,
        gnomeX: won ? s.gnomeX : PLAYER_START.x,
        gnomeY: won ? s.gnomeY : PLAYER_START.y,
        abroad: won ? s.abroad : null,
        speech: won ? s.speech : "Kettle on. Restocked food and better gear will help next time.",
        bounceKey: s.bounceKey + 1,
        popup: null,
      });
      scheduleWrite(get);
    },

    setCombatStyle: (style) => {
      const label = style === "attack" ? "Attack" : style === "strength" ? "Strength" : "Defence";
      const c = get().combat;
      set({
        combatStyle: style,
        ...(c ? { combat: { ...c, log: `Style set to ${label}.` } } : {}),
      });
      scheduleWrite(get);
    },
  };
}
