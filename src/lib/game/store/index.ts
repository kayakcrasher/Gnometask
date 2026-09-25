import { clockSlice } from "./clock";
import { combatSlice } from "./combat";
import { farmSlice } from "./farm";
import { economySlice } from "./economy";
import { gatherSlice } from "./gather";
import { honourSlice } from "./honour";
import { UI_SEED } from "./persist";
import { questsSlice } from "./quests";
import { sessionSlice } from "./session";
import { tasksSlice } from "./tasks";
import type { GameState } from "./types";
import { worldSlice } from "./world";
import { yardSlice } from "./yard";
import { create } from "zustand";
import { GREETS } from "../quotes";
import { defaultSave, writeSave } from "../save";

export type { GameState } from "./types";

export const useGame = create<GameState>((set, get) => ({
  ...defaultSave(),
  ...UI_SEED,
  speech: GREETS[0]!,
  ...sessionSlice(set, get),
  ...tasksSlice(set, get),
  ...economySlice(set, get),
  ...worldSlice(set, get),
  ...questsSlice(set, get),
  ...combatSlice(set, get),
  ...gatherSlice(set, get),
  ...farmSlice(set, get),
  ...honourSlice(set, get),
  ...yardSlice(set, get),
  ...clockSlice(set, get),
}));

if (typeof window !== "undefined") {
  const w = window as Window & { __gnomeReset?: () => void; __game?: typeof useGame };
  w.__game = useGame;
  w.__gnomeReset = () => {
    const fresh = defaultSave();
    writeSave(fresh);
    useGame.setState({
      ...fresh,
      ...UI_SEED,
      hydrated: true,
      named: false,
      gnomeName: "",
      speech: GREETS[0]!,
    });
  };
}
