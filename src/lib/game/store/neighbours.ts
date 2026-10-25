import {emptyMemory,neighbourProfile,neighbourHome,neighbourDialogue,updateFriendship,type NeighbourGift} from "../neighbours";
import {scheduleWrite} from "./persist";
import type {GameState,StoreGet,StoreSet} from "./types";
export function neighbourAvailable(s:GameState,id:string){
 const r=s.thimble.residents.find(r=>r.id===id),home=neighbourHome(id,s.thimble.residents.findIndex(r=>r.id===id));
 return !!r&&s.named&&!s.atHome&&!s.afloat&&!s.abroad&&!s.combat&&!s.fishing&&!s.bank.pending&&!s.naval.battle&&!s.naval.rescue&&!s.naval.boarding&&!s.transport.ride&&((s.interior==="neighbor"&&s.visitingNeighbour===id)||(!s.interior&&Math.hypot(s.gnomeX-home.x,s.gnomeY-home.y)<140));
}
export function neighboursSlice(set:StoreSet,get:StoreGet):Pick<GameState,"chatNeighbour"|"giftNeighbour"|"visitNeighbour"|"readNeighbourLetter">{
 const available=(id:string)=>{if(neighbourAvailable(get(),id))return true;set({speech:"Walk over to your neighbour’s home for a proper visit."});return false;};
 return {
 chatNeighbour:id=>{if(!available(id))return;const s=get(),m=s.neighbourhood.people[id]??emptyMemory(),fresh=s.thimble.beat-m.lastChat>=4;
  const next=fresh?{...m,chats:m.chats+1,lastChat:s.thimble.beat,points:Math.min(100,m.points+(m.chats===0?4:2))}:m;
  set({neighbourhood:fresh?updateFriendship(s.neighbourhood,id,next):s.neighbourhood,speech:`${neighbourProfile(id).name}: ${neighbourDialogue(s,id)}${fresh?"":" Let’s catch up again after a little exploring."}`});scheduleWrite(get);
 },
 giftNeighbour:(id,gift:NeighbourGift)=>{if(!available(id)||!["sprat","carrot","bread"].includes(gift))return;const s=get(),m=s.neighbourhood.people[id]??emptyMemory();
  if(!m.chats){set({speech:"Say hello first. Even a lovely gift is nicer with an introduction."});return;}
  if(s.thimble.beat-m.lastGift<10){set({speech:"That was thoughtful. Give them time to enjoy your last gift."});return;}
  const count=gift==="sprat"?(s.fishBag.sprat??0):gift==="carrot"?(s.produce.carrot??0):s.bread;if(count<1)return;
  const favourite=gift===neighbourProfile(id).gift;const next={...m,lastGift:s.thimble.beat,gift,points:Math.min(100,m.points+(favourite?6:2))};
  set({neighbourhood:updateFriendship(s.neighbourhood,id,next),fishBag:gift==="sprat"?{...s.fishBag,sprat:count-1}:s.fishBag,produce:gift==="carrot"?{...s.produce,carrot:count-1}:s.produce,bread:gift==="bread"?count-1:s.bread,speech:`${neighbourProfile(id).name}: ${favourite?"My favourite! You remembered. I’m keeping the ribbon.":"For me? That’s kind of you."}`});scheduleWrite(get);
 },
 visitNeighbour:id=>{if(!available(id))return;const s=get(),r=s.thimble.residents.find(r=>r.id===id)!,m=s.neighbourhood.people[id]??emptyMemory();
  if((r.homeLevel??1)<1){set({speech:"Their home is still being built. They’ll put the kettle on when the roof is ready."});return;}
  if(!m.chats){set({speech:"Introduce yourself first, then ask to come in."});return;}
  if(s.dayPhase==="night"&&m.points<20){set({speech:"They’ve turned in for the night. Friends may visit late; everyone else should come back in daylight."});return;}
  set({interior:"neighbor",visitingNeighbour:id,popup:null,panel:"place",neighbourhood:m.visited?s.neighbourhood:updateFriendship(s.neighbourhood,id,{...m,visited:true,points:Math.min(100,m.points+6)}),speech:`${neighbourProfile(id).name}: Welcome in! Mind the rug. I’ve only just decided where it goes.`});scheduleWrite(get);
 },
 readNeighbourLetter:id=>{const s=get();if(!s.named)return;set({neighbourhood:{...s.neighbourhood,letters:s.neighbourhood.letters.map(l=>l.id===id?{...l,read:true}:l)}});scheduleWrite(get);},
 };
}
