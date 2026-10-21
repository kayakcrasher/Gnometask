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

## The Exchange, hard times and the northern land market

The island economy now follows live Exchange confidence and town security, rather than the player’s wallet. One market day passes after forty active nine-second world ticks (about six minutes). Market cycles affect every displayed and executable share quote. Raids, the beachhead and badly damaged buildings reduce confidence; clearing enemies and repairing towns helps restore it. Stable and booming conditions support jobs, immigration and housebuilding; recessions and depressions slow factories and reduce worker-cottage populations. Market-week dividends use live prices and are recorded so a saved payout cannot repeat. Active raids are saved with the economy so reloading does not remove their effect on prices.

Households hold small Exchange investments, use savings in hard times and can sell unused northern land before losing their home. Sustained hardship can leave a family at the northern waystation. Some seek honest work, some leave for another island, and some resort to theft or unlicensed moonshine. Crime transfers coins between real NPC purses. Houses and their improvements remain after a departure. Work, savings and the player-funded relief pool can help a homeless family return to a vacant home. Open **Menu → Island outlook** to see conditions and contribute 30 coins to relief.

Gnomes with sufficient savings can purchase unowned northern deeds beside completed roads and plan homes there. They respect player deeds and other residents’ property. The player can charter their city as the **Gateway to the Rugged North** from **Deeds → Your city**: 1,200 coins, Hall 4, a city home, a northern trade depot, Noble Reach avenue and a stable economy are required. The charter raises northern demand; northbound land buyers pay a 2-coin arrival levy from their own savings.

Deeds now have live purchase and sale quotes. Value responds to the market, security, completed access roads, nearby homes and northern demand. Empty plots can be held and resold after appreciation, or sold at a loss in a downturn. The land board’s sale offer has a 15% spread, preventing an immediate profitable round trip. Purchase cost, realised gains/losses and ownership survive saving; developed city land and homes still cannot be sold as empty plots.

**Sunstep Crescent Harbour** is a visible future-dock concept on the southeastern coast: twin cruise berths, a shaded customs pavilion, cargo handling, a ferry landing, a wagon plaza and a beacon behind a breakwater. Tap **Sunstep harbour plans** to inspect it. The translucent planning models do not claim existing land or provide a working port; final land purchase and construction funding are future work, following the court decision.

The dock case now includes passionate openings, discovered evidence and closing addresses from both sides, with Justice Arbuthnot framing the stakes. **Pause hearing**, **Next statement** and **Hear ruling** let you read at your own pace. The speeches do not change evidence unlocks or verdict weights.

Run `npm run check:economy` for market/security conditions, live trade quotes, dividends, raid persistence, land appreciation, homelessness, recovery, crime, northern purchases, relief, charters and court framing.

### Mossroot banking and Thimblehaven ports

New games open **Mossroot Consolidated Bank**'s starter-loan ledger before the tutorial: choose **25,000, 50,000 or 105,000 coins**, co-signed by Ol Pappy. The full amount is added to the starting purse once. Interest is **0.6% per seven in-game market days**, rounded up to whole coins and added to the outstanding balance; the confirmation screen explains this compounding. Make partial or full repayments through **Bank & harbour → Mossroot bank** or Quill's bank counter, with no repayment fees. Paying off the account never opens another starter loan. Existing saves receive no automatic money or debt; an unused starter loan can be chosen in the bank ledger. Interest does not run on a real-world timer.

**Thimblehaven** starts on the rugged northern shore of Thimble Bay, with two cottages, a harbour office / Mossroot branch and a free public landing. Board a boat at Tideham, then choose **Bank & harbour → Ports & freight → Sail to Thimblehaven public landing**. The atlas labels the settlement. Waterfront deeds require a visit to the plot and cost 18,000 or 24,000 coins in the north, or 12,000 at Tideham's South Reach. Their water easements are separate from public roads and town deeds. A seventh paid road-crew project connects the northern wharves; two adjoining Thimblehaven residential lots open when the crew completes it.

