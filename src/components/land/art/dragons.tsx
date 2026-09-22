import type { DragonHorn, DragonLook } from "@/lib/game/types";

const LOOK: Record<DragonLook, { body: string; wing: string; trim: string }> = {
  ember: { body: "#8a3a32", wing: "#6b2e2a", trim: "#d6a84c" },
  moss: { body: "#35543f", wing: "#24402f", trim: "#8cb067" },
  night: { body: "#1d2a22", wing: "#2f3d34", trim: "#9ec3b8" },
  gold: { body: "#c4963d", wing: "#8a6a28", trim: "#f2e8d5" },
};

export function Dragon({
  x,
  y,
  scale = 1,
  friend = false,
  look = "ember",
  horn = "long",
  fat = false,
}: {
  x: number;
  y: number;
  scale?: number;
  friend?: boolean;
  look?: DragonLook;
  horn?: DragonHorn;
  fat?: boolean;
}) {
  const pal = LOOK[look];
  const body = friend ? pal.trim : pal.body;
  const wing = pal.wing;
  const fatS = fat ? 1.35 : 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale * fatS})`} className="grow-in">
      <ellipse cx="8" cy="42" rx={fat ? 36 : 28} ry="8" fill="#3e2e20" opacity="0.25" />
      <path
        d={fat ? "M-18 14 C -48 8 -24 -22 8 -4 C 36 -18 58 8 40 22 C 52 36 22 48 -8 38 Z" : "M-10 10 C -40 -10 -20 -28 8 -8 C 28 -22 48 -4 36 16 C 44 28 20 40 -6 32 Z"}
        fill={body}
      />
      <path d="M8 -6 C 4 -32 28 -36 24 -8" fill={wing} />
      <path d="M18 0 C 22 -24 44 -20 34 8" fill={wing} />
      <ellipse cx="30" cy="10" rx="12" ry="10" fill={body} />
      <circle cx="36" cy="8" r="2.2" fill="#2a241c" />
      <path d="M40 10 C 48 8 50 14 42 14" fill={pal.trim} />
      {horn === "short" ? <path d="M26 -2 L 24 -10 L 30 0" fill={pal.trim} /> : null}
      {horn === "long" ? <path d="M24 -4 C 18 -22 32 -24 30 -2" fill={pal.trim} /> : null}
      {horn === "crown" ? (
        <g>
          <path d="M22 -2 L20 -14 L26 -4" fill={pal.trim} />
          <path d="M28 -4 L30 -16 L34 -4" fill={pal.trim} />
          <path d="M34 -2 L38 -12 L40 0" fill={pal.trim} />
        </g>
      ) : null}
      <path d="M-8 28 C -18 40 -4 44 4 34" fill={body} />
      <circle cx="12" cy="8" r="3" fill={pal.trim} opacity="0.85" />
      {friend ? <circle cx="24" cy="-12" r="5" fill="#c24f45" /> : null}
    </g>
  );
}

export function AbsenceDragon({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} className="grow-in">
      <ellipse cx="10" cy="48" rx="42" ry="12" fill="#3e2e20" opacity="0.25" />
      <ellipse cx="4" cy="18" rx="38" ry="24" fill="#4e7370" />
      <ellipse cx="4" cy="22" rx="28" ry="16" fill="#6a8f8a" />
      <ellipse cx="28" cy="10" rx="16" ry="13" fill="#4e7370" />
      <circle cx="34" cy="8" r="2.4" fill="#2a241c" />
      <path d="M40 12 C 50 10 52 18 42 18" fill="#9ec3b8" />
      <path d="M-8 4 C -18 -16 8 -20 6 6" fill="#35543f" />
      <path d="M10 6 C 8 -14 30 -12 24 10" fill="#35543f" />
      <circle cx="0" cy="16" r="4" fill="#9ec3b8" opacity="0.7" />
      <circle cx="16" cy="20" r="3" fill="#9ec3b8" opacity="0.5" />
    </g>
  );
}

export function FlameBurst({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} pointerEvents="none" className="water-ripple">
      <path d="M-6 10 C -10 -8 0 -18 4 8 C -2 4 -4 12 -6 10 Z" fill="#a8433b" />
      <path d="M0 10 C -2 -4 6 -10 8 10 Z" fill="#d6a84c" />
    </g>
  );
}
