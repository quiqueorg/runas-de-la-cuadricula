/**
 * The assembled lesson catalog and the questions that only depend on it. Anything that depends on
 * the player's progress lives in `core/progress/queries.ts`.
 */
import { WORLDS } from '../data';
import type { FilterGroup, Level, PieceType, Region, WorldContent, WorldId } from '../models';
import { normalizeLevel } from './normalize';

/** The three adventures that must be finished before the finale wakes up. */
export const ADVENTURES = ['grid', 'flex', 'sky'] as const satisfies readonly WorldId[];

export const WORLD_BY_ID = Object.fromEntries(WORLDS.map((world) => [world.id, world])) as Record<
  WorldId,
  WorldContent
>;

/** Kinds of exercise, properties and concepts of one world's index. */
export function filterProperties(groups: readonly FilterGroup[]): string[] {
  return groups.slice(1, -1).flatMap(([, tags]) => [...tags]);
}

/** Every property some index can filter by. A lesson's tags list the ones its solution uses. */
export const CSS_PROPS: readonly string[] = [
  ...new Set(WORLDS.flatMap((world) => filterProperties(world.filters))),
];
export const CONCEPTS: ReadonlySet<string> = new Set(
  WORLDS.flatMap((world) => world.filters.at(-1)?.[1] ?? []),
);
export const EXERCISE_KINDS: ReadonlySet<string> = new Set(
  WORLDS.flatMap((world) => world.filters[0]?.[1] ?? []),
);

function buildRegions(): Region[] {
  const regions: Region[] = [];
  for (const world of WORLDS) {
    world.regions.forEach((draft, local) => {
      regions.push({ ...draft, world: world.id, index: regions.length, number: local + 1 });
    });
  }
  return regions;
}

export const regions: readonly Region[] = buildRegions();

/** Global index of each world's first region. Lessons count their regions from there. */
export const REGION_OFFSET = Object.fromEntries(
  WORLDS.map((world) => [world.id, regions.findIndex((region) => region.world === world.id)]),
) as Record<WorldId, number>;

/** One piece-type table for every world. When two worlds name the same type, the earlier one wins. */
function mergePieceTypes(): Record<string, PieceType> {
  const merged: Record<string, PieceType> = {};
  for (const world of WORLDS) {
    for (const [name, type] of Object.entries(world.pieceTypes)) merged[name] ??= type;
  }
  return merged;
}

export const pieceTypes: Readonly<Record<string, PieceType>> = mergePieceTypes();

function buildLevels(): Level[] {
  const drafts = WORLDS.flatMap((world) => world.lessons.map((draft) => ({ world, draft })));
  return drafts.map(({ world, draft }, index) => {
    const region = regions[REGION_OFFSET[world.id] + draft.region];
    if (!region || region.world !== world.id) {
      throw new Error(`Lesson ${draft.id}: region ${draft.region} does not exist in ${world.id}`);
    }
    return normalizeLevel(draft, {
      world: world.id,
      region,
      index,
      pieceTypes,
      cssProperties: CSS_PROPS,
    });
  });
}

export const levels: readonly Level[] = buildLevels();

export const levelsById: Readonly<Record<string, Level>> = Object.fromEntries(
  levels.map((level) => [level.id, level]),
);

export function regionOf(level: Level): Region {
  const region = regions[level.region];
  if (!region) throw new Error(`Missing region ${level.region}`);
  return region;
}

export const levelsInRegion = (regionIndex: number): Level[] =>
  levels.filter((level) => level.region === regionIndex);

export const levelsInWorld = (world: WorldId): Level[] =>
  levels.filter((level) => level.world === world);

export const isExercise = (level: Level): boolean => !level.exam && !level.secret;

export const levelKind = (level: Level): string => (level.exam ? 'Prueba' : 'Ejercicio');

function byWorld<T>(read: (world: WorldId) => T): Record<WorldId, T> {
  return Object.fromEntries(WORLDS.map((world) => [world.id, read(world.id)])) as Record<
    WorldId,
    T
  >;
}

/** Each world's trail: its lessons in order, without the secrets. */
export const routes: Readonly<Record<WorldId, readonly Level[]>> = byWorld((world) =>
  levelsInWorld(world).filter((level) => !level.secret),
);
export const routeOf = (level: Level): readonly Level[] => routes[level.world];

export const secretsInWorld = (world: WorldId): Level[] =>
  levelsInWorld(world).filter((level) => level.secret);

export const EXERCISE_COUNTS = byWorld((world) => levelsInWorld(world).filter(isExercise).length);
export const EXAM_COUNTS = byWorld(
  (world) => levelsInWorld(world).filter((level) => level.exam).length,
);

/**
 * Worlds whose board is not a single layout technique (the isle, the skies and the finale): their
 * guides follow whatever the player wrote, and goals are measured on hidden copies of the board.
 */
export const isOpenBoard = (level: Level): boolean =>
  level.world === 'isle' || level.world === 'sky' || level.world === 'finale';

export const isFirstInWorld = (regionIndex: number): boolean =>
  regions[regionIndex - 1]?.world !== regions[regionIndex]?.world;

/** Global indexes of the regions this one waits for: its own `after`, or simply the previous one. */
export function regionPrerequisites(regionIndex: number): number[] {
  const region = regions[regionIndex];
  if (!region?.after) return [regionIndex - 1];
  const first = REGION_OFFSET[region.world];
  return region.after.map((local) => first + local);
}

/**
 * Isle ids keep the number they were born with (they are save keys), so players read where the
 * lesson sits instead: the region's place on the trail and the lesson's place in the region.
 */
const ISLE_LABELS: ReadonlyMap<string, string> = new Map(
  levelsInWorld('isle')
    .filter((level) => !regions[level.region]?.secret)
    .map((level) => {
      const place = levelsInRegion(level.region).indexOf(level) + 1;
      return [level.id, `${regions[level.region]?.number ?? ''}·${place}`];
    }),
);

/** The number players read: `3·2`, `Fase 4`… Grid ids are shown as they are. */
export function levelLabel(id: string): string {
  const isle = ISLE_LABELS.get(id);
  if (isle) return isle;
  const prefix = id[0] ?? '';
  if (prefix === 'x') return `Fase ${id.split('-')[1]}`;
  // Flex (f), sky (c) and isle (b) ids count regions from zero; players count from one.
  const shown = 'fcb'.includes(prefix)
    ? id.slice(1).replace(/^\d+/, (digits) => String(Number(digits) + 1))
    : id;
  return shown.replace('-', '·');
}