Build a **15,000-coin finger pier**, upgrade for **45,000** to a twin-berth cargo wharf, then for **180,000** to a three-berth crane harbour. Pick timber, mint or slate finishes; each refit costs 2,500 coins per dock level. Owned piers support boarding and mooring, while the public northern landing remains free.

The **Little Acorn Coaster** (14,000 coins, Sailing 8) and **Pinewake Packet** (65,000, Sailing 14) are coastal freighters. The premium fleet includes the **Moonpetal Yacht** (1.25 million, Sailing 25), **Aurora Explorer** (4.8 million, Sailing 40) and **Gilded Acorn** (12 million, Sailing 60), each with an original 3D hull and deck design. Rotate their models in the fleet showroom. Existing boats retain their prices and skill gates.

Cargo-capable hulls can run paid freight from an owned wharf to the public harbour or another owned dock. Buy cargo and pay crew costs on dispatch; the displayed economy-sensitive sale price locks then. Recessions can make a contract unprofitable. Boats follow surveyed clear-water routes, pay once when unloading and remain reserved while sailing home. Berth capacity, cargo payments, voyage legs, elapsed travel and settlement receipts survive saving. Voyages pause when the tab is hidden, during combat, abroad and at the title screen; there is no automatic offline freight income.

Six visible, hull-specific fittings add 12% sailing speed (rigging), 20% speed (acorn drive), 50% cargo capacity (expanded hold), faster casts (tackle rack), navigation lamps or an aft canopy. Fit them at a public landing or owned wharf. **Fish from boat** works on every player hull with a rod; rowboats and beginners catch shallow-water species until their hull and Fishing skill allow deep-water fish.

Run `npm run check:banking-ports` for loan-credit, compounding, repayment, waterfront gates, navigable shipping lanes, saved round trips, fitting bonuses, boat-fishing and old-save checks.

### Player-run Thimblehaven and Naval Warfare

New games now begin beside the player's home in **Thimblehaven**. Existing saves move the existing player home there once, preserving furniture, cottage upgrades, other city buildings, coins and cargo. The starter home has its own protected deed. **Thimblehaven council** funds five increasingly expensive projects: well and lamps (800), fish market (2,500), donkey depot (4,800), newcomer cottages (9,000), and harbour town hall (18,000 coins). Buildings appear as projects finish. The town starts with two households; healthy market conditions attract families into the new housing, while depression and exhausted purses can cause departures. Household levies of 0–3 coins come from residents' own purses and enter the player's wallet every ten active world ticks, roughly 90 seconds.

Locals and several established NPCs make snide remarks about “no roads to Thimblehaven.” Finishing the harbour-road project changes their complaint to the missing donkey traffic. A funded, town-owned **thimble-road** wagon service ends the jokes. The council shows the next road-crew project and can purchase a wagon once the depot and road are ready; wagon upkeep remains 2 coins per arrival.

**Naval Warfare** is a separate saved skill. Actual hull damage grants XP and improves cannon damage. Ship combat is independent of sword combat: approach a hostile vessel within 350 map units, engage it, then command broadsides or let hired gunners fire automatically. Friendly coastguard ships and licensed privateers cannot be attacked. Enemy and player damage, active engagements, remaining reloads, hired crew, ammunition and defeated-ship respawn periods survive saving. Retreat orders a voyage toward a public harbour; enemy guns remain active until the player sails out of range. A defeated player is towed ashore with their boat retained but damaged, requiring paid repairs.

Cannons now belong to individual hulls. Rowboats carry at most **1**, skiffs/fishers/sloops **2**; larger hulls carry 4–12. The new purchasable fighting fleet has original hulls, masts, gunports and colours:

