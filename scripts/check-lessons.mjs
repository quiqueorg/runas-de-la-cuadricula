// Audits the lesson catalog (src/core/catalog/audit.ts) the way the app loads it.
// Usage: pnpm check:lessons   (exits with 1 when something is wrong)
import { readFileSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const server = await createServer({
  root,
  logLevel: 'error',
  appType: 'custom',
  server: { middlewareMode: true, hmr: false, watch: null },
  optimizeDeps: { noDiscovery: true },
});

let problems = [];
try {
  const load = (path) => server.ssrLoadModule(path);
  const { auditCatalog, catalogSummary } = await load('/src/core/catalog/audit.ts');
  const { REGION_OFFSET, levels } = await load('/src/core/catalog/index.ts');
  const { SYMBOLS } = await load('/src/shared/icons/symbols.ts');
  const { SHELL_SYMBOLS } = await load('/src/shared/icons/shellSymbols.ts');
  const { isleSymbols } = await load('/src/shared/icons/isleSymbols.ts');
  const scenery = (await load('/src/features/map/scenery.json')).default;
  const inhabitants = (await load('/src/features/map/inhabitants.json')).default;

  const symbols = new Set(
    [...SYMBOLS, ...SHELL_SYMBOLS, ...isleSymbols(REGION_OFFSET.isle)].map((art) => art.id),
  );
  const styles = (await readdir(join(root, 'src'), { recursive: true }))
    .filter((file) => file.endsWith('.css'))
    .map((file) => readFileSync(join(root, 'src', file), 'utf8'))
    .join('\n');
  const placements = Object.fromEntries(
    Object.entries(scenery).map(([world, data]) => [world, data.inhabitants.map(([key]) => key)]),
  );

  problems = auditCatalog({ symbols, styles, placements, inhabitants });
  console.log(`${levels.length} ejercicios (${catalogSummary()})`);
} finally {
  await server.close();
}

if (problems.length) {
  console.error(`\n${problems.length} problema(s):`);
  for (const line of problems) console.error(`  - ${line}`);
  process.exit(1);
}
console.log('Catálogo en orden.');
