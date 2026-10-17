import { useEffect, useRef, useState } from "react";
import type { GnomeFacing } from "@/components/land/gnome";
import { useGame } from "@/lib/game/store";
import {
  clearNpcSegment,
  npcWalkable,
  npcRoute,
  npcRoutine,
  safeNpcSpot,
  type NpcActivity,
  type NpcHome,
  type WalkPoint,
} from "@/lib/game/npc-brain";
export type NpcPose = {
  x: number;
  y: number;
  facing: GnomeFacing;
  walking: boolean;
  activity?: NpcActivity;
};
type Plan = { path: WalkPoint[]; wait: number; cycle: number; blocked: number };
function facingOf(dx: number, dy: number): GnomeFacing {
  return Math.abs(dy) > Math.abs(dx) * 1.05
    ? dy > 0
      ? "down"
      : "up"
    : dx < 0
      ? "left"
      : "right";
}
export function useNpcWander(homes: NpcHome[], frozen: boolean) {
  const [poses, setPoses] = useState<Record<string, NpcPose>>(() =>
    Object.fromEntries(
      homes.map((h) => [
        h.id,
        {
          ...safeNpcSpot(h),
          facing: "down",
          walking: false,
          activity: "working",
        },
      ]),
    ),
  );
  const posesRef = useRef(poses),
    plans = useRef<Record<string, Plan>>({});
  useEffect(() => {
    if (frozen) {
      const next = Object.fromEntries(
        Object.entries(posesRef.current).map(([id, p]) => [
          id,
          { ...p, walking: false },
        ]),
      );
      posesRef.current = next;
      setPoses(next);
      return;
    }
    let raf = 0,
      last = performance.now(),
      elapsed = 0;
    const loop = (now: number) => {
      elapsed += Math.min(0.1, (now - last) / 1000);
      last = now;
      // NPC decisions and pose publication run at 15 Hz, independently of rendering.
      if (elapsed < 1 / 15) {
        raf = requestAnimationFrame(loop);
        return;
      }
      const dt = elapsed;
      elapsed = 0;
      const cur = { ...posesRef.current },
        state = useGame.getState();
      const obstacles = [
        ...Object.values(state.estate).map((h) => ({ ...h, w: 23, h: 21 })),
        ...state.civic.plots
          .filter((p) => p.stories > 0)
          .map((p) => ({ ...p, w: 12, h: 10 })),
      ];
      for (const [homeIndex, home] of homes.entries()) {
        let pose = cur[home.id] ?? {
          ...safeNpcSpot(home),
          facing: "down" as GnomeFacing,
          walking: false,
        };
        const plan =
          plans.current[home.id] ??
          (plans.current[home.id] = {
            path: [],
            wait: 0.4 + (homeIndex % 13) * 0.16,
            cycle: 0,
            blocked: 0,
          });
        // A newly completed home can move a resident's anchor to another district.
        // Start their local routine at the new home rather than retrying a route
        // outside the bounded local planner forever.
        if (Math.hypot(pose.x-home.x,pose.y-home.y)>360) {
          pose={...pose,...safeNpcSpot(home,obstacles),walking:false};
          plan.path=[];plan.wait=1;cur[home.id]=pose;
        }
        if (!npcWalkable(pose.x, pose.y, obstacles)) {
          pose = { ...pose, ...safeNpcSpot(pose, obstacles), walking: false };
          plan.path = [];
          plan.wait = 0.5;
          cur[home.id] = pose;
        }
        if (state.popup?.npcId === home.id) {
          cur[home.id] = {
            ...pose,
            walking: false,
            activity: "chatting",
            facing: facingOf(state.gnomeX - pose.x, state.gnomeY - pose.y),
          };
          continue;
        }
        if (plan.wait > 0) {
          plan.wait -= dt;
          cur[home.id] = { ...pose, walking: false };
          continue;
        }
        if (!plan.path.length) {
          const routine = npcRoutine(
            home,
            state.dayPhase,
            plan.cycle++,
            obstacles,
          );
          plan.path = npcRoute(pose, routine.point, obstacles) ?? [];
          plan.wait = plan.path.length ? 0 : routine.wait;
          cur[home.id] = {
            ...pose,
            walking: false,
            activity: routine.activity,
          };
          if (!plan.path.length) continue;
        }
        const goal = plan.path[0]!,
          dx = goal.x - pose.x,
          dy = goal.y - pose.y,
          distance = Math.hypot(dx, dy);
        if (distance < 2) {
          plan.path.shift();
          if (!plan.path.length)
            plan.wait = npcRoutine(home, state.dayPhase, plan.cycle - 1).wait;
          cur[home.id] = { ...cur[home.id]!, walking: false };
          continue;
        }
        const speed =
          pose.activity === "patrolling"
            ? 55
            : pose.activity === "resting"
              ? 32
              : 43;
        const step = Math.min(distance, speed * dt),
          next = {
            x: pose.x + (dx / distance) * step,
            y: pose.y + (dy / distance) * step,
          };
        const crowd = homes.some(
          (other) =>
            other.id < home.id &&
            cur[other.id] &&
            Math.hypot(cur[other.id]!.x - next.x, cur[other.id]!.y - next.y) <
              12,
        );
        if (crowd || !clearNpcSegment(pose, next, obstacles)) {
          plan.blocked += dt;
          cur[home.id] = { ...cur[home.id]!, walking: false };
          if (plan.blocked > 1.5) {
            plan.path = [];
            plan.wait = 1;
            plan.blocked = 0;
          }
          continue;
        }
        plan.blocked = 0;
        cur[home.id] = {
          ...cur[home.id]!,
          ...next,
          facing: facingOf(dx, dy),
          walking: true,
        };
      }
      posesRef.current = cur;
      setPoses(cur);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [homes, frozen]);
  return poses;
}
