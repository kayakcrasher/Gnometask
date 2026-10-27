import {Discoveries} from "./discoveries";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useGame } from "@/lib/game/store";
import { oceanIslandsNear, oceanLandAt, oceanDanger, oceanChartBounds } from "@/lib/game/ocean-world";
import { ISLAND_POLY, DESERT_POLY } from "@/lib/game/world3";
import { boatById } from "@/lib/game/data/boats";
import { hullStrength } from "@/lib/game/naval";
const btn =
  "min-h-11 rounded-xl px-3 py-2 text-sm font-bold disabled:opacity-40";
export function OpenOceanControls() {
  const s = useGame(),
    [open, setOpen] = useState(false);
  if (
    !s.named ||
    s.atHome ||
    s.bank.pending ||
    s.combat ||
    s.interior ||
    s.abroad
  )
    return null;
  const bounds=oceanChartBounds(s.gnomeX,s.gnomeY),danger=oceanDanger(s.gnomeX,s.gnomeY);
  const islands = oceanIslandsNear(s.gnomeX,s.gnomeY,danger?8500:18000,s.ocean.seed).filter(i=>i.x+i.rx>=bounds.minX&&i.x-i.rx<=bounds.maxX&&i.y+i.ry>=bounds.minY&&i.y-i.ry<=bounds.maxY),
    local = oceanLandAt(s.gnomeX, s.gnomeY),
    rescue = s.naval.rescue,
    wreck = s.naval.wrecks.find((w) => w.id === s.naval.boarding);
  return (
    <>
      {!rescue && !wreck && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`${btn} fixed ${s.afloat ? "bottom-64" : "bottom-24"} right-3 z-30 bg-parchment text-pine shadow-panel`}
        >
          Ocean chart
        </button>
      )}
      {rescue && (
        <section
          role="status"
          aria-label="Tow rescue"
          className="fixed inset-x-3 top-24 z-40 mx-auto max-w-lg rounded-2xl bg-parchment p-4 text-ink shadow-panel"
        >
          <h2 className="font-display text-lg font-bold">
            Little Lifeline · Tow service
          </h2>
          <p className="mt-1 text-sm">
            {rescue.phase === "coming"
              ? "Captain Mallow is coming to collect you. Stay with your ship."
              : "Towline secured. Your boat is being brought to a repair port."}
          </p>
          <progress
            aria-label="Tow progress"
            max={rescue.duration}
            value={rescue.elapsed}
            className="mt-2 w-full"
          />
          <p className="text-xs">
            {Math.ceil(rescue.duration - rescue.elapsed)}s{" "}
            {rescue.phase === "coming" ? "until arrival" : "to harbour"} ·
            Rescue is free. Hull repairs cost coins.
          </p>
        </section>
      )}
      {wreck && (
        <section
          role="dialog"
          aria-label="Boarded shipwreck"
          className="fixed inset-x-3 bottom-5 z-50 mx-auto max-w-lg rounded-2xl bg-parchment p-4 text-ink shadow-panel"
        >
          <h2 className="font-display text-lg font-bold">
            Aboard the disabled ship
          </h2>
          <p className="my-2 text-sm">
            The deck lists beneath your boots. {Math.ceil(wreck.seconds - 20)}{" "}
            seconds before you must leave; sinking starts then.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={wreck.looted}
              onClick={() => s.lootWreck()}
              className={`${btn} bg-gold`}
            >
              {wreck.looted ? "Hold searched" : "Search the cargo hold"}
            </button>
            <button
              type="button"
              onClick={() => s.leaveWreck()}
              className={`${btn} bg-pine text-parchment`}
            >
              Return to your boat
            </button>
          </div>
          <p className="mt-2 text-xs">{s.speech}</p>
        </section>
      )}
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[97] flex items-end justify-center bg-ink/60 p-3"
            role="dialog"
            aria-modal="true"
            aria-label="Open ocean chart"
          >
            <section className="max-h-[94dvh] w-full max-w-2xl overflow-auto rounded-3xl bg-parchment p-4 text-ink">
              <header className="sticky top-0 z-10 flex items-center justify-between bg-parchment pb-3">
                <h2 className="font-display text-xl font-bold">
                  The open ocean
                </h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className={`${btn} bg-pine/10`}
                >
                  Close ocean chart
                </button>
              </header>
              <Discoveries onTravel={()=>setOpen(false)}/>
              <p className="text-sm">
                The familiar archipelago opens into endless seeded seas. Sail beyond the chart to find new islands, harbour towns and pirates. Your discoveries stay in the same places.
              </p>
              <p className="my-2 rounded-xl bg-pine/10 p-3 text-sm font-bold">{danger ? `Frontier danger ${danger} · stronger pirates and larger catches` : 'Charted waters · familiar fishing and patrols'}<br />Position {Math.round(s.gnomeX)}, {Math.round(s.gnomeY)} · {s.ocean.discovered.length} recent island sightings</p>
              <p className="text-xs">High-level frontier giants still need a deepwater rig. Greater distance raises pirate hull strength and guns. Nearby harbour towns offer repairs and free rescue towing.
              </p>
              <svg
                role="img"
                aria-label="Archipelago chart"
                viewBox={`${bounds.minX} ${bounds.minY} ${bounds.maxX - bounds.minX} ${bounds.maxY - bounds.minY}`}
                className="my-3 h-64 w-full rounded-2xl bg-[#315b70]"
              >
                <polygon
                  points={ISLAND_POLY.map((p) => p.join(",")).join(" ")}
                  fill="#87a16a"
                />
                <polygon
                  points={DESERT_POLY.map((p) => p.join(",")).join(" ")}
                  fill="#d5b47c"
                />
                {islands.map((i) => (
                  <g key={i.id}>
                    <polygon
                      points={i.shore.map((p) => p.join(",")).join(" ")}
                      fill="#dace9d"
                    />
                    <polygon
                      points={i.grass.map((p) => p.join(",")).join(" ")}
                      fill="#8ba86e"
                    />
                    <circle
                      cx={i.water.x}
                      cy={i.water.y}
                      r={120}
                      fill={i.town ? "#edc76d" : "#a8bdaf"}
                    />
                    <text
                      x={i.x}
                      y={i.y - i.ry - 160}
                      textAnchor="middle"
                      fontSize={400}
                      fill="#f8eed3"
                    >
                      {i.name}
                    </text>
                  </g>
                ))}
                {s.naval.vessels
                  .filter((v) => v.side === "enemy" && v.hp > 0)
                  .map((v) => (
                    <circle
                      key={v.id}
                      cx={v.x}
                      cy={v.y}
                      r={80}
                      fill="#cd8172"
                    />
                  ))}
                <circle
                  cx={s.gnomeX}
                  cy={s.gnomeY}
                  r={150}
                  fill="#fff7dc"
                  stroke="#324c46"
                  strokeWidth={60}
                />
              </svg>
              {s.afloat && !s.naval.battle && <div className="my-3 grid grid-cols-2 gap-2" aria-label="Explore ocean bearings">{[['North',0,-6000],['East',6000,0],['South',0,6000],['West',-6000,0]].map(([name,dx,dy])=><button type="button" key={name} disabled={!!s.fishing||!!s.naval.rescue||!!s.naval.boarding} className={`${btn} bg-pine/10`} onClick={()=>{setOpen(false);window.dispatchEvent(new CustomEvent('hollow-watch:notice-walk',{detail:{x:s.gnomeX+Number(dx),y:s.gnomeY+Number(dy)}}));}}>Explore {name} · next stretch</button>)}</div>}
              {s.afloat && (
                <div className="mb-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={!!s.naval.battle}
                    onClick={() => {
                      s.plotPortCourse("capital");
                      setOpen(false);
                    }}
                    className={`${btn} bg-pine text-parchment`}
                  >
                    Course to Port Victoria
                  </button>
                  <button
                    type="button"
                    disabled={!!s.naval.battle}
                    onClick={() => {
                      s.plotPortCourse("north-landing");
                      setOpen(false);
                    }}
                    className={`${btn} bg-pine text-parchment`}
                  >
                    Course to Thimblehaven
                  </button>
                  <button
                    type="button"
                    disabled={!!s.naval.battle}
                    onClick={() => {
                      s.requestTow();
                      if (useGame.getState().naval.rescue) setOpen(false);
                    }}
                    className={`${btn} bg-gold`}
                  >
                    Call tow service
                  </button>
                </div>
              )}
              {local && (
                <article className="mb-3 rounded-xl bg-gold/20 p-3">
                  <h3 className="font-bold">Ashore at {local.name}</h3>
                  <p className="my-1 text-xs">
                    {local.town
                      ? "Public shipwright, powder shop and bakery. Open Naval command to repair or supply any owned hull."
                      : "A quiet landing. There is no repair yard on this islet."}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {local.town && (
                      <button
                        type="button"
                        disabled={s.coins < 6}
                        onClick={() => s.buyIslandBread()}
                        className={`${btn} bg-parchment`}
                      >
                        Buy bread · 6 coins
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => s.castLine("shore", s.gnomeX, s.gnomeY)}
                      className={`${btn} bg-parchment`}
                    >
                      Fish by the shore
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        s.sailTo("haven", "row");
                        if (useGame.getState().afloat) setOpen(false);
                      }}
                      className={`${btn} bg-parchment`}
                    >
                      Board rowboat at landing
                    </button>
                  </div>
                </article>
              )}
              <div className="space-y-2">
                {islands.map((i) => (
                  <article key={i.id} className="rounded-xl bg-pine/10 p-3">
                    <h3 className="font-bold">
                      {i.name}{" "}
                      {s.ocean.discovered.includes(i.id) ? "· sighted" : ""}
                    </h3>
                    <p className="my-1 text-xs">
                      {i.town
                        ? `${i.population} cottages, market, public port and ship repairs`
                        : "Uninhabited islet · basic landing"}{" "}
                      · {Math.round(i.x)}, {Math.round(i.y)}
                    </p>
                    <button
                      type="button"
                      disabled={
                        !s.afloat || !!s.naval.battle || !!rescue || !!wreck
                      }
                      onClick={() => {
                        s.plotPortCourse(i.id);
                        setOpen(false);
                      }}
                      className={`${btn} bg-parchment`}
                    >
                      Set course to {i.name}
                    </button>
                  </article>
                ))}
              </div>
              <h3 className="mt-4 font-bold">Disabled ships & salvage</h3>
              <p className="my-1 text-xs">
                Enemy hulls become boardable wrecks at zero health. Sail within
                180 map units, climb aboard and search the hold before the
                two-minute sinking timer expires. Loot is paid only when
                collected.
              </p>
              {s.naval.wrecks.map((w) => (
                <article key={w.id} className="mt-2 rounded-xl bg-gold/20 p-3">
                  <p className="text-sm">
                    {boatById(w.kind)?.name} wreck · {Math.ceil(w.seconds)}s ·{" "}
                    {w.looted ? "searched" : "unsearched"}
                  </p>
                  <button
                    type="button"
                    disabled={
                      !s.afloat ||
                      w.seconds <= 20 ||
                      Math.hypot(s.gnomeX - w.x, s.gnomeY - w.y) > 180 ||
                      !!s.naval.battle
                    }
                    onClick={() => {
                      s.boardWreck(w.id);
                      if (useGame.getState().naval.boarding) setOpen(false);
                    }}
                    className={`${btn} bg-parchment`}
                  >
                    Climb aboard wreck
                  </button>
                </article>
              ))}
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
