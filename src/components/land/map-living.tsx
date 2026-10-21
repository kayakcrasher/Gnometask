import { PORT_SITES, NORTH_LANDING, shipmentPosition } from "@/lib/game/ports";
import { useGame } from "@/lib/game/store";
import { HOME_PALETTES, homeStyle } from "@/lib/game/home-design";
import { wagonPoint } from "@/lib/game/transport";
export function MapLiving({ pos }: { pos: { x: number; y: number } }) {
  const s = useGame();
  return (
    <>
      <g pointerEvents="none">
       {s.naval.wrecks.map(w=><g key={w.id} transform={`translate(${w.x} ${w.y}) rotate(15)`}><path d="M0 -48Q-28 -25 -28 30L28 30Q28 -25 0 -48Z" fill="#79715d" stroke="#584d40" strokeWidth={5}/><rect x={-10} y={-10} width={20} height={18} fill={w.looted?'#5c5948':'#dab263'}/>{s.naval.boarding===w.id&&<circle cy={15} r={8} fill="#d4a271"/>}</g>)}

       {s.naval.vessels.filter(v=>v.hp>0).map(v=><g key={v.id} transform={`translate(${v.x} ${v.y})`}><path d="M0 -50Q-28 -25 -28 30L28 30Q28 -25 0 -50Z" fill={v.side==='enemy'?'#734452':'#4d7e80'} stroke="#ddbf75" strokeWidth={5}/><rect x={0} y={-56} width={30} height={18} fill={v.side==='enemy'?'#bd665a':'#85c3ac'}/></g>)}

        {[
          { site: NORTH_LANDING, dock: { level: 1, style: "mint" } },
          ...s.ports.docks.map((d) => ({
            site: PORT_SITES.find((p) => p.id === d.site)!,
            dock: d,
          })),
        ].map(({ site: p, dock: d }) => (
          <g key={p.id}>
            <line
              x1={p.x}
              y1={p.y}
              x2={p.water.x}
              y2={p.water.y}
              stroke={
                d.style === "mint"
                  ? "#9cc3ac"
                  : d.style === "slate"
                    ? "#8b9c9d"
                    : "#b8976b"
              }
              strokeWidth={26}
            />
            <rect
              x={p.water.x - 20}
              y={p.water.y - 16}
              width={40}
              height={32 + d.level * 16}
              fill={
                d.style === "mint"
                  ? "#9cc3ac"
                  : d.style === "slate"
                    ? "#8b9c9d"
                    : "#b8976b"
              }
              stroke="#675942"
              strokeWidth={3}
            />
            {d.level >= 2 && (
              <rect
                x={p.x + 30}
                y={p.y - 25}
                width={36}
                height={40}
                fill="#d7c09b"
                stroke="#556f65"
                strokeWidth={4}
              />
            )}
          </g>
        ))}
        {s.ports.shipments.map((t) => {
          const p = shipmentPosition(t);
          return p ? (
            <g
              key={t.boat}
              transform={`translate(${p.x} ${p.y}) rotate(${(-p.heading * 180) / Math.PI})`}
            >
              <path
                d="M0 -30 Q-18 -18 -18 22L18 22Q18 -18 0 -30Z"
                fill="#e4d5af"
                stroke="#426c72"
                strokeWidth={4}
              />
              <rect x={-11} y={-2} width={22} height={19} fill="#ac8456" />
            </g>
          ) : null;
        })}

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
