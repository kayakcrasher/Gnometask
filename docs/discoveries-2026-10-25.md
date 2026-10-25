# Coastal salvage and treasure maps

Three abandoned cargo wrecks have stable positions derived from the saved world
seed near public/northern harbours. Positions are checked for navigable water;
the existing route planner guides any sound boat to them. They are separate from
combat wrecks: no battle or sinking countdown is required. Each grants coins,
one cloth bundle, 25 Sailing XP and a distinct two-clue map exactly once.

Open Ocean chart → Discoveries for the journal. Follow a map's first landmark,
search locally on foot, then follow its second clue. Clues use existing walkable
lookouts at Bramblewood, Mirror Lake, Snowbell Pass and Thimble Bay. Nothing is
cut down or dug up in the national park. Walking/sailing buttons use ordinary
safe routes rather than teleporting the player. Each final cache grants coins,
40 Crafting XP and one keepsake displayed on a shelf in the player's cottage.

Salvage and search actions reject remote claims, combat, fishing, interiors,
boarding, rescues, wagon rides and pending starter loans. Salvage also requires
a sound boat; landmark searches require being ashore. Completed finds never
repeat. Combat loot, ship damage, towing and sinking timers are unchanged.

Save version 17 stores validated salvage IDs, clue steps and claimed treasures.
Legacy saves begin with an empty journal. New automated checks cover geography,
route access, ordered searches, interaction guards, duplicate rewards and save
migration. A mobile browser smoke test uses the APK's actual bundled assets.
Android: version 13 / 0.1.12-discoveries.
