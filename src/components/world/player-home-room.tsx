import {useEffect,useState} from 'react';
import {useGame} from '@/lib/game/store';
import {useIndoor} from '@/lib/game/indoor-state';
import {FURNITURE,furnitureDef,furniturePrice,type FurnitureKind} from '@/lib/game/home-room';
import {HOME_UPGRADE_COST} from '@/lib/game/city';
import {BUILDING_MAX} from '@/lib/game/types';
import {InteriorCanvas} from './interior-assets';
import {HomeFurniture} from './home-furniture';
import {TreasureShelf} from './discovery-wrecks';
import {Aquarium} from '../hud/aquarium';
const btn='min-h-11 rounded-xl px-3 py-2 text-xs font-bold disabled:opacity-40';
function HomeScene(){
 const room=useGame(s=>s.homeRoom);
 return <><color attach="background" args={['#b9aa8b']}/><ambientLight intensity={1.4}/><directionalLight position={[2,6,5]} intensity={1.8}/><pointLight position={[-2.9,1,-2]} color="#ffcd8a" intensity={1.6} distance={6}/>
 <mesh rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[8,7]}/><meshStandardMaterial color="#c5a475"/></mesh>
 {Array.from({length:17},(_,i)=><mesh key={i} position={[-3.9+i*.48,.006,0]}><boxGeometry args={[.015,.012,7]}/><meshStandardMaterial color="#a58b63"/></mesh>)}
 <mesh position={[0,1.4,-3.2]}><boxGeometry args={[8,2.8,.13]}/><meshStandardMaterial color="#efe2bd"/></mesh><mesh position={[-3.9,1.4,0]}><boxGeometry args={[.13,2.8,6.4]}/><meshStandardMaterial color="#ddcdab"/></mesh>
 {[-2.4,2.4].map(x=><group key={x} position={[x,1.7,-3.1]}><mesh><boxGeometry args={[1.2,1.15,.1]}/><meshStandardMaterial color="#a6c8c2" emissive="#8ba99f" emissiveIntensity={.2}/></mesh>{[-1,1].map(v=><mesh key={v} position={[v*.72,-.04,.03]}><boxGeometry args={[.3,1.4,.15]}/><meshStandardMaterial color="#ba9d83"/></mesh>)}<mesh position={[0,0,.08]}><boxGeometry args={[.04,1.15,.04]}/><meshStandardMaterial color="#f4e8ca"/></mesh><mesh position={[0,0,.08]}><boxGeometry args={[1.2,.04,.04]}/><meshStandardMaterial color="#f4e8ca"/></mesh></group>)}
 <group position={[-3,0,-2.15]}><mesh position={[0,.7,0]}><boxGeometry args={[1.1,1.4,.8]}/><meshStandardMaterial color="#b4a084"/></mesh><mesh position={[0,.4,.42]}><boxGeometry args={[.75,.7,.04]}/><meshStandardMaterial color="#4f3d30"/></mesh><mesh position={[0,.35,.47]}><coneGeometry args={[.23,.5,7]}/><meshStandardMaterial color="#f2bc64" emissive="#df883d" emissiveIntensity={.8}/></mesh><mesh position={[0,.17,.48]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.08,.08,.6,8]}/><meshStandardMaterial color="#796045"/></mesh></group>
 <TreasureShelf/>{room.items.filter(p=>!p.stored).map(p=><HomeFurniture key={p.id} piece={p}/>)}</>;
}
export function PlayerHomeRoom(){const id=useGame(s=>s.interior);return id==='cottage'?<HomeInterior/>:null;}
function HomeInterior(){
 const s=useGame(),arranging=useIndoor(i=>i.arranging),selected=useIndoor(i=>i.selectedFurniture);
 const [services,setServices]=useState(false),[kind,setKind]=useState<FurnitureKind>('plant');
 const piece=s.homeRoom.items.find(p=>p.id===selected),price=furniturePrice(s.homeRoom,kind);
 useEffect(()=>()=>{useIndoor.setState({arranging:false,selectedFurniture:null,direction:{x:0,z:0},target:null});},[]);
 const toggle=()=>{setServices(false);useIndoor.setState({arranging:!arranging,direction:{x:0,z:0},target:null,selectedFurniture:selected??s.homeRoom.items[0]?.id??null});};
 const move=(x:number,z:number)=>{if(piece)s.placeHomeFurniture(piece.id,piece.x+x,piece.z+z,piece.turn);};
 return <section role="dialog" aria-modal="true" aria-label="Your Thimblehaven home" className="fixed inset-0 z-50 bg-[#b9aa8b] text-pine">
  <div className={`absolute inset-x-0 top-28 ${arranging?'bottom-[min(42dvh,23rem)]':'bottom-2'}`}><InteriorCanvas camera={{position:[0,9,9],fov:45}}><HomeScene/></InteriorCanvas></div>
  <header className="absolute inset-x-3 top-3 rounded-2xl bg-parchment/95 p-3 shadow-panel"><div className="flex items-center gap-2"><h1 className="flex-1 font-display text-lg font-bold">Home sweet Thimblehaven</h1><button type="button" className={`${btn} bg-pine/10`} onClick={s.leaveInterior}>Leave home</button></div><div className="mt-1 flex gap-2"><button type="button" className={`${btn} ${arranging?'bg-pine text-parchment':'bg-gold'}`} onClick={toggle}>{arranging?'Done arranging':'Arrange furniture'}</button><button type="button" className={`${btn} bg-pine/10`} onClick={()=>{useIndoor.setState({arranging:false});setServices(!services);}}>Home comforts</button></div></header>
  {!arranging&&!services&&<p className="pointer-events-none absolute inset-x-4 bottom-4 text-center text-xs font-bold">Tap the floor to walk · tap the front door to leave</p>}
  {arranging&&<section aria-label="Furniture arrangement" className="absolute inset-x-3 bottom-3 max-h-[40dvh] overflow-y-auto rounded-2xl bg-parchment p-3 shadow-panel">
   <p className="text-xs">Select a piece, then tap the floor or use the move buttons. Rearranging is free. The front door stays clear.</p>
   <label className="mt-2 block text-xs font-bold">Your furniture<select aria-label="Your furniture" className="mt-1 min-h-11 w-full rounded-xl bg-pine/10 px-2" value={selected??''} onChange={e=>useIndoor.setState({selectedFurniture:e.target.value})}><option value="" disabled>Choose furniture</option>{s.homeRoom.items.map((p,index)=><option key={p.id} value={p.id}>{furnitureDef(p.kind)!.name} {s.homeRoom.items.slice(0,index+1).filter(i=>i.kind===p.kind).length}{p.stored?' · in storage':' · in room'}</option>)}</select></label>
   {piece&&<><p className="my-1 text-xs">{piece.stored?'In storage':'In the room'} · facing {piece.turn*90}°</p><div className="flex flex-wrap gap-1">{[[0,-.25,'Move toward back'],[-.25,0,'Move left'],[0,.25,'Move toward door'],[.25,0,'Move right']].map(([x,z,label])=><button type="button" key={label} className={`${btn} bg-pine/10`} onClick={()=>move(Number(x),Number(z))}>{label}</button>)}<button type="button" className={`${btn} bg-gold`} onClick={()=>s.placeHomeFurniture(piece.id,piece.x,piece.z,(piece.turn+1)%4)}>Rotate 90°</button><button type="button" disabled={piece.stored} className={`${btn} bg-pine/10`} onClick={()=>s.storeHomeFurniture(piece.id)}>Put in storage</button></div></>}
   <details className="mt-2"><summary className="min-h-11 cursor-pointer py-3 text-sm font-bold">Buy more furniture · {s.coins} coins</summary><label className="text-xs">Furniture shop<select aria-label="Furniture shop" value={kind} onChange={e=>setKind(e.target.value as FurnitureKind)} className="my-1 min-h-11 w-full rounded-xl bg-pine/10 px-2">{FURNITURE.map(f=><option key={f.kind} value={f.kind}>{f.name}</option>)}</select></label><button type="button" className={`${btn} w-full bg-gold`} disabled={s.coins<price||s.homeRoom.items.length>=32} onClick={()=>s.buyHomeFurniture(kind)}>Buy {furnitureDef(kind)!.name} · {price} coins</button><p className="mt-1 text-xs">Extra copies cost progressively more. Up to 32 pieces including storage.</p></details><p role="status" className="mt-2 text-xs">{s.speech}</p>
  </section>}
  {services&&<section aria-label="Home comforts" className="absolute inset-x-3 bottom-3 max-h-[65dvh] overflow-y-auto rounded-2xl bg-parchment p-3 shadow-panel"><button type="button" className={`${btn} mb-2 w-full bg-pine/10`} onClick={()=>setServices(false)}>Back to my room</button><button type="button" className={`${btn} mb-2 w-full bg-gold`} onClick={s.sipTea}>Have tea · restore heart</button>{s.cottageLevel<3&&<button type="button" className={`${btn} mb-2 w-full bg-pine/10`} disabled={s.coins<HOME_UPGRADE_COST[s.cottageLevel+1]!} onClick={s.upgradeCottage}>Upgrade home · {HOME_UPGRADE_COST[s.cottageLevel+1]} coins</button>}{s.buildingHp.cottage<BUILDING_MAX.cottage&&<button type="button" className={`${btn} mb-2 w-full bg-pine/10`} onClick={()=>s.repairBuilding('cottage')}>Repair home</button>}<Aquarium/></section>}
 </section>;
}
