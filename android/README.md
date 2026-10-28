# Hollow Watch Android test app

This small native Android WebView shell bundles the game inside an APK. There is no web server, login, or Internet connection needed. The normal Internet permission enables WebView’s virtual HTTPS origin; the app serves its assets locally and blocks external WebView requests. The game uses its existing generated 3D assets, audio and local save system. The virtual HTTPS origin is served exclusively from the APK's assets; all other WebView requests and navigations are blocked.

## Install and play

Copy `Hollow-Watch.apk` to your Android phone and open it. Allow your browser or file manager to install this app when Android asks. Android 8.0 or newer and a current Android System WebView/Chrome are required. WebGL capability determines whether the game uses its 3D world or its existing map fallback.

Progress lives in the app's private storage and is separate from browser/Termux saves. Closing the app with Back asks to save; switching apps also triggers a save. Reinstalling over an existing copy with the same signing key retains saves. Uninstalling or clearing app storage deletes them. This is an internal signed test build, not a Play Store release.

## Build

On Linux install Node.js, JDK 17 or later, Android SDK Platform 35 and Build Tools 35.0.0. No Gradle, Android Studio or Java libraries are needed for this shell.

```sh
npm ci
export JAVA_HOME=/path/to/jdk
export ANDROID_SDK_ROOT=/path/to/android-sdk
npm run build:apk
```

For SDK archives extracted outside the standard directory layout, set `ANDROID_JAR` to the platform's `android.jar` and `ANDROID_BUILD_TOOLS` to the directory containing `aapt2`, `d8`, `zipalign` and `apksigner`.

The output is `android/build/Hollow-Watch.apk`. The script rebuilds the current web game, compiles Java/resources, embeds the game, aligns and signs the APK, then verifies its signature and alignment. Build output is ignored by Git.

The first build generates `.android-signing/gnometask-test.keystore` (ignored by Git). Keep this directory privately and back it up to sign subsequent compatible test updates. Its standard internal-test password is `android`; use a different, secured signing process for any public store release. Android version metadata is in `AndroidManifest.xml`; increase `versionCode` for later distributed builds. Do not commit signing keys.

## Validation limits

The initial APK was compiled and its signature, alignment, Android metadata and bundled game assets verified. The web game passed its existing mobile browser smoke test, including island travel, naval combat, wreck salvage, rescue and repair. No Android device or emulator was available for the initial native build; installing on a phone is the next compatibility check.

## Mobile performance update (0.1.1)

Version code 2 uses the same local signing key and application ID as the first test APK, so it can be installed over that build without clearing its saves. Do not uninstall the original app first.

The web bundle now uses minified production React. On touch devices, rendering starts at 0.85 pixels per CSS pixel and adapts between 0.65 and 1 according to sustained frame time. Dynamic shadows and multisample antialiasing are disabled on mobile, including indoor and raid scenes. Nearby scenery and ships are mounted as the player explores; this does not remove distant NPCs or ships from the simulation or save. Outdoor rendering pauses behind an indoor or expedition scene.

The first controlled mobile-size Chromium/SwiftShader comparison at Thimblehaven recorded 34 animation frames over 8.22 seconds for the old build and 70 over 8.02 seconds after the changes. This software-rendered browser measurement is comparative evidence, not a phone FPS prediction. Device testing is still needed.

## App name (0.1.2)

The launcher label is Hollow Watch and the output file is `Hollow-Watch.apk`. Version code 3 retains the existing application ID and signing key so installing it over the earlier Gnometask builds keeps local progress.

## Welcome home update (0.1.3)

New games open with a sunrise title scene, naming your gnome, a compact starter-loan choice, and one short, skippable welcome from Pappy. The player arrives at the front door of their owned Thimblehaven cottage and can step directly inside. Existing home upgrades and town ownership remain unchanged.

The opening landing quest and daily goblin waves are delayed until the player has visited their home and accumulated three minutes of foreground outdoor play after the welcome. Bank selection, the title screen, tutorial card, interiors, expeditions, combat and background time do not advance the quiet period. Progress is saved; reloading and daily rollover cannot seed the early goblins or apply offline opening damage. Established saves keep their existing progression. Choose **New game** to try the new arrival.

