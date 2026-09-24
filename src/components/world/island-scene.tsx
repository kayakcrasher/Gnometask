import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import {
  Component,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type MutableRefObject,
  type ReactNode,
} from "react";
import * as THREE from "three";
import { Terrain } from "./terrain";
import { Cottage3, Town3, VillageHouses } from "./town";
import { Harbor3 } from "./boats";
import { CastLine, OceanLife, ShoreLife } from "./ocean";
import { Sky } from "./sky";
import { YardPlots } from "./yard";
import { YardLife } from "./yard-life";
import { PLACE_ANCHORS } from "@/lib/game/data/layout";
import { GnomeRig } from "./gnome-rig";
import { IslandAnimals } from "./animals";
import { EastHills, Fights3, Landing3, LootFlash3, Npcs3, Rocks3, Towers3, Trees3 } from "./world-life";
import { MountNoble, Sunstep } from "./desert";
import { Kenney } from "./kenney";
import { groundY, nearestPlace, onIsland, to3 } from "@/lib/game/world3";
import { useGame } from "@/lib/game/store";
import { NPCS } from "@/lib/game/world";
import { TREE_SPOTS } from "@/lib/game/data/trees";
import { heartLine } from "@/lib/game/data/folk";
import { dist } from "@/components/land/map-data";
import { Minimap } from "@/components/hud/minimap";
import type { GamePopup, InteriorId } from "@/lib/game/types";
import type { NpcPose } from "@/hooks/use-npc-wander";

type WalkTo = (x: number, y: number, arrive?: () => void) => void;
type Cam = { yaw: number; pitch: number; dist: number };

function ClickMarker({ x, y }: { x: number; y: number }) {
  const p = to3(x, y, groundY(x, y) + 0.08);
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 2;
  });
  return (
    <group ref={ref} position={p}>
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.42, 0.05, 0.07]} />
        <meshBasicMaterial color="#d6a84c" />
      </mesh>
      <mesh rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[0.42, 0.05, 0.07]} />
        <meshBasicMaterial color="#d6a84c" />
      </mesh>
    </group>
  );
}

function CameraRig({
  target,
  camRef,
}: {
  target: { x: number; y: number };
  camRef: { current: Cam };
}) {
  const { camera } = useThree();
  const desired = useRef(new THREE.Vector3());
  useFrame((_, dt) => {
    const d = Math.min(dt, 0.1);
    const { yaw, pitch, dist: distCam } = camRef.current;
    const p = to3(target.x, target.y, groundY(target.x, target.y) + 0.85);
    const fx = Math.sin(yaw) * Math.cos(pitch);
    const fy = Math.sin(pitch);
    const fz = Math.cos(yaw) * Math.cos(pitch);
    desired.current.set(p[0] + fx * distCam, p[1] + fy * distCam, p[2] + fz * distCam);
    camera.position.lerp(desired.current, 1 - Math.exp(-5 * d));
    camera.lookAt(p[0], p[1] + 0.35, p[2]);
  });
  return null;
}

