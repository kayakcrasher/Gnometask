# Gnome Tasks

A cozy 3D gnome-island chore game. Click to walk, turn the camera like the old school, chop trees, keep shop, and argue with a dragon.

Nature models are [Kenney Nature Kit](https://kenney.nl/assets/nature-kit) (CC0). Gnomes, houses, and gear are original Three.js meshes. Bronze is brown, iron is grey, steel is pale, adamant is green.

## Where to edit

Content lives in `src/lib/game/data/`. Engine and UI stay out of those files.

| File | What it is |
|---|---|
| `src/lib/game/data/skills.ts` | Woodcutting, combat, prayer, farming, barter, sailing… |
| `src/lib/game/data/tiers.ts` | Wood / bronze / iron / steel / adamant colours and stats |
| `src/lib/game/data/catalog/weapons.ts` | Five-tier swords |
| `src/lib/game/data/catalog/tools.ts` | Five-tier hatchets and hoes |
| `src/lib/game/data/catalog/armour.ts` | Five-tier shields and mail |
| `src/lib/game/data/trees.ts` | Tree spots, stumps, grow timers |
| `src/lib/game/data/chores.ts` | Daily chores |
| `src/lib/game/data/catalog/hats.ts` | Hat shop |
| `src/lib/game/data/catalog/house.ts` | Cottage upgrades |
| `src/lib/game/data/catalog/garden.ts` | Plants you can place |
| `src/lib/game/data/catalog/village.ts` | Village pieces (the lane grows as you place them) |
| `src/lib/game/data/catalog/food.ts` | Honey cakes, pies, stew |
| `src/lib/game/data/catalog/forts.ts` | Palisade through dragon gate |
| `src/lib/game/data/npcs.ts` | Town shops and gnome neighbours |
| `src/lib/game/data/quests.ts` | Side quests |
| `src/lib/game/data/enemies.ts` | Combat stats (rats start easy) |
| `src/lib/game/data/layout.ts` | Map slots, pack spawns, dragon ridge |
| `src/lib/game/data/places.ts` | Place names and blurbs |
| `src/lib/game/data/quotes.ts` | Speech lines |

3D world lives in `src/components/world/`. HUD panels are in `src/components/hud/`. Game state slices are in `src/lib/game/store/`. Combat math is `src/lib/game/combat.ts`.
