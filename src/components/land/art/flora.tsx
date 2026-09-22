import { RowHouse, TownFountain } from "./buildings";

export function Tree({ x, y, scale = 1, dark = false }: { x: number; y: number; scale?: number; dark?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} className="grow-in">
      <ellipse cx="0" cy="38" rx="16" ry="6" fill="#3e2e20" opacity="0.2" />
      <rect x="-5" y="8" width="10" height="28" fill="#5b4230" />
      <circle cx="0" cy="-6" r="22" fill={dark ? "#35543f" : "#4c6b47"} />
      <circle cx="-14" cy="6" r="14" fill="#5c7a54" />
      <circle cx="14" cy="6" r="14" fill="#5c7a54" />
      <ellipse cx="-6" cy="-10" rx="8" ry="5" fill="#6f8f66" opacity="0.4" />
    </g>
  );
}

const PETALS = [
  [5, 0],
  [1.55, 4.76],
  [-4.05, 2.94],
  [-4.05, -2.94],
  [1.55, -4.76],
] as const;

export function Flower({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y})`} className="grow-in">
      <line x1="0" y1="0" x2="0" y2="16" stroke="#5c7a54" strokeWidth="2" />
      {PETALS.map(([px, py], i) => (
        <circle key={i} cx={px} cy={py} r="3.4" fill={color} />
      ))}
      <circle cx="0" cy="0" r="2.6" fill="#f2e8d5" />
    </g>
  );
}

export function FloraImg({
  src,
  x,
  y,
  w = 32,
  h = 44,
}: {
  src: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
}) {
  return (
    <g className="grow-in">
      <ellipse cx={x} cy={y + 4} rx={w * 0.28} ry={4} fill="#3e2e20" opacity="0.22" />
      <image href={src} x={x - w / 2} y={y - h} width={w} height={h} />
    </g>
  );
}

export function MushroomCluster({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} pointerEvents="none">
      {[
        [0, 0, 8, "#a8433b"],
        [16, 4, 6, "#c24f45"],
        [-14, 6, 5, "#8a3a32"],
        [8, 10, 4, "#a8433b"],
        [-6, 12, 4.5, "#c24f45"],
      ].map(([dx, dy, r, fill], i) => (
        <g key={i} transform={`translate(${dx} ${dy})`}>
          <rect x={-1.6} y={0} width="3.2" height={8 + (i % 3)} fill="#f2e8d5" />
          <ellipse cx="0" cy="0" rx={r as number} ry={(r as number) * 0.55} fill={fill as string} />
          <ellipse cx={-2} cy={-1} rx={(r as number) * 0.35} ry={2} fill="#f2e8d5" opacity="0.35" />
        </g>
      ))}
    </g>
  );
}

export function PlantById({ id, x, y }: { id: string; x: number; y: number }) {
  if (id === "garden-foxglove") return <FloraImg src="/flowers/foxglove.png" x={x} y={y} w={34} h={52} />;
  if (id === "garden-bluebell") return <FloraImg src="/flowers/bluebell.png" x={x} y={y} w={32} h={50} />;
  if (id === "garden-poppy") return <FloraImg src="/flowers/poppy.png" x={x} y={y} w={30} h={42} />;
  if (id === "garden-lavender") return <FloraImg src="/flowers/lavender.png" x={x} y={y} w={32} h={46} />;
  if (id === "garden-daisy") return <FloraImg src="/flowers/daisy.png" x={x} y={y} w={30} h={42} />;
  if (id === "garden-toadstool") return <FloraImg src="/flowers/toadstool.png" x={x} y={y} w={40} h={40} />;
  if (id === "garden-sunflower") {
    return (
      <g transform={`translate(${x} ${y})`} className="grow-in">
        <rect x="-3" y="-8" width="6" height="36" fill="#5c7a54" />
        <circle cx="0" cy="-18" r="14" fill="#d6a84c" />
        <circle cx="0" cy="-18" r="7" fill="#5b4230" />
      </g>
    );
  }
  if (id === "garden-tulips") {
    return (
      <g transform={`translate(${x} ${y})`} className="grow-in">
        {[-10, 0, 10].map((dx, i) => (
          <g key={i} transform={`translate(${dx} 0)`}>
            <line x1="0" y1="0" x2="0" y2="18" stroke="#5c7a54" strokeWidth="2" />
            <ellipse cx="0" cy="-4" rx="6" ry="10" fill={i === 1 ? "#a8433b" : "#c24f45"} />
          </g>
        ))}
      </g>
    );
  }
  if (id === "garden-berries") {
    return (
      <g transform={`translate(${x} ${y})`} className="grow-in">
        <ellipse cx="0" cy="4" rx="18" ry="12" fill="#4c6b47" />
        <circle cx="-6" cy="2" r="3.5" fill="#a8433b" />
        <circle cx="4" cy="0" r="3.5" fill="#a8433b" />
        <circle cx="8" cy="6" r="3" fill="#c24f45" />
      </g>
    );
  }
  if (id === "garden-veg") {
    return (
      <g transform={`translate(${x} ${y})`} className="grow-in">
        <ellipse cx="0" cy="10" rx="28" ry="12" fill="#6b5340" />
        <ellipse cx="-12" cy="6" rx="6" ry="8" fill="#5c7a54" />
        <ellipse cx="0" cy="4" rx="6" ry="9" fill="#6f8f66" />
        <ellipse cx="12" cy="6" rx="6" ry="8" fill="#5c7a54" />
      </g>
    );
  }
  if (id === "garden-tree") {
    return (
      <g transform={`translate(${x} ${y})`} className="grow-in">
        <rect x="-6" y="0" width="12" height="34" fill="#5b4230" />
        <circle cx="0" cy="-16" r="24" fill="#4c6b47" />
        <circle cx="-10" cy="-4" r="8" fill="#a8433b" />
        <circle cx="12" cy="-10" r="7" fill="#c24f45" />
      </g>
    );
  }
  if (id === "garden-mushrooms") {
    return <MushroomCluster x={x} y={y} />;
  }
  if (id === "garden-beehive") {
    return (
      <g transform={`translate(${x} ${y})`} className="grow-in">
        <ellipse cx="0" cy="18" rx="16" ry="6" fill="#3e2e20" opacity="0.2" />
        <rect x="-12" y="-8" width="24" height="26" rx="8" fill="#d6a84c" stroke="#5b4230" />
        <rect x="-8" y="2" width="16" height="3" fill="#5b4230" opacity="0.35" />
        <circle cx="0" cy="8" r="3" fill="#2a241c" />
      </g>
    );
  }
  if (id === "garden-scarecrow") {
    return (
      <g transform={`translate(${x} ${y})`} className="grow-in">
        <rect x="-2" y="0" width="4" height="32" fill="#5b4230" />
        <rect x="-18" y="8" width="36" height="6" fill="#c4a574" />
        <circle cx="0" cy="-6" r="10" fill="#e8dfc4" stroke="#5b4230" />
        <path d="M-10 -16 C-6 -28 6 -28 10 -16 Z" fill="#a8433b" />
      </g>
    );
  }
  if (id === "village-well") {
    return (
      <g transform={`translate(${x} ${y})`} className="grow-in">
        <ellipse cx="0" cy="16" rx="22" ry="8" fill="#8a7a68" />
        <ellipse cx="0" cy="12" rx="14" ry="5" fill="#4e7370" />
        <rect x="-18" y="-16" width="4" height="28" fill="#5b4230" />
        <rect x="14" y="-16" width="4" height="28" fill="#5b4230" />
        <rect x="-20" y="-20" width="40" height="6" fill="#c4a574" />
      </g>
    );
  }
  if (id === "village-stall") {
    return (
      <g transform={`translate(${x} ${y})`} className="grow-in">
        <rect x="-22" y="4" width="44" height="14" fill="#5b4230" />
        <polygon points="-26,4 0,-18 26,4" fill="#d6a84c" stroke="#5b4230" />
        <circle cx="-8" cy="8" r="4" fill="#a8433b" />
        <circle cx="6" cy="8" r="4" fill="#35543f" />
      </g>
    );
  }
  if (id === "village-lamp") {
    return (
      <g transform={`translate(${x} ${y})`} className="grow-in">
        <rect x="-2" y="-8" width="4" height="36" fill="#5b4230" />
        <circle cx="0" cy="-12" r="7" fill="#d6a84c" />
      </g>
    );
  }
  if (id === "village-cottage") {
    return <RowHouse x={x - 44} y={y - 58} roof="cream" sign="Home" />;
  }
  if (id === "village-bakery") {
    return <RowHouse x={x - 44} y={y - 58} roof="berry" sign="Oven" />;
  }
  if (id === "village-fountain") {
    return <TownFountain x={x} y={y} />;
  }
  if (id === "village-bench") {
    return (
      <g transform={`translate(${x} ${y})`} className="grow-in">
        <rect x="-22" y="8" width="44" height="7" rx="2" fill="#5b4230" />
        <rect x="-20" y="0" width="40" height="6" rx="2" fill="#c4a574" />
        <rect x="-18" y="15" width="5" height="10" fill="#5b4230" />
        <rect x="13" y="15" width="5" height="10" fill="#5b4230" />
      </g>
    );
  }
  if (id === "village-cart") {
    return (
      <g transform={`translate(${x} ${y})`} className="grow-in">
        <rect x="-20" y="0" width="36" height="16" rx="3" fill="#c4a574" />
        <circle cx="-12" cy="18" r="7" fill="#5b4230" />
        <circle cx="12" cy="18" r="7" fill="#5b4230" />
        <rect x="16" y="-8" width="4" height="22" fill="#5b4230" />
      </g>
    );
  }
  if (id === "village-notice") {
    return (
      <g transform={`translate(${x} ${y})`} className="grow-in">
        <rect x="-3" y="0" width="6" height="32" fill="#5b4230" />
        <rect x="-18" y="-16" width="36" height="28" rx="3" fill="#e6d8bc" stroke="#5b4230" strokeWidth="2" />
        <rect x="-12" y="-8" width="24" height="3" fill="#5b4230" opacity="0.35" />
        <rect x="-12" y="-2" width="18" height="3" fill="#5b4230" opacity="0.35" />
      </g>
    );
  }
  if (id === "village-birdhouse") {
    return (
      <g transform={`translate(${x} ${y})`} className="grow-in">
        <rect x="-2" y="-4" width="4" height="36" fill="#5b4230" />
        <rect x="-12" y="-20" width="24" height="18" fill="#c4a574" stroke="#5b4230" />
        <polygon points="-14,-20 0,-34 14,-20" fill="#35543f" />
        <circle cx="0" cy="-10" r="3.5" fill="#2a241c" />
      </g>
    );
  }
  return null;
}

export function VillageById({ id, x, y }: { id: string; x: number; y: number }) {
  return <PlantById id={id} x={x} y={y} />;
}
