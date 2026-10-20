import { Component, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { BoatMesh } from "../world/boats";
import type { BoatId } from "@/lib/game/data/boats";
class PreviewBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <p className="p-3 text-xs">
        The boat preview needs 3D graphics. The fleet ledger is still available
        below.
      </p>
    ) : (
      this.props.children
    );
  }
}
export function BoatShowroom({
  kind,
  parts,
  guns = 0,
}: {
  kind: BoatId;
  parts: readonly string[];
  guns?: number;
}) {
  return (
    <div
      className="relative h-48 overflow-hidden rounded-2xl bg-[#273e48]"
      aria-label="Boat design preview"
    >
      <PreviewBoundary>
        <Canvas
          dpr={[1, 1.25]}
          camera={{ position: [4, 2.7, 4], fov: 42 }}
          fallback={
            <p className="p-3 text-xs text-parchment">
              Boat design preview unavailable.
            </p>
          }
        >
          <ambientLight intensity={1.4} />
          <directionalLight position={[3, 5, 2]} intensity={2.5} />
          <BoatMesh kind={kind} parts={parts} guns={guns} />
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            target={[0, 0.55, 0]}
          />
        </Canvas>
      </PreviewBoundary>
      <p className="pointer-events-none absolute bottom-1 left-2 text-[10px] text-parchment">
        Drag to turn the boat
      </p>
    </div>
  );
}
