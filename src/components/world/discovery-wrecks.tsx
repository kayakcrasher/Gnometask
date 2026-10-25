import {Html} from '@react-three/drei';
import {salvageSites} from '@/lib/game/exploration';
import {useGame} from '@/lib/game/store';
import {to3} from '@/lib/game/world3';
import {SEA_LEVEL} from '@/lib/game/data/water';
export function DiscoveryWrecks(){const s=useGame();return <group>{salvageSites(s.ocean.seed).filter(t=>!s.exploration.salvaged.includes(t.id)&&Math.hypot(s.gnomeX-t.x,s.gnomeY-t.y)<1000).map(t=><group key={t.id} position={to3(t.x,t.y,SEA_LEVEL+.08)} rotation={[0,.3,.08]} onClick={e=>{e.stopPropagation();s.salvageDiscovery(t.id);}}><mesh><boxGeometry args={[3,.35,1.3]}/><meshStandardMaterial color="#79614a"/></mesh><mesh position={[0,1.1,0]} rotation={[0,0,.3]}><cylinderGeometry args={[.07,.1,2.3,6]}/><meshStandardMaterial color="#806b4c"/></mesh><mesh position={[.7,.45,0]}><boxGeometry args={[.65,.55,.5]}/><meshStandardMaterial color="#b39a61"/></mesh>{s.afloat&&Math.hypot(s.gnomeX-t.x,s.gnomeY-t.y)<=120&&<Html center position={[0,2.6,0]}><button type="button" onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();s.salvageDiscovery(t.id);}} className="min-h-11 whitespace-nowrap rounded-full bg-parchment px-3 text-xs font-bold text-pine">Salvage abandoned cargo</button></Html>}</group>)}</group>;}
export function TreasureShelf(){
 const claimed=useGame(s=>s.exploration.claimed);
 return <group position={[0,1.25,-2.55]}>{claimed.length>0&&<mesh><boxGeometry args={[2.1,.12,.38]}/><meshStandardMaterial color="#927348"/></mesh>}{claimed.map((id,i)=><group key={id} position={[-.65+i*.65,.2,0]}>
 {id==='lantern'?<><mesh><cylinderGeometry args={[.13,.16,.3,6]}/><meshStandardMaterial color="#dec176" emissive="#e2af5d" emissiveIntensity={.7}/></mesh><mesh position={[0,.22,0]}><torusGeometry args={[.09,.018,5,10]}/><meshStandardMaterial color="#b59348"/></mesh></>:id==='compass'?<><mesh><cylinderGeometry args={[.22,.22,.08,12]}/><meshStandardMaterial color="#bba263"/></mesh><mesh position={[0,.05,0]} rotation={[0,.5,0]}><boxGeometry args={[.035,.025,.32]}/><meshStandardMaterial color="#466d70"/></mesh></>:<mesh scale={[1,.65,.5]}><sphereGeometry args={[.25,10,6,0,Math.PI]}/><meshStandardMaterial color="#e5bac2" side={2}/></mesh>}
 </group>)}</group>;
}
