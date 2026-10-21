import { Component, useEffect, useState, useRef, type ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GnomeRig } from '../world/gnome-rig';
import { BoatMesh, Pier, Dockhouse } from '../world/boats';
import { Hall3, Bank3, TimberHouse } from '../world/town';
import { CourtHouse } from '../world/civic-life';
import { Terrain } from '../world/terrain';
import { AdaptiveResolution, INITIAL_DPR } from '../world/mobile-graphics';
import { TOWN_SHOPS, NPCS } from '@/lib/game/world';
import { to3, groundY } from '@/lib/game/world3';
import { SEA_LEVEL } from '@/lib/game/data/water';

const anchor=to3(78,520), noop=()=>{};
const pappy=NPCS.find(n=>n.id==='pappy')!;
const start=new THREE.Vector3(-5,.21,1.6);
const landed=new THREE.Vector3(-4,.24,.08);
const meeting=new THREE.Vector3(-1.65,.24,-.14);

function DockingAction({scene,reduced}:{scene:number;reduced:boolean}) {
  const player=useRef<THREE.Group>(null), elapsed=useRef(0), previous=useRef(scene);
  const desired=new THREE.Vector3(), look=new THREE.Vector3();
  useFrame(({camera},dt)=>{
    if(previous.current!==scene){previous.current=scene;elapsed.current=0;}
    elapsed.current+=Math.min(.3,dt);
    const t=scene===0&&!reduced?Math.min(1,elapsed.current/7):1;
    if(player.current){
      if(t<.62)player.current.position.lerpVectors(start,landed,t/.62);
      else player.current.position.lerpVectors(landed,meeting,(t-.62)/.38);
      player.current.rotation.y=t<.62?Math.atan2(1,-1.52):Math.PI/2;
    }
    // Start beside the gangplank, with the real capitol buildings inland behind Pappy.
    desired.set(scene===0?-12:-3.6,scene===0?4:2.65,scene===0?.5:-3.3);
    camera.position.copy(desired);
    look.set(scene===0?-2.8:-1.1,scene===0?1.2:1.05,scene===0?-.2:0);
    camera.lookAt(look);
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
      <GnomeRig hat={pappy.hat} coat="#8a6238" scale={1.05} gesture={reduced?null:"wave"} beard/>
    </group>
  </>;
}
function HarbourSet({scene,reduced}:{scene:number;reduced:boolean}) {
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
    <DockingAction scene={scene} reduced={reduced}/><AdaptiveResolution/>
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
export function ArrivalEngine({scene,paused,onReady}:{scene:number;paused:boolean;onReady:()=>void}) {
  const [reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(()=>{const query=matchMedia('(prefers-reduced-motion: reduce)'),sync=()=>setReduced(query.matches);query.addEventListener('change',sync);return()=>query.removeEventListener('change',sync);},[]);
  return <div className="arrival-engine absolute inset-0" role="img" aria-label="In-game 3D scene: your gnome walks off a sailing ship onto Port Victoria’s pier, where Ol Pappy waits.">
    <EngineBoundary><Canvas dpr={INITIAL_DPR} frameloop={paused?'never':reduced?'demand':'always'} camera={{position:[-12,4,.5],fov:55,near:.1,far:130}} gl={{antialias:false,alpha:false,powerPreference:'high-performance'}}>
      <HarbourSet scene={scene} reduced={reduced}/><FirstFrame onReady={onReady}/>
    </Canvas></EngineBoundary>
  </div>;
}
