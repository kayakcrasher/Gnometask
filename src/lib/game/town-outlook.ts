import type {GameSave,Raid} from './types';
import {economicClimate} from './island-economy';
import {stepThimble} from './thimblehaven';
/** A dry run of the real town simulation, not a second set of economic rules. */
export function townOutlook(s:GameSave & {raids?:Raid[]}){
 const climate=economicClimate(s),ticks=10-s.thimble.beat%10;
 let future=s;
 for(let i=0;i<ticks;i++)future={...future,...stepThimble(future)};
 const cap=future.thimble.projects.includes('hall')?8:future.thimble.projects.includes('cottages')?6:2;
 const newFamilies=future.thimble.residents.filter(r=>!s.thimble.residents.some(p=>p.id===r.id));
 const leaving=s.thimble.residents.filter(r=>!future.thimble.residents.some(p=>p.id===r.id));
 const advice:string[]=[];
 if(climate.jobs<2)advice.push('Households are losing savings and new families are waiting for steadier work. A market helps earnings once the economy recovers.');
 if(climate.security>0){
  if((s.raids??s.economy.threats).some(r=>r.hp>0)||s.landing?.goblins.some(g=>g.alive))advice.push('Active enemies are reducing confidence. Clear raids and goblins to ease that pressure.');
  if(Object.values(s.buildingHp).some(h=>h<20))advice.push('Severely damaged buildings are weighing on trade. Repair buildings with less than 20 health.');
  if(s.lifeDragon.state==='raiding')advice.push('The dragon raid is hurting confidence. Resolve it to help trade recover.');
 }
 if(s.thimble.residents.length>=cap)advice.push(cap===2?'The town is full. Fund newcomer cottages to make room for four more families.':cap===6?'The cottages are full. Build the harbour town hall for two more households.':'Thimblehaven has reached its eight-household capacity. Develop your player city for further housing.');
 else if(!newFamilies.length&&climate.jobs>=2)advice.push('There is space, but existing households need more than 20 coins each after earnings before another family arrives. Give them time to save.');
 if(!future.thimble.projects.includes('market'))advice.push('The fish market raises healthy-economy household earnings from 6 to 12 coins per collection.');
 if(s.thimble.tax>0&&climate.jobs<2)advice.push('A lower household levy leaves more savings with families during the downturn. It does not change the island market cycle.');
 if(!advice.length)advice.push('Conditions support growth. Keep trade safe and leave households enough savings for their next extension.');
 return {climate,ticks,seconds:ticks*9,cap,newFamilies,leaving,levy:future.coins-s.coins,advice,households:s.thimble.residents.map(r=>{const next=future.thimble.residents.find(p=>p.id===r.id);return {id:r.id,name:r.name,now:r.purse,next:next?.purse??null,building:next?.work?.target??null};})};
}
