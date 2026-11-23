/**
 * Checks the player's tablet against the lesson: applies their CSS to the board, measures every
 * view and says what is right, what is wrong and why. It writes the two board stylesheets and
 * positions the layers, but saves nothing and plays nothing: the caller reacts to the result.
 */
import { CSS_PROPS, regions } from '../../core/catalog';
import type { BoardView, Level } from '../../core/models';
import { escapeHtml } from '../../shared/dom';
import { goalCss } from './board/blueprint';
import { type Guides, readGuides } from './board/guides';
import { type BoardLayers, boardOf, placeBoard } from './board/layers';
import { isAbove, measurePlacement, measureProbes } from './board/measure';
import { type Clock, sandLevel } from './clock';
import { checkDeclaration, parseDeclarations, stripComments } from './css/declarations';
import { containerQuery, convertMedia, deviceKey } from './css/media';
import { layerCss, PLAYER_LAYERS, selectorProblem } from './css/stylesheet';
import { type ExamSnapshot, viewList } from './exam';
import type { TabletText } from './tablet';

export interface StatusLine {
  readonly tone: 'error' | 'aviso' | 'bien';
  readonly icon: string;
  readonly html: string;
}

/** One line of the objective's checklist. */
export interface CheckLine {
  readonly html: string;
  readonly ok: boolean;
  /** A limit (declarations, money): shown as failing, not just pending, when broken. */
  readonly limit: boolean;
  /** Coins in a bargaining lesson's purse, or null. */
  readonly coins: number | null;
  readonly spent: number;
}

export interface Evaluation {
  /** Per piece, in the current view. */
  readonly matches: readonly boolean[];
  /** Per piece: glows on the player's board (matched, movable, and not an exam). */
  readonly glowing: readonly boolean[];
  /** Per view: every movable piece in place. */
  readonly viewsOk: readonly boolean[];
  readonly placed: number;
  readonly movable: number;
  readonly checks: readonly CheckLine[];
  readonly messages: readonly StatusLine[];
  /** Everything matches. An exam still has to be delivered. */
  readonly solved: boolean;
  readonly guides: Guides;
  readonly exam: ExamSnapshot | null;
  /** How much sand covers the board, 0 to 1. */
  readonly sand: number;
}

export interface EvaluationInput {
  readonly level: Level;
  readonly layers: BoardLayers;
  readonly tablet: TabletText;
  readonly view: BoardView;
  /** Stage scale, so measuring tolerances stay in board pixels. */
  readonly scale: number;
  readonly guidesOn: boolean;
  readonly sheets: {
    readonly player: HTMLStyleElement | null;
    readonly goal: HTMLStyleElement | null;
  };
  readonly clock: Clock;
  /** The last exam delivery's verdict. */
  readonly delivery: StatusLine | null;
  /** The lesson was already mastered, for the solved message. */
  readonly mastered: boolean;
}

const MAX_ERRORS = 3;
const MAX_PROBE_MESSAGES = 2;

/** What the player wrote, cleaned: valid declarations only, plus what was wrong with the rest. */
interface ReadTablet {
  /** Valid declarations per rule. */
  readonly bodies: readonly string[];
  /** Condition text per media group (the lesson's own for fixed groups). */
  readonly conditions: readonly string[];
  /** Selector per rule the player writes, '' when invalid; null for the lesson's own selectors. */
  readonly selectors: readonly (string | null)[];
  readonly declarations: number;
  readonly sealed: ReadonlySet<string>;
  readonly errors: readonly string[];
}

