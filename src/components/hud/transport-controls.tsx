import { useState } from "react";
import { createPortal } from "react-dom";
import { useGame } from "@/lib/game/store";
import {
  BUS_FARE,
  CART_PRICE,
  wagonQuote,
  wagonPoint,
  transportRoutes,
} from "@/lib/game/transport";
export function TransportControls() {
  const s = useGame(),
    [open, setOpen] = useState(false),
    [route, setRoute] = useState("tideham"),
    t = s.transport;
  if (!s.named || s.atHome || s.interior || s.abroad || s.combat || s.afloat)
    return null;
  const routes = transportRoutes(s.roadWorks.completed),
    price = wagonQuote(t),
    owner =
      (s.city.buildings.some((b) => b.kind === "home") || !!s.thimble) &&
      (s.city.buildings.some((b) => b.kind === "depot") || s.thimble.projects.includes("depot")),
    button =
      "min-h-11 rounded-xl px-3 py-2 text-xs font-bold disabled:opacity-45";
  return (
    <>
      <div className="fixed bottom-24 left-3 z-30 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`${button} bg-parchment text-pine shadow-panel`}
        >
          Travel {t.ride ? "· aboard" : t.mounted ? "· cart" : ""}
        </button>
        {t.ride && (
          <button
            type="button"
            onClick={() => s.leaveWagon()}
            className={`${button} bg-gold text-ink`}
          >
            Hop off wagon
          </button>
        )}
      </div>
      {open &&
        createPortal(
          <div
            role="dialog"
            aria-label="Travel and wagons"
            aria-modal="true"
            className="fixed inset-0 z-[90] flex items-end justify-center bg-ink/50 p-3"
          >
            <section className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-3xl bg-parchment p-4 text-ink">
              <header className="flex items-center justify-between">
                <h2 className="font-display text-xl font-bold">
                  The donkey way
                </h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className={`${button} bg-pine/10`}
                >
                  Close travel
                </button>
              </header>
              <p className="mt-1 text-xs">
                {s.coins} coins · Wagon fares earned {t.earned} · Travel and
                upkeep spent {t.spent}
              </p>
              <section className="mt-3 rounded-xl bg-pine/10 p-3">
                <h3 className="font-bold">Your little cart</h3>
                <p className="my-1 text-xs">
                  A small, open donkey cart for exploring. Tap land to travel
                  faster. Your donkey waits outside buildings.
                </p>
                {!t.cart ? (
                  <button
                    type="button"
                    disabled={s.coins < CART_PRICE}
                    onClick={() => s.buyTravelCart()}
                    className={`${button} bg-pine text-parchment`}
                  >
                    Buy travel cart · {CART_PRICE} coins
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!!t.ride}
                    onClick={() => {
                      s.toggleTravelCart();
                      setOpen(false);
                    }}
                    className={`${button} bg-pine text-parchment`}
                  >
                    {t.mounted ? "Climb down from cart" : "Ride your cart"}
                  </button>
                )}
              </section>
              <section className="mt-3">
                <h3 className="font-bold">Hail a covered wagon</h3>
                <p className="my-1 text-xs">
                  Meet one on the road or at the ends of its route. They wait
                  six seconds at each stop. A public ride costs {BUS_FARE}{" "}
                  coins; your own wagon is free to ride. Hop off whenever you
                  like.
                </p>
                <div className="mt-2 space-y-2">
                  {t.wagons.map((w) => {
                    const p = wagonPoint(w, s.roadWorks.completed),
                      near =
                        p && Math.hypot(p.x - s.gnomeX, p.y - s.gnomeY) <= 150,
                      label =
                        routes.find((r) => r.id === w.route)?.name ?? w.route;
                    return (
                      <div key={w.id} className="rounded-xl bg-pine/10 p-3">
                        <strong className="text-xs">
                          {label} {w.owned ? "· Your wagon" : ""}
                        </strong>
                        <p className="text-[11px]">
                          {t.ride === w.id
                            ? "You are aboard"
                            : w.owned && s.coins < 2
                              ? "Waiting for upkeep funds"
                              : w.dwell > 0
                                ? "Waiting at a stop"
                                : near
                                  ? "Close enough to hail"
                                  : "Travelling its route"}
                        </p>
                        <button
                          type="button"
                          aria-label={`Hail ${w.id}`}
                          disabled={
                            !near ||
                            !!t.ride ||
                            (!w.owned && s.coins < BUS_FARE)
                          }
                          onClick={() => {
                            s.hailWagon(w.id);
                            if (useGame.getState().transport.ride)
                              setOpen(false);
                          }}
                          className={`${button} mt-1 bg-parchment`}
                        >
                          Hail wagon{w.owned ? "" : ` · ${BUS_FARE} coins`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
              <section className="mt-3 rounded-xl bg-gold/20 p-3">
                <h3 className="font-bold">Your town’s wagon service</h3>
                <p className="my-1 text-xs">
                  Town owners with a home and trade depot can buy covered
                  wagons. Nearby gnomes pay fares from their own purses. Each
                  arrival costs 2 coins in upkeep. Services wait if you cannot
                  fund upkeep.
                </p>
                <label className="text-xs font-bold">
                  Route
                  <select
                    aria-label="Wagon service route"
                    value={route}
                    onChange={(e) => setRoute(e.target.value)}
                    className="my-2 min-h-11 w-full rounded-xl bg-parchment px-2"
                  >
                    {routes.map((r) => (
                      <option value={r.id} key={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  disabled={
                    !owner ||
                    s.coins < price ||
                    t.wagons.filter((w) => w.owned).length >= 6
                  }
                  onClick={() => s.buyPassengerWagon(route)}
                  className={`${button} w-full bg-pine text-parchment`}
                >
                  Buy covered wagon · {price} coins
                </button>
                {!owner && (
                  <p className="mt-1 text-[11px]">
                    Build your city home and a trade depot first.
                  </p>
                )}
              </section>
            </section>
          </div>,
          document.body,
        )}
    </>
  );
}
