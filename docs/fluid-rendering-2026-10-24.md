# Graphics, intro and sailing update

This update addresses the reported blurry graphics, unstable arrival, Pappy's appearance and rigid sailing motion.

## Rendering

The old automatic mode could drop to 0.65 device pixels per CSS pixel. All modes now have a floor of 1, with multisample antialiasing enabled. Balanced starts at up to 1.5, Sharp uses the device ratio up to 2, and Smooth holds 1. Preferences are saved separately from game progress under `hollow-watch:graphics:v1`.

Canvas resolution now comes from one controlled value. Previously an adaptive controller could change the renderer's ratio while the Canvas prop still requested its old ratio, causing scene updates to reset it. Automatic changes now require sustained frame pressure and an eight-second cooldown; the intro holds its selected quality. Stable camera/renderer options and memoized terrain, trees, rocks and town components reduce scene reconstruction during movement.

## Arrival and Pappy

The same frame clock moves the player and advances the story. A slow frame cannot let a separate timer jump the player to the end of the plank. Meet Pappy accelerates the walk instead of skipping its position. The path, heading and camera transition are eased; hidden-app and reduced-motion behavior remain supported.

The right hand is now attached to the arm instead of being animated in a separate world-space group. Hip pivots are positioned at the hips. Walking stops and gestures blend instead of snapping, and waves are slower. The straw brim's incorrect upright rotation is fixed. Pappy uses the elder appearance both in the intro and the world: silver sideburns, fuller beard and brows, spectacles and a planted walking stick.

## Sailing

Boats accelerate toward cruising speed and brake near their destination while retaining the existing safe-water routes and distance-based XP. Heading interpolation takes the shortest turn. The ship and passenger share the hull's swell and banking. Buoyancy samples the same wave formula as the sea surface; wakes follow it and fade after stopping. Sail cloth billows and oar strokes ease in and out.

Fleet and freight visuals interpolate between simulation updates, so they no longer jump at the simulation's four updates per second. Visual interpolation does not change saved coordinates or award XP.

The persistent sea action panel no longer covers the chart and zoom controls. Fishing and mooring actions are consolidated in the sea panel, including rowboat fishing. Navigation charts can be opened aboard while physical building visits and active-combat restrictions remain intact.

## Validation

- The full gameplay suites and TypeScript passed; targeted consistency, opening and visual-motion checks were repeated after the navigation/UI fix.
- Six motion/graphics checks cover resolution limits and persistence, turn wrapping and frame-rate independence, bounded swell, a paused/accelerated intro clock, and acceleration/braking.
- A mobile browser run at device scale factor 2.5 verified antialiasing, a stable 1.5 ratio through the intro, walking before scene advancement, the elder greeting, persistent Sharp 2 while sailing, and Smooth 1.
- A final UI run verified real rowboat travel, clickable chart/zoom controls, quality switching and absence of page errors, missing assets and horizontal overflow.
- The Android APK is version code 8 / 0.1.7-fluid-sailing and retains the existing signing identity.

Browser checks do not establish an Android phone's actual frame rate. The new graphics choices allow tuning on the handset without reducing rendering below the new floor.