Validated with `npm run check:opening` plus the combat, northern town/naval, open-ocean, and banking/ports suites. A mobile-size browser test covered the full opening, entering/leaving the home, having tea, saving, and continuing with no repeated tips or goblins. Native phone testing remains necessary.

## Lantern arrival update (0.1.4)

The home screen now looks across a moonlit harbour toward Port Victoria's capitol dome. Shared original SVG scenery supplies the city, ferry deck, gangplank, player and Pappy; gentle CSS motion adds lantern motes, tide reflections and the player stepping ashore. It adds no video downloads, textures or extra WebGL scene. The hidden outdoor renderer pauses on the title screen and during this introduction.

After naming a new gnome, a short sequence shows the capitol from the ship, the player walking down the gangplank, and Pappy waiting on the quay. He explains that the player's cottage is in Thimblehaven, and the existing loan/home welcome follows there. The first two shots advance after roughly six and seven seconds; the greeting waits for the player. Every shot can be advanced or skipped. Hidden-app time pauses both the sequence and its animation. Reduced-motion mode presents static poses with the same story and controls. Continue does not replay the arrival, and the peaceful opening timer starts only after the existing town welcome.

“A Light Across the Water” is the new original 32-bar title waltz (76 BPM, D major), with flute, harp, piano, soft pads and bell flourishes. The same offline Web Audio instrument renderer plays it in the game and produced the separate listening sample. The home screen offers Hear the theme/Mute theme; audio starts after a gesture and retains existing mute, volume and soundtrack preferences. After arrival, automatic music returns to the existing regional scores.

Validation includes the nine-score music checks, the peaceful-opening checks, and mobile browser flows for normal animation, title music controls, reduced motion, skipping, automatic scene advancement, visibility pause/resume, the loan choice, visiting the town home, saving and continuing. The native APK still needs phone testing.

## In-engine disembarkation update (0.1.5)

The arrival cinematic now uses React Three Fiber and the actual game models instead of the illustrated sequence. The opening shot starts with the player stepping from the sloop's bow onto a boarding plank and the shared Port Victoria pier. The real gnome rig supplies walking, the suitcase travels with the player, and Ol Pappy uses his game hat, beard and wave. The actual capitol court, shops, bank, dockhouse and terrain form the background. The camera then moves closer for their greeting.

The title artwork and original theme remain. The arrival supports advancing, skipping, hidden-app pause and reduced-motion poses. Only the local harbour set is mounted, mobile shadows remain off, and the hidden gameplay view is unmounted while the title/introduction is open so two game worlds are not retained in graphics memory. Arrival does not award items or alter old progress; finishing still begins the protected Thimblehaven opening with the player's home there.

## Consistency fixes (0.1.6)

This build fixes home-visit progression, home recovery during save migration, entry to buildings during combat/travel, and island departures from northern and remote harbours. Raid boats must be seaworthy and not reserved for freight; disabled hulls cannot run freight contracts. The capital's public harbour is consistently named Port Victoria. See [the bug-hunt report](../docs/bug-hunt-2026-10-24.md) for reproductions and verification. Existing saves can continue without starting a new game.

## Fluid sailing and clearer rendering (0.1.7)

Rendering no longer falls below one CSS pixel per pixel. Menu → Graphics quality offers Balanced, Sharp and Smooth, with antialiasing and persistent preferences. The intro uses one animation clock and eased motion. Pappy has an elder model with spectacles, silver hair and a walking stick; his hand is attached to his waving arm. Sailing now has acceleration, gradual turns, swell, billowing sails, fading wakes and smoothly moving fleet/freight ships. Sea controls are separated so chart and zoom buttons remain reachable. See [rendering and motion validation](../docs/fluid-rendering-2026-10-24.md). Existing saves can continue; choose New game to replay the intro.

### 0.1.8 — Island life

338 more countryside deeds, Bramblewood National Park, mobile plot selection,
larger NPC interaction targets, visits to nearby businesses and homes, and
wind-aware sailing with hull-specific responsiveness. Existing saves remain
compatible. Open Deeds to browse land; the sailing panel shows the breeze.

### 0.1.9 — Town milestones and neighbour notices

