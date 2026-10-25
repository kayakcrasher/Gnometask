import { Html } from "@react-three/drei";
import { NOTICEBOARD, NOTICEBOARD_EVENT } from "@/lib/game/town-progress";
import { useGame } from "@/lib/game/store";
import { groundY, to3 } from "@/lib/game/world3";
export function TownNoticeboard3() {
  const charter=useGame(s=>s.townProgress.claimed.includes("charter"));
  const x=useGame(s=>s.gnomeX),y=useGame(s=>s.gnomeY);
  if(Math.hypot(x-NOTICEBOARD.x,y-NOTICEBOARD.y)>1000)return null;
  const open=()=>window.dispatchEvent(new Event(NOTICEBOARD_EVENT));
  return <group position={to3(NOTICEBOARD.x,NOTICEBOARD.y,groundY(NOTICEBOARD.x,NOTICEBOARD.y))} onClick={e=>{e.stopPropagation();open();}}>
    {[-.65,.65].map(x=><mesh key={x} position={[x,.75,0]}><boxGeometry args={[.13,1.5,.15]}/><meshStandardMaterial color="#795438"/></mesh>)}
    <mesh position={[0,1.3,0]}><boxGeometry args={[1.6,1,.15]}/><meshStandardMaterial color="#795438"/></mesh>
    <mesh position={[0,1.88,0]} rotation={[0,0,-.08]}><boxGeometry args={[1.9,.16,.55]}/><meshStandardMaterial color={charter?"#c59b48":"#507461"}/></mesh>
    {[-.46,0,.46].map((x,i)=><mesh key={x} position={[x,1.3,.086]} rotation={[0,0,(i-1)*.08]}><planeGeometry args={[.34,.54]}/><meshStandardMaterial color={i===1?"#e5c47e":"#f1e4bf"} side={2}/></mesh>)}
    <mesh position={[0,1,0]}><boxGeometry args={[1.9,2.2,.5]}/><meshBasicMaterial visible={false}/></mesh>
    {Math.hypot(x-NOTICEBOARD.x,y-NOTICEBOARD.y)<220&&<Html center position={[0,2.4,0]} zIndexRange={[12,0]}><button type="button" onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();open();}} className="min-h-11 whitespace-nowrap rounded-full bg-parchment px-3 text-xs font-bold text-pine shadow-panel">Town noticeboard</button></Html>}
  </group>;
}
