import { resolutionRange, useGraphics } from "@/lib/game/graphics";
import { createContext, useContext, useMemo, useEffect, useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';

export const MOBILE_GRAPHICS = typeof navigator !== 'undefined' &&
  (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches));
export const useCanvasDpr=()=>useGraphics(s=>s.dpr);
export const INITIAL_DPR = Math.max(1,Math.min(1.5,typeof devicePixelRatio === "number" ? devicePixelRatio : 1));
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
/** Keep at least CSS-pixel resolution. Change quality only after sustained pressure. */
export function AdaptiveResolution({fixed=false}:{fixed?:boolean}) {
  const mode=useGraphics(s=>s.mode);
  const setDpr=useGraphics(s=>s.setResolution);
  const range=resolutionRange(mode,typeof devicePixelRatio==='number'?devicePixelRatio:1);
  const sample=useRef({elapsed:0,frames:0,dpr:range.initial,bad:0,cooldown:4});
  useEffect(()=>{sample.current={elapsed:0,frames:0,dpr:range.initial,bad:0,cooldown:4};setDpr(range.initial);},[mode,setDpr]);
  useFrame((_,dt)=>{
    if(fixed||mode!=='auto'||document.hidden||dt>1)return;
    const s=sample.current;s.cooldown=Math.max(0,s.cooldown-dt);s.elapsed+=Math.min(dt,.25);s.frames++;
    if(s.elapsed<3)return;
    const ms=s.elapsed*1000/s.frames;s.bad=ms>42?s.bad+1:0;
    const next=s.cooldown>0?s.dpr:s.bad>=2?Math.max(range.min,s.dpr-.15):ms<20?Math.min(range.max,s.dpr+.1):s.dpr;
    if(Math.abs(next-s.dpr)>.01){s.dpr=next;setDpr(next);s.cooldown=8;s.bad=0;}
    s.elapsed=0;s.frames=0;
  });
  return null;
}

export function NearbyRegion({x,y,radius=0,children}:{x:number;y:number;radius?:number;children:ReactNode}) {
  const near=useNearby();
  return near(x,y,radius) ? <>{children}</> : null;
}
