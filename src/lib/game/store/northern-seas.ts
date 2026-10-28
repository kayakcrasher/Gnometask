import {nearestHarbour} from '../harbour-navigation';
import {addNeighbourLetter} from "../neighbours";
import { rescuePorts } from "../ocean-rescue";
import { gunLimit, hullStrength, shipFit, streamOceanVessels, vesselSeed } from "../naval";
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
      return (
        s.named &&
        !s.atHome &&
        !s.combat &&
        !s.bank.pending &&
        !s.abroad &&
        !s.naval.rescue &&
        !s.naval.boarding
      );
    };
  const inPort = () => {
    const s = get();
    return (
      (!s.afloat &&
        rescuePorts(s.gnomeX,s.gnomeY).some(
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
      if (!ready() || s.thimble.construction || p?.id !== id || s.coins < p.cost) return;
      set({
        coins: s.coins - p.cost,
        thimble: {
          ...s.thimble,
          construction:{id,progress:0},
          spent: s.thimble.spent + p.cost,
          news: `${p.name} is funded. The road crew is putting up the scaffolding.`,
        },
        speech: `${p.name} is funded. Building continues while you explore; no second payment is needed.`,
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
      const next=stepThimble(s);const homes={...s.neighbourhood.homes};for(const r of [...s.thimble.residents,...next.thimble.residents])if((r.homeLevel??1)>0)homes[r.id]=Math.max(homes[r.id]??0,r.homeLevel??1);let neighbourhood={...s.neighbourhood,homes};
      for(const r of next.thimble.residents){const old=s.thimble.residents.find(p=>p.id===r.id);
        if(!old)neighbourhood=addNeighbourLetter(neighbourhood,`arrival-${r.id}-${next.thimble.beat}`,r.name,"I’ve made it to Thimblehaven! My luggage is considerably larger than my savings. Come say hello while my home is being built.");
        if(old&&(r.homeLevel??1)>(old.homeLevel??1))neighbourhood=addNeighbourLetter(neighbourhood,`home-${r.id}-${r.homeLevel}`,r.name,"The builders have finished! Come and see what I’ve done with the place. I promise there’s a chair for you.");
      }
      for(const r of s.thimble.residents)if(!next.thimble.residents.some(p=>p.id===r.id))neighbourhood=addNeighbourLetter(neighbourhood,`leaving-${r.id}-${next.thimble.beat}`,r.name,"I’m leaving to find steadier work. This isn’t goodbye forever. Keep a little light in the window for me.");
      if(s.thimble.construction&&!next.thimble.construction)neighbourhood=addNeighbourLetter(neighbourhood,`opening-${s.thimble.construction.id}`,"Thimblehaven builders",next.thimble.news);
      set({...next,neighbourhood});
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
        !!s.interior ||
        !s.afloat ||
        (s.naval.integrity[s.afloat] ?? 1) <= 0 ||
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
        !!s.interior ||
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
        coins: s.coins - wages,
        skills: gained.skills,
        ...(won&&enemy.tier?{ocean:{...s.ocean,defeated:Object.fromEntries([...Object.entries(s.ocean.defeated??{}).filter(([,until])=>until>n.clock),[enemy.id,n.clock+600]].slice(-256))}}:{}),
        naval: {
          ...n,
          wrecks: won
            ? [
                ...n.wrecks.filter((w) => w.id !== enemy.id),
                {
                  id: enemy.id,
                  kind: enemy.kind,
                  x: enemy.x,
                  y: enemy.y,
                  seconds: 120,
                  coins: enemy.reward,
                  looted: false,
                },
              ]
            : n.wrecks,
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
          ? `${enemy.name} is disabled. Board and loot the wreck before it sinks in two minutes. +${damage * 4} Naval Warfare XP.`
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
      const port=nearestHarbour(s);
      if(port)get().plotPortCourse(port.id);
      set({speech:port?`Making for ${port.name}. Enemy guns remain active until you leave their range.`:"No safe harbour course found. Sail into clear water; enemy guns remain active until you leave their range."});
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
      const n = {...s.naval,vessels:streamOceanVessels(s.naval,s.gnomeX,s.gnomeY,s.ocean.defeated)};
      if (
        !s.afloat &&
        !n.battle &&
        n.cooldown <= 0 &&
        n.enemyCooldown <= 0 &&
        !n.vessels.some((v) => v.respawn > 0)
      )
        return;
      const step = Math.min(0.5, dt);
      let next = {
        ...n,
        clock: n.clock + step,
        cooldown: Math.max(0, n.cooldown - step),
        enemyCooldown: Math.max(0, n.enemyCooldown - step),
        vessels: n.vessels.map((v) =>
          v.respawn > 0
            ? {
                ...v,
                respawn: Math.max(0, v.respawn - step),
                hp:
                  v.respawn <= step
                    ? vesselSeed(v.id)?.hp ?? v.hp
                    : v.hp,
              }
            : v,
        ),
      };
      next.vessels = next.vessels.map((v) => {
        if (!v.patrol || v.hp <= 0 || v.id === next.battle) return v;
        const a = next.clock * 0.035 + [...v.id].reduce((h,c)=>(Math.imul(h,31)+c.charCodeAt(0))>>>0,0)%100;
        return {
          ...v,
          x: v.patrol.x + Math.cos(a) * v.patrol.r,
          y: v.patrol.y + Math.sin(a) * v.patrol.r,
        };
      });
      if (s.afloat && !next.battle && (next.integrity[s.afloat] ?? 1) > 0) {
        const ambush = next.vessels.find(
          (v) =>
            v.patrol &&
            v.side === "enemy" &&
            v.hp > 0 &&
            Math.hypot(v.x - s.gnomeX, v.y - s.gnomeY) < 180,
        );
        if (ambush) {
          next.battle = ambush.id;
          next.enemyCooldown = 6;
          set({
            fishing: null,
            speech: `${ambush.name} closes to attack. Fight or sail out of gun range!`,
          });
        }
      }
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
          next.integrity = { ...next.integrity, [id]: Math.max(0, hp) };
          next.enemyCooldown = 6;
          if (hp <= 0) {
            next.battle = null;
            set({
              naval: next,
              portCourse: null,
              sailHome: false,
              fishing: null,
              speech:
                "Your hull is disabled. Captain Mallow’s tow service has been called; stay with the remains.",
            });
            get().requestTow();
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
        next.cooldown <= 0 &&
        next.ammo > 0 &&
        s.coins >= shipFit(next, s.afloat).crew
      )
        get().fireBroadside();
    },
  };
}
