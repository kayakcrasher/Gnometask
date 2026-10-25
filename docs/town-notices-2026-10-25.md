# A reason to grow Thimblehaven

The council now has a Noticeboard tab, also accessible by tapping a new wooden
board beside the player's home at (2180, -3025). Players can browse remotely,
but accept work and claim rewards only while standing within 140 map units,
ashore, outside fights, interiors, transport, fishing and naval events. The board
is reserved public construction space for new works; existing saved homes and
roads keep their sites during restoration. Walking buttons use existing safe routes;
they do not teleport the player.

Six optional notices cover sprat deliveries, carrot baskets, visiting the park,
mail to Port Victoria, resolving new encounters, and completing new freight.
Three can be active. Deliveries consume only the specified inventory goods;
aquarium fish and other species are untouched. Visits record a real land-position
update at the destination. Encounter and freight contracts snapshot the existing
counters on acceptance. Old achievements do not satisfy a new commission.

There are no deadlines. After at least three payments, finish or return remaining
accepted work and pin another round. Unaccepted notices are replaced. Requests
scale modestly every three rounds with a fixed cap. Cancellation costs nothing.
Completed jobs cannot pay twice; resources are rechecked at hand-in. Terms retain
the town bonus quoted at acceptance rather than changing under an active job.

Six milestones recognise visiting home, village lamps, a functioning market and
three favours, five households, an operating road/wagon connection, and a town
charter. Rewards are claimed once. The welcome milestone supplies carrot seeds;
lamps unlock later patrols; the market unlocks freight work; five households grant
10% more pay on new jobs; the connection grants 600 extra transport coins; the
charter grants 25% commission pay and a gold board roof. The charter requires all
prior milestones, the town hall and an owned northern dock. Existing town
construction prices and economic growth rules still apply. No combat is required
to refresh the board or earn the charter.

Save version 15 persists a separately validated townProgress object through all
normal save paths. Older saves receive an empty board, retaining their city,
inventory, deeds and home. Existing achievements can qualify for their relevant
milestones, but board rewards are never silently credited during migration.

check:town-notices verifies real prerequisites, one-time payments, combat/position
restrictions, inventory consumption, fresh progress, saved visits, refresh rules,
legacy saves and malformed state. Mobile browser tests exercise the actual signed
APK bundle. Phone performance still requires on-device playtesting.
