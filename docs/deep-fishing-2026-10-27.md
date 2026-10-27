# Smooth casts and deepwater rigs

Casting, float bobbing, bite ripples and the reel-in arc now use eased animation
phases driven by the actual cast duration. The tackle rack's 2-second casts no
longer use a mismatched 2.6-second visual clock. A line connects rod and float;
nearby navigable water shows restrained ripples and swimming fish activity.
Activity is ambient and does not promise a particular species. Geometry remains
small and nearby; animation geometry is disposed when the scene unmounts.

Deepwater winch & outriggers costs 45,000 coins, requires Fishing 60, and fits
Fisher, barge, coaster, packet, expedition and megayacht hulls. It is purchased at
a harbour, charged once and saved per hull. Its winches/outriggers render on the
boat. Small boats and low-level characters cannot purchase it. Existing tackle
racks, rods, catch pools and ordinary fishing remain usable.

Giant bluefin tuna (60), Sunspire marlin (75) and abyssal grouper (90) require
that rig, an eligible hull and open sea with at least a 450-map-unit ring clear
of land. Checking boat rank alone cannot unlock them. Giant hauls last 6.5
seconds, award 650/950/1450 Fishing XP, and sell for 850/1450/2400 coins. Without
all requirements they are excluded from the catch pool. Existing fish retain
previous requirements; the little leviathan remains its existing species.

New tests cover purchase gates, payment/persistence, offshore rules, catch-pool
exclusion, actual casting gates/durations and animation continuity. Mobile browser
checks use the APK bundle and verify one catch after an offshore haul. No claims
are made about physical phone frame rates. Android version 14 / 0.1.13-deep-fishing.
