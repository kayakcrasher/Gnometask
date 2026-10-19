import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import type { Group } from "three";
import { useSound } from "@/lib/game/audio/settings";
import { unlockAudio } from "@/lib/game/juice";
/** An original little songbird box on the cottage table. */
export function CottageMusicBox() {
  const bird = useRef<Group>(null),
    sound = useSound(),
    last = useRef(sound.music || 0.45),
    playing = !sound.muted && sound.music > 0;
  const toggle = () => {
    unlockAudio();
    if (playing) {
      last.current = sound.music;
      sound.setSound({ music: 0 });
    } else sound.setSound({ muted: false, music: last.current });
  };
  useFrame(({ clock }) => {
    if (bird.current)
      bird.current.rotation.y = playing ? clock.elapsedTime * 0.35 : 0;
  });
  return (
    <group
      position={[-0.96, 0.69, -0.02]}
      onClick={(e) => {
        e.stopPropagation();
        toggle();
      }}
    >
      <mesh position={[0, 0.09, 0]} castShadow>
        <boxGeometry args={[0.32, 0.18, 0.26]} />
        <meshStandardMaterial color="#739383" />
      </mesh>
      <mesh position={[0, 0.19, -0.08]} rotation={[-0.65, 0, 0]}>
        <boxGeometry args={[0.34, 0.035, 0.25]} />
        <meshStandardMaterial color="#9ab39b" />
      </mesh>
      <mesh position={[0, 0.195, 0.025]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.09, 16]} />
        <meshStandardMaterial color="#d8b776" />
      </mesh>
      <group ref={bird} position={[0, 0.23, 0.025]}>
        <mesh position={[0, 0.055, 0]} scale={[0.06, 0.065, 0.09]}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial color="#eee1bf" />
        </mesh>
        <mesh position={[0, 0.12, 0.04]}>
          <sphereGeometry args={[0.045, 8, 6]} />
          <meshStandardMaterial color="#eee1bf" />
        </mesh>
        <mesh position={[0, 0.12, 0.085]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.018, 0.04, 5]} />
          <meshStandardMaterial color="#c49a54" />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.035, 0.13, 0.06]}>
            <sphereGeometry args={[0.008, 6, 5]} />
            <meshStandardMaterial color="#3d5146" />
          </mesh>
        ))}
      </group>
      <mesh position={[0.19, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.015, 0.015, 0.1, 6]} />
        <meshStandardMaterial color="#c6a764" />
      </mesh>
      <Html
        position={[0, 0.9, 0]}
        center
        zIndexRange={[6, 0]}
      >
        <button
          type="button"
          aria-label={
            playing ? "Pause cottage music box" : "Play cottage music box"
          }
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            toggle();
          }}
          className="min-h-11 min-w-11 rounded-full bg-parchment/95 px-2 text-xs font-bold text-pine"
        >
          {playing ? "♫" : "♪"}
        </button>
      </Html>
    </group>
  );
}
