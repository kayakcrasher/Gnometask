import { useEffect, useRef, useState } from "react";
import type { GnomeFacing } from "@/components/land/gnome";

export type NpcPose = { x: number; y: number; facing: GnomeFacing; walking: boolean };

const SPEED = 72;

function facingOf(dx: number, dy: number): GnomeFacing {
  if (Math.abs(dy) > Math.abs(dx) * 1.05) return dy > 0 ? "down" : "up";
  return dx < 0 ? "left" : "right";
}

export function useNpcWander(
  homes: { id: string; x: number; y: number; stay?: boolean }[],
  frozen: boolean,
) {
  const [poses, setPoses] = useState<Record<string, NpcPose>>(() =>
    Object.fromEntries(homes.map((h) => [h.id, { x: h.x, y: h.y, facing: "down" as GnomeFacing, walking: false }])),
  );
  const posesRef = useRef(poses);
  posesRef.current = poses;
  const targets = useRef<Record<string, { x: number; y: number; wait: number }>>({});

  useEffect(() => {
    if (frozen) {
      setPoses((prev) => {
        const next = { ...prev };
        let changed = false;
        for (const id of Object.keys(next)) {
          if (next[id]!.walking) {
            next[id] = { ...next[id]!, walking: false };
            changed = true;
          }
        }
        return changed ? next : prev;
      });
      return;
    }
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const cur = { ...posesRef.current };
      let changed = false;
      for (const home of homes) {
        const pose = cur[home.id] ?? { x: home.x, y: home.y, facing: "down" as GnomeFacing, walking: false };
        let t = targets.current[home.id];
        if (!t) {
          t = { x: home.x, y: home.y, wait: 0.4 + Math.random() * 1.4 };
          targets.current[home.id] = t;
        }
        if (t.wait > 0) {
          t.wait -= dt;
          if (pose.walking) {
            cur[home.id] = { ...pose, walking: false };
            changed = true;
          }
          if (t.wait <= 0) {
            const ang = Math.random() * Math.PI * 2;
            const rad = home.stay ? 8 + Math.random() * 16 : 18 + Math.random() * 42;
            t.x = home.x + Math.cos(ang) * rad;
            t.y = home.y + Math.sin(ang) * rad * 0.72;
          }
          continue;
        }
        const dx = t.x - pose.x;
        const dy = t.y - pose.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 3) {
          t.wait = 1.2 + Math.random() * 3.2;
          cur[home.id] = { ...pose, walking: false };
          changed = true;
          continue;
        }
        const step = Math.min(dist, SPEED * dt);
        cur[home.id] = {
          x: pose.x + (dx / dist) * step,
          y: pose.y + (dy / dist) * step,
          facing: facingOf(dx, dy),
          walking: true,
        };
        changed = true;
      }
      if (changed) setPoses(cur);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [frozen, homes]);

  return poses;
}
