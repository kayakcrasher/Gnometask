import polygonClipping from "polygon-clipping";
import { WORLD_BOUNDS } from "./frontier";
import { FRONTIER_SETTLEMENTS } from "./frontier";
import type { MultiPolygon } from "polygon-clipping";
import { NPCS } from "./npcs";
import { parcelLand, landArea } from "../land-planning";
import { onDesert, onGrass } from "../world3";

export type Parcel = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  price: number;
  /** Gnome who holds this ground. Private property. Not for sale. */
  owner: string | null;
  ownerName: string | null;
  usableArea?: number;
  land?: MultiPolygon;
  northern?: boolean;
  requiredRoad?: string;
  district?: string;
};

const HOMES: { npc: string; x: number; y: number }[] = [
  { npc: "pappy", x: 96, y: 555 },
  { npc: "wim", x: 118, y: 500 },
  { npc: "greg", x: 140, y: 380 },
  { npc: "nettie", x: 250, y: 400 },
  { npc: "stoic", x: 190, y: 560 },
  { npc: "miller", x: 270, y: 640 },
  { npc: "brine", x: 150, y: 660 },
  { npc: "bramble", x: 168, y: 248 },
  { npc: "pipkin", x: 1100, y: 800 },
];

function buildParcels(): Parcel[] {
  const out: Parcel[] = [];
  const w = 200;
  const h = 180;
  for (let x = 160; x <= 2500; x += w) {
    for (let y = 140; y <= 1280; y += h) {
      if (!onGrass(x + w / 2, y + h / 2)) continue;
      const id = `p-${x}-${y}`;
      const home = HOMES.find((n) => Math.hypot(n.x - (x + w / 2), n.y - (y + h / 2)) < 150);
      const npc = home ? NPCS.find((n) => n.id === home.npc) : undefined;
      const far = Math.hypot(x - 280, y - 520) / 90;
      const price = Math.round((18 + far * 6) * (npc ? 2 : 1));

      out.push({
        id,
        x,
        y,
        w,
        h,
        price,
        owner: npc?.id ?? null,
        ownerName: npc?.shortName ?? npc?.name ?? null,
      });
    }
  }
  for (let x = 2560; x <= 4200; x += w) {
    for (let y = 320; y <= 1100; y += h) {
      const cx = x + w / 2;
      const cy = y + h / 2;
      if (!onDesert(cx, cy)) continue;

      const far = Math.hypot(x - 280, y - 520) / 90;
      out.push({
        id: `d-${x}-${y}`,
        x,
        y,
        w,
        h,
        price: Math.round(22 + far * 5),
        owner: null,
        ownerName: null,
      });
    }
  }
  for(let x=1060;x<=1960;x+=180)for(let y=-680;y<=-320;y+=140){
    if(!onGrass(x+80,y+60))continue;
    out.push({id:`n-${x}-${y}`,x,y,w:170,h:130,price:Math.round(180+Math.hypot(x-1500,y+500)/3),owner:null,ownerName:null,northern:true});
  }
  for(const d of FRONTIER_SETTLEMENTS)for(const dx of [-360,-120,120])for(const dy of [-300,-60,180]){
    const x=d.x+dx,y=d.y+dy;
    if(!onGrass(x+110,y+100))continue;
    out.push({id:`f-${d.id}-${dx}-${dy}`,x,y,w:230,h:230,price:Math.round(d.price*(1+Math.hypot(dx,dy)/900)),owner:null,ownerName:null,northern:true,requiredRoad:d.road,district:d.name});
  }
  for(const y of [-3500,-3300])out.push({id:`thimble-${y}`,x:2140,y,w:200,h:180,price:2200,owner:null,ownerName:null,northern:true,requiredRoad:"thimble-road",district:"Thimblehaven"});
  out.push({id:"thimble-home",x:2130,y:-3160,w:180,h:180,price:0,owner:null,ownerName:null,district:"Thimblehaven"});
  // Keep all historical IDs. Fill remaining countryside without selling any
  // overlapping rectangle twice; clipped boundaries preserve roads and water.
  const historical = [...out];
  const grid = 240;
  for(let x=WORLD_BOUNDS.minX;x<WORLD_BOUNDS.maxX;x+=grid)
    for(let y=WORLD_BOUNDS.minY;y<WORLD_BOUNDS.maxY;y+=grid){
      const rect={x,y,w:grid,h:grid};
      let land=parcelLand(rect);
      if(!land.length)continue;
      const overlaps=historical.filter(p=>p.x<x+grid&&p.x+p.w>x&&p.y<y+grid&&p.y+p.h>y);
      if(overlaps.length)land=polygonClipping.difference(land,...overlaps.map(p=>[[[p.x,p.y],[p.x+p.w,p.y],[p.x+p.w,p.y+p.h],[p.x,p.y+p.h],[p.x,p.y]]] as MultiPolygon[number]));
      const area=landArea(land);
      if(area<1000)continue;
      out.push({id:`island-${x}-${y}`, ...rect,price:Math.round(90+area/100+Math.hypot(x-280,y-520)/15), owner:null,ownerName:null,land,usableArea:area,district:y< -800?"Island frontier":"Island countryside"});
    }
  return out.map(p=>{const land=p.land??parcelLand(p);return {...p,land,usableArea:landArea(land)};});
}

export const PARCELS: Parcel[] = buildParcels();

export function parcelAt(id: string) {
  return PARCELS.find((p) => p.id === id) ?? null;
}

export const parcelAccessOpen=(p:Parcel,completed:string[])=>!p.northern||completed.includes(p.requiredRoad??"noble-reach");
