/**
 * What a lesson author tends to forget, checked across the whole catalog. Run by
 * `pnpm run check:lessons`; the drawings, styles and map data come in as inputs so the catalog does
 * not depend on the features that draw it.
 */
import { WORLD_IDS } from '../models';
import { levels, pieceTypes, regions, WORLD_BY_ID } from '.';

export interface AuditInput {
  /** Every symbol id that can be drawn (`i-…`, `dib-…`, portraits). */
  readonly symbols: ReadonlySet<string>;
  /** All the game's CSS, to find material classes. */
  readonly styles: string;
  /** Who stands on each world's map. */
  readonly placements: Readonly<Record<string, readonly string[]>>;
  readonly inhabitants: Readonly<
    Record<string, { readonly jokes?: readonly string[]; readonly sprite?: string }>
  >;
}

/** Classes the board puts on itself while it simulates a state. */
const STATE_CLASSES = new Set(['activo', 'hover', 'pulsa', 'foco']);

type Report = (where: string, what: string) => void;

function auditIds(report: Report): void {
  const seen = new Set<string>();
  for (const level of levels) {
    // Ids are the keys of every saved game.
    if (seen.has(level.id)) report(level.id, 'id repetido');
    seen.add(level.id);
  }
}

type Level = (typeof levels)[number];
/** One kind of mistake, checked on one lesson. */
type LessonCheck = (level: Level, input: AuditInput, report: (what: string) => void) => void;

const checkPlacement: LessonCheck = (level, _input, report) => {
  const region = regions[level.region];
  if (!region) {
    report(`la región ${level.region} no existe`);
    return;
  }
  if (level.secret && !region.secret) report('es un secreto fuera de la región de secretos');
  if (!level.secret && region.secret) report('está en la región de secretos y no tiene «secret»');
};

const checkRequiredFields: LessonCheck = (level, _input, report) => {
  if (!level.title) report('no tiene título (title)');
  if (!level.objective) report('no tiene objetivo (objective)');
  if (!level.pieces.length) report('no tiene piezas (pieces)');
};

/** What the solution writes has to be offered as a rune; variables go by name or all at once as `--*`. */
const checkRunes: LessonCheck = (level, _input, report) => {
  const offered = (property: string) =>
    level.allowed.includes(property) ||
    (property.startsWith('--') && level.allowed.includes('--*'));
  for (const rule of level.rules.filter((each) => each.editable)) {
    const written = rule.solution.matchAll(/(?:^|[;{\s])(--[\w-]+|[a-z][a-z-]*)\s*:/g);
    for (const [, property = ''] of written) {
      if (offered(property)) continue;
      report(
        `la solución de «${rule.selector}» usa «${property}», que no está en las runas permitidas (allowed)`,
      );
    }
  }
};

/** Every tag has to be reachable from the index filters of its world. */
const checkTags: LessonCheck = (level, _input, report) => {
  const filterable = new Set(WORLD_BY_ID[level.world].filters.flatMap(([, tags]) => tags));
  const tags = [...(level.concepts ?? []), ...(level.variant ? [level.variant] : [])];
  for (const tag of tags.filter((each) => !filterable.has(each))) {
    report(`la etiqueta «${tag}» no está en los filtros de «${level.world}» (core/data)`);
  }
};

const checkDrawings: LessonCheck = (level, { symbols }, report) => {
  if (level.secret && !symbols.has(`dib-${level.secret.drawing}`)) {
    report(`falta el dibujo «dib-${level.secret.drawing}»`);
  }
  if (level.portrait && !symbols.has(level.portrait))
    report(`falta el retrato «${level.portrait}»`);
};

/** A piece type that is declared has to have something to show. */
const checkPieceTypes: LessonCheck = (level, { symbols, styles }, report) => {
  for (const piece of level.pieces) {
    if (!pieceTypes[piece.type]) continue;
    const { material, icon, token } = piece.kind;
    if (material && !styles.includes(`.m-${material}`)) {
      report(
        `la pieza «${piece.type}» usa el material «${material}» y no hay ningún estilo .m-${material}`,
      );
    }
    const drawing = icon || token;
    if (drawing && !symbols.has(`i-${drawing}`)) {
      report(`la pieza «${piece.type}» no tiene dibujo «i-${drawing}»`);
    }
  }
};

/** A fixed rule that names a class no piece has does nothing, and nobody notices. */
const checkFixedRules: LessonCheck = (level, _input, report) => {
  const classes = new Set(['tablero', 'pieza', ...STATE_CLASSES]);
  for (const piece of level.pieces) {
    classes.add(piece.type);
    for (const name of piece.variant.split(' ')) if (name) classes.add(name);
  }
  const fixedRules = level.rules.filter((rule) => !rule.editable && rule.ownSelector === undefined);
  for (const rule of fixedRules) {
    for (const [, name = ''] of rule.selector.matchAll(/\.([a-zA-Z][\w-]*)/g)) {
      if (classes.has(name)) continue;
      report(
        `la regla fija «${rule.selector}» nombra la clase «.${name}», que no lleva ninguna pieza`,
      );
    }
  }
};

const LESSON_CHECKS: readonly LessonCheck[] = [
  checkPlacement,
  checkRequiredFields,
  checkRunes,
  checkTags,
  checkDrawings,
  checkPieceTypes,
  checkFixedRules,
];

function auditInhabitant(key: string, world: string, input: AuditInput, report: Report): void {
  const inhabitant = input.inhabitants[key];
  if (!inhabitant) {
    report(`mapa de ${world}`, `el habitante «${key}» no está en inhabitants.json`);
    return;
  }
  if (!inhabitant.jokes?.length) report(`habitante ${key}`, 'no tiene nada que decir (jokes)');
  if (inhabitant.sprite && !input.symbols.has(`i-${inhabitant.sprite}`)) {
    report(`habitante ${key}`, `falta el dibujo «i-${inhabitant.sprite}»`);
  }
}

function auditMaps(input: AuditInput, report: Report): void {
  for (const world of WORLD_IDS) {
    if (!levels.some((level) => level.world === world)) report(world, 'no tiene ejercicios');
    for (const key of input.placements[world] ?? []) auditInhabitant(key, world, input, report);
  }
  const placed = new Set(Object.values(input.placements).flat());
  for (const key of Object.keys(input.inhabitants)) {
    if (!placed.has(key)) report(`habitante ${key}`, 'no aparece en ningún mapa (scenery.json)');
  }
}

/** Every problem found, as `where: what` lines. */
export function auditCatalog(input: AuditInput): string[] {
  const problems: string[] = [];
  const report: Report = (where, what) => problems.push(`${where}: ${what}`);
  auditIds(report);
  for (const level of levels) {
    for (const check of LESSON_CHECKS) check(level, input, (what) => report(level.id, what));
  }
  auditMaps(input, report);
  return problems;
}

/** `isle 91 · grid 69 · …` */
export const catalogSummary = (): string =>
  WORLD_IDS.map(
    (world) => `${world} ${levels.filter((level) => level.world === world).length}`,
  ).join(' · ');
