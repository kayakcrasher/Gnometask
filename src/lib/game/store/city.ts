import { economicClimate } from "../island-economy";
import {
  CITY_BUILDINGS,
  citySetupCost,
  cityPath,
  cityRoadError,
  citySiteError,
  cityUpgradeCost,
  stepCity,
  snapCityRoad,
  routeLength,
  CITY_SUPPLY_PRICE,
  playerHomeDoor,
} from "../city";
import { parcelAt } from "../data/parcels";
import { insideParcel } from "../land-planning";
import type { GameState, StoreGet, StoreSet } from "./types";
import { scheduleWrite } from "./persist";
export function citySlice(
  set: StoreSet,
  get: StoreGet,
): Pick<
  GameState,
  | "nameCity"
  | "buildCity"
  | "layCityRoad"
  | "upgradeCity"
  | "supplyCity"
  | "hireCityCart"
  | "toggleCitySupply"
  | "returnCityHome"
  | "advanceCity"
> {
  const say = (speech: string) => set({ speech });
  return {
    nameCity: (name) => {
      if (typeof name !== "string") return;
      const clean = name.trim().slice(0, 28);
      if (!clean) return;
      set({
        city: { ...get().city, name: clean },
        speech: `Welcome to ${clean}.`,
      });
      scheduleWrite(get);
    },
    buildCity: (kind, x, y) => {
      const s = get();
      if (
        s.combat ||
        !Object.prototype.hasOwnProperty.call(CITY_BUILDINGS, kind)
      )
        return;
      const error = citySiteError(s, kind, x, y);
      if (error) {
        say(error);
        return;
      }
      const cost = {
        ...CITY_BUILDINGS[kind],
        coins: citySetupCost(s.city, kind),
      };
      if (s.coins < cost.coins) {
        say(`Needs ${cost.coins} coins.`);
        return;
      }
      const parcel = s.deeds
        .map(parcelAt)
        .find((p) => p && insideParcel(p, x, y))!;
      set({
        coins: s.coins - cost.coins,
        city: {
          ...s.city,
          nextId: s.city.nextId + 1,
          spent: s.city.spent + cost.coins,
          buildings: [
            ...s.city.buildings,
            {
              id: `city-building-${s.city.nextId}`,
              kind,
              parcel: parcel.id,
              x,
              y,
              level: 1,
              stock: 0,
              supplies: 0,
              work: 0,
              residents: 0,
              invested: cost.coins,
            },
          ],
        },
        speech: `${cost.name} built. Order factory supplies with coins and hire a donkey cart to start trading.`,
      });
      scheduleWrite(get);
    },
    layCityRoad: (start, end) => {
      const s = get();
      if (s.combat || s.townHallLevel < 2) {
        say("Road construction needs Town Hall 2.");
        return;
      }
      const a = snapCityRoad(s, start),
        b = snapCityRoad(s, end),
        error = cityRoadError(s, a, b);
      if (error) {
        say(error);
        return;
      }
      const length = Math.hypot(b[0] - a[0], b[1] - a[1]),
        coins = Math.ceil(length / 2);
      if (s.coins < coins) {
        say(`This road needs ${coins} coins.`);
        return;
      }
      set({
        coins: s.coins - coins,
        city: {
          ...s.city,
          spent: s.city.spent + coins,
          nextId: s.city.nextId + 1,
          roads: [
            ...s.city.roads,
            {
              id: `city-road-${s.city.nextId}`,
              points: [a, b],
              width: 1.2,
              surface: "gravel",
            },
          ],
        },
        speech: `The crew laid your street for ${coins} coins. Add another section to extend it.`,
      });
      scheduleWrite(get);
    },
    upgradeCity: (id) => {
      const s = get(),
        b = s.city.buildings.find((b) => b.id === id);
      if (!b || b.kind === "home" || b.level >= 3 || s.combat) return;
      const cost = cityUpgradeCost(b);
      if (s.coins < cost.coins || s.townHallLevel < b.level + 2) {
        say(`Upgrade needs ${cost.coins} coins and Hall ${b.level + 2}.`);
        return;
      }
      set({
        coins: s.coins - cost.coins,
        city: {
          ...s.city,
          spent: s.city.spent + cost.coins,
          buildings: s.city.buildings.map((p) =>
            p.id === id
              ? {
                  ...p,
                  level: p.level + 1,
                  invested:
                    (p.invested ?? CITY_BUILDINGS[p.kind].coins) + cost.coins,
                }
              : p,
          ),
        },
        speech:
          "Building upgraded. Factories produce more, depots carry larger loads, and cottages house more residents.",
      });
      scheduleWrite(get);
    },
    supplyCity: (id) => {
      const s = get(),
        b = s.city.buildings.find((b) => b.id === id);
      if (!b || !["sawmill", "workshop"].includes(b.kind) || s.combat) return;
      const count = Math.min(
        10,
        Math.floor(s.coins / CITY_SUPPLY_PRICE),
        100 - b.supplies,
      );
      if (count <= 0) {
        say(
          "You need coins to order supplies, and space in the factory’s supply shed.",
        );
        return;
      }
      set({
        coins: s.coins - count * CITY_SUPPLY_PRICE,
        city: {
          ...s.city,
          spent: s.city.spent + count * CITY_SUPPLY_PRICE,
          buildings: s.city.buildings.map((p) =>
            p.id === id ? { ...p, supplies: p.supplies + count } : p,
          ),
        },
        speech: `${count} supply units purchased for ${count * CITY_SUPPLY_PRICE} coins. Carts automatically sell its finished goods.`,
      });
      scheduleWrite(get);
    },
    hireCityCart: (id) => {
      const s = get(),
        f = s.city.buildings.find((b) => b.id === id);
      if (
        !f ||
        !["sawmill", "workshop"].includes(f.kind) ||
        s.city.carts.some((c) => c.factory === id) ||
        s.combat
      )
        return;
      if (s.coins < 180) {
        say("A donkey, cart and driver cost 180 coins.");
        return;
      }
      const options = s.city.buildings
          .filter((b) => b.kind === "depot")
          .map((d) => ({ d, route: cityPath(s, f, d) }))
          .filter((o) => o.route)
          .sort((a, b) => routeLength(a.route!) - routeLength(b.route!)),
        option = options[0];
      if (!option) {
        say(
          "Build a trade depot and connect both buildings to the same road network first.",
        );
        return;
      }
      set({
        coins: s.coins - 180,
        city: {
          ...s.city,
          spent: s.city.spent + 180,
          carts: [
            ...s.city.carts,
            {
              factory: id,
              depot: option.d.id,
              route: option.route!,
              distance: 0,
              returning: false,
              cargo: 0,
              supplies: 0,
              autoSupply: false,
            },
          ],
        },
        speech:
          "Your donkey cart is hired. It collects factory crates, delivers them to the depot and brings the earnings straight to your wallet.",
      });
      scheduleWrite(get);
    },
    toggleCitySupply: (id) => {
      const s = get();
      if (s.combat) return;
      set({
        city: {
          ...s.city,
          carts: s.city.carts.map((c) =>
            c.factory === id ? { ...c, autoSupply: !c.autoSupply } : c,
          ),
        },
        speech:
          "Cart supply setting changed. Automatic supplies buy up to 10 units for 3 coins each at the depot and carry them back to this factory.",
      });
      scheduleWrite(get);
    },
    returnCityHome: () => {
      const s = get();
      if (
        s.combat ||
        s.abroad ||
        s.afloat ||
        !s.city.buildings.some((b) => b.kind === "home")
      )
        return;
      const p = playerHomeDoor(s);
      set({
        gnomeX: p.x,
        gnomeY: p.y,
        interior: "cottage",
        opening: {...s.opening,homeVisited:true},
        coach: 5,
        popup: null,
        selectedPlace: "cottage",
        speech: `Home in ${s.city.name}.`,
      });
      scheduleWrite(get);
    },
    advanceCity: () => {
      const s = get();
      if (
        (typeof document!=="undefined"&&document.hidden)||
        !s.named ||
        s.atHome ||
        s.combat ||
        s.abroad ||
        s.interior ||
        !s.city.buildings.length
      )
        return;
      const jobs=economicClimate(s).jobs;if(jobs===0&&s.economy.beat%4!==0||jobs===1&&s.economy.beat%2!==0)return;
      set(stepCity(s));
      scheduleWrite(get);
    },
  };
}
