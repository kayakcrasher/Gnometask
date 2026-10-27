import {hullHandling} from './sea-weather';
export const CABIN_HULLS=['barge','coaster','packet','yacht','expedition','megayacht','warcutter','brig','frigate','pirate','galleon'];
export const hasCabin=(id:string)=>CABIN_HULLS.includes(id);
export const CREW_ROLES=[{id:'navigator',name:'Navigator',price:1800,description:'15% faster rudder response while on duty.'},{id:'deckhand',name:'Deckhand',price:900,description:'6% more cruising speed while on duty.'},{id:'cook',name:'Cook',price:1200,description:'Prepare a restorative meal in the cabin for 5 coins.'}] as const;
export type CrewRole=(typeof CREW_ROLES)[number]['id'];
export type ShipLife={crew:Record<string,CrewRole[]>;speed:'slow'|'cruise'|'full'};
export const emptyShipLife=():ShipLife=>({crew:{},speed:'cruise'});
export function coerceShipLife(raw:unknown,hulls:string[]):ShipLife{const out=emptyShipLife();if(!raw||typeof raw!=='object')return out;const r=raw as Partial<ShipLife>;if(['slow','cruise','full'].includes(r.speed!))out.speed=r.speed!;for(const id of hulls)if(hasCabin(id)&&Array.isArray(r.crew?.[id]))out.crew[id]=CREW_ROLES.filter(p=>r.crew![id]!.includes(p.id)).map(p=>p.id);return out;}
export const throttleFactor=(speed:ShipLife['speed'])=>speed==='slow'?.35:speed==='full'?1:.75;
export function crewOnDuty(s:{shipLife:ShipLife;coins:number},hull:string,role:CrewRole){const crew=s.shipLife.crew[hull]??[];return crew.includes(role)&&s.coins>=crew.length*2;}
/** Yaw uses map X=sin(yaw), Y=cos(yaw), matching the boat renderer. */
export function helmCourse(current:number,target:number,hull:string,dt:number,navigator=false){const delta=Math.atan2(Math.sin(target-current),Math.cos(target-current)),limit=hullHandling(hull).turn*.3*(navigator?1.15:1)*Math.max(0,Math.min(.1,dt));const heading=current+Math.max(-limit,Math.min(limit,delta));return {heading,alignment:Math.max(.18,Math.cos(delta)),x:Math.sin(heading),y:Math.cos(heading)};}
