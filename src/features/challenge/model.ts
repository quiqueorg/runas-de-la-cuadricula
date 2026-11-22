/** Lesson chrome and editor shape. Measurement stays in the engine. */
import { isModernLevel, levelLabel, levelsInRegion, regionOf, routeOf } from '../../core/catalog';
import type { Level } from '../../core/models';
import { progress } from '../../core/state';
import type { ChallengeClock } from './engine';
import { boardMarkup } from './Pieces';

/** Lessons that compare styles or states are measured on hidden copies of the board. */
export const usesProbes = (level: Level): boolean => !!(level.estado || level.cmp?.length);

export interface EditorRule {
  readonly index: number;
  readonly selector: string;
  /** The student writes the selector of this rule. */
  readonly ownSelector: boolean;
  readonly fixed: string | null;
  readonly editable: boolean;
}

export type EditorRow =
  | { readonly kind: 'rule' } & EditorRule
  | { readonly kind: 'media'; readonly id: number; readonly fixed: boolean; readonly condition: string; readonly rules: readonly EditorRule[] };

interface MediaDraft {
  id: number;
  fixed: boolean;
  condition: string;
  rules: EditorRule[];
}

export function editorRows(level: Level): readonly EditorRow[] {
  const rows: EditorRow[] = [];
  let draft: MediaDraft | null = null;
  const flush = () => {
    if (!draft) return;
    rows.push({ kind: 'media', id: draft.id, fixed: draft.fixed, condition: draft.condition, rules: draft.rules });
    draft = null;
  };
  level.b.forEach((rule, index) => {
    if (rule.oculto) return;
    const item: EditorRule = { index, selector: rule.s, ownSelector: rule.sel !== undefined, fixed: rule.f || null, editable: !!rule.ed };
    if (rule.g < 0) {
      flush();
      rows.push({ kind: 'rule', ...item });
      return;
    }
    if (!draft || draft.id !== rule.g) {
      flush();
      const group = level.mg[rule.g];
      draft = { id: rule.g, fixed: !!group?.fijo, condition: group?.sol ?? '', rules: [] };
    }
    draft.rules.push(item);
  });
  flush();
  return rows;
}

export interface BossBar {
  readonly name: string;
  readonly role: string;
  readonly portrait: string;
  readonly phase: number;
  readonly phases: number;
  readonly phaseName: string;
  readonly hearts: number;
  readonly life: string;
  readonly bars: readonly { id: string; broken: boolean; current: boolean }[];
}

export interface LessonChrome {
  readonly className: string;
  readonly blow: '' | 'golpe-heroe' | 'golpe-jefe';
  readonly kicker: string;
  readonly step: string;
  readonly title: string;
  readonly progressLabel: string;
  readonly previousId: string | null;
  readonly nextId: string | null;
  readonly secret: boolean;
  readonly lineLabel: string;
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
  readonly runes: readonly string[];
  readonly timed: boolean;
  readonly views: readonly string[];
  readonly viewsLabel: string;
  readonly state: { readonly icon: string; readonly pressed: string; readonly idle: string } | null;
  readonly sky: boolean;
  readonly flex: boolean;
  /** Hidden copies of the board measured without transitions. */
  readonly probes: boolean;
  /** The lesson has drawable guides (grid lines or flex axes). */
  readonly guides: boolean;
  /** The goal can be looked at on the board itself. */
  readonly peek: boolean;
  readonly markup: string | null;
  readonly floor: string;
  readonly boardLabel: string;
  readonly pieceCount: number;
}

export function lessonChrome(level: Level, solved: boolean, hit: '' | 'golpe-heroe' | 'golpe-jefe', deliveryWon: boolean): LessonChrome {
  const route = routeOf(level);
  const index = route.indexOf(level);
  const region = regionOf(level);
  const phases = level.jefe ? levelsInRegion(level.r) : [];
  const bossLeft = phases.filter((item) => !progress.hechos[item.id]).length;
  const hearts = Math.max(0, 3 - (progress.intentos[level.id] || 0));
  const base = level.mundo === 'base';
  const sky = isModernLevel(level) && !base;
  const flex = level.mundo === 'flex';
  const previous = route[index - 1];
  const next = route[index + 1];
  return {
    className: ['view', flex ? 'is-flex' : '', sky ? 'is-sky' : '', base ? 'is-base' : '', level.mundo === 'final' ? 'is-final' : '', level.dim ? 'dim' : '', level.jefe ? 'boss' : '', level.examen ? 'exam' : '', level.espejismo ? 'mirage' : '', level.clase ?? '', solved || deliveryWon ? 'solved' : ''].filter(Boolean).join(' '),
    blow: hit,
    kicker: level.secreto ? 'Lugar secreto' : `${region.n}${level.jefe ? ' · Combate final' : level.examen ? ' · Prueba de aprendizaje' : ''}`,
    step: levelLabel(level.id),
    title: level.n,
    progressLabel: level.secreto ? 'secreto' : `${index + 1} / ${route.length}`,
    previousId: level.secreto || index <= 0 || !previous ? null : previous.id,
    nextId: level.secreto || index >= route.length - 1 || !next ? null : next.id,
    secret: !!level.secreto,
    lineLabel: flex ? 'Ver ejes' : sky ? 'Ver guías' : 'Ver líneas',
    notice: flex ? 'El tablero aún no es flex' : 'El tablero aún no es una cuadrícula',
    boss: level.jefe ? {
      name: region.pj ?? '',
      role: region.rol ?? '',
      portrait: `pj-${level.r}`,
      phase: phases.indexOf(level) + 1,
      phases: phases.length,
      phaseName: level.fase ?? '',
      hearts,
      life: `Vida del jefe: ${bossLeft} de ${phases.length}`,
      bars: phases.map((phase) => ({ id: phase.id, broken: !!progress.hechos[phase.id], current: phase === level })),
    } : null,
    portrait: level.av || `pj-${level.r}`,
    speaker: `${level.pj || region.pj || ''}, ${level.rol || region.rol || ''}`,
    speech: level.enc ?? '',
    note: level.nota ?? null,
    theory: level.jefe
      ? { kind: 'boss', html: `<b>Combate final · fase ${phases.indexOf(level) + 1} de ${phases.length}: ${level.fase}.</b> Sin teoría, pistas ni huellas. Reproduce el plano y pulsa <b>Entregar</b>. Cada entrega fallida, ${region.pj} te quita un corazón… y una estrella.` }
      : level.examen
        ? { kind: 'exam', html: '<b>Prueba de aprendizaje:</b> sin teoría, pistas ni huellas. Reproduce el plano y pulsa <b>Entregar</b>; a la primera, tres estrellas.' }
        : { kind: 'lesson', html: level.teo ?? '' },
    objectiveHtml: level.obj ?? '',
    exam: !!level.examen,
    hintHtml: level.pista ?? '',
    runes: level.ok,
    timed: !!level.tiempo,
    views: level.vistas.length > 1 ? level.vistas.map((view) => view.n) : [],
    viewsLabel: level.vistas.every((view) => /^\d/.test(view.n)) ? 'Tamaño del tablero' : 'Vista del tablero',
    state: level.estado ? STATE_BUTTONS[level.estado] : null,
    sky,
    flex,
    probes: isModernLevel(level) || usesProbes(level),
    guides: !base,
    peek: base && !level.examen && !level.espejismo,
    markup: level.html ? boardMarkup(level) : null,
    floor: level.t || region.t,
    boardLabel: `${level.n}: tablero con ${level.movibles.length} piezas`,
    pieceCount: level.movibles.length,
  };
}

