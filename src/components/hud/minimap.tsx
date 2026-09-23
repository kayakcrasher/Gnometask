import { type MouseEvent as ReactMouseEvent } from "react";
import { ISLAND_POLY, BEACH_POLY } from "@/lib/game/world3";
import { PLACE_ANCHORS } from "@/lib/game/data/layout";
import { NPCS } from "@/lib/game/world";
import { WORLD_PACK } from "@/lib/game/catalog";
import { FAR_ISLES } from "@/lib/game/data/trade";
import { useGame } from "@/lib/game/store";
import type { NpcPose } from "@/hooks/use-npc-wander";

const VW = 2800;
const VH = 1480;

function poly(pts: [number, number][]) {
  return pts.map(([x, y]) => `${x},${y}`).join(" ");
}

export function Minimap({
  pos,
  facingYaw,
  walkTo,
  npcPoses,
  compassRef,
}: {
  pos: { x: number; y: number };
  facingYaw: number;
  walkTo: (x: number, y: number) => void;
  npcPoses: Record<string, NpcPose>;
  compassRef: { current: HTMLDivElement | null };
}) {
  const travel = useGame((s) => s.travelIsle);
  const cleared = useGame((s) => s.clearedPack);
  const dragon = useGame((s) => s.lifeDragon);
  const hall = useGame((s) => s.townHallLevel);
  const landing = useGame((s) => s.landing);
  const onClick = (e: ReactMouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const r = svg.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * VW;
    const y = ((e.clientY - r.top) / r.height) * VH;
    walkTo(x, y);
  };
  return (
    <div className="pointer-events-auto absolute right-3 top-[5.5rem] z-20 flex flex-col items-center gap-1 md:right-4 md:top-24">
      <div className="relative size-11 overflow-hidden rounded-full bg-parchment shadow-panel">
        <div
          ref={(el) => {
            compassRef.current = el;
          }}
          className="absolute inset-0"
          style={{ transformOrigin: "50% 50%" }}
        >
          <span className="absolute left-1/2 top-0.5 -translate-x-1/2 font-display text-[10px] font-bold leading-none text-berry">
            N
          </span>
        </div>
      </div>
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        className="h-20 w-20 cursor-pointer rounded-full bg-water-deep shadow-panel ring-2 ring-parchment md:h-28 md:w-28"
        onClick={onClick}
        aria-label="Island map. Click to walk."
      >
        <polygon points={poly(BEACH_POLY)} fill="#eaddb0" />
        <polygon points={poly(ISLAND_POLY)} fill="#6f8f66" />
        {Object.entries(PLACE_ANCHORS).map(([id, a]) => (
          <circle key={id} cx={a.x} cy={a.y} r={id === "shop" || id === "cottage" ? 28 : 18} fill="#d6a84c" opacity={0.9} />
        ))}
        {NPCS.map((n) => {
          const x = npcPoses[n.id]?.x ?? n.x;
          const y = npcPoses[n.id]?.y ?? n.y;
          return <circle key={n.id} cx={x} cy={y} r={12} fill="#f2e8d5" />;
        })}
        {WORLD_PACK.filter((p) => !cleared.includes(p.id)).map((p) => (
          <circle key={p.id} cx={p.x} cy={p.y} r={14} fill="#a8433b" />
        ))}
        {landing?.goblins.filter((g) => g.alive).map((g) => (
          <circle key={g.id} cx={g.x} cy={g.y} r={12} fill="#4c7a3a" />
        ))}
        {hall >= 3 && dragon.state !== "defeated" ? <circle cx={1760} cy={340} r={22} fill="#8a3a32" /> : null}
        {FAR_ISLES.map((isle) => (
          <circle
            key={isle.id}
            cx={isle.x}
            cy={isle.y}
            r={36}
            fill="#d6a84c"
            stroke="#24402f"
            strokeWidth={6}
            onClick={(e) => {
              e.stopPropagation();
              travel(isle.id);
            }}
          />
        ))}
        <g transform={`translate(${pos.x} ${pos.y}) rotate(${(facingYaw * 180) / Math.PI})`}>
          <polygon points="0,-34 22,28 -22,28" fill="#24402f" stroke="#f2e8d5" strokeWidth="6" />
        </g>
      </svg>
      <p className="hidden rounded-full bg-parchment/90 px-2 py-0.5 font-display text-[10px] font-semibold text-ink md:block">
        Walk
      </p>
    </div>
  );
}
