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

## Build your city

Open **Deeds → Your city**. Buy an empty deed, name your city, then place **Your home** for 180 coins to move your existing cottage, furniture and upgrades into the city. Then tap your land on the construction map and confirm a building. Town Hall 2 unlocks trade depots, timber factories, workers’ cottages and streets; Hall 3 unlocks furniture factories. Buildings and roads preserve public streets, neighbours, waterways and mountain slopes. Finish Noble Reach avenue before developing northern deeds.

Place a factory and trade depot near connected roads. Buy factory supplies with coins and hire a donkey cart for 180 coins. Carts follow road centre lines, deliver finished goods, and pay the sale into your wallet once on arrival. Turn on **Automatic supplies** to have a cart buy up to 10 supply units for 3 coins each at the depot and carry them back to its factory. It never spends your logs. Without supplies or storage space, production stops.

Timber factories turn 1 supply unit into 2 crates worth 8 coins each; furniture factories turn 2 supply units and 2 operating coins into 3 crates worth 14 coins each. Production runs every 27 seconds, with up to one batch per building level. Depots increase cart capacity from 6 to 18 crates as they upgrade. After the first successful delivery, road-connected cottages attract residents and pay 1 coin per resident every 90 seconds. Upgrades reach level 3 and require coins and a higher Hall. All construction, including regional roads and estate homes, is coin-only.

To lay a street, choose **Gravel street**, tap and set a start, then tap an end and confirm. The road crew charges by length and snaps junctions onto existing streets. Extend from the public network across your own clear ground. Developed deeds cannot be sold as empty land. City buildings, streets, residents, supplies, cargo and earnings persist across saves. Production and travel pause when the game is closed, at home, in interiors, overseas or in combat.

Run `npm run check:city` for construction, road routing, delivery accounting, coin-only purchases, automatic supply conservation, home relocation, upgrades, population and save checks.

City setup prices increase 25% of the base price for each additional building of the same kind. City upgrades cost the base price times the square of the current level; home upgrades cost 240, 720 and 2,160 coins. All setup and upgrades use coins, never logs.

Fishing offers 20 species, including koi, seahorses, lionfish, swordfish, manta rays and starlight angelfish. The shared home/town hall aquarium costs 120 coins to set up, then 360 / 1,080 / 3,240 coins to expand to 20 / 40 / 80 spaces. Fish can be moved back to the bag without losing them. Existing aquarium collections are preserved when upgrading an old save.

## Explore indoors and meet wildlife

All 14 building interiors have a walking character. Tap clear floor to find a route around furniture, hold the on-screen direction buttons, or use arrow keys / WASD. Shop and home previews have an **Explore room** button for a full room view; **Back to room services** brings back the shop, aquarium or upgrade controls. Tap the front-door mat, or walk out through the front doorway, to return outdoors. Indoor movement never overwrites your outdoor position. Banking, trade, court, pub and casino controls remain available.

Wildlife uses original rounded models with recognizable faces, feet, ears, wings and tails. Rabbits and frogs hop; sheep and deer graze; chickens peck; cats and foxes flick their tails. Animals stop and notice nearby players. Tap them for a small observation; the quest chicken retains its usual interaction. Land animals avoid water and buildings, including new city construction, while ducks stay inside the pond and follow its water height. Wildlife movement pauses while you are indoors, overseas, in combat or at the title screen.

Run `npm run check:cozy` to verify indoor entrances, furniture routing, direction controls, wildlife habitat and construction clearance.
