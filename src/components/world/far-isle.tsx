import { Canvas } from "@react-three/fiber";
import { FAR_ISLES, GOODS } from "@/lib/game/data/trade";
import { useGame } from "@/lib/game/store";

export function FarIsle() {
  const abroad = useGame((s) => s.abroad);
  const leave = useGame((s) => s.leaveIsle);
  const goods = useGame((s) => s.goods);
  const sell = useGame((s) => s.sellGood);
  const isle = FAR_ISLES.find((i) => i.id === abroad);
  if (!isle) return null;
  return (
    <div className="absolute inset-0 z-30 bg-[#143e4c]">
      <Canvas camera={{ position: [4, 5, 7], fov: 42 }}>
        <color attach="background" args={["#8ecfc6"]} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[4, 8, 2]} intensity={1.1} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
          <circleGeometry args={[3.2, 24]} />
          <meshStandardMaterial color="#e7d7a2" />
        </mesh>
        <mesh position={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[1.1, 0.8, 0.9]} />
          <meshStandardMaterial color="#efe4cf" />
        </mesh>
        <mesh position={[0, 0.95, 0]}>
          <boxGeometry args={[1.3, 0.12, 1.1]} />
          <meshStandardMaterial color="#a33b32" />
        </mesh>
      </Canvas>
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-2 bg-parchment/95 p-4">
        <p className="font-display text-lg font-semibold text-ink">{isle.name}</p>
        <p className="text-sm font-semibold text-bark/70">{isle.blurb}</p>
        {isle.id === "salt" ? (
          <div className="flex flex-col gap-1">
            {GOODS.filter((g) => (goods[g.id] ?? 0) > 0).map((g) => (
              <button key={g.id} type="button" onClick={() => sell(g.id)} className="rounded-full bg-gold px-3 py-1 text-left text-xs font-semibold text-ink">
                Sell {g.name} × {goods[g.id]} · {g.price + Math.ceil(g.price * 0.2)}
              </button>
            ))}
          </div>
        ) : null}
        <button type="button" onClick={leave} className="h-11 rounded-[14px] bg-pine font-display text-sm font-semibold text-parchment">
          Chart home
        </button>
      </div>
    </div>
  );
}
