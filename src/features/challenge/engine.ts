/** Board measurement, rune checking and the guide geometry. The DOM is only read, never filled with HTML. */
import { CSS_PROPS, EXERCISE_COUNTS, canvasGutter, exerciseProgress, finaleUnlocked, isModernLevel, levelsInRegion, levelsInWorld, regionStats, regions, routeOf, secretsInWorld } from '../../core/catalog';
import type { BoardView, Level, RuntimePiece } from '../../core/models';
import { progress, saveProgress } from '../../core/state';
import { music, sound } from '../../shared/audio/audio';

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character] ?? character));
}

export interface MediaConversion {
  readonly vacia?: true;
  readonly err?: string;
  readonly cq?: string;
}

interface TransitionSpec {
  readonly d: number;
  readonly dl: number;
  readonly f: string;
}

type TransitionMap = Map<string, TransitionSpec>;

export type ParsedDeclaration =
  | { readonly err: true; readonly raw: string }
  | { readonly prop: string; readonly val: string };

export type ClockState = 'parado' | 'espera' | 'corre' | 'expired' | 'won';

export interface ChallengeClock {
  estado: ClockState;
  resta: number;
  id: number;
  agotado: boolean;
}

export type { CodeToken } from './model';

export interface StatusLine {
  readonly tone: 'error' | 'aviso' | 'bien';
  readonly icon: string;
  readonly html: string;
}

export interface RuleLine {
  readonly html: string;
  readonly ok: boolean;
  readonly limit: boolean;
  readonly coins: number | null;
  readonly spent: number;
}

export interface ExamSnapshot {
  readonly resuelta: boolean;
  readonly enSitio: number;
  readonly total: number;
  readonly fallos: readonly number[];
  readonly vistasFallidas: readonly string[];
  readonly limpio: boolean;
  readonly reglasOk: boolean;
}

export type GuideKind = 'shadow' | 'main' | 'shadow-implicit' | 'implicit' | 'axis-main' | 'axis-cross';
export type LabelKind = 'normal' | 'implicit' | 'negative' | 'axis-main' | 'axis-cross';

export interface GuideLine {
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  readonly kind: GuideKind;
}

export interface GuideLabel {
  readonly x: number;
  readonly y: number;
  readonly text: string;
  readonly kind: LabelKind;
  readonly rotate: boolean;
}

