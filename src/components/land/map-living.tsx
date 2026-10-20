import { useGame } from "@/lib/game/store";
import { HOME_PALETTES, homeStyle } from "@/lib/game/home-design";
import { wagonPoint } from "@/lib/game/transport";
export function MapLiving({ pos }: { pos: { x: number; y: number } }) {
  const s = useGame();
  return (
    <>
      <g pointerEvents="none">
        {s.civic.plots
          .filter((p) => p.stories > 0)
          .map((p) => {
            const c = HOME_PALETTES[homeStyle(p.id, p.town)],
              h = 20 + p.stories * 12;
            return (
              <g key={p.id} transform={`translate(${p.x} ${p.y})`}>
                <rect
                  x={-18}
                  y={-h}
                  width={36}
                  height={h}
                  fill={c.wall}
                  stroke={c.trim}
                  strokeWidth={2}
                />
                {p.town === "sunstep" ? (
                  <rect
                    x={-21}
                    y={-h - 4}
                    width={42}
                    height={7}
                    fill={c.roof}
                  />
                ) : (
                  <path d={`M-23 ${-h}L0 ${-h - 16}L23 ${-h}Z`} fill={c.roof} />
                )}
                <rect x={-11} y={-15} width={10} height={15} fill={c.trim} />
                {Array.from({ length: p.stories }, (_, i) => (
                  <rect
                    key={i}
                    x={6}
                    y={-14 - i * 12}
                    width={7}
                    height={7}
                    fill="#a7cecf"
                  />
                ))}
              </g>
            );
          })}
      </g>
      {s.transport.wagons.map((w) => {
        const p = wagonPoint(w, s.roadWorks.completed);
        if (!p) return null;
        const near = Math.hypot(p.x - pos.x, p.y - pos.y) <= 150;
        return (
          <g
            key={w.id}
            transform={`translate(${p.x} ${p.y}) rotate(${(p.yaw * 180) / Math.PI})`}
            role="button"
            tabIndex={near ? 0 : -1}
            aria-label={`Hail map ${w.id}`}
            onClick={(e) => {
              e.stopPropagation();
              s.setGnomePos(pos.x, pos.y);
              s.hailWagon(w.id);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && near) s.hailWagon(w.id);
            }}
          >
            <rect
              x={-13}
              y={-20}
              width={26}
              height={38}
              rx={10}
              fill="#e8dfbf"
              stroke="#9d8660"
              strokeWidth={3}
            />
            <path d="M-13 -10H13 M-13 3H13" stroke="#9d8660" strokeWidth={2} />
            {[-1, 1].map((side) => (
              <rect
                key={side}
                x={side < 0 ? -19 : 13}
                y={-12}
                width={6}
                height={25}
                rx={3}
                fill="#6b5340"
              />
            ))}
            <ellipse cx={0} cy={34} rx={7} ry={14} fill="#998469" />
            <path d="M-3 46V54 M3 46V54" stroke="#6b5340" strokeWidth={3} />
          </g>
        );
      })}
    </>
  );
}
