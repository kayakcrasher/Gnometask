import type {IndoorLayout} from './indoor-navigation';
export const FURNITURE = [
  {kind:'bed',name:'Patchwork bed',price:280,w:.7,d:1.05},
  {kind:'table',name:'Tea table',price:140,w:.75,d:.45},
  {kind:'chair',name:'Cushioned armchair',price:80,w:.38,d:.4},
  {kind:'sofa',name:'Cloud sofa',price:480,w:.95,d:.45},
  {kind:'dresser',name:'Acorn dresser',price:220,w:.65,d:.32},
  {kind:'bookcase',name:'Storybook shelf',price:260,w:.65,d:.28},
  {kind:'lamp',name:'Mushroom lamp',price:90,w:.25,d:.25},
  {kind:'plant',name:'Potted fern',price:45,w:.3,d:.3},
  {kind:'rug',name:'Round woven rug',price:100,w:.95,d:.95},
] as const;
export type FurnitureKind=(typeof FURNITURE)[number]['kind'];
export type HomePiece={id:string;kind:FurnitureKind;x:number;z:number;turn:number;stored:boolean};
export type HomeRoom={items:HomePiece[];next:number};
export const furnitureDef=(kind:string)=>FURNITURE.find(f=>f.kind===kind);
export const furniturePrice=(room:HomeRoom,kind:string)=>{const f=furnitureDef(kind);return f?Math.ceil(f.price*Math.pow(1.35,room.items.filter(i=>i.kind===kind).length)):0;};
export function emptyHomeRoom():HomeRoom{
  const pieces:[FurnitureKind,number,number][]=[['bed',2.5,-1.5],['table',-1.25,-.25],['dresser',0,-2.5],['chair',-2.5,1.25],['lamp',3,1.5],['plant',3,0],['rug',0,1]];
  return {items:pieces.map(([kind,x,z])=>({id:`starter-${kind}`,kind,x,z,turn:0,stored:false})),next:1};
}
export function furnitureBox(p:HomePiece){const f=furnitureDef(p.kind)!;return {x:p.x,z:p.z,w:p.turn%2?f.d:f.w,d:p.turn%2?f.w:f.d};}
export function homeLayout(room:HomeRoom):IndoorLayout{return {minX:-3.65,maxX:3.65,minZ:-2.9,maxZ:3.1,spawn:{x:0,z:2.65},boxes:[
  {x:-3,z:-2.15,w:.55,d:.4},
  ...room.items.filter(p=>!p.stored&&p.kind!=='rug').map(furnitureBox),
]};}
