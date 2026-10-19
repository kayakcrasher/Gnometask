import { build } from "esbuild-wasm";
const result = await build({
  stdin: {
    resolveDir: process.cwd(),
    contents: `
import assert from 'node:assert/strict';
import {MUSIC,THEMES,makeScore,themeForWorld,midiHz} from './src/lib/game/audio/score';
import {cleanSound,DEFAULT_SOUND} from './src/lib/game/audio/settings';
assert.equal(THEMES.length,8);assert.equal(new Set(THEMES.map(t=>MUSIC[t].title)).size,8);
for(const t of THEMES){const a=makeScore(t),b=makeScore(t,1);assert(a.duration>60&&a.duration<150);assert.deepEqual(a,makeScore(t));assert.notDeepEqual(a.notes,b.notes);let last=-1;for(const n of a.notes){assert(n.at>=last&&n.at<a.duration);last=n.at;assert(n.duration>0&&Number.isFinite(n.duration));assert(n.midi>=24&&n.midi<=96);assert(n.gain>0&&n.gain<.1);assert(Number.isFinite(midiHz(n.midi)));}assert(MUSIC[t].motifs.every(m=>m.includes(-1)));}
assert.deepEqual(cleanSound(null),DEFAULT_SOUND);assert.deepEqual(cleanSound({music:2,ambience:-1,effects:NaN,selection:'unknown'}),{...DEFAULT_SOUND,music:1,ambience:0});
const world={atHome:false,interior:null,combat:null,dayPhase:'day',afloat:false,abroad:null,city:{buildings:[]},gnomeX:600,gnomeY:600};
for(const [patch,expected] of [[{atHome:true},'home'],[{interior:'cottage'},'home'],[{interior:'casino'},'sunstep'],[{interior:'bank'},'village'],[{afloat:true},'harbour'],[{dayPhase:'night'},'moonlight'],[{gnomeX:2800},'sunstep'],[{combat:{phase:'fighting'}},'adventure']])assert.equal(themeForWorld({...world,...patch}),expected);
console.log('Music checks passed: eight original deterministic scores, alternate verses, safe notes, preference validation and scene selection.');
`,
  },
  bundle: true,
  platform: "node",
  format: "esm",
  write: false,
  logLevel: "silent",
});
try {
  await import(
    "data:text/javascript;base64," +
      Buffer.from(result.outputFiles[0].text).toString("base64")
  );
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
