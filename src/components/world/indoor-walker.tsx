import {homeLayout} from "@/lib/game/home-room";
import { useEffect, useMemo, useRef, useState } from "react";
import { useIndoor } from "@/lib/game/indoor-state";
import { PerspectiveCamera } from "three";
import { useThree, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import type { Group } from "three";
import { useGame } from "@/lib/game/store";
import {
  indoorLayout,
  indoorTapRoute,
  indoorSegment,
  indoorStep,
  type IndoorPoint,
} from "@/lib/game/indoor-navigation";
import type { InteriorId } from "@/lib/game/types";
import { GnomeRig } from "./gnome-rig";
export function IndoorCamera({ id }: { id: InteriorId }) {
  const { camera, size } = useThree();
  useEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return;
    const layout = indoorLayout(id),
      width = layout.maxX - layout.minX + 1.5,
      aspect = size.width / Math.max(1, size.height),
      distance = Math.max(
        8,
        width / (2 * Math.tan((camera.fov * Math.PI) / 360) * aspect),
      );
    camera.position.set(0, distance * 0.68, distance * 0.74);
    camera.lookAt(0, 0.4, 0);
    camera.updateProjectionMatrix();
  }, [id, camera, size.width, size.height]);
  return null;
}
export function IndoorWalker({ id }: { id: InteriorId }) {
  const home=useGame(s=>s.homeRoom);
  const layout = useMemo(()=>id==="cottage"?homeLayout(home):indoorLayout(id),[id,home]),
    ref = useRef<Group>(null),
    position = useRef({ ...layout.spawn }),
    path = useRef<IndoorPoint[]>([]),
    lastTarget = useRef<IndoorPoint | null>(null),
    keys = useRef(new Set<string>()),
    timer = useRef(0),
    exit = useRef(false),
    [moving, setMoving] = useState(false),
    hat = useGame((s) => s.hat);
  useEffect(() => {
    position.current = { ...layout.spawn };
    path.current = [];
    exit.current = false;
    useIndoor.setState({
      room: id,
      position: { ...layout.spawn },
      target: null,
      arranging:false,
      selectedFurniture:null,
      direction: { x: 0, z: 0 },
      moving: false,
    });
    const down = (e: KeyboardEvent) => {
        if (
          (e.target as HTMLElement)?.closest(
            "input,textarea,select,[contenteditable=true]",
          )
        )
          return;
        if (
          [
            "ArrowUp",
            "ArrowDown",
            "ArrowLeft",
            "ArrowRight",
            "w",
            "a",
            "s",
            "d",
          ].includes(e.key)
        ) {
          e.preventDefault();
          keys.current.add(e.key);
        }
      },
      up = (e: KeyboardEvent) => keys.current.delete(e.key),
      blur = () => {keys.current.clear();useIndoor.setState({direction:{x:0,z:0}});};
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
      useIndoor.setState({ room: null, direction: { x: 0, z: 0 } });
    };
  }, [id]);
  useFrame((_, dt) => {
    if (!ref.current || document.hidden) return;
    const state = useIndoor.getState();
    if (state.room !== id) return;
    if(state.arranging){keys.current.clear();path.current=[];lastTarget.current=null;return;}
    const p = position.current,
      k = keys.current;
    let dx =
        state.direction.x +
        (k.has("ArrowRight") || k.has("d") ? 1 : 0) -
        (k.has("ArrowLeft") || k.has("a") ? 1 : 0),
      dz =
        state.direction.z +
        (k.has("ArrowDown") || k.has("s") ? 1 : 0) -
        (k.has("ArrowUp") || k.has("w") ? 1 : 0);
    if (state.target !== lastTarget.current) {
      lastTarget.current = state.target;
      const route=state.target?indoorTapRoute(layout,p,state.target):null;
      path.current=route?.path??[];
      if(state.target&&!route){exit.current=false;useIndoor.setState({target:null});}
      else if(route&&Math.hypot(route.target.x-state.target!.x,route.target.z-state.target!.z)>.001){
        lastTarget.current=route.target;useIndoor.setState({target:route.target});
      }
    }
    if(path.current.length&&!indoorSegment(layout,p,path.current[0]!)){path.current=[];useIndoor.setState({target:null});}
    const speed = 2 * Math.min(dt, 0.05);
    let walked = false;
    if (dx || dz) {
      path.current = [];
      if(state.target){lastTarget.current=null;useIndoor.setState({target:null});}
      const next = indoorStep(layout, p, { x: dx, z: dz }, speed);
      walked = Math.hypot(next.x - p.x, next.z - p.z) > 0.0001;
      Object.assign(p, next);
      ref.current.rotation.y = Math.atan2(dx, dz);
    } else if (path.current.length) {
      const next = path.current[0]!,
        x = next.x - p.x,
        z = next.z - p.z,
        distance = Math.hypot(x, z);
      if (distance < speed) {
        Object.assign(p, next);
        path.current.shift();
      } else {
        p.x += (x / distance) * speed;
        p.z += (z / distance) * speed;
      }
      if(distance>.001)ref.current.rotation.y = Math.atan2(x, z);
      walked = true;
    }
    if(!path.current.length&&state.target&&!dx&&!dz)useIndoor.setState({target:null});
    ref.current.position.set(p.x, 0.045, p.z);
    if (walked !== moving) setMoving(walked);
    timer.current += dt;
    if (timer.current > 0.1) {
      timer.current = 0;
      useIndoor.setState({ position: { ...p }, moving: walked });
    }
    if (!exit.current && p.z > layout.spawn.z + 0.25 && Math.abs(p.x) < 0.45) {
      useGame.getState().leaveInterior();
      return;
    }
    if (
      exit.current &&
      !path.current.length &&
      Math.hypot(p.x - layout.spawn.x, p.z - layout.spawn.z) < 0.15
    ) {
      exit.current = false;
      useGame.getState().leaveInterior();
    }
  });
  return (
    <>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[(layout.minX+layout.maxX)/2,.035,(layout.minZ+layout.maxZ)/2]}
        onClick={(e) => {
          e.stopPropagation();
          if(e.delta>8)return;
          const p = { x: e.point.x, z: e.point.z };
          const editor=useIndoor.getState();
          if(id==='cottage'&&editor.arranging){if(editor.selectedFurniture){const item=useGame.getState().homeRoom.items.find(i=>i.id===editor.selectedFurniture);if(item)useGame.getState().placeHomeFurniture(item.id,p.x,p.z,item.turn);}return;}
          const route=indoorTapRoute(layout,position.current,p);
          if(route){exit.current=false;useIndoor.setState({target:route.target,direction:{x:0,z:0}});}
          else useGame.getState().speak('That spot is blocked. Tap a clear patch of floor nearby.');
        }}
      >
        <planeGeometry
          args={[
            layout.maxX - layout.minX + 1.2,
            layout.maxZ - layout.minZ + 1.2,
          ]}
        />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <IndoorDestination/>
      <group ref={ref} position={[layout.spawn.x, 0.045, layout.spawn.z]}>
        <GnomeRig hat={hat} scale={0.72} coat="#557c6b" walking={moving} />
      </group>
      <group
        position={[0, 0.045, layout.spawn.z + 0.1]}
        onClick={(e) => {
          e.stopPropagation();
          if(e.delta>8||useIndoor.getState().arranging)return;
          exit.current = true;
          useIndoor.setState({ target: { ...layout.spawn },direction:{x:0,z:0} });
        }}
      >
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1, 0.45]} />
          <meshStandardMaterial color="#9b7c4e" />
        </mesh>
        <Html
          position={[0, 0.05, 0.35]}
          center
          zIndexRange={[4, 0]}
          style={{ pointerEvents: "none" }}
        >
          <span className="whitespace-nowrap rounded-full bg-pine/90 px-2 text-[10px] text-parchment">
            Front door
          </span>
        </Html>
      </group>
    </>
  );
}

function IndoorDestination(){
 const target=useIndoor(s=>s.target),arranging=useIndoor(s=>s.arranging),ref=useRef<Group>(null);
 useFrame(({clock})=>{if(ref.current)ref.current.scale.setScalar(1+Math.sin(clock.elapsedTime*5)*.1);});
 if(!target||arranging)return null;
 return <group ref={ref} position={[target.x,.055,target.z]}><mesh rotation={[-Math.PI/2,0,0]} raycast={()=>{}}><ringGeometry args={[.15,.18,24]}/><meshBasicMaterial color="#efc567" depthWrite={false}/></mesh><mesh rotation={[0,Math.PI/4,0]} raycast={()=>{}}><boxGeometry args={[.2,.025,.035]}/><meshBasicMaterial color="#efc567"/></mesh><mesh rotation={[0,Math.PI/4,0]} raycast={()=>{}}><boxGeometry args={[.035,.025,.2]}/><meshBasicMaterial color="#efc567"/></mesh></group>;
}
