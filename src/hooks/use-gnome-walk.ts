import {provisionSpeed} from '@/lib/game/ship-supplies';
import {helmCourse,throttleFactor,crewOnDuty} from "@/lib/game/ship-life";
import { windSpeedFactor, hullHandling } from "@/lib/game/sea-weather";
import { sailingVelocity } from "@/lib/game/visual-motion";
import {oceanLandAt} from "@/lib/game/ocean-world";
import {portDestination,portNavigationRoute} from "@/lib/game/ports";
import { CART_SPEED } from "@/lib/game/transport";
import { WORLD_BOUNDS } from "@/lib/game/data/frontier";
import { landRoute } from "@/lib/game/land-route";
import { useCallback, useEffect, useRef, useState, type MutableRefObject } from "react";
import { clamp } from "@/lib/utils";
import { useGame } from "@/lib/game/store";
import type { GnomeFacing } from "@/components/land/gnome";
import { walkableLand } from "@/lib/game/world3";
import { HARBOUR_APPROACH, clearSeaSegment, navigableWater, seaRoute, sailingSpeed, type SeaPoint } from "@/lib/game/sailing";

const SPEED = 260;
type Waypoint = SeaPoint & { arrive?: () => void };

function facingOf(dx: number, dy: number): GnomeFacing {
  if (Math.abs(dy) > Math.abs(dx) * 1.05) return dy > 0 ? "down" : "up";
  return dx < 0 ? "left" : "right";
}

function legalAt(sea: boolean, x: number, y: number) {
  return sea ? navigableWater(x, y) : walkableLand(x, y);
}

/** Find a reachable shore point when a ground click lands just outside the beach. */
function nearestLegal(sea: boolean, x: number, y: number) {
  if (legalAt(sea, x, y)) return { x, y };
  for (let r = 8; r <= (sea ? 300 : 120); r += 8) {
    for (let a = 0; a < 16; a++) {
      const ang = a / 16 * Math.PI * 2;
      const sx = x + Math.cos(ang) * r, sy = y + Math.sin(ang) * r;
      if (legalAt(sea, sx, sy)) return { x: sx, y: sy };
    }
  }
  return null;
}