function SceneBody({
  pos,
  yaw,
  walking,
  marker,
  walkTo,
  npcPoses,
  camRef,
  onWalk,
}: {
  pos: { x: number; y: number };
  yaw: number;
  walking: boolean;
  marker: { x: number; y: number } | null;
  walkTo: WalkTo;
  npcPoses: Record<string, NpcPose>;
  camRef: { current: Cam };
  onWalk: (x: number, y: number) => void;
}) {
  const save = useGame();
  const striking = Boolean(save.combat?.striking);
  const fighting = save.combat && save.combat.phase !== "won" && save.combat.phase !== "lost";
  const face = fighting ? Math.atan2(save.combat!.atX - pos.x, save.combat!.atY - pos.y) : yaw;
  const villageCount = save.placed.filter((p) => p.slotId.startsWith("v")).length;
  const p3 = to3(pos.x, pos.y, groundY(pos.x, pos.y));

  const interact = (worldX: number, worldY: number, popup: GamePopup, range = 70) => {
    if (save.combat && save.combat.phase !== "won" && save.combat.phase !== "lost") return;
    save.selectPlace(popup.place ?? nearestPlace(worldX, worldY));
    save.openPopup({ ...popup, x: worldX, y: worldY });
    if (dist(pos.x, pos.y, worldX, worldY) >= range) walkTo(worldX, worldY);
  };

  const goInside = (x: number, y: number, interior: InteriorId) => {
    if (save.combat && save.combat.phase !== "won" && save.combat.phase !== "lost") return;
    save.closePopup();
    const run = () => save.enterInterior(interior);
    if (dist(pos.x, pos.y, x, y) < 78) run();
    else walkTo(x, y, run);
  };

  return (
    <>
      <CameraRig target={pos} camRef={camRef} />
      <Sky />
      <hemisphereLight args={["#cfe4c8", "#6b5340", 0.85]} />
      <directionalLight
        position={[30, 40, 18]}
        intensity={1.15}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={90}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={32}
        shadow-camera-bottom={-32}
      />
      <Terrain onWalk={onWalk} />
      <OceanLife />
      <ShoreLife />
      <CastLine />
      <Cottage3
        upgrades={save.houseUpgrades}
        onEnter={() => goInside(PLACE_ANCHORS.cottage.x, PLACE_ANCHORS.cottage.y, "cottage")}
      />
      <YardPlots
        onPlot={(id, x, y, popup) =>
          interact(x, y, {
            kind: "plot",
            hotspotId: id,
            title: popup.title,
            blurb: popup.blurb,
            place: "garden",
          })
        }
      />
      <YardLife />
      <Town3 hallLevel={save.townHallLevel} onEnter={(id, x, y) => goInside(x, y, id)} />
      <VillageHouses
        count={villageCount}
        onClick={(x, y) =>
          interact(x, y, {
            kind: "building",
            hotspotId: "village",
            title: "The Village",
            blurb: "Quaint rowhouses. Place a neighbour and the lane gets longer.",
            place: "village",
            building: "village",
          })
        }
      />
      <Harbor3
        onBoat={(id, x, y, title, blurb) =>
          interact(x, y, {
            kind: "boat",
            hotspotId: id,
            title,
            blurb: `${blurb} Wim sells the bigger hulls in the dockhouse.`,
            place: "dock",
          })
        }
        onCaptain={() =>
          interact(90, 470, {
            kind: "npc",
            hotspotId: "captain",
            title: "Captain Moth",
            blurb: "Round, red, and smiling. The cutlass is not a toy. Wim sells the boats.",
            place: "dock",
          })
        }
        onHouse={() => goInside(108, 545, "dockhouse")}
      />
      <group
        position={to3(78, 560, 0.05)}
        onClick={(e) => {
          e.stopPropagation();
          interact(78, 560, {
            kind: "fish",
            hotspotId: "shore",
            title: "The shallows",
            blurb: "Sprats, perch, and the odd crab. A stick rod is enough. Bigger fish live past the boats.",
            place: "dock",
          });
        }}
      >
        <mesh position={[0, 0.02, 0]}>
          <boxGeometry args={[0.9, 0.04, 0.35]} />
          <meshStandardMaterial color="#c4894a" />
        </mesh>
        <mesh position={[0.28, 0.2, 0]} rotation={[0.4, 0, -0.5]}>
          <boxGeometry args={[0.03, 0.4, 0.03]} />
          <meshStandardMaterial color="#6b4423" />
        </mesh>
      </group>
      <group
        position={to3(-40, 400, -0.05)}
        onClick={(e) => {
          e.stopPropagation();
          interact(-40, 400, {
            kind: "fish",
            hotspotId: "sea",
            title: "Open water",
            blurb: "Cod and worse. You need a skiff or bigger, and the Fishing to match.",
            place: "dock",
          });
        }}
      >
        <mesh>
          <sphereGeometry args={[0.16, 10, 8]} />
          <meshStandardMaterial color="#e7c56a" />
        </mesh>
      </group>
      <Trees3
        onTree={(id, x, y) => {
          const spot = TREE_SPOTS.find((t) => t.id === id);
          interact(x, y, {
            kind: "tree",
            hotspotId: id,
            treeId: id,
            title: spot ? `${spot.kind[0]!.toUpperCase()}${spot.kind.slice(1)} tree` : "Tree",
            blurb: "Chop it down for logs and two saplings. A cleared spot stays gone until you plant one back.",
            place: "woods",
          });
        }}
      />
      <Rocks3 />
      <EastHills />
      <MountNoble />
      <Sunstep />
      <Npcs3
        poses={npcPoses}
        onNpc={(id, x, y) => {
          const npc = NPCS.find((n) => n.id === id);
          if (!npc) return;
          interact(x, y, {
            kind: "npc",
            hotspotId: id,
            npcId: id,
            title: npc.name,
            blurb: heartLine(id, save.daysPlayed, save.settlers, save.townHallLevel) ?? npc.lines[0] ?? "",
            place: npc.place,
            interior: npc.tradeInterior,
          });
        }}
      />
      <Fights3
        onEnemy={(popup, x, y) => interact(x, y, popup, 50)}
        onDragon={() =>
          interact(1760, 340, {
            kind: "dragon",
            hotspotId: "life-dragon",
            title: save.lifeDragon.name,
            blurb: "The ridge has opinions.",
            place: "wildlands",
          })
        }
      />
      <Landing3
        onGoblin={(id, x, y) =>
          interact(
            x,
            y,
            {
              kind: "enemy",
              hotspotId: id,
              title: "Mucktooth runt",
              blurb: `${save.landing?.tribe ?? "Mucktooth Clan"} sent their shortest. Green, loud, and on the sand.`,
              place: "dock",
              enemyId: "runt",
              packId: id,
              x,
              y,
            },
            50,
          )
        }
        onFlag={() => {
          const land = save.landing;
          if (!land || land.flagDown) return;
          interact(
            land.boatX,
            land.boatY,
            {
              kind: "flag",
              hotspotId: "muck-flag",
              title: "Mucktooth banner",
              blurb: "Their cloth on a pole. Tear it down.",
              place: "dock",
              x: land.boatX,
              y: land.boatY,
            },
            50,
          );
        }}
      />
      <LootFlash3 />
      <Towers3
        onTower={(slotId, x, y, title, blurb) =>
          interact(x, y, {
            kind: "tower",
            hotspotId: slotId,
            title,
            blurb,
            place: "dock",
          })
        }
      />
      <IslandAnimals
        chicken={save.chicken}
        onChicken={() =>
          save.chicken &&
          interact(save.chicken.x, save.chicken.y, {
            kind: "quest",
            hotspotId: "chicken",
            title: "Cluckers",
            blurb: "A round bird with opinions.",
            place: "garden",
          })
        }
      />
      <Kenney name="log_large" position={to3(70, 250, 0.08)} scale={1.0} />
      <group position={p3} rotation={[0, face, 0]}>
        <GnomeRig
          hat={save.hat}
          weapon={save.equipment.weapon}
          shield={save.equipment.shield}
          armor={save.equipment.armor}
          walking={walking}
          striking={striking}
          scale={1.15}
          beard
        />
        {save.combat && save.combat.phase !== "won" && save.combat.phase !== "lost" ? (
          <Html zIndexRange={[8, 0]} position={[0, 1.85, 0]} center distanceFactor={16} style={{ pointerEvents: "none" }}>
            <div className="w-14">
              <div className="h-1.5 overflow-hidden rounded-full bg-ink/50">
                <div
                  className="h-full bg-moss"
                  style={{ width: `${(save.combat.playerHp / Math.max(1, save.combat.playerMax)) * 100}%` }}
                />
              </div>
            </div>
          </Html>
        ) : null}
        {save.combat && save.combat.splatOnPlayer != null ? (
          <Html
            key={save.combat.shake}
            zIndexRange={[8, 0]}
            position={[0, 1.7, 0]}
            center
            distanceFactor={14}
            style={{ pointerEvents: "none" }}
          >
            <p
              className={`splat-rise font-display text-xl font-bold ${save.combat.splatOnPlayer === "miss" ? "text-sky-200" : "text-berry"}`}
            >
              {save.combat.splatOnPlayer === "miss"
                ? "0"
                : save.combat.splatOnPlayer === "heal"
                  ? "+"
                  : save.combat.splatOnPlayer}
            </p>
          </Html>
        ) : null}
      </group>
      {marker ? <ClickMarker x={marker.x} y={marker.y} /> : null}
    </>
  );
}

