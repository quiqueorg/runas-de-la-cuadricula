/** Assembles every adventure into one catalog and exposes progress queries. */
import type {
  BoardRule,
  BoardView,
  Level,
  LevelDraft,
  MediaDraft,
  MediaGroup,
  PieceSpec,
  PieceTypeMap,
  Region,
  RegionStats,
  RuntimePiece,
  WorldCopy,
  WorldId,
} from './models';
import { session } from './session';
import { progress } from './state';
import { baseLevels, basePieceTypes, baseRegions } from './data/base';
import { finaleLevels, finalePieceTypes, finaleRegions } from './data/finale';
import { flexLevels, flexPieceTypes, flexRegions } from './data/flex';
import { levels as gridLevels, pieceTypes as gridPieceTypes, regions as gridRegions } from './data/grid';
import { skyLevels, skyPieceTypes, skyRegions } from './data/sky';

type FilterGroup = readonly [string, readonly string[]];

const regions = [...gridRegions];
const pieceTypes: PieceTypeMap = { ...gridPieceTypes };

function stampRegions(list: Region[], world: WorldId): void {
  list.forEach((region, index) => {
    region.mundo = world;
    region.num = index + 1;
  });
}

function mergePieceTypes(extra: PieceTypeMap): void {
  for (const [key, value] of Object.entries(extra)) {
    if (!pieceTypes[key]) pieceTypes[key] = value;
  }
}

/**
 * Splits `head[attr=value][flag]:text`. Brackets are read before the colon, so a value may hold one
 * (`a[href=https://isla.es]:Puerto`). Quotes around a value are optional.
 */
