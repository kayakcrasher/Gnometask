const ROOFS: Record<string, { front: string; side: string; wall: string }> = {
  gold: { front: "#d6a84c", side: "#c4963d", wall: "#e6d8bc" },
  berry: { front: "#a8433b", side: "#8a3a32", wall: "#e8dfc4" },
  pine: { front: "#35543f", side: "#24402f", wall: "#d4c4a4" },
  stone: { front: "#6b5340", side: "#3e2e20", wall: "#8a7a68" },
  moss: { front: "#5c7a54", side: "#35543f", wall: "#c4a574" },
  cream: { front: "#c4a574", side: "#8a7a68", wall: "#e8dfc4" },
};

export function RowHouse({
  x,
  y,
  roof = "cream",
  tall = false,
  sign,
}: {
  x: number;
  y: number;
  roof?: keyof typeof ROOFS;
  tall?: boolean;
  sign?: string;
}) {
  const c = ROOFS[roof] ?? ROOFS.cream!;
  const w = tall ? 100 : 88;
  const h = tall ? 78 : 54;
  const side = 18;
  return (
    <g transform={`translate(${x} ${y})`} className="grow-in">
      <ellipse cx={w / 2} cy={h + 14} rx={w * 0.55} ry="12" fill="#3e2e20" opacity="0.2" />
      <polygon
        points={`${w},${28} ${w + side},${16} ${w + side},${16 + h} ${w},${28 + h}`}
        fill={c.wall}
        stroke="#5b4230"
        strokeWidth="1.5"
      />
      <rect x="0" y="28" width={w} height={h} fill={c.wall} stroke="#5b4230" strokeWidth="2" />
      <polygon points={`${w},28 ${w + side},16 ${w * 0.55},-18 ${w * 0.4},-6`} fill={c.side} />
      <polygon
        points={`${-10},28 ${w * 0.48},${tall ? -28 : -18} ${w + 8},28`}
        fill={c.front}
        stroke="#5b4230"
        strokeWidth="2.1"
      />
      <rect x={w * 0.4} y={28 + h - 32} width="18" height="32" fill="#5b4230" />
      <circle cx={w * 0.4 + 13} cy={28 + h - 16} r="2" fill="#d6a84c" />
      <rect x="10" y="40" width="16" height="14" rx="2" fill="#cfe8c9" stroke="#5b4230" strokeWidth="1.4" />
      <rect x={w - 28} y="40" width="16" height="14" rx="2" fill="#cfe8c9" stroke="#5b4230" strokeWidth="1.4" />
      {sign ? (
        <g>
          <rect x={w * 0.28} y="8" width="38" height="12" rx="2" fill="#24402f" />
          <text
            x={w * 0.28 + 19}
            y="17"
            textAnchor="middle"
            fill="#f2e8d5"
            fontFamily="Nunito, sans-serif"
            fontSize="8"
            fontWeight="800"
          >
            {sign}
          </text>
        </g>
      ) : null}
    </g>
  );
}

export function TownHall({ x, y, level }: { x: number; y: number; level: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <RowHouse x={0} y={0} roof="pine" tall sign={`Hall ${level}`} />
      <rect x="44" y="-8" width="16" height="22" fill="#5b4230" />
      <polygon points="44,-8 52,-20 60,-8" fill="#d6a84c" stroke="#5b4230" />
      <circle cx="52" cy="4" r="7" fill="#e8dfc4" stroke="#5b4230" />
      <line x1="52" y1="4" x2="52" y2="-1" stroke="#2a241c" strokeWidth="1.4" />
      <line x1="52" y1="4" x2="56" y2="6" stroke="#a8433b" strokeWidth="1.2" />
    </g>
  );
}

