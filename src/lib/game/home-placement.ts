import {indoorClear,indoorRoute,type IndoorPoint} from './indoor-navigation';
import {emptyHomeRoom,furnitureDef,furnitureBox,homeLayout,type HomeRoom,type HomePiece} from './home-room';
export function canPlaceHome(room:HomeRoom,piece:HomePiece,player?:IndoorPoint){
  if(!furnitureDef(piece.kind)||![piece.x,piece.z,piece.turn].every(Number.isFinite)||!Number.isInteger(piece.turn)||piece.turn<0||piece.turn>3)return false;
  const b=furnitureBox(piece),l=homeLayout(room);
  if(b.x-b.w<l.minX||b.x+b.w>l.maxX||b.z-b.d<l.minZ||b.z+b.d>l.maxZ)return false;
  if(Math.abs(b.x)<b.w+.65&&b.z+b.d>2.1)return false;
  if(piece.kind!=='rug'&&Math.abs(b.x+3)<b.w+.62&&Math.abs(b.z+2.15)<b.d+.47)return false;
  for(const other of room.items){
    if(other.id===piece.id||other.stored||(other.kind==='rug')!==(piece.kind==='rug'))continue;
    const a=furnitureBox(other);if(Math.abs(a.x-b.x)<a.w+b.w+.08&&Math.abs(a.z-b.z)<a.d+b.d+.08)return false;
  }
  const next=homeLayout({...room,items:[...room.items.filter(p=>p.id!==piece.id),{...piece,stored:false}]});
  const targets=[{x:0,z:1.6},{x:0,z:-1.35},...(player?[player]:[])];
  return indoorClear(next,next.spawn)&&targets.every(p=>indoorClear(next,p)&&!!indoorRoute(next,next.spawn,p));
}
export function coerceHomeRoom(raw:unknown):HomeRoom{
  if(!raw||typeof raw!=='object'||!Array.isArray((raw as HomeRoom).items))return emptyHomeRoom();
  const r=raw as HomeRoom,out:HomeRoom={items:[],next:Number.isSafeInteger(r.next)?Math.max(1,Math.min(1000000,r.next)):1};
  for(const v of r.items.slice(0,32)){
    if(!v||typeof v.id!=='string'||!v.id||v.id.length>64||!furnitureDef(v.kind)||out.items.some(p=>p.id===v.id))continue;
    const valid=[v.x,v.z,v.turn].every(Number.isFinite),piece:HomePiece={id:v.id,kind:v.kind,x:valid?Math.round(v.x*4)/4:0,z:valid?Math.round(v.z*4)/4:0,turn:valid?((Math.round(v.turn)%4)+4)%4:0,stored:v.stored===true};
    if(!valid||(!piece.stored&&!canPlaceHome(out,piece)))piece.stored=true;
    out.items.push(piece);
  }
  return out;
}
