# Indoor tap-to-walk

Rooms now use tap/click destinations as their primary movement control. The
indoor direction pad and its global pointer-release handler are removed. A tap
sets a destination, the gnome walks there without holding a button, and another
tap replaces the route. The pointer-release handler previously cleared targets
on unrelated releases, including service UI clicks.

A pulsing gold destination marker provides feedback and clears on arrival or
keyboard cancellation. Floor taps route around solid furniture using the current
room layout. Small finger-placement errors within 0.6 room units of furniture
clearance or a wall can select a nearby reachable patch. Assistance never crosses
an impassable barrier or teleports the player. Far-outside, nonfinite and sealed-off
destinations are rejected. The invisible floor input surface covers the assistance
margin; walking remains constrained by the real room bounds and colliders.

Drag releases over eight pixels do not create a new floor destination or trigger
the front door. Character movement pauses while the document is hidden. Optional
arrow/WASD keyboard controls remain, and taking manual control clears an existing
tap route. The destination marker does not intercept input.

This shared movement applies to the player home, Pappy's guest room, neighbours,
ship cabins, shops, the bank, pub, court, exchange and casinos. Existing service
panels remain interactive. Explore room expands previews; floor taps work in the
normal room view too. The front door remains a tap-to-exit destination.

Furniture arrangement keeps its separate tap-to-select/place behaviour and
continues to freeze walking while decorating. No furniture ownership, layout,
loan, story or save-format changes are required.

Android versionCode 20 / versionName 0.1.19-tap-to-walk.

Validation:

- check:indoor-taps verifies clear segments for every room floor plan, routing
  around a table, clearance/wall assistance, sealed barriers, invalid inputs,
  current furniture layouts, stored furniture, zero-distance arrival and doors.
- The complete automated suite contains 33 check suites.
- test:home-browser uses native touchscreen taps and a native swipe. It covers
  arrival after finger release, retargeting, furniture-edge assistance, no pad,
  ignored swipes, walking across UI releases in shops, cabin walking, furniture
  editing, saved layouts and a tapped door exit.
- test:pappy-browser now uses native touch to walk in Pappy's guest room while
  retaining the overnight story and both loan branch checks.

Optional browser tests require playwright-core and Chromium, plus built APK
assets. Set CHROMIUM_PATH as needed; PLAYWRIGHT_MODULE can select an installed
module path. Browser checks do not establish physical-device frame rate.
