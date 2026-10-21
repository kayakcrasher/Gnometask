import {oceanIslands} from "@/lib/game/ocean-world";
import { SUNSTEP_DOCK } from "@/lib/game/data/sunstep-dock";
import {
  FRONTIER_LAKES,
  FRONTIER_PEAKS,
  FRONTIER_SETTLEMENTS,
  FRONTIER_SIGHTS,
} from "@/lib/game/data/frontier";
const groves = [
  { x: 650, y: -1980, rx: 350, ry: 330 },
  { x: 3050, y: -2700, rx: 300, ry: 300 },
];
/** Shared northern geography for the atlas, deeds, minimap and low-power renderer. */
export function FrontierMap({ labels = false }: { labels?: boolean }) {
  return (
    <g pointerEvents="none">
     {oceanIslands().map(i=><g key={i.id}><polygon points={i.shore.map(p=>p.join(',')).join(' ')} fill="#dfd0a3"/><polygon points={i.grass.map(p=>p.join(',')).join(' ')} fill="#7c9f6c"/><circle cx={i.water.x} cy={i.water.y} r={32} fill={i.town?'#e5c57f':'#c5c2a1'}/>{labels&&<text x={i.x} y={i.y-i.ry-100} textAnchor="middle" fontSize={125} fill="#f5e5bf">{i.name}</text>}</g>)}

      <circle cx={2020} cy={-3140} r={36} fill="#efd59b" stroke="#335d57" strokeWidth={10}/>
      {labels&&<text x={2110} y={-3330} fontSize={105} fill="#fff0cd" paintOrder="stroke" stroke="#47624c" strokeWidth={10}>Thimblehaven · Port frontier</text>}
      <circle cx={SUNSTEP_DOCK.x} cy={SUNSTEP_DOCK.y} r={30} fill="#80b9bd" stroke="#e8d8a8" strokeWidth={8}/>
      {groves.map((g) => (
        <g key={g.x}>
          <ellipse
            cx={g.x}
            cy={g.y}
            rx={g.rx}
            ry={g.ry}
            fill="#547757"
            opacity={0.55}
          />
          {Array.from({ length: 24 }, (_, i) => {
            const a = i * 2.4,
              r = Math.sqrt((i + 0.5) / 24) * 0.82,
              x = g.x + Math.cos(a) * g.rx * r,
              y = g.y + Math.sin(a) * g.ry * r;
            return (
              <path
                key={i}
                d={`M${x - 28} ${y + 25}L${x} ${y - 35}L${x + 28} ${y + 25}Z`}
                fill={i % 2 ? "#3f674e" : "#6d8c5c"}
              />
            );
          })}
        </g>
      ))}
      {FRONTIER_PEAKS.map((p, i) => (
        <g key={i}>
          <path
            d={`M${p.x - p.r * 0.66} ${p.y + p.r * 0.33} L${p.x} ${p.y - p.r * 0.6} L${p.x + p.r * 0.66} ${p.y + p.r * 0.33}Z`}
            fill="#838875"
          />
          <path
            d={`M${p.x - p.r * 0.22} ${p.y - p.r * 0.28} L${p.x} ${p.y - p.r * 0.6} L${p.x + p.r * 0.22} ${p.y - p.r * 0.28} L${p.x + p.r * 0.07} ${p.y - p.r * 0.36} L${p.x - p.r * 0.04} ${p.y - p.r * 0.25}Z`}
            fill="#e7e4cd"
          />
        </g>
      ))}
      {FRONTIER_LAKES.map((l) => (
        <g key={l.id}>
          <ellipse
            cx={l.x}
            cy={l.y}
            rx={l.rx}
            ry={l.ry}
            fill="#83b7be"
            stroke="#d4d8ac"
            strokeWidth={12}
          />
          {labels && (
            <text
              x={l.x}
              y={l.y + 24}
              textAnchor="middle"
              fill="#244b53"
              fontSize={110}
            >
              {l.name}
            </text>
          )}
        </g>
      ))}
      {FRONTIER_SETTLEMENTS.map((d) => (
        <g key={d.id}>
          <circle
            cx={d.x}
            cy={d.y}
            r={36}
            fill="#e7cd87"
            stroke="#274f42"
            strokeWidth={10}
          />
          {labels && (
            <text
              x={d.x}
              y={d.y - 110}
              textAnchor="middle"
              fill="#f7edd4"
              fontSize={150}
              fontWeight="bold"
              paintOrder="stroke"
              stroke="#34533e"
              strokeWidth={12}
            >
              {d.name}
            </text>
          )}
        </g>
      ))}
      {labels &&
        FRONTIER_SIGHTS.map((s) => (
          <g key={s.id}>
            <circle cx={s.x} cy={s.y} r={16} fill="#f5e7c9" />
            <text
              x={s.x}
              y={s.y + 65}
              textAnchor="middle"
              fill="#f5e7c9"
              fontSize={95}
              paintOrder="stroke"
              stroke="#34533e"
              strokeWidth={9}
            >
              {s.name}
            </text>
          </g>
        ))}
    </g>
  );
}