export function Cottage({ x, y, upgrades }: { x: number; y: number; upgrades: string[] }) {
  const boxes = upgrades.includes("house-boxes");
  const lanterns = upgrades.includes("house-lanterns");
  const wreath = upgrades.includes("house-wreath");
  const shutters = upgrades.includes("house-shutters");
  const path = upgrades.includes("house-path");
  const fence = upgrades.includes("house-fence");
  const chimney = upgrades.includes("house-chimney");
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="48" cy="94" rx="56" ry="14" fill="#3e2e20" opacity="0.22" />
      {path ? <ellipse cx="40" cy="96" rx="36" ry="14" fill="#c4a574" opacity="0.9" /> : null}
      {fence ? (
        <g>
          {Array.from({ length: 9 }).map((_, i) => (
            <rect key={i} x={-18 + i * 14} y="78" width="4" height="18" fill="#5b4230" />
          ))}
          <rect x="-18" y="84" width="118" height="4" fill="#5b4230" />
        </g>
      ) : null}
      <polygon points="88,32 110,20 110,76 88,86" fill="#d4c4a4" stroke="#5b4230" strokeWidth="1.6" />
      <rect x="0" y="32" width="88" height="54" fill="#e8dfc4" stroke="#5b4230" strokeWidth="2.2" />
      <polygon points="88,32 110,20 64,-18 44,-6" fill="#8a3a32" />
      <polygon points="-10,32 44,-16 98,32" fill="#a8433b" stroke="#5b4230" strokeWidth="2.2" />
      <rect x="64" y="-8" width="14" height="28" fill="#5b4230" />
      <polygon points="78,-8 90,-16 90,12 78,20" fill="#3e2e20" />
      {chimney ? (
        <g>
          <ellipse cx="71" cy="-18" rx="7" ry="4" fill="#d9d3c6" opacity="0.8" className="water-ripple" />
          <ellipse cx="74" cy="-28" rx="6" ry="4" fill="#d9d3c6" opacity="0.5" />
        </g>
      ) : null}
      <rect x="36" y="52" width="16" height="34" fill="#5b4230" />
      <rect x="40" y="56" width="8" height="16" fill="#2a241c" opacity="0.35" />
      {wreath ? <circle cx="44" cy="66" r="6" fill="none" stroke="#5c7a54" strokeWidth="3" /> : null}
      <circle cx="48" cy="70" r="1.7" fill="#d6a84c" />
      <rect x="10" y="42" width="18" height="16" rx="2" fill="#cfe8c9" stroke="#5b4230" strokeWidth="1.6" />
      <rect x="60" y="42" width="18" height="16" rx="2" fill="#cfe8c9" stroke="#5b4230" strokeWidth="1.6" />
      {shutters ? (
        <g>
          <rect x="4" y="42" width="6" height="16" fill="#35543f" />
          <rect x="28" y="42" width="6" height="16" fill="#35543f" />
          <rect x="54" y="42" width="6" height="16" fill="#35543f" />
          <rect x="78" y="42" width="6" height="16" fill="#35543f" />
        </g>
      ) : null}
      {boxes ? (
        <g>
          <rect x="8" y="58" width="22" height="7" rx="2" fill="#5b4230" />
          <circle cx="14" cy="58" r="3" fill="#a8433b" />
          <circle cx="20" cy="56" r="3" fill="#d6a84c" />
          <circle cx="26" cy="58" r="3" fill="#5c7a54" />
          <rect x="58" y="58" width="22" height="7" rx="2" fill="#5b4230" />
          <circle cx="64" cy="58" r="3" fill="#d6a84c" />
          <circle cx="70" cy="56" r="3" fill="#a8433b" />
        </g>
      ) : null}
      {lanterns ? (
        <g>
          <rect x="-6" y="40" width="3" height="22" fill="#5b4230" />
          <circle cx="-4.5" cy="38" r="5" fill="#d6a84c" />
          <rect x="91" y="40" width="3" height="22" fill="#5b4230" />
          <circle cx="92.5" cy="38" r="5" fill="#d6a84c" />
        </g>
      ) : null}
    </g>
  );
}

export function ShopStall({ x, y }: { x: number; y: number }) {
  return <RowHouse x={x} y={y} roof="gold" sign="Hats" />;
}
export function ArmoryHall({ x, y }: { x: number; y: number }) {
  return <RowHouse x={x} y={y} roof="stone" sign="Steel" />;
}
export function BakeryShop({ x, y }: { x: number; y: number }) {
  return <RowHouse x={x} y={y} roof="berry" sign="Pies" />;
}
export function GeneralYard({ x, y }: { x: number; y: number }) {
  return <RowHouse x={x} y={y} roof="moss" sign="Yard" />;
}

export function TownFountain({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="18" rx="32" ry="12" fill="#8a7a68" />
      <ellipse cx="0" cy="12" rx="22" ry="8" fill="#6a8f8a" className="water-ripple" />
      <rect x="-5" y="-10" width="10" height="22" fill="#8a7a68" />
      <circle cx="0" cy="-14" r="6" fill="#6a8f8a" />
    </g>
  );
}

export function PalisadeRing({ x, y, level }: { x: number; y: number; level: number }) {
  if (level < 1) return null;
  const r = 210 + level * 12;
  const posts = 18 + level * 4;
  return (
    <g transform={`translate(${x} ${y})`} pointerEvents="none" opacity={0.85}>
      {Array.from({ length: posts }).map((_, i) => {
        const a = (i / posts) * Math.PI * 1.15 + 0.4;
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * r * 0.42;
        const h = level >= 2 ? 22 : 16;
        return <rect key={i} x={px - 3} y={py - h} width="6" height={h} fill="#5b4230" />;
      })}
    </g>
  );
}

export function HavenHut({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="20" cy="48" rx="28" ry="10" fill="#3e2e20" opacity="0.2" />
      <rect x="0" y="16" width="40" height="28" fill="#c4a574" stroke="#5b4230" strokeWidth="2" />
      <polygon points="-6,16 20,-10 46,16" fill="#35543f" stroke="#5b4230" strokeWidth="2" />
      <rect x="14" y="28" width="12" height="16" fill="#5b4230" />
    </g>
  );
}

export function Scorch({ x, y, amount }: { x: number; y: number; amount: number }) {
  if (amount <= 0.02) return null;
  return (
    <g transform={`translate(${x} ${y})`} opacity={Math.min(0.7, amount)} pointerEvents="none">
      <ellipse cx="0" cy="8" rx={28 + amount * 20} ry={12 + amount * 8} fill="#3e2e20" />
      <path d="M-16 0 C-8 -10 0 4 8 -8 C12 2 20 -4 18 8" fill="#5b4230" opacity="0.7" />
    </g>
  );
}
