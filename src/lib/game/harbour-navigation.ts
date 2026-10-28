import {rescuePorts} from './ocean-rescue';
import {portSite,portNavigationRoute} from './ports';
import {supplyPorts} from './ship-supplies';
import type {GameSave} from './types';

/** Working public ports, completed supply quays and the player's own wharves.
 * Uninhabited island beaches remain usable for manual landings, not auto-return. */
export function nearestHarbour(s:Pick<GameSave,'gnomeX'|'gnomeY'|'ports'|'thimble'>){
  const start={x:s.gnomeX,y:s.gnomeY};
  const ports=[...rescuePorts(start.x,start.y),...supplyPorts(s.thimble),
    ...s.ports.docks.flatMap(d=>{const p=portSite(d.site);return p?[p]:[];})];
  ports.sort((a,b)=>Math.hypot(start.x-a.water.x,start.y-a.water.y)-Math.hypot(start.x-b.water.x,start.y-b.water.y));
  return ports.find(p=>portNavigationRoute(start,p.id))??null;
}
