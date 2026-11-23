/** What the title screen shows. Pure: it only reads the catalog and the progress it is given. */
import {
  ADVENTURES,
  EXAM_COUNTS,
  EXERCISE_COUNTS,
  levelLabel,
  WORLD_BY_ID,
} from '../../core/catalog';
import { WORLD_IDS, type WorldId } from '../../core/models';
import {
  completedCount,
  examsDone,
  exercisesDone,
  finaleUnlocked,
  hasStarted,
  nextPendingLevel,
  worldComplete,
} from '../../core/progress/queries';
import type { Progress } from '../../core/progress/types';

export interface AdventureCard {
  readonly world: WorldId;
  readonly tech: string;
  readonly title: string;
  readonly className: string;
  readonly status: string;
  readonly action: string;
  /** Progress bar, 0 to 100. */
  readonly percent: number;
  readonly locked: boolean;
}

function finaleCard(
  progress: Progress,
  done: number,
  total: number,
): Omit<AdventureCard, 'world' | 'tech' | 'title' | 'className'> {
  const unlocked = finaleUnlocked(progress);
  const started = hasStarted(progress, 'finale');
  const finished = ADVENTURES.filter((world) => worldComplete(progress, world)).length;
  if (!unlocked) {
    return {
      status: `${finished} de ${ADVENTURES.length} aventuras · despierta al completarlas todas`,
      action: 'Bloqueado',
      percent: (finished / ADVENTURES.length) * 100,
      locked: true,
    };
  }
  let status = '¡Ha despertado! Seis fases que lo mezclan todo';
  if (done === total) status = '¡Derrotado! Los tres mundos están a salvo';
  else if (started) status = `Fase ${done + 1} de ${total}`;
  return {
    status,
    action: started ? 'Continuar' : '¡Al combate!',
    percent: (done / total) * 100,
    locked: false,
  };
}

function adventureStatus(progress: Progress, world: WorldId, done: number, total: number): string {
  if (!hasStarted(progress, world)) {
    const ending = world === 'sky' ? 'un jefe final' : 'una prueba final';
    return `${EXERCISE_COUNTS[world]} ejercicios, ${ending} y algún secreto`;
  }
  if (done === total) {
    return world === 'isle'
      ? '¡Aprendizaje completado! Te quedan los secretos… y el continente'
      : '¡Aventura completada! Vuelve a por los secretos';
  }
  const next = nextPendingLevel(progress, world);
  return `${done} de ${total} · siguiente: ${levelLabel(next.id)} ${next.title}`;
}

export function adventureCards(progress: Progress): readonly AdventureCard[] {
  return WORLD_IDS.map((world) => {
    const { name, card } = WORLD_BY_ID[world];
    const total = EXERCISE_COUNTS[world] + EXAM_COUNTS[world];
    const done = exercisesDone(progress, world) + examsDone(progress, world);
    const copy = { world, tech: card.tech, title: name, className: card.className };
    if (world === 'finale') return { ...copy, ...finaleCard(progress, done, total) };
    return {
      ...copy,
      status: adventureStatus(progress, world, done, total),
      action: hasStarted(progress, world) ? 'Continuar' : 'Empezar',
      percent: (done / total) * 100,
      locked: false,
    };
  });
}

/** What "New game" warns about, or null when there is nothing to lose. */
export function resetWarning(progress: Progress): string | null {
  const count = completedCount(progress);
  if (count) {
    return `Se borrará tu progreso de todas las aventuras (${count} ejercicios y pruebas superados) y todo lo escrito en las tablillas.`;
  }
  return Object.keys(progress.code).length ? 'Se borrará todo lo escrito en las tablillas.' : null;
}