export interface GuideGap {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

export interface GuideDrawing {
  readonly width: number;
  readonly height: number;
  readonly gaps: readonly GuideGap[];
  readonly lines: readonly GuideLine[];
  readonly labels: readonly GuideLabel[];
}

export interface BoardRoots {
  readonly player: HTMLElement;
  readonly target: HTMLElement;
  readonly outline: HTMLElement;
  readonly probe: HTMLElement;
  readonly probeTarget: HTMLElement;
  readonly canvas: HTMLElement;
  readonly floor: HTMLElement;
  readonly sand: HTMLElement;
}

export interface Evaluation {
  readonly playerCss: string;
  readonly objectiveCss: string;
  readonly matches: readonly boolean[];
  readonly widthOk: readonly boolean[];
  readonly placed: number;
  readonly movable: number;
  readonly rules: readonly RuleLine[];
  readonly messages: readonly StatusLine[];
  readonly solved: boolean;
  readonly showNotice: boolean;
  readonly legend: 'flex' | 'grid' | 'none';
  readonly guides: GuideDrawing | null;
  readonly exam: ExamSnapshot | null;
  readonly victory: VictoryModel | null;
  readonly arena: number;
  readonly clockClass: '' | 'urgent' | 'expired' | 'won';
  readonly clockLabel: string;
}

export interface VictoryModel {
  readonly practice?: Level['practica'];
  readonly title: string;
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

export interface LiveChallenge {
  vista: number;
  stageScale: number;
  usedHelp: boolean;
  celebrated: boolean;
  shown: boolean;
  previousMatches: boolean[];
  boardActive: boolean;
  exam: ExamSnapshot | null;
  delivery: StatusLine | null;
  clock: ChallengeClock;
}

export const CONDITION_TOKENS = new Set([
  'min-width', 'max-width', 'width', 'min-height', 'max-height', 'height', 'orientation', 'aspect-ratio', 'min-aspect-ratio', 'max-aspect-ratio',
  'hover', 'pointer', 'prefers-color-scheme', 'prefers-reduced-motion', 'screen', 'print', 'all', 'and', 'or', 'not', '<', '<=', '>', '>=',
]);
const SIZE_FEATURES = new Set(['width', 'min-width', 'max-width', 'height', 'min-height', 'max-height', 'aspect-ratio', 'min-aspect-ratio', 'max-aspect-ratio', 'orientation']);
const DEVICE_FEATURES = new Set(['hover', 'any-hover', 'pointer', 'any-pointer', 'prefers-color-scheme', 'prefers-reduced-motion']);
const MEDIA_TYPES = new Set(['all', 'screen', 'print', 'speech']);
// The board is the window, so a media query becomes a container query. What the board cannot
// measure (the medium, the pointer, the user's preferences) is answered here and written as a size test.
const ALWAYS = '(width >= 0px)';
const NEVER = '(width < 0px)';
const cacheMedia = new Map<string, MediaConversion>();
const BEZ: Record<string, readonly number[]> = {
  ease: [0.25, 0.1, 0.25, 1],
  'ease-in': [0.42, 0, 1, 1],
  'ease-out': [0, 0, 0.58, 1],
  'ease-in-out': [0.42, 0, 0.58, 1],
  linear: [0, 0, 1, 1],
};
const COMPARE_LABELS: Record<string, string> = {
  'background-color': 'el color de fondo', opacity: 'la transparencia', transform: 'la transformación', color: 'el color del texto',
  'border-top-width': 'el grosor del borde', 'border-top-style': 'el estilo del borde', 'border-top-color': 'el color del borde',
  'border-bottom-width': 'el grosor del borde de abajo', 'border-bottom-style': 'el estilo del borde de abajo', 'border-bottom-color': 'el color del borde de abajo',
  'border-left-width': 'el grosor del borde izquierdo', 'border-left-style': 'el estilo del borde izquierdo', 'border-left-color': 'el color del borde izquierdo',
  'border-top-left-radius': 'el redondeo de las esquinas', 'background-image': 'la imagen de fondo', 'background-repeat': 'la repetición del fondo',
  'background-position': 'la posición del fondo', 'background-size': 'el tamaño del fondo', 'font-family': 'la familia de letra', 'font-size': 'el tamaño de letra',
  'font-weight': 'el grosor de la letra', 'font-style': 'el estilo de la letra', 'text-align': 'la alineación del texto', 'text-decoration-line': 'el subrayado',
  'text-transform': 'las mayúsculas', 'line-height': 'el interlineado', 'letter-spacing': 'el espaciado entre letras', 'box-shadow': 'la sombra',
  'list-style-type': 'la viñeta de la lista', 'z-index': 'la capa', position: 'el tipo de posición', float: 'la flotación', display: 'el tipo de caja',
};
const TAUNTS = ['¡JA! ¿Eso es todo lo que sabes?', '¡Mis vientos se ríen de tus runas!', '¡Fallaste! El cielo es mío.', '¡Otra vez! ¡Me encanta verte fallar!', '¡Tu plano se lo lleva el huracán!'];

export function freshLive(level: Level): LiveChallenge {
  return {
    vista: 0,
    stageScale: 1,
    usedHelp: false,
    celebrated: false,
    shown: false,
    previousMatches: [],
    boardActive: false,
    exam: null,
    delivery: null,
    clock: { estado: level.tiempo ? 'espera' : 'parado', resta: level.tiempo ?? 0, id: 0, agotado: false },
  };
}

export function stripComments(t: string): string {
  return t.replace(/\/\*[\s\S]*?(\*\/|$)/g, ' ');
}

const deviceKey = (view: BoardView): string => `${view.medio}|${view.esquema}|${view.puntero}|${view.calma ? 1 : 0}`;

export function convertMedia(txt: string, view: BoardView): MediaConversion {
  const key = `${deviceKey(view)}|${String(txt || '')}`;
  const hit = cacheMedia.get(key);
  if (hit) return hit;
  const result = convertMediaCore(String(txt || ''), view);
  if (cacheMedia.size > 600) cacheMedia.clear();
  cacheMedia.set(key, result);
  return result;
}

function deviceAnswers(feature: string, value: string | undefined, view: BoardView): boolean {
  if (feature === 'hover' || feature === 'any-hover') return value === 'none' ? view.puntero === 'coarse' : view.puntero === 'fine';
  if (feature === 'pointer' || feature === 'any-pointer') return value === undefined ? true : value === view.puntero;
  if (feature === 'prefers-color-scheme') return value === undefined ? true : value === view.esquema;
  return value === 'no-preference' ? !view.calma : view.calma;
}

function convertMediaCore(txt: string, view: BoardView): MediaConversion {
  let t = stripComments(txt).replace(/\s+/g, ' ').trim();
  if (!t) return { vacia: true };
  t = t.replace(/^@media\s*/i, '').replace(/\s*\{.*$/, '').trim();
  if (!t) return { err: 'Falta la condición entre paréntesis, por ejemplo <code>(max-width: 400px)</code>.' };
  let mq = 'not all';
  try {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(`@media ${t} {}`);
    const rule = sheet.cssRules[0];
    mq = rule instanceof CSSMediaRule ? rule.media.mediaText : 'not all';
  } catch {
    mq = 'not all';
  }
  const invalid = { err: `«${escapeHtml(t.slice(0, 50))}» no es una condición válida. Revisa los paréntesis, los dos puntos y las unidades.` };
  const parts: string[] = [];
  for (const piece of t.split(/,(?![^(]*\))/)) {
    let rest = piece.trim();
    let typed: boolean | null = null;
    let negated = false;
    if (!rest.startsWith('(') && !/^not\s*\(/i.test(rest)) {
      const lead = /^(?:(not|only)\s+)?([a-z-]+)\b\s*(.*)$/i.exec(rest);
      const type = lead?.[2]?.toLowerCase() ?? '';
      if (!lead || !MEDIA_TYPES.has(type)) {
        return { err: SIZE_FEATURES.has(type) || DEVICE_FEATURES.has(type)
          ? `La condición va entre paréntesis: <code>(${escapeHtml(rest.slice(0, 40))})</code>.`
          : `«${escapeHtml((type || rest).slice(0, 30))}» no es un tipo de medio. Los que se usan son <code>screen</code>, <code>print</code> y <code>all</code>.` };
      }
      negated = lead[1]?.toLowerCase() === 'not';
      typed = type === 'all' || type === view.medio;
      rest = (lead[3] ?? '').trim();
      if (rest) {
        if (!/^and\s/i.test(rest)) return { err: 'Después del tipo de medio, las condiciones se unen con <code>and</code>: <code>screen and (min-width: 500px)</code>.' };
        rest = rest.replace(/^and\s+/i, '');
      }
    }
    if (!mq || mq === 'not all') return invalid;
    const features = [...rest.matchAll(/\(\s*([a-z-]+)\s*[:<>=)]|[<>=]\s*([a-z-]+)\s*[<>=)]/gi)].map((match) => (match[1] ?? match[2] ?? '').toLowerCase());
    const odd = features.find((name) => !SIZE_FEATURES.has(name) && !DEVICE_FEATURES.has(name));
    if (odd) return { err: `Aquí el tablero hace de pantalla, y <code>${escapeHtml(odd)}</code> no es algo que sepa responder.` };
    const sized = rest.replace(/\(\s*([a-z-]+)\s*(?::\s*([a-z-]+)\s*)?\)/gi, (whole: string, name: string, value: string | undefined) => {
      const feature = name.toLowerCase();
      return DEVICE_FEATURES.has(feature) ? (deviceAnswers(feature, value?.toLowerCase(), view) ? ALWAYS : NEVER) : whole;
    });
    if (typed === null) { parts.push(sized); continue; }
    const medium = typed ? ALWAYS : NEVER;
    const query = sized ? `${medium} and ${/\sor\s/i.test(sized) ? `(${sized})` : sized}` : medium;
    parts.push(negated ? `not (${query})` : query);
  }
  if (!mq || mq === 'not all') return invalid;
  const cq = parts.length > 1 ? parts.map((part) => `(${part})`).join(' or ') : parts[0] ?? '';
  try {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(`@container ${cq} {}`);
    if (!sheet.cssRules.length) throw new Error('vacía');
  } catch {
    return { err: `No he sabido interpretar «${escapeHtml(t.slice(0, 50))}».` };
  }
  return { cq };
}

const splitList = (value: string) => String(value).split(/,(?![^(]*\))/).map((part) => part.trim());

/**
 * Keeps a lesson selector inside its layer. `:root` is the board (the element everything hangs from,
 * and one a container query can still reach), an id is matched through `data-id` (the same piece is
 * drawn in several layers) and the states can be switched on by a class.
 */
function scopeSelector(layer: string, selector: string): string {
  const live = layer === '#player-layer';
  const state = (name: string) => (live ? `:is(:${name},.sim-${name})` : `.sim-${name}`);
  return splitList(selector).map((part) => {
    const text = part
      .replace(/#([a-zA-Z_][\w-]*)/g, ':is(#$1,[data-id="$1"])')
      .replace(/:hover\b/g, state('hover'))
      .replace(/:active\b/g, state('active'))
      .replace(/:focus\b(?!-)/g, state('focus'));
    return text.startsWith(':root') ? `${layer} .tablero${text.slice(5)}` : `${layer} ${text}`;
  }).join(',');
}

export function validateSelector(text: string): string | null {
  const selector = stripComments(text).trim();
  if (!selector) return null;
  if (/[{};@]/.test(selector)) return 'El selector no lleva llaves ni punto y coma: solo dice <b>a quién</b> se aplica la regla.';
  try {
    document.createDocumentFragment().querySelector(selector);
  } catch {
    return `«${escapeHtml(selector.slice(0, 50))}» no es un selector válido.`;
  }
  return null;
}

export function layerCss(level: Level, layers: readonly string[], bodies: readonly string[], conditions: readonly (string | null | undefined)[], selectors?: readonly (string | null)[]): string {
  return level.b.map((rule, index) => {
    const selector = selectors && rule.sel !== undefined ? selectors[index] : rule.s;
    if (!selector) return '';
    const block = `${layers.map((layer) => scopeSelector(layer, selector)).join(',')}{${rule.f}\n${bodies[index] ?? ''}}`;
    if (rule.g < 0) return block;
    const condition = conditions[rule.g];
    return condition ? `@container ${condition}{${block}}` : '';
  }).join('\n');
}

function boardOf(root: ParentNode): HTMLElement | null {
  return root.querySelector('.tablero');
}

const SIMULATED = ['sim-hover', 'sim-active', 'sim-focus'] as const;

export function setBoardState(roots: readonly ParentNode[], on: boolean): void {
  for (const root of roots) {
    const board = boardOf(root);
    if (!board) continue;
    board.classList.toggle('activo', on);
    for (const name of SIMULATED) {
      board.classList.toggle(name, on);
      root.querySelectorAll('.pieza').forEach((piece) => piece.classList.toggle(name, on));
    }
  }
}

export function activeView(level: Level, live: LiveChallenge): BoardView {
  const view = level.vistas[live.vista] ?? level.vistas[0];
  if (!view) throw new Error(`Level without views: ${level.id}`);
  return view;
}

export function placeBoard(roots: BoardRoots, level: Level, view: BoardView): void {
  const maxW = Math.max(...level.anchos);
  const x = canvasGutter + (maxW - view.w) / 2;
  const layers = [...roots.canvas.querySelectorAll<HTMLElement>('.board-layer')];
  for (const el of [roots.floor, roots.sand, ...layers]) {
    el.style.left = `${x}px`;
    el.style.top = `${canvasGutter}px`;
    el.style.width = `${view.w}px`;
    el.style.height = `${view.h}px`;
  }
  roots.canvas.dataset.medio = view.medio;
  roots.canvas.dataset.esquema = view.esquema;
}

function normalizeCurve(f: string): string {
  f = String(f).replace(/\s+/g, '').toLowerCase();
  const known = BEZ[f];
  if (known) return known.join(',');
  let match = f.match(/^cubic-bezier\((.*)\)$/);
  if (match?.[1]) return match[1].split(',').map((n) => +(+n).toFixed(3)).join(',');
  if (f === 'step-start') return 'steps(1,start)';
  if (f === 'step-end') return 'steps(1,end)';
  match = f.match(/^steps\((\d+)(?:,(.*))?\)$/);
  if (match) {
    const aliases: Record<string, string> = { 'jump-start': 'start', 'jump-end': 'end' };
    const position = aliases[match[2] || 'end'] || match[2] || 'end';
    return `steps(${match[1]},${position})`;
  }
  return f;
}

function readTransitions(el: Element, shadows: boolean): TransitionMap {
  const style = getComputedStyle(el);
  const props = splitList(style.transitionProperty);
  const durations = splitList(style.transitionDuration).map(parseFloat);
  const delays = splitList(style.transitionDelay).map(parseFloat);
  const curves = splitList(style.transitionTimingFunction);
  const map: TransitionMap = new Map();
  props.forEach((prop, index) => {
    if (prop === 'none' || prop === 'filter' || (prop === 'box-shadow' && !shadows)) return;
    const duration = durations[index % durations.length] || 0;
    const delay = delays[index % delays.length] || 0;
    map.delete(prop);
    if (duration > 0 || delay > 0) map.set(prop, { d: duration, dl: delay, f: normalizeCurve(curves[index % curves.length] || '') });
  });
  return map;
}

const seconds = (n: number) => `${+n.toFixed(3)}s`;

function diffTransition(name: string, player: TransitionMap, target: TransitionMap): string | null {
  for (const [prop, expected] of target) {
    const actual = player.get(prop) || player.get('all');
    if (!actual) return `${name} cambia de golpe: a <code>${prop}</code> le falta una transición.`;
    if (Math.abs(actual.d - expected.d) > 0.001) return `${name}: <code>${prop}</code> dura ${seconds(actual.d)} y debería durar ${seconds(expected.d)}.`;
    if (Math.abs(actual.dl - expected.dl) > 0.001) return `${name}: <code>${prop}</code> espera ${seconds(actual.dl)} antes de empezar y debería esperar ${seconds(expected.dl)}.`;
    if (actual.f !== expected.f) return `${name}: <code>${prop}</code> no lleva el ritmo pedido (revisa la función de tiempo).`;
  }
  for (const [prop] of player) {
    if (!target.has(prop)) return prop === 'all' ? `${name} anima todas sus propiedades (<code>all</code>); aquí solo deben animarse las del objetivo.` : `${name} también anima <code>${prop}</code>, y eso debería cambiar de golpe.`;
  }
  return null;
}

/** A font list means the same with or without quotes, in any case. */
const comparable = (prop: string, value: string): string => (prop === 'font-family' ? value.toLowerCase().replace(/["']/g, '').replace(/\s*,\s*/g, ',').trim() : value);

const pieceName = (piece: RuntimePiece) => `«${piece.id ? `#${piece.id}` : piece.e || piece.k || piece.t}»`;

function measureProbes(level: Level, roots: BoardRoots, scale: number): { oks: boolean[]; msgs: string[]; tableroMal: boolean } {
  const player = roots.probe;
  const target = roots.probeTarget;
  const playerBoard = boardOf(player);
  const targetBoard = boardOf(target);
  const playerPieces = [...player.querySelectorAll<HTMLElement>('.pieza')];
  const targetPieces = [...target.querySelectorAll<HTMLElement>('.pieza')];
  if (!playerBoard || !targetBoard) return { oks: level.p.map(() => false), msgs: [], tableroMal: false };
  const oks = level.p.map(() => true);
  const msgs: string[] = [];
  let tableroMal = false;
  const tol = 1.5 * scale;
  const note = (message: string | null) => { if (message && !msgs.includes(message)) msgs.push(message); };
  const shadows = !!level.cmp?.includes('box-shadow');
  for (const on of level.estado ? [false, true] : [false]) {
    player.classList.add('sin-trans');
    target.classList.add('sin-trans');
    setBoardState([player, target], on);
    const playerBox = playerBoard.getBoundingClientRect();
    const targetBox = targetBoard.getBoundingClientRect();
    playerPieces.forEach((piece, index) => {
      const other = targetPieces[index];
      const spec = level.p[index];
      if (!other || !spec) return;
      const a = piece.getBoundingClientRect();
      const b = other.getBoundingClientRect();
      const placed = Math.abs(a.left - playerBox.left - (b.left - targetBox.left)) <= tol
        && Math.abs(a.top - playerBox.top - (b.top - targetBox.top)) <= tol
        && Math.abs(a.width - b.width) <= tol
        && Math.abs(a.height - b.height) <= tol;
      if (!placed) oks[index] = false;
      for (const prop of level.cmp || []) {
        if (comparable(prop, getComputedStyle(piece).getPropertyValue(prop)) !== comparable(prop, getComputedStyle(other).getPropertyValue(prop))) {
          oks[index] = false;
          note(`${pieceName(spec)}: ${COMPARE_LABELS[prop] || `<code>${prop}</code>`} no coincide con el objetivo${on ? ' al activar' : ''}.`);
        }
      }
    });
    if (level.estado) {
      player.classList.remove('sin-trans');
      target.classList.remove('sin-trans');
      const boardDiff = diffTransition('El tablero', readTransitions(playerBoard, shadows), readTransitions(targetBoard, shadows));
      if (boardDiff) { tableroMal = true; note(boardDiff); }
      playerPieces.forEach((piece, index) => {
        const other = targetPieces[index];
        const spec = level.p[index];
        if (!other || !spec) return;
        const diff = diffTransition(pieceName(spec), readTransitions(piece, shadows), readTransitions(other, shadows));
        if (diff) { oks[index] = false; note(diff); }
      });
    }
  }
  player.classList.add('sin-trans');
  target.classList.add('sin-trans');
  setBoardState([player, target], false);
  void playerBoard.offsetWidth;
  void targetBoard.offsetWidth;
  player.classList.remove('sin-trans');
  target.classList.remove('sin-trans');
  return { oks, msgs, tableroMal };
}

function measureBoard(roots: BoardRoots, scale: number): boolean[] {
  const playerPieces = [...roots.player.querySelectorAll<HTMLElement>('.pieza')];
  const targetPieces = [...roots.target.querySelectorAll<HTMLElement>('.pieza')];
  const playerBoard = boardOf(roots.player)?.getBoundingClientRect();
  const targetBoard = boardOf(roots.target)?.getBoundingClientRect();
  const tol = 1.5 * scale;
  if (!playerBoard || !targetBoard) return playerPieces.map(() => false);
  return playerPieces.map((piece, index) => {
    const other = targetPieces[index];
    if (!other) return false;
    const a = piece.getBoundingClientRect();
    const b = other.getBoundingClientRect();
    return Math.abs(a.left - playerBoard.left - (b.left - targetBoard.left)) <= tol
      && Math.abs(a.top - playerBoard.top - (b.top - targetBoard.top)) <= tol
      && Math.abs(a.width - b.width) <= tol
      && Math.abs(a.height - b.height) <= tol;
  });
}

export { highlightTokens } from './model';
import { usesProbes } from './model';

export function parseDeclaration(txt: string): ParsedDeclaration[] {
  const declarations: ParsedDeclaration[] = [];
  for (const part of stripComments(txt).split(';')) {
    const text = part.trim();
    if (!text) continue;
    const colon = text.indexOf(':');
    if (colon < 0) declarations.push({ err: true, raw: text });
    else {
      const rawProp = text.slice(0, colon).trim();
      declarations.push({ prop: rawProp.startsWith('--') ? rawProp : rawProp.toLowerCase(), val: text.slice(colon + 1).trim().replace(/[{}<>]/g, '') });
    }
  }
  return declarations;
}

function editDistance(a: string, b: string): number {
  const rows = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  const first = rows[0];
  if (first) for (let j = 1; j <= b.length; j++) first[j] = j;
  for (let i = 1; i <= a.length; i++) {
    const row = rows[i];
    const previous = rows[i - 1];
    if (!row || !previous) continue;
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min((previous[j] ?? 0) + 1, (row[j - 1] ?? 0) + 1, (previous[j - 1] ?? 0) + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return rows[a.length]?.[b.length] ?? 0;
}

function closestProperty(prop: string, list: readonly string[]): string | null {
  let best: string | null = null;
  let distance = 4;
  for (const candidate of list) {
    const next = editDistance(prop, candidate);
    if (next < distance) { distance = next; best = candidate; }
  }
  return best;
}

const supportsValue = (prop: string, value: string) => { try { return CSS.supports(prop, value); } catch { return false; } };

export function validateDeclaration(declaration: ParsedDeclaration, level: Level): string | { sellada: string } | null {
  if ('err' in declaration) return `Falta <code>:</code> en «${escapeHtml(declaration.raw.slice(0, 40))}».`;
  if (declaration.prop.startsWith('--')) {
    if (!/^--[a-zA-Z_][\w-]*$/.test(declaration.prop)) return `«${escapeHtml(declaration.prop)}» no es un nombre de variable válido.`;
    if (!level.ok.includes(declaration.prop) && !level.ok.includes('--*')) {
      const suggestion = closestProperty(declaration.prop, level.ok.filter((name) => name.startsWith('--')));
      return suggestion ? `En este ejercicio no se usa <code>${escapeHtml(declaration.prop)}</code>. ¿Querías decir <code>${suggestion}</code>? (Mayúsculas y minúsculas cuentan.)` : { sellada: declaration.prop };
    }
    if (!declaration.val) return `<code>${escapeHtml(declaration.prop)}</code> necesita un valor.`;
    return null;
  }
  if (!/^-?[a-z][a-z-]*$/.test(declaration.prop)) return `«${escapeHtml(declaration.prop)}» no es un nombre de propiedad válido.`;
  if (!supportsValue(declaration.prop, 'inherit')) {
    const suggestion = closestProperty(declaration.prop, [...level.ok, ...CSS_PROPS]);
    return `«${escapeHtml(declaration.prop)}» no es una propiedad CSS.${suggestion ? ` ¿Querías decir <code>${suggestion}</code>?` : ''}`;
  }
  if (!level.ok.includes(declaration.prop)) return { sellada: declaration.prop };
  if (!declaration.val) return `<code>${declaration.prop}</code> necesita un valor.`;
  if (!supportsValue(declaration.prop, declaration.val)) return `«${escapeHtml(declaration.val.slice(0, 60))}» no es un valor válido para <code>${declaration.prop}</code>.${/:/.test(declaration.val) ? ' ¿Falta un punto y coma?' : ''}`;
  return null;
}

const tracks = (value: string): number[] => (!value || value === 'none') ? [] : value.replace(/\[[^\]]*\]/g, ' ').trim().split(/\s+/).map(parseFloat).filter((n) => !Number.isNaN(n));

function axisTicks(sizes: number[], gap: number, start: number, free: number, mode: string): number[][] {
  const count = sizes.length;
  let offset = 0;
  let extra = 0;
  mode = String(mode || '').replace('safe ', '').replace('unsafe ', '');
  if (count) {
    if (mode === 'center') offset = free / 2;
    else if (mode === 'end' || mode === 'flex-end' || mode === 'right') offset = free;
    else if (free > 0 && mode === 'space-between' && count > 1) extra = free / (count - 1);
    else if (free > 0 && mode === 'space-around') { extra = free / count; offset = extra / 2; }
    else if (free > 0 && mode === 'space-evenly') { extra = free / (count + 1); offset = extra; }
  }
  const out: number[][] = [];
  let x = start + offset;
  out.push([x, x]);
  for (let i = 0; i < count; i++) {
    x += sizes[i] ?? 0;
    const edge = x;
    if (i < count - 1) x += gap + extra;
    out.push([edge, i < count - 1 ? x : edge]);
  }
  return out;
}

function buildGuides(level: Level, roots: BoardRoots, view: BoardView, linesOn: boolean): { drawing: GuideDrawing | null; legend: 'flex' | 'grid' | 'none'; showNotice: boolean } {
  const maxW = Math.max(...level.anchos);
  const boardWidth = view.w;
  const boardHeight = view.h;
  const width = maxW + 2 * canvasGutter;
  const height = level.h + 2 * canvasGutter;
  const empty = { drawing: null as GuideDrawing | null, legend: 'none' as const, showNotice: false };
  if (!linesOn) return empty;
  const board = boardOf(roots.player);
  if (!board) return empty;
  const style = getComputedStyle(board);
  const ox = canvasGutter + (maxW - boardWidth) / 2;
  const oy = canvasGutter;
  const flex = /flex/.test(style.display);
  const grid = /grid/.test(style.display);
  if (level.mundo === 'flex' || (isModernLevel(level) && flex)) {
    return { drawing: flexAxes(style, ox, oy, view, level), legend: 'flex', showNotice: !flex && !level.sinAviso };
  }
  if (isModernLevel(level) && !grid) return { drawing: null, legend: 'none', showNotice: false };
  if (!grid) return { drawing: null, legend: 'grid', showNotice: !level.sinAviso };
  const columns = tracks(style.gridTemplateColumns);
  const rows = tracks(style.gridTemplateRows);
  const probeStyle = getComputedStyle(boardOf(roots.probe) ?? board);
  const explicitColumns = tracks(probeStyle.gridTemplateColumns).length;
  const explicitRows = tracks(probeStyle.gridTemplateRows).length;
  const padL = parseFloat(style.paddingLeft);
  const padR = parseFloat(style.paddingRight);
  const padT = parseFloat(style.paddingTop);
  const padB = parseFloat(style.paddingBottom);
  const columnGap = parseFloat(style.columnGap) || 0;
  const rowGap = parseFloat(style.rowGap) || 0;
  const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);
  const innerW = board.clientWidth - padL - padR;
  const innerH = board.clientHeight - padT - padB;
  const columnLines = axisTicks(columns, columnGap, ox + padL, innerW - sum(columns) - columnGap * Math.max(0, columns.length - 1), style.justifyContent);
  const rowLines = axisTicks(rows, rowGap, oy + padT, innerH - sum(rows) - rowGap * Math.max(0, rows.length - 1), style.alignContent);
  const x0 = columnLines[0]?.[0] ?? ox;
  const x1 = columnLines[columnLines.length - 1]?.[1] ?? x0;
  const y0 = rowLines[0]?.[0] ?? oy;
  const y1 = rowLines[rowLines.length - 1]?.[1] ?? y0;
  const gaps: GuideGap[] = [];
  const lines: GuideLine[] = [];
  const labels: GuideLabel[] = [];
  for (const [a, b] of columnLines) if ((b ?? 0) - (a ?? 0) > 0.5) gaps.push({ x: a ?? 0, y: y0, w: (b ?? 0) - (a ?? 0), h: Math.max(0, y1 - y0) });
  for (const [a, b] of rowLines) if ((b ?? 0) - (a ?? 0) > 0.5) gaps.push({ x: x0, y: a ?? 0, w: Math.max(0, x1 - x0), h: (b ?? 0) - (a ?? 0) });
  const crowded = (count: number, span: number) => count > 1 && span / count < 16;
  const skipColumns = crowded(columnLines.length, x1 - x0);
  const skipRows = crowded(rowLines.length, y1 - y0);
  columnLines.forEach(([a, b], index) => {
    const x = ((a ?? 0) + (b ?? 0)) / 2;
    const implicit = index > explicitColumns;
    lines.push({ x1: x, y1: y0 - 6, x2: x, y2: y1 + 6, kind: implicit ? 'shadow-implicit' : 'shadow' });
    lines.push({ x1: x, y1: y0 - 6, x2: x, y2: y1 + 6, kind: implicit ? 'implicit' : 'main' });
    if (skipColumns && index % 2) return;
    labels.push({ x, y: oy - 21, text: String(index + 1), kind: implicit ? 'implicit' : 'normal', rotate: false });
    if (!implicit && explicitColumns) labels.push({ x, y: oy + boardHeight + 21, text: String(index - explicitColumns - 1), kind: 'negative', rotate: false });
  });
  rowLines.forEach(([a, b], index) => {
    const y = ((a ?? 0) + (b ?? 0)) / 2;
    const implicit = index > explicitRows;
    lines.push({ x1: x0 - 6, y1: y, x2: x1 + 6, y2: y, kind: implicit ? 'shadow-implicit' : 'shadow' });
    lines.push({ x1: x0 - 6, y1: y, x2: x1 + 6, y2: y, kind: implicit ? 'implicit' : 'main' });
    if (skipRows && index % 2) return;
    labels.push({ x: ox - 22, y, text: String(index + 1), kind: implicit ? 'implicit' : 'normal', rotate: false });
    if (!implicit && explicitRows) labels.push({ x: ox + boardWidth + 23, y, text: String(index - explicitRows - 1), kind: 'negative', rotate: false });
  });
  return { drawing: { width, height, gaps, lines, labels }, legend: 'grid', showNotice: false };
}

function flexAxes(style: CSSStyleDeclaration, ox: number, oy: number, view: BoardView, level: Level): GuideDrawing {
  const direction = style.flexDirection;
  const wrap = style.flexWrap;
  const row = direction.startsWith('row');
  const reverse = direction.endsWith('reverse');
  const reverseCross = wrap === 'wrap-reverse';
  const x0 = ox + 4;
  const x1 = ox + view.w - 4;
  const y0 = oy + 4;
  const y1 = oy + view.h - 4;
  const lines: GuideLine[] = [];
  const labels: GuideLabel[] = [];
  const arrow = (kind: 'axis-main' | 'axis-cross', ax: number, ay: number, bx: number, by: number, text: string, tx: number, ty: number, rotate: boolean) => {
    lines.push({ x1: ax, y1: ay, x2: bx, y2: by, kind });
    labels.push({ x: tx, y: ty, text, kind, rotate });
  };
  const yT = oy - 13;
  const xL = ox - 13;
  if (row) {
    arrow('axis-main', reverse ? x1 : x0, yT, reverse ? x0 : x1, yT, `eje principal ${reverse ? '←' : '→'}`, (x0 + x1) / 2, yT - 5, false);
    arrow('axis-cross', xL, reverseCross ? y1 : y0, xL, reverseCross ? y0 : y1, 'eje cruzado', xL - 5, (y0 + y1) / 2, true);
  } else {
    arrow('axis-main', xL, reverse ? y1 : y0, xL, reverse ? y0 : y1, 'eje principal', xL - 5, (y0 + y1) / 2, true);
    arrow('axis-cross', reverseCross ? x1 : x0, yT, reverseCross ? x0 : x1, yT, 'eje cruzado', (x0 + x1) / 2, yT - 5, false);
  }
  const maxW = Math.max(...level.anchos);
  return { width: maxW + 2 * canvasGutter, height: level.h + 2 * canvasGutter, gaps: [], lines, labels };
}

function isAbove(player: HTMLElement, a: string, b: string): boolean {
  const children = [...player.querySelectorAll<HTMLElement>(':scope > .tablero > .pieza')];
  const order = children.map((el, index) => ({ el, index, o: parseInt(getComputedStyle(el).order, 10) || 0 })).sort((left, right) => left.o - right.o || left.index - right.index);
  const position = new Map(order.map((item, index) => [item.el, index]));
  const z = (el: Element) => { const value = getComputedStyle(el).zIndex; return value === 'auto' ? 0 : parseInt(value, 10) || 0; };
  const above = [...player.querySelectorAll<HTMLElement>(`.pieza.${a}`)];
  const below = [...player.querySelectorAll<HTMLElement>(`.pieza.${b}`)];
  return above.length > 0 && below.length > 0 && above.every((ea) => below.every((eb) => z(ea) > z(eb) || (z(ea) === z(eb) && (position.get(ea) ?? 0) > (position.get(eb) ?? 0))));
}

export function lanternPitch(piece: RuntimePiece): number {
  const pitches: Record<string, number> = { alto: 659.25, medio: 523.25, bajo: 392 };
  return pitches[piece.k] ?? 523.25;
}

function playChimes(player: HTMLElement): void {
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
  [...player.querySelectorAll<HTMLElement>('.pieza')].forEach((piece, index) => {
    const transitions = readTransitions(piece, false);
    const transform = transitions.get('transform') || transitions.get('all');
    sound.tono(notes[index % notes.length] ?? 523.25, transform ? transform.dl : 0, 1.4);
  });
}

export function playMelody(level: Level): void {
  level.p.forEach((piece, index) => sound.tono(lanternPitch(piece), 0.3 + index * 0.26, 1.1));
  [392, 523.25, 659.25].forEach((frequency) => sound.tono(frequency, 0.3 + level.p.length * 0.26 + 0.2, 2.2));
}

function clockLabel(clock: ChallengeClock): string {
  const t = Math.max(0, clock.resta);
  const text = `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
  return clock.estado === 'espera' ? `${text} · empieza al escribir` : text;
}

function clockClass(clock: ChallengeClock): Evaluation['clockClass'] {
  if (clock.estado === 'expired') return 'expired';
  if (clock.estado === 'won') return 'won';
  if (clock.estado === 'corre' && clock.resta <= 20) return 'urgent';
  return '';
}

export function buildVictory(level: Level, live: LiveChallenge): VictoryModel {
  const previous = progress.hechos[level.id];
  const beforeFinale = finaleUnlocked();
  const regionBefore = regionStats(level.r);
  const fails = progress.intentos[level.id] || 0;
  const score = level.examen ? (fails === 0 ? 3 : fails <= 2 ? 2 : 1) : 0;
  const cleanTimer = !(level.tiempo && live.clock.agotado);
  const mastered = !!(previous && previous.m) || (level.examen ? score === 3 : !live.usedHelp && cleanTimer);
  progress.hechos[level.id] = { m: mastered, t: Date.now(), nota: level.examen ? Math.max(score, (previous && previous.nota) || 0) : previous?.nota };
  if (level.examen) progress.intentos[level.id] = 0;
  saveProgress(true);
  const regionNow = regionStats(level.r);
  const regionJustCompleted = !level.secreto && !previous && regionNow.hechos === regionNow.total && regionBefore.hechos < regionNow.total;
  const route = routeOf(level);
  const secrets = secretsInWorld(level.mundo);
  const finishedRoute = route.every((item) => progress.hechos[item.id]);
  const exams = levelsInWorld(level.mundo).filter((item) => item.examen);
  const examsDone = exams.filter((item) => progress.hechos[item.id]);
  const finalExam = !!(level.examen && examsDone.length === exams.length && regionJustCompleted);
  const bossLeft = level.jefe ? levelsInRegion(level.r).filter((item) => !progress.hechos[item.id]).length : 0;
  const worldEnds: Record<string, string> = {
    base: '¡Has terminado tu aprendizaje!',
    grid: '¡Has restaurado la cuadrícula!',
    flex: '¡Has dominado el subsuelo!',
    cielo: '¡Has conquistado los cielos!',
    final: '¡Los tres mundos están a salvo!',
  };
  const region = regions[level.r];
  const bossName = region?.al || `a ${region?.pj ?? ''}`;
  const title = level.jefe
    ? (bossLeft === 0 ? `¡Has derrotado ${bossName}!` : '¡Golpe certero!')
    : finalExam ? '¡Prueba de aprendizaje superada!'
      : finishedRoute && !previous ? worldEnds[level.mundo] ?? '¡Ejercicio superado!'
        : regionJustCompleted ? '¡Región completada!'
          : level.examen ? '¡Prueba superada!'
            : '¡Ejercicio superado!';
  let body = '';
  if (level.examen) {
    const totalStars = examsDone.reduce((sum, item) => sum + (progress.hechos[item.id]?.nota || 0), 0);
    const storm = level.jefe && bossLeft === 0 && !previous
      ? (level.mundo === 'final' ? '<b>¡Lo has conseguido!</b> Grid, Flexbox, media queries, variables y transiciones: ya lo dominas todo. ' : '<b>Fin de la tormenta.</b> ')
      : '';
    const attempt = fails === 0 ? 'A la primera.' : `Tras ${fails} entrega${fails > 1 ? 's' : ''} fallida${fails > 1 ? 's' : ''}.`;
    body = `${storm}${attempt}${finalExam ? ` Nota final: <b>${totalStars} de ${exams.length * 3}</b> estrellas.` : ''}`;
  } else if (level.tiempo && !cleanTimer) body = level.tiempoTxt?.[1] || 'Superado, aunque la tormenta te alcanzó. Repítelo a tiempo y sin pistas para dominarlo.';
  else body = mastered ? '<b>Dominado</b>: sin pistas ni soluciones.' : 'Superado con ayuda. Vuelve más tarde sin pistas para dominarlo.';
  if (!beforeFinale && finaleUnlocked()) body += '<span class="dv-despierta">Algo se ha despertado en el Vacío entre los Mundos… El combate final te espera en el menú principal.</span>';
  const next = level.secreto ? undefined : route[route.indexOf(level) + 1];
  const nextLabel = !next ? null
    : next.jefe && !level.jefe ? `Enfrentarse ${regions[next.r]?.al || `a ${regions[next.r]?.pj ?? ''}`}`
      : next.jefe ? 'Siguiente fase'
        : next.examen && !level.examen ? 'Empezar la prueba de aprendizaje'
          : next.r !== level.r ? `Viajar a ${regions[next.r]?.n ?? ''}`
            : next.examen ? 'Siguiente prueba'
              : 'Siguiente ejercicio';
  const progressText = level.jefe
    ? (bossLeft ? `${bossName[0]?.toUpperCase() ?? ''}${bossName.slice(1)} le quedan ${bossLeft} de ${levelsInRegion(level.r).length} vidas` : level.mundo === 'final' ? 'Los garabatos se alinean: ¡las runas vuelven a obedecer!' : 'La tormenta se disipa: el cielo vuelve a ser de todos')
    : level.secreto ? `Secretos resueltos: ${secrets.filter((item) => progress.hechos[item.id]).length} de ${secrets.length}`
      : regionJustCompleted ? `${region?.n ?? ''}: ${regionNow.total} de ${regionNow.total}`
        : level.examen ? `Prueba de aprendizaje: ${examsDone.length} de ${exams.length}`
          : `${exerciseProgress(level.mundo)} de ${EXERCISE_COUNTS[level.mundo]} ejercicios superados`;
  return {
    title,
    practice: level.practica,
    stars: level.examen ? score : null,
    bodyHtml: body,
    quote: level.fin ?? '',
    portrait: level.av || `pj-${level.r}`,
    landmark: `${level.n} ya brilla en el mapa`,
    landmarkIcon: `i-${level.hito}`,
    progressText,
    nextLabel,
    nextId: next?.id ?? null,
  };
}

export interface BlueprintPiece {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly fixed: boolean;
  readonly color: string;
  readonly icon: string;
  readonly label: string;
}

export interface BlueprintView {
  readonly boardW: number;
  readonly boardH: number;
  readonly caption: string;
  readonly pieces: readonly BlueprintPiece[];
}

const viewCaption = (view: BoardView): string => (/^\d/.test(view.n) ? `Tablero de ${view.n}` : view.n);

function objectiveCssFor(level: Level, view: BoardView): string {
  return layerCss(level, ['#target-layer', '#outline-layer', '#probe-target'], level.b.map((rule) => rule.sol), level.mg.map((group) => convertMedia(group.sol, view).cq ?? null));
}

export function readBlueprint(level: Level, roots: BoardRoots, live: LiveChallenge, sheet: HTMLStyleElement | null): BlueprintView[] {
  const layer = isModernLevel(level) ? roots.probeTarget : roots.target;
  const withColor = (level.cmp || []).includes('background-color');
  const views: BlueprintView[] = [];
  const paint = (view: BoardView) => {
    const css = objectiveCssFor(level, view);
    if (sheet && sheet.textContent !== css) sheet.textContent = css;
  };
  for (const view of level.vistas) {
    for (const on of level.estado ? [false, true] : [false]) {
      paint(view);
      placeBoard(roots, level, view);
      if (isModernLevel(level)) {
        roots.probeTarget.classList.add('sin-trans');
        setBoardState([roots.probeTarget], on);
      }
      const board = boardOf(layer)?.getBoundingClientRect();
      const pieces = board ? [...layer.querySelectorAll<HTMLElement>('.pieza')].map((piece, index) => {
        const box = piece.getBoundingClientRect();
        const spec = level.p[index];
        return {
          x: (box.left - board.left) / live.stageScale,
          y: (box.top - board.top) / live.stageScale,
          w: box.width / live.stageScale,
          h: box.height / live.stageScale,
          fixed: !!spec?.fija,
          color: withColor ? getComputedStyle(piece).backgroundColor : '',
          icon: spec?.T.i || spec?.T.o || '',
          label: spec?.e || spec?.marca || '',
        };
      }) : [];
      const caption = [
        level.vistas.length > 1 ? viewCaption(view) : '',
        level.estado ? (on ? STATE_NAMES[level.estado] : 'en reposo') : '',
      ].filter(Boolean).join(' · ');
      views.push({ boardW: view.w, boardH: view.h, caption, pieces });
    }
  }
  if (isModernLevel(level)) {
    setBoardState([roots.probeTarget], false);
    void roots.probeTarget.offsetWidth;
    roots.probeTarget.classList.remove('sin-trans');
  }
  const current = activeView(level, live);
  paint(current);
  placeBoard(roots, level, current);
  return views;
}

const STATE_NAMES: Record<NonNullable<Level['estado']>, string> = { activo: 'activado', hover: 'con el cursor', pulsa: 'pulsado', foco: 'con el foco' };

export function evaluate(
  level: Level,
  roots: BoardRoots,
  texts: readonly string[],
  conditions: readonly string[],
  selectors: readonly string[],
  live: LiveChallenge,
  linesOn: boolean,
  sheets: { readonly player: HTMLStyleElement | null; readonly objective: HTMLStyleElement | null },
): Evaluation {
  const errors: string[] = [];
  const sealed = new Set<string>();
  const clean: string[] = [];
  const current = activeView(level, live);
  const conditionText = level.mg.map((group, index) => (group.fijo ? group.sol : conditions[index] ?? ''));
  level.mg.forEach((group, index) => {
    const converted = convertMedia(conditionText[index] ?? '', current);
    if (converted.err && !group.fijo) errors.push(`<code>@media</code> — ${converted.err}`);
  });
  const written = level.b.map((rule, index) => (rule.sel === undefined ? null : selectors[index] ?? ''));
  const scoped = written.map((selector) => {
    if (selector === null) return null;
    const problem = validateSelector(selector);
    if (problem) errors.push(problem);
    return problem ? '' : stripComments(selector).trim();
  });
  let declarations = 0;
  level.b.forEach((rule, index) => {
    const ok: string[] = [];
    if (rule.ed) {
      for (const declaration of parseDeclaration(texts[index] ?? '')) {
        const problem = validateDeclaration(declaration, level);
        if (!problem) {
          if (!('err' in declaration)) { ok.push(`${declaration.prop}: ${declaration.val};`); declarations += 1; }
        } else if (typeof problem === 'object') sealed.add(problem.sellada);
        else errors.push(`<code>${escapeHtml(rule.s)}</code> — ${problem}`);
      }
    }
    clean[index] = ok.join('\n');
  });
  const rules: RuleLine[] = (level.req || []).map((rule) => ({
    html: rule.m,
    ok: rule.re.test(stripComments(rule.sel ? written.filter((selector) => selector !== null).join('\n') : rule.cond ? conditionText.join('\n') : rule.b !== undefined ? texts[rule.b] ?? '' : texts.join('\n'))),
    limit: false,
    coins: null,
    spent: 0,
  }));
  if (level.bolsa) {
    const spent = declarations * level.bolsa.precio;
    rules.push({ html: `Bolsa: ${level.bolsa.total} ámbar · cada runa, ${level.bolsa.precio} · gastas <b>${spent}</b>`, ok: spent <= level.bolsa.total, limit: true, coins: level.max ?? 0, spent: declarations });
  } else if (level.max) rules.push({ html: `Como máximo ${level.max} declaraci${level.max > 1 ? 'ones' : 'ón'} (llevas ${declarations})`, ok: declarations <= level.max, limit: true, coins: null, spent: 0 });
  progress.codigo[level.id] = [
    ...texts,
    ...level.mg.map((group, index) => (group.fijo ? '' : conditionText[index] ?? '')),
    ...written.filter((selector) => selector !== null),
  ];
  saveProgress(false, true);

  // Views that differ only in size share one sheet; a different medium or preference needs its own.
  const sheetsByDevice = new Map<string, { player: string; objective: string }>();
  const cssOf = (view: BoardView) => {
    const key = deviceKey(view);
    let css = sheetsByDevice.get(key);
    if (!css) {
      css = {
        player: layerCss(level, ['#player-layer', '#probe'], clean, level.mg.map((_, index) => convertMedia(conditionText[index] ?? '', view).cq ?? null), scoped),
        objective: objectiveCssFor(level, view),
      };
      sheetsByDevice.set(key, css);
    }
    return css;
  };
  const show = (view: BoardView) => {
    const css = cssOf(view);
    if (sheets.player && sheets.player.textContent !== css.player) sheets.player.textContent = css.player;
    if (sheets.objective && sheets.objective.textContent !== css.objective) sheets.objective.textContent = css.objective;
    placeBoard(roots, level, view);
  };
  show(current);
  const { player: playerCss, objective: objectiveCss } = cssOf(current);
  for (const [above, below, text] of level.encima || []) rules.push({ html: text, ok: isAbove(roots.player, above, below), limit: false, coins: null, spent: 0 });
  const useProbes = usesProbes(level);
  const probeMessages: string[] = [];
  const perWidth = level.vistas.map((view) => {
    show(view);
    if (!useProbes) return { oks: measureBoard(roots, live.stageScale), tableroMal: false };
    const probed = measureProbes(level, roots, live.stageScale);
    for (const message of probed.msgs) if (!probeMessages.includes(message)) probeMessages.push(message);
    return probed;
  });
  show(current);
  const activeIndex = level.vistas.indexOf(current);
  const active = perWidth[activeIndex]?.oks ?? [];
  const movable = level.movibles;
  const allPlaced = (row: readonly boolean[]) => movable.every((index) => row[index]);
  const playerPieces = [...roots.player.querySelectorAll<HTMLElement>('.pieza')];
  const outlinePieces = [...roots.outline.querySelectorAll<HTMLElement>('.pieza')];
  // A lesson about the piece's own shadow keeps the glow off it: the dashed outline already says "matched".
  const glow = !level.examen && !level.cmp?.includes('box-shadow');
  playerPieces.forEach((piece, index) => piece.classList.toggle('matched', glow && !level.p[index]?.fija && !!active[index]));
  outlinePieces.forEach((piece, index) => piece.classList.toggle('matched', !!active[index]));
  const newly = movable.filter((index) => active[index] && live.previousMatches.length && !live.previousMatches[index]);
  if (newly.length && !level.examen) {
    if (level.musica) newly.forEach((index, order) => { const piece = level.p[index]; if (piece) sound.tono(lanternPitch(piece), order * 0.12); });
    else if (newly.some((index) => /gallina|gallo|pollito/.test(level.p[index]?.t ?? ''))) sound.cloc();
    else sound.encaje();
  }
  live.previousMatches = [...active];
  const widthOk = perWidth.map(({ oks, tableroMal }) => allPlaced(oks) && !tableroMal);
  const failedViews = level.vistas.filter((_, index) => !widthOk[index]);
  const failedWidths = failedViews.map((view) => view.n);
  const sizesOnly = level.vistas.every((view) => /^\d/.test(view.n));
  const whereToLook = sizesOnly ? `el tablero a ${failedWidths.join(' y ')}` : failedWidths.map((name) => `«${name}»`).join(' y ');
  const geometryOk = failedWidths.length === 0;
  const placed = movable.filter((index) => active[index]).length;
  const messages: StatusLine[] = [];
  if (sealed.size) messages.push({ tone: 'error', icon: 'i-candado', html: `${[...sealed].map((prop) => `<code>${prop}</code>`).join(', ')} ${sealed.size > 1 ? 'están selladas' : 'está sellada'} en este ejercicio y no tendrá${sealed.size > 1 ? 'n' : ''} efecto. Usa solo las runas permitidas.` });
  errors.slice(0, 3).forEach((error) => messages.push({ tone: 'error', icon: 'i-aviso', html: error }));
  const rulesOk = rules.every((rule) => rule.ok);
  const cleanSheet = !sealed.size && !errors.length;
  if (!level.examen && cleanSheet && !geometryOk && declarations > 0) {
    const slip = (level.despistes ?? []).find((item) => {
      const element = item.s ? roots.player.querySelector(item.s) : boardOf(roots.player);
      if (!element) return false;
      const style = getComputedStyle(element);
      return Object.entries(item.si).every(([prop, value]) => style.getPropertyValue(prop) === value);
    });
    if (slip) messages.push({ tone: 'aviso', icon: 'i-ojo', html: slip.m });
  }
  const solved = geometryOk && cleanSheet && rulesOk;
  const guides = buildGuides(level, roots, current, linesOn);
  let victory: VictoryModel | null = null;
  if (level.examen) {
    live.exam = { resuelta: solved, enSitio: placed, total: movable.length, fallos: movable.filter((index) => !active[index]), vistasFallidas: failedWidths, limpio: cleanSheet, reglasOk: rulesOk };
    if (live.delivery) messages.push(live.delivery);
    if (live.delivery?.tone === 'bien' && !live.celebrated) {
      if (level.musica) playMelody(level); else sound.victoria();
      victory = buildVictory(level, live);
      live.celebrated = true;
    }
  } else {
    if (level.bolsa && !rulesOk) messages.push({ tone: 'aviso', icon: 'i-aviso', html: level.bolsaTxt ? escapeHtml(level.bolsaTxt) : `${escapeHtml(regions[level.r]?.pj ?? '')}: «¡Uy, uy, uy! Con eso no me llega ni para el té. Busca atajos, cliente.»` });
    if (level.tiempo && live.clock.estado === 'expired' && !solved) messages.push({ tone: 'aviso', icon: 'i-reloj', html: level.tiempoTxt?.[0] ?? 'La tormenta te ha alcanzado. <button type="button" class="text-link" id="p-sacudir">Sacude la arena</button> y vuelve a intentarlo antes de que se acabe el tiempo.' });
    if (!geometryOk && probeMessages.length) probeMessages.slice(0, 2).forEach((message) => messages.push({ tone: 'aviso', icon: level.estado ? 'i-reloj' : 'i-aviso', html: message }));
    if (geometryOk && !solved) messages.push({ tone: 'aviso', icon: 'i-aviso', html: !cleanSheet ? 'Las piezas están en su sitio, pero la tablilla aún tiene runas incorrectas o selladas.' : 'Las piezas están en su sitio, pero falta cumplir las condiciones del objetivo.' });
    else if (!geometryOk && widthOk[activeIndex]) messages.push({ tone: 'aviso', icon: 'i-aviso', html: `${sizesOnly ? 'Con este tamaño' : 'Así'} funciona. Revisa ${whereToLook}.` });
    if (solved) messages.push({ tone: 'bien', icon: 'i-hecho', html: `${escapeHtml(level.n)} vuelve a estar en orden.${progress.hechos[level.id]?.m ? ' Ejercicio dominado.' : ''}` });
    if (solved && !live.celebrated) {
      if (live.clock.estado === 'corre') { window.clearInterval(live.clock.id); live.clock = { ...live.clock, estado: 'won' }; }
      if (level.musica) playMelody(level); else sound.victoria();
      victory = buildVictory(level, live);
      live.celebrated = true;
    }
  }
  const total = level.tiempo ?? 1;
  const arena = live.clock.estado === 'expired' ? 1 : live.clock.estado === 'corre' ? (1 - live.clock.resta / total) * 0.72 : 0;
  return {
    playerCss, objectiveCss, matches: active, widthOk, placed, movable: movable.length,
    rules, messages, solved: solved && !level.examen, showNotice: guides.showNotice, legend: guides.legend,
    guides: guides.drawing, exam: live.exam, victory, arena, clockClass: clockClass(live.clock), clockLabel: clockLabel(live.clock),
  };
}

export function deliverExam(level: Level, roots: BoardRoots, live: LiveChallenge): 'hero' | 'boss' | null {
  const exam = live.exam;
  if (exam?.resuelta) {
    live.delivery = { tone: 'bien', icon: 'i-hecho', html: level.jefe ? '¡Golpe certero! El plano y el tablero coinciden.' : 'Entrega correcta. El plano y el tablero coinciden.' };
    if (level.jefe) sound.trueno(0.6);
    return level.jefe ? 'hero' : null;
  }
  const attempt = (progress.intentos[level.id] || 0) + 1;
  progress.intentos[level.id] = attempt;
  saveProgress(true);
  sound.error();
  if (level.jefe) sound.trueno(1);
  const pieces = [...roots.player.querySelectorAll<HTMLElement>('.pieza')];
  (exam?.fallos ?? []).forEach((index) => {
    const piece = pieces[index];
    if (!piece) return;
    piece.classList.remove('mismatch');
    void piece.offsetWidth;
    piece.classList.add('mismatch');
  });
  window.setTimeout(() => pieces.forEach((piece) => piece.classList.remove('mismatch')), 1700);
  const taunts = regions[level.r]?.pullas || TAUNTS;
  const taunt = taunts[(attempt - 1) % taunts.length] ?? taunts[0] ?? '';
  live.delivery = {
    tone: 'error',
    icon: 'i-aviso',
    html: `${level.jefe ? `<b>${escapeHtml(regions[level.r]?.pj ?? '')}:</b> «${taunt}» ` : ''}Entrega ${attempt}: ${exam?.enSitio ?? 0} de ${exam?.total ?? 0} piezas en su sitio${level.vistas.length > 1 ? ' en la vista actual' : ''}${exam && !exam.limpio ? ', y la tablilla tiene runas incorrectas o selladas' : ''}${exam && !exam.reglasOk ? ', y falta cumplir alguna condición' : ''}.${level.vistas.length > 1 && exam?.vistasFallidas.length ? ` Revisa ${exam.vistasFallidas.every((name) => /^\d/.test(name)) ? `el tablero a ${exam.vistasFallidas.join(' y ')}` : exam.vistasFallidas.map((name) => `«${name}»`).join(' y ')}.` : ''}${exam?.fallos.length ? ' Las piezas que parpadean no coinciden con el plano.' : ''}`,
  };
  return level.jefe ? 'boss' : null;
}

export function chimeIfNeeded(level: Level, player: HTMLElement, active: boolean): void {
  if (active && level.musica) playChimes(player);
}

export interface TabletTexts {
  readonly texts: string[];
  readonly conditions: string[];
  /** One entry per rule; only rules whose selector is written by the student use theirs. */
  readonly selectors: string[];
}

export function solutionTexts(level: Level, field: 'sol' | 'ini'): TabletTexts {
  return {
    texts: level.b.map((rule) => rule[field]),
    conditions: level.mg.map((group) => group[field]),
    selectors: level.b.map((rule) => (rule.sel === undefined ? '' : field === 'sol' ? rule.s : rule.sel)),
  };
}

let fillSolution: ((id: string, field: 'sol' | 'ini') => void) | null = null;
let pendingFill: { id: string; field: 'sol' | 'ini' } | null = null;

export function registerFill(id: string, fill: (field: 'sol' | 'ini') => void): void {
  fillSolution = (requestId, field) => { if (requestId === id) fill(field); };
  if (pendingFill?.id === id) {
    fill(pendingFill.field);
    pendingFill = null;
  }
}

export function requestFill(id: string, field: 'sol' | 'ini'): void {
  pendingFill = { id, field };
  fillSolution?.(id, field);
}

export function savedTexts(level: Level): TabletTexts {
  const saved = progress.codigo[level.id];
  const read = (position: number, fallback: string) => {
    const value = saved?.[position];
    return typeof value === 'string' ? value : fallback;
  };
  let next = level.b.length + level.mg.length;
  return {
    texts: level.b.map((rule, index) => read(index, rule.ini)),
    conditions: level.mg.map((group, index) => read(level.b.length + index, group.ini)),
    selectors: level.b.map((rule) => (rule.sel === undefined ? '' : read(next++, rule.sel))),
  };
}