| Ship | Coins | Sailing | Naval Warfare | Maximum guns |
| --- | ---: | ---: | ---: | ---: |
| Acorn Guard Cutter | 45,000 | 8 | 3 | 4 |
| Briarwatch War Brig | 280,000 | 16 | 8 | 8 |
| Ironroot Frigate | 2,400,000 | 30 | 20 | 16 |
| Blackcap Corsair | 85,000 | 10 | 5 | 6 |
| Crown of Thorns galleon | 6,800,000 | 45 | 35 | 20 |

Hull purchases do not include cannons or crew. At a public landing or owned wharf, open **Naval command** to fit cannons (45 coins each), hire gunners (350 coins × the next crew member's number), buy 20 shot for 30 coins, and repair damage for 3 coins per hull point. A captain alone fires up to two fitted guns; hired gunners fire one each and receive 1 coin per shot. Each gun consumes one cannonball and every salvo reloads for six seconds. Old saves with the former global cannon purchase receive one fitted gun on each already-owned hull, plus a small ammunition allowance; future boats require their own fittings.

`npm run check:northern-seas` verifies home migration, paid town growth, road/service dialogue, household levies, cannon caps, paid automatic crew, friendly protection, range and reload rules, damage-based XP, single-payment victory, persistent damage, defeat rescue, repairs and legacy saves.

### Open ocean, island ports, wreck boarding and the Little Lifeline

The navigable ocean now spans **23,000 × 23,000 map units**. Each new game generates and saves its own island seed: eight islands in the outer sea, including six small harbour towns and two wild islets. Their coastlines, locations, cottage counts and discoveries stay fixed when reloading. Existing saves receive a stable archipelago without moving the main island, player homes or deeds. Terrain, walk collision, boat collision, the atlas and ocean chart use the same seeded coastlines.

Open **Ocean chart** to set a course to a public island landing, Tideham or Thimblehaven. Harbour towns have a market, cottages, trees, a walking trail and a public wharf. Go ashore and follow the signs between the landing and market. Town ports provide paid repairs, boat fittings, gunners, ammunition and six-coin bread. Uninhabited islets have basic landings and fishing, but no repair yard. Existing player freight wharves can dispatch contracts to the island towns; both outbound and return voyages survive saving.

Eight additional pirate ships patrol the outer islands and may attack when the player sails within 180 units. Enemy ships have health bars above their hulls and in the naval combat HUD. Sail beyond 350 units to break an engagement. Friendly ships remain protected from player attacks.

A hostile ship at **zero hull** becomes a wreck instead of paying an automatic bounty. Sail within **180 units**, choose **Climb aboard**, then **Search the cargo hold**. The player appears on the wreck's deck, leaving their own boat alongside. Searching awards the ship's salvage coins, ten cannonballs and two cloth bundles **once**. Save/load and reboarding preserve the searched flag. Wrecks last two active minutes: boarding and looting close for the final twenty seconds while the wreck visibly sinks. Anyone still aboard is returned safely to their own boat; uncollected loot is lost. Boat movement, fishing and normal combat are blocked while boarding.

If the player's hull reaches zero, it stays disabled at its actual position and calls **Captain Mallow's Little Lifeline**, an original tug with a curved teal hull, cabin, tyre fenders, life ring and towline. The tug travels from a public repair port to the player, then tows the remaining hull along a clear-water route to port. The camera widens during rescue. Hull identity, fittings, crew, incoming-tug progress and towing progress are saved. The disabled hull remains visible at its recovery berth and **cannot sail until paid repairs** restore it. The existing shipwright price remains three coins per hull point; towing itself is free, including for penniless sailors. Ocean chart also offers a voluntary tow for stranded sailors outside active combat.

Wreck timers, patrols and tow progress pause at the title screen and when the app/tab is hidden. No real-world offline burst of attacks, sinking or tow progress is applied on return. `npm run check:open-ocean` covers seeded geography, water routes, island services, patrols, boarding and single-payment loot, wreck expiry, saved tow stages, disabled-ship departure gates, repair payments, island freight persistence and old-save migration.
