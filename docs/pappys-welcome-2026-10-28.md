# Pappy’s Port Victoria welcome

The opening now begins at Port Victoria after the existing in-game ship arrival.
Pappy invites the player to stay with him for supper, harbour lights and a spare
bed: “You’ll get a fresh start in the morn.” The final cinematic no longer sends
the player straight to Thimblehaven. Skipping the ship animation still reaches
Pappy’s invitation and does not select a loan.

The saved conversation has five stages: invitation, evening, morning, offer and
borrowing. The evening includes an optional walkable guest room with Pappy’s
elderly gnome model, a bed, hearth, rug and music box. Explore room opens walking
controls; Talk to Pappy returns to the conversation. The door can return to the
harbour conversation, with Go back inside available. These visits do not count
as visiting the player’s own home.

Turning in is a player action rather than a real-time wait. It advances to the
next-morning conversation, restores health and gives one loaf of breakfast bread.
That reward is tied to the saved evening-to-morning transition and cannot repeat
through re-entry or reload. Lighting and the harbour sky reflect dusk, night or
dawn during the story without advancing market days or debt. Pappy explains the
player’s role in making Thimblehaven welcoming: useful roads, stocked shops and
neighbours who belong. The brief tutorial still follows arrival at the town home.

Pappy then asks whether the player wants Mossroot’s help. Yes opens the existing
25,000 / 50,000 / 105,000-coin loan selection with 0.6% interest per seven in-game
market days and Pappy as co-signer. No loan for now preserves the current purse
and leaves debt at zero. Both choices deliver the player to their owned cottage
in Thimblehaven; the home and town are available either way. A player who declines
may later accept the one-time starter loan through Mossroot. A later loan does
not repeat the story or teleport the player.

Conversation stages persist in opening.prologue. Continue restores the correct
room and conversation, including an unfinished loan selection. Completed stories,
established saves and old pending loans do not gain a new prologue on migration.
The three-minute quiet opening still begins only after the town arrival and its
short tip; the player must visit their actual town home before goblins unlock.
No story time elapses while the app is closed.

The shared interior canvas now shows Opening room until its first frame draws,
then enables the walking controls. The cinematic also supplies its own harbour
water origin, so a new game’s ship scene remains correctly positioned even when
an earlier save was sailing in the distant procedural ocean.

Save version 22 preserves the existing opening format with an optional prologue
stage. Android versionCode 19 / versionName 0.1.18-pappys-welcome.

Validation:

- check:pappy-welcome covers phase order, clock/lighting phases, a walkable guest
  room, one-time breakfast, saving each stage, all loan amounts, debt-free decline,
  later borrowing, room exits/re-entry, unsafe states and legacy migration.
- check:opening now verifies arrival in Port Victoria while the owned cottage
  waits in Thimblehaven; the existing peaceful-opening and home-visit checks remain.
- The full regression suite includes 32 check suites.
- test:pappy-browser runs the actual ship arrival, overnight guest-room walking,
  reload, morning conversation, 50k borrowing and no-loan branches, both arrivals
  at the town home, responsive phone bounds and no replay after completion.

The optional browser regression uses playwright-core and a compatible Chromium.
After building the APK, run CHROMIUM_PATH=/path/to/chromium npm run test:pappy-browser.
PLAYWRIGHT_MODULE optionally selects another installed module and PAPPY_SCREENSHOT
sets the morning screenshot path. Browser tests do not measure device frame rate.
