import { FENCE_SLOTS } from "@/lib/game/data/layout";
import { useGame } from "@/lib/game/store";
import { groundY, to3 } from "@/lib/game/world3";

function Beast({ color, x, y }: { color: string; x: number; y: number }) {
  const p = to3(x, y, groundY(x, y));
  return (
    <group position={p}>
      <mesh position={[0, 0.28, 0]} castShadow>
        <boxGeometry args={[0.42, 0.28, 0.62]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.16, 0.48, 0.22]} castShadow>
        <boxGeometry args={[0.16, 0.16, 0.18]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-0.12, 0.08, 0.18]}>
        <boxGeometry args={[0.06, 0.16, 0.06]} />
        <meshStandardMaterial color="#5b4230" />
      </mesh>
      <mesh position={[0.12, 0.08, 0.18]}>
        <boxGeometry args={[0.06, 0.16, 0.06]} />
        <meshStandardMaterial color="#5b4230" />
      </mesh>
    </group>
  );
}

export function YardLife() {
  const placed = useGame((s) => s.placed);
  const herd = useGame((s) => s.herd);
  const lift = useGame((s) => s.liftFence);
  const fences = placed.filter((p) => p.slotId.startsWith("f"));
  const animals: { key: string; color: string; x: number; y: number }[] = [];
  for (let i = 0; i < herd.cows; i++) animals.push({ key: `c${i}`, color: "#f2efe6", x: 300 + i * 28, y: 820 });
  for (let i = 0; i < herd.goats; i++) animals.push({ key: `g${i}`, color: "#d8d0c4", x: 300 + i * 22, y: 860 });
  for (let i = 0; i < herd.sheep; i++) animals.push({ key: `s${i}`, color: "#f7f4ee", x: 420 + i * 24, y: 830 });
  for (let i = 0; i < herd.calves; i++) animals.push({ key: `k${i}`, color: "#e7d7b8", x: 340 + i * 18, y: 890 });
  return (
    <group>
      {fences.map((f) => {
        const slot = FENCE_SLOTS.find((s) => s.id === f.slotId);
        if (!slot) return null;
        const p = to3(slot.x, slot.y, groundY(slot.x, slot.y));
        return (
          <group
            key={f.slotId}
            position={p}
            onClick={(e) => {
              e.stopPropagation();
              lift(f.slotId);
            }}
          >
            <mesh position={[-0.28, 0.28, 0]} castShadow>
              <boxGeometry args={[0.06, 0.55, 0.06]} />
              <meshStandardMaterial color="#6b4423" />
            </mesh>
            <mesh position={[0.28, 0.28, 0]} castShadow>
              <boxGeometry args={[0.06, 0.55, 0.06]} />
              <meshStandardMaterial color="#6b4423" />
            </mesh>
            <mesh position={[0, 0.38, 0]}>
              <boxGeometry args={[0.62, 0.05, 0.04]} />
              <meshStandardMaterial color="#c4894a" />
            </mesh>
            <mesh position={[0, 0.22, 0]}>
              <boxGeometry args={[0.62, 0.05, 0.04]} />
              <meshStandardMaterial color="#c4894a" />
            </mesh>
          </group>
        );
      })}
      {herd.coop > 0 ? (
        <group position={to3(280, 800, groundY(280, 800))}>
          <mesh position={[0, 0.35, 0]} castShadow>
            <boxGeometry args={[0.9, 0.7, 0.7]} />
            <meshStandardMaterial color="#efe4cf" />
          </mesh>
          <mesh position={[0, 0.78, 0]} castShadow>
            <boxGeometry args={[1.05, 0.12, 0.85]} />
            <meshStandardMaterial color={herd.coop > 2 ? "#a33b32" : "#8a5a32"} />
          </mesh>
        </group>
      ) : null}
      {animals.map((a) => (
        <Beast key={a.key} color={a.color} x={a.x} y={a.y} />
      ))}
    </group>
  );
}
