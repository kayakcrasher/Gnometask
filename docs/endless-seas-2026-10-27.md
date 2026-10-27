# Endless seas

The old ocean rectangle now defines the familiar chart rather than a movement
wall. Outside it, deterministic 4,096-unit cells generate new islands, wild
landings, harbour towns and pirate patrols. Each world seed and cell coordinate
always produce the same coastline, name, town status and architecture. Geography
queries compute the relevant cell directly; collision never depends on which
scenery happens to be loaded. The original eight islands and main island remain
unchanged, with a transition buffer beyond the old chart.

Ocean chart switches to a local view offshore and the minimap follows the player.
Explore North / East / South / West buttons plot the next 6,000-unit stretch using
normal safe navigation. Port courses split long journeys into safe legs and
replan automatically until docking. Route searches and straight-line checks have
a 30,000-unit per-call limit to avoid blocking a phone on a million-unit request;
this is a planning budget, not an ocean boundary. Direct local water taps and the
helm keep their existing gradual steering and shore assistance.

The water plane follows the player. Its wave shader uses global phase offsets,
matching hull heave while moving between regions. Nearby island meshes reuse
cached geometry and dispose it on unloading. Geography cache is capped at 192
cells and shipping-route cache at 128 entries. Only nearby generated encounters
are simulated/rendered. Fixed familiar patrols remain available. Discovery
history retains the latest 512 islands; geography remains reproducible after an
older discovery leaves that history. As with the rest of the renderer, practical
coordinate precision is finite; world generation is on demand rather than a
precomputed mathematically infinite map.

Frontier danger is 1 plus each full 4,096 units of distance outside the familiar
chart. Pirate hull health and salvage value rise with danger. Guns rise up to 24;
ship models progress from pirate hulls to brigs and frigates. Pirate patrols stay
in clear water and can ambush a nearby ship. Encounters retain wounds, battle,
wreck timers and loot flags across saving. Defeated frontier crews get a ten-minute
active-game cooldown in a bounded 256-entry ledger, so sailing out of a loaded
region does not immediately refill it. Expired encounters can respawn. Living
patrols unloaded outside the active region return at full strength. Health bars
use the generated fleet definition rather than current health as their maximum.

Generated harbour towns support the existing bakery, shipwright, powder,
specialist recruitment, landing and boarding actions. A distant SOS uses nearby
generated towns. Tow paths, destination identity and damaged hull state survive
reload, and arrivals leave repairs unpaid. Harbour navigation resolves a generated
port by its stable ID even when the region is not loaded. Long freight contracts
still require a full surveyed route within the route planning budget; they do not
teleport cargo across the endless ocean.

Three new giant species require a fitted deepwater rig, offshore clearance and:

| Species | Fishing | Minimum danger | Base length | Sale value |
| --- | ---: | ---: | ---: | ---: |
| Wandering sailfin | 65 | 2 | 4.2 m | 1,800 |
| Stormjaw tuna | 80 | 5 | 5.4 m | 3,500 |
| Crown leviathan | 95 | 9 | 6.2 m | 6,500 |

Catch lengths increase logarithmically with distance, including existing sea
species. Giants grow faster than ordinary fish. Fishing gear, hull and skill
gates remain authoritative: a rowboat cannot roll a frontier giant. Animation
scale grows with the actual catch (visually capped to fit the scene), and personal
length records persist in the Angler’s Journal. The journal now lists 26 species
and their frontier danger requirements. Existing claimed awards remain claimed.
Sale prices and XP remain species-based; record length itself does not mint coins.

Save version 20 adds optional frontier cooldowns and personal fish lengths. Legacy
saves preserve their worlds and receive empty records. Android versionCode 17 /
versionName 0.1.16-endless-seas.

Validation: `check:endless-seas` exercises hundreds of islands across seeds,
negative coordinates and cache eviction, old-edge crossings, million-unit local
windows, difficulty/length progression, generated harbour services, saved wounds,
loot/cooldowns, ambush escape, rescue/reload, finite homeward route legs, high-level
fish gates, completed-cast length persistence and bounded migration. The complete
regression suite and a phone browser run cover the integrated update. Browser
checks do not establish physical-device frame rate.
