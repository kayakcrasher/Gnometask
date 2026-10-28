import {nearbySupplyPort,provisionHold,PROVISION_PRICE,stockOn} from '../ship-supplies';
import {boatById} from '../data/boats';
import {scheduleWrite} from './persist';
import type {GameState,StoreGet,StoreSet} from './types';
export function shipSuppliesSlice(set:StoreSet,get:StoreGet):Pick<GameState,'buyProvisions'>{
  return {buyProvisions:(hull,amount)=>{
    const s=get(),spec=provisionHold(hull);
    if(!s.named||s.atHome||s.interior||s.abroad||s.bank.pending||s.combat||s.fishing||s.transport.ride||s.naval.battle||s.naval.rescue||s.naval.boarding||!spec||!s.hulls.includes(hull)||s.ports.shipments.some(t=>t.boat===hull)||(s.afloat&&s.afloat!==hull)||!Number.isSafeInteger(amount)||amount<=0)return;
    const port=nearbySupplyPort(s);
    if(!port){set({speech:'Visit Quartermaster Quay in Port Victoria, or build Thimblehaven’s supply dock after its town hall.'});return;}
    const count=Math.min(amount,spec.capacity-stockOn(s.shipStores,hull)),cost=count*PROVISION_PRICE;
    if(!count){set({speech:'The provision hold is already full.'});return;}
    if(s.coins<cost){set({speech:`Those provisions cost ${cost} coins.`});return;}
    if(s.afloat&&typeof window!=='undefined')window.dispatchEvent(new Event('hollow-watch:anchor'));
    set({coins:s.coins-cost,shipStores:{holds:{...s.shipStores.holds,[hull]:{stock:stockOn(s.shipStores,hull)+count,distance:s.shipStores.holds[hull]?.distance??0}}},
      ...(s.afloat?{portCourse:null,sailHome:false}:{}),
      speech:`${port.name}: ${count} crates of food, water and lamp oil loaded aboard ${boatById(hull)!.name} for ${cost} coins.`});
    scheduleWrite(get);
  }};
}