function splitPiece(body: string): { head: string; text: string; attrs: Record<string, string> | undefined } {
  let head = '';
  let attrs: Record<string, string> | undefined;
  let at = 0;
  while (at < body.length && body[at] !== ':') {
    if (body[at] === '[') {
      const close = body.indexOf(']', at);
      if (close < 0) break;
      const [name = '', ...rest] = body.slice(at + 1, close).split('=');
      const value = rest.join('=').replace(/^(["'])(.*)\1$/, '$2');
      if (name.trim()) (attrs ??= {})[name.trim()] = value;
      at = close + 1;
    } else head += body[at++];
  }
  return { head, text: body[at] === ':' ? body.slice(at + 1) : '', attrs };
}

function flattenPieces(list: readonly PieceSpec[], parent: number, out: { s: string; padre: number }[]): void {
  list.forEach((item) => {
    if (typeof item === 'string') out.push({ s: item, padre: parent });
    else flattenPieces(item, out.length - 1, out);
  });
}

const DEVICE = { medio: 'screen', esquema: 'light', puntero: 'fine', calma: false } as const;

/** Widths alone name a view by its width; anything else needs its own label. */
function viewsOf(draft: LevelDraft, width: number, height: number): BoardView[] {
  if (!draft.vistas?.length) return (draft.anchos ?? [width]).map((w) => ({ ...DEVICE, w, h: height, n: `${w}px` }));
  const sized = draft.vistas.map((view) => ({ ...DEVICE, ...view, w: view.w ?? width, h: view.h ?? height }));
  const plain = sized.every((view) => view.h === sized[0]?.h) && new Set(sized.map((view) => view.w)).size === sized.length;
  return sized.map((view) => ({ ...view, n: view.n ?? (plain ? `${view.w}px` : `${view.w}×${view.h}`) }));
}

function normalize(draft: LevelDraft, index: number): Level {
  const rules: BoardRule[] = draft.b.map((rule) => ({
    s: rule.s,
    f: rule.f ?? '',
    sol: rule.sol ?? '',
    ed: rule.ed ?? true,
    ini: rule.ini ?? '',
    oculto: rule.oculto,
    m: rule.m,
    g: -1,
    sel: rule.sel,
  }));
  const width = draft.w ?? 400;
  const views = viewsOf(draft, width, draft.h ?? 400);
  const height = Math.max(...views.map((view) => view.h));
  const widths = views.map((view) => view.w);
  const modern = draft.mundo === 'cielo' || draft.mundo === 'final';
  const size = draft.dim === undefined && modern ? [64, 64] as const : draft.dim;
  const groups: MediaGroup[] = [];
  let previous: string | MediaDraft | undefined;
  for (const rule of rules) {
    if (!rule.m) {
      rule.g = -1;
      previous = undefined;
      continue;
    }
    if (rule.m !== previous) {
      if (typeof rule.m === 'string') groups.push({ fijo: true, sol: rule.m, ini: '' });
      else groups.push({ fijo: false, sol: rule.m.sol, ini: rule.m.ini ?? '' });
      previous = rule.m;
    }
    rule.g = groups.length - 1;
  }
  const selectors = new Set(rules.map((rule) => rule.s));
  const flat: { s: string; padre: number }[] = [];
  flattenPieces(draft.p as PieceSpec[], -1, flat);
  // A piece is written `type@class.class#id[attr=value]:text`; a leading # pins it to the board.
  const pieces: RuntimePiece[] = flat.map(({ s, padre }) => {
    const fixed = s.startsWith('#');
    const { head, text, attrs } = splitPiece(fixed ? s.slice(1) : s);
    const [names = '', id = ''] = head.split('#');
    const [type = '', dotted = ''] = names.split('@');
    const variant = dotted.replace(/\./g, ' ');
    const className = variant || type;
    const known = pieceTypes[type];
    // Real elements and the isle's pieces show how they read in the markup instead of a class label.
    const element = !!known?.tag || draft.mundo === 'base';
    const labelled = draft.et !== false && !(fixed && draft.etFijas === false);
    return {
      t: type,
      k: variant,
      fija: fixed,
      txt: text,
      padre,
      T: known ?? { o: type },
      e: !element && labelled && selectors.has('.' + className) ? className : '',
      id,
      marca: element && labelled ? `${known?.tag ?? ''}${variant ? `.${variant.replace(/ /g, '.')}` : known?.tag ? '' : `.${type}`}${id ? `#${id}` : ''}` : '',
      ...(attrs ? { attrs } : {}),
    };
  });
  pieces.forEach((piece) => {
    if (piece.padre >= 0) {
      const parent = pieces[piece.padre];
      if (parent) parent.cont = true;
    }
  });
  const movable = pieces.flatMap((piece, pieceIndex) => (piece.fija ? [] : [pieceIndex]));
  const first = movable[0] === undefined ? undefined : pieces[movable[0]];
  const mark = draft.hito ?? first?.T.i ?? first?.T.o ?? 'runa';
  const used = new Set<string>();
  for (const rule of rules) {
    for (const match of rule.sol.matchAll(/([a-z-]+)\s*:/g)) {
      const property = match[1];
      if (property && CSS_PROPS.includes(property)) used.add(property);
    }
  }
  const { p: _specs, b: _rules, ...rest } = draft;
  return {
    ...rest,
    mundo: draft.mundo ?? 'grid',
    i: index,
    w: width,
    h: height,
    anchos: widths,
    vistas: views,
    dim: size,
    b: rules,
    p: pieces,
    mg: groups,
    jefe: Boolean(regions[draft.r]?.jefe) || draft.jefe,
    max: draft.bolsa ? Math.floor(draft.bolsa.total / draft.bolsa.precio) : draft.max,
    movibles: movable,
    hito: mark,
    ok: draft.ok ?? [],
    tags: [...new Set([
      ...(draft.examen ? ['prueba de aprendizaje'] : []),
      ...(draft.esp ? [draft.esp] : []),
      ...CSS_PROPS.filter((property) => used.has(property)),
      ...(draft.c ?? []),
    ])],
  };
}

stampRegions(regions, 'grid');
export const FLEX_OFFSET = regions.length;
stampRegions(flexRegions, 'flex');
flexRegions.forEach((region) => regions.push(region));
mergePieceTypes(flexPieceTypes);
export const SKY_OFFSET = regions.length;
stampRegions(skyRegions, 'cielo');
skyRegions.forEach((region) => regions.push(region));
mergePieceTypes(skyPieceTypes);
export const FINALE_OFFSET = regions.length;
stampRegions(finaleRegions, 'final');
finaleRegions.forEach((region) => regions.push(region));
mergePieceTypes(finalePieceTypes);
// The apprentice's isle opens the menu but is appended here, so earlier region numbers stay put.
export const BASE_OFFSET = regions.length;
stampRegions(baseRegions, 'base');
baseRegions.forEach((region) => regions.push(region));
mergePieceTypes(basePieceTypes);

const assembled: LevelDraft[] = [
  ...gridLevels.map((level) => ({ ...level, mundo: 'grid' as const })),
  ...flexLevels.map((level) => ({ ...level, mundo: 'flex' as const, r: level.r + FLEX_OFFSET })),
  ...skyLevels.map((level) => ({ ...level, mundo: 'cielo' as const, r: level.r + SKY_OFFSET })),
  ...finaleLevels.map((level) => ({ ...level, mundo: 'final' as const, r: level.r + FINALE_OFFSET })),
  ...baseLevels.map((level) => ({ ...level, mundo: 'base' as const, r: level.r + BASE_OFFSET })),
];

export { pieceTypes, regions };

export const isModernLevel = (level: Level): boolean => level.mundo === 'cielo' || level.mundo === 'final' || level.mundo === 'base';

export const worldMeta: Record<WorldId, WorldCopy> = {
  base: { n: 'La Isla del Aprendiz', mapa: 'Mapa de la isla', tec: 'Fundamentos de CSS' },
  grid: { n: 'Las Ruinas de la Cuadrícula', mapa: 'Mapa de las ruinas', tec: 'CSS Grid' },
  flex: { n: 'El Subsuelo Flexible', mapa: 'Mapa del subsuelo', tec: 'Flexbox' },
  cielo: { n: 'Los Cielos Cambiantes', mapa: 'Mapa de los cielos', tec: 'Media queries, variables y transiciones' },
  final: { n: 'El Vacío entre los Mundos', mapa: 'El Vacío entre los Mundos', tec: 'Combate final' },
};

export const ADVENTURES = ['grid', 'flex', 'cielo'] as const satisfies readonly WorldId[];
export const WORLD_IDS: readonly WorldId[] = ['base', 'grid', 'flex', 'cielo', 'final'];

export const BASE_GROUPS = [
  ['Tipo de ejercicio', ['prueba de aprendizaje', 'secreto', 'contra reloj', 'a oscuras', 'regateo', 'musical', 'escribe el selector']],
  ['La caja', ['width', 'height', 'max-width', 'min-width', 'min-height', 'max-height', 'aspect-ratio', 'padding', 'padding-left', 'padding-top', 'margin', 'margin-top', 'margin-bottom', 'margin-left', 'margin-right', 'border', 'border-width', 'border-style', 'border-color', 'border-bottom', 'border-left', 'border-radius', 'box-sizing', 'overflow', 'overflow-x', 'overflow-y']],
  ['Color y fondo', ['color', 'background-color', 'background', 'background-image', 'background-repeat', 'background-position', 'background-size', 'opacity']],
  ['Efectos', ['box-shadow', 'text-shadow', 'outline', 'outline-offset', 'filter', 'clip-path', 'cursor']],
  ['Texto', ['font-family', 'font-size', 'font-weight', 'font-style', 'font', 'text-align', 'text-decoration', 'text-transform', 'line-height', 'letter-spacing', 'list-style', 'list-style-type', 'white-space', 'text-overflow', 'overflow-wrap', 'word-break', 'hyphens', 'text-indent', 'vertical-align', 'writing-mode', 'content', 'counter-reset', 'counter-increment', 'columns', 'column-count', 'column-width', 'column-gap', 'column-rule']],
  ['Flujo y posición', ['display', 'visibility', 'float', 'clear', 'position', 'top', 'right', 'bottom', 'left', 'z-index']],
  ['Conceptos', ['regla', 'comentarios', 'tipo', 'clase', 'id', 'universal', 'lista de selectores', 'descendiente', 'hijo', 'hermano adyacente', 'hermanos', ':first-child', ':last-child', ':nth-child()', ':not()', 'atributo', ':is()', ':where()', ':has()', ':hover', ':focus', ':focus-visible', ':active', '::first-letter', '::first-line', '::before', '::after', '::marker', 'cascada', 'especificidad', '!important', 'herencia', 'inherit', 'initial', 'unset', 'currentColor', 'px', '%', 'em', 'rem', 'ch', 'vw', 'calc()', 'min()', 'max()', 'clamp()', 'colores', 'hex', 'rgb()', 'hsl()', 'transparencia', 'degradados', 'sombras', 'shorthand', 'modelo de caja', 'margin auto', 'bloque y en línea', 'listas', 'contadores', 'texto que no cabe', 'capas', 'reset', 'página base']],
] as const satisfies readonly FilterGroup[];

export const GRID_GROUPS = [
  ['Tipo de ejercicio', ['prueba de aprendizaje', 'secreto', 'contra reloj', 'sin huellas', 'regateo', 'musical', 'minijuego']],
  ['Contenedor', ['display', 'grid-template-columns', 'grid-template-rows', 'grid-template-areas', 'grid-template', 'gap', 'row-gap', 'column-gap']],
  ['Colocación', ['grid-column-start', 'grid-column-end', 'grid-row-start', 'grid-row-end', 'grid-column', 'grid-row', 'grid-area']],
  ['Alineación', ['justify-items', 'align-items', 'place-items', 'justify-self', 'align-self', 'place-self', 'justify-content', 'align-content', 'place-content']],
  ['Cuadrícula implícita', ['grid-auto-rows', 'grid-auto-columns', 'grid-auto-flow', 'grid']],
  ['Orden y capas', ['order', 'z-index']],
  ['Conceptos', ['fr', 'auto', 'repeat()', 'minmax()', 'inline-grid', 'span', 'líneas negativas', 'líneas con nombre', 'auto-fill', 'auto-fit', 'dense', 'max-content', 'min-content', 'fit-content()', 'minmax(0, 1fr)', 'shorthand']],
] as const satisfies readonly FilterGroup[];

export const FLEX_GROUPS = [
  ['Tipo de ejercicio', ['prueba de aprendizaje', 'secreto', 'contra reloj', 'a oscuras', 'regateo', 'musical', 'túnel cambiante', 'anidado']],
  ['Contenedor', ['display', 'flex-direction', 'flex-wrap', 'flex-flow', 'gap', 'row-gap', 'column-gap']],
  ['Alineación', ['justify-content', 'align-items', 'align-content', 'align-self', 'margin', 'margin-left', 'margin-right', 'margin-top', 'margin-bottom']],
  ['Tamaño flexible', ['flex-grow', 'flex-shrink', 'flex-basis', 'flex', 'width', 'max-width', 'min-width']],
  ['Listas', ['list-style', 'padding']],
  ['Orden', ['order']],
  ['Conceptos', ['eje principal', 'eje cruzado', 'espacio libre', 'reverse', 'baseline', 'margin auto', 'anidación', '%', 'navegación', 'shorthand']],
] as const satisfies readonly FilterGroup[];

export const SKY_GROUPS = [
  ['Tipo de ejercicio', ['prueba de aprendizaje', 'secreto', 'contra reloj', 'a oscuras', 'regateo', 'musical']],
  ['Diseño que se adapta', ['flex-direction', 'justify-content', 'align-items', 'order', 'display', 'grid-template-columns', 'grid-template-areas', 'grid-template-rows']],
  ['Tamaños', ['width', 'height', 'gap', 'padding']],
  ['Transiciones', ['transition', 'transition-property', 'transition-duration', 'transition-timing-function', 'transition-delay', 'transform', 'opacity', 'box-shadow']],
  ['Conceptos', ['@media', 'max-width', 'min-width', 'and', 'or', 'not', 'rango', 'mobile first', 'min-height', 'orientation', 'aspect-ratio', 'screen', 'print', 'hover', 'pointer', 'custom properties', 'var()', ':root', 'herencia', 'fallback', 'colores', 'prefers-color-scheme', 'calc()', 'anidación', ':hover', ':active', ':focus', 'timing-function', 'transition-delay', 'varias', 'shorthand', 'rendimiento', 'prefers-reduced-motion', 'steps()', 'cubic-bezier()']],
] as const satisfies readonly FilterGroup[];

export const FINALE_GROUPS = [
  ['Tipo de ejercicio', ['prueba de aprendizaje']],
  ['Grid y Flexbox', ['display', 'grid-template-columns', 'grid-template-rows', 'grid-template-areas', 'grid-column', 'justify-content', 'align-items', 'flex-direction', 'order', 'gap']],
  ['Transiciones', ['transition', 'transform']],
  ['Conceptos', ['@media', 'custom properties', 'calc()']],
] as const satisfies readonly FilterGroup[];

export const GROUPS_BY_WORLD: Record<WorldId, readonly FilterGroup[]> = {
  base: BASE_GROUPS,
  grid: GRID_GROUPS,
  flex: FLEX_GROUPS,
  cielo: SKY_GROUPS,
  final: FINALE_GROUPS,
};

export function propsOf(groups: readonly FilterGroup[]): string[] {
  return groups.slice(1, -1).flatMap((group) => [...group[1]]);
}

export const CSS_PROPS: string[] = [...new Set(Object.values(GROUPS_BY_WORLD).flatMap(propsOf))];
export const levels: Level[] = assembled.map((level, index) => normalize(level, index));
export const CONCEPTS = new Set(Object.values(GROUPS_BY_WORLD).flatMap((groups) => groups[groups.length - 1]?.[1] ?? []));
export const EXERCISE_KINDS = new Set(Object.values(GROUPS_BY_WORLD).flatMap((groups) => groups[0]?.[1] ?? []));
export const canvasGutter = 30;

export function regionOf(level: Level): Region {
  const region = regions[level.r];
  if (!region) throw new Error(`Missing region ${level.r}`);
  return region;
}

export const levelsById: Record<string, Level> = Object.fromEntries(levels.map((level) => [level.id, level]));

let isleLabels: Map<string, string> | null = null;

export function levelLabel(id: string): string {
  // Isle ids keep the number they were born with (they are save keys); players read where the lesson
  // sits instead: the region's place on the trail and the lesson's place in the region.
  if (id[0] === 'b') {
    isleLabels ??= new Map(levels.filter((level) => level.mundo === 'base' && !regions[level.r]?.secreto).map((level) => {
      const region = regions[level.r];
      const place = levels.filter((other) => other.r === level.r).indexOf(level) + 1;
      return [level.id, `${region?.num ?? ''}·${place}`];
    }));
    const label = isleLabels.get(id);
    if (label) return label;
  }
  return id[0] === 'x'
    ? 'Fase ' + id.split('-')[1]
    : ('fcb'.includes(id[0] ?? '') ? id.slice(1).replace(/^\d+/, (digits) => String(+digits + 1)) : id).replace('-', '·');
}

export const levelKind = (level: Level): string => (level.examen ? 'Prueba' : 'Ejercicio');
export const isExercise = (level: Level): boolean => !level.examen && !level.secreto;
export const levelsInWorld = (world: WorldId): Level[] => levels.filter((level) => level.mundo === world);

function byWorld<T>(read: (world: WorldId) => T): Record<WorldId, T> {
  return { base: read('base'), grid: read('grid'), flex: read('flex'), cielo: read('cielo'), final: read('final') };
}

export const routes: Record<WorldId, Level[]> = byWorld((world) => levelsInWorld(world).filter((level) => !level.secreto));
export const routeOf = (level: Level): Level[] => routes[level.mundo];
export const EXERCISE_COUNTS = byWorld((world) => levelsInWorld(world).filter(isExercise).length);
export const EXAM_COUNTS = byWorld((world) => levelsInWorld(world).filter((level) => level.examen).length);
export const exerciseProgress = (world: WorldId = session.world): number => levels.filter((level) => level.mundo === world && isExercise(level) && progress.hechos[level.id]).length;
export const worldComplete = (world: WorldId): boolean => routes[world].every((level) => progress.hechos[level.id]);
export const finaleUnlocked = (): boolean => ADVENTURES.every(worldComplete) || /[?&]final\b/.test(location.search);
export const examProgress = (world: WorldId = session.world): number => levels.filter((level) => level.mundo === world && level.examen && progress.hechos[level.id]).length;
export const secretsInWorld = (world: WorldId = session.world): Level[] => levels.filter((level) => level.mundo === world && level.secreto);
export const completedCount = (): number => levels.filter((level) => progress.hechos[level.id]).length;
export const masteredCount = (): number => levels.filter((level) => progress.hechos[level.id]?.m).length;

export function nextPendingLevel(world: WorldId = session.world): Level {
  const route = routes[world];
  const pending = route.find((level) => !progress.hechos[level.id]) ?? route[0];
  if (!pending) throw new Error(`Empty route: ${world}`);
  return pending;
}

export const levelsInRegion = (regionIndex: number): Level[] => levels.filter((level) => level.r === regionIndex);

export function regionStats(regionIndex: number): RegionStats {
  const inRegion = levelsInRegion(regionIndex);
  return { total: inRegion.length, hechos: inRegion.filter((level) => progress.hechos[level.id]).length };
}

export const regionComplete = (regionIndex: number): boolean => {
  const stats = regionStats(regionIndex);
  return stats.total > 0 && stats.hechos === stats.total;
};

export const isFirstInWorld = (regionIndex: number): boolean => !regions[regionIndex - 1] || regions[regionIndex - 1]?.mundo !== regions[regionIndex]?.mundo;
/** Global indexes of the regions this one waits for: its own `tras`, or simply the previous one. */
export function regionPrerequisites(regionIndex: number): number[] {
  const region = regions[regionIndex];
  if (!region?.tras) return [regionIndex - 1];
  const first = regions.findIndex((other) => other.mundo === region.mundo);
  return region.tras.map((local) => first + local);
}
export const isDiscovered = (regionIndex: number): boolean => isFirstInWorld(regionIndex) || regionPrerequisites(regionIndex).every(regionComplete) || levelsInRegion(regionIndex).some((level) => progress.hechos[level.id]);
export const frontierLevel = (): Level | undefined => routes[session.world].find((level) => !progress.hechos[level.id]);