Tap the wooden noticeboard beside your Thimblehaven home, or open Thimblehaven
council → Noticeboard. Visit your home, claim the first milestone and accept up
to three optional favours. Return to the board with goods or reports for payment.
No deadlines. Grow the town towards its charter to unlock better commissions.
Older saves retain their town and inventory and begin with an empty board.

### 0.1.10 — Neighbours and visible growth

Open Thimblehaven council → Neighbours. Walk over to say hello, discover favourite
gifts and visit furnished homes. Friendships, letters, arriving families and
household-funded extensions persist. Public works now show construction stages
and open after their builders finish. Previously completed works remain built.

### 0.1.11 — Understand town growth

Open Thimblehaven council → Your town → Growth forecast & what to do next.
View projected household savings, arrivals/departures and levy income, with
specific advice about housing, safety, markets and supporting struggling families.

### 0.1.12 — Coastal discoveries

Open Ocean chart → Discoveries. Sail to three abandoned cargo wrecks, recover
maps and follow two landmark clues ashore. Each treasure rewards a keepsake
shown in your cottage. These discoveries have no sinking timer or deadline;
existing naval combat wrecks retain their usual rules.

### 0.1.13 — Smooth fishing and offshore giants

Casts now show an eased float, line, bite ripples and a reel-in arc. Fish activity
marks nearby water. At Fishing 60, visit Bank & harbour → Fleet & parts to fit a
45,000-coin deepwater rig to an eligible hull. Sail clear of land for giant bluefin
(60), Sunspire marlin (75) and abyssal grouper (90). Normal fishing stays available.

### 0.1.14 — Ships and crews

Hire specialists through Thimblehaven council → Naval command after selecting
an owned larger ship at a harbour. Open Ship helm aboard for speed settings,
port/starboard nudges, Stop ship and Enter ship cabin. Cabins are walkable and
pause the ship; return to deck and choose a new course to resume. Specialists
have distance-based wages, separate from cannon crews.

### 0.1.15 — Angler’s Journal and gameplay fixes

Open the satchel or aquarium to track 23 fish species, read their requirements and
claim one-time collection rewards. Sell spares keeps one of each bag species and
sprats for accepted town orders. Cast completion, cabin mooring/naval guards,
cook healing messages, loaded aquarium capacity and phone satchel bounds are fixed.

### 0.1.16 — Endless seas

Sail beyond the familiar chart to generate new islands, harbour towns and pirate
patrols. Ocean chart follows you offshore and offers four exploration bearings.
Distance raises frontier danger, enemy strength and fish lengths. Rig-equipped
ships can find wandering sailfin (Fishing 65 / danger 2), stormjaw tuna (80 / 5)
and crown leviathan (95 / 9). Personal length records appear in the journal.
Generated ports support paid supplies, repairs, crew and rescue towing. Homeward
courses navigate in safe stages rather than searching the whole ocean at once.

### 0.1.17 — Cozy home and movable furniture

Fixed the ashore interior render loop that caused the green/blank home screen.
Your home now opens as a full-screen walkable room. Arrange furniture lets you
move, rotate, store and place pieces using taps and mobile buttons. Buy more
furniture with coins; extra copies get progressively more expensive. Layouts save
automatically, and placement keeps the front door and walking paths clear.
Home comforts contains tea, upgrades, repairs and the aquarium. The outdoor
renderer stops drawing while a room is open.

### 0.1.18 — Pappy’s welcome

Stay with Pappy for a night in Port Victoria before starting your new town. Explore
his guest room, turn in when ready, then hear his morning advice about making
Thimblehaven a place gnomes love to call home. Pappy asks whether you want a loan:
choose an amount or begin without debt. Either choice leads to your owned town
cottage. Conversations save between stages and older games continue normally.

### 0.1.19 — Tap-to-walk indoors

Tap a clear patch of floor to walk there, just as outside. Indoor direction pads
are removed, and a gold marker shows the destination. New taps change your route;
furniture and walls stay solid. Small finger-placement errors get nearby safe
floor assistance. Dragging does not send your gnome walking. The shared controls
cover homes, guest rooms, cabins, shops and public interiors. Furniture editing
still uses its own select/place mode. Existing saves work without restarting.
