import { useCallback, useEffect, useRef, useState, type MutableRefObject, type RefObject } from "react";
import { clamp } from "@/lib/utils";
import { PLAYER_START } from "@/lib/game/types";

export type ViewTransform = { x: number; y: number; k: number };

export const MIN_K = 0.55;
export const MAX_K = 3.4;
export const HOME_K = 2.2;

export const VB = { w: 2800, h: 1480 };

export function viewFor(target: { x: number; y: number }, k: number): ViewTransform {
  return {
    k,
    x: VB.w / 2 - target.x * k,
    y: VB.h / 2 - target.y * k,
  };
}

export function clientToWorld(
  svg: SVGSVGElement,
  view: ViewTransform,
  clientX: number,
  clientY: number,
): { x: number; y: number } {
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const p = pt.matrixTransform(ctm.inverse());
  return { x: (p.x - view.x) / view.k, y: (p.y - view.y) / view.k };
}

export function usePanZoom(
  ref: RefObject<SVGSVGElement | null>,
  followRef: MutableRefObject<{ x: number; y: number }>,
  followOnRef: MutableRefObject<boolean>,
  onTap?: (clientX: number, clientY: number, view: ViewTransform) => void,
) {
  const [view, setView] = useState<ViewTransform>(() => viewFor(PLAYER_START, HOME_K));
  const viewRef = useRef(view);
  viewRef.current = view;
  const onTapRef = useRef(onTap);
  onTapRef.current = onTap;
  const drag = useRef<{
    id: number;
    x: number;
    y: number;
    moved: boolean;
    ox: number;
    oy: number;
    pointers: Map<number, { x: number; y: number }>;
    pinch?: { dist: number; k: number };
  } | null>(null);

  const apply = useCallback((next: ViewTransform) => {
    const k = clamp(next.k, MIN_K, MAX_K);
    const maxX = VB.w * 0.55 * k;
    const maxY = VB.h * 0.55 * k;
    const x = clamp(next.x, -maxX, maxX);
    const y = clamp(next.y, -maxY, maxY);
    setView({ x, y, k });
  }, []);

  const zoomAt = useCallback(
    (cx: number, cy: number, factor: number) => {
      const svg = ref.current;
      if (!svg) return;
      const v = viewRef.current;
      const nextK = clamp(v.k * factor, MIN_K, MAX_K);
      const rect = svg.getBoundingClientRect();
      const px = cx - rect.left - rect.width / 2;
      const py = cy - rect.top - rect.height / 2;
      const scale = nextK / v.k;
      apply({
        k: nextK,
        x: px - (px - v.x) * scale,
        y: py - (py - v.y) * scale,
      });
    },
    [apply, ref],
  );

  const zoomBy = useCallback(
    (factor: number) => {
      const svg = ref.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, factor);
    },
    [ref, zoomAt],
  );

  const home = useCallback(() => {
    followOnRef.current = true;
    apply(viewFor(followRef.current, HOME_K));
  }, [apply, followOnRef, followRef]);

  const fit = useCallback(() => {
    followOnRef.current = false;
    apply({ x: 0, y: 0, k: 0.62 });
  }, [apply, followOnRef]);

  const reset = home;

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = Math.exp(-e.deltaY * 0.0015);
      zoomAt(e.clientX, e.clientY, factor);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      const hit = e.target as Element | null;
      if (hit?.closest?.(".hotspot-hit, .cursor-pointer")) return;
      svg.setPointerCapture(e.pointerId);
      const v = viewRef.current;
      if (!drag.current) {
        drag.current = {
          id: e.pointerId,
          x: e.clientX,
          y: e.clientY,
          moved: false,
          ox: v.x,
          oy: v.y,
          pointers: new Map(),
        };
      }
      drag.current.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (drag.current.pointers.size === 2) {
        const pts = [...drag.current.pointers.values()];
        const dx = pts[0]!.x - pts[1]!.x;
        const dy = pts[0]!.y - pts[1]!.y;
        drag.current.pinch = { dist: Math.hypot(dx, dy), k: v.k };
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const d = drag.current;
      if (!d || !d.pointers.has(e.pointerId)) return;
      d.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (d.pointers.size === 2 && d.pinch) {
        const pts = [...d.pointers.values()];
        const dist = Math.hypot(pts[0]!.x - pts[1]!.x, pts[0]!.y - pts[1]!.y);
        const midX = (pts[0]!.x + pts[1]!.x) / 2;
        const midY = (pts[0]!.y + pts[1]!.y) / 2;
        const factor = dist / (d.pinch.dist || 1);
        const svgEl = ref.current;
        if (!svgEl) return;
        const nextK = clamp(d.pinch.k * factor, MIN_K, MAX_K);
        const rect = svgEl.getBoundingClientRect();
        const px = midX - rect.left - rect.width / 2;
        const py = midY - rect.top - rect.height / 2;
        const scale = nextK / viewRef.current.k;
        apply({
          k: nextK,
          x: px - (px - viewRef.current.x) * scale,
          y: py - (py - viewRef.current.y) * scale,
        });
        d.moved = true;
        followOnRef.current = false;
        return;
      }
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      if (!d.moved) {
        if (Math.hypot(dx, dy) <= 10) return;
        d.moved = true;
        followOnRef.current = false;
      }
      apply({ k: viewRef.current.k, x: d.ox + dx, y: d.oy + dy });
    };

    const onPointerUp = (e: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      const wasClick = !d.moved && d.pointers.size <= 1;
      const cx = e.clientX;
      const cy = e.clientY;
      d.pointers.delete(e.pointerId);
      if (d.pointers.size === 0) {
        (svg as SVGSVGElement & { __panMoved?: boolean }).__panMoved = d.moved;
        drag.current = null;
        if (wasClick) onTapRef.current?.(cx, cy, viewRef.current);
      } else if (d.pointers.size === 1) {
        const remaining = [...d.pointers.entries()][0]!;
        const v = viewRef.current;
        d.id = remaining[0];
        d.x = remaining[1].x;
        d.y = remaining[1].y;
        d.ox = v.x;
        d.oy = v.y;
        d.pinch = undefined;
      }
    };

    svg.addEventListener("wheel", onWheel, { passive: false });
    svg.addEventListener("pointerdown", onPointerDown);
    svg.addEventListener("pointermove", onPointerMove);
    svg.addEventListener("pointerup", onPointerUp);
    svg.addEventListener("pointercancel", onPointerUp);
    return () => {
      svg.removeEventListener("wheel", onWheel);
      svg.removeEventListener("pointerdown", onPointerDown);
      svg.removeEventListener("pointermove", onPointerMove);
      svg.removeEventListener("pointerup", onPointerUp);
      svg.removeEventListener("pointercancel", onPointerUp);
    };
  }, [apply, followOnRef, ref, zoomAt]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (followOnRef.current && !drag.current) {
        const v = viewRef.current;
        const target = viewFor(followRef.current, v.k);
        const a = 1 - Math.exp(-5.5 * dt);
        const nx = v.x + (target.x - v.x) * a;
        const ny = v.y + (target.y - v.y) * a;
        if (Math.hypot(nx - v.x, ny - v.y) > 0.15) {
          apply({ k: v.k, x: nx, y: ny });
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [apply, followOnRef, followRef]);

  const didPan = useCallback(() => {
    const svg = ref.current as (SVGSVGElement & { __panMoved?: boolean }) | null;
    const moved = Boolean(svg?.__panMoved);
    if (svg) svg.__panMoved = false;
    return moved;
  }, [ref]);

  return { view, zoomBy, reset, home, fit, didPan, apply };
}
