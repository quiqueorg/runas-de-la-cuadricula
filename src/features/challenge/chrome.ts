/** Everything around the board that depends only on the lesson and the progress. Pure. */
import { isOpenBoard, levelLabel, levelsInRegion, regionOf, routeOf } from '../../core/catalog';
import type { BoardState, Level } from '../../core/models';
import { isDone } from '../../core/progress/queries';
import type { Progress } from '../../core/progress/types';
import { usesProbes } from './evaluate';
import { boardMarkup } from './Pieces';

const BOSS_HEARTS = 3;

export interface BossBar {
  readonly name: string;
  readonly role: string;
  readonly portrait: string;
  readonly phase: number;
  readonly phases: number;
  readonly phaseName: string;
  readonly hearts: number;
  readonly life: string;
  readonly bars: readonly {
    readonly id: string;
    readonly broken: boolean;
    readonly current: boolean;
  }[];
}

export interface StateButton {
  readonly icon: string;
  readonly pressed: string;
  readonly idle: string;
}

export interface LessonChrome {
  /** World and lesson modifiers for the screen's root. */
  readonly className: string;
  readonly kicker: string;
  readonly step: string;
  readonly title: string;
  readonly progressLabel: string;
  readonly previousId: string | null;
  readonly nextId: string | null;
  readonly guidesLabel: string;
  readonly notice: string;
  readonly boss: BossBar | null;
  readonly portrait: string;
  readonly speaker: string;
  readonly speech: string;
  readonly note: string | null;
  readonly theory: { readonly kind: 'boss' | 'exam' | 'lesson'; readonly html: string };
  readonly objectiveHtml: string;
  readonly exam: boolean;
  readonly hintHtml: string;
  readonly earlyHints: readonly string[];
  /** "la solución" or "la declaración", for the hint box's last button. */
  readonly revealWhat: string;
  readonly runes: readonly string[];
  readonly timed: boolean;
  readonly views: readonly string[];
  readonly viewsLabel: string;
  readonly state: StateButton | null;
  /** Render the hidden copies measured without transitions. */
  readonly probes: boolean;
  /** The lesson has guides to switch on (grid lines or flex axes). */
  readonly guides: boolean;
  /** The goal can be peeked at on the board itself. */
  readonly peek: boolean;
  readonly markup: string | null;
  readonly floor: string;
  readonly boardLabel: string;
  readonly pieceCount: number;
}

const STATE_BUTTONS: Record<BoardState, StateButton> = {
  active: { icon: 'i-rayo', pressed: 'Volver al reposo', idle: 'Activar' },
  hover: { icon: 'i-cursor', pressed: 'Quitar el cursor', idle: 'Pasar el cursor' },
  pressed: { icon: 'i-cursor', pressed: 'Soltar', idle: 'Mantener pulsado' },
  focus: { icon: 'i-cursor', pressed: 'Quitar el foco', idle: 'Dar el foco' },
};

const EXAM_INTRO =
  '<b>Prueba de aprendizaje:</b> sin teoría, pistas ni huellas. Reproduce el plano y pulsa <b>Entregar</b>; a la primera, tres estrellas.';

function rootClass(level: Level, solved: boolean): string {
  const sky = level.world === 'sky' || level.world === 'finale';
  return [
    'view',
    level.world === 'flex' && 'is-flex',
    sky && 'is-sky',
    level.world === 'isle' && 'is-base',
    level.world === 'finale' && 'is-final',
    level.tokenSize && 'dim',
    level.boss && 'boss',
    level.exam && 'exam',
    level.mirage && 'mirage',
    level.className,
    solved && 'solved',
  ]
    .filter(Boolean)
    .join(' ');
}

function bossBar(level: Level, progress: Progress): BossBar {
  const region = regionOf(level);
  const phases = levelsInRegion(level.region);
  const standing = phases.filter((phase) => !isDone(progress, phase.id)).length;
  return {
    name: region.character ?? '',
    role: region.role ?? '',
    portrait: `pj-${level.region}`,
    phase: phases.indexOf(level) + 1,
    phases: phases.length,
    phaseName: level.phase ?? '',
    hearts: Math.max(0, BOSS_HEARTS - (progress.failedAttempts[level.id] ?? 0)),
    life: `Vida del jefe: ${standing} de ${phases.length}`,
    bars: phases.map((phase) => ({
      id: phase.id,
      broken: isDone(progress, phase.id),
      current: phase === level,
    })),
  };
}

