# Large ships, crews and mobile steering

Larger hulls now support three specialists: navigator (1,800 coins), deckhand
(900), and cook (1,200). One of each role can be hired for an owned ship at a
public or owned harbour. Ships away on freight cannot recruit. Gunners remain
separate with their existing ammunition and shot-wage rules. Specialists cost
2 coins each per 600 actual map units sailed; no offline wages or debt accrue.
If funds are insufficient, navigation/deckhand bonuses pause until funded.
Navigator: 15% more rudder response. Deckhand: 6% more cruising speed. Cook:
5-coin stew restores up to 4 health in the cabin, with no charge at full health.

Ship helm is a collapsible mobile panel aboard. Harbour / Cruise / Full sail
set 35% / 75% / 100% cruising limits. Tap-to-destination continues to use safe
water routes. Port/starboard buttons nudge the course by 30 degrees, using the
same route planner; Stop ship clears the current course. Actual movement now
turns progressively, with slower yaw rates for heavy hulls, less forward motion
while turning across the current heading, and existing acceleration/braking.
Within 60 map units of a waypoint, precision assistance follows the surveyed
route at reduced speed. Blocked arcs fall back to slow route-following steps.
Every step still goes through authoritative water-segment collision checks.
This is assisted mobile handling, not a full hydrodynamic simulation.

Barge, coaster, packet, yacht, expedition, megayacht and larger fighting hulls
have walkable cabins. Enter ship cabin stops the ship, clears port navigation
and pauses outdoor/naval movement while inside. The cabin has cottage-scale
furniture, nautical charts, portholes, crew and a roster. Its floor, furniture,
crew area and front-door exit use the existing indoor collision controls.
Returning to deck preserves the boat and coordinates; choose a new course to
resume. Entry cannot hide combat, fishing, a disabled hull, wreck boarding,
transport or rescue. The generic building-entry API cannot bypass those rules.

Save version 18 stores specialist rosters per owned hull and speed selection.
Legacy saves get empty rosters and Cruise speed. Specialists render on deck and
in the cabin; crew count does not alter cannon ownership or gunner automation.
Automated tests cover hiring gates, payments, wages, meals, safe cabin entry,
migration, indoor collision and bounded frame-independent helm turns. Mobile
browser tests cover recruitment, steering, stopping, walking below deck and
returning outside without teleporting. Android version 15 / 0.1.14-ships-and-crew.
