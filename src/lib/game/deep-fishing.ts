import {onIsland} from './world3';
import {navigableWater} from './sailing';
export const DEEP_RIG_LEVEL=60;
export const DEEP_RIG_HULLS=['fisher','barge','coaster','packet','expedition','megayacht'];
export const supportsDeepRig=(id:string)=>DEEP_RIG_HULLS.includes(id);
/** Require clear sea around the boat; beaches and island shallows do not count. */
export function offshoreFishing(x:number,y:number){return navigableWater(x,y)&&Array.from({length:12},(_,i)=>i*Math.PI/6).every(a=>!onIsland(x+Math.cos(a)*450,y+Math.sin(a)*450));}
const ease=(t:number)=>{const v=Math.max(0,Math.min(1,t));return v*v*(3-2*v);};
export function fishingMotion(progress:number){const t=Math.max(0,Math.min(1,progress));return {cast:ease(t/.22),bite:ease((t-.57)/.12),reel:ease((t-.72)/.28),phase:t<.22?'Casting':t<.57?'Waiting for a bite':t<.72?'Fish on the line':'Reeling in'};}
