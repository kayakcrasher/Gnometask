import {furnitureDef,furniturePrice,type FurnitureKind} from '../home-room';
import {canPlaceHome} from '../home-placement';
import {useIndoor} from '../indoor-state';
import {scheduleWrite} from './persist';
import type {GameState,StoreSet,StoreGet} from './types';
export function homeRoomSlice(set:StoreSet,get:StoreGet):Pick<GameState,'buyHomeFurniture'|'placeHomeFurniture'|'storeHomeFurniture'>{
  const ready=()=>{const s=get();return s.named&&!s.atHome&&s.interior==='cottage'&&!s.afloat&&!s.combat&&!s.abroad&&!s.bank.pending&&!s.fishing&&!s.naval.battle&&!s.naval.rescue&&!s.naval.boarding&&!s.transport.ride;};
  return {
    buyHomeFurniture:(kind:FurnitureKind)=>{const s=get(),f=furnitureDef(kind),price=furniturePrice(s.homeRoom,kind);if(!ready()||!f||s.coins<price||s.homeRoom.items.length>=32)return;let next=s.homeRoom.next;while(s.homeRoom.items.some(p=>p.id===`furniture-${next}`))next++;
      set({coins:s.coins-price,homeRoom:{items:[...s.homeRoom.items,{id:`furniture-${next}`,kind,x:0,z:0,turn:0,stored:true}],next:next+1},speech:`${f.name} delivered to your furniture storage. Choose it in Arrange furniture to place it.`});scheduleWrite(get);},
    placeHomeFurniture:(id,x,z,turn)=>{if(!ready()||![x,z,turn].every(Number.isFinite))return;const s=get(),item=s.homeRoom.items.find(p=>p.id===id);if(!item)return;
      const piece={...item,x:Math.round(x*4)/4,z:Math.round(z*4)/4,turn,stored:false};
      const indoor=useIndoor.getState(),player=indoor.room==='cottage'?indoor.position:undefined;
      if(!canPlaceHome(s.homeRoom,piece,player)){set({speech:'That spot is too tight. Keep furniture apart, leave the front door clear and keep a path through the room.'});return;}
      set({homeRoom:{...s.homeRoom,items:s.homeRoom.items.map(p=>p.id===id?piece:p)},speech:`${furnitureDef(item.kind)!.name} placed. Rearranging costs no coins.`});scheduleWrite(get);},
    storeHomeFurniture:id=>{if(!ready())return;const s=get(),item=s.homeRoom.items.find(p=>p.id===id);if(!item||item.stored)return;set({homeRoom:{...s.homeRoom,items:s.homeRoom.items.map(p=>p.id===id?{...p,stored:true}:p)},speech:'Furniture put safely in storage. Place it again whenever you like.'});scheduleWrite(get);},
  };
}
