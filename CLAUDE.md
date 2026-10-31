# Instructions for Claude

## Git workflow

- The owner wants all finished work merged into `main` every time. Do not stop at a feature branch or ask whether to open a pull request.
- Before pushing, fetch `origin/main` and rebase or merge onto it so the push is a fast-forward. Never force-push `main`.
- Run `npm run check:types` and the relevant `npm run check:*` scripts before pushing.

## Project notes

- Build with `npm run build` (outputs `dist/`, including `public/` assets); `npm run dev` builds and serves on port 8080.
- Game content lives in `src/lib/game/data/`; see README.md for where things are.
- Tailwind is v3: opacity modifiers like `bg-pine/92` only work if the value is on the scale or registered in `tailwind.config.ts`.
- Outdoor action buttons go in the shared dock (`src/components/hud/hud-dock.tsx`, `DockSlot`), not hard-coded `fixed bottom-*` positions.
