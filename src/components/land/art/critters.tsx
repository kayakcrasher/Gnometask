export function Chicken({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} className="gnome-idle">
      <ellipse cx="0" cy="16" rx="12" ry="4" fill="#3e2e20" opacity="0.22" />
      <ellipse cx="0" cy="6" rx="11" ry="8" fill="#f2e8d5" />
      <ellipse cx="8" cy="2" rx="6" ry="5" fill="#f2e8d5" />
      <path d="M13 2 L18 0 L13 5 Z" fill="#d6a84c" />
      <circle cx="10" cy="1" r="1.2" fill="#2a241c" />
      <path d="M-8 4 C-14 -4 -4 -8 2 -2" fill="#a8433b" />
      <rect x="-3" y="12" width="2.5" height="6" fill="#d6a84c" />
      <rect x="2" y="12" width="2.5" height="6" fill="#d6a84c" />
    </g>
  );
}

export function GuardGnome({ x, y, scale = 1, level = 1 }: { x: number; y: number; scale?: number; level?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="36" rx="14" ry="5" fill="#3e2e20" opacity="0.25" />
      <path d="M-12 34 C -14 12 -6 6 0 6 C 6 6 14 12 12 34 Z" fill="#35543f" />
      <rect x="-10" y="18" width="20" height="6" fill="#8a7a68" />
      <circle cx="0" cy="2" r="8" fill="#e8b98c" />
      <path d="M-10 -4 C -8 -18 8 -18 10 -4 Z" fill="#5b4230" />
      <circle cx="0" cy="-16" r="3" fill="#d6a84c" />
      <circle cx="-3" cy="2" r="1.3" fill="#2a241c" />
      <circle cx="3" cy="2" r="1.3" fill="#2a241c" />
      <rect x="12" y="-8" width="3" height="28" fill="#c4a574" />
      <polygon points="10,-8 22,-8 16,-18" fill="#8a7a68" />
      {level >= 3 ? <circle cx="8" cy="16" r="3" fill="#d6a84c" /> : null}
    </g>
  );
}
