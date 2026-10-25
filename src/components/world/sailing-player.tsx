import {hullHandling} from "@/lib/game/sea-weather";
import {memo,useRef,useMemo,useEffect} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {BoatMesh} from './boats';
import {GnomeRig} from './gnome-rig';
import {to3} from '@/lib/game/world3';
import {SEA_LEVEL} from '@/lib/game/data/water';
import {dampAngle,seaPose} from '@/lib/game/visual-motion';
import type {BoatId} from '@/lib/game/data/boats';
import type {GameSave} from '@/lib/game/types';
const StableBoat=memo(BoatMesh,(a,b)=>a.kind===b.kind&&a.rowing===b.rowing&&a.guns===b.guns&&a.crew===b.crew&&(a.parts??[]).join() === (b.parts??[]).join());
export function SailingPlayer({x,y,heading,moving,disabled,kind,parts,guns,crew,hat,equipment,showPlayer}:{x:number;y:number;heading:number;moving:boolean;disabled:boolean;kind:BoatId;parts:readonly string[];guns:number;crew:number;hat:string;equipment:GameSave['equipment'];showPlayer:boolean}){
  const root=useRef<THREE.Group>(null),hull=useRef<THREE.Group>(null),wake=useRef<THREE.Group>(null);
  const foam=useMemo(()=>new THREE.MeshBasicMaterial({color:"#e3f2df",transparent:true,opacity:0,depthWrite:false}),[]);
  useEffect(()=>()=>foam.dispose(),[foam]);
  const yaw=useRef(heading),strength=useRef(0),initial=useRef(to3(x,y,SEA_LEVEL+.06));
  useFrame(({clock},delta)=>{
    const dt=Math.min(.08,delta),previous=yaw.current;
    yaw.current=dampAngle(yaw.current,heading,hullHandling(kind).turn,dt);
    strength.current+=((moving&&!disabled?1:0)-strength.current)*(1-Math.exp(-2.8*dt));
    const p=to3(x,y,SEA_LEVEL+.06),turn=(yaw.current-previous)/Math.max(.001,dt),motion=seaPose(clock.elapsedTime,p[0],p[2],strength.current,turn);
    if(root.current){const target=new THREE.Vector3(...p);if(root.current.position.distanceTo(target)>30)root.current.position.copy(target);else root.current.position.lerp(target,1-Math.exp(-18*dt));root.current.rotation.y=yaw.current;}
    if(hull.current){hull.current.position.y=motion.heave;hull.current.rotation.set(motion.pitch,0,motion.roll+(disabled?.15:0));}
    if(wake.current){wake.current.position.y=motion.heave+.03;wake.current.visible=strength.current>.025;wake.current.scale.set(1,.9,1+strength.current*.6);}
    foam.opacity=strength.current*.25;
  });
  const small=kind==='row'||kind==='sail'||kind==='fisher';
  const deck=kind==='row'?.624:kind==='sail'?.5:kind==='fisher'?.323:kind==='barge'?.403:kind==='sloop'?.369:1.03;
  return <group ref={root} position={initial.current} rotation={[0,heading,0]}>
    <group ref={hull}>
      <group scale={2.4}><StableBoat kind={kind} parts={parts} rowing={moving} guns={guns} crew={crew}/></group>
      {showPlayer&&<group position={[kind==='row'?0:.4,deck,kind==='row'?.23:-.4]}><GnomeRig hat={hat} weapon={equipment.weapon} shield={equipment.shield} armor={equipment.armor} scale={1.15} beard/></group>}
    </group>
    <group ref={wake} position={[0,-.04,small?-.8:-1.7]}>
      {[-1,1].map(side=><mesh key={side} position={[side*(small?.55:.9),0,-1.1]} rotation={[-Math.PI/2,0,side*.27]} material={foam}>
        <planeGeometry args={[.055,small?2.4:3.8]}/>
      </mesh>)}
      {[0,1,2,3].map(i=><mesh key={i} position={[0,-.005,-.4-i*.65]} rotation={[-Math.PI/2,0,0]} scale={[.16+i*.06,.2,1]} material={foam}><ringGeometry args={[.7,1,12]}/></mesh>)}
    </group>
  </group>;
}

/** Interpolate the 4 Hz fleet/shipping simulation without changing its saved coordinates. */
export function FluidSeaGroup({x,y,heading,children,...props}:{x:number;y:number;heading?:number;children:React.ReactNode}&Omit<React.ComponentProps<'group'>,'position'|'rotation'>){
  const root=useRef<THREE.Group>(null),initial=useRef(to3(x,y,SEA_LEVEL+.06)),last=useRef({x,y}),targetHeading=useRef(heading??0),yaw=useRef(heading??0);
  useEffect(()=>{const dx=x-last.current.x,dy=y-last.current.y;if(heading!==undefined)targetHeading.current=heading;else if(Math.hypot(dx,dy)>.05)targetHeading.current=Math.atan2(dx,dy);last.current={x,y};},[x,y,heading]);
  useFrame(({clock},delta)=>{
    if(!root.current)return;const dt=Math.min(.08,delta),p=to3(x,y,SEA_LEVEL+.06);
    const goal=new THREE.Vector3(...p);
    if(root.current.position.distanceTo(goal)>30)root.current.position.copy(goal);else root.current.position.lerp(goal,1-Math.exp(-10*dt));
    yaw.current=dampAngle(yaw.current,targetHeading.current,4,dt);
    const motion=seaPose(clock.elapsedTime,p[0],p[2],.5);
    root.current.position.y=p[1]+motion.heave;root.current.rotation.set(motion.pitch,yaw.current,motion.roll);
  });
  return <group {...props} ref={root} position={initial.current}>{children}</group>;
}
