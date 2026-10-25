import {TownOutlook} from "./town-outlook";
import {NeighbourDirectory} from "./neighbours";
import {NEIGHBOUR_EVENT} from "@/lib/game/neighbours";
import {PROJECT_WORK} from "@/lib/game/thimblehaven";
import {TownNoticeboard} from "./town-noticeboard";
import {NOTICEBOARD_EVENT,TOWN_MILESTONES} from "@/lib/game/town-progress";
import {fleetSeeds} from "@/lib/game/naval";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useGame } from "@/lib/game/store";
import {
  TOWN_PROJECTS,
  thimbleConnected,
  thimbleRemark,
} from "@/lib/game/thimblehaven";
import { ROAD_PROJECTS } from "@/lib/game/data/expansion";
import { gunLimit, hullStrength, shipFit } from "@/lib/game/naval";
import { BOATS, boatById } from "@/lib/game/data/boats";
import { levelFromXp } from "@/lib/game/xp";
import { wagonQuote } from "@/lib/game/transport";
import { BoatShowroom } from "./boat-showroom";
const btn =
  "min-h-11 rounded-xl px-3 py-2 text-sm font-bold disabled:opacity-40";
export function NorthernSeas() {
  const s = useGame(),
    [open, setOpen] = useState(false),
    [tab, setTab] = useState<"town" | "naval" | "board" | "neighbours">("town"),
    [selectedNeighbour,setSelectedNeighbour]=useState("nim"),
    [hull, setHull] = useState("row");
  useEffect(()=>{const openNeighbour=(e:Event)=>{const id=(e as CustomEvent<string>).detail;if(id)setSelectedNeighbour(id);setTab("neighbours");setOpen(true);};window.addEventListener(NEIGHBOUR_EVENT,openNeighbour);return()=>window.removeEventListener(NEIGHBOUR_EVENT,openNeighbour);},[]);
  useEffect(()=>{const openBoard=()=>{setTab("board");setOpen(true);};window.addEventListener(NOTICEBOARD_EVENT,openBoard);return()=>window.removeEventListener(NOTICEBOARD_EVENT,openBoard);},[]);
  if (
    !s.named ||
    s.atHome ||
    s.bank.pending || s.naval.rescue || s.naval.boarding ||
    s.interior ||
    s.abroad ||
    s.combat
  )
    return null;
  const selected = boatById(hull)!,
    fit = shipFit(s.naval, hull),
    boat = s.afloat ? boatById(s.afloat) : null,
    battle = s.naval.vessels.find((v) => v.id === s.naval.battle),
    project = TOWN_PROJECTS[s.thimble.projects.length],
    road = ROAD_PROJECTS[s.roadWorks.completed.length],
    owned = hull === "row" || s.hulls.includes(hull),
    warfare = levelFromXp(s.skills.navalWarfare);
  return (
    <>
      <button
        type="button"
        onClick={() => {
          setTab(s.afloat ? "naval" : "town");
          if (s.afloat) setHull(s.afloat);
          setOpen(true);
        }}
        className={`${btn} fixed bottom-56 left-3 z-30 bg-parchment text-pine shadow-panel`}
      >
        {s.afloat ? "Naval command" : "Thimblehaven council"}
      </button>
      {battle && (
        <div className="fixed inset-x-3 top-20 z-40 mx-auto max-w-md rounded-2xl bg-pine p-3 text-parchment">
          <strong>
            {battle.name} · {battle.hp} hull
          </strong>
          <progress aria-label="Enemy ship health" value={battle.hp} max={fleetSeeds().find(v=>v.id===battle.id)?.hp??battle.hp} className="mt-1 h-3 w-full accent-[#d6aa60]"/>
          <p className="text-xs">
            Your hull {s.naval.integrity[s.afloat!] ?? hullStrength(s.afloat!)}{" "}
            · {s.naval.ammo} shot · Reload {s.naval.cooldown.toFixed(1)}s
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              disabled={s.naval.cooldown > 0 || s.naval.ammo <= 0}
              onClick={() => s.fireBroadside()}
              className={`${btn} bg-gold text-ink`}
            >
              Fire broadside
            </button>
            <button
              type="button"
              onClick={() => s.retreatShip()}
              className={`${btn} bg-parchment text-pine`}
            >
              Withdraw to harbour
            </button>
          </div>
        </div>
      )}
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[96] flex items-end justify-center bg-ink/60 p-3"
            role="dialog"
            aria-modal="true"
            aria-label="Thimblehaven and naval command"
          >
            <section className="max-h-[92dvh] w-full max-w-xl overflow-auto rounded-3xl bg-parchment p-4 text-ink">
              <div className="sticky top-0 z-10 bg-parchment pb-3">
                <header className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold">
                    Thimblehaven & the fleet
                  </h2>
                  <button
                    type="button"
                    className={`${btn} bg-pine/10`}
                    onClick={() => setOpen(false)}
                  >
                    Close command
                  </button>
                </header>
                <p className="my-2 text-sm">
                  {s.coins.toLocaleString()} coins · Naval Warfare {warfare}
                </p>
                <nav className="flex gap-2 overflow-x-auto">
                  {(["town", "board", "neighbours", "naval"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={tab === t}
                      onClick={() => setTab(t)}
                      className={`${btn} ${tab === t ? "bg-pine text-parchment" : "bg-pine/10"}`}
                    >
                      {t === "town" ? "Your town" : t === "board" ? "Noticeboard" : t === "neighbours" ? "Neighbours" : "Naval command"}
                    </button>
                  ))}
                </nav>
              </div>
              {tab === "neighbours" ? <NeighbourDirectory selected={selectedNeighbour} onSelect={setSelectedNeighbour} onTravel={()=>setOpen(false)}/> : tab === "board" ? <TownNoticeboard onTravel={()=>setOpen(false)}/> : tab === "town" ? (
                <div className="space-y-3">
                  <h3 className="font-display text-xl font-bold">
                    Your home. Your little frontier town.
                  </h3>
                  <p className="text-sm">
                    Your home and all its upgrades are now in Thimblehaven. The
                    town begins with two neighbours and a public landing. Fund
                    improvements, provide room for newcomers and connect the
                    town to the island.
                  </p>
                  <button type="button" className={`${btn} w-full bg-pine text-parchment`} onClick={()=>setTab("board")}>Town milestones & neighbour notices · {s.townProgress.claimed.length}/{TOWN_MILESTONES.length}</button>
                  <p className="rounded-xl bg-gold/20 p-3 text-sm">
                    {s.thimble.news}
                  </p>
                  <TownOutlook/>
                  <p className="text-sm italic">{thimbleRemark(s)}</p>
                  <p className="text-xs">
                    {s.thimble.residents.length} households ·{" "}
                    {s.thimble.revenue} household levies earned ·{" "}
                    {s.thimble.spent.toLocaleString()} spent building the town
                  </p>
                  <label className="block text-sm font-bold">
                    Household levy per collection
                    <select
                      aria-label="Thimblehaven household levy"
                      value={s.thimble.tax}
                      onChange={(e) => s.setThimbleTax(Number(e.target.value))}
                      className="my-2 min-h-11 w-full rounded-xl bg-pine/10 px-2"
                    >
                      {[0, 1, 2, 3].map((n) => (
                        <option key={n} value={n}>
                          {n} coins
                        </option>
                      ))}
                    </select>
                  </label>
                  <p className="text-xs">
                    Collected every 90 seconds of active town simulation from
                    neighbours’ own purses. Markets improve earnings; recession
                    and high levies can drive broke families away. New cottages
                    fill when the island economy supports them.
                  </p>
                  {TOWN_PROJECTS.map((p) => (
                    <article key={p.id} className="rounded-xl bg-pine/10 p-3">
                      <h4 className="font-bold">{p.name}</h4>
                      <p className="my-1 text-xs">{p.description}</p>
                      {s.thimble.construction?.id===p.id&&<><progress aria-label={`${p.name} construction`} className="my-2 w-full" value={s.thimble.construction.progress} max={PROJECT_WORK[p.id]}/><p className="text-xs">Under construction · {Math.round(s.thimble.construction.progress/PROJECT_WORK[p.id]!*100)}% · Already paid</p></>}
                      <button
                        type="button"
                        disabled={
                          !!s.thimble.construction ||
                          s.thimble.projects.includes(p.id) ||
                          project?.id !== p.id ||
                          s.coins < p.cost
                        }
                        onClick={() => s.fundThimble(p.id)}
                        className={`${btn} bg-parchment`}
                      >
                        {s.thimble.projects.includes(p.id)
                          ? "Built"
                          : s.thimble.construction?.id===p.id ? "Builders at work" : `Fund · ${p.cost.toLocaleString()} coins`}
                      </button>
                    </article>
                  ))}
                  <h3 className="font-bold">A road and real donkey traffic</h3>
                  <p className="text-sm">
                    {thimbleConnected(s)
                      ? "The harbour road and town wagon service are connected. The snide remarks have stopped."
                      : s.roadWorks.completed.includes("thimble-road")
                        ? "The road is ready. Start a wagon service and keep at least 2 coins available for arrival upkeep."
                        : "Complete the road crew’s island projects, then commission Thimblehaven harbour road."}
                  </p>
                  {s.roadWorks.active ? (
                    <p className="text-sm">
                      Road crew: {Math.round(s.roadWorks.active.progress * 100)}
                      % complete
                    </p>
                  ) : (
                    road && (
                      <button
                        type="button"
                        className={`${btn} bg-pine text-parchment`}
                        disabled={s.coins < road.coins}
                        onClick={() => s.commissionRoad(road.id)}
                      >
                        Commission {road.name} · {road.coins.toLocaleString()}{" "}
                        coins · Hall {road.hall}
                      </button>
                    )
                  )}
                  <button
                    type="button"
                    className={`${btn} bg-pine text-parchment`}
                    disabled={
                      !s.thimble.projects.includes("depot") ||
                      !s.roadWorks.completed.includes("thimble-road") ||
                      s.coins < wagonQuote(s.transport)
                    }
                    onClick={() => s.buyPassengerWagon("thimble-road")}
                  >
                    Start harbour wagon service ·{" "}
                    {wagonQuote(s.transport).toLocaleString()} coins
                  </button>
                  <h3 className="font-bold">Your neighbours</h3>
                  {s.thimble.residents.map((r) => (
                    <button
                      type="button"
                      key={r.id}
                      onClick={() => {setSelectedNeighbour(r.id);setTab("neighbours");}}
                      className={`${btn} block w-full bg-pine/10 text-left`}
                    >
                      {r.name} · {r.purse} coins · Talk
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="block text-sm font-bold">
                    Ship
                    <select
                      aria-label="Naval ship"
                      value={hull}
                      onChange={(e) => setHull(e.target.value)}
                      className="my-2 min-h-11 w-full rounded-xl bg-pine/10 px-2"
                    >
                      {BOATS.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} · {gunLimit(b.id)} guns maximum
                        </option>
                      ))}
                    </select>
                  </label>
                  <BoatShowroom
                    kind={selected.id}
                    parts={s.ports.parts[hull] ?? []}
                    guns={fit.guns}
                  />
                  <p className="text-sm">{selected.blurb}</p>
                  <p className="text-xs">
                    {fit.guns}/{gunLimit(hull)} cannons fitted · {fit.crew}{" "}
                    gunners · Hull{" "}
                    {s.naval.integrity[hull] ?? hullStrength(hull)}/
                    {hullStrength(hull)}
                  </p>
                  {!owned && (
                    <button
                      type="button"
                      disabled={
                        s.coins < selected.price ||
                        levelFromXp(s.skills.sailing) < selected.need ||
                        warfare < (selected.warfare ?? 1)
                      }
                      onClick={() => s.buyBoat(hull)}
                      className={`${btn} bg-pine text-parchment`}
                    >
                      Buy · {selected.price.toLocaleString()} · Sailing{" "}
                      {selected.need} · Warfare {selected.warfare ?? 1}
                    </button>
                  )}
                  <p className="text-xs">
                    Visit a public landing or your own wharf to arm, crew and
                    repair a ship. Every cannon belongs to one hull. Small craft
                    carry at most one or two; warships carry up to twenty.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={
                        !owned ||
                        fit.guns >= gunLimit(hull) ||
                        s.coins < 45 ||
                        !!s.afloat
                      }
                      className={`${btn} bg-pine text-parchment`}
                      onClick={() => s.armShip(hull)}
                    >
                      Fit cannon · 45 coins
                    </button>
                    <button
                      type="button"
                      disabled={
                        !owned ||
                        fit.crew >= fit.guns ||
                        s.coins < 350 * (fit.crew + 1) ||
                        !!s.afloat
                      }
                      className={`${btn} bg-pine text-parchment`}
                      onClick={() => s.hireGunner(hull)}
                    >
                      Hire gunner · {350 * (fit.crew + 1)} coins
                    </button>
                    <button
                      type="button"
                      disabled={s.coins < 30 || !!s.afloat}
                      className={`${btn} bg-pine text-parchment`}
                      onClick={() => s.buyShot()}
                    >
                      20 shot · 30 coins
                    </button>
                    <button
                      type="button"
                      disabled={
                        !owned ||
                        !!s.afloat ||
                        (s.naval.integrity[hull] ?? hullStrength(hull)) >=
                          hullStrength(hull)
                      }
                      className={`${btn} bg-pine text-parchment`}
                      onClick={() => s.repairShip(hull)}
                    >
                      Repair hull ·{" "}
                      {Math.ceil(
                        hullStrength(hull) -
                          (s.naval.integrity[hull] ?? hullStrength(hull)),
                      ) * 3}{" "}
                      coins
                    </button>
                  </div>
                  <p className="text-xs">
                    A solo captain fires up to two guns per salvo; hired gunners
                    fire one each. Salvos reload for six seconds. Each gun uses
                    one shot; crewed shots also cost one coin in wages. Actual
                    damage trains Naval Warfare and improves gun damage. Damaged
                    ships and enemy hulls stay damaged after retreat or reload.
                  </p>
                  <button
                    type="button"
                    className={`${btn} bg-gold`}
                    onClick={() => s.toggleGunners()}
                  >
                    Automatic gunners: {s.naval.auto ? "on" : "off"}
                  </button>
                  <p className="text-xs">
                    Shot {s.naval.ammo} · Naval victories {s.naval.victories}
                  </p>
                  <h3 className="font-bold">Ships at sea</h3>
                  {s.naval.vessels.map((v) => (
                    <article key={v.id} className="rounded-xl bg-pine/10 p-3">
                      <strong>{v.name}</strong>
                      <p className="text-xs">
                        {v.side === "friendly"
                          ? "Friendly · protected"
                          : "Hostile"}{" "}
                        · {v.x}, {v.y} · {v.hp} hull · {v.guns} guns
                        {v.respawn > 0
                          ? ` · Regrouping ${Math.ceil(v.respawn)}s`
                          : ""}
                      </p>
                      <button
                        type="button"
                        className={`${btn} mt-1 bg-parchment`}
                        disabled={
                          !s.afloat ||
                          !!s.naval.battle ||
                          v.side !== "enemy" ||
                          v.hp <= 0 ||
                          Math.hypot(s.gnomeX - v.x, s.gnomeY - v.y) > 350
                        }
                        onClick={() => {
                          s.engageShip(v.id);
                          if (useGame.getState().naval.battle) setOpen(false);
                        }}
                      >
                        Engage within gun range
                      </button>
                    </article>
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
