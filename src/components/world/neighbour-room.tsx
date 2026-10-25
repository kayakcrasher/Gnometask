import {useGame} from "@/lib/game/store";
import {InteriorPreview} from "./interior-assets";
import {NeighbourActions} from "../hud/neighbours";
export function NeighbourRoom(){
 const id=useGame(s=>s.visitingNeighbour),room=useGame(s=>s.interior),leave=useGame(s=>s.leaveInterior);
 if(room!=="neighbor"||!id)return null;
 return <div role="dialog" aria-modal="true" aria-label="Neighbour home" className="fixed inset-0 z-50 flex flex-col bg-parchment p-3 text-ink"><header className="mb-2 flex items-center justify-between"><h2 className="font-display text-xl font-bold">A neighbour’s welcome</h2><button type="button" className="min-h-11 rounded-xl bg-pine px-4 font-bold text-parchment" onClick={leave}>Leave neighbour home</button></header><div className="min-h-0 flex-1 overflow-y-auto"><InteriorPreview id="neighbor"/><NeighbourActions id={id}/></div></div>;
}
