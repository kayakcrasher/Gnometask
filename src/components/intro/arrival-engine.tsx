import { arrivalStep, dampAngle } from "@/lib/game/visual-motion";
import { Component, useEffect, useState, useRef, type ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GnomeRig } from '../world/gnome-rig';
import { BoatMesh, Pier, Dockhouse } from '../world/boats';
import { Hall3, Bank3, TimberHouse } from '../world/town';
import { CourtHouse } from '../world/civic-life';
import { Terrain } from '../world/terrain';
import { AdaptiveResolution, useCanvasDpr } from '../world/mobile-graphics';
import { TOWN_SHOPS, NPCS } from '@/lib/game/world';
import { to3, groundY } from '@/lib/game/world3';
import { SEA_LEVEL } from '@/lib/game/data/water';

const anchor=to3(78,520), noop=()=>{};
const ARRIVAL_CAMERA={position:[-12,4,.5] as [number,number,number],fov:55,near:.1,far:130};
const ARRIVAL_GL={antialias:true,alpha:false,powerPreference:"high-performance" as const};
const pappy=NPCS.find(n=>n.id==='pappy')!;
const start=new THREE.Vector3(-5,.21,1.6);
const landed=new THREE.Vector3(-4,.24,.08);
const meeting=new THREE.Vector3(-1.65,.24,-.14);
const walkPath=new THREE.CatmullRomCurve3([start,new THREE.Vector3(-4.8,.22,1.25),new THREE.Vector3(-4.3,.235,.5),landed,new THREE.Vector3(-3.3,.24,-.1),meeting],false,'centripetal');

