/** Visual motion only. Navigation and combat continue to use the surveyed map position. */
export function dampAngle(current:number,target:number,rate:number,dt:number){
  const delta=Math.atan2(Math.sin(target-current),Math.cos(target-current));
  return current+delta*(1-Math.exp(-rate*Math.min(.1,Math.max(0,dt))));
}
/** Match the water vertex shader's slow swell in terrain.tsx (plane Y becomes -world Z). */
export function seaHeight(time:number,x:number,z:number){
  const d=Math.hypot(x,z),q=Math.max(0,Math.min(1,(d-82)/48)),off=q*q*(3-2*q),amp=.025+.135*off,py=-z;
  const swell=Math.sin(x*.18+time*.55)*amp+Math.cos(py*.14+time*.38)*amp*.65;
  const chop=Math.sin(x*.7+py*.35+time*1.1)*amp*.2;
  return Math.max(-.04,Math.min(.045+.115*off,swell+chop));
}
export function seaPose(time:number,x:number,z:number,underway:number,turn=0){
  const swell=time*.82+x*.12+z*.08;
  return {heave:seaHeight(time,x,z),pitch:Math.cos(swell)*(.009+underway*.009),
    roll:Math.sin(swell*.74+.4)*.016-Math.max(-.055,Math.min(.055,turn*.035))};
}

export function arrivalStep(elapsed:number,dt:number,hurry:boolean,paused=false){
  if(paused||!Number.isFinite(dt)||dt<=0)return elapsed;
  // A stalled render or returning from another app must never jump down the plank.
  return Math.min(7,elapsed+Math.min(.08,dt)*(hurry?2.2:1));
}
export function sailingVelocity(current:number,cruise:number,remaining:number,dt:number,response=2.2){
  const target=Math.min(cruise,Math.sqrt(Math.max(0,2*cruise*1.2*remaining)));
  return current+(target-current)*(1-Math.exp(-response*Math.min(.1,Math.max(0,dt))));
}
