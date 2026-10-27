import {Html} from "@react-three/drei";
import {fishingMotion} from "@/lib/game/deep-fishing";
import {navigableWater} from "@/lib/game/sailing";
import {useMemo} from "react";
import { useNearby } from "./mobile-graphics";
import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGame } from "@/lib/game/store";
import { SEA_LEVEL } from "@/lib/game/data/water";
import { groundY, to3 } from "@/lib/game/world3";

const SCHOOLS: { cx: number; cy: number; color: string; n: number; speed: number; radius: number }[] = [
  { cx: -10, cy: 470, color: "#d5dde4", n: 5, speed: 0.35, radius: 1.4 },
  { cx: 10, cy: 620, color: "#3d8f8a", n: 4, speed: 0.28, radius: 1.8 },
  { cx: 60, cy: 760, color: "#c47b3a", n: 3, speed: 0.22, radius: 1.5 },
  { cx: 1800, cy: 1480, color: "#e07a6a", n: 4, speed: 0.3, radius: 2 },
  { cx: 2500, cy: 280, color: "#3d6ea5", n: 3, speed: 0.18, radius: 2.2 },
  { cx: 400, cy: -20, color: "#c9d6f2", n: 3, speed: 0.26, radius: 1.6 },
];

function FishBody({ color }: { color: string }) {
  return (
    <group>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <capsuleGeometry args={[0.05, 0.14, 3, 6]} />
        <meshStandardMaterial color={color} roughness={0.45} />
      </mesh>
      <mesh position={[-0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.045, 0.09, 4]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

function School({
  cx,
  cy,
  color,
  n,
  speed,
  radius,
}: {
  cx: number;
  cy: number;
  color: string;
  n: number;
  speed: number;
  radius: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const origin = to3(cx, cy, -0.22);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime * speed;
    ref.current.children.forEach((child, i) => {
      const a = t + (i / n) * Math.PI * 2;
      const wobble = Math.sin(t * 3 + i) * 0.08;
      child.position.set(Math.cos(a) * radius, wobble, Math.sin(a) * radius * 0.65);
      child.rotation.y = -a + Math.PI / 2;
    });
  });
  return (
    <group ref={ref} position={origin}>
      {Array.from({ length: n }, (_, i) => (
        <group key={i}>
          <FishBody color={color} />
        </group>
      ))}
    </group>
  );
}

function Buoy({ x, y }: { x: number; y: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.y = Math.sin(clock.elapsedTime * 1.3 + x) * 0.05;
  });
  return (
    <group ref={ref} position={to3(x, y, -0.12)}>
      <mesh castShadow>
        <sphereGeometry args={[0.12, 10, 8]} />
        <meshStandardMaterial color="#c4553a" />
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <boxGeometry args={[0.02, 0.16, 0.02]} />
        <meshStandardMaterial color="#f4efe4" />
      </mesh>
    </group>
  );
}

export function OceanLife() {
  const near=useNearby();
  return (
    <group>
      {SCHOOLS.filter(s=>near(s.cx,s.cy,100)).map((s) => (
        <School key={`${s.cx}-${s.cy}`} {...s} />
      ))}
      <FishActivity/>
      <Buoy x={-30} y={430} />
      <Buoy x={20} y={700} />
      <Buoy x={120} y={820} />
    </group>
  );
}

export function CastLine() {
 const fishing=useGame(s=>s.fishing),gx=useGame(s=>s.gnomeX),gy=useGame(s=>s.gnomeY);
 const label=useRef<HTMLSpanElement>(null);
 const rod=useRef<THREE.Group>(null),bobber=useRef<THREE.Group>(null),fish=useRef<THREE.Group>(null),shadow=useRef<THREE.Mesh>(null),rings=useRef<THREE.Group>(null);
 const positions=useMemo(()=>new Float32Array(6),[]),line=useMemo(()=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(positions,3));return g;},[positions]);
 useEffect(()=>()=>line.dispose(),[line]);
 useFrame(({clock})=>{
  if(!fishing||!rod.current||!bobber.current||!fish.current||!shadow.current||!rings.current)return;
  const t=Math.min(1,(Date.now()-fishing.started)/(fishing.duration??2600)),m=fishingMotion(t),cast=m.cast,reel=m.reel,time=clock.elapsedTime;
  if(label.current)label.current.textContent=m.phase;
  const reach=2.2*cast*(1-reel),lift=Math.sin(cast*Math.PI)*1.1*(1-reel);
  bobber.current.position.set(reach,.05+lift+Math.sin(time*4)*.025-m.bite*.06*(1-reel),0);
  rod.current.rotation.z=-.45+Math.sin(cast*Math.PI)*.7-m.bite*.15+reel*.4;
  shadow.current.position.set(2.2+Math.sin(time*1.7)*.35,.012,Math.cos(time*1.7)*.25);
  shadow.current.scale.set((fishing.size??1)*.75,1,.4);
  shadow.current.visible=t>.2&&t<.84;
  fish.current.visible=t>.72;fish.current.position.set(reach,.03+Math.sin(reel*Math.PI)*.65,0);fish.current.rotation.y=Math.sin(time*7)*.25;
  rings.current.position.set(reach,.018,0);rings.current.visible=t>.2&&t<.92;rings.current.scale.setScalar(.65+(time%1.2)*.5+m.bite*.3);
  positions.set([0,1.1,0,bobber.current.position.x,bobber.current.position.y,0]);line.attributes.position.needsUpdate=true;line.computeBoundingSphere();
 });
 if(!fishing)return null;
 const base=fishing.where==='sea'?to3(gx,gy,SEA_LEVEL):to3(fishing.x,fishing.y,SEA_LEVEL);
 return <group position={base}>
  <Html center position={[0,1.8,0]} style={{pointerEvents:"none"}}><span ref={label} className="whitespace-nowrap rounded-full bg-pine/85 px-3 py-1 text-xs font-bold text-parchment">Casting</span></Html>
  <group ref={rod}><mesh position={[0,.6,0]}><cylinderGeometry args={[.025,.04,1.2,6]}/><meshStandardMaterial color="#86664c"/></mesh></group>
  <lineSegments geometry={line}><lineBasicMaterial color="#eee6c9" transparent opacity={.8}/></lineSegments>
  <group ref={bobber}><mesh><sphereGeometry args={[.065,8,6]}/><meshStandardMaterial color="#c85845"/></mesh><mesh position={[0,.08,0]}><cylinderGeometry args={[.012,.012,.12,5]}/><meshStandardMaterial color="#f7e8c0"/></mesh></group>
  <mesh ref={shadow} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[.35,16]}/><meshBasicMaterial color={fishing.shadow} transparent opacity={.4} depthWrite={false}/></mesh>
  <group ref={fish} scale={fishing.size??1}><FishBody color={fishing.color}/></group>
  <group ref={rings}>{[.22,.4].map(r=><mesh key={r} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[r,r+.012,24]}/><meshBasicMaterial color="#d1e5d2" transparent opacity={.45} depthWrite={false}/></mesh>)}</group>
 </group>;
}
function ActivityRing({x,y}:{x:number;y:number}){
 const root=useRef<THREE.Group>(null);useFrame(({clock})=>{if(root.current){root.current.rotation.y=clock.elapsedTime*.3;root.current.scale.setScalar(.8+Math.sin(clock.elapsedTime*1.8+x)*.12);}});
 return <group ref={root} position={to3(x,y,SEA_LEVEL+.025)}>{[.4,.65].map(r=><mesh key={r} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[r,r+.013,20]}/><meshBasicMaterial color="#badbc9" transparent opacity={.32} depthWrite={false}/></mesh>)}<group position={[.25,.005,0]} scale={[.6,.2,.3]}><FishBody color="#315f66"/></group></group>;
}
function FishActivity(){const x=useGame(s=>s.gnomeX),y=useGame(s=>s.gnomeY),cx=Math.floor(x/280),cy=Math.floor(y/280);
 const spots=useMemo(()=>{const out:{x:number;y:number}[]=[];for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const px=(cx+a)*280+90,py=(cy+b)*280+120;if(navigableWater(px,py))out.push({x:px,y:py});}return out;},[cx,cy]);
 return <group>{spots.map(p=><ActivityRing key={`${p.x}-${p.y}`} {...p}/>)}</group>;
}

