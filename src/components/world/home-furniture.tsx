import {useIndoor} from '@/lib/game/indoor-state';
import {furnitureBox,type HomePiece} from '@/lib/game/home-room';
import {RoomPlant} from './interior-assets';
import {CottageMusicBox} from './music-box';
function Box({position,size,color}:{position:[number,number,number];size:[number,number,number];color:string}){return <mesh position={position} castShadow receiveShadow><boxGeometry args={size}/><meshStandardMaterial color={color} roughness={.9}/></mesh>;}
function Cushion({x=0,z=0,width=1}:{x?:number;z?:number;width?:number}){return <><Box position={[x,.32,z]} size={[width,.4,.8]} color="#906e4d"/><Box position={[x,.58,z+.04]} size={[width-.08,.22,.7]} color="#b8c598"/><Box position={[x,.9,z-.28]} size={[width-.08,.55,.18]} color="#789b86"/>{[-1,1].map(v=><Box key={v} position={[x+v*width*.45,.67,z]} size={[.14,.42,.8]} color="#789b86"/>)}</>;}
export function HomeFurniture({piece}:{piece:HomePiece}){
 const arranging=useIndoor(s=>s.arranging),selected=useIndoor(s=>s.selectedFurniture===piece.id),b=furnitureBox(piece);
 return <group position={[piece.x,0,piece.z]} rotation={[0,piece.turn*Math.PI/2,0]} onClick={e=>{if(arranging){e.stopPropagation();useIndoor.setState({selectedFurniture:piece.id});}}}>
  {piece.kind==='bed'&&<><Box position={[0,.3,0]} size={[1.4,.45,2.1]} color="#926b4a"/><Box position={[0,.7,-.95]} size={[1.45,1,.12]} color="#a9855b"/><Box position={[0,.57,0]} size={[1.3,.18,1.95]} color="#f2e8cc"/><Box position={[0,.69,.25]} size={[1.32,.12,1.45]} color="#8fa9a0"/>{[-1,1].map(v=><Box key={v} position={[v*.33,.76,-.57]} size={[.57,.16,.42]} color="#fff1d4"/>)}{[-1,0,1].map(v=><Box key={v} position={[v*.4,.76,.26]} size={[.24,.025,.8]} color={v?'#c4c797':'#be8f86'}/>)}</>}
  {piece.kind==='table'&&<><Box position={[0,.64,0]} size={[1.5,.12,.9]} color="#c49a68"/>{[-1,1].flatMap(x=>[-1,1].map(z=><Box key={`${x}${z}`} position={[x*.57,.3,z*.28]} size={[.12,.6,.12]} color="#96734d"/>))}<CottageMusicBox position={[.35,.7,-.15]}/><mesh position={[-.4,.76,.1]}><cylinderGeometry args={[.11,.09,.16,10]}/><meshStandardMaterial color="#f1e1bb"/></mesh><Box position={[-.1,.73,.18]} size={[.3,.06,.25]} color="#b47c70"/></>}
  {piece.kind==='chair'&&<Cushion width={.72}/>}
  {piece.kind==='sofa'&&<Cushion width={1.85}/>}
  {piece.kind==='dresser'&&<><Box position={[0,.48,0]} size={[1.3,.96,.64]} color="#b08c62"/>{[.22,.5,.78].map(y=><group key={y}><Box position={[0,y,.33]} size={[1.17,.23,.035]} color="#c5a274"/>{[-1,1].map(v=><mesh key={v} position={[v*.3,y,.37]}><sphereGeometry args={[.035,6,5]}/><meshStandardMaterial color="#856638"/></mesh>)}</group>)}</>}
  {piece.kind==='bookcase'&&<><Box position={[0,.85,0]} size={[1.3,1.7,.56]} color="#a58257"/>{[.3,.8,1.3].map((y,i)=><group key={y}><Box position={[0,y,0]} size={[1.23,.1,.6]} color="#d4b584"/>{[-2,-1,0,1,2].map((n)=><Box key={n} position={[n*.21,y+.22,.05]} size={[.15,.34,.35]} color={['#8fa883','#c69d75','#7597a4'][(n+2+i)%3]!}/>)}</group>)}</>}
  {piece.kind==='plant'&&<RoomPlant x={0} z={0}/>}
  {piece.kind==='lamp'&&<><mesh position={[0,.08,0]}><cylinderGeometry args={[.23,.26,.13,10]}/><meshStandardMaterial color="#b98f57"/></mesh><mesh position={[0,.6,0]}><cylinderGeometry args={[.055,.07,1.1,8]}/><meshStandardMaterial color="#d6c69d"/></mesh><mesh position={[0,1.2,0]} scale={[1,.55,1]}><sphereGeometry args={[.35,12,8,0,Math.PI*2,0,Math.PI/2]}/><meshStandardMaterial color="#e1b57e" emissive="#b47c41" emissiveIntensity={.4}/></mesh><mesh position={[0,1.13,0]}><sphereGeometry args={[.1,8,6]}/><meshStandardMaterial color="#fff0c4" emissive="#ffc97d" emissiveIntensity={1}/></mesh></>}
  {piece.kind==='rug'&&<group position={[0,.018,0]}>{[.95,.82,.7].map((r,i)=><mesh key={r} rotation={[-Math.PI/2,0,0]} position={[0,i*.001,0]}><circleGeometry args={[r,32]}/><meshStandardMaterial color={['#bca37a','#eee0b8','#91aa91'][i]!}/></mesh>)}</group>}
  {selected&&arranging&&<mesh rotation={[-Math.PI/2,0,0]} position={[0,.035,0]}><ringGeometry args={[Math.max(b.w,b.d)+.08,Math.max(b.w,b.d)+.14,32]}/><meshBasicMaterial color="#f6ce68" transparent opacity={.9} depthWrite={false}/></mesh>}
 </group>;
}