const DEFAULT_CAM: Cam = { yaw: -Math.PI / 2, pitch: 0.98, dist: 18 };

class CanvasGate extends Component<{ onFail: () => void; children: ReactNode }, { fail: boolean }> {
  state = { fail: false };
  static getDerivedStateFromError() {
    return { fail: true };
  }
  componentDidCatch() {
    this.props.onFail();
  }
  render() {
    return this.state.fail ? null : this.props.children;
  }
}

export function IslandCanvas({
  pos,
  yaw,
  walking,
  marker,
  walkTo,
  speedRef,
  npcPoses,
  onFail,
}: {
  pos: { x: number; y: number };
  yaw: number;
  walking: boolean;
  marker: { x: number; y: number } | null;
  walkTo: WalkTo;
  speedRef: MutableRefObject<number>;
  npcPoses: Record<string, NpcPose>;
  onFail?: () => void;
}) {
  const [ready, setReady] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const named = useGame((s) => s.named);
  const camRef = useRef<Cam>({ ...DEFAULT_CAM });
  const drag = useRef<{ x: number; y: number; yaw: number; pitch: number; pointer: number } | null>(null);
  const dragged = useRef(false);
  const compassNeedle = useRef<HTMLDivElement | null>(null);
  const failRef = useRef(onFail);
  failRef.current = onFail;

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    const probe = {
      getYaw: () => camRef.current.yaw,
      getSpeed: () => speedRef.current,
      setKeys: (_codes: string[]) => {
        /* point-and-click only — no keyboard walk */
      },
    };
    (window as Window & { __controlsTest?: typeof probe }).__controlsTest = probe;
  }, [speedRef]);

  const syncCompass = () => {
    const el = compassNeedle.current;
    if (el) el.style.transform = `rotate(${(camRef.current.yaw * 180) / Math.PI}deg)`;
  };

  const onPointerDown = (e: ReactPointerEvent) => {
    const touch = e.pointerType === "touch";
    if (e.button === 1 || e.button === 2 || touch) {
      drag.current = {
        x: e.clientX,
        y: e.clientY,
        yaw: camRef.current.yaw,
        pitch: camRef.current.pitch,
        pointer: e.pointerId,
      };
      dragged.current = false;
    } else if (e.button === 0) {
      drag.current = {
        x: e.clientX,
        y: e.clientY,
        yaw: camRef.current.yaw,
        pitch: camRef.current.pitch,
        pointer: e.pointerId,
      };
      dragged.current = false;
    }
  };
  const onPointerMove = (e: ReactPointerEvent) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    if (Math.hypot(dx, dy) > 8) dragged.current = true;
    const touch = e.pointerType === "touch";
    const rotate = touch || e.buttons === 2 || e.buttons === 4 || (e.buttons === 1 && dragged.current);
    if (!rotate) return;
    camRef.current.yaw = drag.current.yaw - dx * 0.005;
    camRef.current.pitch = Math.min(1.2, Math.max(0.45, drag.current.pitch + dy * 0.004));
    syncCompass();
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  const zoom = (factor: number) => {
    camRef.current.dist = Math.min(38, Math.max(8, camRef.current.dist * factor));
  };

  const walk = (x: number, y: number) => {
    if (dragged.current) return;
    if (!onIsland(x, y)) return;
    useGame.getState().closePopup();
    walkTo(x, y);
    useGame.getState().selectPlace(nearestPlace(x, y));
  };

  if (!ready) return <div className="absolute inset-0 bg-water-deep" />;

  return (
    <div
      className="absolute inset-0 touch-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onContextMenu={(e) => e.preventDefault()}
      onWheel={(e) => {
        e.preventDefault();
        zoom(e.deltaY > 0 ? 1.08 : 1 / 1.08);
      }}
    >
      <CanvasGate onFail={() => failRef.current?.()}>
        <Canvas
          key={epoch}
          dpr={[1, 1.25]}
          camera={{ position: [-6, 16, -2], fov: 42, near: 0.1, far: 160 }}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: "default",
            preserveDrawingBuffer: true,
            failIfMajorPerformanceCaveat: false,
          }}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
          onCreated={({ gl }) => {
            gl.setClearColor("#8eb8ae", 1);
            gl.shadowMap.enabled = true;
            gl.shadowMap.type = THREE.PCFShadowMap;
            const el = gl.domElement;
            const lost = (e: Event) => {
              e.preventDefault();
              failRef.current?.();
            };
            const restored = () => setEpoch((n) => n + 1);
            el.addEventListener("webglcontextlost", lost);
            el.addEventListener("webglcontextrestored", restored);
            requestAnimationFrame(() => {
              if (el.clientWidth < 8 || el.clientHeight < 8) failRef.current?.();
            });
          }}
          onPointerMissed={() => useGame.getState().closePopup()}
        >
          <SceneBody
            pos={pos}
            yaw={yaw}
            walking={walking}
            marker={marker}
            walkTo={walkTo}
            npcPoses={npcPoses}
            camRef={camRef}
            onWalk={walk}
          />
        </Canvas>
      </CanvasGate>
      {named ? (
        <>
          <Minimap pos={pos} facingYaw={yaw} walkTo={walk} npcPoses={npcPoses} compassRef={compassNeedle} />
          <div className="pointer-events-none absolute bottom-4 right-3 z-20 flex flex-col gap-1 md:bottom-6 md:right-4">
            {[
              { label: "Zoom in", text: "+" },
              { label: "Zoom out", text: "−" },
              { label: "Reset view", text: "⌂" },
            ].map((b) => (
              <button
                key={b.label}
                type="button"
                aria-label={b.label}
                onClick={
                  b.label === "Zoom in"
                    ? () => zoom(1 / 1.18)
                    : b.label === "Zoom out"
                      ? () => zoom(1.18)
                      : () => {
                          camRef.current = { ...DEFAULT_CAM };
                          syncCompass();
                        }
                }
                className="pointer-events-auto flex size-10 items-center justify-center rounded-[12px] bg-parchment font-display text-lg font-semibold text-ink shadow-panel"
              >
                {b.text}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
