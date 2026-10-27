import {supportsDeepRig,DEEP_RIG_LEVEL} from "../deep-fishing";
import {levelFromXp} from "../xp";
import { oceanLandings, oceanLanding } from "../ocean-world";
import { STARTER_LOANS, accrueBank } from "../bank";
import {
  BOAT_PARTS,
  DOCK_STYLES,
  DOCK_UPGRADES,
  PUBLIC_PORT,
  NORTH_LANDING,
  portSite,
  portDestination,
  shippingQuote,
  shippingRoute,
  routeLength,
  speedBonus,
  type DockStyle,
} from "../ports";
import { boatById } from "../data/boats";
import { economicClimate, quoteDay } from "../island-economy";
import { scheduleWrite } from "./persist";
import type { GameState, StoreGet, StoreSet } from "./types";
export function maritimeSlice(
  set: StoreSet,
  get: StoreGet,
): Pick<
  GameState,
  | "chooseStarterLoan"
  | "repayBank"
  | "buyPortPlot"
  | "upgradeDock"
  | "styleDock"
  | "buyBoatPart"
  | "dispatchShipment"
  | "tickMaritime"
  | "plotPortCourse"
> {
  const available = () => {
    const s = get();
    return (
      s.named &&
      !s.bank.pending &&
      !s.combat &&
      !s.atHome &&
      !s.abroad &&
      !s.fishing &&
      !s.naval.rescue &&
      !s.naval.boarding &&
      !s.transport.ride
    );
  };
  return {
    plotPortCourse: (id) => {
      const s = get();
      if (s.naval.rescue || s.naval.boarding) return;
      if (
        s.afloat &&
        portDestination(id) &&
        (id === "north-landing" ||
          id === "capital" ||
          id.startsWith("ocean-") ||
          s.ports.docks.some((d) => d.site === id))
      )
        set({ portCourse: id, popup: null });
    },
    chooseStarterLoan: (amount) => {
      const s = get();
      if (
        !s.named ||
        s.bank.signed ||
        !STARTER_LOANS.includes(amount as (typeof STARTER_LOANS)[number])
      )
        return;
      set({
        coins: s.coins + amount,
        bank: {
          pending: false,
          signed: true,
          original: amount,
          owed: amount,
          interest: 0,
          repaid: 0,
          lastDay: quoteDay(s),
        },
        speech: `Pappy signs beside your name. Mossroot credits ${amount.toLocaleString()} coins. Interest is 0.6% per seven market days; repay any time.`,
      });
      scheduleWrite(get);
    },
    repayBank: (amount) => {
      const s = get();
      if (!s.named || s.combat || !Number.isFinite(amount) || amount <= 0)
        return;
      const bank = accrueBank(s.bank, quoteDay(s));
      const paid = Math.min(Math.floor(amount), s.coins, bank.owed);
      if (paid <= 0) return;
      set({
        coins: s.coins - paid,
        bank: { ...bank, owed: bank.owed - paid, repaid: bank.repaid + paid },
        speech:
          bank.owed === paid
            ? "Mossroot stamps PAID. Pappy can breathe again."
            : `Mossroot receives ${paid.toLocaleString()} coins. Your balance is ${(bank.owed - paid).toLocaleString()}.`,
      });
      scheduleWrite(get);
    },
    buyPortPlot: (id) => {
      const s = get(),
        site = portSite(id);
      if (
        !available() ||
        s.afloat ||
        s.interior ||
        !site ||
        s.ports.plots.includes(id)
      )
        return;
      if (Math.hypot(s.gnomeX - site.x, s.gnomeY - site.y) > 260) {
        set({
          speech:
            "Visit the waterfront plot before signing its deed. Thimblehaven has a public landing for arriving by sea.",
        });
        return;
      }
      if (s.coins < site.price) {
        set({
          speech: `The waterfront deed costs ${site.price.toLocaleString()} coins. Dock construction is extra.`,
        });
        return;
      }
      set({
        coins: s.coins - site.price,
        ports: {
          ...s.ports,
          plots: [...s.ports.plots, id],
          spent: s.ports.spent + site.price,
        },
        speech: `You own ${site.name}. The public shore path stays open. Build your first dock for 15,000 coins.`,
      });
      scheduleWrite(get);
    },
    upgradeDock: (id) => {
      const s = get(),
        site = portSite(id),
        dock = s.ports.docks.find((d) => d.site === id),
        cost = DOCK_UPGRADES[dock?.level ?? 0];
      if (
        !available() ||
        !site ||
        !s.ports.plots.includes(id) ||
        cost === undefined ||
        s.coins < cost
      )
        return;
      if (
        s.ports.shipments.some((t) => t.origin === id || t.destination === id)
      ) {
        set({
          speech:
            "Wait for all shipments to arrive before rebuilding this dock.",
        });
        return;
      }
      const next = {
        site: id,
        level: (dock?.level ?? 0) + 1,
        style: dock?.style ?? ("timber" as DockStyle),
      };
      set({
        coins: s.coins - cost,
        ports: {
          ...s.ports,
          docks: [...s.ports.docks.filter((d) => d.site !== id), next],
          spent: s.ports.spent + cost,
        },
        speech: `${site.name}: ${next.level === 1 ? "a timber finger pier" : next.level === 2 ? "a twin-berth wharf with a cargo shed" : "a three-berth harbour with a crane"} is ready.`,
      });
      scheduleWrite(get);
    },
    styleDock: (id, style) => {
      const s = get(),
        dock = s.ports.docks.find((d) => d.site === id),
        cost = 2500 * (dock?.level ?? 1);
      if (
        !available() ||
        !dock ||
        !DOCK_STYLES.includes(style) ||
        dock.style === style ||
        s.coins < cost
      )
        return;
      set({
        coins: s.coins - cost,
        ports: {
          ...s.ports,
          docks: s.ports.docks.map((d) =>
            d.site === id ? { ...d, style } : d,
          ),
          spent: s.ports.spent + cost,
        },
        speech:
          "Your pier has fresh finishes, matching bollards and a new harbour flag.",
      });
      scheduleWrite(get);
    },
    buyBoatPart: (id, partId) => {
      const s = get(),
        part = BOAT_PARTS.find((p) => p.id === partId);
      if (
        !available() ||
        s.afloat ||
        !boatById(id) ||
        !part ||
        (id !== "row" && !s.hulls.includes(id)) ||
        s.ports.parts[id]?.includes(part.id) ||
        s.coins < part.price ||
        s.ports.shipments.some((t) => t.boat === id)
      )
        return;
      if(part.id==="deep-rig"&&(!supportsDeepRig(id)||levelFromXp(s.skills.fishing)<DEEP_RIG_LEVEL)){set({speech:"The deepwater rig needs Fishing 60 and a suitable fishing or large working hull."});return;}
      const harbours = [
        PUBLIC_PORT,
        NORTH_LANDING,
        ...oceanLandings().filter((p) => p.town),
        ...s.ports.docks.map((d) => portSite(d.site)!),
      ];
      if (
        !harbours.some((p) => Math.hypot(p.x - s.gnomeX, p.y - s.gnomeY) <= 260)
      ) {
        set({
          speech: "Visit the public dock or your own wharf to fit boat parts.",
        });
        return;
      }
      set({
        coins: s.coins - part.price,
        ports: {
          ...s.ports,
          parts: {
            ...s.ports.parts,
            [id]: [...(s.ports.parts[id] ?? []), part.id],
          },
          spent: s.ports.spent + part.price,
        },
        speech: `${part.name} fitted to your ${boatById(id)!.name}.`,
      });
      scheduleWrite(get);
    },
    dispatchShipment: (origin, destination, id) => {
      const s = get(),
        dock = s.ports.docks.find((d) => d.site === origin),
        target = s.ports.docks.find((d) => d.site === destination),
        boat = boatById(id);
      if (
        !available() ||
        !dock ||
        !boat?.cargo ||
        (s.naval.integrity[id] ?? 1) <= 0 ||
        !s.hulls.includes(id) ||
        s.afloat === id ||
        s.ports.shipments.some((t) => t.boat === id) ||
        s.ports.shipments.filter((t) => t.origin === origin).length >=
          dock.level ||
        (destination !== "capital" &&
          !target &&
          !oceanLanding(destination)?.town) ||
        origin === destination
      )
        return;
      const quote = shippingQuote(
          id,
          dock.level,
          s.ports.parts[id],
          economicClimate(s).factor,
        ),
        route = shippingRoute(origin, destination),
        site = portSite(origin);
      if (!quote || !route || !site || s.coins < quote.cost) return;
      const duration = Math.max(
        45,
        (routeLength(route, site.water) /
          (boat.speed * speedBonus(s.ports.parts[id]))) *
          2,
      );
      set({
        coins: s.coins - quote.cost,
        ports: {
          ...s.ports,
          shipments: [
            ...s.ports.shipments,
            {
              leg: "outbound",
              boat: id,
              origin,
              destination,
              elapsed: 0,
              duration,
              ...quote,
            },
          ],
          spent: s.ports.spent + quote.cost,
        },
        speech: `${boat.name} departs with ${quote.cargo} paid freight crates. Sale agreed: ${quote.sale} coins, payable on arrival. The crew will sail home after unloading.`,
      });
      scheduleWrite(get);
    },
    tickMaritime: (dt) => {
      const s = get();
      if (
        !s.named ||
        s.atHome ||
        s.bank.pending ||
        (typeof document !== "undefined" && document.hidden) ||
        !Number.isFinite(dt) ||
        dt <= 0
      )
        return;
      const bank = accrueBank(s.bank, quoteDay(s));
      let ports = s.ports,
        coins = s.coins,
        arrivals = 0;
      const step = Math.min(0.5, dt);
      if (!s.combat && !s.abroad && ports.shipments.length) {
        let pay = 0,
          cargo = 0;
        const shipments = ports.shipments
          .map((t) => ({ ...t, elapsed: t.elapsed + step }))
          .filter((t) => {
            if (t.elapsed < t.duration) return true;
            if (t.leg === "outbound") {
              pay += t.sale;
              cargo += t.cargo;
              arrivals++;
              t.leg = "return";
              t.elapsed = 0;
              return true;
            }
            return false;
          });
        coins += pay;
        ports = {
          ...ports,
          shipments,
          earned: ports.earned + pay,
          delivered: ports.delivered + cargo,
        };
      }
      if (bank !== s.bank || ports !== s.ports) {
        set({
          bank,
          ports,
          coins,
          ...(arrivals
            ? {
                speech: `${arrivals} shipment${arrivals > 1 ? "s" : ""} unloaded. Paid in full; the crews are sailing home.`,
              }
            : {}),
        });
        if (
          bank !== s.bank ||
          arrivals ||
          ports.shipments.length !== s.ports.shipments.length ||
          Math.floor((s.ports.shipments[0]?.elapsed ?? 0) / 10) !==
            Math.floor((ports.shipments[0]?.elapsed ?? 0) / 10)
        )
          scheduleWrite(get);
      }
    },
  };
}
