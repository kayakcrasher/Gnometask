import {hasCabin,CREW_ROLES} from '../ship-life';
import {PUBLIC_PORT,NORTH_LANDING,portSite} from '../ports';
import {oceanLandings} from '../ocean-world';
import {maxHitpoints} from '../xp';
import {scheduleWrite} from './persist';
import type {GameState,StoreSet,StoreGet} from './types';
export function shipLifeSlice(set:StoreSet,get:StoreGet):Pick<GameState,'hireShipCrew'|'setShipSpeed'|'enterShipCabin'|'shipMeal'>{
 const safe=()=>{const s=get();return s.named&&!s.atHome&&!s.bank.pending&&!s.combat&&!s.abroad&&!s.naval.battle&&!s.naval.rescue&&!s.naval.boarding&&!s.fishing&&!s.transport.ride;};
 return {
 hireShipCrew:(hull,role)=>{const s=get(),p=CREW_ROLES.find(p=>p.id===role);if(!safe()||s.interior||s.afloat||!hasCabin(hull)||!s.hulls.includes(hull)||!p||s.coins<p.price||s.shipLife.crew[hull]?.includes(role)||s.ports.shipments.some(t=>t.boat===hull))return;const ports=[PUBLIC_PORT,NORTH_LANDING,...oceanLandings(s.gnomeX,s.gnomeY).filter(p=>p.town),...s.ports.docks.map(d=>portSite(d.site)).filter(Boolean)];if(!ports.some(p=>p&&Math.hypot(s.gnomeX-p.x,s.gnomeY-p.y)<=260)){set({speech:'Visit a harbour to sign on crew.'});return;}set({coins:s.coins-p.price,shipLife:{...s.shipLife,crew:{...s.shipLife.crew,[hull]:[...(s.shipLife.crew[hull]??[]),role]}},speech:`${p.name} signed aboard. Crew wages are 2 coins per crew member per 600 map units sailed; gunners keep their separate shot wages.`});scheduleWrite(get);},
 setShipSpeed:speed=>{if(!safe()||!['slow','cruise','full'].includes(speed))return;set({shipLife:{...get().shipLife,speed}});scheduleWrite(get);},
 enterShipCabin:()=>{const s=get();if(!safe()||s.interior||!s.afloat||!hasCabin(s.afloat)||(s.naval.integrity[s.afloat]??1)<=0)return;set({interior:'ship-cabin',popup:null,portCourse:null,sailHome:false,speech:'Ship stopped. Tap the cabin floor to walk. Return to deck to set a new course.'});},
 shipMeal:()=>{const s=get();if(!safe()||s.interior!=='ship-cabin'||!s.afloat||!s.shipLife.crew[s.afloat]?.includes('cook')||s.coins<5||s.hp>=maxHitpoints(s.skills))return;set({coins:s.coins-5,hp:Math.min(maxHitpoints(s.skills),s.hp+4),speech:`The cook brings warm stew. ${Math.min(4,maxHitpoints(s.skills)-s.hp)} health restored; galley service costs 5 coins.`});scheduleWrite(get);},
 };
}
