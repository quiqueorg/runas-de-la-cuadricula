/** The card a region marker opens: its character, progress and lessons. Pure. */
import { levelLabel, levelsInRegion, regionPrerequisites, regions } from '../../core/catalog';
import { isDiscovered, isDone, regionComplete, regionStats } from '../../core/progress/queries';
import type { Progress } from '../../core/progress/types';

export interface RegionCardRow {
  readonly id: string;
  readonly className: string;
  readonly label: string;
  readonly name: string;
  readonly extra: string;
  readonly score: number | null;
  readonly gem: boolean;
  readonly done: boolean;
  readonly exam: boolean;
}

export interface RegionCard {
  readonly known: boolean;
  readonly title: string;
  readonly kicker: string;
  readonly speaker: string;
  readonly portrait: string;
  /** Progress bar, 0 to 100. */
  readonly bar: number;
  readonly progress: string;
  /** Why an undiscovered region is closed. */
  readonly blocked: string;
  readonly rows: readonly RegionCardRow[];
  readonly next: { readonly id: string; readonly label: string; readonly review: boolean } | null;
}

/** `a, b y c` */
function listOf(names: readonly string[]): string {
  if (names.length <= 1) return names[0] ?? 'la región anterior';
  return `${names.slice(0, -1).join(', ')} y ${names.at(-1)}`;
}

function blockedCard(regionIndex: number, progress: Progress): RegionCard {
  const waiting = regionPrerequisites(regionIndex)
    .filter((index) => !regionComplete(progress, index))
    .map((index) => regions[index]?.name ?? 'la región anterior');
  return {
    known: false,
    title: 'Región sin descubrir',
    kicker: '',
    speaker: '',
    portrait: '',
    bar: 0,
    progress: '',
    blocked: `El camino hasta aquí se abrirá cuando completes ${listOf(waiting)}. Si tienes prisa, el índice te lleva a cualquier ejercicio.`,
    rows: [],
    next: null,
  };
}

export function regionCard(regionIndex: number, progress: Progress): RegionCard | null {
  const region = regions[regionIndex];
  if (!region) return null;
  if (!isDiscovered(progress, regionIndex)) return blockedCard(regionIndex, progress);
  const lessons = levelsInRegion(regionIndex);
  const stats = regionStats(progress, regionIndex);
  const next = lessons.find((level) => !isDone(progress, level.id)) ?? lessons[0];
  let kicker = `Región ${region.number} · ${region.subtitle}`;
  let unit = 'ejercicios superados';
  if (region.boss) [kicker, unit] = ['Combate final', 'fases superadas'];
  else if (region.exam) [kicker, unit] = ['Prueba de aprendizaje', 'pruebas superadas'];
  const reviewing = next ? isDone(progress, next.id) : false;
  return {
    known: true,
    title: region.name,
    kicker,
    speaker: `${region.character}, ${region.role}`,
    portrait: `pj-${regionIndex}`,
    bar: (stats.done / stats.total) * 100,
    progress: `${stats.done} de ${stats.total} ${unit}`,
    blocked: '',
    rows: lessons.map((level) => {
      const result = progress.results[level.id];
      return {
        id: level.id,
        className: [result && 'cleared', level === next && !result && 'up-next']
          .filter(Boolean)
          .join(' '),
        label: levelLabel(level.id),
        name: level.title,
        extra: level.variant ?? '',
        score: result?.stars ?? (result ? 1 : 0),
        gem: Boolean(result?.mastered),
        done: Boolean(result),
        exam: Boolean(level.exam),
      };
    }),
    next: next
      ? {
          id: next.id,
          label: `${reviewing ? 'Repasar' : 'Continuar aquí'} · ${levelLabel(next.id)}`,
          review: reviewing,
        }
      : null,
  };
}
