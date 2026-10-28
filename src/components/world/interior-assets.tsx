import {TreasureShelf} from "./discovery-wrecks";
import {neighbourProfile} from "@/lib/game/neighbours";
import { AdaptiveResolution, useCanvasDpr, MOBILE_GRAPHICS } from "./mobile-graphics";
import { CottageMusicBox } from "./music-box";
import { useGame } from "@/lib/game/store";
import { IndoorWalker, IndoorCamera } from "./indoor-walker";
import {
  useRef,
  useState,
  useEffect,
  Component,
  type ComponentProps,
  type ReactNode,
} from "react";
import { useFrame, Canvas } from "@react-three/fiber";
import { GnomeRig } from "./gnome-rig";
import type { InteriorId } from "@/lib/game/types";

class InteriorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div role="alert" className="flex h-full w-full flex-col items-center justify-center gap-3 bg-parchment p-4 text-center text-pine"><p>The room could not be drawn. Your furniture is safe.</p><button type="button" className="min-h-11 rounded-xl bg-gold px-4" onClick={()=>this.setState({failed:false})}>Try room again</button><button type="button" className="min-h-11 rounded-xl bg-pine px-4 text-parchment" onClick={()=>useGame.getState().leaveInterior()}>Leave room</button></div>
    ) : (
      this.props.children
    );
  }
}
function InteriorFirstFrame({onReady}:{onReady:()=>void}){const sent=useRef(false);useFrame(()=>{if(!sent.current){sent.current=true;onReady();}});return null;}
export function InteriorCanvas(props: ComponentProps<typeof Canvas>) {
  const dpr=useCanvasDpr();
  const [ready,setReady]=useState(false);
  const id = useGame((s) => s.interior);
  const { children, ...canvasProps } = props;
  return (
    <InteriorBoundary>
      <div className="relative isolate h-full w-full" aria-label="Walkable interior">
        <Canvas
          {...canvasProps}
          dpr={dpr}
          shadows={MOBILE_GRAPHICS ? false : canvasProps.shadows}
          gl={{ antialias: true, powerPreference: "high-performance" }}
          fallback={<div role="alert" className="flex h-full flex-col items-center justify-center gap-3 bg-parchment p-4 text-pine"><p>Room graphics could not start. Leave and try entering again.</p><button type="button" className="min-h-11 rounded-xl bg-gold px-4" onClick={()=>useGame.getState().leaveInterior()}>Leave room</button></div>}
        >
          <AdaptiveResolution />
          <InteriorFirstFrame onReady={()=>setReady(true)}/>
          {children}
          {id && id !== "chart" && (
            <>
              <IndoorCamera id={id} />
              <IndoorWalker key={id} id={id} />
            </>
          )}
        </Canvas>
        {!ready&&<p role="status" className="pointer-events-none absolute left-2 top-2 rounded-xl bg-parchment px-3 py-2 text-xs font-bold text-pine">Opening room…</p>}
      </div>
    </InteriorBoundary>
  );
}
export function RoomPlant({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.22, 0.16, 0.44, 8]} />
        <meshStandardMaterial color="#a76d51" />
      </mesh>
      {[-1, 0, 1].map((i) => (
        <mesh
          key={i}
          position={[i * 0.12, 0.65 + Math.abs(i) * 0.05, 0]}
          rotation={[0, 0, -i * 0.4]}
          scale={[0.18, 0.5, 0.16]}
        >
          <sphereGeometry args={[1, 7, 6]} />
          <meshStandardMaterial color={i ? "#61854e" : "#416c4a"} />
        </mesh>
      ))}
    </group>
  );
}
export function RoomDecor({
  theme,
}: {
  theme: "bank" | "pub" | "court" | "exchange" | "casino";
}) {
  const color =
    theme === "casino"
      ? "#dd6aa1"
      : theme === "court"
        ? "#e3c789"
        : theme === "bank"
          ? "#a6c7b3"
          : "#d8b377";
  return (
    <group>
      {[-2.7, 2.7].map((x) => (
        <group key={x} position={[x, 1.5, -2.9]}>
          <mesh>
            <boxGeometry args={[0.65, 0.95, 0.06]} />
            <meshStandardMaterial color="#a88a53" metalness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0.04]}>
            <boxGeometry args={[0.53, 0.8, 0.02]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[0, 0.3, 0.09]}>
            <sphereGeometry args={[0.14, 10, 8]} />
            <meshStandardMaterial color="#f1ddb5" />
          </mesh>
        </group>
      ))}
      {[-2.8, 2.8].map((x) => (
        <RoomPlant key={x} x={x} z={1.8} />
      ))}
      {[-1.8, 1.8].map((x) => (
        <group key={x} position={[x, 2.5, -0.8]}>
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.5, 6]} />
            <meshStandardMaterial color="#9d824e" />
          </mesh>
          <mesh>
            <coneGeometry args={[0.32, 0.24, 10, 1, true]} />
            <meshStandardMaterial color={color} side={2} />
          </mesh>
          <mesh position={[0, -0.1, 0]}>
            <sphereGeometry args={[0.09, 10, 8]} />
            <meshStandardMaterial
              color="#fff1cb"
              emissive="#f3c67b"
              emissiveIntensity={1.4}
            />
          </mesh>
        </group>
      ))}
      {theme === "exchange" && (
        <group position={[0, 2.15, -3.75]}>
          <mesh>
            <boxGeometry args={[5, 1.1, 0.1]} />
            <meshStandardMaterial color="#152b28" />
          </mesh>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <mesh
              key={i}
              position={[-2 + i * 0.57, Math.sin(i * 1.8) * 0.25, 0.06]}
            >
              <boxGeometry args={[0.35, 0.06, 0.03]} />
              <meshStandardMaterial
                color={i % 3 ? "#8dc095" : "#dba268"}
                emissive="#598867"
                emissiveIntensity={0.5}
              />
            </mesh>
          ))}
        </group>
      )}
      {theme === "pub" &&
        [-1, 0, 1].map((i) => (
          <group key={i} position={[i * 1.4, 1.2, -2.5]}>
            {[-0.3, 0, 0.3].map((x) => (
              <mesh key={x} position={[x, 0, 0]}>
                <cylinderGeometry args={[0.07, 0.09, 0.35, 8]} />
                <meshStandardMaterial color={i % 2 ? "#827244" : "#47775d"} />
              </mesh>
            ))}
          </group>
        ))}
      {theme === "bank" && (
        <group position={[2.4, 0.6, -2.8]}>
          <mesh>
            <boxGeometry args={[1.1, 1.2, 0.6]} />
            <meshStandardMaterial color="#495d61" metalness={0.6} />
          </mesh>
          <mesh position={[0, 0, 0.32]}>
            <torusGeometry args={[0.28, 0.035, 6, 16]} />
            <meshStandardMaterial color="#c3ad72" metalness={0.7} />
          </mesh>
        </group>
      )}
    </group>
  );
}
function Table({ x = 0, z = 0 }: { x?: number; z?: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[1.4, 0.12, 0.8]} />
        <meshStandardMaterial color="#986b43" />
      </mesh>
      {[-1, 1].flatMap((x) =>
        [-1, 1].map((z) => (
          <mesh key={`${x}-${z}`} position={[x * 0.55, 0.3, z * 0.26]}>
            <boxGeometry args={[0.09, 0.6, 0.09]} />
            <meshStandardMaterial color="#725337" />
          </mesh>
        )),
      )}
    </group>
  );
}
function ShopFurniture({ id }: { id: InteriorId }) {
  const cottage = id === "pappy-home" || id === "cottage" || id === "neighbor" || id === "ship-cabin",
    dock = id === "dockhouse",
    hall = id === "townhall";
  return (
    <group>
      <Table x={cottage ? -1.4 : 0} z={0.2} />
      {cottage ? (
        <>
          <group position={[2, 0, -1.3]}>
            <mesh position={[0, 0.3, 0]}>
              <boxGeometry args={[1.3, 0.4, 2]} />
              <meshStandardMaterial color="#795238" />
            </mesh>
            <mesh position={[0, 0.56, 0.2]}>
              <boxGeometry args={[1.2, 0.2, 1.5]} />
              <meshStandardMaterial color="#577c70" />
            </mesh>
            <mesh position={[0, 0.6, -0.65]}>
              <boxGeometry args={[1.1, 0.15, 0.45]} />
              <meshStandardMaterial color="#e9dcc3" />
            </mesh>
          </group>
          <group position={[-2.4, 0, -1.6]}>
            <mesh position={[0, 0.7, 0]}>
              <boxGeometry args={[1.1, 1.4, 0.7]} />
              <meshStandardMaterial color="#a7947e" />
            </mesh>
            <mesh position={[0, 0.4, 0.37]}>
              <boxGeometry args={[0.7, 0.65, 0.03]} />
              <meshStandardMaterial color="#36291f" />
            </mesh>
            <mesh position={[0, 0.4, 0.4]}>
              <coneGeometry args={[0.18, 0.45, 6]} />
              <meshStandardMaterial
                color="#edac51"
                emissive="#e58b34"
                emissiveIntensity={0.8}
              />
            </mesh>
          </group>
          <mesh position={[-1.4, 0.76, 0.2]}>
            <cylinderGeometry args={[0.14, 0.2, 0.2, 12]} />
            <meshStandardMaterial color="#c7d4bc" />
          </mesh>
        </>
      ) : (
        <>
          <mesh position={[0, 0.6, -1.3]}>
            <boxGeometry args={[5, 1.2, 0.8]} />
            <meshStandardMaterial
              color={dock ? "#476d79" : hall ? "#73896a" : "#a47d50"}
            />
          </mesh>
          {[-2, 0, 2].map((x) => (
            <group key={x} position={[x, 1.7, -2.45]}>
              <mesh>
                <boxGeometry args={[1.3, 1.15, 0.3]} />
                <meshStandardMaterial color="#755437" />
              </mesh>
              {[-0.35, 0, 0.35].map((a, i) => (
                <mesh key={a} position={[a, 0, 0.2]}>
                  <boxGeometry args={[0.22, 0.75, 0.2]} />
                  <meshStandardMaterial
                    color={["#c0ac6e", "#66847d", "#a55b53"][i]}
                  />
                </mesh>
              ))}
            </group>
          ))}
          <group position={[0, 0.25, -2.1]}>
            <GnomeRig
              hat={
                id === "hatshop"
                  ? "hat-flower"
                  : id === "armory"
                    ? "hat-guard"
                    : "hat-straw"
              }
              scale={0.85}
              coat="#4d6350"
            />
          </group>
          {id === "hatshop" &&
            [-2, -1, 0, 1, 2].map((x, i) => (
              <group key={x} position={[x, 1.35, -1.2]}>
                <mesh>
                  <cylinderGeometry args={[0.22, 0.35, 0.42, 8]} />
                  <meshStandardMaterial
                    color={["#a64d63", "#567351", "#b89952"][i % 3]}
                  />
                </mesh>
              </group>
            ))}
          {(id === "armory" || id === "haven-shop" || id === "watch") &&
            [-2, -1, 0, 1, 2].map((x) => (
              <group key={x} position={[x, 1.7, -2.2]} rotation={[0, 0, 0.15]}>
                <mesh>
                  <boxGeometry args={[0.08, 0.9, 0.08]} />
                  <meshStandardMaterial color="#d2d6cf" metalness={0.7} />
                </mesh>
                <mesh position={[0, -0.3, 0]}>
                  <boxGeometry args={[0.35, 0.07, 0.1]} />
                  <meshStandardMaterial color="#d0ac59" />
                </mesh>
              </group>
            ))}
          {id === "bakery" &&
            [-1.8, -0.9, 0, 0.9, 1.8].map((x) => (
              <mesh
                key={x}
                position={[x, 1.3, -1.25]}
                scale={[0.35, 0.16, 0.2]}
              >
                <sphereGeometry args={[1, 10, 8]} />
                <meshStandardMaterial color="#d6a25d" />
              </mesh>
            ))}
          {(id === "general" || dock) &&
            [-2.4, 2.4].map((x) => (
              <mesh key={x} position={[x, 0.3, 0.6]}>
                <boxGeometry args={[0.7, 0.6, 0.7]} />
                <meshStandardMaterial color="#9a7854" />
              </mesh>
            ))}
          {dock && (
            <group position={[-1.8, 1.35, -1.25]}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.24, 0.055, 6, 16]} />
                <meshStandardMaterial color="#cabb90" />
              </mesh>
            </group>
          )}
          {hall && (
            <mesh position={[2, 1.9, -2.2]}>
              <boxGeometry args={[0.8, 0.65, 0.35]} />
              <meshStandardMaterial
                color="#77a8b1"
                transparent
                opacity={0.65}
              />
            </mesh>
          )}
        </>
      )}
    </group>
  );
}
function CozyTouches() {
  const steam = useRef<import("three").Group>(null);
  useFrame(({ clock }) => {
    steam.current?.children.forEach((p, i) => {
      const phase = (clock.elapsedTime * 0.22 + i * 0.33) % 1;
      p.position.y = 0.88 + phase * 0.45;
      p.position.x = -1.4 + Math.sin(phase * 6 + i) * 0.045;
      p.scale.setScalar(0.025 + phase * 0.025);
    });
  });
  return (
    <group>
      <CottageMusicBox />
      <pointLight
        position={[-2.3, 1, -1.3]}
        intensity={1.8}
        color="#ffd29b"
        distance={5}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.2, 0.013, 1.1]}>
        <circleGeometry args={[0.85, 24]} />
        <meshStandardMaterial color="#7c9b81" />
      </mesh>
      <mesh position={[-1.7, 0.69, 0.18]} rotation={[0, 0.2, 0]}>
        <boxGeometry args={[0.35, 0.06, 0.27]} />
        <meshStandardMaterial color="#ad6c57" />
      </mesh>
      <mesh position={[-1.7, 0.725, 0.18]} rotation={[0, 0.2, 0]}>
        <boxGeometry args={[0.29, 0.008, 0.22]} />
        <meshStandardMaterial color="#e5d6ad" />
      </mesh>
      <group ref={steam}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[-1.4, 0.9 + i * 0.1, 0.2]}>
            <sphereGeometry args={[1, 6, 5]} />
            <meshStandardMaterial color="#f5ecda" transparent opacity={0.3} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
