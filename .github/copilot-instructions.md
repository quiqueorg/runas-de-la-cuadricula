# Runas de la Cuadrícula

A Spanish-language game that teaches CSS. React 19, Vite and TypeScript, no test runner. `README.md` documents the lesson format and the map data; read it before touching either.

- Game copy and commit messages are in Spanish. Code, identifiers that are not saved data, and code comments are in English.
- A lesson `id` is the key of every saved game. Never renumber or reuse one; append new lessons at the end of their region and move the region's `fin` to the new last lesson.
- The Grid world (`src/core/data/grid.ts`) and the Flexbox world (`flex.ts`) stay pure: no lesson there may ask for the other technique. Mixed lessons belong in `sky.ts` or `finale.ts`; CSS fundamentals in `base.ts`.
- The saved-game shape in `src/core/state.ts` is a compatibility contract. Changing it needs a migration in `migrateSave`.
- Animate only `transform` and `opacity`; the game teaches that rule.
- Before finishing, run `pnpm run check` (types, lesson catalog, build). After changing lessons or the engine, also open the game with `?test` and run `await __runas.comprobar()` in the console: every lesson must arrive unsolved and be solved by its own solution.
- The pnpm version is pinned in `packageManager` and CI installs with `--frozen-lockfile`: any dependency or pnpm change must regenerate `pnpm-lock.yaml` in the same commit.
