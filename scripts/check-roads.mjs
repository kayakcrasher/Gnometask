import { build } from "esbuild-wasm";
import { fileURLToPath } from "node:url";

// Exercise the actual triangulated surface, including crossings and town-block holes.
const root = fileURLToPath(new URL("../", import.meta.url));
const result = await build({
  stdin: {
    resolveDir: root,
    contents: `
      import assert from "node:assert/strict";
      import { roadFootprint, roadGeometry } from "./src/components/world/road-surface";
      import { ROAD_NETWORK, ROADS, ROAD_TOP, deckY, pathToCapitol } from "./src/lib/game/data/country";
      import { softenRoad, nearRoad } from "./src/lib/game/data/road-layout";
      import { TOWN_GRIDS, cellsOf } from "./src/lib/game/data/grids";
      import { onIsland } from "./src/lib/game/world3";

      function area(geometry) {
        const p = geometry.getAttribute("position");
        let total = 0;
        for (let i = 0; i < p.count; i += 3) {
          const cross = (p.getZ(i + 1) - p.getZ(i)) * (p.getX(i + 2) - p.getX(i))
            - (p.getX(i + 1) - p.getX(i)) * (p.getZ(i + 2) - p.getZ(i));
          assert(cross > 0, "Every road triangle must face up and have positive area: " + cross + " at " + i);
          total += cross / 2;
        }
        return total;
      }
      const horizontal = { points: [[-5, 0], [5, 0]], width: 2 };
      const vertical = { points: [[0, -5], [0, 5]], width: 2 };
      const single = roadGeometry([horizontal], ROAD_TOP);
      const crossing = roadGeometry([horizontal, vertical], ROAD_TOP);
      assert.equal(roadFootprint([horizontal, vertical]).length, 1, "Crossroads must be connected");
      assert(Math.abs(area(crossing) - (area(single) * 2 - 4)) < 0.0001,
        "Crossroads must triangulate overlapping paving only once");
      const duplicate = roadGeometry([horizontal, horizontal], ROAD_TOP);
      assert(Math.abs(area(duplicate) - area(single)) < 0.0001, "Duplicate segments must not add faces");
      const block = [
        { points: [[0, 0], [10, 0]], width: 2 },
        { points: [[10, 0], [10, 10]], width: 2 },
        { points: [[10, 10], [0, 10]], width: 2 },
        { points: [[0, 10], [0, 0]], width: 2 },
      ];
      assert.equal(roadFootprint(block)[0].length, 2, "Town blocks must keep an unpaved interior");
      const blockGeo = roadGeometry(block, ROAD_TOP);
      assert(area(blockGeo) < 80 && area(blockGeo) > 75, "Triangulation must preserve the block hole");
      assert.equal(roadGeometry([{ points: [[0, 0], [0, 0]], width: 2 }], ROAD_TOP)
        .getAttribute("position").count, 0, "Zero-length segments must be ignored");
      const smooth = softenRoad([[0,0],[100,0],[100,100]], 25);
      assert.deepEqual(smooth[0],[0,0]);assert.deepEqual(smooth.at(-1),[100,100]);
      assert(smooth.some(([x,y])=>x>75 && x<100 && y>0 && y<25),'Corners should bend before the junction');
      assert.equal(new Set(ROAD_NETWORK.map(r=>r.id)).size,ROAD_NETWORK.length);
      for(const route of ROAD_NETWORK){
        for(let i=1;i<route.points.length;i++){
          const a=route.points[i-1],b=route.points[i];
          for(let j=0;j<=10;j++){
            const x=a[0]+(b[0]-a[0])*j/10,y=a[1]+(b[1]-a[1])*j/10;
            assert(onIsland(x,y),'Road must remain on land: '+route.id);
            const length=Math.hypot(b[0]-a[0],b[1]-a[1])||1,half=route.width/0.05/2;
            for(const side of [-1,1])assert(onIsland(x-side*(b[1]-a[1])/length*half,y+side*(b[0]-a[0])/length*half),'Road edges must stay on land: '+route.id);
            if(ROADS.some(r=>r.id===route.id))for(const cell of TOWN_GRIDS.flatMap(cellsOf)){
              const dx=Math.max(0,Math.abs(x-cell.x)-22),dy=Math.max(0,Math.abs(y-cell.y)-16);
              assert(Math.hypot(dx,dy)>=half-0.5,'Country road must avoid building plots: '+route.id);
            }
            assert(Math.hypot(x-520,y-190)>90+route.width/0.05/2,'Road must avoid the pond: '+route.id);
            assert.equal(deckY(x,y),ROAD_TOP,'Standing height must follow the rendered road');
          }
        }
      }
      for(const id of ['tideham','greenlane','haven','sunstep']){
        const path=pathToCapitol(id);
        for(let i=1;i<path.length;i++)for(let j=0;j<=10;j++){
          const x=path[i-1][0]+(path[i][0]-path[i-1][0])*j/10,y=path[i-1][1]+(path[i][1]-path[i-1][1])*j/10;
          assert(ROAD_NETWORK.some(r=>nearRoad(x,y,r)),'Supply runners must stay on roads: '+id);
        }
      }
      const lines = ROAD_NETWORK.map(r=>({ ...r, points:r.points.map(p=>[...p]) }));
      for (const line of lines) line.points = line.points.map(([x, y]) => [(x - 1400) * 0.05, (y - 740) * 0.05]);
      assert.equal(roadFootprint(lines).length, 1, "Every town street must connect to the road network");
      const allArea=area(roadGeometry(lines,ROAD_TOP));
      const surfaces=['dirt','gravel','cobble'];
      const layeredArea=surfaces.reduce((sum,surface,index)=>{
        const geo=roadGeometry(lines.filter(r=>r.surface===surface),ROAD_TOP,false,lines.filter(r=>surfaces.indexOf(r.surface)>index));
        const result=area(geo);geo.dispose();return sum+result;
      },0);
      assert(Math.abs(layeredArea-allArea)<0.001,'Material joins must cover the network exactly once');
      for (const shoulder of [false, true]) {
        const geo = roadGeometry(lines, ROAD_TOP, shoulder);
        assert(area(geo) > 0, "The full road network must triangulate");
        const p = geo.getAttribute("position");
        const uv = geo.getAttribute("uv");
        for (let i = 0; i < p.count; i++) {
          assert(Number.isFinite(p.getX(i)) && Number.isFinite(p.getZ(i)));
          assert(Math.abs(p.getY(i) - ROAD_TOP) < 0.000001);
          assert(Math.abs(uv.getX(i) - p.getX(i) / 2.4) < 0.00001);
          assert(Math.abs(uv.getY(i) - p.getZ(i) / 2.4) < 0.00001);
        }
        geo.dispose();
      }
      for (const geo of [single, crossing, duplicate, blockGeo]) geo.dispose();
      console.log("Road checks passed: junctions, duplicate faces, block holes, winding, UVs, surface transitions, pond clearance, land routes, runner paths, standing heights, full network.");
    `,
  },
  bundle: true,
  write: false,
  platform: "node",
  format: "esm",
});
try {
  await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}

