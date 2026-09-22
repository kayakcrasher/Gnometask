import type { Splat } from "@/lib/game/combat";

export function HitsplatMark({ x, y, splat }: { x: number; y: number; splat: Splat }) {
  const miss = splat === "miss";
  const heal = splat === "heal";
  const n = typeof splat === "number" ? splat : 0;
  const fill = miss ? "#8a7a68" : heal ? "#5c7a54" : "#a8433b";
  const label = miss ? "0" : heal ? "+" : String(n);
  return (
    <g className="hitsplat" transform={`translate(${x} ${y})`}>
      <circle r="13" fill={fill} stroke="#f2e8d5" strokeWidth="2.2" />
      <text
        textAnchor="middle"
        y="4"
        fill="#f2e8d5"
        fontFamily="Nunito, sans-serif"
        fontSize="12"
        fontWeight="800"
      >
        {label}
      </text>
    </g>
  );
}

export function TinyHp({ x, y, value, max, berry }: { x: number; y: number; value: number; max: number; berry?: boolean }) {
  const w = 38;
  const pct = Math.max(0, Math.min(1, value / Math.max(1, max)));
  return (
    <g transform={`translate(${x - w / 2} ${y})`} pointerEvents="none">
      <rect width={w} height="5" rx="1.5" fill="#2a241c" opacity="0.55" />
      <rect width={w * pct} height="5" rx="1.5" fill={berry ? "#a8433b" : "#5c7a54"} />
    </g>
  );
}