export function useGnomeWalk(followRef: MutableRefObject<SeaPoint>) {
  const savedX = useGame(s => s.gnomeX);
  const savedY = useGame(s => s.gnomeY);
  const afloat = useGame(s => s.afloat);
  const blocked = useGame(s => Boolean((s.combat&&!s.combat.retreating) || s.atHome || s.interior || s.abroad || s.fishing || s.transport.ride || s.naval.rescue || s.naval.boarding || (s.afloat&&(s.naval.integrity[s.afloat]??1)<=0)));
  const portCourse=useGame(s=>s.portCourse);
  const sailHome = useGame(s => s.sailHome);
  const [pos, setPos] = useState({ x: savedX, y: savedY });
  const [facing, setFacing] = useState<GnomeFacing>("down");
  const [yaw, setYaw] = useState(Math.PI / 2);
  const [marker, setMarker] = useState<SeaPoint | null>(null);
  const [walking, setWalking] = useState(false);
  const posRef = useRef(pos);
  const yawRef = useRef(Math.PI / 2);
  const speedRef = useRef(0);
  const cruiseRef=useRef(0);
  const combatPositionAt=useRef(0);
  const routeRef = useRef<Waypoint[]>([]);
  const previousBoat = useRef(afloat);

  const stop = useCallback(() => {
    routeRef.current = [];
    setMarker(null);
    setWalking(false);
    speedRef.current = 0;
    cruiseRef.current=0;
  }, []);

  useEffect(() => {
    const changedBoat = previousBoat.current !== afloat;
    previousBoat.current = afloat;
    if (routeRef.current.length && !blocked && !changedBoat) return;
    stop();
    let here = { x: savedX, y: savedY };
    // Recover older saves whose boats were allowed to sit on the beach.
    if (afloat && !navigableWater(here.x, here.y)) {
      here = nearestLegal(true, here.x, here.y) ?? HARBOUR_APPROACH;
      useGame.getState().setGnomePos(here.x, here.y);
    }
    posRef.current = here;
    setPos(here);
    followRef.current = here;
  }, [savedX, savedY, afloat, blocked, followRef, stop]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const state = useGame.getState();
      const target = routeRef.current[0];
      if (target && (!state.combat||state.combat.retreating) && !state.atHome && !state.interior && !state.abroad && !state.fishing && !state.transport.ride && !state.bank.pending && !state.naval.rescue && !state.naval.boarding) {
        const cur = posRef.current;
        const dx = target.x - cur.x, dy = target.y - cur.y;
        const distance = Math.hypot(dx, dy);
        const sea = Boolean(state.afloat);
        const maximum = state.afloat ? provisionSpeed(state.shipStores,state.afloat)*sailingSpeed(state.afloat, state.skills.sailing,state.ports.parts[state.afloat])*windSpeedFactor(state.afloat,Math.atan2(dy,dx),cur.x,cur.y,state.ports.parts[state.afloat])*throttleFactor(state.shipLife.speed)*(crewOnDuty(state,state.afloat,"deckhand")?1.06:1) : state.transport.mounted ? CART_SPEED : SPEED;
        const speed=sea?(cruiseRef.current=sailingVelocity(cruiseRef.current,maximum,routeRef.current.length===1?distance:Infinity,dt,hullHandling(state.afloat!).acceleration)):maximum;
        const course=sea?helmCourse(yawRef.current,Math.atan2(dx,dy),state.afloat!,dt,crewOnDuty(state,state.afloat!,"navigator")):null;
        const assisted=sea&&distance<60;
        const step = Math.min(distance, sea?45:Infinity, speed * dt*(course&&!assisted?course.alignment:assisted?.5:1));
        let tx = cur.x + (course&&!assisted?course.x:dx/(distance||1))*step, ty = cur.y + (course&&!assisted?course.y:dy/(distance||1))*step;
        if(sea&&!clearSeaSegment(cur,{x:tx,y:ty})){tx=cur.x+dx/(distance||1)*step*.25;ty=cur.y+dy/(distance||1)*step*.25;}

        let next: SeaPoint | null = null;
        if (legalAt(sea, tx, ty)) next = { x: tx, y: ty };
        else if (!sea && legalAt(false, tx, cur.y)) next = { x: tx, y: cur.y };
        else if (!sea && legalAt(false, cur.x, ty)) next = { x: cur.x, y: ty };
        if (!next) {
          useGame.getState().setGnomePos(cur.x, cur.y);
          stop();
        } else {
          if (distance > 0.001) {
            setFacing(facingOf(dx, dy));
            yawRef.current = sea?Math.atan2(tx-cur.x,ty-cur.y):Math.atan2(dx, dy);
            setYaw(yawRef.current);
          }
          if (sea && distance > 0) {
            state.sailStep(next.x, next.y);
            // A rejected movement step must not move the visible boat either.
            if (Math.hypot(useGame.getState().gnomeX - next.x, useGame.getState().gnomeY - next.y) > 0.01) {
              stop();
              raf = requestAnimationFrame(loop);
              return;
            }
          }
          if(state.combat?.retreating&&now-combatPositionAt.current>100){combatPositionAt.current=now;state.setGnomePos(next.x,next.y);}
          posRef.current = next;
          setPos(next);
          followRef.current = next;
          speedRef.current = speed;
          setWalking(true);
          if (Math.hypot(target.x-next.x,target.y-next.y) < .05) {
            routeRef.current.shift();
            if (!routeRef.current.length) {
              state.setGnomePos(next.x, next.y);
              stop();
              target.arrive?.();
            }
          }
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [followRef, stop]);

  const walkTo = useCallback((x: number, y: number, arrive?: () => void, suppliedRoute?:SeaPoint[]) => {
    const state = useGame.getState();
    if(state.combat&&state.combat.phase!=="won"&&state.combat.phase!=="lost")state.combatFlee();
    if ((state.combat&&!useGame.getState().combat?.retreating) || state.atHome || state.interior || state.abroad || state.fishing || state.transport.ride || state.naval.rescue || state.naval.boarding) return;
    const sea = Boolean(state.afloat);
    const wide=sea||!!oceanLandAt(state.gnomeX,state.gnomeY);
    if (!Number.isFinite(x)||!Number.isFinite(y)) return;
    const nx = wide ? x : clamp(x, WORLD_BOUNDS.minX, WORLD_BOUNDS.maxX);
    const ny = wide ? y : clamp(y, WORLD_BOUNDS.minY, WORLD_BOUNDS.maxY);
    const spot = nearestLegal(sea, nx, ny);
    if (!spot) { stop(); return; }
    const route = suppliedRoute??(sea ? seaRoute(posRef.current, spot) : landRoute(posRef.current, spot));
    if (!route) {
      stop();
      state.speak(sea?"No clear water route. Choose a point farther from the shore.":"No clear walking route. Choose a nearby path or clearing.");
      return;
    }
    if (Math.hypot(spot.x - posRef.current.x, spot.y - posRef.current.y) < 1) {
      stop();
      arrive?.();
      return;
    }
    routeRef.current = route.map((point, i) => ({ ...point, ...(i === route.length - 1 ? { arrive } : {}) }));
    setMarker(spot);
    state.setFollowWalk(true);
    setWalking(true);
  }, [stop]);

  useEffect(()=>{
    const anchor=()=>{stop();const p=posRef.current;useGame.getState().setGnomePos(p.x,p.y);};
    const nudge=(event:Event)=>{const s=useGame.getState();if(!s.afloat||s.interior||s.combat||s.naval.rescue||s.naval.boarding||s.fishing)return;const side=(event as CustomEvent<number>).detail;if(side!==-1&&side!==1)return;const h=yawRef.current+side*Math.PI/6,p=posRef.current;walkTo(p.x+Math.sin(h)*300,p.y+Math.cos(h)*300);};
    window.addEventListener("hollow-watch:anchor",anchor);window.addEventListener("hollow-watch:rudder",nudge);
    return()=>{window.removeEventListener("hollow-watch:anchor",anchor);window.removeEventListener("hollow-watch:rudder",nudge);};
  },[stop,walkTo]);
  useEffect(()=>{
    const handle=(event:Event)=>{const p=(event as CustomEvent<{x:number;y:number}>).detail;if(p&&Number.isFinite(p.x)&&Number.isFinite(p.y))walkTo(p.x,p.y);};
    window.addEventListener("hollow-watch:notice-walk",handle);
    return()=>window.removeEventListener("hollow-watch:notice-walk",handle);
  },[walkTo]);
  useEffect(() => {
    if (!sailHome || !afloat) return;
    useGame.setState({ sailHome: false });
    useGame.setState({portCourse:"capital"});
  }, [sailHome, afloat, walkTo]);

  useEffect(()=>{
    if(!portCourse||!afloat)return;
    const port=portDestination(portCourse);useGame.setState({portCourse:null});
    if(port){
      const route=portNavigationRoute(posRef.current,portCourse);
      if(!route){useGame.getState().speak("No safe harbour course found. Sail into clearer water and try again.");return;}
      const end=route.at(-1)!;
      walkTo(end.x,end.y,()=>{const s=useGame.getState();if(Math.hypot(s.gnomeX-port.water.x,s.gnomeY-port.water.y)<100)s.sailTo("dock");else useGame.setState({portCourse});},route);
    }
  },[portCourse,afloat,walkTo]);
  return { pos, facing, yaw, walking, marker, walkTo, yawRef, posRef, speedRef };
}