function readTablet(level: Level, tablet: TabletText, view: BoardView): ReadTablet {
  const errors: string[] = [];
  const sealed = new Set<string>();
  const conditions = level.mediaGroups.map((group, index) =>
    group.fixed ? group.solution : (tablet.conditions[index] ?? ''),
  );
  level.mediaGroups.forEach((group, index) => {
    const converted = convertMedia(conditions[index] ?? '', view);
    if (converted.kind === 'error' && !group.fixed)
      errors.push(`<code>@media</code> — ${converted.message}`);
  });
  const selectors = level.rules.map((rule, index) => {
    if (rule.ownSelector === undefined) return null;
    const written = tablet.selectors[index] ?? '';
    const problem = selectorProblem(written);
    if (problem) errors.push(problem);
    return problem ? '' : stripComments(written).trim();
  });
  let declarations = 0;
  const bodies = level.rules.map((rule, index) => {
    if (!rule.editable) return '';
    const valid: string[] = [];
    for (const declaration of parseDeclarations(tablet.declarations[index] ?? '')) {
      const check = checkDeclaration(declaration, level.allowed, CSS_PROPS);
      if (check.kind === 'sealed') sealed.add(check.property);
      else if (check.kind === 'error')
        errors.push(`<code>${escapeHtml(rule.selector)}</code> — ${check.message}`);
      else if (declaration.kind === 'declaration') {
        valid.push(`${declaration.property}: ${declaration.value};`);
        declarations += 1;
      }
    }
    return valid.join('\n');
  });
  return { bodies, conditions, selectors, declarations, sealed, errors };
}

/** The objective's checklist: the lesson's checks, then its declaration or money limit. */
function checklist(level: Level, tablet: TabletText, read: ReadTablet): CheckLine[] {
  // Checks read what the player typed, valid or not.
  const written = level.rules.flatMap((rule, index) =>
    rule.ownSelector === undefined ? [] : [tablet.selectors[index] ?? ''],
  );
  const lines: CheckLine[] = (level.checks ?? []).map((check) => {
    let text = tablet.declarations.join('\n');
    if (check.inSelector) text = written.join('\n');
    else if (check.inCondition) text = read.conditions.join('\n');
    else if (check.rule !== undefined) text = tablet.declarations[check.rule] ?? '';
    return {
      html: check.message,
      ok: check.pattern.test(stripComments(text)),
      limit: false,
      coins: null,
      spent: 0,
    };
  });
  const count = read.declarations;
  if (level.purse) {
    const spent = count * level.purse.price;
    lines.push({
      html: `Bolsa: ${level.purse.total} ámbar · cada runa, ${level.purse.price} · gastas <b>${spent}</b>`,
      ok: spent <= level.purse.total,
      limit: true,
      coins: level.maxDeclarations ?? 0,
      spent: count,
    });
  } else if (level.maxDeclarations) {
    const max = level.maxDeclarations;
    lines.push({
      html: `Como máximo ${max} declaraci${max > 1 ? 'ones' : 'ón'} (llevas ${count})`,
      ok: count <= max,
      limit: true,
      coins: null,
      spent: 0,
    });
  }
  return lines;
}

/** Writes both stylesheets for `view` and moves the layers there. Views on the same device share sheets. */
function sheetWriter(
  level: Level,
  layers: BoardLayers,
  read: ReadTablet,
  sheets: EvaluationInput['sheets'],
) {
  const byDevice = new Map<string, { player: string; goal: string }>();
  return (view: BoardView) => {
    const key = deviceKey(view);
    let css = byDevice.get(key);
    if (!css) {
      css = {
        player: layerCss(level, PLAYER_LAYERS, {
          bodies: read.bodies,
          conditions: read.conditions.map((text) => containerQuery(text, view)),
          selectors: read.selectors,
        }),
        goal: goalCss(level, view),
      };
      byDevice.set(key, css);
    }
    if (sheets.player && sheets.player.textContent !== css.player)
      sheets.player.textContent = css.player;
    if (sheets.goal && sheets.goal.textContent !== css.goal) sheets.goal.textContent = css.goal;
    placeBoard(layers, level, view);
  };
}

/** Lessons that compare styles or states are measured on hidden copies of the board. */
export const usesProbes = (level: Level): boolean => Boolean(level.state || level.compare?.length);

interface ViewResult {
  readonly matches: readonly boolean[];
  readonly boardDiffers: boolean;
}

/** The first recognisable wrong turn the board shows, if the lesson describes one. */
function misstepMessage(level: Level, player: HTMLElement): string | null {
  const slip = (level.missteps ?? []).find((misstep) => {
    const element = misstep.selector ? player.querySelector(misstep.selector) : boardOf(player);
    if (!element) return false;
    const style = getComputedStyle(element);
    return Object.entries(misstep.when).every(
      ([property, value]) => style.getPropertyValue(property) === value,
    );
  });
  return slip?.message ?? null;
}

