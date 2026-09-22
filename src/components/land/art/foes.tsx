import type { EnemyId, PackEnemy } from "@/lib/game/combat";
import { AbsenceDragon, Dragon } from "./dragons";

export function Boar({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="22" rx="22" ry="7" fill="#3e2e20" opacity="0.2" />
      <ellipse cx="0" cy="6" rx="22" ry="14" fill="#5b4230" />
      <ellipse cx="20" cy="2" rx="10" ry="8" fill="#6b5340" />
      <circle cx="24" cy="0" r="2" fill="#2a241c" />
      <path d="M26 6 C 32 8 30 12 26 10" stroke="#f2e8d5" strokeWidth="2" fill="none" />
      <rect x="-6" y="16" width="5" height="10" fill="#3e2e20" />
      <rect x="8" y="16" width="5" height="10" fill="#3e2e20" />
    </g>
  );
}

export function Sprite({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="8" rx="16" ry="12" fill="#5c7a54" />
      <circle cx="0" cy="-6" r="8" fill="#6f8f66" />
      <circle cx="-3" cy="-7" r="1.6" fill="#2a241c" />
      <circle cx="3" cy="-7" r="1.6" fill="#2a241c" />
      <path d="M-18 0 C -28 -16 -4 -18 0 -4" fill="#cfe4c8" opacity="0.8" />
      <path d="M18 0 C 28 -16 4 -18 0 -4" fill="#cfe4c8" opacity="0.8" />
    </g>
  );
}

export function Wyrmling({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M-24 16 C -10 0 8 24 28 4 C 16 28 -8 32 -24 16 Z" fill="#35543f" />
      <ellipse cx="24" cy="2" rx="10" ry="8" fill="#4c6b47" />
      <circle cx="28" cy="0" r="2" fill="#d6a84c" />
      <path d="M8 -8 C 4 -22 22 -20 18 -4" fill="#24402f" />
    </g>
  );
}

export function Bat({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M-22 4 C -16 -10 -4 -2 0 4 C 4 -2 16 -10 22 4 C 10 0 4 10 0 8 C -4 10 -10 0 -22 4 Z" fill="#3e2e20" />
      <ellipse cx="0" cy="6" rx="6" ry="5" fill="#5b4230" />
      <circle cx="-2" cy="5" r="1.2" fill="#d6a84c" />
      <circle cx="2" cy="5" r="1.2" fill="#d6a84c" />
    </g>
  );
}

export function Cobble({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="18" rx="18" ry="6" fill="#3e2e20" opacity="0.2" />
      <path d="M-14 8 C -16 -6 2 -12 16 4 C 18 12 6 16 -8 14 Z" fill="#8a7a68" />
      <path d="M-6 0 C 0 -8 12 -2 10 6" fill="#c4a574" opacity="0.7" />
      <circle cx="4" cy="4" r="2" fill="#2a241c" />
      <circle cx="-4" cy="6" r="1.6" fill="#2a241c" />
    </g>
  );
}

export function Crab({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="14" rx="16" ry="5" fill="#3e2e20" opacity="0.2" />
      <ellipse cx="0" cy="4" rx="14" ry="8" fill="#a8433b" />
      <path d="M-14 0 C -24 -8 -22 8 -14 6" fill="none" stroke="#8a3a32" strokeWidth="3" />
      <path d="M14 0 C 24 -8 22 8 14 6" fill="none" stroke="#8a3a32" strokeWidth="3" />
      <circle cx="-5" cy="2" r="1.8" fill="#2a241c" />
      <circle cx="5" cy="2" r="1.8" fill="#2a241c" />
    </g>
  );
}