function DockingAction({scene,reduced,hurry,onAdvance}:{scene:number;reduced:boolean;hurry:boolean;onAdvance:()=>void}) {
  const player=useRef<THREE.Group>(null),elapsed=useRef(0),previous=useRef(scene),sent=useRef(false);
  const desired=useRef(new THREE.Vector3()),look=useRef(new THREE.Vector3(-2.8,1.2,-.2)),
    point=useRef(new THREE.Vector3()),tangent=useRef(new THREE.Vector3());
  useFrame(({camera},delta)=>{
    const dt=Math.min(.08,delta);
    if(previous.current!==scene){previous.current=scene;elapsed.current=0;sent.current=false;}
    if(scene===0)elapsed.current=arrivalStep(elapsed.current,dt,hurry);
    else elapsed.current+=dt;
    const t=scene===0&&!reduced?Math.min(1,elapsed.current/7):1;
    const eased=t*t*(3-2*t);
    walkPath.getPointAt(eased,point.current);walkPath.getTangentAt(eased,tangent.current);
    if(player.current){
      player.current.position.copy(point.current);
      const heading=t>=.99?Math.PI/2:Math.atan2(tangent.current.x,tangent.current.z);
      player.current.rotation.y=reduced?heading:dampAngle(player.current.rotation.y,heading,9,dt);
    }
    desired.current.set(scene===0?-12:-3.6,scene===0?4:2.65,scene===0?.5:-3.3);
    if(reduced)camera.position.copy(desired.current);
    else camera.position.lerp(desired.current,1-Math.exp(-2*dt));
    const target=scene===0?[-2.8,1.2,-.2]:[-1.1,1.05,0];
    if(reduced)look.current.set(target[0],target[1],target[2]);
    else {const a=1-Math.exp(-2*dt);look.current.x+=(target[0]-look.current.x)*a;look.current.y+=(target[1]-look.current.y)*a;look.current.z+=(target[2]-look.current.z)*a;}
    camera.lookAt(look.current);
    // The same clock moves the actor and advances the story; no timer can jump him ashore.
    if(!sent.current&&((scene===0&&(reduced?hurry:t>=1))||(scene===1&&!reduced&&elapsed.current>=4))){sent.current=true;onAdvance();}
  });
  return <>
    <group position={[-5,SEA_LEVEL+.06,3.2]} scale={2.4}><BoatMesh kind="sloop"/></group>
    {/* Boarding plank joins this ship's deck to the actual Port Victoria pier. */}
    <mesh position={[-4.5,.22,.84]}>
      <boxGeometry args={[1.22,.09,1.92]}/><meshStandardMaterial color="#c6a174" roughness={.92}/>
    </mesh>
    <group ref={player} position={start}>
      <GnomeRig hat="hat-berry" walking={scene===0&&!reduced} scale={.9} beard/>
      <mesh position={[-.37,.35,-.03]}><boxGeometry args={[.25,.32,.18]}/><meshStandardMaterial color="#ac8354"/></mesh>
    </group>
    <group position={[-.55,.24,-.16]} rotation={[0,-Math.PI/2,0]}>
      <GnomeRig elder hat={pappy.hat} coat="#8a6238" scale={1.05} gesture={reduced?null:"wave"} beard/>
    </group>
  </>;
}
function HarbourSet({scene,reduced,hurry,onAdvance}:{scene:number;reduced:boolean;hurry:boolean;onAdvance:()=>void}) {
  return <>
    <color attach="background" args={['#a6c8c8']}/><fog attach="fog" args={['#a6c8c8',35,95]}/>
    <hemisphereLight args={['#e5ead5','#6b5340',1.1]}/><directionalLight position={[-10,20,12]} intensity={1.7} color="#ffe5b2"/>
    <group position={[-anchor[0],0,-anchor[2]]}>
      <Terrain onWalk={noop}/><Pier/><Dockhouse onEnter={noop}/>
      {TOWN_SHOPS.filter(s=>s.x<900&&s.y<850).map(shop=><group key={shop.id} position={to3(shop.x,shop.y,groundY(shop.x,shop.y))} rotation={[0,shop.face,0]}>
        {shop.id==='townhall'?<Hall3 level={1} position={[0,0,0]}/>:shop.id==='bank'?<Bank3 position={[0,0,0]} onEnter={noop}/>:<TimberHouse position={[0,0,0]} roof={shop.roof} tall={shop.tall} sign={shop.sign} onEnter={noop}/>}
      </group>)}
      <group position={to3(360,350,groundY(360,350))} scale={1.25}><CourtHouse town="capitol" level={1} onEnter={noop} label={false}/></group>
    </group>
    <DockingAction scene={scene} reduced={reduced} hurry={hurry} onAdvance={onAdvance}/><AdaptiveResolution fixed/>
  </>;
}
class EngineBoundary extends Component<{children:ReactNode},{failed:boolean}> {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  render(){return this.state.failed?<p className="arrival-fallback p-6 text-sm text-parchment">The ship has reached Port Victoria. Use Skip intro to continue if 3D is unavailable.</p>:this.props.children;}
}
function FirstFrame({onReady}:{onReady:()=>void}) {
  const ready=useRef(false);
  useFrame(()=>{if(!ready.current){ready.current=true;onReady();}});
  return null;
}
export function ArrivalEngine({scene,paused,onReady,hurry,onAdvance}:{scene:number;paused:boolean;onReady:()=>void;hurry:boolean;onAdvance:()=>void}) {
  const dpr=useCanvasDpr();
  const [reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(()=>{const query=matchMedia('(prefers-reduced-motion: reduce)'),sync=()=>setReduced(query.matches);query.addEventListener('change',sync);return()=>query.removeEventListener('change',sync);},[]);
  return <div className="arrival-engine absolute inset-0" role="img" aria-label="In-game 3D scene: your gnome walks off a sailing ship onto Port Victoria’s pier, where Ol Pappy waits.">
    <EngineBoundary><Canvas dpr={dpr} frameloop={paused?'never':reduced?'demand':'always'} camera={ARRIVAL_CAMERA} gl={ARRIVAL_GL}>
      <HarbourSet scene={scene} reduced={reduced} hurry={hurry} onAdvance={onAdvance}/><FirstFrame onReady={onReady}/>
    </Canvas></EngineBoundary>
  </div>;
}
