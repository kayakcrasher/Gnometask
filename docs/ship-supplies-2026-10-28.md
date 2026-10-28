# Large-ship supply quays

Port Victoria has a permanent Quartermaster Quay south of its public landing,
with a wider timber deck, cargo warehouse, crane, lanterns, crates and water
barrels. Its shore approach is (100, 720), berth (-450, 720). Players can load
from shore or alongside the berth. The world button opens Fleet & parts on the
active or first owned large hull. Route buttons use existing staged navigation.

Thimblehaven unlocks a municipal supply quay after the harbour town hall. It costs
32,000 coins and takes 24 active construction beats. Funding twice is blocked;
loading and navigation unlock only after completion. It includes its waterfront
easement, independently of private freight plots. Shore: (1920, -2850), berth:
(1550, -3000). The construction site is included in the town builder display. Frontier trees
clear the loading corridor when work starts, keeping the pier and shore entrance
visible while preserving the surrounding forest.

## Supplies and safety

Provisions represent food, fresh water and lamp oil, at 5 coins per crate. Each
large hull has separate persistent stock and distance remainder. New purchases
start empty. Rowboats, sailing dinghies, fishing boats, barges and sloops are
exempt so early play remains accessible. Existing saves lacking shipStores get
one full hold per owned large hull. Once that field exists, absent hull entries
remain empty; reloads cannot replenish stock. Inputs and saved values are bounded.

| Hull | Capacity | Crates per 6,000 distance sailed |
|---|---:|---:|
| Coaster | 60 | 1 |
| Packet | 100 | 2 |
| Yacht | 120 | 2 |
| Expedition | 160 | 2 |
| Megayacht | 240 | 4 |
| Warcutter | 80 | 1 |
| Brig | 120 | 2 |
| Frigate | 160 | 3 |
| Pirate ship | 100 | 2 |
| Galleon | 200 | 4 |

Only accepted sailing steps consume stock. Idle, rejected movement, boarding,
towing, offline time and cabin visits do not. Empty holds allow half-speed travel
and existing SOS towing. At least one interval of supplies is required to cast
off. Scripted raids reserve one interval for their round trip; automatic freight
reserves its calculated complete round trip up front, with no second debit on
arrival or reload. Ship meals retain their existing separate five-coin service.

Loading rejects remote, unowned, busy or unsafe hulls. Afloat players can only
load their active hull. Loading stops personal navigation. Purchases cap at free
capacity, cannot spend unavailable coins, and never charge a full hold.

## Validation

Run `npm run check:ship-supplies` for purchase, safety, movement, departure,
persistence, migration, construction and freight regressions. All existing
`check:*` suites also run. Freight and frontier boarding fixtures now explicitly
stock large hulls before testing their existing features.

Build with `npm run build:apk`. For native mobile touch UI testing against the
packaged assets, run `npm run test:supply-browser`, with PLAYWRIGHT_MODULE and
CHROMIUM_PATH if required. This covers world quay access, loading, capacity,
boarding, helm stock, afloat access, live construction, the finished town dock,
saved stock and phone/landscape bounds. Browser checks exercise WebGL in Chromium;
physical Android performance and final touch feel still need device testing.