function theoryOf(level: Level, boss: BossBar | null): LessonChrome['theory'] {
  if (boss) {
    return {
      kind: 'boss',
      html: `<b>Combate final · fase ${boss.phase} de ${boss.phases}: ${level.phase}.</b> Sin teoría, pistas ni huellas. Reproduce el plano y pulsa <b>Entregar</b>. Cada entrega fallida, ${boss.name} te quita un corazón… y una estrella.`,
    };
  }
  if (level.exam) return { kind: 'exam', html: EXAM_INTRO };
  return { kind: 'lesson', html: level.theory ?? '' };
}

const GUIDES_LABEL: Record<Level['world'], string> = {
  isle: 'Ver líneas',
  grid: 'Ver líneas',
  flex: 'Ver ejes',
  sky: 'Ver guías',
  finale: 'Ver guías',
};

function kickerOf(level: Level): string {
  if (level.secret) return 'Lugar secreto';
  const region = regionOf(level).name;
  if (level.boss) return `${region} · Combate final`;
  return level.exam ? `${region} · Prueba de aprendizaje` : region;
}

/** The top bar: where the lesson sits on its world's trail. Secrets are off the trail. */
function headerOf(level: Level) {
  const route = routeOf(level);
  const index = route.indexOf(level);
  const onTrail = !level.secret;
  return {
    kicker: kickerOf(level),
    step: levelLabel(level.id),
    title: level.title,
    progressLabel: onTrail ? `${index + 1} / ${route.length}` : 'secreto',
    previousId: (onTrail && route[index - 1]?.id) || null,
    nextId: (onTrail && route[index + 1]?.id) || null,
  };
}

function boardOf(level: Level) {
  const isle = level.world === 'isle';
  const bySize = level.views.every((view) => /^\d/.test(view.name));
  return {
    guidesLabel: GUIDES_LABEL[level.world],
    notice:
      level.world === 'flex' ? 'El tablero aún no es flex' : 'El tablero aún no es una cuadrícula',
    timed: Boolean(level.timeLimit),
    views: level.views.length > 1 ? level.views.map((view) => view.name) : [],
    viewsLabel: bySize ? 'Tamaño del tablero' : 'Vista del tablero',
    state: level.state ? STATE_BUTTONS[level.state] : null,
    probes: isOpenBoard(level) || usesProbes(level),
    guides: !isle,
    peek: isle && !level.exam && !level.mirage,
    floor: level.terrain || regionOf(level).terrain,
    boardLabel: `${level.title}: tablero con ${level.movable.length} piezas`,
    pieceCount: level.movable.length,
  };
}

/** The scroll beside the board: who asks for what, and the theory. */
function scrollOf(level: Level, boss: BossBar | null) {
  const region = regionOf(level);
  return {
    boss,
    portrait: level.portrait || `pj-${level.region}`,
    speaker: `${level.character || region.character || ''}, ${level.role || region.role || ''}`,
    speech: level.speech ?? '',
    note: level.note ?? null,
    theory: theoryOf(level, boss),
    objectiveHtml: level.objective ?? '',
    markup: level.showMarkup ? boardMarkup(level) : null,
  };
}

function tabletOf(level: Level) {
  const declarations = level.rules
    .flatMap((rule) => rule.solution.split(';'))
    .filter((part) => part.trim());
  return {
    exam: Boolean(level.exam),
    hintHtml: level.hint ?? '',
    earlyHints: level.earlyHints ?? [],
    revealWhat: declarations.length > 1 ? 'la solución' : 'la declaración',
    runes: level.allowed,
  };
}

/**
 * @param solved the board matches (for an exam: the delivery passed)
 */
export function lessonChrome(level: Level, progress: Progress, solved: boolean): LessonChrome {
  const boss = level.boss ? bossBar(level, progress) : null;
  return {
    className: rootClass(level, solved),
    ...headerOf(level),
    ...boardOf(level),
    ...scrollOf(level, boss),
    ...tabletOf(level),
  };
}
