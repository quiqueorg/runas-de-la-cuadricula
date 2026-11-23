/** What solving a lesson earns, and the dialog that says so. Pure: the caller saves the result. */
import {
  EXERCISE_COUNTS,
  levelsInRegion,
  levelsInWorld,
  regions,
  routeOf,
  secretsInWorld,
} from '../../core/catalog';
import type { Level, Region, WorldId } from '../../core/models';
import { exercisesDone, finaleUnlocked, isDone, regionStats } from '../../core/progress/queries';
import type { LessonResult, Progress } from '../../core/progress/types';

export interface VictoryModel {
  readonly practice?: Level['practice'];
  readonly title: string;
  /** Exam grade, or null for a lesson. */
  readonly stars: number | null;
  readonly bodyHtml: string;
  readonly quote: string;
  readonly portrait: string;
  readonly landmark: string;
  readonly landmarkIcon: string;
  readonly progressText: string;
  readonly nextLabel: string | null;
  readonly nextId: string | null;
}

export interface Attempt {
  /** The player opened a hint or the solution. */
  readonly usedHelp: boolean;
  /** The clock ran out before the lesson was solved. */
  readonly ranOut: boolean;
}

const WORLD_ENDINGS: Record<WorldId, string> = {
  isle: '¡Has terminado tu aprendizaje!',
  grid: '¡Has restaurado la cuadrícula!',
  flex: '¡Has dominado el subsuelo!',
  sky: '¡Has conquistado los cielos!',
  finale: '¡Los tres mundos están a salvo!',
};

/** Three stars at the first delivery, two after one or two failures, one after more. */
const examStars = (failures: number): number => (failures === 0 ? 3 : failures <= 2 ? 2 : 1);

/** "a Bruma", or the region's own wording ("al Huracán"). */
const bossName = (region: Region | undefined): string =>
  region?.nameWithArticle || `a ${region?.character ?? ''}`;

const capitalize = (text: string): string => `${text[0]?.toUpperCase() ?? ''}${text.slice(1)}`;

export function lessonResult(level: Level, progress: Progress, attempt: Attempt): LessonResult {
  const previous = progress.results[level.id];
  const failures = progress.failedAttempts[level.id] ?? 0;
  const onTime = !(level.timeLimit && attempt.ranOut);
  const stars = level.exam ? Math.max(examStars(failures), previous?.stars ?? 0) : previous?.stars;
  return {
    mastered:
      Boolean(previous?.mastered) ||
      (level.exam ? examStars(failures) === 3 : !attempt.usedHelp && onTime),
    completedAt: Date.now(),
    ...(stars === undefined ? {} : { stars }),
  };
}

interface Outcome {
  readonly level: Level;
  readonly region: Region | undefined;
  readonly before: Progress;
  readonly after: Progress;
  readonly firstTime: boolean;
  readonly regionJustCompleted: boolean;
  readonly exams: readonly Level[];
  readonly examsPassed: readonly Level[];
  readonly finalExam: boolean;
  /** Boss phases still standing. */
  readonly bossLeft: number;
}

function outcomeOf(level: Level, before: Progress, after: Progress): Outcome {
  const firstTime = !isDone(before, level.id);
  const regionBefore = regionStats(before, level.region);
  const regionAfter = regionStats(after, level.region);
  const regionJustCompleted =
    !level.secret &&
    firstTime &&
    regionAfter.done === regionAfter.total &&
    regionBefore.done < regionAfter.total;
  const exams = levelsInWorld(level.world).filter((item) => item.exam);
  const examsPassed = exams.filter((item) => isDone(after, item.id));
  return {
    level,
    region: regions[level.region],
    before,
    after,
    firstTime,
    regionJustCompleted,
    exams,
    examsPassed,
    finalExam: Boolean(level.exam) && examsPassed.length === exams.length && regionJustCompleted,
    bossLeft: level.boss
      ? levelsInRegion(level.region).filter((item) => !isDone(after, item.id)).length
      : 0,
  };
}

function titleOf(outcome: Outcome): string {
  const { level, region, after, firstTime } = outcome;
  if (level.boss)
    return outcome.bossLeft === 0 ? `¡Has derrotado ${bossName(region)}!` : '¡Golpe certero!';
  if (outcome.finalExam) return '¡Prueba de aprendizaje superada!';
  const routeDone = routeOf(level).every((item) => isDone(after, item.id));
  if (routeDone && firstTime) return WORLD_ENDINGS[level.world];
  if (outcome.regionJustCompleted) return '¡Región completada!';
  return level.exam ? '¡Prueba superada!' : '¡Ejercicio superado!';
}

const LATE_DEFAULT =
  'Superado, aunque la tormenta te alcanzó. Repítelo a tiempo y sin pistas para dominarlo.';

