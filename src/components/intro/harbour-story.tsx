import { useId } from 'react';

function StoryGnome({pappy=false}:{pappy?:boolean}) {
  return <g>
    <ellipse cy={4} rx={27} ry={7} fill="#1b3947" opacity=".24" />
    <g className="story-feet"><path d="M-22 -14h20v19h-27q-4 -11 7 -19M6 -14h19q12 8 8 19H6Z" fill="#483e3c" /></g>
    <path d="M-21 -70Q-35 -49 -28 -15H28Q34 -45 20 -70Z" fill={pappy?'#856844':'#547e70'} />
    <path d="M-24 -54l-10 30 13 4 9 -26M23 -53l10 26 -12 6 -9 -28" fill={pappy?'#a7885d':'#7a9e81'} />
    {pappy&&<g className="story-wave"><path d="M22 -54l18 -25 9 7 -17 36" fill="#a7885d"/><circle cx={47} cy={-81} r={9} fill="#e9b998"/></g>}
    <path d="M-26 -92Q-35 -48 0 -31Q37 -49 26 -92Z" fill={pappy?'#eee8d2':'#cfb998'} />
    <ellipse cy={-90} rx={25} ry={24} fill="#dfae87" />
    <path d="M-35 -94L1 -171Q20 -139 35 -94Z" fill={pappy?'#75916d':'#ba635d'} />
    <path d="M-35 -99h70v10h-70Z" fill={pappy?'#485f51':'#8e464e'} />
    <ellipse cy={-78} rx={13} ry={10} fill="#f0c69f"/>
    <circle cx={-12} cy={-91} r={2.5} fill="#3f403c"/><circle cx={12} cy={-91} r={2.5} fill="#3f403c"/>
    {pappy&&<path d="M-17 -75Q0 -62 17 -75" fill="none" stroke="#fff1d5" strokeWidth={4}/>}
    {!pappy&&<g transform="translate(-40 -31)"><rect width={23} height={30} rx={4} fill="#b58c53"/><path d="M5 0v-7h13v7" fill="none" stroke="#e1c083" strokeWidth={4}/></g>}
  </g>;
}
function HarbourHouse({x,y,width=58,height=82,color='#dfbda0',roof='#645c7f'}:{x:number;y:number;width?:number;height?:number;color?:string;roof?:string}) {
  return <g transform={`translate(${x} ${y})`}>
    <path d={`M0 0h${width}v${-height}H0Z`} fill={color}/>
    <path d={`M-8 ${-height}L${width*.5} ${-height-42}L${width+8} ${-height}Z`} fill={roof}/>
    <path d={`M${width*.4} 0v-27q${width*.1} -13 ${width*.2} 0v27`} fill="#5b606b"/>
    {[.19,.66].map((a,i)=><g key={i}><rect x={width*a} y={-height+19} width={12} height={19} rx={5} fill="#f3d798"/><path d={`M${width*a+6} ${-height+20}v17`} stroke="#aa8c7c" strokeWidth={2}/></g>)}
  </g>;
}
/** Original vector set, shared by the title and arrival. No models or video decoder. */
export function HarbourStory({shot='title',paused=false}:{shot?:'title'|'ship'|'quay'|'greeting';paused?:boolean}) {
  const id=useId().replace(/:/g,'');const ref=(name:string)=>`url(#${id}-${name})`;
  const quay=shot==='quay'||shot==='greeting';
  return <svg className={`harbour-story ${paused?'story-paused':''} shot-${shot}`} viewBox="0 0 720 1280" preserveAspectRatio="xMidYMid slice" role="img" aria-label={quay?'Your gnome steps off the ship onto the quay, where Ol Pappy waves beneath the capitol dome.':'Port Victoria seen from the ship: a golden capitol dome, colourful harbour houses, lanterns and a sea full of reflected stars.'}>
    <defs>
      <linearGradient id={`${id}-sky`} x2="0" y2="1"><stop stopColor="#102d46"/><stop offset=".48" stopColor="#686f91"/><stop offset="1" stopColor="#e8c9ad"/></linearGradient>
      <linearGradient id={`${id}-sea`} x2="0" y2="1"><stop stopColor="#699798"/><stop offset=".45" stopColor="#315c74"/><stop offset="1" stopColor="#172f4b"/></linearGradient>
      <linearGradient id={`${id}-gold`}><stop stopColor="#8e7957"/><stop offset=".5" stopColor="#efd5a0"/><stop offset="1" stopColor="#b99569"/></linearGradient>
      <linearGradient id={`${id}-mist`} x2="0" y2="1"><stop stopColor="#e2d8c0" stopOpacity="0"/><stop offset=".5" stopColor="#e2d8c0" stopOpacity=".25"/><stop offset="1" stopColor="#e2d8c0" stopOpacity="0"/></linearGradient>
      <radialGradient id={`${id}-halo`}><stop stopColor="#f2deac" stopOpacity=".26"/><stop offset="1" stopColor="#e8d8bc" stopOpacity="0"/></radialGradient>
    </defs>
    <path d="M0 0h720v1280H0Z" fill={ref('sky')}/>
    <circle cx={492} cy={248} r={210} fill={ref('halo')}/><circle cx={492} cy={248} r={49} fill="#f1dfb9"/><circle cx={515} cy={232} r={42} fill="#636b89"/>
    {Array.from({length:24},(_,i)=><g className="story-star" key={i} style={{animationDelay:`${i*.37}s`}} transform={`translate(${54+(i*137)%620} ${80+(i*67)%335})`}><path d="M-3 0h6M0 -3v6" stroke="#f9e3b9" strokeWidth={i%3===0?2:1}/></g>)}
    <path d="M0 455Q92 330 175 417Q274 275 383 393Q513 280 720 438V618H0Z" fill="#687786"/>
    <path d="M0 480Q95 400 197 459Q290 368 371 444Q497 348 720 452V634H0Z" fill="#536b75"/>
    <g className="story-city">
      <path d="M-30 621Q98 530 221 575Q400 501 738 572L760 710H-30Z" fill="#48636a"/>
      {[[-15,630,69,107,'#b2bca3','#766482'],[48,615,72,83,'#e8cba5','#71617d'],[114,608,55,126,'#c3b3b1','#765c75'],[170,598,65,86,'#b1b6a5','#516679'],[470,605,64,116,'#b5b9ae','#696580'],[535,618,75,83,'#e3b99b','#845d6e'],[608,634,62,129,'#b1b9aa','#576178'],[669,648,71,101,'#d3b99e','#77637e']].map(([x,y,w,h,c,r],i)=><HarbourHouse key={i} x={Number(x)} y={Number(y)} width={Number(w)} height={Number(h)} color={String(c)} roof={String(r)}/>)}
      <g transform="translate(350 590)">
        <path d="M-133 0h267v-23h-267Z" fill="#c8b9a5"/>
        <path d="M-119 -23h239v-115h-239Z" fill="#e3d5ba"/>
        {[-104,-68,-32,4,40,76].map(x=><g key={x}><path d={`M${x} -30v-97h14v97Z`} fill="#baad9b"/><path d={`M${x-4} -131h23v9h-23Z`} fill="#f0dec0"/></g>)}
        <path d="M-133 -140L0 -192L133 -140Z" fill="#f0dfbc"/><path d="M-105 -144L0 -180L105 -144Z" fill="#b6aaa2"/>
        <path d="M-67 -184v-47Q0 -266 67 -231v47Z" fill="#c2b29b"/>
        {[-48,-20,8,36].map(x=><rect key={x} x={x} y={-229} width={12} height={26} rx={6} fill="#f2dca5"/>)}
        <path d="M-88 -231Q-81 -316 0 -336Q81 -316 88 -231Z" fill={ref('gold')}/>
        <path d="M-55 -232Q-48 -297 0 -331Q48 -297 55 -232M0 -330v98" fill="none" stroke="#f8e6bd" strokeWidth={3} opacity=".55"/>
        <path d="M-15 -336v-16h30v16M0 -352v-35" fill="#cbb58b" stroke="#dac79f" strokeWidth={4}/><circle cy={-388} r={7} fill="#f5dca1"/>
        <path d="M-24 0v-53Q0 -85 24 -53V0Z" fill="#596775"/><path d="M-32 4h64M-43 15h86M-54 26h108" stroke="#e6d2ae" strokeWidth={7}/>
      </g>
      <path d="M-10 636Q325 588 735 653v40Q325 626 -10 675Z" fill="#ada797"/>
      {Array.from({length:15},(_,i)=><path key={i} d={`M${i*55-25} ${657+Math.abs(i-6)*2}v25h31v-22q-15 -16 -31 -3Z`} fill="#61767c"/>)}
      <path d="M220 605h42l-6 -10h-30Z" fill="#82aaa4"/><path d="M241 597v-27q-8 -23 -18 -11m18 12q9 -24 21 -9" fill="none" stroke="#b5dfc8" strokeWidth={3}/>
    </g>
    <path d="M0 684Q298 643 720 697v583H0Z" fill={ref('sea')}/>
    <path d="M330 680h47l65 375H267Z" fill="#f6d69c" opacity=".065"/>
    <g className="story-water" fill="none" strokeLinecap="round">
      {Array.from({length:14},(_,i)=><path key={i} d={`M${40+(i*63)%470} ${710+i*24}q22 -5 43 0t45 0`} stroke={i%3===0?'#cdd2b5':'#67949b'} strokeWidth={i%3===0?3:2} opacity={.28+(i%3)*.1}/>)}
    </g>
    <path d="M-30 665h780v100H-30Z" fill={ref('mist')}/>
    {[[80,665],[615,690],[177,694]].map(([x,y],i)=><g key={i} transform={`translate(${x} ${y})`}><path d="M-34 5q34 40 69 -2Z" fill="#4c535d"/><path d="M0 -64v68M-1 -59l28 47H2Z" stroke="#c9b99f" strokeWidth={3} fill="#ead9b5"/></g>)}
    {quay ? <>
      <path d="M375 756L720 718v280L330 940Z" fill="#968c7a"/><path d="M375 756L720 718v24l-344 46Z" fill="#c3b294"/>
      {Array.from({length:10},(_,i)=><path key={i} d={`M${380+i*42} ${778-i*4}l-37 164`} stroke="#82796a" strokeWidth={2}/>)}
      <path d="M80 970Q120 1085 300 1034L331 944Z" fill="#6d4c49"/><path d="M80 970l250 -26 -18 -24 -230 29Z" fill="#c9a178"/>
      <path d="M197 940L426 785l35 13 -231 161Z" fill="#d2b286" stroke="#7e705e" strokeWidth={5}/>
      {[0,1,2,3,4,5,6].map(n=><path key={n} d={`M${213+n*32} ${927-n*22}l25 12`} stroke="#a3896d" strokeWidth={3}/>)}
      <g transform="translate(528 782)"><path d="M0 0v-190q0 -12 -20 -12" stroke="#575e62" strokeWidth={7} fill="none"/><path d="M-33 -203h27l-3 41h-20Z" fill="#efcf87"/><circle cx={-19} cy={-183} r={48} fill={ref('halo')}/></g>
      <g transform="translate(502 787) scale(.62)"><StoryGnome pappy/></g>
      <g className={`story-guest ${shot==='greeting'?'story-guest-arrived':''}`}><g transform="scale(.62)"><StoryGnome/></g></g>
    </> : <g className="story-ferry">
      <path d="M-30 1030Q330 916 750 997v310H-30Z" fill="#4c4a50"/>
      <path d="M-30 1027Q330 909 750 994v27Q330 943 -30 1065Z" fill="#b78d6a"/>
      <path d="M-20 1180Q320 1054 750 1130" fill="none" stroke="#8d705b" strokeWidth={5}/>
      <path d="M40 1039v-97M181 1004v-104M599 1004v-103M704 1015v-111" stroke="#b99572" strokeWidth={14}/>
      <path d="M-20 949Q329 831 750 919" fill="none" stroke="#d0ac82" strokeWidth={14}/>
      <path d="M-20 978Q329 860 750 948" fill="none" stroke="#e3cb9f" strokeWidth={3}/>
      <g transform="translate(365 1075) scale(.78)"><StoryGnome/></g>
      <path d="M664 1035V638" stroke="#605463" strokeWidth={16}/><path d="M657 648q-75 90 -75 180l70 -11Z" fill="#e9ddc1"/>
      <g transform="translate(104 1006)"><path d="M-20 -20h40v51h-40Z" fill="#d4ae6d"/><path d="M-20 -20l20 -17 20 17Z" fill="#6e6164"/><path d="M-12 -12h24v35h-24Z" fill="#f6dda4"/></g>
    </g>}
    {Array.from({length:11},(_,i)=><circle className="story-mote" key={i} cx={100+(i*83)%530} cy={380+(i*93)%570} r={i%3===0?3:1.6} fill="#f5e0a3" style={{animationDelay:`${i*.63}s`}}/>)}
    <path d="M0 0h720v1280H0Z" fill="none" stroke="#102d46" strokeWidth={18} opacity=".2"/>
  </svg>;
}
