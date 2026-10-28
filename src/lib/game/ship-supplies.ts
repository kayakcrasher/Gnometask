import type { GameSave } from './types';

export const PROVISION_PRICE = 5;
export const PROVISION_DISTANCE = 6000;
const HOLDS: Record<string, { capacity:number; burn:number }> = {
  coaster:{capacity:60,burn:1}, packet:{capacity:100,burn:2},
  yacht:{capacity:120,burn:2}, expedition:{capacity:160,burn:2},
  megayacht:{capacity:240,burn:4}, warcutter:{capacity:80,burn:1},
  brig:{capacity:120,burn:2}, frigate:{capacity:160,burn:3},
  pirate:{capacity:100,burn:2}, galleon:{capacity:200,burn:4},
};
export type ShipStores = { holds:Record<string,{stock:number;distance:number}> };
export const emptyShipStores = ():ShipStores => ({holds:{}});
export const provisionHold = (hull:string) => HOLDS[hull];
export const stockOn = (stores:ShipStores,hull:string) => stores.holds[hull]?.stock ?? 0;
export const departureReady = (stores:ShipStores,hull:string) => !HOLDS[hull] || stockOn(stores,hull)>=HOLDS[hull]!.burn;
export const provisionSpeed = (stores:ShipStores,hull:string) => !HOLDS[hull] || stockOn(stores,hull)>0 ? 1 : .5;
export function coerceShipStores(raw:unknown,hulls:string[]):ShipStores {
  const out=emptyShipStores();
  const legacy=raw===undefined;
  const holds=raw&&typeof raw==='object'?(raw as ShipStores).holds:undefined;
  for(const hull of hulls){
    const spec=HOLDS[hull];if(!spec)continue;
    const value=holds&&typeof holds==='object'?holds[hull]:undefined;
    out.holds[hull]={stock:legacy?spec.capacity:typeof value?.stock==='number'&&Number.isFinite(value.stock)?Math.min(spec.capacity,Math.max(0,Math.floor(value.stock))):0,
      distance:typeof value?.distance==='number'&&Number.isFinite(value.distance)?Math.min(PROVISION_DISTANCE-0.000001,Math.max(0,value.distance)):0};
  }
  return out;
}
/** Only accepted sailing movement calls this. Nothing consumes stock while idle or offline. */
export function sailProvisions(stores:ShipStores,hull:string,distance:number):ShipStores {
  const spec=HOLDS[hull];if(!spec||!Number.isFinite(distance)||distance<=0)return stores;
  const before=stores.holds[hull]??{stock:0,distance:0},total=before.distance+distance;
  return {holds:{...stores.holds,[hull]:{stock:Math.max(0,before.stock-Math.floor(total/PROVISION_DISTANCE)*spec.burn),distance:total%PROVISION_DISTANCE}}};
}
export function voyageProvisions(hull:string,distance:number){const spec=HOLDS[hull];return spec?Math.ceil(distance/PROVISION_DISTANCE)*spec.burn:0;}
export function spendProvisions(stores:ShipStores,hull:string,amount:number):ShipStores {
  if(!HOLDS[hull]||!amount)return stores;
  return {holds:{...stores.holds,[hull]:{stock:Math.max(0,stockOn(stores,hull)-amount),distance:stores.holds[hull]?.distance??0}}};
}
export const SUPPLY_PORTS = [
  {north:false,id:'capital-supply',name:'Port Victoria · Quartermaster Quay',x:100,y:720,water:{x:-450,y:720}},
  {north:true,id:'thimble-supply',name:'Thimblehaven · Supply Quay',x:1920,y:-2850,water:{x:1550,y:-3000}},
] as const;
export const supplyPorts = (town:GameSave['thimble']) => SUPPLY_PORTS.filter(p=>p.id==='capital-supply'||town.projects.includes('supply-dock'));
export function nearbySupplyPort(s:Pick<GameSave,'thimble'|'gnomeX'|'gnomeY'|'afloat'>){
  return supplyPorts(s.thimble).find(p=>{const at=s.afloat?p.water:p;return Math.hypot(s.gnomeX-at.x,s.gnomeY-at.y)<= (s.afloat?100:160);});
}
/** Reserve a clear loading approach once the municipal builders start work. */
export function supplyQuayClearance(x:number,y:number,town:GameSave['thimble']){
  return SUPPLY_PORTS.some(p=>{
    if(p.id==='thimble-supply'&&!town.projects.includes('supply-dock')&&town.construction?.id!=='supply-dock')return false;
    const dx=p.water.x-p.x,dy=p.water.y-p.y,t=Math.max(0,Math.min(1,((x-p.x)*dx+(y-p.y)*dy)/(dx*dx+dy*dy)));
    return Math.hypot(x-p.x-dx*t,y-p.y-dy*t)<85;
  });
}
