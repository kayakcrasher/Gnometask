import { useRef } from "react";
import { clientToWorld, usePanZoom, VB } from "@/hooks/use-pan-zoom";
import { nearestPlace, onIsland } from "@/lib/game/world3";
import { useGame } from "@/lib/game/store";
import { havenLevel } from "@/lib/game/world";
import { BUILDING_MAX } from "@/lib/game/types";
import { localDate } from "@/lib/utils";
import type { GamePopup, InteriorId } from "@/lib/game/types";
import type { NpcPose } from "@/hooks/use-npc-wander";
import type { GnomeFacing } from "./gnome";
import { MapSky, MapScenery } from "./map-scenery";
import { MapPlaces } from "./map-places";
import { MapFights } from "./map-fights";
import { MapPlots } from "./map-plots";
import { MapPlayer } from "./map-player";
import { dist } from "./map-data";

type WalkTo = (x: number, y: number, arrive?: () => void) => void;

export function Island2d({
  pos,
  facing,
  walking,
  marker,
  walkTo,
  npcPoses,
}: {
  pos: { x: number; y: number };
  facing: GnomeFacing;
  walking: boolean;
  marker: { x: number; y: number } | null;
  walkTo: WalkTo;
  npcPoses: Record<string, NpcPose>;
}) {
  const save = useGame();
  const svgRef = useRef<SVGSVGElement>(null);
  const followRef = useRef(pos);
  followRef.current = pos;
  const followOnRef = useRef(true);

  const { view, zoomBy, home } = usePanZoom(svgRef, followRef, followOnRef, (cx, cy, v) => {
    const svg = svgRef.current;
    if (!svg) return;
    const world = clientToWorld(svg, v, cx, cy);
    if (!onIsland(world.x, world.y)) return;
    save.closePopup();
    walkTo(world.x, world.y);
  });

  const villageCount = save.placed.filter((p) => p.slotId.startsWith("v")).length;
  const watered = save.tasks.some((t) => t.builtinKey === "water-garden" && t.done && t.doneOn === localDate());
  const hLevel = havenLevel(villageCount, save.daysPlayed, save.wildWins);
  const raiding = save.lifeDragon.state === "raiding";

  const interact = (worldX: number, worldY: number, popup: GamePopup, range = 70) => {
    if (save.combat && save.combat.phase !== "won" && save.combat.phase !== "lost") return;
    save.selectPlace(popup.place ?? nearestPlace(worldX, worldY));
    save.openPopup({ ...popup, x: worldX, y: worldY });
    if (dist(pos.x, pos.y, worldX, worldY) >= range) walkTo(worldX, worldY);
  };

  const goInside = (x: number, y: number, interior: InteriorId) => {
    if (save.combat && save.combat.phase !== "won" && save.combat.phase !== "lost") return;
    save.closePopup();
    const run = () => save.enterInterior(interior);
    if (dist(pos.x, pos.y, x, y) < 78) run();
    else walkTo(x, y, run);
  };

  const goFight = (x: number, y: number, start: () => void) => {
    if (dist(pos.x, pos.y, x, y) < 56) start();
    else walkTo(x, y, start);
  };

  const hoverTip = (_label: string, _x: number, _y: number) => {
    /* hover ring is enough */
  };

  return (
    <div className="absolute inset-0 bg-water-deep">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VB.w} ${VB.h}`}
        className="absolute inset-0 h-full w-full touch-none"
        role="img"
        aria-label="Gnome island. Click the land to walk."
      >
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#cfe4c8" />
            <stop offset="1" stopColor="#e7ddb4" />
          </linearGradient>
          <linearGradient id="islandRim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#eaddb0" />
            <stop offset="1" stopColor="#c4a574" />
          </linearGradient>
          <filter id="soft">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
          <MapSky />
          <MapScenery
            villageCount={villageCount}
            watered={watered}
            hLevel={hLevel}
            cottageHurt={Math.max(0, BUILDING_MAX.cottage - save.buildingHp.cottage)}
            villageHurt={Math.max(0, BUILDING_MAX.village - save.buildingHp.village)}
            havenHurt={Math.max(0, BUILDING_MAX.haven - save.buildingHp.haven)}
          />
          <MapPlots wildCount={6} />
          <MapPlaces npcPoses={npcPoses} hLevel={hLevel} hoverTip={hoverTip} goInside={goInside} interact={interact} />
          <MapFights raiding={raiding} hoverTip={hoverTip} goFight={goFight} interact={interact} />
          <MapPlayer pos={pos} facing={facing} walking={walking} marker={marker} />
        </g>
      </svg>
      <div className="pointer-events-none absolute bottom-4 right-3 z-20 flex flex-col gap-1 md:bottom-6 md:right-4">
        {[
          { label: "Zoom in", fn: () => zoomBy(1 / 1.18) },
          { label: "Zoom out", fn: () => zoomBy(1.18) },
          { label: "Find me", fn: () => home() },
        ].map((b) => (
          <button
            key={b.label}
            type="button"
            aria-label={b.label}
            onClick={b.fn}
            className="pointer-events-auto flex h-11 min-w-11 items-center justify-center rounded-[12px] bg-parchment px-3 font-display text-xs font-semibold text-ink shadow-panel"
          >
            {b.label}
          </button>
        ))}
      </div>
    </div>
  );
}