/** How the board stands after measuring every view. */
interface Verdict {
  readonly matches: readonly boolean[];
  readonly viewsOk: readonly boolean[];
  readonly failedViews: readonly string[];
  readonly currentViewOk: boolean;
  readonly placed: number;
  readonly placementOk: boolean;
  /** No wrong or sealed runes. */
  readonly clean: boolean;
  readonly checksOk: boolean;
  readonly solved: boolean;
  readonly probeMessages: readonly string[];
}

const aviso = (html: string, icon = 'i-aviso'): StatusLine => ({ tone: 'aviso', icon, html });

/** Applies the tablet to every view and measures it, then leaves the board on the current one. */
function measureViews(
  level: Level,
  layers: BoardLayers,
  scale: number,
  show: (view: BoardView) => void,
): { readonly perView: readonly ViewResult[]; readonly probeMessages: readonly string[] } {
  const probeMessages: string[] = [];
  const probes = usesProbes(level);
  const perView = level.views.map((view): ViewResult => {
    show(view);
    if (!probes) {
      return {
        matches: measurePlacement(layers.player, layers.target, scale),
        boardDiffers: false,
      };
    }
    const probed = measureProbes(level, layers.probe, layers.probeTarget, scale);
    for (const message of probed.messages) {
      if (!probeMessages.includes(message)) probeMessages.push(message);
    }
    return probed;
  });
  return { perView, probeMessages };
}

function verdictOf(
  level: Level,
  current: BoardView,
  read: ReadTablet,
  checks: readonly CheckLine[],
  measured: ReturnType<typeof measureViews>,
): Verdict {
  const currentIndex = level.views.indexOf(current);
  const matches = measured.perView[currentIndex]?.matches ?? [];
  const inPlace = (row: readonly boolean[]) => level.movable.every((index) => row[index]);
  const viewsOk = measured.perView.map(
    ({ matches: row, boardDiffers }) => inPlace(row) && !boardDiffers,
  );
  const failedViews = level.views.filter((_, index) => !viewsOk[index]).map((view) => view.name);
  const placementOk = failedViews.length === 0;
  const clean = read.sealed.size === 0 && read.errors.length === 0;
  const checksOk = checks.every((line) => line.ok);
  return {
    matches,
    viewsOk,
    failedViews,
    currentViewOk: Boolean(viewsOk[currentIndex]),
    placed: level.movable.filter((index) => matches[index]).length,
    placementOk,
    clean,
    checksOk,
    solved: placementOk && clean && checksOk,
    probeMessages: measured.probeMessages,
  };
}

/** What is wrong with the tablet itself: sealed runes, syntax errors, a known slip. */
function tabletMessages(
  level: Level,
  read: ReadTablet,
  verdict: Verdict,
  player: HTMLElement,
): StatusLine[] {
  const messages: StatusLine[] = [];
  if (read.sealed.size) {
    const several = read.sealed.size > 1;
    const names = [...read.sealed].map((property) => `<code>${property}</code>`).join(', ');
    messages.push({
      tone: 'error',
      icon: 'i-candado',
      html: `${names} ${several ? 'están selladas' : 'está sellada'} en este ejercicio y no tendrá${several ? 'n' : ''} efecto. Usa solo las runas permitidas.`,
    });
  }
  for (const error of read.errors.slice(0, MAX_ERRORS)) {
    messages.push({ tone: 'error', icon: 'i-aviso', html: error });
  }
  if (!level.exam && verdict.clean && !verdict.placementOk && read.declarations > 0) {
    const slip = misstepMessage(level, player);
    if (slip) messages.push(aviso(slip, 'i-ojo'));
  }
  return messages;
}

function purseWarning(level: Level, verdict: Verdict): StatusLine | null {
  if (!level.purse || verdict.checksOk) return null;
  if (level.purseMessage) return aviso(escapeHtml(level.purseMessage));
  const character = escapeHtml(regions[level.region]?.character ?? '');
  return aviso(
    `${character}: «¡Uy, uy, uy! Con eso no me llega ni para el té. Busca atajos, cliente.»`,
  );
}

