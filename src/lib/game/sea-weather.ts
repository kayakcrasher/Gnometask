/** Stable prevailing breeze. Direction is where the wind travels in map coordinates. */
export function sailingWind(x:number,y:number) {
  return {heading:0.65+Math.sin(x/5000)*0.15+Math.cos(y/5000)*0.12,strength:0.8};
}
export function windSpeedFactor(boat:string,heading:number,x:number,y:number,parts:readonly string[]=[]) {
  if(boat==="row"||parts.includes("engine"))return 1;
  const wind=sailingWind(x,y);
  // Tap navigation automatically trims/tacks: a headwind slows, never strands.
  return 0.9+Math.cos(heading-wind.heading)*0.18*wind.strength;
}

/** Small hulls respond quickly; laden and large ships carry more momentum. */
export function hullHandling(boat:string) {
  if(["row","sail","fisher"].includes(boat))return {acceleration:2.6,turn:5};
  if(["barge","frigate","galleon","megayacht"].includes(boat))return {acceleration:1.1,turn:2};
  return {acceleration:1.8,turn:3.2};
}
