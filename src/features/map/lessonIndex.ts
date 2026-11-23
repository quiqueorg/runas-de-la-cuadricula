/** The map's lesson index: search, filters, and every lesson grouped by region. Pure. */
import {
  CONCEPTS,
  EXERCISE_KINDS,
  levelLabel,
  levels,
  levelsInWorld,
  regions,
  WORLD_BY_ID,
} from '../../core/catalog';
import type { Level, Region, WorldId } from '../../core/models';
import { isDone, regionStats } from '../../core/progress/queries';
import type { Progress } from '../../core/progress/types';
import { foldText } from '../../shared/dom';
import type { MapUi, StatusFilter } from './state';

export interface IndexFilters {
  readonly query: string;
  readonly status: StatusFilter;
  /** Number of tags switched on. */
  readonly active: number;
  readonly groups: readonly {
    readonly title: string;
    readonly chips: readonly {
      readonly tag: string;
      readonly count: number;
      readonly pressed: boolean;
    }[];
  }[];
  /** Something is filtered: show "clear". */
  readonly dirty: boolean;
}

export interface IndexCard {
  readonly id: string;
  /** An undiscovered secret: only its hint shows. */
  readonly hidden: boolean;
  readonly hint: string;
  readonly label: string;
  readonly title: string;
  readonly badge: string;
  readonly tags: readonly { readonly text: string; readonly concept: boolean }[];
  readonly className: string;
  readonly exam: boolean;
  readonly score: number | null;
  readonly gem: boolean;
  readonly done: boolean;
}

export interface IndexGroup {
  readonly id: number;
  readonly className: string;
  readonly emblem: boolean;
  readonly secret: boolean;
  readonly number: string;
  readonly title: string;
  readonly detail: string;
  readonly cards: readonly IndexCard[];
}

function matchesFilters(level: Level, ui: MapUi, progress: Progress): boolean {
  const done = isDone(progress, level.id);
  if (ui.status === 'pending' && done) return false;
  if (ui.status === 'done' && !done) return false;
  if (ui.tags.size && !level.tags.some((tag) => ui.tags.has(tag))) return false;
  if (!ui.query) return true;
  const haystack = foldText(
    [
      level.id,
      levelLabel(level.id),
      level.title,
      ...level.tags,
      ...level.allowed,
      regions[level.region]?.name ?? '',
    ].join(' '),
  );
  return foldText(ui.query)
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

function filtersOf(world: WorldId, ui: MapUi): IndexFilters {
  const counts = new Map<string, number>();
  for (const level of levelsInWorld(world)) {
    for (const tag of level.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return {
    query: ui.query,
    status: ui.status,
    active: ui.tags.size,
    dirty: ui.tags.size > 0 || ui.query.length > 0 || ui.status !== 'all',
    groups: WORLD_BY_ID[world].filters.flatMap(([title, tags]) => {
      const chips = tags
        .filter((tag) => counts.get(tag))
        .map((tag) => ({ tag, count: counts.get(tag) ?? 0, pressed: ui.tags.has(tag) }));
      return chips.length ? [{ title, chips }] : [];
    }),
  };
}

const UNDISCOVERED: Omit<IndexCard, 'id' | 'hint'> = {
  hidden: true,
  label: '?·?',
  title: 'Lugar sin descubrir',
  badge: '',
  tags: [],
  className: '',
  exam: false,
  score: null,
  gem: false,
  done: false,
};

function cardOf(level: Level, region: Region, progress: Progress): IndexCard {
  if (region.secret && !progress.foundSecrets[level.id]) {
    return { ...UNDISCOVERED, id: level.id, hint: level.secret?.hint ?? '' };
  }
  const result = progress.results[level.id];
  return {
    id: level.id,
    hidden: false,
    hint: '',
    label: levelLabel(level.id),
    title: level.title,
    badge: level.variant ?? '',
    tags: level.tags
      .filter((tag) => !EXERCISE_KINDS.has(tag))
      .map((tag) => ({ text: tag, concept: CONCEPTS.has(tag) })),
    className: [
      'exercise-card',
      result && 'cleared',
      result?.mastered && 'mastered',
      level.exam && 'exam',
      progress.currentLessonId === level.id && 'es-actual',
    ]
      .filter(Boolean)
      .join(' '),
    exam: Boolean(level.exam),
    score: result?.stars ?? (result ? 1 : 0),
    gem: Boolean(result?.mastered),
    done: Boolean(result),
  };
}

export function lessonIndex(
  world: WorldId,
  ui: MapUi,
  progress: Progress,
): { readonly filters: IndexFilters; readonly groups: readonly IndexGroup[] } {
  const groups = regions.flatMap((region): IndexGroup[] => {
    if (region.world !== world) return [];
    const rows = levels.filter(
      (level) => level.region === region.index && matchesFilters(level, ui, progress),
    );
    if (!rows.length) return [];
    const stats = regionStats(progress, region.index);
    return [
      {
        id: region.index,
        className: ['level-group', region.exam && 'exam', region.secret && 'secretos']
          .filter(Boolean)
          .join(' '),
        emblem: Boolean(region.exam),
        secret: Boolean(region.secret),
        number: region.secret ? '?' : String(region.number),
        title: region.name,
        detail: `${region.subtitle} · ${stats.done} de ${stats.total}`,
        cards: rows.map((level) => cardOf(level, region, progress)),
      },
    ];
  });
  return { filters: filtersOf(world, ui), groups };
}
