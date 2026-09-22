import { useRef, type ReactNode } from "react";

export function MapHotspot({
  x,
  y,
  rx = 52,
  ry = 32,
  selected,
  label,
  children,
  onActivate,
  onHover,
}: {
  x: number;
  y: number;
  rx?: number;
  ry?: number;
  selected?: boolean;
  label: string;
  children?: ReactNode;
  onActivate: () => void;
  onHover: (label: string, clientX: number, clientY: number) => void;
}) {
  const last = useRef(0);
  const activate = (e: { button?: number; stopPropagation: () => void }) => {
    if (e.button && e.button !== 0) return;
    e.stopPropagation();
    const now = performance.now();
    if (now - last.current < 180) return;
    last.current = now;
    onActivate();
  };
  return (
    <g
      className="cursor-pointer"
      onPointerDown={activate}
      onMouseDown={activate}
      onClick={activate}
      onPointerEnter={(e) => onHover(label, e.clientX, e.clientY)}
      onPointerMove={(e) => onHover(label, e.clientX, e.clientY)}
      onPointerLeave={() => onHover("", 0, 0)}
    >
      <g pointerEvents="none">{children}</g>
      {selected ? (
        <ellipse
          cx={x}
          cy={y}
          rx={rx + 8}
          ry={ry + 6}
          fill="none"
          stroke="#d6a84c"
          strokeWidth={3}
          strokeDasharray="8 5"
          className="pulse-slot"
          pointerEvents="none"
        />
      ) : null}
      <ellipse className="hotspot-hit" cx={x} cy={y} rx={rx} ry={ry} />
    </g>
  );
}
