import { useCallback, useEffect, useRef, useState, type MutableRefObject } from "react";
import { clamp } from "@/lib/utils";
import { useGame } from "@/lib/game/store";
import type { GnomeFacing } from "@/components/land/gnome";
import { onIsland } from "@/lib/game/world3";

const SPEED = 260;

function facingOf(dx: number, dy: number): GnomeFacing {
  if (Math.abs(dy) > Math.abs(dx) * 1.05) return dy > 0 ? "down" : "up";
  return dx < 0 ? "left" : "right";
}

export function useGnomeWalk(followRef: MutableRefObject<{ x: number; y: number }>) {
  const savedX = useGame((s) => s.gnomeX);
  const savedY = useGame((s) => s.gnomeY);
  const setGnomePos = useGame((s) => s.setGnomePos);
  const setFollowWalk = useGame((s) => s.setFollowWalk);

  const [pos, setPos] = useState({ x: savedX, y: savedY });
  const [facing, setFacing] = useState<GnomeFacing>("down");
  const [yaw, setYaw] = useState(Math.PI / 2);
  const [marker, setMarker] = useState<{ x: number; y: number } | null>(null);
  const posRef = useRef(pos);
  posRef.current = pos;
  const yawRef = useRef(Math.PI / 2);
  const targetRef = useRef<{ x: number; y: number; arrive?: () => void } | null>(null);
  const [walking, setWalking] = useState(false);
  const speedRef = useRef(0);

  useEffect(() => {
    if (targetRef.current) return;
    setPos({ x: savedX, y: savedY });
    followRef.current = { x: savedX, y: savedY };
  }, [followRef, savedX, savedY]);

  useEffect(() => {
    followRef.current = { x: pos.x, y: pos.y };
  }, [followRef, pos.x, pos.y]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const target = targetRef.current;
      if (!target) {
        if (speedRef.current !== 0) {
          setWalking(false);
          speedRef.current = 0;
        }
        raf = requestAnimationFrame(loop);
        return;
      }
      const cur = posRef.current;
      const dx = target.x - cur.x;
      const dy = target.y - cur.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 10) {
        const arrived = { x: target.x, y: target.y };
        setPos(arrived);
        followRef.current = arrived;
        setGnomePos(arrived.x, arrived.y);
        const cb = target.arrive;
        targetRef.current = null;
        setMarker(null);
        setWalking(false);
        speedRef.current = 0;
        cb?.();
        raf = requestAnimationFrame(loop);
        return;
      }
      setFacing(facingOf(dx, dy));
      const nextYaw = Math.atan2(dx, dy);
      yawRef.current = nextYaw;
      setYaw(nextYaw);
      const step = Math.min(dist, SPEED * dt);
      speedRef.current = SPEED;
      const next = { x: cur.x + (dx / dist) * step, y: cur.y + (dy / dist) * step };
      if (!onIsland(next.x, next.y)) {
        targetRef.current = null;
        setMarker(null);
        setWalking(false);
        speedRef.current = 0;
        raf = requestAnimationFrame(loop);
        return;
      }
      setPos(next);
      followRef.current = next;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [followRef, setGnomePos]);

  const walkTo = useCallback(
    (x: number, y: number, arrive?: () => void) => {
      const nx = clamp(x, 20, 2760);
      const ny = clamp(y, 20, 1460);
      if (!onIsland(nx, ny)) {
        arrive?.();
        return;
      }
      const dx = nx - posRef.current.x;
      const dy = ny - posRef.current.y;
      if (Math.hypot(dx, dy) < 6) {
        arrive?.();
        return;
      }
      setFacing(facingOf(dx, dy));
      const nextYaw = Math.atan2(dx, dy);
      yawRef.current = nextYaw;
      setYaw(nextYaw);
      targetRef.current = { x: nx, y: ny, arrive };
      setMarker({ x: nx, y: ny });
      setFollowWalk(true);
      setWalking(true);
    },
    [setFollowWalk],
  );

  return { pos, facing, yaw, walking, marker, walkTo, yawRef, posRef, speedRef };
}
