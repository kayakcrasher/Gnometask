import { SEA_BOUNDS } from "@/lib/game/sailing";
import { createPortal } from "react-dom";
import { useEffect, useMemo } from "react";
import {
  WORLD_VIEW,
  WORLD_BOUNDS,
  FRONTIER_SETTLEMENTS,
  FRONTIER_SIGHTS,
} from "@/lib/game/data/frontier";
import {
  BEACH_POLY,
  DESERT_BEACH,
  DESERT_POLY,
  ISLAND_POLY,
} from "@/lib/game/world3";
import { VILLAGES } from "@/lib/game/data/country";
import { developedRoads } from "@/lib/game/land-planning";
import { FrontierMap } from "@/components/land/frontier-map";
import { useGame } from "@/lib/game/store";
const poly = (p: [number, number][]) => p.map((v) => v.join(",")).join(" ");
export function IslandAtlas({
  pos,
  walkTo,
  onClose,
}: {
  pos: { x: number; y: number };
  walkTo: (x: number, y: number) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [onClose]);
  const s = useGame(),
    roads = useMemo(
      () => [...developedRoads(s.roadWorks, s.estate), ...s.city.roads],
      [s.roadWorks, s.estate, s.city.roads],
    );
  const travel = (x: number, y: number) => {
    walkTo(x, y);
    onClose();
  };
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Island atlas"
      className="fixed inset-0 z-[85] flex flex-col gap-2 bg-[#183c47] p-3 text-parchment pb-[max(.75rem,env(safe-area-inset-bottom))]"
    >
      <header className="flex items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-xl font-bold">
            A bigger little world
          </h2>
          <p className="text-xs text-parchment/80">
            Mountains, meadows and room to grow
          </p>
        </div>
        <button
          autoFocus
          type="button"
          onClick={onClose}
          className="min-h-11 rounded-xl bg-parchment px-4 text-xs font-bold text-pine"
        >
          Close atlas
        </button>
      </header>
      <svg
        role="img"
        aria-label="Expanded island geography"
        viewBox={s.afloat?`${SEA_BOUNDS.minX} ${SEA_BOUNDS.minY} ${SEA_BOUNDS.maxX-SEA_BOUNDS.minX} ${SEA_BOUNDS.maxY-SEA_BOUNDS.minY}`:WORLD_VIEW}
        className="min-h-0 w-full flex-1 rounded-2xl bg-[#39697a]"
        onClick={(e) => {
          const p = e.currentTarget.createSVGPoint();
          p.x = e.clientX;
          p.y = e.clientY;
          const m = e.currentTarget.getScreenCTM();
          if (m) {
            const hit = p.matrixTransform(m.inverse());
            travel(hit.x, hit.y);
          }
        }}
      >
        <polygon points={poly(BEACH_POLY)} fill="#e5d3a1" />
        <polygon points={poly(DESERT_BEACH)} fill="#e5d3a1" />
        <polygon points={poly(DESERT_POLY)} fill="#d9af70" />
        <polygon points={poly(ISLAND_POLY)} fill="#74956a" />
        <FrontierMap labels />
        {roads.map((r) => (
          <polyline
            key={r.id}
            points={poly(r.points)}
            fill="none"
            stroke={r.surface === "dirt" ? "#bca77d" : "#edddbd"}
            strokeWidth={r.surface === "dirt" ? 9 : 18}
            strokeLinejoin="round"
          />
        ))}
        {VILLAGES.map((v) => (
          <g key={v.id}>
            <circle cx={v.x} cy={v.y} r={28} fill="#f1d997" />
            <text
              x={v.x}
              y={v.y + 115}
              textAnchor="middle"
              fontSize={130}
              fill="#fff0cd"
              paintOrder="stroke"
              stroke="#47624c"
              strokeWidth={10}
            >
              {v.name}
            </text>
          </g>
        ))}
        <circle
          cx={pos.x}
          cy={pos.y}
          r={46}
          fill="#fff6d6"
          stroke="#23493c"
          strokeWidth={16}
        />
        <text
          x={WORLD_BOUNDS.minX + 180}
          y={WORLD_BOUNDS.minY + 260}
          fontSize={90}
          fill="#e1e7d2"
        >
          N ↑
        </text>
      </svg>
      <p className="text-center text-[11px] text-parchment/85">
        Tap land to walk there. Paths go around lakes and bays.
      </p>
      <section
        aria-label="Northern destinations"
        className="max-h-[28dvh] shrink-0 overflow-y-auto rounded-xl bg-parchment p-3 text-ink"
      >
        <p className="mb-2 text-xs">
          Explore now. Fund roads in <strong>Deeds → Road crew</strong> to open
          settlement land. New families arrive when the economy is healthy.
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {FRONTIER_SETTLEMENTS.map((d) => {
            const open = s.roadWorks.completed.includes(d.road),
              families = s.civic.plots.filter(
                (p) => p.id.startsWith(`frontier-${d.id}-`) && p.stories > 0,
              ).length;
            return (
              <button
                type="button"
                key={d.id}
                aria-label={`Walk to ${d.name}`}
                onClick={() => travel(d.x, d.y)}
                className="min-h-11 rounded-xl bg-pine/10 px-3 py-2 text-left text-xs"
              >
                <strong>{d.name}</strong>
                <span className="block text-[10px]">
                  {open
                    ? `Road open · ${families} settled homes`
                    : "Open countryside · road not funded"}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {FRONTIER_SIGHTS.map((d) => (
            <button
              type="button"
              key={d.id}
              onClick={() => travel(d.x, d.y)}
              className="min-h-11 rounded-lg bg-parchment-dark px-3 text-[11px]"
            >
              {d.name}
            </button>
          ))}
        </div>
      </section>
    </div>,
    document.body,
  );
}
