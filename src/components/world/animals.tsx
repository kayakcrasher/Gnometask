import type { GameSave } from "@/lib/game/types";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { to3, groundY } from "@/lib/game/world3";
import { useGame } from "@/lib/game/store";
import {
  ANIMAL_TRAITS,
  wildlifeHome,
  wildlifeGoal,
  wildlifeSegment,
  wildlifeSafe,
  type AnimalKind,
} from "@/lib/game/wildlife";
import { AnimalModel } from "./animal-model";
import type { NpcObstacle } from "@/lib/game/npc-brain";
let cachedEstate: GameSave["estate"] | null = null,
  cachedBuildings: GameSave["city"]["buildings"] | null = null,
  cachedPlots: GameSave["civic"]["plots"] | null = null,
  cachedObstacles: NpcObstacle[] = [];
function animalObstacles(s: GameSave) {
  if (
    s.estate !== cachedEstate ||
    s.city.buildings !== cachedBuildings ||
    s.civic.plots !== cachedPlots
  ) {
    cachedEstate = s.estate;
    cachedBuildings = s.city.buildings;
    cachedPlots = s.civic.plots;
    cachedObstacles = [
      ...Object.values(s.estate),
      ...s.city.buildings,
      ...s.civic.plots.filter((p) => p.stories > 0),
    ].map((b) => ({ ...b, w: 27, h: 25 }));
  }
  return cachedObstacles;
}
function Animal({
  kind,
  x,
  y,
  onClick,
}: {
  kind: AnimalKind;
  x: number;
  y: number;
  onClick?: () => void;
}) {
  const root = useRef<Group>(null),
    model = useRef<Group>(null),
    current = useRef({ x, y }),
    goal = useRef({ x, y }),
    home = useRef({ x, y }),
    seed = useRef(Math.abs(Math.floor(x * 3 + y * 7))),
    wait = useRef(1 + (seed.current % 5)),
    check = useRef(0),
    time = useRef(0),
    moving = useRef(false),
    origin = useRef({ x, y }),
    valid = useRef(false);
  useFrame((_, delta) => {
    if (!root.current || !model.current) return;
    const s = useGame.getState(),
      dt = Math.min(delta, 0.06);
    time.current += dt;
    const obstacles = animalObstacles(s);
    check.current -= dt;
    if (
      check.current <= 0 ||
      origin.current.x !== x ||
      origin.current.y !== y
    ) {
      check.current = 0.7;
      origin.current = { x, y };
      const next = wildlifeHome(kind, x, y, obstacles);
      valid.current = !!next;
      if (!next) {
        root.current.visible = false;
        return;
      }
      home.current = next;
      if (
        !wildlifeSafe(kind, current.current.x, current.current.y, obstacles) ||
        Math.hypot(current.current.x - next.x, current.current.y - next.y) >
          ANIMAL_TRAITS[kind].radius * 2
      ) {
        current.current = { ...next };
        goal.current = { ...next };
      }
      if (!wildlifeSegment(kind, current.current, goal.current, obstacles))
        goal.current = { ...current.current };
    }
    root.current.visible = valid.current;
    if (!valid.current) return;
    const p = current.current,
      near = Math.hypot(p.x - s.gnomeX, p.y - s.gnomeY) < 28,
      paused = !!s.interior || s.atHome || !!s.combat || !!s.abroad;
    moving.current = false;
    if (!paused) {
      wait.current -= dt;
      if (wait.current <= 0) {
        goal.current = wildlifeGoal(
          kind,
          home.current,
          p,
          seed.current++,
          obstacles,
        );
        wait.current = 4 + (seed.current % 7);
      }
      const dx = goal.current.x - p.x,
        dy = goal.current.y - p.y,
        distance = Math.hypot(dx, dy);
      if (distance > 1 && !near) {
        const step = Math.min(distance, ANIMAL_TRAITS[kind].speed * dt),
          q = {
            x: p.x + (dx / distance) * step,
            y: p.y + (dy / distance) * step,
          };
        if (wildlifeSegment(kind, p, q, obstacles)) {
          Object.assign(p, q);
          moving.current = true;
          root.current.rotation.y = Math.atan2(dx, dy);
        } else {
          goal.current = { ...p };
          wait.current = 1;
        }
      }
      if (near && kind !== "duck")
        root.current.rotation.y = Math.atan2(s.gnomeX - p.x, s.gnomeY - p.y);
    }
    const ground = kind === "duck" ? -0.02 : groundY(p.x, p.y),
      hop =
        moving.current && (kind === "rabbit" || kind === "frog")
          ? Math.max(0, Math.sin(time.current * 9)) * 0.12
          : 0;
    root.current.position.set(...to3(p.x, p.y, ground + hop));
    const legs = model.current.getObjectByName("animal-legs");
    legs?.children.forEach((leg, i) => {
      leg.rotation.x = moving.current
        ? Math.sin(time.current * 9 + (i % 2) * Math.PI) * 0.42
        : 0;
    });
    const head = model.current.getObjectByName("animal-head");
    if (head)
      head.rotation.x =
        !moving.current &&
        !near &&
        (kind === "chicken" || kind === "sheep" || kind === "deer")
          ? 0.18 + Math.sin(time.current * 2) * 0.18
          : 0;
    const tail = model.current.getObjectByName("animal-tail");
    if (tail) tail.rotation.y = Math.sin(time.current * 2) * 0.2;
  });
  return (
    <group
      ref={root}
      position={to3(x, y, groundY(x, y))}
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick();
        else useGame.getState().speak(ANIMAL_TRAITS[kind].line);
      }}
    >
      <group ref={model}>
        <AnimalModel kind={kind} />
      </group>
    </group>
  );
}
export const Chicken3 = ({
  x,
  y,
  onClick,
}: {
  x: number;
  y: number;
  onClick?: () => void;
}) => <Animal kind="chicken" x={x} y={y} onClick={onClick} />;
export const Rabbit = ({ x, y }: { x: number; y: number }) => (
  <Animal kind="rabbit" x={x} y={y} />
);
export const Duck = ({ x, y }: { x: number; y: number }) => (
  <Animal kind="duck" x={x} y={y} />
);
export const Sheep = ({ x, y }: { x: number; y: number }) => (
  <Animal kind="sheep" x={x} y={y} />
);
export const Cat = ({ x, y }: { x: number; y: number }) => (
  <Animal kind="cat" x={x} y={y} />
);
export const Fox = ({ x, y }: { x: number; y: number }) => (
  <Animal kind="fox" x={x} y={y} />
);
export const Deer = ({ x, y }: { x: number; y: number }) => (
  <Animal kind="deer" x={x} y={y} />
);
export const Frog = ({ x, y }: { x: number; y: number }) => (
  <Animal kind="frog" x={x} y={y} />
);
export const Hedgehog = ({ x, y }: { x: number; y: number }) => (
  <Animal kind="hedgehog" x={x} y={y} />
);
export function IslandAnimals({
  chicken,
  onChicken,
}: {
  chicken: { x: number; y: number } | null;
  onChicken: () => void;
}) {
  return (
    <group>
      {chicken && <Chicken3 x={chicken.x} y={chicken.y} onClick={onChicken} />}
      <Rabbit x={280} y={700} />
      <Rabbit x={520} y={760} />
      <Duck x={500} y={190} />
      <Duck x={540} y={210} />
      <Sheep x={1180} y={620} />
      <Sheep x={1280} y={680} />
      <Cat x={820} y={520} />
      <Cat x={940} y={500} />
      <Fox x={220} y={300} />
      <Deer x={1620} y={460} />
      <Deer x={1740} y={560} />
      <Frog x={430} y={280} />
      <Frog x={610} y={280} />
      <Hedgehog x={1040} y={700} />
      <Rabbit x={700} y={920} />
    </group>
  );
}
