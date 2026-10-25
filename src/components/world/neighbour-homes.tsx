import {useRef} from "react";
import {useFrame} from "@react-three/fiber";
import {Html} from "@react-three/drei";
import type {Group} from "three";
import {useGame} from "@/lib/game/store";
import {neighbourHome,neighbourProfile,neighbourStyle,NEIGHBOUR_EVENT} from "@/lib/game/neighbours";
import {PROJECT_WORK,type TownResident} from "@/lib/game/thimblehaven";
import {to3,groundY} from "@/lib/game/world3";
import {HomeAsset} from "./home-asset";
import {GnomeRig} from "./gnome-rig";
const open=(id:string)=>window.dispatchEvent(new CustomEvent(NEIGHBOUR_EVENT,{detail:id}));
function BuildSite({progress=0,small=false}:{progress?:number;small?:boolean}){
 return <group scale={small?.7:1}><mesh position={[0,.08,0]}><boxGeometry args={[2.8,.16,2.5]}/><meshStandardMaterial color="#bdad88"/></mesh>{[-1.25,1.25].flatMap(x=>[-1,1].map(z=><mesh key={`${x}-${z}`} position={[x,.9,z]}><boxGeometry args={[.1,1.8,.1]}/><meshStandardMaterial color="#b58d59"/></mesh>))}{[.8,1.6].map(y=><mesh key={y} position={[0,y,1]}><boxGeometry args={[2.7,.1,.1]}/><meshStandardMaterial color="#bc9865"/></mesh>)}{progress>.5&&<mesh position={[0,1.85,0]} rotation={[0,0,.08]}><boxGeometry args={[2.9,.12,2.7]}/><meshStandardMaterial color="#789184"/></mesh>}<mesh position={[1.7,.25,.7]}><boxGeometry args={[.55,.5,.55]}/><meshStandardMaterial color="#a97d4d"/></mesh><group position={[-1.9,0,.9]}><GnomeRig hat="hat-straw" coat="#9b845d" beard gesture="hammer"/></group></group>;
}
function ResidentActor({r}:{r:TownResident}){
 const ref=useRef<Group>(null),arrival=r.arrival??3,offset=(r.homeLevel??1)===0?2:1.2+(3-arrival)*.35;
 const initial=useRef<[number,number,number]>([offset,0,1.4]);
 useFrame((_,dt)=>{if(ref.current){ref.current.position.x+=(offset-ref.current.position.x)*(1-Math.exp(-2*Math.min(.1,dt)));}});
 const p=neighbourProfile(r.id),luggage=(r.homeLevel??1)===0||arrival<3;
 return <group ref={ref} position={initial.current} onClick={e=>{e.stopPropagation();open(r.id);}}><GnomeRig hat={r.id==="nim"?"hat-straw":"hat-moss"} coat={p.coat} beard={r.id!=="holly"} walking={luggage&&arrival>0} gesture={luggage?null:"wave"}/>{luggage&&<group position={[.55,.25,.1]}><mesh><boxGeometry args={[.48,.5,.28]}/><meshStandardMaterial color="#926d48"/></mesh><mesh position={[0,.31,0]}><torusGeometry args={[.09,.02,4,8]}/><meshStandardMaterial color="#d6bd7c"/></mesh></group>}<mesh position={[0,.8,0]}><cylinderGeometry args={[.65,.65,1.8,8]}/><meshBasicMaterial visible={false}/></mesh></group>;
}
export function NeighbourHomes3(){
 const s=useGame();
 return <group>{Object.entries(s.neighbourhood.homes).filter(([id])=>!s.thimble.residents.some(r=>r.id===id)).map(([id,level])=>{const h=neighbourHome(id);return Math.hypot(s.gnomeX-h.x,s.gnomeY-h.y)<1000?<group key={`vacant-${id}`} position={to3(h.x,h.y,groundY(h.x,h.y))}><HomeAsset id={id} level={level} style={neighbourStyle(id)}/><Html center position={[0,level*.9+1.5,0]} style={{pointerEvents:"none"}}><span className="whitespace-nowrap rounded-full bg-parchment/90 px-2 py-1 text-xs text-pine">Vacant home · A light left in the window</span></Html></group>:null;})}{s.thimble.residents.map((r,i)=>{const h=neighbourHome(r.id,i);if(Math.hypot(s.gnomeX-h.x,s.gnomeY-h.y)>1000)return null;const level=r.homeLevel??1,progress=r.work?r.work.progress/(r.work.target===1?4:r.work.target===2?6:10):1;
 return <group key={r.id} position={to3(h.x,h.y,groundY(h.x,h.y))} onClick={e=>{e.stopPropagation();open(r.id);}}>{level>0&&<HomeAsset id={r.id} level={level} style={neighbourStyle(r.id)} lantern={s.thimble.projects.includes("well")}/>} {r.work&&<BuildSite progress={progress}/>}<ResidentActor r={r}/>{Math.hypot(s.gnomeX-h.x,s.gnomeY-h.y)<250&&<Html center position={[0,(level||1)*.9+1.5,0]} zIndexRange={[8,0]}><button type="button" onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();open(r.id);}} className="min-h-11 whitespace-nowrap rounded-xl bg-parchment/95 px-3 text-xs font-bold text-pine">{r.name}{r.work?" · Building":(r.arrival??3)<3?" · Moving in":""}</button></Html>}</group>;})}
 {s.thimble.construction&&(()=>{const sites:Record<string,[number,number]>={well:[2150,-3010],market:[2280,-2950],depot:[2410,-3000],cottages:[2390,-3350],hall:[2520,-3190]},c=s.thimble.construction,p=sites[c.id]!;return Math.hypot(s.gnomeX-p[0],s.gnomeY-p[1])<1100?<group position={to3(p[0],p[1],groundY(...p))}><BuildSite small={c.id==="well"} progress={c.progress/PROJECT_WORK[c.id]!}/><Html center position={[0,3.1,0]} style={{pointerEvents:"none"}}><span className="whitespace-nowrap rounded-full bg-pine/90 px-3 py-1 text-xs text-parchment">Town builders · {Math.round(c.progress/PROJECT_WORK[c.id]!*100)}%</span></Html></group>:null;})()}
 </group>;
}
