export function Cave({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} pointerEvents="none">
      <path d="M-70 40 C -60 -30 60 -30 70 40 Z" fill="#3e2e20" />
      <path d="M-48 36 C -40 -8 40 -8 48 36 Z" fill="#1d2a22" />
    </g>
  );
}

export function MineMouth({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} pointerEvents="none">
      <path d="M-80 50 C -70 -20 70 -20 80 50 Z" fill="#5b4230" />
      <path d="M-52 46 C -44 4 44 4 52 46 Z" fill="#1d2a22" />
      <rect x="-86" y="44" width="16" height="8" fill="#6b5340" />
      <rect x="70" y="44" width="16" height="8" fill="#6b5340" />
    </g>
  );
}

export function Crystal({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} pointerEvents="none">
      <polygon points="0,-16 8,6 -8,6" fill="#6a8f8a" />
      <polygon points="-6,-4 2,10 -12,8" fill="#4e7370" />
      <polygon points="4,-2 12,8 0,8" fill="#9ec3b8" opacity="0.85" />
    </g>
  );
}

export function Pier({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} pointerEvents="none">
      <rect x="-10" y="-8" width="88" height="14" rx="2" fill="#8a7a68" />
      <rect x="-6" y="6" width="6" height="18" fill="#5b4230" />
      <rect x="20" y="6" width="6" height="18" fill="#5b4230" />
      <rect x="48" y="6" width="6" height="18" fill="#5b4230" />
      <rect x="70" y="6" width="6" height="16" fill="#5b4230" />
    </g>
  );
}

export function Raft({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} pointerEvents="none">
      <ellipse cx="18" cy="16" rx="30" ry="8" fill="#4e7370" opacity="0.4" />
      <rect x="-10" y="0" width="56" height="10" rx="2" fill="#6b5340" />
      <rect x="-8" y="-3" width="52" height="7" rx="1.5" fill="#8a7a68" />
      <rect x="14" y="-24" width="3" height="24" fill="#5b4230" />
      <path d="M17 -24 L17 -8 L36 -14 Z" fill="#e6d8bc" />
    </g>
  );
}

export function Rock({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} pointerEvents="none">
      <ellipse cx="0" cy="10" rx="18" ry="6" fill="#3e2e20" opacity="0.2" />
      <path d="M-16 8 C -20 -6 4 -14 18 2 C 20 10 8 14 -10 12 Z" fill="#6b5340" />
      <path d="M-8 0 C -2 -8 10 -4 12 4" fill="#8a7a68" opacity="0.55" />
    </g>
  );
}

export function Bones({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} pointerEvents="none" opacity="0.85">
      <rect x="-14" y="0" width="28" height="4" rx="2" fill="#e6d8bc" />
      <circle cx="-16" cy="2" r="4" fill="#f2e8d5" />
      <circle cx="16" cy="2" r="4" fill="#f2e8d5" />
      <rect x="-2" y="-8" width="4" height="12" rx="1" fill="#e6d8bc" />
    </g>
  );
}

export function Campfire({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} pointerEvents="none">
      <ellipse cx="0" cy="10" rx="16" ry="5" fill="#3e2e20" opacity="0.3" />
      <rect x="-12" y="4" width="8" height="4" rx="1" fill="#5b4230" transform="rotate(-18 -8 6)" />
      <rect x="4" y="4" width="8" height="4" rx="1" fill="#5b4230" transform="rotate(18 8 6)" />
      <path d="M-4 6 C -6 -8 0 -14 4 6 C 0 2 -2 8 -4 6 Z" fill="#a8433b" />
      <path d="M-1 6 C -2 -4 2 -8 3 6 Z" fill="#d6a84c" />
    </g>
  );
}

export function Ruin({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} pointerEvents="none">
      <rect x="-22" y="0" width="16" height="28" fill="#6b5340" />
      <rect x="-4" y="10" width="14" height="18" fill="#5b4230" />
      <rect x="12" y="-8" width="12" height="36" fill="#6b5340" />
      <rect x="-22" y="-6" width="18" height="8" fill="#8a7a68" />
    </g>
  );
}
