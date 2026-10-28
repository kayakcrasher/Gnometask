import {homeLayout} from "@/lib/game/home-room";
import { useEffect, useMemo, useRef, useState } from "react";
import { useIndoor } from "@/lib/game/indoor-state";
import { PerspectiveCamera } from "three";
import { useThree, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import type { Group } from "three";
import { useGame } from "@/lib/game/store";
import {
  indoorClear,
  indoorLayout,
  indoorRoute,
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
export function IndoorControls() {
  const arranging=useIndoor(s=>s.arranging);
  const room = useGame((s) => s.interior),
    special = ["bank", "pub", "court", "exchange", "casino"].includes(
      room ?? "",
    );
  const direction = (x: number, z: number) =>
    useIndoor.setState({ direction: { x, z }, target: null });
  useEffect(() => {
    const stop = () => direction(0, 0);
    window.addEventListener("pointerup", stop);
    window.addEventListener("blur", stop);
    return () => {
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("blur", stop);
    };
  }, []);
  if(arranging)return null;
  return (
    <div
      className={`pointer-events-none absolute left-2 z-20 ${special ? "top-36" : "bottom-2"}`}
    >
      <div
        className="pointer-events-auto grid grid-cols-3 gap-1 rounded-xl bg-[#18392f]/90 p-1"
        aria-label="Indoor walking controls"
      >
        {[
          [0, -1, "Walk forward"],
          [-1, 0, "Walk left"],
          [0, 1, "Walk back"],
          [1, 0, "Walk right"],
        ].map(([x, z, label], i) => (
          <button
            key={String(label)}
            type="button"
            aria-label={String(label)}
            style={i === 0 ? { gridColumn: 2 } : { gridRow: 2, gridColumn: i }}
            className="h-11 w-11 touch-none rounded-lg bg-parchment text-lg font-bold text-ink"
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              direction(Number(x), Number(z));
            }}
            onPointerUp={() => direction(0, 0)}
            onPointerCancel={() => direction(0, 0)}
          >
            {["↑", "←", "↓", "→"][i]}
          </button>
        ))}
      </div>
    </div>
  );
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
      blur = () => keys.current.clear();
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
    if (!ref.current) return;
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
      path.current = state.target
        ? (indoorRoute(layout, p, state.target) ?? [])
        : [];
    }
    if(path.current.length&&!indoorSegment(layout,p,path.current[0]!))path.current=[];
    const speed = 2 * Math.min(dt, 0.05);
    let walked = false;
    if (dx || dz) {
      path.current = [];
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
      ref.current.rotation.y = Math.atan2(x, z);
      walked = true;
    }
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
        position={[0, 0.035, 0]}
        onClick={(e) => {
          e.stopPropagation();
          const p = { x: e.point.x, z: e.point.z };
          const editor=useIndoor.getState();
          if(id==='cottage'&&editor.arranging){if(editor.selectedFurniture){const item=useGame.getState().homeRoom.items.find(i=>i.id===editor.selectedFurniture);if(item)useGame.getState().placeHomeFurniture(item.id,p.x,p.z,item.turn);}return;}
          if (indoorClear(layout, p)) {
            exit.current = false;
            useIndoor.setState({ target: p });
          }
        }}
      >
        <planeGeometry
          args={[
            layout.maxX - layout.minX + 0.2,
            layout.maxZ - layout.minZ + 0.6,
          ]}
        />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <group ref={ref} position={[layout.spawn.x, 0.045, layout.spawn.z]}>
        <GnomeRig hat={hat} scale={0.72} coat="#557c6b" walking={moving} />
      </group>
      <group
        position={[0, 0.045, layout.spawn.z + 0.1]}
        onClick={(e) => {
          e.stopPropagation();
          exit.current = true;
          useIndoor.setState({ target: { ...layout.spawn } });
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