const STATE_BUTTONS: Record<NonNullable<Level['estado']>, { readonly icon: string; readonly pressed: string; readonly idle: string }> = {
  activo: { icon: 'i-rayo', pressed: 'Volver al reposo', idle: 'Activar' },
  hover: { icon: 'i-cursor', pressed: 'Quitar el cursor', idle: 'Pasar el cursor' },
  pulsa: { icon: 'i-cursor', pressed: 'Soltar', idle: 'Mantener pulsado' },
  foco: { icon: 'i-cursor', pressed: 'Quitar el foco', idle: 'Dar el foco' },
};

export function beginClock(clock: ChallengeClock): ChallengeClock {
  return { ...clock, estado: 'corre' };
}

export function advanceClock(clock: ChallengeClock): { clock: ChallengeClock; expired: boolean } {
  if (clock.resta <= 1) return { clock: { ...clock, resta: 0, estado: 'expired', agotado: true, id: 0 }, expired: true };
  return { clock: { ...clock, resta: clock.resta - 1 }, expired: false };
}

export function restartClock(clock: ChallengeClock, time: number): ChallengeClock {
  return { estado: 'corre', resta: time, id: 0, agotado: clock.agotado };
}

export interface CodeToken {
  readonly text: string;
  readonly kind: 'plain' | 'com' | 'cad' | 'nom' | 'prop' | 'var' | 'sealed' | 'num' | 'pun';
}

/** Colour the tablet the way the old highlighter did. Presentation only. */
export function highlightTokens(txt: string, fixed: boolean, allowed: readonly string[]): CodeToken[] {
  const re = /(\/\*[\s\S]*?(?:\*\/|$))|("[^"\n]*"?|'[^'\n]*'?)|(\[[^\]\n]*\]?)|(-{0,2}[a-zA-Z][\w-]*)(\s*:)|(--[a-zA-Z][\w-]*)|(-?\d*\.?\d+(?:px|fr|%|em|rem|vh|vw|deg|ms|s)?)|([;:/{}(),<>=*])/g;
  const tokens: CodeToken[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  const push = (text: string, kind: CodeToken['kind']) => { if (text) tokens.push({ text, kind }); };
  while ((match = re.exec(txt))) {
    push(txt.slice(last, match.index), 'plain');
    if (match[1]) push(match[1], 'com');
    else if (match[2]) push(match[2], 'cad');
    else if (match[3]) push(match[3], 'nom');
    else if (match[4]) {
      const prop = match[4].startsWith('--') ? match[4] : match[4].toLowerCase();
      const ok = fixed || allowed.includes(prop) || (prop.startsWith('--') && allowed.includes('--*'));
      push(match[4], prop.startsWith('--') ? 'var' : ok ? 'prop' : 'sealed');
      push(match[5] ?? '', 'pun');
    } else if (match[6]) push(match[6], 'var');
    else if (match[7]) push(match[7], 'num');
    else push(match[8] ?? '', 'pun');
    last = re.lastIndex;
  }
  push(txt.slice(last), 'plain');
  return tokens;
}

const BARE_WORDS = new Set(['width', 'height', 'screen', 'print', 'all', 'and', 'or', 'not', '<', '<=', '>', '>=']);

export function runeSnippet(prop: string, media: boolean): { text: string; rewind: number } {
  if (!media) return { text: `${prop}: ;`, rewind: 1 };
  if (prop === 'width' || prop === 'height') return { text: prop, rewind: 0 };
  if (BARE_WORDS.has(prop)) return { text: ` ${prop} `, rewind: 0 };
  return { text: `(${prop}: )`, rewind: 1 };
}