const WASH = [
  { id: "shell-a", kind: "shell" as const, x: -8, y: 470 },
  { id: "shirt", kind: "cloth" as const, x: 0, y: 640 },
  { id: "boot", kind: "cloth" as const, x: 15, y: 820 },
  { id: "shell-b", kind: "shell" as const, x: 900, y: 1560 },
];

function WalkingCrab({ x, y, phase }: { x: number; y: number; phase: number }) {
  const ref = useRef<THREE.Group>(null);
  const leg = useRef(0);
  useFrame((_, dt) => {
    if (!ref.current) return;
    leg.current += dt;
    const t = leg.current * 0.35 + phase;
    const along = Math.sin(t) * 28;
    const p = to3(x + along, y + Math.sin(t * 2) * 6, groundY(x, y) + 0.02);
    ref.current.position.set(p[0], p[1], p[2]);
    ref.current.rotation.y = Math.cos(t) > 0 ? Math.PI / 2 : -Math.PI / 2;
  });
  return (
    <group ref={ref}>
      <mesh position={[0, 0.06, 0]} castShadow>
        <sphereGeometry args={[0.1, 8, 6]} />
        <meshStandardMaterial color="#c4553a" />
      </mesh>
      <mesh position={[0.08, 0.05, 0.06]} rotation={[0, 0, -0.6]}>
        <boxGeometry args={[0.12, 0.03, 0.04]} />
        <meshStandardMaterial color="#8a3030" />
      </mesh>
      <mesh position={[0.08, 0.05, -0.06]} rotation={[0, 0, -0.6]}>
        <boxGeometry args={[0.12, 0.03, 0.04]} />
        <meshStandardMaterial color="#8a3030" />
      </mesh>
    </group>
  );
}

export function ShoreLife() {
  const days = useGame((s) => s.daysPlayed);
  const got = useGame((s) => s.flotsam);
  const take = useGame((s) => s.takeFlotsam);
  return (
    <group>
      <WalkingCrab x={10} y={760} phase={0.2} />
      <WalkingCrab x={-5} y={900} phase={1.4} />
      <WalkingCrab x={20} y={1040} phase={2.2} />
      <WalkingCrab x={40} y={430} phase={0.8} />
      {WASH.map((item, i) => {
        if ((days + i) % 3 === 2) return null;
        if (got.includes(`${days}:${item.id}`)) return null;
        const p = to3(item.x, item.y, Math.max(SEA_LEVEL + 0.04, groundY(item.x, item.y) + 0.02));
        return (
          <group
            key={item.id}
            position={p}
            onClick={(e) => {
              e.stopPropagation();
              take(item.id);
            }}
          >
            {item.kind === "shell" ? (
              <mesh rotation={[0.6, 0.4, 0]} castShadow>
                <sphereGeometry args={[0.08, 8, 6]} />
                <meshStandardMaterial color="#f2e2c4" />
              </mesh>
            ) : (
              <mesh rotation={[0.2, 0.5, 0.4]} castShadow>
                <boxGeometry args={[0.16, 0.04, 0.12]} />
                <meshStandardMaterial color={item.id === "boot" ? "#5b4230" : "#6a8f8a"} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}