export function Goblin({ x, y, scale = 1, striking = false }: { x: number; y: number; scale?: number; striking?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} className={striking ? "gnome-strike" : "gnome-idle"}>
      <ellipse cx="0" cy="30" rx="16" ry="6" fill="#3e2e20" opacity="0.25" />
      <path d="M-12 26 C-14 8 -6 -2 0 -2 C6 -2 14 8 12 26 Z" fill="#4c7a3a" />
      <path d="M2 -2 C10 2 14 14 11 26 L0 26 Z" fill="#35543f" opacity="0.45" />
      <circle cx="0" cy="-4" r="10" fill="#6f8f40" />
      <ellipse cx="4" cy="-2" rx="5" ry="7" fill="#35543f" opacity="0.25" />
      <path d="M-10 -4 L-18 2 L-8 2 Z" fill="#5c7a54" />
      <path d="M10 -4 L18 2 L8 2 Z" fill="#5c7a54" />
      <circle cx="-3.5" cy="-5" r="2.2" fill="#d6a84c" />
      <circle cx="3.5" cy="-5" r="2.2" fill="#d6a84c" />
      <circle cx="-3.2" cy="-5.3" r="0.8" fill="#2a241c" />
      <circle cx="3.8" cy="-5.3" r="0.8" fill="#2a241c" />
      <ellipse cx="0" cy="-1" rx="3" ry="2.2" fill="#3e5a2a" />
      <path d="M-4 2 C-1 6 1 6 4 2" stroke="#2a241c" strokeWidth="1.2" fill="none" />
      <rect x="10" y="2" width="4" height="20" rx="1" fill="#8a7a68" />
      <polygon points="12,0 20,8 12,8" fill="#cfe4c8" />
    </g>
  );
}

export function DarkElf({ x, y, scale = 1, striking = false }: { x: number; y: number; scale?: number; striking?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} className={striking ? "gnome-strike" : "gnome-idle"}>
      <ellipse cx="0" cy="34" rx="12" ry="5" fill="#3e2e20" opacity="0.25" />
      <path d="M-8 32 C -10 10 -4 4 0 4 C 4 4 10 10 8 32 Z" fill="#1d2a22" />
      <circle cx="0" cy="0" r="7" fill="#2f3d34" />
      <path d="M-6 -2 L-12 -10 L-4 0" fill="#2f3d34" />
      <path d="M6 -2 L12 -10 L4 0" fill="#2f3d34" />
      <circle cx="-2" cy="-1" r="1.4" fill="#9ec3b8" />
      <circle cx="3" cy="-1" r="1.4" fill="#9ec3b8" />
      <rect x="10" y="-4" width="3" height="24" fill="#cfe4c8" />
    </g>
  );
}

export function Rat({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="14" rx="12" ry="4" fill="#3e2e20" opacity="0.2" />
      <ellipse cx="-2" cy="4" rx="12" ry="7" fill="#6b5340" />
      <ellipse cx="10" cy="2" rx="6" ry="5" fill="#5b4230" />
      <circle cx="12" cy="1" r="1.2" fill="#2a241c" />
      <path d="M8 -4 L6 -12 L10 -2" fill="#6b5340" />
      <path d="M12 -3 L14 -11 L13 -1" fill="#6b5340" />
      <path d="M-14 4 C -22 0 -20 10 -12 8" fill="none" stroke="#5b4230" strokeWidth="2" />
    </g>
  );
}

export function PackCreature({
  kind,
  x,
  y,
  striking = false,
}: {
  kind: PackEnemy | EnemyId;
  x: number;
  y: number;
  striking?: boolean;
}) {
  if (kind === "rat") return <Rat x={x} y={y} scale={1.15} />;
  if (kind === "boar") return <Boar x={x} y={y} scale={1.15} />;
  if (kind === "sprite") return <Sprite x={x} y={y} scale={1.2} />;
  if (kind === "wyrmling") return <Wyrmling x={x} y={y} scale={1.2} />;
  if (kind === "bat") return <Bat x={x} y={y} scale={1.35} />;
  if (kind === "cobble") return <Cobble x={x} y={y} scale={1.2} />;
  if (kind === "goblin") return <Goblin x={x} y={y} scale={1.25} striking={striking} />;
  if (kind === "darkelf") return <DarkElf x={x} y={y} scale={1.25} striking={striking} />;
  if (kind === "absence") return <AbsenceDragon x={x} y={y} scale={0.7} />;
  if (kind === "dragon") return <Dragon x={x} y={y} scale={0.7} />;
  return <Crab x={x} y={y} scale={1.25} />;
}
