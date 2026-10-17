import { create } from "zustand";
import type { IndoorPoint } from "./indoor-navigation";
import type { InteriorId } from "./types";
export const useIndoor = create<{
  room: InteriorId | null;
  position: IndoorPoint;
  target: IndoorPoint | null;
  direction: IndoorPoint;
  moving: boolean;
}>(() => ({
  room: null,
  position: { x: 0, z: 2.2 },
  target: null,
  direction: { x: 0, z: 0 },
  moving: false,
}));

// Match the game's existing __game inspection hook without touching world saves.
if(typeof window!=='undefined'){
 (window as Window&{__indoor?:typeof useIndoor}).__indoor=useIndoor;
}
