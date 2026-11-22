// Reads the lesson catalog the way the app does and reports what an author tends to forget.
// Usage: pnpm check:lessons   (exits with 1 when something is wrong)
import { readFileSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

// classes the board puts on itself while it simulates a state
const STATES = new Set(['activo', 'hover', 'pulsa', 'foco']);

const root = fileURLToPath(new URL('..', import.meta.url));
const server = await createServer({ root, logLevel: 'error', appType: 'custom', server: { middlewareMode: true, hmr: false, watch: null }, optimizeDeps: { noDiscovery: true } });

const problems = [];
const report = (where, what) => problems.push(`${where}: ${what}`);

try {
  const load = (path) => server.ssrLoadModule(path);
  const { levels, regions, pieceTypes, GROUPS_BY_WORLD, BASE_OFFSET, WORLD_IDS } = await load('/src/core/catalog.ts');
  const { SYMBOLS } = await load('/src/shared/icons/symbols.ts');
  const { SHELL_SYMBOLS } = await load('/src/shared/icons/shellSymbols.ts');
  const { isleSymbols } = await load('/src/shared/icons/isleSymbols.ts');
  const scenery = (await load('/src/features/map/scenery.json')).default;
  const inhabitants = (await load('/src/features/map/inhabitants.json')).default;
  const symbols = new Set([...SYMBOLS, ...SHELL_SYMBOLS, ...isleSymbols(BASE_OFFSET)].map((art) => art.id));
  const styles = (await readdir(join(root, 'src'), { recursive: true }))
    .filter((file) => file.endsWith('.css'))
    .map((file) => readFileSync(join(root, 'src', file), 'utf8'))
    .join('\n');

  // ids are the keys of every saved game
  const seen = new Set();
  for (const level of levels) {
    if (seen.has(level.id)) report(level.id, 'id repetido');
    seen.add(level.id);
  }

  for (const level of levels) {
    const region = regions[level.r];
    if (!region) { report(level.id, `la región ${level.r} no existe`); continue; }
    if (region.mundo !== level.mundo) report(level.id, `está en una región de «${region.mundo}» pero su mundo es «${level.mundo}»`);
    if (Boolean(level.secreto) !== Boolean(region.secreto)) report(level.id, level.secreto ? 'es un secreto fuera de la región de secretos' : 'está en la región de secretos y no tiene «secreto»');
    if (!level.n) report(level.id, 'no tiene nombre (n)');
    if (!level.obj) report(level.id, 'no tiene objetivo (obj)');
    if (!level.p.length) report(level.id, 'no tiene piezas (p)');

    // what the solution writes has to be offered as a rune; variables go by name or all at once as `--*`
    for (const rule of level.b) {
      if (!rule.ed) continue;
      for (const [, property] of rule.sol.matchAll(/(?:^|[;{\s])(--[\w-]+|[a-z][a-z-]*)\s*:/g)) {
        const offered = level.ok.includes(property) || (property.startsWith('--') && level.ok.includes('--*'));
        if (!offered) report(level.id, `la solución de «${rule.s}» usa «${property}», que no está en las runas permitidas (ok)`);
      }
    }

    // every tag has to be reachable from the index filters of its world
    const known = new Set(GROUPS_BY_WORLD[level.mundo].flatMap((group) => [...group[1]]));
    for (const tag of [...(level.c ?? []), ...(level.esp ? [level.esp] : [])]) {
      if (!known.has(tag)) report(level.id, `la etiqueta «${tag}» no está en los filtros de «${level.mundo}» (catalog.ts)`);
    }

    if (level.secreto && !symbols.has(`dib-${level.secreto.dib}`)) report(level.id, `falta el dibujo «dib-${level.secreto.dib}»`);
    if (level.av && !symbols.has(level.av)) report(level.id, `falta el retrato «${level.av}»`);

    // a piece type that is declared has to have something to show
    const classes = new Set(['tablero', 'pieza']);
    for (const piece of level.p) {
      classes.add(piece.t);
      for (const name of piece.k.split(' ')) if (name) classes.add(name);
      if (!pieceTypes[piece.t]) continue;
      const { a: material, i: icon, o: object } = piece.T;
      if (material && !styles.includes(`.m-${material}`)) report(level.id, `la pieza «${piece.t}» usa el material «${material}» y no hay ningún estilo .m-${material}`);
      if ((icon || object) && !symbols.has(`i-${icon || object}`)) report(level.id, `la pieza «${piece.t}» no tiene dibujo «i-${icon || object}»`);
    }

    // a fixed rule that names a class no piece has does nothing, and nobody notices
    for (const rule of level.b) {
      if (rule.ed || rule.sel !== undefined) continue;
      for (const [, name] of rule.s.matchAll(/\.([a-zA-Z][\w-]*)/g)) {
        if (!classes.has(name) && !STATES.has(name)) report(level.id, `la regla fija «${rule.s}» nombra la clase «.${name}», que no lleva ninguna pieza`);
      }
    }
  }

  for (const world of WORLD_IDS) {
    if (!levels.some((level) => level.mundo === world)) report(world, 'no tiene ejercicios');
    for (const [key] of scenery[world]?.habitantes ?? []) {
      const person = inhabitants[key];
      if (!person) { report(`mapa de ${world}`, `el habitante «${key}» no está en inhabitants.json`); continue; }
      if (!person.ch?.length) report(`habitante ${key}`, 'no tiene nada que decir (ch)');
      if (person.sp && !symbols.has(`i-${person.sp}`)) report(`habitante ${key}`, `falta el dibujo «i-${person.sp}»`);
    }
  }
  const placed = new Set(Object.values(scenery).flatMap((world) => (world.habitantes ?? []).map(([key]) => key)));
  for (const key of Object.keys(inhabitants)) if (!placed.has(key)) report(`habitante ${key}`, 'no aparece en ningún mapa (scenery.json)');

  const perWorld = WORLD_IDS.map((world) => `${world} ${levels.filter((level) => level.mundo === world).length}`).join(' · ');
  console.log(`${levels.length} ejercicios (${perWorld})`);
} finally {
  await server.close();
}

if (problems.length) {
  console.error(`\n${problems.length} problema(s):`);
  for (const line of problems) console.error(`  - ${line}`);
  process.exit(1);
}
console.log('Catálogo en orden.');
