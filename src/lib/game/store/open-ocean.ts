import { oceanIslandsNear, oceanLandings } from "../ocean-world";
import { planTow, tugPosition, rescuePort } from "../ocean-rescue";
import { scheduleWrite } from "./persist";
import type { GameState, StoreGet, StoreSet } from "./types";
export function openOceanSlice(
  set: StoreSet,
  get: StoreGet,
): Pick<
  GameState,
  | "requestTow"
  | "boardWreck"
  | "lootWreck"
  | "leaveWreck"
  | "tickOpenOcean"
  | "buyIslandBread"
> {
  const ready = () => {
    const s = get();
    return (
      s.named &&
      !s.atHome &&
      !s.bank.pending &&
      !s.combat &&
      !s.interior &&
      !s.abroad
    );
  };
  const save = () => scheduleWrite(get);
  return {
    requestTow: () => {
      const s = get();
      if (!ready() || !s.afloat || s.naval.rescue || s.naval.boarding) return;
      if (s.naval.battle && (s.naval.integrity[s.afloat] ?? 1) > 0) {
        set({
          speech:
            "Sail out of gun range before calling for a voluntary tow. The lifeboat service is dispatched automatically if your hull is disabled.",
        });
        return;
      }
      const rescue = planTow(s.afloat, { x: s.gnomeX, y: s.gnomeY });
      if (!rescue) {
        set({
          speech:
            "No safe tow route found here. The harbour service is still listening.",
        });
        return;
      }
      set({
        naval: { ...s.naval, battle: null, rescue },
        portCourse: null,
        sailHome: false,
        fishing: null,
        popup: null,
        speech: `Captain Mallow aboard the Little Lifeline is coming. Stay with your boat; rescue and towing are free. Repairs are charged at the harbour.`,
      });
      save();
    },
    boardWreck: (id) => {
      const s = get(),
        w = s.naval.wrecks.find((w) => w.id === id);
      if (
        !ready() ||
        !s.afloat ||
        s.naval.battle ||
        s.naval.rescue ||
        s.fishing ||
        !w ||
        w.seconds <= 20 ||
        Math.hypot(s.gnomeX - w.x, s.gnomeY - w.y) > 180
      )
        return;
      set({
        naval: { ...s.naval, boarding: id },
        popup: null,
        portCourse: null,
        sailHome: false,
        speech:
          "You climb aboard the damaged ship. Search the hold, then return to your boat before the wreck sinks.",
      });
      save();
    },
    lootWreck: () => {
      const s = get(),
        w = s.naval.wrecks.find((w) => w.id === s.naval.boarding);
      if (!ready() || !w || w.seconds <= 20 || w.looted) return;
      set({
        coins: s.coins + w.coins,
        goods: { ...s.goods, cloth: (s.goods.cloth ?? 0) + 2 },
        naval: {
          ...s.naval,
          ammo: s.naval.ammo + 10,
          wrecks: s.naval.wrecks.map((k) =>
            k.id === w.id ? { ...k, looted: true } : k,
          ),
        },
        speech: `The hold yields ${w.coins} coins, 10 shot and 2 bundles of cloth. Get back to your boat before she goes under.`,
      });
      save();
    },
    leaveWreck: () => {
      const s = get();
      if (!s.naval.boarding) return;
      set({
        naval: { ...s.naval, boarding: null },
        speech: "You climb back into your own boat.",
      });
      save();
    },
    buyIslandBread: () => {
      const s = get();
      const port = oceanLandings(s.gnomeX,s.gnomeY).find(
        (p) => p.town && Math.hypot(s.gnomeX - p.x, s.gnomeY - p.y) < 400,
      );
      if (!ready() || s.afloat || !port || s.coins < 6) return;
      set({
        coins: s.coins - 6,
        bread: s.bread + 1,
        speech: `A warm loaf from ${port.name}. The baker has tucked in a complimentary crumb for the gulls.`,
      });
      save();
    },
    tickOpenOcean: (dt) => {
      const s = get();
      if (
        !ready() ||
        (typeof document !== "undefined" && document.hidden) ||
        !Number.isFinite(dt) ||
        dt <= 0
      )
        return;
      const step = Math.min(0.5, dt),
        n = s.naval;
      let changed = false,
        naval = n;
      if (n.wrecks.length) {
        const wrecks = n.wrecks
            .map((w) => ({ ...w, seconds: Math.max(0, w.seconds - step) }))
            .filter((w) => w.seconds > 0),
          boarding = wrecks.some((w) => w.id === n.boarding && w.seconds > 20)
            ? n.boarding
            : null;
        naval = { ...naval, wrecks, boarding };
        changed = true;
        if (n.boarding && !boarding)
          set({
            speech:
              "The wreck slips under the waves. You scramble back to your own boat; anything left aboard is lost.",
          });
      }
      if (n.rescue) {
        const r = { ...n.rescue, elapsed: n.rescue.elapsed + step };
        changed = true;
        if (r.elapsed >= r.duration && r.phase === "coming") {
          r.phase = "towing";
          r.elapsed = 0;
          r.duration = r.returnDuration;
          set({
            speech:
              "Little Lifeline is alongside. Captain Mallow secures the towline and takes your damaged boat in hand.",
          });
        } else if (r.elapsed >= r.duration) {
          const port = rescuePort(r.port)!;
          naval = {
            ...naval,
            rescue: null,
            boarding: null,
            moored: { ...naval.moored, [r.boat]: r.port },
          };
          set({
            gnomeX: port.x,
            gnomeY: port.y,
            afloat: null,
            portCourse: null,
            sailHome: false,
            naval,
            speech: `Towed safely into ${port.name}. Your hull, fittings and crew are retained. Repair the damaged ship in Naval command before sailing it again.`,
          });
          save();
          return;
        }
        if (r.phase === "towing") {
          const p = tugPosition(r);
          set({ gnomeX: p.x, gnomeY: p.y });
        }
        naval = { ...naval, rescue: r };
      }
      if (changed) {
        set({ naval });
        if (
          Math.floor((n.rescue?.elapsed ?? n.wrecks[0]?.seconds ?? 0) / 5) !==
            Math.floor(
              (naval.rescue?.elapsed ?? naval.wrecks[0]?.seconds ?? 0) / 5,
            ) ||
          n.rescue?.phase !== naval.rescue?.phase ||
          n.wrecks.length !== naval.wrecks.length
        )
          save();
      }
      if (s.afloat && (naval.integrity[s.afloat] ?? 1) <= 0 && !naval.rescue) {
        get().requestTow();
        return;
      }
      const discovered = oceanIslandsNear(s.gnomeX,s.gnomeY,1600,s.ocean.seed).filter(
        (i) =>
          Math.hypot(s.gnomeX - i.x, s.gnomeY - i.y) <
            Math.max(i.rx, i.ry) + 650 && !s.ocean.discovered.includes(i.id),
      );
      if (discovered.length) {
        set({
          ocean: {
            ...s.ocean,
            discovered: [...s.ocean.discovered, ...discovered.map((i) => i.id)].slice(-512),
          },
          speech: `Land ahead: ${discovered[0]!.name}. ${discovered[0]!.town ? "A little town and a public harbour." : "A quiet, uninhabited islet with a landing."}`,
        });
        save();
      }
    },
  };
}
