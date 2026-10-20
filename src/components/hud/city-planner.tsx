import { NorthGatewayPanel } from "./island-outlook";
import { HOME_STYLES, HOME_PALETTES } from "@/lib/game/home-design";
import { FRONTIER_SETTLEMENTS } from "@/lib/game/data/frontier";
import { FrontierMap } from "@/components/land/frontier-map";
import { useState } from "react";
import { useGame } from "@/lib/game/store";
import {
  CITY_BUILDINGS,
  citySetupCost,
  CITY_SUPPLY_PRICE,
  cityRoads,
  citySiteError,
  cityUpgradeCost,
  cityCapacity,
  routePosition,
  routeLength,
  snapCityRoad,
  cityRoadError,
  type CityKind,
} from "@/lib/game/city";
import { PARCELS, parcelAt } from "@/lib/game/data/parcels";
import { BEACH_POLY, ISLAND_POLY, DESERT_POLY } from "@/lib/game/world3";
import type { RoadPoint } from "@/lib/game/data/road-layout";
const pts = (p: RoadPoint[]) => p.map((v) => v.join(",")).join(" ");
const button =
  "min-h-11 rounded-xl px-3 py-2 text-xs font-bold disabled:opacity-40";
export function CityPlanner({ onReturn }: { onReturn: () => void }) {
  const s = useGame(),
    city = s.city,
    owned = s.deeds.map(parcelAt).filter((p) => !!p);
  const [name, setName] = useState(city.name),
    [focus, setFocus] = useState(owned[0]?.id ?? "town"),
    [kind, setKind] = useState<CityKind | "road">(
      city.buildings.some((b) => b.kind === "home") ? "depot" : "home",
    ),
    [marker, setMarker] = useState<RoadPoint | null>(null),
    [start, setStart] = useState<RoadPoint | null>(null);
  const parcel = parcelAt(focus),
    viewBox = parcel
      ? `${parcel.x - 110} ${parcel.y - 100} ${parcel.w + 220} ${parcel.h + 200}`
      : FRONTIER_SETTLEMENTS.some(d=>d.id===focus)
        ? (()=>{const d=FRONTIER_SETTLEMENTS.find(d=>d.id===focus)!;return `${d.x-520} ${d.y-440} 1100 1000`;})()
      : focus === "north"
        ? "950 -800 1300 1050"
        : focus === "sun"
          ? "2500 100 2100 1500"
          : "0 80 2050 1400";
  const cost =
      kind === "road"
        ? null
        : { ...CITY_BUILDINGS[kind], coins: citySetupCost(city, kind) },
    error = marker
      ? kind === "road"
        ? start
          ? cityRoadError(s, snapCityRoad(s, start), snapCityRoad(s, marker))
          : null
        : citySiteError(s, kind, ...marker)
      : null;
  const length =
    start && marker
      ? Math.hypot(start[0] - marker[0], start[1] - marker[1])
      : 0;
  const residents = city.buildings.reduce((n, b) => n + b.residents, 0);
  return (
    <section
      aria-label="Your city"
      className="min-h-0 flex-1 overflow-y-auto rounded-2xl bg-parchment p-3 text-ink"
    >
      <div className="flex gap-2">
        <input
          aria-label="City name"
          maxLength={28}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="min-w-0 flex-1 rounded-xl border border-bark/20 bg-white px-3 font-display text-lg"
        />
        <button
          className={`${button} bg-pine text-parchment`}
          onClick={() => s.nameCity(name)}
        >
          Name city
        </button>
      </div>
      <p className="mt-2 text-sm font-bold">
        {residents} residents · {city.carts.length} donkey carts · {city.earned}{" "}
        coins earned
      </p>
      <p className="mt-1 text-xs">
        {s.coins} coins · Hall {s.townHallLevel}. Buy land in Land & homes
        first. Build a depot and factory beside connected roads, buy supplies
        with coins, then hire a cart. Earnings go to your wallet.
      </p>
      <p className="mt-1 text-xs text-bark">
        Production and deliveries run while you explore this island. They pause
        at home, in interiors, overseas and during combat; closing the game
        pauses the city.
      </p>
      <button
        className={`${button} mt-2 w-full bg-gold`}
        disabled={
          !city.buildings.some((b) => b.kind === "home") ||
          !!s.combat ||
          !!s.abroad ||
          !!s.afloat
        }
        onClick={() => {
          s.returnCityHome();
          onReturn();
        }}
      >
        Return to your city home
      </button>
      {!city.buildings.some((b) => b.kind === "home") && (
        <p className="mt-2 text-xs font-bold">
          Place Your home on your city land for 180 coins. Your existing cottage
          moves there with all its upgrades.
        </p>
      )}
      <NorthGatewayPanel/>
      <section aria-label="Home styles" className="mt-3 rounded-xl bg-pine/10 p-3"><h3 className="text-sm font-bold">Your home’s style</h3><p className="text-xs">Decorators cost {90*(s.cottageLevel+1)} coins. Your upgrades stay.</p><div className="mt-2 grid grid-cols-2 gap-2">{HOME_STYLES.map(style=><button type="button" key={style} disabled={s.playerHomeStyle===style||s.coins<90*(s.cottageLevel+1)} onClick={()=>s.restyleHome(style)} className={`${button} ${s.playerHomeStyle===style?'bg-pine text-parchment':'bg-parchment'}`}>{HOME_PALETTES[style].name}</button>)}</div></section>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="text-xs font-bold">
          Build
          <select
            aria-label="City construction"
            value={kind}
            onChange={(e) => {
              setKind(e.target.value as CityKind | "road");
              setStart(null);
            }}
            className="mt-1 min-h-11 w-full rounded-xl bg-parchment-dark p-2"
          >
            {Object.entries(CITY_BUILDINGS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.name}
              </option>
            ))}
            <option value="road">Gravel street</option>
          </select>
        </label>
        <label className="text-xs font-bold">
          Map area
          <select
            aria-label="City map area"
            value={focus}
            onChange={(e) => {
              setFocus(e.target.value);
              setMarker(null);
              setStart(null);
            }}
            className="mt-1 min-h-11 w-full rounded-xl bg-parchment-dark p-2"
          >
            <option value="town">Town</option>
            <option value="sun">Sunstep</option>
            <option value="north">Noble Reach</option>
            {FRONTIER_SETTLEMENTS.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
            {owned.map((p) => (
              <option key={p.id} value={p.id}>
                Your deed {p.id}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="my-2 text-xs">
        {cost
          ? `${cost.name}: ${cost.coins} coins · Hall ${cost.hall}. ${cost.description} Tap the gold land to mark a building site.`
          : "Road crew: 1 coin per 2 map units. Tap a start point, set the start, then tap an end. Junctions snap to existing roads."}
      </p>
      <svg
        aria-label="City construction map"
        viewBox={viewBox}
        className="h-64 w-full touch-manipulation rounded-xl bg-[#1e4d5a]"
        onClick={(e) => {
          const svg = e.currentTarget,
            matrix = svg.getScreenCTM();
          if (!matrix) return;
          const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(
            matrix.inverse(),
          );
          setMarker([Math.round(p.x), Math.round(p.y)]);
        }}
      >
        <polygon points={pts(BEACH_POLY)} fill="#e7d7a2" />
        <polygon points={pts(ISLAND_POLY)} fill="#6f8f66" />
        <polygon points={pts(DESERT_POLY)} fill="#e2b15a" />
        {PARCELS.map((p) => (
          <path
            key={p.id}
            d={p.land
              ?.flatMap((poly) =>
                poly.map((r) => `M${r.map((v) => v.join(",")).join(" L")}Z`),
              )
              .join(" ")}
            fillRule="evenodd"
            fill={s.deeds.includes(p.id) ? "#e1b44e" : "#c9d6c2"}
            fillOpacity={0.65}
            stroke="#486d52"
            strokeWidth={1}
          />
        ))}
        <FrontierMap/>
        {cityRoads(s).map((r) => (
          <polyline
            key={r.id}
            points={pts(r.points)}
            fill="none"
            stroke={r.id.startsWith("city-") ? "#f4e4be" : "#c7b697"}
            strokeWidth={r.width / 0.05}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {[
          ...Object.values(s.estate),
          ...s.civic.plots.filter((p) => p.stories > 0),
        ].map((b, i) => (
          <rect
            key={i}
            x={b.x - 22}
            y={b.y - 20}
            width={44}
            height={40}
            fill="#736052"
          />
        ))}
        {city.buildings.map((b) => (
          <g key={b.id}>
            <rect
              x={b.x - 25}
              y={b.y - 22}
              width={50}
              height={44}
              rx={4}
              fill={
                b.kind === "depot"
                  ? "#345d70"
                  : b.kind === "housing"
                    ? "#914f3e"
                    : "#61466b"
              }
              stroke="#fff2d2"
              strokeWidth={2}
            />
            <text
              x={b.x}
              y={b.y + 5}
              fontSize={15}
              fill="white"
              textAnchor="middle"
            >
              {b.kind === "home"
                ? "P"
                : b.kind === "depot"
                  ? "D"
                  : b.kind === "housing"
                    ? "H"
                    : "F"}
              {b.level}
            </text>
          </g>
        ))}
        {city.carts.map((c) => {
          const p = routePosition(
            c.route,
            c.returning ? routeLength(c.route) - c.distance : c.distance,
          );
          return (
            <circle
              key={c.factory}
              cx={p.x}
              cy={p.y}
              r={7}
              fill="#faf3d3"
              stroke="#5b4030"
              strokeWidth={3}
            />
          );
        })}
        {start && kind === "road" && (
          <circle cx={start[0]} cy={start[1]} r={9} fill="#295c42" />
        )}
        {start && marker && kind === "road" && (
          <line
            x1={start[0]}
            y1={start[1]}
            x2={marker[0]}
            y2={marker[1]}
            stroke={error ? "#b63e37" : "#fff2d2"}
            strokeWidth={24}
            opacity={0.6}
          />
        )}
        {marker && (
          <g stroke={error ? "#b63e37" : "#fff8dc"} strokeWidth={3}>
            <rect
              x={marker[0] - 26}
              y={marker[1] - 24}
              width={52}
              height={48}
              fill="none"
            />
            <path
              d={`M${marker[0] - 10} ${marker[1]}h20 M${marker[0]} ${marker[1] - 10}v20`}
            />
          </g>
        )}
      </svg>
      <div className="mt-2 flex flex-wrap gap-2">
        {kind === "road" ? (
          <>
            <button
              className={`${button} bg-parchment-dark`}
              disabled={!marker}
              onClick={() => {
                setStart(marker);
                setMarker(null);
              }}
            >
              Set road start
            </button>
            <button
              className={`${button} bg-pine text-parchment`}
              disabled={
                !start ||
                !marker ||
                !!error ||
                s.townHallLevel < 2 ||
                s.coins < Math.ceil(length / 2)
              }
              onClick={() => {
                if (start && marker) {
                  const before = s.city.roads.length;
                  s.layCityRoad(start, marker);
                  if (useGame.getState().city.roads.length > before) {
                    setStart(null);
                    setMarker(null);
                  }
                }
              }}
            >
              Lay road{length > 0 ? ` · ~${Math.ceil(length / 2)} coins` : ""}
            </button>
            <button
              className={`${button} bg-parchment-dark`}
              onClick={() => {
                setStart(null);
                setMarker(null);
              }}
            >
              Cancel road
            </button>
          </>
        ) : (
          <button
            className={`${button} w-full bg-pine text-parchment`}
            disabled={!marker || !!error || !cost || s.coins < cost.coins}
            onClick={() => {
              if (marker) {
                const before = s.city.buildings.length;
                s.buildCity(kind, ...marker);
                if (useGame.getState().city.buildings.length > before)
                  setMarker(null);
              }
            }}
          >
            Build {cost?.name}
            {marker ? ` at ${marker.join(", ")}` : " · mark a site first"}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-2 text-xs font-bold text-[#9c3e32]">{error}</p>
      )}
      <p
        role="status"
        className="my-3 rounded-xl bg-pine/10 p-3 text-sm font-bold"
      >
        {s.speech}
      </p>
      <h2 className="font-display text-lg">{city.name} buildings</h2>
      {!city.buildings.length && (
        <p className="mt-2 text-sm">
          Start with a trade depot on your own roadside land.
        </p>
      )}
      <div className="mt-2 grid gap-3 md:grid-cols-2">
        {city.buildings.map((b) => {
          const upgrade = cityUpgradeCost(b),
            cart = city.carts.find((c) => c.factory === b.id),
            factory = b.kind === "sawmill" || b.kind === "workshop";
          return (
            <article key={b.id} className="rounded-xl bg-parchment-dark p-3">
              <h3 className="font-bold">
                {CITY_BUILDINGS[b.kind].name} · level {b.level}
              </h3>
              <p className="text-xs">
                {b.parcel} · {b.x}, {b.y}
              </p>
              {factory ? (
                <>
                  <p className="mt-2 text-sm">
                    {b.supplies}/100 supply units · {b.stock}/{cityCapacity(b)}{" "}
                    crates ready
                  </p>
                  <p className="text-xs">
                    {cart
                      ? cart.returning
                        ? `Cart returning · ${cart.supplies} supply units`
                        : cart.cargo
                          ? `Delivering ${cart.cargo} crates`
                          : "Cart waiting for goods"
                      : "No delivery cart hired"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      className={`${button} bg-pine text-parchment`}
                      disabled={
                        s.coins < CITY_SUPPLY_PRICE || b.supplies >= 100
                      }
                      onClick={() => s.supplyCity(b.id)}
                    >
                      Buy up to 10 supplies · 3 coins each
                    </button>
                    <button
                      className={`${button} bg-gold`}
                      disabled={!!cart || s.coins < 180}
                      onClick={() => s.hireCityCart(b.id)}
                    >
                      {cart ? "Cart working" : "Hire donkey cart · 180 coins"}
                    </button>
                    {cart && (
                      <button
                        className={`${button} bg-white/60`}
                        aria-pressed={cart.autoSupply}
                        onClick={() => s.toggleCitySupply(b.id)}
                      >
                        Automatic supplies: {cart.autoSupply ? "on" : "off"}
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <p className="mt-2 text-sm">
                  {b.kind === "home"
                    ? "Your own home, with your existing furniture, upgrades and interior."
                    : b.kind === "housing"
                      ? `${b.residents}/${4 * b.level} residents · grows after your first delivery if connected to a depot`
                      : `Cart capacity: ${6 * b.level} crates. Sales arrive automatically in your wallet.`}
                </p>
              )}
              {b.kind !== "home" && b.level < 3 && (
                <button
                  className={`${button} mt-2 w-full bg-white/60`}
                  disabled={
                    s.coins < upgrade.coins || s.townHallLevel < b.level + 2
                  }
                  onClick={() => s.upgradeCity(b.id)}
                >
                  Upgrade · {upgrade.coins} coins · Hall {b.level + 2}
                </button>
              )}
            </article>
          );
        })}
      </div>
      <p className="mt-3 text-xs">
        Ledger: {city.delivered} crates delivered · {city.earned} income ·{" "}
        {city.spent} spent on construction, carts and factory operation.
        Supplies cost 3 coins each. Switch on automatic supplies to have the
        donkey cart buy and carry them from the depot on each return trip. Your
        logs are never charged. Factory stock is finite; production stops when
        supplies run out or storage fills.
      </p>
    </section>
  );
}