function examBody(outcome: Outcome): string {
  const { level, before, after } = outcome;
  const failures = before.failedAttempts[level.id] ?? 0;
  let storm = '';
  if (level.boss && outcome.bossLeft === 0 && outcome.firstTime) {
    storm =
      level.world === 'finale'
        ? '<b>¡Lo has conseguido!</b> Grid, Flexbox, media queries, variables y transiciones: ya lo dominas todo. '
        : '<b>Fin de la tormenta.</b> ';
  }
  const plural = failures > 1 ? 's' : '';
  const attempt =
    failures === 0 ? 'A la primera.' : `Tras ${failures} entrega${plural} fallida${plural}.`;
  if (!outcome.finalExam) return `${storm}${attempt}`;
  const stars = outcome.examsPassed.reduce(
    (sum, item) => sum + (after.results[item.id]?.stars ?? 0),
    0,
  );
  return `${storm}${attempt} Nota final: <b>${stars} de ${outcome.exams.length * 3}</b> estrellas.`;
}

function bodyOf(outcome: Outcome, result: LessonResult, attempt: Attempt): string {
  const { level, before, after } = outcome;
  let body: string;
  if (level.exam) body = examBody(outcome);
  else if (level.timeLimit && attempt.ranOut) body = level.timeMessages?.late || LATE_DEFAULT;
  else if (result.mastered) body = '<b>Dominado</b>: sin pistas ni soluciones.';
  else body = 'Superado con ayuda. Vuelve más tarde sin pistas para dominarlo.';
  if (!finaleUnlocked(before) && finaleUnlocked(after)) {
    body +=
      '<span class="dv-despierta">Algo se ha despertado en el Vacío entre los Mundos… El combate final te espera en el menú principal.</span>';
  }
  return body;
}

function nextLabelOf(level: Level, next: Level): string {
  if (next.boss && !level.boss) return `Enfrentarse ${bossName(regions[next.region])}`;
  if (next.boss) return 'Siguiente fase';
  if (next.exam && !level.exam) return 'Empezar la prueba de aprendizaje';
  if (next.region !== level.region) return `Viajar a ${regions[next.region]?.name ?? ''}`;
  return next.exam ? 'Siguiente prueba' : 'Siguiente ejercicio';
}

function progressTextOf(outcome: Outcome): string {
  const { level, region, after } = outcome;
  if (level.boss) {
    if (outcome.bossLeft) {
      const phases = levelsInRegion(level.region).length;
      return `${capitalize(bossName(region))} le quedan ${outcome.bossLeft} de ${phases} vidas`;
    }
    return level.world === 'finale'
      ? 'Los garabatos se alinean: ¡las runas vuelven a obedecer!'
      : 'La tormenta se disipa: el cielo vuelve a ser de todos';
  }
  if (level.secret) {
    const secrets = secretsInWorld(level.world);
    const found = secrets.filter((item) => isDone(after, item.id)).length;
    return `Secretos resueltos: ${found} de ${secrets.length}`;
  }
  if (outcome.regionJustCompleted) {
    const { total } = regionStats(after, level.region);
    return `${region?.name ?? ''}: ${total} de ${total}`;
  }
  if (level.exam) {
    return `Prueba de aprendizaje: ${outcome.examsPassed.length} de ${outcome.exams.length}`;
  }
  return `${exercisesDone(after, level.world)} de ${EXERCISE_COUNTS[level.world]} ejercicios superados`;
}

/** The result to save and the dialog to show, given the progress before the lesson was solved. */
export function victoryOf(
  level: Level,
  before: Progress,
  attempt: Attempt,
): { readonly result: LessonResult; readonly model: VictoryModel } {
  const result = lessonResult(level, before, attempt);
  const after: Progress = {
    ...before,
    results: { ...before.results, [level.id]: result },
    failedAttempts: level.exam
      ? { ...before.failedAttempts, [level.id]: 0 }
      : before.failedAttempts,
  };
  const outcome = outcomeOf(level, before, after);
  const route = routeOf(level);
  const next = level.secret ? undefined : route[route.indexOf(level) + 1];
  return {
    result,
    model: {
      title: titleOf(outcome),
      ...(level.practice ? { practice: level.practice } : {}),
      // This delivery's grade; the saved one is the best so far.
      stars: level.exam ? examStars(before.failedAttempts[level.id] ?? 0) : null,
      bodyHtml: bodyOf(outcome, result, attempt),
      quote: level.farewell ?? '',
      portrait: level.portrait || `pj-${level.region}`,
      landmark: `${level.title} ya brilla en el mapa`,
      landmarkIcon: `i-${level.landmark}`,
      progressText: progressTextOf(outcome),
      nextLabel: next ? nextLabelOf(level, next) : null,
      nextId: next?.id ?? null,
    },
  };
}
