# Gnome Tasks

A cozy point-and-click gnome island. Click the land to walk. Drag to look. Chop trees, keep shop, grow a village, and argue with a dragon.

This repo is the **game source** — the files you edit. It is TypeScript + React. Nature props are [Kenney Nature Kit](https://kenney.nl/assets/nature-kit) (CC0). Gnomes, houses, and gear are original meshes.

## Folders

| Folder | What to edit |
|---|---|
| `src/lib/game/data/` | Chores, skills, trees, NPCs, enemies, quests, layout, place names |
| `src/lib/game/data/catalog/` | Shops: hats, house, garden, village, weapons, tools, armour, food, forts |
| `src/lib/game/store/` | Save, combat, walking, chores, shops, chopping / sailing |
| `src/lib/game/combat.ts` | Hits, XP, prayer |
| `src/lib/game/world3.ts` | Island shape and 2D ↔ 3D |
| `src/hooks/use-gnome-walk.ts` | Click-to-walk (no keys) |
| `src/components/world/` | 3D island, town, gnome, trees, camera |
| `src/components/hud/` | Inventory, shops, combat, minimap, welcome |
| `src/components/land/` | Painted 2D island (fallback if 3D drops) + map art |
| `src/components/app-shell.tsx` | Wires the island + HUD |

Start with `src/lib/game/data/` if you want to change chores, shops, or enemies.

## Gear colours

Wood, bronze (brown), iron (grey), steel (pale), adamant (green).

## Controls

- Left click land or the round map to walk
- Drag to look
- Scroll to zoom

No WASD. No arrow keys.
