import { WORLD_VIEW, FRONTIER_SETTLEMENTS } from "@/lib/game/data/frontier";
import { FrontierMap } from "@/components/land/frontier-map";
import {CityPlanner} from "./city-planner";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  BEACH_POLY,
  DESERT_POLY,
  ISLAND_POLY,
  MOUNT_NOBLE,
} from "@/lib/game/world3";
import { PARCELS, parcelAccessOpen } from "@/lib/game/data/parcels";
import { ROAD_PROJECTS } from "@/lib/game/data/expansion";
import {
  DEVELOPMENT_LABELS,
  developmentLevel,
  developmentWorth,
  homeBuildQuote,
} from "@/lib/game/development";
import {
  civicParcelOwner,
  developedRoads,
  parcelBuildingSpot,
} from "@/lib/game/land-planning";
import { useGame } from "@/lib/game/store";
import { levelFromXp } from "@/lib/game/xp";
const poly = (points: [number, number][]) =>
  points.map((p) => p.join(",")).join(" ");
const VIEWS = {
  All: WORLD_VIEW,
  Fernmeadow: "750 -1850 1100 950",
  Willowbank: "1700 -2670 1100 1000",
  Bellweather: "2290 -3630 1100 1000",
  Town: "0 80 2050 1400",
  Sunstep: "2500 100 2100 1500",
  "Noble Reach": "950 -800 1300 1050",
};
export function DeedMap({ onClose }: { onClose: () => void }) {
  const s = useGame(),
    [tab, setTab] = useState<"land" | "roads" | "city">("land"),
    [view, setView] = useState<keyof typeof VIEWS>("All"),
    [picked, setPicked] = useState<string | null>(null);
  const tile = PARCELS.find((p) => p.id === picked) ?? null,
    owned = tile ? s.deeds.includes(tile.id) : false;
  const home = tile ? s.estate[tile.id] : undefined,
    quote = homeBuildQuote(home?.level ?? 0, s.ownedGear);
  const resident = tile ? civicParcelOwner(tile, s.civic) : null,
    owner = tile?.ownerName ?? resident;
  const others = useMemo(
    () => [
      ...Object.values(s.estate),
      ...s.city.buildings,
      ...s.civic.plots.filter((p) => p.stories > 0),
    ],
    [s.estate, s.civic.plots,s.city.buildings],
  );
  const spot = useMemo(
    () => (tile && !home ? parcelBuildingSpot(tile, others) : home),
    [tile, home, others],
  );
  const roads = useMemo(
    () => [...developedRoads(s.roadWorks, s.estate),...s.city.roads],
    [s.roadWorks, s.estate,s.city.roads],
  );
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);
  const button =
    "min-h-11 rounded-xl px-3 text-xs font-bold disabled:opacity-40";
  const sheet = (
    <div
      role="dialog"
      aria-label="Land and road planning"
      aria-modal="true"
      className="fixed inset-0 z-[80] flex flex-col gap-2 bg-[#143028] p-3 text-parchment pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <header className="flex items-center justify-between gap-2">
        <h1 className="font-display text-lg font-semibold">Island planning</h1>
        <button
          type="button"
          onClick={onClose}
          className={`${button} bg-parchment text-ink`}
        >
          Leave
        </button>
      </header>
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          aria-pressed={tab === "land"}
          onClick={() => setTab("land")}
          className={`${button} ${tab === "land" ? "bg-gold text-ink" : "bg-parchment/15"}`}
        >
          Land & homes
        </button>
        <button
          type="button"
          aria-pressed={tab === "roads"}
          onClick={() => setTab("roads")}
          className={`${button} ${tab === "roads" ? "bg-gold text-ink" : "bg-parchment/15"}`}
        >
          Road crew
        </button>
        <button type="button" aria-pressed={tab==='city'} onClick={()=>setTab('city')} className={`${button} ${tab==='city'?'bg-gold text-ink':'bg-parchment/15'}`}>Your city</button>
      </div>
      {tab==='city'?<CityPlanner onReturn={onClose}/>:tab === "roads" ? (
        <section
          aria-label="Road crew projects"
          className="min-h-0 flex-1 overflow-y-auto rounded-2xl bg-parchment p-3 text-ink"
        >
          <h2 className="font-display text-xl font-semibold">
            Holt's road crew
          </h2>
          <p className="mt-1 text-sm font-bold">
            {DEVELOPMENT_LABELS[developmentLevel(s)]} · island wealth{" "}
            {developmentWorth(s)}
          </p>
          <p className="mt-2 text-xs text-bark">
            Coins, permanent equipment, boats, deeds and homes contribute to
            island wealth. Projects need coin funding once; the crew then
            works while you play. Better crafting tools speed them up.
          </p>
          <div className="mt-3 flex flex-col gap-3">
            {ROAD_PROJECTS.map((p, index) => {
              const done = s.roadWorks.completed.includes(p.id),
                active = s.roadWorks.active?.id === p.id;
              const ready =
                index === s.roadWorks.completed.length &&
                !s.roadWorks.active &&
                s.townHallLevel >= p.hall &&
                developmentWorth(s) >= p.wealth &&
                s.coins >= p.coins &&
                s.logs >= p.logs;
              return (
                <article
                  key={p.id}
                  className="rounded-xl bg-parchment-dark p-3"
                >
                  <h3 className="font-display text-lg">{p.name}</h3>
                  <p className="text-xs font-semibold">
                    {p.coins} coins · Hall {p.hall} · wealth{" "}
                    {p.wealth}
                  </p>
                  {active ? (
                    <>
                      <progress
                        className="mt-2 w-full"
                        aria-label={`${p.name} construction`}
                        value={s.roadWorks.active!.progress}
                        max={1}
                      />
                      <p className="text-sm font-bold">
                        Crew at work ·{" "}
                        {Math.round(s.roadWorks.active!.progress * 100)}%
                      </p>
                    </>
                  ) : done ? (
                    <p className="mt-2 font-bold text-pine">Road open</p>
                  ) : (
                    <button
                      type="button"
                      disabled={!ready}
                      onClick={() => s.commissionRoad(p.id)}
                      className={`${button} mt-2 w-full bg-pine text-parchment`}
                    >
                      Commission {p.name}
                    </button>
                  )}
                  {FRONTIER_SETTLEMENTS.some(d=>d.road===p.id)&&<p className="mt-2 text-xs">Opens new settlement land and six home sites for incoming families.</p>}
                  {p.id === "noble-reach" && (
                    <p className="mt-2 text-xs">
                      Opens northern home construction and six NPC settlement
                      sites beyond Mount Noble.
                    </p>
                  )}
                </article>
              );
            })}
          </div>
          <p
            role="status"
            className="mt-3 rounded-xl bg-pine/10 p-3 text-sm font-bold"
          >
            {s.speech}
          </p>
        </section>
      ) : (
        <>
          <p className="text-xs">
            Gold is yours. Cream belongs to residents. Public road corridors
            stay clear; the surrounding land can be owned.
          </p>
          <div className="flex gap-1 overflow-x-auto">
            {(Object.keys(VIEWS) as (keyof typeof VIEWS)[]).map((v) => (
              <button
                type="button"
                key={v}
                aria-pressed={view === v}
                onClick={() => setView(v)}
                className={`${button} shrink-0 ${view === v ? "bg-parchment text-ink" : "bg-parchment/15"}`}
              >
                {v}
              </button>
            ))}
          </div>
          <svg
            viewBox={VIEWS[view]}
            className="min-h-32 flex-1 rounded-2xl bg-[#1e4d5a]"
            aria-label="Parcel map"
          >
            <polygon points={poly(BEACH_POLY)} fill="#e7d7a2" />
            <polygon points={poly(DESERT_POLY)} fill="#e2b15a" />
            <polygon points={poly(ISLAND_POLY)} fill="#6f8f66" />
            <circle
              cx={MOUNT_NOBLE.x}
              cy={MOUNT_NOBLE.y}
              r={460}
              fill="#657359"
              opacity={0.45}
            />
            <text
              x={MOUNT_NOBLE.x}
              y={MOUNT_NOBLE.y}
              textAnchor="middle"
              fill="#efe4cf"
              fontSize={35}
            >
              Mount Noble
            </text>
            <FrontierMap labels/>
            {roads.map((r) => (
              <polyline
                key={r.id}
                points={poly(r.points)}
                fill="none"
                stroke={r.surface === "dirt" ? "#aa9169" : "#ded1b5"}
                strokeWidth={r.width / 0.05}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
            {PARCELS.map((p) => {
              const mine = s.deeds.includes(p.id),
                privateOwner = p.ownerName ?? civicParcelOwner(p, s.civic);
              return (
                <path
                  role="button"
                  tabIndex={0}
                  aria-label={`Parcel ${p.id}${mine ? ", owned" : ""}`}
                  key={p.id}
                  d={p.land
                    ?.flatMap((polygon) =>
                      polygon.map(
                        (ring) =>
                          `M${ring.map((v) => v.join(",")).join(" L")}Z`,
                      ),
                    )
                    .join(" ")}
                  fillRule="evenodd"
                  fill={mine ? "#d6a84c" : privateOwner ? "#efe4cf" : "#c9d6c2"}
                  fillOpacity={0.65}
                  stroke={picked === p.id ? "#24402f" : "#486d52"}
                  strokeWidth={picked === p.id ? 5 : 1}
                  onClick={() => setPicked(p.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setPicked(p.id);
                    }
                  }}
                />
              );
            })}
            {s.city.buildings.map(b=><rect key={b.id} x={b.x-25} y={b.y-22} width={50} height={44} fill={b.kind==='depot'?'#345d70':b.kind==='housing'?'#914f3e':'#61466b'} pointerEvents="none"/>)}
            {Object.entries(s.estate).map(([id, h]) => (
              <rect
                key={id}
                x={h.x - 22}
                y={h.y - 20}
                width={44}
                height={40}
                fill="#914f3e"
                pointerEvents="none"
              />
            ))}
            <text
              x={1600}
              y={-680}
              textAnchor="middle"
              fill="#f2e8d5"
              fontSize={35}
            >
              Noble Reach
            </text>
          </svg>
          {tile ? (
            <section
              aria-label="Selected parcel"
              className="max-h-[43dvh] shrink-0 overflow-y-auto rounded-2xl bg-parchment p-3 text-ink"
            >
              <div className="flex justify-between gap-2">
                <h2 className="font-display text-lg font-semibold">
                  {owned
                    ? "Your ground"
                    : owner
                      ? `${owner}'s ground`
                      : tile.northern
                        ? `${tile.district??"Noble Reach"} parcel`
                        : "Roadside parcel"}
                </h2>
                <button
                  type="button"
                  onClick={() => setPicked(null)}
                  className="min-h-8 px-2 text-xs font-bold"
                >
                  Back to map
                </button>
              </div>
              <p className="text-xs">
                {Math.round(((tile.usableArea ?? 0) / (tile.w * tile.h)) * 100)}
                % of this parcel is available land outside roads and existing buildings. Roads
                never become private property.
              </p>
              {!owned && !owner && (
                <p className="mt-2 text-xs font-bold">
                  {spot
                    ? "Room for a home, with the road kept clear."
                    : "Land only: no safe home footprint is available."}
                </p>
              )}
              {!owned && owner ? (
                <p className="mt-2 font-bold">Private land is not for sale.</p>
              ) : !owned ? (
                <button
                  type="button"
                  disabled={
                    s.coins < tile.price || (tile.usableArea ?? 0) < 1000
                  }
                  onClick={() => s.buyParcel(tile.id)}
                  className={`${button} mt-2 w-full bg-gold`}
                >
                  Buy deed · {tile.price} coins
                </button>
              ) : (
                <>
                  <p className="mt-2 text-xs font-bold">
                    {home
                      ? `${home.level} storey home`
                      : spot
                        ? "A clear building footprint is available"
                        : "No safe house footprint; this deed can still be held as land"}
                  </p>
                  {quote && spot && (
                    <button
                      type="button"
                      disabled={
                        s.coins < quote.coins ||
                        s.logs < quote.logs ||
                        s.townHallLevel < quote.hall ||
                        levelFromXp(s.skills.crafting) < quote.crafting ||
                        Boolean(
                          !parcelAccessOpen(tile,s.roadWorks.completed),
                        )
                      }
                      onClick={() => s.buildParcelHome(tile.id)}
                      className={`${button} mt-2 w-full bg-pine text-parchment`}
                    >
                      {home ? "Extend home" : "Build home"} · {quote.coins}{" "}
                      coins
                    </button>
                  )}
                  {quote && spot && (
                    <p className="mt-1 text-[11px]">
                      Hall {quote.hall} · Crafting {quote.crafting}
                      {tile.northern
                        ? " · District road must be finished"
                        : ""}
                    </p>
                  )}
                  {!home && (
                    <button
                      type="button"
                      onClick={() => s.sellParcel(tile.id)}
                      className={`${button} mt-2 w-full bg-parchment-dark`}
                    >
                      Sell empty deed ·{" "}
                      {Math.max(1, Math.floor(tile.price * 0.7))} coins
                    </button>
                  )}
                </>
              )}
              <p role="status" className="mt-2 text-xs font-semibold text-bark">
                {s.speech}
              </p>
            </section>
          ) : (
            <p className="text-center text-xs">
              Choose an area, then tap a parcel. {s.coins} coins · {s.logs}{" "}
              logs.
            </p>
          )}
        </>
      )}
    </div>
  );
  return typeof document === "undefined"
    ? sheet
    : createPortal(sheet, document.body);
}
