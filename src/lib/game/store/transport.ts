import { HOME_STYLES } from "../home-design";
import {
  CART_PRICE,
  BUS_FARE,
  wagonQuote,
  transportRoutes,
  wagonPoint,
  stepTransport,
  roadsideExit,
} from "../transport";
import { scheduleWrite } from "./persist";
import type { GameState, StoreGet, StoreSet } from "./types";
export function transportSlice(
  set: StoreSet,
  get: StoreGet,
): Pick<
  GameState,
  | "restyleHome"
  | "buyTravelCart"
  | "toggleTravelCart"
  | "buyPassengerWagon"
  | "hailWagon"
  | "leaveWagon"
  | "tickTransport"
> {
  const blocked = () => {
    const s = get();
    return !!(
      s.combat ||
      s.atHome ||
      s.interior ||
      s.abroad ||
      s.afloat ||
      s.fishing
    );
  };
  return {
    restyleHome: (style) => {
      const s = get(),
        cost = 90 * (s.cottageLevel + 1);
      if (
        blocked() ||
        !HOME_STYLES.includes(style) ||
        style === s.playerHomeStyle ||
        s.coins < cost
      )
        return;
      set({
        playerHomeStyle: style,
        coins: s.coins - cost,
        speech: "The decorators have given your home a fresh island style.",
      });
      scheduleWrite(get);
    },
    buyTravelCart: () => {
      const s = get();
      if (blocked() || s.transport.cart || s.coins < CART_PRICE) return;
      set({
        coins: s.coins - CART_PRICE,
        transport: {
          ...s.transport,
          cart: true,
          spent: s.transport.spent + CART_PRICE,
        },
        speech:
          "Your little donkey cart is ready. Open Travel to climb aboard.",
      });
      scheduleWrite(get);
    },
    toggleTravelCart: () => {
      const s = get();
      if (blocked() || !s.transport.cart || s.transport.ride) return;
      set({
        transport: { ...s.transport, mounted: !s.transport.mounted },
        speech: s.transport.mounted
          ? "You hop down beside your donkey."
          : "You climb into your little cart. Tap land to travel.",
      });
      scheduleWrite(get);
    },
    buyPassengerWagon: (route) => {
      const s = get(),
        price = wagonQuote(s.transport),
        own = s.transport.wagons.filter((w) => w.owned).length;
      if (
        blocked() ||
        own >= 6 ||
        s.coins < price ||
        (!s.city.buildings.some((b) => b.kind === "home")&&!s.thimble) ||
        (!s.city.buildings.some((b) => b.kind === "depot")&&!s.thimble?.projects.includes("depot")) ||
        !transportRoutes(s.roadWorks.completed).some((r) => r.id === route)
      )
        return;
      const id = Array.from({length:6},(_,i)=>`owned-${i+1}`).find(id=>!s.transport.wagons.some(w=>w.id===id))!;
      set({
        coins: s.coins - price,
        transport: {
          ...s.transport,
          spent: s.transport.spent + price,
          wagons: [
            ...s.transport.wagons,
            { id, route, owned: true, distance: 0, direction: 1, dwell: 6 },
          ],
        },
        speech:
          "Your covered wagon is in service. Neighbours pay fares from their purses; upkeep is 2 coins per arrival.",
      });
      scheduleWrite(get);
    },
    hailWagon: (id) => {
      const s = get(),
        w = s.transport.wagons.find((w) => w.id === id),
        p = w ? wagonPoint(w, s.roadWorks.completed) : null,
        fare = w?.owned ? 0 : BUS_FARE;
      if (
        blocked() ||
        s.transport.ride ||
        !w ||
        !p ||
        Math.hypot(s.gnomeX - p.x, s.gnomeY - p.y) > 150 ||
        s.coins < fare
      )
        return;
      set({
        coins: s.coins - fare,
        gnomeX: p.x,
        gnomeY: p.y,
        transport: {
          ...s.transport,
          mounted: false,
          ride: id,
          spent: s.transport.spent + fare,
        },
        speech:
          "All aboard! Ride the route or hop off at any time using Travel.",
      });
      scheduleWrite(get);
    },
    leaveWagon: () => {
      const s = get();
      if (!s.transport.ride) return;
      const p = roadsideExit(s.gnomeX, s.gnomeY);
      set({
        gnomeX: p.x,
        gnomeY: p.y,
        transport: { ...s.transport, ride: null },
        speech: "You step down beside the road.",
      });
      scheduleWrite(get);
    },
    tickTransport: (dt) => {
      const s = get();
      if (blocked()) {
        if (
          (s.transport.ride || s.transport.mounted) &&
          (s.combat ||
            s.afloat ||
            s.abroad ||
            (s.interior && !!s.transport.ride))
        )
          set({ transport: { ...s.transport, ride: null, mounted: false } });
        return;
      }
      if (
        (typeof document !== "undefined" && document.hidden) ||
        !Number.isFinite(dt) ||
        dt <= 0
      )
        return;
      set(stepTransport(s, Math.min(0.5, dt)));
    },
  };
}
