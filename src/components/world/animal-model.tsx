import type { AnimalKind } from "@/lib/game/wildlife";
function Ball({
  p,
  s,
  c,
}: {
  p: [number, number, number];
  s: [number, number, number];
  c: string;
}) {
  return (
    <mesh position={p} scale={s} castShadow>
      <sphereGeometry args={[1, 10, 8]} />
      <meshStandardMaterial color={c} roughness={0.9} />
    </mesh>
  );
}
function Ears({
  long = false,
  color,
  inside,
}: {
  long?: boolean;
  color: string;
  inside: string;
}) {
  return (
    <>
      {[-1, 1].map((side) => (
        <group
          key={side}
          position={[side * 0.12, 0.17, 0]}
          rotation={[0, 0, side * -0.16]}
        >
          {long ? (
            <>
              <Ball p={[0, 0.17, 0]} s={[0.055, 0.24, 0.055]} c={color} />
              <Ball p={[0, 0.18, 0.043]} s={[0.026, 0.17, 0.012]} c={inside} />
            </>
          ) : (
            <>
              <mesh position={[0, 0.07, 0]}>
                <coneGeometry args={[0.09, 0.22, 4]} />
                <meshStandardMaterial color={color} />
              </mesh>
              <mesh position={[0, 0.08, 0.037]}>
                <coneGeometry args={[0.045, 0.13, 3]} />
                <meshStandardMaterial color={inside} />
              </mesh>
            </>
          )}
        </group>
      ))}
    </>
  );
}
export function AnimalModel({ kind }: { kind: AnimalKind }) {
  const bird = kind === "chicken" || kind === "duck",
    small = kind === "frog" || kind === "hedgehog",
    deer = kind === "deer",
    sheep = kind === "sheep",
    rabbit = kind === "rabbit";
  const color = {
    chicken: "#eee3ca",
    duck: "#b39a6c",
    rabbit: "#d8c6ac",
    sheep: "#e9e2d0",
    cat: "#958272",
    fox: "#c87840",
    deer: "#b88d5e",
    frog: "#69975c",
    hedgehog: "#795c48",
  }[kind];
  const bodyY = deer ? 0.62 : sheep ? 0.45 : bird ? 0.35 : small ? 0.17 : 0.3,
    headY = deer
      ? 0.92
      : sheep
        ? 0.57
        : bird
          ? 0.62
          : small
            ? 0.2
            : rabbit
              ? 0.43
              : 0.4,
    front = deer ? 0.42 : sheep ? 0.4 : bird ? 0.2 : small ? 0.2 : 0.28;
  return (
    <group>
      <Ball
        p={[0, bodyY, 0]}
        s={[
          deer ? 0.24 : sheep ? 0.32 : bird ? 0.22 : small ? 0.18 : 0.22,
          deer ? 0.3 : sheep ? 0.29 : bird ? 0.27 : small ? 0.14 : 0.2,
          deer ? 0.43 : sheep ? 0.43 : bird ? 0.31 : small ? 0.27 : 0.34,
        ]}
        c={color}
      />
      {sheep &&
        Array.from({ length: 9 }, (_, i) => (
          <Ball
            key={i}
            p={[
              Math.sin(i * 2.4) * 0.22,
              0.5 + Math.cos(i * 1.7) * 0.12,
              Math.cos(i * 2.4) * 0.31,
            ]}
            s={[0.16, 0.16, 0.17]}
            c={i % 2 ? "#e8e0cb" : "#f3ecd9"}
          />
        ))}
      <group name="animal-legs">
        {(bird
          ? [-1, 1].map((side) => [side * 0.1, 0])
          : [-1, 1].flatMap((side) =>
              [-1, 1].map((end) => [
                side * (deer ? 0.16 : 0.14),
                end * (deer ? 0.28 : 0.2),
              ]),
            )
        ).map(([x, z], i) => (
          <group key={i} position={[x!, bodyY * 0.7, z!]}>
            <mesh position={[0, -bodyY * 0.32, 0]} castShadow>
              <capsuleGeometry
                args={[deer ? 0.035 : bird ? 0.025 : 0.045, bodyY * 0.48, 3, 6]}
              />
              <meshStandardMaterial
                color={bird ? "#c99b4c" : deer || sheep ? "#625043" : color}
              />
            </mesh>
            <Ball
              p={[0, -bodyY * 0.63, 0.035]}
              s={[bird ? 0.07 : 0.06, 0.035, bird ? 0.1 : 0.09]}
              c={bird ? "#cf9c42" : color}
            />
          </group>
        ))}
      </group>
      <group name="animal-head" position={[0, headY, front]}>
        <Ball
          p={[0, 0, 0]}
          s={[
            deer ? 0.14 : sheep ? 0.16 : small ? 0.13 : 0.17,
            deer ? 0.2 : bird ? 0.18 : small ? 0.11 : 0.15,
            deer ? 0.19 : sheep ? 0.22 : bird ? 0.16 : small ? 0.16 : 0.18,
          ]}
          c={kind === "duck" ? "#46725c" : sheep ? "#76675c" : color}
        />
        {[-1, 1].map((side) => (
          <group key={side}>
            <Ball
              p={[side * 0.115, 0.055, 0.115]}
              s={[0.043, 0.05, 0.027]}
              c="#f6edd9"
            />
            <Ball
              p={[side * 0.12, 0.056, 0.138]}
              s={[0.022, 0.029, 0.014]}
              c="#26332c"
            />
            <Ball
              p={[side * 0.113, 0.067, 0.15]}
              s={[0.007, 0.009, 0.006]}
              c="#ffffff"
            />
          </group>
        ))}
        {bird ? (
          <Ball
            p={[0, -0.025, 0.19]}
            s={[
              kind === "duck" ? 0.11 : 0.06,
              0.035,
              kind === "duck" ? 0.12 : 0.09,
            ]}
            c="#e2b05b"
          />
        ) : (
          <>
            <Ball
              p={[0, -0.04, 0.17]}
              s={[
                kind === "cat" ? 0.07 : small ? 0.07 : 0.11,
                kind === "cat" ? 0.04 : 0.07,
                kind === "fox" ? 0.17 : kind === "cat" ? 0.055 : 0.1,
              ]}
              c={
                kind === "fox"
                  ? "#f1d9b1"
                  : sheep
                    ? "#655950"
                    : kind === "frog"
                      ? color
                      : "#e6cbb0"
              }
            />
            {kind !== "frog" && (
              <Ball
                p={[0, -0.015, kind === "fox" ? 0.31 : 0.25]}
                s={[0.035, 0.025, 0.025]}
                c={rabbit || kind === "cat" ? "#ba8d86" : "#423a32"}
              />
            )}
          </>
        )}
        {!bird && kind !== "frog" && kind !== "hedgehog" && !sheep && (
          <Ears long={rabbit} color={color} inside="#d5aa9c" />
        )}
        {sheep &&
          [-1, 1].map((side) => (
            <Ball
              key={side}
              p={[side * 0.22, 0.06, 0]}
              s={[0.14, 0.05, 0.075]}
              c={color}
            />
          ))}
        {kind === "chicken" && (
          <>
            {[0, 1, 2].map((i) => (
              <Ball
                key={i}
                p={[0, 0.18 + i * 0.018, 0.07 - i * 0.065]}
                s={[0.045, 0.07, 0.05]}
                c="#b95648"
              />
            ))}
            <Ball p={[0, -0.12, 0.15]} s={[0.045, 0.07, 0.035]} c="#b95648" />
          </>
        )}
        {deer &&
          [-1, 1].map((side) => (
            <group
              key={side}
              position={[side * 0.1, 0.16, -0.04]}
              rotation={[0, 0, -side * 0.25]}
            >
              <mesh position={[0, 0.15, 0]}>
                <cylinderGeometry args={[0.018, 0.025, 0.32, 5]} />
                <meshStandardMaterial color="#c9b18b" />
              </mesh>
              <mesh
                position={[side * 0.05, 0.22, 0]}
                rotation={[0, 0, -side * 0.8]}
              >
                <cylinderGeometry args={[0.012, 0.018, 0.16, 5]} />
                <meshStandardMaterial color="#c9b18b" />
              </mesh>
            </group>
          ))}
      </group>
      {bird &&
        [-1, 1].map((side) => (
          <Ball
            key={side}
            p={[side * 0.2, bodyY, 0.02]}
            s={[0.065, 0.16, 0.21]}
            c={kind === "duck" ? "#6c827b" : "#d6c8ab"}
          />
        ))}
      {kind === "frog" &&
        [-1, 1].map((side) => (
          <Ball
            key={side}
            p={[side * 0.19, 0.07, -0.08]}
            s={[0.11, 0.065, 0.18]}
            c="#557a49"
          />
        ))}
      {kind === "hedgehog" &&
        Array.from({ length: 22 }, (_, i) => {
          const a = i * 2.4;
          return (
            <mesh
              key={i}
              position={[
                Math.sin(a) * 0.13,
                0.22 + (i % 4) * 0.025,
                Math.cos(a) * 0.18 - 0.04,
              ]}
              rotation={[Math.cos(a) * 0.5, 0, -Math.sin(a) * 0.5]}
            >
              <coneGeometry args={[0.035, 0.17, 4]} />
              <meshStandardMaterial color={i % 2 ? "#a38a69" : "#66503d"} />
            </mesh>
          );
        })}
      {deer &&
        [-1, 1].flatMap((side) =>
          [0, 1, 2].map((i) => (
            <Ball
              key={`${side}-${i}`}
              p={[side * 0.22, 0.69, -0.2 + i * 0.17]}
              s={[0.012, 0.035, 0.035]}
              c="#f2dfbc"
            />
          )),
        )}
      {rabbit ? (
        <Ball p={[0, 0.3, -0.32]} s={[0.11, 0.11, 0.11]} c="#f0e5cc" />
      ) : kind === "fox" ? (
        <group
          name="animal-tail"
          position={[0, 0.3, -0.3]}
          rotation={[-0.75, 0, 0]}
        >
          <Ball p={[0, 0, -0.24]} s={[0.12, 0.12, 0.32]} c={color} />
          <Ball p={[0, 0, -0.46]} s={[0.1, 0.1, 0.15]} c="#eddcc0" />
        </group>
      ) : kind === "cat" ? (
        <group
          name="animal-tail"
          position={[0, 0.25, -0.3]}
          rotation={[-0.65, 0, 0]}
        >
          <mesh position={[0, 0, -0.21]} rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.04, 0.36, 3, 6]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      ) : (
        !small && (
          <Ball
            p={[0, bodyY, -(deer ? 0.44 : 0.32)]}
            s={[0.075, 0.065, 0.12]}
            c={deer ? "#eddcc1" : color}
          />
        )
      )}
    </group>
  );
}