export function InteriorPreview({ id }: { id: InteriorId }) {
  const cabinCrew=useGame(s=>s.afloat?s.shipLife.crew[s.afloat]:undefined);
  const host=useGame(s=>s.visitingNeighbour),profile=neighbourProfile(host??"nim");
  const phase=useGame(s=>s.opening.prologue);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  return (
    <div
      className={
        expanded
          ? "fixed inset-0 z-[70] bg-[#776452] pb-16"
          : "relative mb-3 h-64 w-full shrink-0 overflow-hidden rounded-2xl sm:h-72"
      }
      aria-label={`${id} interior preview`}
    >
      <InteriorCanvas camera={{ position: [5.2, 4.4, 6.2], fov: 45 }}>
        <color
          attach="background"
          args={[id === "dockhouse" ? "#52777e" : "#776452"]}
        />
        <ambientLight intensity={id==='pappy-home'&&phase==='evening'?.8:1.5} />
        <directionalLight position={[2, 6, 5]} intensity={2} />
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[7, 6]} />
          <meshStandardMaterial
            color={id === "townhall" ? "#c5c2a8" : "#aa8b60"}
          />
        </mesh>
        {Array.from({ length: 15 }, (_, i) => (
          <mesh key={i} position={[-3.4 + i * 0.48, 0.005, 0]}>
            <boxGeometry args={[0.014, 0.012, 6]} />
            <meshStandardMaterial color="#8b7252" />
          </mesh>
        ))}
        <mesh position={[0, 1.4, -2.7]}>
          <boxGeometry args={[7, 2.8, 0.12]} />
          <meshStandardMaterial color="#d8ccb0" />
        </mesh>
        <mesh position={[-3.4, 1.4, 0]}>
          <boxGeometry args={[0.12, 2.8, 5.4]} />
          <meshStandardMaterial color="#baac8c" />
        </mesh>
        <mesh position={[-3.31, 1.8, 0.5]}>
          <boxGeometry args={[0.04, 1, 1.1]} />
          <meshStandardMaterial
            color="#94b5b7"
            emissive="#698b98"
            emissiveIntensity={0.2}
          />
        </mesh>
        <RoomPlant x={2.6} z={1.8} />
        <ShopFurniture id={id} />
        {id === "ship-cabin"&&<><mesh position={[-1.4,.78,.2]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[.9,.6]}/><meshStandardMaterial color="#e4d5a9"/></mesh>{[-1,1].map(v=><mesh key={v} position={[v*1.7,1.75,-2.6]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.35,.35,.06,16]}/><meshStandardMaterial color="#79acb5" emissive="#61969d" emissiveIntensity={.15}/></mesh>)}{(cabinCrew??[]).slice(0,3).map((role,i)=><group key={role} position={[-.8+i*.8,0,-1.8]}><GnomeRig hat="hat-night" coat={role==='navigator'?'#4b7188':role==='cook'?'#e4d3aa':'#799469'} scale={.8} beard/></group>)}</>}
        {id === "cottage" && <><CozyTouches/><TreasureShelf/></>}
        {id === "pappy-home"&&<><CozyTouches/><group position={[0,0,-1.5]}><GnomeRig elder hat="hat-straw" coat="#8a6238" beard gesture="wave"/></group><mesh position={[0,.018,1]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[.9,24]}/><meshStandardMaterial color="#aa9172"/></mesh><mesh position={[1.3,1.8,-2.6]}><boxGeometry args={[1.1,.9,.04]}/><meshStandardMaterial color={phase==='evening'?'#334e68':'#b7d3bb'} emissive={phase==='evening'?'#182e49':'#a1b798'} emissiveIntensity={.25}/></mesh></>}
        {id === "neighbor"&&<><group position={[0,0,-1.5]}><GnomeRig hat="hat-moss" coat={profile.coat} beard gesture="wave"/></group><mesh position={[-.3,.018,.5]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[1.1,1.7]}/><meshStandardMaterial color={profile.coat}/></mesh><mesh position={[-3.28,1.8,-1.1]}><boxGeometry args={[.05,.7,.8]}/><meshStandardMaterial color={profile.coat}/></mesh></>}
      </InteriorCanvas>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="absolute right-2 top-2 z-20 min-h-11 rounded-xl bg-parchment px-3 text-xs font-bold text-ink"
      >
        {expanded ? (id==="pappy-home"?"Talk to Pappy":"Back to room services") : "Explore room"}
      </button>
      {expanded && (
        <p className="absolute bottom-3 inset-x-2 text-center text-sm font-bold text-parchment">
          Tap the floor to walk · tap the front door to leave
        </p>
      )}
    </div>
  );
}
