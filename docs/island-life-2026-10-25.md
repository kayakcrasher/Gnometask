# Island life and open land

Adds 338 paid countryside deeds across the main island. Historical parcel IDs,
player home, prices and ownership remain compatible. New grid cells are clipped
to dry land, public corridors and existing parcels; fragments under 1,000 map
square units are excluded. Lakes, peaks, civic buildings and existing private
homes remain reserved. This does not sell the offshore procedurally generated
islands. Existing market pricing, appreciation and resale apply to the new deeds.

Bramblewood National Park reserves a small forest around the existing picnic
lookout. Deed polygons exclude it; construction, road building and tree chopping
reject it. Existing walking trails and sightseeing stay accessible. The shared
atlas names the park and the existing world lookout explains its protection.

Deeds offers Nearby, Thimblehaven, West and East views plus a native nearby-plot
selector for phones. NPC interaction meshes are enlarged without changing their
appearance. Residents' visiting routines choose real nearby storefront/home
entrances, use existing collision-aware routes, wait at destinations, and rest
at night. Existing economic simulation continues to determine growth and moves.
This update does not invent purchases or transfer coins when an NPC walks.

Sailing now uses a continuous spatial prevailing breeze. Automatic trimming
keeps tap-to-destination navigation; headwinds slow sailboats but never strand
them. Rowboats and engine-fitted boats ignore wind speed penalties. Small boats
accelerate and visually turn faster than heavy hulls. The existing sea panel
shows the wind arrow. Safe water routes, hull collision checks and actual-distance
XP remain authoritative.

Verification: check:island-life covers deed count/IDs, sampled historical overlaps,
park exclusion, clipped ownership, save migration, wind bounds, real NPC visits
and hull response. Existing gameplay suites, TypeScript and mobile browser smoke
checks cover regressions. Signed Android test build: 0.1.8-island-life (9).
