/** Title-screen facts. No rendering. */
import { ADVENTURES, EXAM_COUNTS, EXERCISE_COUNTS, WORLD_IDS, completedCount, examProgress, exerciseProgress, finaleUnlocked, levelLabel, levelsInWorld, nextPendingLevel, worldComplete } from '../../core/catalog';
import type { WorldId } from '../../core/models';
import { progress } from '../../core/state';
import type { HomeAction, HomeEffect } from './actions';

const COPY: Record<WorldId, { tech: string; title: string; className: string }> = {
  grid: { tech: 'CSS Grid · la superficie', title: 'Las Ruinas de la Cuadrícula', className: '' },
  flex: { tech: 'Flexbox · bajo tierra', title: 'El Subsuelo Flexible', className: 'is-underground' },
  cielo: { tech: 'Media queries · variables · transiciones', title: 'Los Cielos Cambiantes', className: 'is-sky' },
  final: { tech: 'Combate final · todo a la vez', title: 'El Vacío entre los Mundos', className: 'is-final' },
};

export interface AdventureCard {
  readonly world: WorldId;
  readonly tech: string;
  readonly title: string;
  readonly className: string;
  readonly status: string;
  readonly action: string;
  readonly width: number;
  readonly locked: boolean;
}

export function adventureCards(): readonly AdventureCard[] {
  const unlocked = finaleUnlocked();
  const finished = ADVENTURES.filter(worldComplete).length;
  return WORLD_IDS.map((world) => {
    const copy = COPY[world];
    const total = EXERCISE_COUNTS[world] + EXAM_COUNTS[world];
    const done = exerciseProgress(world) + examProgress(world);
    const started = levelsInWorld(world).some((level) => progress.hechos[level.id] || progress.codigo[level.id]);
    if (world === 'final') {
      return {
        world,
        tech: copy.tech,
        title: copy.title,
        className: copy.className,
        status: !unlocked ? `${finished} de 3 aventuras · despierta al completarlas todas` : done === total ? '¡Derrotado! Los tres mundos están a salvo' : started ? `Fase ${done + 1} de ${total}` : '¡Ha despertado! Seis fases que lo mezclan todo',
        action: !unlocked ? 'Bloqueado' : started ? 'Continuar' : '¡Al combate!',
        width: (unlocked ? done / total : finished / 3) * 100,
        locked: !unlocked,
      };
    }
    const next = nextPendingLevel(world);
    return {
      world,
      tech: copy.tech,
      title: copy.title,
      className: copy.className,
      status: !started ? `${EXERCISE_COUNTS[world]} ejercicios, ${world === 'cielo' ? 'un jefe final' : 'una prueba final'} y algún secreto` : done === total ? '¡Aventura completada! Vuelve a por los secretos' : `${done} de ${total} · siguiente: ${levelLabel(next.id)} ${next.n}`,
      action: started ? 'Continuar' : 'Empezar',
      width: (done / total) * 100,
      locked: false,
    };
  });
}

export function decideHome(action: HomeAction): HomeEffect {
  if (action.type === 'toggle-sound') return { type: 'toggle-sound' };
  if (action.type === 'select') {
    if (action.world === 'final' && !finaleUnlocked()) return { type: 'shake' };
    return { type: 'enter', world: action.world };
  }
  const count = completedCount();
  if (!count && !Object.keys(progress.codigo).length) return { type: 'reset' };
  return {
    type: 'confirm-reset',
    text: count ? `Se borrará tu progreso de las tres aventuras (${count} ejercicios y pruebas superados) y todo lo escrito en las tablillas.` : 'Se borrará todo lo escrito en las tablillas.',
  };
}

export function clearProgress(): void {
  progress.hechos = {};
  progress.codigo = {};
  progress.intentos = {};
  progress.secretos = {};
  progress.vistas = {};
  progress.actual = null;
}
