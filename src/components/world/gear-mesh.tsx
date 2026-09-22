import { TIER_META, tierOf, type GearTier } from "@/lib/game/data/tiers";

function metal(id: string | null | undefined): GearTier {
  return tierOf(id) ?? "wood";
}

export function SwordMesh({ id, striking }: { id: string | null; striking?: boolean }) {
  const t = TIER_META[metal(id)];
  return (
    <group rotation={[0, 0, striking ? -0.9 : -0.25]} position={[0.22, 0.55, 0.12]}>
      <mesh position={[0, 0.12, 0]} castShadow>
        <boxGeometry args={[0.05, 0.28, 0.05]} />
        <meshStandardMaterial color="#5b4230" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.28, 0]} castShadow>
        <boxGeometry args={[0.16, 0.04, 0.06]} />
        <meshStandardMaterial color={t.dark} metalness={0.65} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[0.07, 0.52, 0.02]} />
        <meshStandardMaterial color={t.metal} metalness={0.75} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.8, 0]} castShadow>
        <boxGeometry args={[0.04, 0.08, 0.018]} />
        <meshStandardMaterial color={t.edge} metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

export function HatchetMesh({ id, striking }: { id: string | null; striking?: boolean }) {
  const t = TIER_META[metal(id)];
  return (
    <group rotation={[0, 0, striking ? -1.1 : -0.4]} position={[0.2, 0.5, 0.1]}>
      <mesh position={[0, 0.28, 0]} castShadow>
        <boxGeometry args={[0.045, 0.55, 0.045]} />
        <meshStandardMaterial color="#5b4230" roughness={0.85} />
      </mesh>
      <mesh position={[0.08, 0.52, 0]} rotation={[0, 0, 0.2]} castShadow>
        <boxGeometry args={[0.22, 0.12, 0.04]} />
        <meshStandardMaterial color={t.metal} metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}

export function ShieldMesh({ id }: { id: string | null }) {
  const t = TIER_META[metal(id)];
  return (
    <group position={[-0.28, 0.55, 0.08]} rotation={[0.2, 0.4, 0.1]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.18, 0.2, 0.04, 8]} />
        <meshStandardMaterial color={t.metal} metalness={0.55} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.02, 0.01]}>
        <cylinderGeometry args={[0.07, 0.07, 0.045, 8]} />
        <meshStandardMaterial color={t.edge} metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}

export function ArmorTint({ id }: { id: string | null }) {
  const t = TIER_META[metal(id) ?? "wood"];
  if (!id) return null;
  return (
    <mesh position={[0, 0.42, 0.02]} castShadow>
      <capsuleGeometry args={[0.2, 0.22, 4, 8]} />
      <meshStandardMaterial color={t.metal} metalness={0.55} roughness={0.45} transparent opacity={0.85} />
    </mesh>
  );
}

export function WeaponInHand({
  weaponId,
  striking,
}: {
  weaponId: string | null;
  striking?: boolean;
}) {
  if (weaponId?.startsWith("hatchet-")) return <HatchetMesh id={weaponId} striking={striking} />;
  return <SwordMesh id={weaponId} striking={striking} />;
}
