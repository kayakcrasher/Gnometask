import { useCallback, useEffect, useRef, useState, type MutableRefObject } from "react";
import { clamp } from "@/lib/utils";
import { useGame } from "@/lib/game/store";
import type { GnomeFacing } from "@/components/land/gnome";
import { onDesert, onGrass, onIsland } from "@/lib/game/world3";

const SPEED = 260;

function facingOf(dx: number, dy: number): GnomeFacing {
  if (Math.abs(dy) > Math.abs(dx) * 1.05) return dy > 0 ? "down" : "up";
  return dx < 0 ? "left" : "right";
}

function legalAt(sea: boolean, x: number, y: number) {
  return sea ? !onGrass(x, y) && !onDesert(x, y) : onIsland(x, y);
}

/** Spiral out from (x, y) to find the nearest walkable tile. */
function nearestLegal(sea: boolean, x: number, y: number) {
  if (legalAt(sea, x, y)) return { x, y };
  for (let r = 8; r <= 120; r += 8) {
    for (let a = 0; a < 16; a++) {
      const ang = (a / 16) * Math.PI * 2;
      const sx = x + Math.cos(ang) * r;
      const sy = y + Math.sin(ang) * r;
      if (legalAt(sea, sx, sy)) return { x: sx, y: sy };
    }
  }
  return null;
}

export function useGnomeWalk(followRef: MutableRefObject<{ x: number; y: number }>) {
  const savedX = useGame((s) => s.gnomeX);
  const savedY = useGame((s) => s.gnomeY);
  const afloat = useGame((s) => s.afloat);
  const afloatRef = useRef(afloat);
  afloatRef.current = afloat;
  const combatOn = useGame((s) => Boolean(s.combat));
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
    if (targetRef.current && !combatOn) return;
    targetRef.current = null;
    setWalking(false);
    setPos({ x: savedX, y: savedY });
    followRef.current = { x: savedX, y: savedY };
  }, [followRef, savedX, savedY, combatOn]);

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
      const sea = Boolean(afloatRef.current);
      const tx = cur.x + (dx / dist) * step;
      const ty = cur.y + (dy / dist) * step;
      let next: { x: number; y: number } | null = null;
      if (legalAt(sea, tx, ty)) next = { x: tx, y: ty };
      else if (legalAt(sea, tx, cur.y)) next = { x: tx, y: cur.y };
      else if (legalAt(sea, cur.x, ty)) next = { x: cur.x, y: ty };
      if (!next) {
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
      const sea = Boolean(afloatRef.current);
      const nx = clamp(x, sea ? -520 : 20, 3800);
      const ny = clamp(y, sea ? -280 : -220, 1560);
      const spot = nearestLegal(sea, nx, ny);
      if (!spot) {
        arrive?.();
        return;
      }
      const dx = spot.x - posRef.current.x;
      const dy = spot.y - posRef.current.y;
      if (Math.hypot(dx, dy) < 6) {
        arrive?.();
        return;
      }
      setFacing(facingOf(dx, dy));
      const nextYaw = Math.atan2(dx, dy);
      yawRef.current = nextYaw;
      setYaw(nextYaw);
      targetRef.current = { x: spot.x, y: spot.y, arrive };
      setMarker({ x: spot.x, y: spot.y });
      setFollowWalk(true);
      setWalking(true);
    },
    [setFollowWalk],
  );

  return { pos, facing, yaw, walking, marker, walkTo, yawRef, posRef, speedRef };
}
