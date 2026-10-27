import {supportsDeepRig} from "@/lib/game/deep-fishing";
import {oceanLandings} from "@/lib/game/ocean-world";
import { shipFit } from "@/lib/game/naval";
import { BoatShowroom } from "./boat-showroom";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useGame } from "@/lib/game/store";
import { BOATS, boatById } from "@/lib/game/data/boats";
import { levelFromXp } from "@/lib/game/xp";
import { economicClimate } from "@/lib/game/island-economy";
import {
  PORT_SITES,
  PUBLIC_PORT,
  DOCK_STYLES,
  DOCK_UPGRADES,
  BOAT_PARTS,
  shippingQuote,
} from "@/lib/game/ports";
import { BankLedger, marineButton as btn } from "./mossroot-bank";
export function MarineControls() {
  const s = useGame(),
    [open, setOpen] = useState(false),
    [tab, setTab] = useState<"fleet" | "ports" | "bank">("fleet"),
    [hull, setHull] = useState("row"),
    [origin, setOrigin] = useState("thimble"),
    [destination, setDestination] = useState("capital");
  if (
    !s.named ||
    s.bank.pending ||
    s.naval.battle || s.naval.rescue || s.naval.boarding ||
    s.atHome ||
    s.interior ||
    s.abroad ||
    s.combat
  )
    return null;
  const boat = boatById(hull)!,
    owned = hull === "row" || s.hulls.includes(hull),
    parts = s.ports.parts[hull] ?? [],
    busy = s.ports.shipments.some((t) => t.boat === hull),
    level = levelFromXp(s.skills.sailing),
    dock = s.ports.docks.find((d) => d.site === origin),
    quote = dock
      ? shippingQuote(hull, dock.level, parts, economicClimate(s).factor)
      : null;
  return (
    <>
      <div className={`fixed ${s.afloat ? "bottom-72" : "bottom-40"} left-3 z-30 flex max-w-[70vw] flex-wrap gap-2`}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`${btn} bg-parchment text-pine shadow-panel`}
        >
          Bank & harbour
        </button>
      </div>
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[95] flex items-end justify-center bg-ink/60 p-3"
            role="dialog"
            aria-modal="true"
            aria-label="Bank and harbour"
          >
            <section className="max-h-[92dvh] w-full max-w-xl overflow-auto rounded-3xl bg-parchment p-4 text-ink">
              <div className="sticky top-0 z-10 bg-parchment pb-2">
                <header className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold">
                    Roots & tides
                  </h2>
                  <button
                    type="button"
                    className={`${btn} bg-pine/10`}
                    onClick={() => setOpen(false)}
                  >
                    Close harbour
                  </button>
                </header>
                <p className="my-2 text-sm">
                  {s.coins.toLocaleString()} coins · Sailing {level}
                </p>
                <nav className="mb-3 flex gap-2" aria-label="Harbour sections">
                  {(["fleet", "ports", "bank"] as const).map((t) => (
                    <button
                      type="button"
                      key={t}
                      aria-pressed={tab === t}
                      onClick={() => setTab(t)}
                      className={`${btn} ${tab === t ? "bg-pine text-parchment" : "bg-pine/10"}`}
                    >
                      {t === "fleet"
                        ? "Fleet & parts"
                        : t === "ports"
                          ? "Ports & freight"
                          : "Mossroot bank"}
                    </button>
                  ))}
                </nav>
              </div>
              {tab === "bank" ? (
                <BankLedger />
              ) : tab === "fleet" ? (
                <div className="space-y-3">
                  <label className="block text-sm font-bold">
                    Boat showroom
                    <select
                      aria-label="Boat showroom"
                      className="mt-2 min-h-11 w-full rounded-xl bg-white/60 px-2"
                      value={hull}
                      onChange={(e) => setHull(e.target.value)}
                    >
                      {BOATS.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} · {b.price.toLocaleString()} coins · Sailing{" "}
                          {b.need}
                        </option>
                      ))}
                    </select>
                  </label>
                  <BoatShowroom
                    kind={boat.id}
                    parts={parts}
                    guns={shipFit(s.naval, boat.id).guns}
                  />
                  <p className="text-sm">{boat.blurb}</p>
                  <p className="text-xs">
                    {boat.warfare
                      ? `Naval Warfare ${boat.warfare} required · `
                      : ""}
                    {boat.speed} sailing speed ·{" "}
                    {boat.cargo
                      ? `${boat.cargo} freight crates`
                      : "Passenger / leisure hull"}{" "}
                    ·{" "}
                    {busy
                      ? "At sea on a shipping contract"
                      : owned
                        ? "Owned"
                        : "Available to purchase"}
                  </p>
                  {!owned ? (
                    <button
                      type="button"
                      disabled={
                        level < boat.need ||
                        levelFromXp(s.skills.navalWarfare) <
                          (boat.warfare ?? 1) ||
                        s.coins < boat.price
                      }
                      className={`${btn} bg-pine text-parchment`}
                      onClick={() => s.buyBoat(hull)}
                    >
                      Buy {boat.name} · {boat.price.toLocaleString()}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!!s.afloat || busy || level < boat.need}
                      className={`${btn} bg-pine text-parchment`}
                      onClick={() => {
                        s.sailTo("haven", hull);
                        if (useGame.getState().afloat) setOpen(false);
                      }}
                    >
                      Board at nearby harbour
                    </button>
                  )}
                  <p className="text-xs">
                    Buy a rod at the armory, board any boat, then use “Fish from
                    boat”. Rowboats catch shallow-water species; larger boats
                    unlock deep-water fish as Fishing improves.
                  </p>
                  <p className="text-xs">Giant bluefin unlocks at Fishing 60, Sunspire marlin at 75, and abyssal grouper at 90. All require the deepwater rig and open sea well clear of shores and islands. Ordinary fish still use your normal rod.</p>
                  <h3 className="font-bold">
                    Boat parts · fitted to this hull
                  </h3>
                  <p className="text-xs">
                    Visit the town dock or your own wharf to fit parts. Every
                    fitting appears on the boat. Speed bonuses add together;
                    cargo and fishing improvements work on this hull only.
                  </p>
                  {BOAT_PARTS.map((p) => (
                    <div key={p.id} className="rounded-xl bg-pine/10 p-3">
                      <h4 className="font-bold">{p.name}</h4>
                      <p className="my-1 text-xs">{p.description}</p>
                      <button
                        type="button"
                        disabled={
                          (p.id==="deep-rig"&&(!supportsDeepRig(hull)||levelFromXp(s.skills.fishing)<60)) ||
                          !owned ||
                          !!s.afloat ||
                          busy ||
                          parts.includes(p.id) ||
                          s.coins < p.price
                        }
                        onClick={() => s.buyBoatPart(hull, p.id)}
                        className={`${btn} bg-parchment`}
                      >
                        {parts.includes(p.id)
                          ? "Fitted"
                          : `Fit · ${p.price.toLocaleString()} coins`}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="font-display text-lg font-bold">
                    Thimblehaven · the northern sea frontier
                  </h3>
                  <p className="text-sm">
                    A public landing, two starter cottages and a harbour office
                    on Thimble Bay. Sail north between the two arms of the
                    island. Buy a waterfront plot here to start your own port.
                    The public landing stays free to use.
                  </p>
                  {s.afloat && (
                    <button
                      type="button"
                      onClick={() => {
                        s.plotPortCourse("north-landing");
                        setOpen(false);
                      }}
                      className={`${btn} bg-gold`}
                    >
                      Sail to Thimblehaven public landing
                    </button>
                  )}
                  {s.afloat && (
                    <button
                      type="button"
                      onClick={() => {
                        s.plotPortCourse("capital");
                        setOpen(false);
                      }}
                      className={`${btn} bg-pine text-parchment`}
                    >
                      Sail to Tideham public harbour
                    </button>
                  )}

                  <p className="text-xs">
                    Dock levels: finger pier (1 berth), cargo wharf (2), crane
                    harbour (3). Construction costs 15,000 → 45,000 → 180,000
                    coins, in addition to the waterfront deed.
                  </p>
                  {PORT_SITES.map((p) => {
                    const d = s.ports.docks.find((d) => d.site === p.id),
                      own = s.ports.plots.includes(p.id),
                      cost = DOCK_UPGRADES[d?.level ?? 0];
                    return (
                      <article
                        key={p.id}
                        className="space-y-2 rounded-xl bg-pine/10 p-3"
                      >
                        <h4 className="font-bold">{p.name}</h4>
                        <p className="text-xs">
                          {p.x}, {p.y} ·{" "}
                          {own
                            ? "Waterfront deed owned"
                            : `${p.price.toLocaleString()} coins for land + water easement`}{" "}
                          ·{" "}
                          {d
                            ? `Dock level ${d.level} · ${d.style}`
                            : "Undeveloped shore"}
                        </p>
                        {!own ? (
                          <button
                            type="button"
                            disabled={!!s.afloat || s.coins < p.price}
                            onClick={() => s.buyPortPlot(p.id)}
                            className={`${btn} bg-parchment`}
                          >
                            Buy waterfront plot · {p.price.toLocaleString()}
                          </button>
                        ) : (
                          <>
                            {cost !== undefined && (
                              <button
                                type="button"
                                disabled={s.coins < cost}
                                onClick={() => s.upgradeDock(p.id)}
                                className={`${btn} bg-pine text-parchment`}
                              >
                                {d ? "Upgrade wharf" : "Build dock"} ·{" "}
                                {cost.toLocaleString()}
                              </button>
                            )}
                            {d && (
                              <>
                                <label className="block text-xs font-bold">
                                  Dock style ·{" "}
                                  {(2500 * d.level).toLocaleString()} coins per
                                  change
                                  <select
                                    aria-label={`${p.name} dock style`}
                                    value={d.style}
                                    onChange={(e) =>
                                      s.styleDock(
                                        p.id,
                                        e.target
                                          .value as (typeof DOCK_STYLES)[number],
                                      )
                                    }
                                    className="my-1 min-h-11 w-full rounded-xl bg-parchment px-2"
                                  >
                                    {DOCK_STYLES.map((v) => (
                                      <option key={v} value={v}>
                                        {v}
                                      </option>
                                    ))}
                                  </select>
                                </label>
                                {s.afloat && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      s.plotPortCourse(p.id);
                                      setOpen(false);
                                    }}
                                    className={`${btn} bg-gold`}
                                  >
                                    Sail to your wharf
                                  </button>
                                )}
                              </>
                            )}
                          </>
                        )}
                      </article>
                    );
                  })}
                  <h3 className="font-bold">Coastal freight contracts</h3>
                  <p className="text-xs">
                    Own a dock and a cargo boat. Freight is purchased up front;
                    the sale quote locks when dispatched and is paid once on
                    arrival. Recessions can make a route unprofitable. Each
                    berth handles one outgoing boat. After unloading, crews sail
                    home before the boat is available again. Voyages progress
                    while playing and pause when this tab is hidden.
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    <label className="text-xs">
                      Origin
                      <select
                        aria-label="Freight origin"
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                        className="min-h-11 w-full rounded-xl bg-pine/10 px-2"
                      >
                        <option value="">Choose your wharf</option>
                        {s.ports.docks.map((d) => (
                          <option key={d.site} value={d.site}>
                            {PORT_SITES.find((p) => p.id === d.site)?.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="text-xs">
                      Destination
                      <select
                        aria-label="Freight destination"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="min-h-11 w-full rounded-xl bg-pine/10 px-2"
                      >
                        <option value="capital">{PUBLIC_PORT.name}</option>{oceanLandings().filter(p=>p.town).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                        {s.ports.docks
                          .filter((d) => d.site !== origin)
                          .map((d) => (
                            <option key={d.site} value={d.site}>
                              {PORT_SITES.find((p) => p.id === d.site)?.name}
                            </option>
                          ))}
                      </select>
                    </label>
                    <label className="text-xs">
                      Working boat
                      <select
                        aria-label="Freight boat"
                        value={hull}
                        onChange={(e) => setHull(e.target.value)}
                        className="min-h-11 w-full rounded-xl bg-pine/10 px-2"
                      >
                        {BOATS.map((b) => (
                          <option
                            key={b.id}
                            value={b.id}
                            disabled={!b.cargo || !s.hulls.includes(b.id)}
                          >
                            {b.name}
                            {!b.cargo
                              ? " · leisure hull"
                              : !s.hulls.includes(b.id)
                                ? " · not owned"
                                : ""}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  {quote && (
                    <p className="text-sm">
                      {quote.cargo} crates · pay {quote.cost.toLocaleString()}{" "}
                      now · receive {quote.sale.toLocaleString()} on arrival ·
                      margin {(quote.sale - quote.cost).toLocaleString()}
                    </p>
                  )}
                  <button
                    type="button"
                    disabled={
                      !quote ||
                      !owned ||
                      busy ||
                      s.afloat === hull ||
                      !dock ||
                      destination === origin ||
                      s.coins < (quote?.cost ?? Infinity) ||
                      s.ports.shipments.filter((t) => t.origin === origin)
                        .length >= (dock?.level ?? 0)
                    }
                    onClick={() =>
                      s.dispatchShipment(origin, destination, hull)
                    }
                    className={`${btn} bg-pine text-parchment`}
                  >
                    Dispatch paid freight
                  </button>
                  <p className="text-xs">
                    Delivered {s.ports.delivered} crates · gross freight
                    receipts {s.ports.earned.toLocaleString()} · port, fitting
                    and freight expenditure {s.ports.spent.toLocaleString()}
                  </p>
                  {s.ports.shipments.map((t) => (
                    <div
                      key={t.boat}
                      className="rounded-xl bg-gold/20 p-3 text-sm"
                    >
                      {boatById(t.boat)?.name} ·{" "}
                      {Math.ceil(t.duration - t.elapsed)}s{" "}
                      {t.leg === "return" ? "sailing home" : "to unloading"}
                      <progress
                        aria-label={`${t.boat} voyage progress`}
                        value={t.elapsed}
                        max={t.duration}
                        className="mt-1 w-full"
                      />
                    </div>
                  ))}
                </div>
              )}
              <p
                role="status"
                className="mt-3 rounded-xl bg-gold/20 p-3 text-sm"
              >
                {s.speech}
              </p>
            </section>
          </div>,
          document.body,
        )}
    </>
  );
}
