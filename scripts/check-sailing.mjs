import { build } from "esbuild-wasm";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const result = await build({
  stdin: {
    resolveDir: root,
    contents: `
      import assert from "node:assert/strict";
      import { BOATS } from "./src/lib/game/data/boats";
      import { PLACE_ANCHORS } from "./src/lib/game/data/layout";
      import { clearSeaSegment, HARBOUR_APPROACH, navigableWater, seaRoute, sailingSpeed } from "./src/lib/game/sailing";
      import { xpForLevel } from "./src/lib/game/xp";
      import { defaultSave, migrate } from "./src/lib/game/save";
      import { gatherSlice } from "./src/lib/game/store/gather";
      import { honourSlice } from "./src/lib/game/store/honour";
      import { UI_SEED, snap } from "./src/lib/game/store/persist";

      for (const boat of BOATS) assert(navigableWater(boat.x,boat.y), boat.name + " must spawn in navigable water");
      assert(navigableWater(HARBOUR_APPROACH.x,HARBOUR_APPROACH.y));
      assert(!navigableWater(1000,600));
      assert(!navigableWater(4200,760),"The expanded desert is land");
      assert(!clearSeaSegment({x:NaN,y:0},HARBOUR_APPROACH));
      const start = {x:-300,y:530};
      const target = {x:4700,y:760};
      assert(!clearSeaSegment(start,target),"The island blocks a direct east-west crossing");
      const route = seaRoute(start,target);
      assert(route && route.length > 1,"Route must go around the island");
      let previous = start;
      for (const point of route) { assert(clearSeaSegment(previous,point),"Every route leg must clear land"); previous = point; }
      assert.deepEqual(route.at(-1),target);
      assert.equal(seaRoute(start,{x:1000,y:600}),null);
      assert(sailingSpeed("sloop",0)>sailingSpeed("row",0));
      assert(sailingSpeed("barge",0)<sailingSpeed("row",0));
      assert.equal(sailingSpeed("row",xpForLevel(99)),225,"Skill speed bonus must cap at 25%");

      let state;
      const get = () => state;
      const set = patch => Object.assign(state,typeof patch === "function" ? patch(state) : patch);
      const actions = {...gatherSlice(set,get),...honourSlice(set,get)};
      const reset = () => { state = {...defaultSave(),...UI_SEED,...actions,atHome:false,named:true,
        coins:1000,respect:100,gnomeX:PLACE_ANCHORS.dock.x,gnomeY:PLACE_ANCHORS.dock.y,
        toggleTask: id => { state.tasks = state.tasks.map(t => t.id === id ? {...t,done:true} : t); }}; };
      reset();
      state.sailTo("haven","sloop");
      assert.equal(state.afloat,null,"Unowned hulls cannot be boarded");
      state.sailTo("haven","row");
      assert.equal(state.afloat,"row");
      assert.equal(state.skills.sailing,0,"Casting off must not grant XP");
      state.sailTo("dock");
      assert.equal(state.afloat,null);
      assert.equal(state.skills.sailing,0,"Docking must not grant XP");
      state.gnomeX=1000;state.gnomeY=600;
      state.sailTo("haven","row");
      assert.equal(state.afloat,null,"Cannot board a harbour boat remotely");
      reset();state.sailTo("haven","row");
      state.sailingDistance=599;
      state.sailStep(-60,470);
      assert.equal(state.sailingDistance,609);
      assert.equal(state.skills.sailing,24,"Travel should grant boat-specific XP");
      const xp=state.skills.sailing;
      state.sailStep(-400,470);
      assert.equal(state.gnomeX,-60,"A teleport must not count as a movement step");
      state.sailStep(-60,470);
      assert.equal(state.skills.sailing,xp,"Standing still must not award XP");
      state.sailTo("haven","sloop");
      assert.equal(state.afloat,"row","Cannot change hulls at sea");
      for(let x=-70;x>=-300;x-=10)state.sailStep(x,470);
      state.sailTo("dock");
      assert.equal(state.afloat,"row","Remote return must sail, not teleport");
      assert.equal(state.sailHome,true);
      assert.equal(state.gnomeX,-300);
      const saved=migrate(snap(state));
      assert.equal(saved.sailingDistance,state.sailingDistance,"Voyage distance must persist");
      assert.equal(saved.skills.sailing,state.skills.sailing);
      assert.equal(saved.afloat,"row");
      assert.equal(migrate({...snap(state),sailingDistance:undefined}).sailingDistance,0,"Old saves need a distance default");
      assert.equal(migrate({...snap(state),afloat:"bad-hull"}).afloat,null);
      reset();state.takeLoan("sloop");
      assert.equal(state.loan,null,"Loans must obey Sailing requirements");
      state.skills.sailing=xpForLevel(2);
      state.buyBoat("sail");
      assert(state.hulls.includes("sail"));
      assert.equal(state.coins,960);
      state.sailTo("haven","sail");
      assert.equal(state.afloat,"sail");
      state.sailTo("dock");
      // A rowboat cannot borrow the capabilities of a better owned hull.
      state.afloat="row";state.boatRank=5;state.hulls=["sail","sloop"];
      state.castLine("sea",-50,470,"sloop");
      assert.equal(state.fishing,null);
      assert.match(state.speech,/rowboat/);
      const afloatX = state.gnomeX;
      state.castLine("shore",96,548);
      assert.equal(state.gnomeX,afloatX,"Shore fishing must not teleport a boat onto land");
      assert.equal(state.afloat,"row");
      state.afloat=null;
      state.castLine("sea",-50,470,"sloop");
      assert.equal(state.fishing,null);
      assert.match(state.speech,/Board a boat/);
      console.log("Sailing checks passed: coastal routes, hull speeds, XP from travel, boarding, docking, loans, fishing, saved voyages.");
    `,
  },
  bundle: true,
  write: false,
  platform: "node",
  format: "esm",
  alias: { "@": `${root}src` },
});
try {
  await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