function timerWarning(level: Level, clock: Clock, verdict: Verdict): StatusLine | null {
  if (!level.timeLimit || clock.status !== 'expired' || verdict.solved) return null;
  return aviso(
    level.timeMessages?.expired ??
      'La tormenta te ha alcanzado. <button type="button" class="text-link" id="p-sacudir">Sacude la arena</button> y vuelve a intentarlo antes de que se acabe el tiempo.',
    'i-reloj',
  );
}

/** Why the pieces are not done: what the probes noticed, or which views still fail. */
function placementMessages(level: Level, verdict: Verdict): StatusLine[] {
  if (verdict.placementOk) {
    if (verdict.solved) return [];
    return [
      aviso(
        verdict.clean
          ? 'Las piezas están en su sitio, pero falta cumplir las condiciones del objetivo.'
          : 'Las piezas están en su sitio, pero la tablilla aún tiene runas incorrectas o selladas.',
      ),
    ];
  }
  const icon = level.state ? 'i-reloj' : 'i-aviso';
  const messages = verdict.probeMessages
    .slice(0, MAX_PROBE_MESSAGES)
    .map((message) => aviso(message, icon));
  if (verdict.currentViewOk) {
    const bySize = level.views.every((view) => /^\d/.test(view.name));
    const here = bySize ? 'Con este tamaño' : 'Así';
    messages.push(aviso(`${here} funciona. Revisa ${viewList(verdict.failedViews, bySize)}.`));
  }
  return messages;
}

function lessonMessages(level: Level, input: EvaluationInput, verdict: Verdict): StatusLine[] {
  const messages = [
    purseWarning(level, verdict),
    timerWarning(level, input.clock, verdict),
    ...placementMessages(level, verdict),
  ].filter((line): line is StatusLine => line !== null);
  if (verdict.solved) {
    const mastered = input.mastered ? ' Ejercicio dominado.' : '';
    messages.push({
      tone: 'bien',
      icon: 'i-hecho',
      html: `${escapeHtml(level.title)} vuelve a estar en orden.${mastered}`,
    });
  }
  return messages;
}

function examSnapshot(level: Level, verdict: Verdict): ExamSnapshot {
  return {
    solved: verdict.solved,
    placed: verdict.placed,
    total: level.movable.length,
    misplaced: level.movable.filter((index) => !verdict.matches[index]),
    failedViews: verdict.failedViews,
    clean: verdict.clean,
    checksPassed: verdict.checksOk,
  };
}

export function evaluate(input: EvaluationInput): Evaluation {
  const { level, layers, view: current } = input;
  const read = readTablet(level, input.tablet, current);
  const checks = checklist(level, input.tablet, read);
  const show = sheetWriter(level, layers, read, input.sheets);

  show(current);
  for (const { upper, lower, message } of level.above ?? []) {
    const ok = isAbove(layers.player, upper, lower);
    checks.push({ html: message, ok, limit: false, coins: null, spent: 0 });
  }
  const measured = measureViews(level, layers, input.scale, show);
  show(current);
  const verdict = verdictOf(level, current, read, checks, measured);

  const messages = tabletMessages(level, read, verdict, layers.player);
  if (!level.exam) messages.push(...lessonMessages(level, input, verdict));
  else if (input.delivery) messages.push(input.delivery);

  // A lesson about the piece's own shadow keeps the glow off it: the dashed outline already says "matched".
  const glow = !level.exam && !level.compare?.includes('box-shadow');
  return {
    matches: verdict.matches,
    glowing: level.pieces.map(
      (piece, index) => glow && !piece.pinned && Boolean(verdict.matches[index]),
    ),
    viewsOk: verdict.viewsOk,
    placed: verdict.placed,
    movable: level.movable.length,
    checks,
    messages,
    solved: verdict.solved,
    guides: readGuides(level, layers.player, layers.probe, current, input.guidesOn),
    exam: level.exam ? examSnapshot(level, verdict) : null,
    sand: sandLevel(input.clock, level.timeLimit),
  };
}
