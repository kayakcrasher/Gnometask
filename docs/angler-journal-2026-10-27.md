# Angler’s Journal and gameplay fixes

The satchel and aquarium now offer a permanent Angler’s Journal. All 23 species
show their Fishing requirement, shore/sea habitat, boat rank where relevant,
sale value and XP. The three giant species describe their offshore rig requirement.
Filters show all, recorded or missing species. Catch counts update on completion,
not when casting, and persist after fish are sold, gifted or moved into the tank.

The Hollow Anglers’ Guild offers four one-time coin awards for 3 / 8 / 15 / 23
distinct species: 60 / 200 / 700 / 2,500 coins. Awards do not consume fish and
cannot be collected during combat, fishing, rescue, wreck boarding, transport,
loan selection or an island expedition. They remain available while safely in
a building or cabin. The journal has no deadlines or offline penalties.

Sell spares appears in the satchel and Farm Supply. It quotes the exact live
quantity and value, keeps one of each bag species, and reserves the number of
sprats required by an accepted town notice (including scaled rounds). Aquarium
fish are never sold. Individual Sell buttons still allow selling the final fish.
They now have 44-pixel minimum heights. The satchel’s width now respects both
phone margins rather than overflowing its right edge. New panels subscribe to
relevant state fields so moving the boat does not rerender them every frame.

Save version 19 adds `angler`. Existing bag and aquarium fish seed missing
records; migration takes the maximum of the recorded count and held fish rather
than adding them repeatedly on reload. Previously sold fish cannot be recovered
from old saves. Records and quantities are bounded and unknown species ignored.

Additional fixes:

- Fishing completion compares the exact cast object. An obsolete timeout cannot
  complete a replacement cast created in the same millisecond after cancellation
  or a new game, and a completion cannot award a fish twice.
- Boarding/mooring cannot run inside the cabin, chart, a building or an island
  expedition, or from the home screen. Return to deck before mooring.
- Naval challenges and firing cannot begin from inside an interior. Disabled
  hulls cannot initiate a naval challenge.
- The cook reports actual restored health rather than always claiming four.
- Aquarium migration raises the saved upgrade tier when existing fish require
  more capacity. No fish are deleted. Legacy collections larger than the current
  maximum of 80 are retained, and adding more fish stays blocked until space exists.
- The aquarium indicates whenever only a sample is drawn (including repeated
  species limited to three visible copies).

Validation: `npm run check:angler` covers completed/stale casts, journal migration,
one-time rewards, protected bulk sales, dangerous states, cabin/disabled-hull
naval guards, actual healing and aquarium migration. The complete check suite,
phone browser tests and signed Android build are recorded with this release.
Browser checks cover award collection, filters, bulk sale, a completed catch,
save/reload, and satchel bounds at 320px, 390px and landscape widths. Physical-device
frame rate has not been measured by these browser checks.

Android versionCode 16 / versionName 0.1.15-angler-journal.
