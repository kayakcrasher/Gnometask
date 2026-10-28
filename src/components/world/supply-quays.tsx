import {Html} from '@react-three/drei';
import {useGame} from '@/lib/game/store';
import {supplyPorts} from '@/lib/game/ship-supplies';
import {to3} from '@/lib/game/world3';
import {SEA_LEVEL} from '@/lib/game/data/water';
import {useNearby} from './mobile-graphics';
import {DockAsset} from './player-harbours';
export function SupplyQuays({walkTo}:{walkTo?:(x:number,y:number,arrive?:()=>void)=>void}){
  const s=useGame(),near=useNearby();
  const open=()=>window.dispatchEvent(new Event('hollow-watch:supply-dock'));
  return <group>{supplyPorts(s.thimble).filter(p=>near(p.x,p.y,600)).map(p=>{
    const at=s.afloat?p.water:p,close=Math.hypot(s.gnomeX-at.x,s.gnomeY-at.y)<(s.afloat?100:160);
    const visit=()=>{if(close)open();else if(!s.afloat&&walkTo)walkTo(p.x,p.y,open);else s.speak('Sail alongside the end of the quartermaster quay to load provisions.');};
    return <group key={p.id} onClick={e=>{e.stopPropagation();visit();}}>
      <DockAsset dock={{site:p.id,level:3,style:'mint'}} x={p.x} y={p.y} water={p.water} wide/>
      <group position={to3(p.water.x,p.water.y,SEA_LEVEL+.7)}>
        {[-1,0,1].map((i)=><group key={i} position={[i*.65,.25,-1]}><mesh castShadow><boxGeometry args={[.55,.5,.55]}/><meshStandardMaterial color={i===0?'#b6c8a3':'#bc9766'}/></mesh><mesh position={[0,0,.28]}><boxGeometry args={[.06,.5,.025]}/><meshStandardMaterial color="#605d4d"/></mesh></group>)}
        {[0,1].map(i=><mesh key={i} position={[i*.55-.3,.25,1]} castShadow><cylinderGeometry args={[.23,.23,.6,8]}/><meshStandardMaterial color="#927754"/></mesh>)}
        {s.afloat&&close&&<Html center position={[0,3,0]} zIndexRange={[25,0]}><button type="button" className="min-h-11 whitespace-nowrap rounded-xl bg-parchment px-3 text-xs font-bold text-pine shadow-panel" onClick={e=>{e.stopPropagation();open();}}>Quartermaster · Ship provisions</button></Html>}
      </group>
      {!s.afloat&&Math.hypot(s.gnomeX-p.x,s.gnomeY-p.y)<500&&<Html center position={to3(p.x,p.y,3.5)} zIndexRange={[25,0]}><button type="button" className="min-h-11 whitespace-nowrap rounded-xl bg-parchment px-3 text-xs font-bold text-pine shadow-panel" onClick={e=>{e.stopPropagation();visit();}}>Quartermaster · Ship provisions</button></Html>}
    </group>;
  })}</group>;
}
