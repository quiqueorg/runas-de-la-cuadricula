# Runas de la Cuadrícula

A Spanish-language game that teaches CSS. React 19, Vite and TypeScript, linted and formatted with Biome, no test runner. `README.md` documents the lesson format and the map data; read it before touching either.

## Product rules

- Game copy and commit messages are in Spanish. Code, identifiers that are not saved data, and code comments are in English.
- CSS classes a player reads or writes stay Spanish (`.tablero`, `.pieza`, `.activo`, piece types such as `huerto`): they are lesson content, not identifiers. So do public URLs (`#mapa`, `#prueba-<id>`).
- A lesson `id` is the key of every saved game. Never renumber or reuse one; append new lessons at the end of their region and move the region's `farewell` to the new last lesson.
- The Grid world (`src/core/data/grid.ts`) and the Flexbox world (`flex.ts`) stay pure: no lesson there may ask for the other technique. Mixed lessons belong in `sky.ts` or `finale.ts`; CSS fundamentals in `isle.ts`.
- The saved-game document (`StoredProgress` in `src/core/progress/storage.ts`) is read through `fromStored`/`toStored`, and only at the current `VERSION`: older saves are discarded, never migrated. Any change to its shape, to how a field is written or to lesson ids bumps `VERSION`. The world is stored as the current `WorldId`.
- Animate only `transform` and `opacity`; the game teaches that rule.

## Code conventions

- **Names say what things are.** No single-letter or abbreviated fields (`n`, `ok`, `b`); no Spanish identifiers.
- **Layers point one way:** `shared/` (presentational, game-agnostic) ← `core/` (domain: models, catalog, progress) ← `features/` ← `app/`. `core` and `shared` never import a feature; features never import each other except `features/settings`.
- **State lives in the store** (`src/core/progress/store.ts`). Change it only through its named actions; read it with `useProgress()` in components and `getProgress()` elsewhere. No module-level mutable state that components depend on.
- **Pure core, effects at the edges.** Models, queries and view models take what they read as parameters and return values (`lessonChrome(level, progress)`, `mapScene(world, ui, progress)`). Sounds, saving and navigation happen in components and hooks.
- **Small modules with one job**, named after it. A file over ~300 lines or a function over ~60 is a sign to split. Biome warns past a cognitive complexity of 15.
- **Components render; hooks hold behaviour.** Prefer declarative classes and attributes to imperative DOM changes; reach for refs only to measure, focus or scroll.
- **Comments explain why**, constraints and contracts, never what the next line does.
- **Magic numbers get a name** (`const RIPPLE_MS = 1200`).

## Before finishing

- Run `pnpm run check` (Biome, types, lesson catalog, build).
- After changing lessons or the engine, open the game with `?test` and run `await __runas.comprobar()` in the console: every lesson must arrive unsolved and be solved by its own solution.
- The pnpm version is pinned in `packageManager` and CI installs with `--frozen-lockfile`: any dependency or pnpm change must regenerate `pnpm-lock.yaml` in the same commit.
