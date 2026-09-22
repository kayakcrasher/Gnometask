# Hollow Watch

A gnome island that grows as you defend it. Click the land to walk. Chop timber, raise walls, keep shop, and watch the ridge.

Ol Pappy St. Francis greets you. Watcher Greg sells cheap perches and shouts when a Mucktooth Clan boat lands.

Nature models are [Kenney Nature Kit](https://kenney.nl/assets/nature-kit) (CC0). Gnomes, houses, and gear are original meshes. Bronze is brown, iron is grey, steel is pale, adamant is green.

## Where to edit

Content lives in `src/lib/game/data/`. Engine and UI stay out of those files.

| File | What it is |
|---|---|
| `src/lib/game/data/skills.ts` | Woodcutting, combat, prayer, farming, barter, sailing… |
| `src/lib/game/data/tiers.ts` | Wood / bronze / iron / steel / adamant colours and stats |
| `src/lib/game/data/catalog/weapons.ts` | Five-tier swords |
| `src/lib/game/data/catalog/tools.ts` | Five-tier hatchets and hoes |
| `src/lib/game/data/catalog/armour.ts` | Five-tier shields and mail |
| `src/lib/game/data/catalog/towers.ts` | Archer towers (upgrade at the perch) |
| `src/lib/game/data/trees.ts` | Tree spots, stumps, grow timers |
| `src/lib/game/data/chores.ts` | Daily works (timber, walls, watch) |
| `src/lib/game/data/catalog/hats.ts` | Hat shop |
| `src/lib/game/data/npcs.ts` | Ol Pappy, Watcher Greg, neighbours |
| `src/lib/game/data/landing.ts` | Mucktooth Clan boat of five |
| `src/lib/game/data/quests.ts` | Pappy timber, expand, landing |

## Run

This tree is the game source. The live preview on Grok App Builder runs the full app. Clone, then overlay onto a Vite + React + R3F shell, or keep editing here and push.
