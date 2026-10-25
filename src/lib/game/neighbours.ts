import type { GameSave } from "./types";
import type { HomeStyle } from "./home-design";
export const NEIGHBOUR_EVENT="hollow-watch:neighbour";
export const NEIGHBOURS = [
 {id:"nim",name:"Nim Nettlewick",trait:"Earnest cook, wonderfully terrible jokes",gift:"sprat",style:"harbour",coat:"#ae7944",rival:"Holly",line:"I’ve named my soup ‘Northern Courage’. It’s mostly potatoes and optimism."},
 {id:"holly",name:"Holly Bracken",trait:"Practical gardener with a soft heart",gift:"carrot",style:"meadow",coat:"#6c8557",rival:"Nim",line:"Nim calls it rustic cooking. I call it a reason to keep emergency carrots."},
 {id:"family-Pippa",name:"Pippa Mossbell",trait:"Shy baker who notices every kindness",gift:"bread",style:"meadow",coat:"#b78993",rival:"Bramble",line:"I left a loaf on your step. Well, I meant to. I got nervous and ate the corner."},
 {id:"family-Bramble",name:"Bramble Boots",trait:"Boastful explorer, secretly afraid of geese",gift:"carrot",style:"meadow",coat:"#8e6750",rival:"Pippa",line:"A goose blocked the northern trail. Naturally, I chose a more strategic route."},
 {id:"family-Ivy",name:"Ivy Thistledown",trait:"Fussy artist with a generous streak",gift:"sprat",style:"stone",coat:"#8b7099",rival:"Fenn",line:"Fenn says the town needs practical roofs. I say a roof can have feelings."},
 {id:"family-Fenn",name:"Fenn Coppercap",trait:"Patient tinkerer and compulsive collector",gift:"bread",style:"meadow",coat:"#987149",rival:"Ivy",line:"I’ve nearly finished a kettle that whistles in harmony. The nearly is doing a lot of work."},
 {id:"family-Mossy",name:"Mossy Mallow",trait:"Sleepy naturalist who remembers every bird",gift:"carrot",style:"meadow",coat:"#6c8e7a",rival:"Beryl",line:"The birds have approved my new window. They’ve left the paperwork on the sill."},
 {id:"family-Beryl",name:"Beryl Saltwhisker",trait:"Blunt sailor with a sentimental side",gift:"sprat",style:"harbour",coat:"#577d91",rival:"Mossy",line:"I’ve crossed rougher seas than this. Mind you, I did cry when my teacup broke."},
] as const;
export type NeighbourGift="sprat"|"carrot"|"bread";
export type NeighbourMemory={points:number;chats:number;lastChat:number;lastGift:number;visited:boolean;gift:NeighbourGift|null};
export type NeighbourLetter={id:string;from:string;text:string;read:boolean};
export type Neighbourhood={version:1;homes:Record<string,number>;people:Record<string,NeighbourMemory>;letters:NeighbourLetter[]};
export const emptyNeighbourhood=():Neighbourhood=>({version:1,homes:{},people:{},letters:[]});
export const emptyMemory=():NeighbourMemory=>({points:0,chats:0,lastChat:-100,lastGift:-100,visited:false,gift:null});
export const neighbourProfile=(id:string)=>NEIGHBOURS.find(p=>p.id===id)??NEIGHBOURS[0];
export function neighbourHome(id:string,index=0){const slots=[[2100,-3230],[2370,-3150],[2390,-3350],[2190,-3520],[2420,-3550],[2050,-2850],[2300,-2850],[2500,-2900]];const n=NEIGHBOURS.findIndex(p=>p.id===id),p=slots[n<0?Math.max(0,Math.min(7,index)):n]!;return {x:p[0]!,y:p[1]!};}
export const friendshipLabel=(points:number)=>points>=80?"Kindred spirit":points>=50?"Close friend":points>=20?"Friend":points>=4?"Familiar face":"New neighbour";
export function addNeighbourLetter(n:Neighbourhood,id:string,from:string,text:string):Neighbourhood {
 if(n.letters.some(l=>l.id===id))return n;
 return {...n,letters:[{id,from,text,read:false},...n.letters].slice(0,32)};
}
export function updateFriendship(n:Neighbourhood,id:string,m:NeighbourMemory):Neighbourhood {
 const before=n.people[id]?.points??0;let next={...n,people:{...n.people,[id]:m}};
 for(const at of [20,50,80])if(before<at&&m.points>=at)next=addNeighbourLetter(next,`friend-${id}-${at}`,neighbourProfile(id).name,at===20?"I used to call this the place I moved to. Now I call it home. Thank you for making the difference.":at===50?"I saved you the good chair. You know which one. Come round when your adventures allow it.":"Whatever the economy does, you’ll always have a place at my table. Even if the table is a packing crate.");
 return next;
}
const whole=(v:unknown,max=1e9)=>typeof v==="number"&&Number.isFinite(v)?Math.min(max,Math.max(0,Math.floor(v))):0;
export function coerceNeighbourhood(raw:unknown):Neighbourhood {
 const out=emptyNeighbourhood();if(!raw||typeof raw!=="object")return out;const r=raw as Partial<Neighbourhood>;
 for(const p of NEIGHBOURS){const level=r.homes?.[p.id];if(Number.isInteger(level)&&level!>=1&&level!<=3)out.homes[p.id]=level!;const m=r.people?.[p.id];if(!m||typeof m!=="object")continue;out.people[p.id]={points:whole(m.points,100),chats:whole(m.chats),lastChat:typeof m.lastChat==="number"&&Number.isFinite(m.lastChat)?Math.max(-100,Math.floor(m.lastChat)):-100,lastGift:typeof m.lastGift==="number"&&Number.isFinite(m.lastGift)?Math.max(-100,Math.floor(m.lastGift)):-100,visited:m.visited===true,gift:["sprat","carrot","bread"].includes(m.gift!)?m.gift:null};}
 if(Array.isArray(r.letters))out.letters=r.letters.filter((l,i,a)=>l&&typeof l.id==="string"&&typeof l.from==="string"&&typeof l.text==="string"&&a.findIndex(q=>q?.id===l.id)===i).slice(0,32).map(l=>({id:l.id.slice(0,100),from:l.from.slice(0,60),text:l.text.slice(0,700),read:l.read===true}));
 return out;
}
export function neighbourDialogue(s:GameSave,id:string){
 const p=neighbourProfile(id),r=s.thimble.residents.find(r=>r.id===id),m=s.neighbourhood.people[id]??emptyMemory();
 if(!r)return "They’ve moved away. Their letters and your friendship remain.";
 if(r.purse<20)return "I’m counting every coin just now. A friendly face still helps. I hope work picks up soon.";
 if(r.work)return `The builders are busy with my home. It’s noisy, but I’ve already picked a place for the kettle.`;
 if(m.gift&&m.chats%3===0)return `I still remember that ${m.gift} you brought. ${m.gift===p.gift?"You know me rather well.":"It was kind of you."} ${p.line}`;
 if(s.townProgress.completed>=3&&(id==="nim"||id==="holly"))return `You’ve been helping at the noticeboard. People notice things like that. ${p.line}`;
 if(s.thimble.projects.includes("market")&&m.chats%3===1)return `A real market, here in our town! ${p.rival} insists on being first in the queue. I’m practising my patient face.`;
 if(m.chats%3===2)return `${p.rival} and I disagree about the proper way to welcome a newcomer. I say tea first. We’re still speaking, naturally.`;
 return `${m.points>=20?"There you are, my friend! ":""}${p.line}`;
}
export function neighbourStyle(id:string):HomeStyle{return neighbourProfile(id).style as HomeStyle;}
