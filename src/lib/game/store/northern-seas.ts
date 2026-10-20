import { gunLimit, hullStrength, shipFit, SEA_VESSELS } from "../naval";
import { TOWN_PROJECTS, stepThimble } from "../thimblehaven";
import { levelFromXp } from "../xp";
import { withXp, scheduleWrite } from "./persist";
import { NORTH_LANDING, PUBLIC_PORT } from "../ports";
import type { GameState, StoreSet, StoreGet } from "./types";
export function northernSeasSlice(
  set: StoreSet,
  get: StoreGet,
): Pick<
  GameState,
  | "fundThimble"
  | "setThimbleTax"
  | "armShip"
  | "hireGunner"
  | "buyShot"
  | "repairShip"
  | "engageShip"
  | "fireBroadside"
  | "toggleGunners"
  | "tickSeas"
  | "retreatShip"
  | "advanceThimble"
> {
  const save = () => scheduleWrite(get),
    ready = () => {
      const s = get();
      return s.named && !s.atHome && !s.combat && !s.bank.pending && !s.abroad;
    };
  const inPort = () => {
    const s = get();
    return (
      (!s.afloat &&
        [PUBLIC_PORT, NORTH_LANDING].some(
          (p) => Math.hypot(p.x - s.gnomeX, p.y - s.gnomeY) < 300,
        )) ||
      (!s.afloat &&
        s.ports.docks.some((d) => {
          const p =
            d.site === "south"
              ? { x: 150, y: 850 }
              : d.site === "spruce"
                ? { x: 2050, y: -3470 }
                : { x: 1930, y: -3160 };
          return Math.hypot(p.x - s.gnomeX, p.y - s.gnomeY) < 300;
        }))
    );
  };
  return {
    fundThimble: (id) => {
      const s = get(),
        p = TOWN_PROJECTS[s.thimble.projects.length];
      if (!ready() || p?.id !== id || s.coins < p.cost) return;
      set({
        coins: s.coins - p.cost,
        thimble: {
          ...s.thimble,
          projects: [...s.thimble.projects, id],
          spent: s.thimble.spent + p.cost,
          news: `${p.name} completed. Thimblehaven is a little more like home.`,
        },
        speech: `${p.name} is ready. The townsfolk brought sandwiches for the builders.`,
      });
      save();
    },
    setThimbleTax: (tax) => {
      const s = get();
      if (!ready() || ![0, 1, 2, 3].includes(tax)) return;
      set({
        thimble: { ...s.thimble, tax },
        speech: `Thimblehaven’s household levy is ${tax} coins per town collection. Nobody can pay more than they have.`,
      });
      save();
    },
    advanceThimble: () => {
      const s = get();
      if (
        !ready() ||
        s.interior ||
        s.naval.battle ||
        (typeof document !== "undefined" && document.hidden)
      )
        return;
      set(stepThimble(s));
      save();
    },
    armShip: (id) => {
      const s = get(),
        fit = shipFit(s.naval, id);
      if (
        !ready() ||
        !inPort() ||
        (id !== "row" && !s.hulls.includes(id)) ||
        fit.guns >= gunLimit(id) ||
        s.coins < 45 ||
        s.ports.shipments.some((t) => t.boat === id)
      )
        return;
      set({
        coins: s.coins - 45,
        cannons: true,
        naval: {
          ...s.naval,
          fits: { ...s.naval.fits, [id]: { ...fit, guns: fit.guns + 1 } },
          spent: s.naval.spent + 45,
        },
        speech: `Cannon fitted. ${fit.guns + 1}/${gunLimit(id)} gun positions filled on this hull. Buy shot before sailing.`,
      });
      save();
    },
    hireGunner: (id) => {
      const s = get(),
        fit = shipFit(s.naval, id),
        cost = 350 * (fit.crew + 1);
      if (!ready() || !inPort() || fit.crew >= fit.guns || s.coins < cost)
        return;
      set({
        coins: s.coins - cost,
        naval: {
          ...s.naval,
          fits: { ...s.naval.fits, [id]: { ...fit, crew: fit.crew + 1 } },
          spent: s.naval.spent + cost,
        },
        speech:
          "A gnome gunner signs aboard. Each crewed gun fires automatically when ready and costs 1 coin in wages per shot.",
      });
      save();
    },
    buyShot: () => {
      const s = get();
      if (!ready() || !inPort() || s.coins < 30) return;
      set({
        coins: s.coins - 30,
        naval: {
          ...s.naval,
          ammo: s.naval.ammo + 20,
          spent: s.naval.spent + 30,
        },
        speech: "Twenty cannonballs and dry powder, safely stowed.",
      });
      save();
    },
    repairShip: (id) => {
      const s = get(),
        max = hullStrength(id),
        hp = s.naval.integrity[id] ?? max,
        cost = Math.ceil(max - hp) * 3;
      if (
        !ready() ||
        !inPort() ||
        (id !== "row" && !s.hulls.includes(id)) ||
        cost <= 0 ||
        s.coins < cost
      )
        return;
      set({
        coins: s.coins - cost,
        naval: {
          ...s.naval,
          integrity: { ...s.naval.integrity, [id]: max },
          spent: s.naval.spent + cost,
        },
        speech: "The shipwright patches your hull. Fit for another voyage.",
      });
      save();
    },
    engageShip: (id) => {
      const s = get(),
        enemy = s.naval.vessels.find((v) => v.id === id);
      if (
        !ready() ||
        !s.afloat ||
        s.fishing ||
        s.naval.battle ||
        !enemy ||
        enemy.side !== "enemy" ||
        enemy.hp <= 0 ||
        Math.hypot(enemy.x - s.gnomeX, enemy.y - s.gnomeY) > 350
      )
        return;
      if (!shipFit(s.naval, s.afloat).guns) {
        set({ speech: "Fit a cannon at a harbour before challenging a ship." });
        return;
      }
      set({
        naval: { ...s.naval, battle: id, enemyCooldown: 6 },
        popup: null,
        speech: `${enemy.name} runs out its guns. Stay within 350 map units to exchange fire; sail away to disengage.`,
      });
      save();
    },
    fireBroadside: () => {
      const s = get(),
        id = s.afloat,
        n = s.naval,
        enemy = n.vessels.find((e) => e.id === n.battle);
      if (
        !ready() ||
        !id ||
        !enemy ||
        enemy.hp <= 0 ||
        n.cooldown > 0 ||
        Math.hypot(enemy.x - s.gnomeX, enemy.y - s.gnomeY) > 350
      )
        return;
      const fit = shipFit(n, id),
        guns = Math.min(fit.guns, fit.crew || 2, n.ammo),
        wages = fit.crew ? guns : 0;
      if (guns <= 0 || s.coins < wages) {
        set({
          speech:
            "Your guns need cannonballs and your hired gunners need wages.",
        });
        return;
      }
      const damage = Math.min(
          enemy.hp,
          guns * (8 + Math.floor(levelFromXp(s.skills.navalWarfare) / 5)),
        ),
        won = damage >= enemy.hp,
        gained = withXp(s.skills, { navalWarfare: damage * 4 });
      set({
        coins: s.coins - wages + (won ? enemy.reward : 0),
        skills: gained.skills,
        naval: {
          ...n,
          ammo: n.ammo - guns,
          cooldown: 6,
          battle: won ? null : n.battle,
          victories: n.victories + (won ? 1 : 0),
          spent: n.spent + wages,
          vessels: n.vessels.map((v) =>
            v.id === enemy.id
              ? { ...v, hp: v.hp - damage, respawn: won ? 600 : 0 }
              : v,
          ),
        },
        speech: won
          ? `${enemy.name} surrenders. ${enemy.reward} salvage coins; +${damage * 4} Naval Warfare XP.`
          : (gained.ding ??
            `${guns} gun${guns > 1 ? "s" : ""} fire. ${damage} hull damage; +${damage * 4} Naval Warfare XP. Reloading for 6 seconds.`),
      });
      save();
    },
    toggleGunners: () => {
      const s = get();
      set({ naval: { ...s.naval, auto: !s.naval.auto } });
      save();
    },
    retreatShip: () => {
      const s = get();
      if (!s.naval.battle) return;
      const port =
        Math.hypot(
          s.gnomeX - NORTH_LANDING.water.x,
          s.gnomeY - NORTH_LANDING.water.y,
        ) <
        Math.hypot(
          s.gnomeX - PUBLIC_PORT.water.x,
          s.gnomeY - PUBLIC_PORT.water.y,
        )
          ? "north-landing"
          : "capital";
      get().plotPortCourse(port);
      set({
        speech:
          "Making for a public harbour. Keep sailing: enemy guns remain active until you leave their range.",
      });
      save();
    },
    tickSeas: (dt) => {
      const s = get();
      if (
        !ready() ||
        s.interior ||
        (typeof document !== "undefined" && document.hidden) ||
        !Number.isFinite(dt) ||
        dt <= 0
      )
        return;
      const n = s.naval;
      if (
        !n.battle &&
        n.cooldown <= 0 &&
        n.enemyCooldown <= 0 &&
        !n.vessels.some((v) => v.respawn > 0)
      )
        return;
      const step = Math.min(0.5, dt);
      let next = {
        ...n,
        cooldown: Math.max(0, n.cooldown - step),
        enemyCooldown: Math.max(0, n.enemyCooldown - step),
        vessels: n.vessels.map((v) =>
          v.respawn > 0
            ? {
                ...v,
                respawn: Math.max(0, v.respawn - step),
                hp:
                  v.respawn <= step
                    ? SEA_VESSELS.find((e) => e.id === v.id)!.hp
                    : v.hp,
              }
            : v,
        ),
      };
      const enemy = next.vessels.find((v) => v.id === next.battle);
      if (enemy && s.afloat) {
        if (Math.hypot(enemy.x - s.gnomeX, enemy.y - s.gnomeY) > 350) {
          next.battle = null;
          set({
            naval: next,
            speech:
              "You sail beyond gun range. Engagement broken; damage remains.",
          });
          save();
          return;
        }
        if (next.enemyCooldown <= 0) {
          const id = s.afloat,
            hp = (next.integrity[id] ?? hullStrength(id)) - enemy.guns * 6;
          next.integrity = { ...next.integrity, [id]: Math.max(1, hp) };
          next.enemyCooldown = 6;
          if (hp <= 0) {
            const dock = [PUBLIC_PORT, NORTH_LANDING].sort(
              (a, b) =>
                Math.hypot(a.water.x - s.gnomeX, a.water.y - s.gnomeY) -
                Math.hypot(b.water.x - s.gnomeX, b.water.y - s.gnomeY),
            )[0]!;
            next.battle = null;
            set({
              naval: next,
              afloat: null,
              gnomeX: dock.x,
              gnomeY: dock.y,
              portCourse: null,
              sailHome: false,
              fishing: null,
              speech:
                "The coastguard tows your battered boat to a public landing. Your hull needs paid repairs.",
            });
            save();
            return;
          }
          set({
            speech: `${enemy.name} lands a broadside for ${enemy.guns * 6}. Hull: ${hp}/${hullStrength(id)}.`,
          });
          save();
        }
      }
      set({ naval: next });
      if (
        next.battle &&
        s.afloat &&
        shipFit(next, s.afloat).crew > 0 &&
        next.auto &&
        next.cooldown <= 0
      )
        get().fireBroadside();
    },
  };
}
