import { build } from "esbuild-wasm";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const result = await build({
  stdin: {
    resolveDir: root,
    contents: `
      import assert from "node:assert/strict";
      import { sharePrice, priceSeries, eventsOn, latestEvent, eventsThrough } from "./src/lib/game/data/market";
      import { quoteShareTrade } from "./src/lib/game/trading";
      import { honourSlice } from "./src/lib/game/store/honour";
      const legacy = {g500:[8,9,13,14,67,239],hull:[14,15,12,9,2,1],pie:[9,8,9,11,34,78],salt:[16,15,16,19,47,156],moss:[7,6,12,14,53,112],lantern:[12,11,9,6,1,1],keen:[18,19,20,24,83,298],mail:[15,14,13,12,51,97],oar:[20,21,21,22,49,126],wall:[13,14,19,17,88,301],clarion:[10,9,9,9,27,85],gilded:[11,10,7,6,41,115]};
      for (const [id, expected] of Object.entries(legacy)) {
        assert.deepEqual([0,1,7,12,90,365].map(d => sharePrice(id,d)), expected, "Existing portfolios must retain their prices");
        for (const day of [365,0,90,1,12]) {
          const series = priceSeries(id, day, 30);
          assert.equal(series.at(-1), sharePrice(id,day));
          assert.equal(series.length, Math.min(30,day+1));
          assert(series.every(Number.isFinite));
        }
      }
      for (let day = 0; day <= 365; day++) {
        const events = eventsThrough(day);
        assert.deepEqual(eventsOn(day), events.filter(e => e.day === day));
        assert.deepEqual(latestEvent(day), events.at(-1) ?? null);
      }
      assert.equal(sharePrice("g500", Infinity), 8);
      for (const quantity of [0,-1,1.5,NaN,Infinity,Number.MAX_SAFE_INTEGER]) {
        assert.equal(quoteShareTrade("g500",1,100,{g500:5},"buy",quantity),null);
        assert.equal(quoteShareTrade("g500",1,100,{g500:5},"sell",quantity),null);
      }
      assert.equal(quoteShareTrade("unknown",1,100,{},"buy",1),null);
      assert.equal(quoteShareTrade("g500",1,8,{},"buy",1),null);
      assert.equal(quoteShareTrade("g500",1,100,{g500:2},"sell",3),null);
      let state = {coins:90, shares:{}, daysPlayed:1, coinPopKey:0};
      const get = () => state;
      const actions = honourSlice(patch => Object.assign(state,patch),get);
      actions.buyShare("g500",10);
      assert.equal(state.coins,0);
      assert.equal(state.shares.g500,10);
      actions.buyShare("g500");
      assert.equal(state.coins,0, "Insufficient funds must not mutate balances");
      actions.sellShare("g500",11);
      assert.equal(state.shares.g500,10, "Overselling must not mutate holdings");
      actions.sellShare("g500",4);
      assert.equal(state.coins,36);
      assert.equal(state.shares.g500,6);
      actions.sellShare("g500",6);
      assert.equal(state.coins,90, "Same-day round trips must conserve coins");
      assert.deepEqual(state.shares,{});
      actions.buyShare("pie");
      assert.equal(state.shares.pie,1,"Existing one-share callers must still work");
      console.log("Market checks passed: legacy prices, charts, events, order validation, bulk trades, balance conservation.");
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
