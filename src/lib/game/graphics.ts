import {create} from 'zustand';
export type GraphicsMode='auto'|'sharp'|'smooth';
export const GRAPHICS_KEY='hollow-watch:graphics:v1';
export function resolutionRange(mode:GraphicsMode,deviceRatio:number){
  const device=Math.max(1,Math.min(2,Number.isFinite(deviceRatio)?deviceRatio:1));
  if(mode==='smooth')return {min:1,max:1,initial:1};
  if(mode==='sharp')return {min:device,max:device,initial:device};
  const max=Math.min(1.5,device);return {min:1,max,initial:max};
}
const ratio=()=>typeof devicePixelRatio==='number'?devicePixelRatio:1;
export const useGraphics=create<{mode:GraphicsMode;dpr:number;load:()=>void;setMode:(mode:GraphicsMode)=>void;setResolution:(dpr:number)=>void}>((set,get)=>({
  mode:'auto',dpr:resolutionRange('auto',ratio()).initial,
  load:()=>{try{const mode=localStorage.getItem(GRAPHICS_KEY);if(mode==='auto'||mode==='sharp'||mode==='smooth')set({mode,dpr:resolutionRange(mode,ratio()).initial});}catch{}},
  setMode:mode=>{if(!['auto','sharp','smooth'].includes(mode))return;set({mode,dpr:resolutionRange(mode,ratio()).initial});try{localStorage.setItem(GRAPHICS_KEY,mode);}catch{}},
  setResolution:value=>{if(!Number.isFinite(value))return;const r=resolutionRange(get().mode,ratio()),dpr=Math.max(r.min,Math.min(r.max,value));if(Math.abs(dpr-get().dpr)>.01)set({dpr});}
}));
