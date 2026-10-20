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

## Point-and-click combat

Tap an enemy once. Your gnome approaches melee range and attacks automatically on a 600 ms combat clock, normally once every four ticks. Each enemy has its own attack rhythm. Nearby opponents have large touch labels; attack timing never speeds up when you tap repeatedly. Regular world creatures keep fixed stats, so better gear and skill training make them easier, and return roughly 45 seconds after defeat while you play. Quest enemies and island defenders keep their existing completion rules.

Choose Attack, Strength or Defence to train that skill through damage dealt. Taking hits does not grant free Defence experience. Eating restores health immediately but delays your next attack for three ticks; the enemy keeps attacking. Power strike queues one stronger hit for the next attack, while Guard softens the next incoming hit and has a cooldown. Stopping your attacks does not stop your opponent.

Tap ground to retreat and move, or press Retreat to disengage over a short period. You can still be hit while nearby, and retreat preserves your location and health instead of teleporting or healing you. Victories do not grant a free heal. Defeat recovers at your current home. Switching away from the app pauses the encounter without replaying missed attacks on return.

Run `npm run check:combat` for timing, repeated input, food, defence, training, retreat, rewards, respawns and target validation checks.

## A little island music box

Eight original instrumental themes accompany home, gardens, the harbour, woods, village, Sunstep, moonlight and adventures. Soft piano, harp-like strings, flute and bells play alternating verses with gentle transitions. Choose **Menu → The little music box** to follow your surroundings or keep a favourite tune, adjust music / nature / effects separately, or mute everything. Preferences are remembered on this device separately from game saves. Audio begins after a tap or key press and pauses when the game is hidden; no audio downloads or accounts are needed.

A tiny songbird music box sits on the cottage table; tap its note to pause or resume music. Butterflies drift near gardens by day and little fireflies appear near the pond after dusk. These outdoor decorations respect reduced-motion preferences.

Run `npm run check:music` to check compositions, alternate verses, scene choices and stored preference validation.

## The northern countryside

The main island now extends far beyond Mount Noble, with a western mountain spine, a deep northern bay, three freshwater lakes, forest trails and picnic lookouts. Existing towns, homes, deeds, quests and harbour coordinates stay in place. Open **Atlas** beside the minimap for the full island and walking destinations. Walking routes go around freshwater and coastal inlets; the sailing area and low-power map also cover the expanded world.

Fernmeadow, Willowbank and Bellweather Bay are future neighbourhoods separated by open countryside. Explore their paths immediately, then commission the three additional Road crew projects in order: **1,900 / 3,800 / 7,600 coins**, with Hall and island-wealth requirements. Each project unlocks its own group of nine purchasable deeds and six surveyed NPC home sites. Road corridors stay public and narrow; lakes and mountain slopes are excluded from usable deed land. Choose a district in the land or city planner for a closer view.

Healthy island economies attract up to fifty-four new gnome households to unlocked, clear surveyed sites. Families bring savings and pay 200 coins for their first house. They cannot settle on player deeds, streets or existing buildings; normal NPC home upgrades continue afterward. Player city capacity is now 120 buildings and 180 road sections, with existing coin costs and increasingly expensive upgrades. Trees clear around new construction, and nearby forest batches use instancing to limit mobile rendering work.

Run `npm run check:frontier` to verify geography, journeys, lake avoidance, road clearance, district access, construction sites, family arrivals and save migration.


## Living towns and donkey travel

Residents earn wages linked to island prosperity, pay household living costs, and save for houses and upgrades. Home construction and extra floors cost progressively more. Settler families can move away after sustained hardship; core quest characters stay. Vacant houses retain their upgrades, and future arrivals can live in them. Full northern neighbourhoods survey additional clear sites along completed roads, respecting player deeds and existing streets.

The original modular home kit has four styles—meadow timber, harbour cottage, mossy stone and Sunstep adobe—and five storey levels. Roofs, upper floors, dormers, porches, conservatories and paid decorations have visible meshes. Player cottages, estates, workers’ housing and civic homes use the kit. Choose your own home style in **Deeds → Your city**; decorators charge 90 coins per cottage tier, preserving existing upgrades.

Open **Travel** to buy a personal donkey cart for **480 coins**, or hail a nearby covered passenger wagon. Public rides cost **6 coins**, travel automatically along the road, and wait six seconds at either end. **Hop off wagon** exits beside the road. Your cart follows ordinary tap-to-walk destinations faster than walking.

Town owners with a city home and trade depot can buy wagon services. The first costs **1,800 coins**, later purchases cost 1,800 times the square of the new fleet size. Public roads and completed road projects provide route choices. Nearby NPC passengers pay fares from their own purses; each service arrival costs the owner **2 coins** for upkeep. Services pause when the owner cannot fund upkeep. Vehicle purchases, ownership, progress, and fares survive saving; hidden tabs and blocked gameplay pause transport, without catching up missed time. Delivery carts remain separate from passenger travel.

The sailing bounds now extend beyond the expanded island on every side. The atlas and minimap zoom out while afloat to include the offshore water. Boats still avoid land and use the existing sailing skill progression.

Run `npm run check:living-towns` for boarding, fares, ownership, vehicle migration, household departures, neighbourhood growth and offshore sailing.
