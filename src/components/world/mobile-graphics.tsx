import { createContext, useContext, useMemo, useRef, type ReactNode } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

export const MOBILE_GRAPHICS = typeof navigator !== 'undefined' &&
  (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches));
export const INITIAL_DPR = MOBILE_GRAPHICS ? 0.85 : 1;
const NearbyContext = createContext<{x:number;y:number} | null>(null);
/** Quantized origin avoids propagating a new context value on every walking frame.
 * 1700 units plus cell padding keeps scenery beyond the widest playable camera view.
 * This only controls mounted graphics: simulation, saves and routes remain global. */
export function NearbyWorld({pos, children}:{pos:{x:number;y:number};children:ReactNode}) {
  const x=Math.round(pos.x/250)*250, y=Math.round(pos.y/250)*250;
  const origin=useMemo(()=>({x,y}),[x,y]);
  return <NearbyContext.Provider value={origin}>{children}</NearbyContext.Provider>;
}
export function useNearby() {
  const origin=useContext(NearbyContext);
  return (x:number,y:number,padding=0)=>!origin ||
    (x-origin.x)**2+(y-origin.y)**2 < (1900+padding)**2;
}
/** Lower fill-rate gradually on a struggling phone; don't oscillate around 30 FPS. */
export function AdaptiveResolution() {
  const setDpr=useThree(s=>s.setDpr);
  const sample=useRef({elapsed:0,frames:0,dpr:INITIAL_DPR});
  useFrame((_,dt)=>{
    if(!MOBILE_GRAPHICS || document.hidden || dt>1) return;
    const s=sample.current;s.elapsed+=Math.min(dt,.25);s.frames++;
    if(s.elapsed<3)return;
    const ms=s.elapsed*1000/s.frames;
    const next=ms>38?Math.max(.65,s.dpr-.1):ms<22?Math.min(1,s.dpr+.05):s.dpr;
    if(Math.abs(next-s.dpr)>.01){s.dpr=next;setDpr(next);}
    s.elapsed=0;s.frames=0;
  });
  return null;
}

export function NearbyRegion({x,y,radius=0,children}:{x:number;y:number;radius?:number;children:ReactNode}) {
  const near=useNearby();
  return near(x,y,radius) ? <>{children}</> : null;
}
