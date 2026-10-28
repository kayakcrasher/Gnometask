# Harbour return and navigation fixes

“Return to harbour” previously requested a course to Port Victoria from anywhere,
including the rugged north and distant generated seas. It now selects the nearest
reachable working port, completed supply quay or owned wharf. Uninhabited beaches
remain available for manual landings, but do not count as working auto-return
ports. Actual movement still follows safe sea routes; there is no teleport or
extra provision debit. The helm adds a Nearest harbour button.

Stop ship now clears both the active route and pending port/home-course flags.
Docking also clears pending navigation. The older sailHome trigger delegates to
the same nearest-harbour action instead of forcing the capital. Fishing, cabin
visits, land fights, rescue and boarding cannot queue a new port course that might
start when the blocking activity ends. Naval retreat uses the same local port
selection while preserving incoming fire until the ship leaves enemy range.

The provisions panel adds Buy what I can afford. It caps purchases at available
hold space and whole crates affordable at five coins each. Spare coins stay in
the purse, stock remains hull-specific, and the existing guarded purchase action
still handles charging and eligibility.

## Verification

`npm run check:harbour-fixes` covers northern and generated-ocean returns, private
and municipal ports, safe route legs, docking, blocked course requests and
bounded affordable loading. Relevant sailing, banking/ports, northern seas,
open-ocean, consistency, ship life, supplies and TypeScript suites also run.

The updated `npm run test:supply-browser` uses phone touch controls against the
packaged APK: paid and affordable loading, hold limits, a moving ship stopping
without drifting, cancellation of queued navigation, boarding, helm access, town
construction, completed supply facilities, save/reload and phone/landscape bounds.
Physical Android performance still requires device testing. Android test version
is 0.1.21-harbour-fixes, version code 22; existing saves need no schema migration.
