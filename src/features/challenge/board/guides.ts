/**
 * Guides drawn over the board: grid lines with their numbers, or the flex axes. They follow what
 * the browser computed for the player's board, so they show what the CSS actually did.
 */
import { isOpenBoard } from '../../../core/catalog';
import type { BoardView, Level } from '../../../core/models';
import { boardOf, boardOrigin, stageSize } from './layers';

export type GuideKind =
  | 'shadow'
  | 'main'
  | 'shadow-implicit'
  | 'implicit'
  | 'axis-main'
  | 'axis-cross';
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
  readonly width: number;
  readonly height: number;
}

export interface GuideDrawing {
  readonly width: number;
  readonly height: number;
  readonly gaps: readonly GuideGap[];
  readonly lines: readonly GuideLine[];
  readonly labels: readonly GuideLabel[];
}

export interface Guides {
  readonly drawing: GuideDrawing | null;
  readonly legend: 'flex' | 'grid' | 'none';
  /** Warn that the board is not yet the container the lesson teaches. */
  readonly notice: boolean;
}

const NONE: Guides = { drawing: null, legend: 'none', notice: false };
/** Below this many pixels per line, every other number is skipped. */
const CROWDED_PX = 16;
const AXIS_INSET = 4;

/** Track sizes of a computed `grid-template-*`, without line names. */
const trackSizes = (value: string): number[] =>
  !value || value === 'none'
    ? []
    : value
        .replace(/\[[^\]]*\]/g, ' ')
        .trim()
        .split(/\s+/)
        .map(parseFloat)
        .filter((n) => !Number.isNaN(n));

/**
 * Each grid line as `[start, end]`: a line after a gap is two edges, the line itself is their middle.
 * `free` is the space the tracks leave, spread as the content alignment says.
 */
function gridLines(
  sizes: number[],
  gap: number,
  start: number,
  free: number,
  alignment: string,
): number[][] {
  const count = sizes.length;
  const mode = alignment.replace('safe ', '').replace('unsafe ', '');
  let offset = 0;
  let extra = 0;
  if (count) {
    if (mode === 'center') offset = free / 2;
    else if (mode === 'end' || mode === 'flex-end' || mode === 'right') offset = free;
    else if (free > 0 && mode === 'space-between' && count > 1) extra = free / (count - 1);
    else if (free > 0 && mode === 'space-around') {
      extra = free / count;
      offset = extra / 2;
    } else if (free > 0 && mode === 'space-evenly') {
      extra = free / (count + 1);
      offset = extra;
    }
  }
  let x = start + offset;
  const lines = [[x, x]];
  sizes.forEach((size, index) => {
    x += size;
    const edge = x;
    const last = index === count - 1;
    if (!last) x += gap + extra;
    lines.push([edge, last ? edge : x]);
  });
  return lines;
}

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

function gridDrawing(
  level: Level,
  board: HTMLElement,
  probe: HTMLElement | null,
  view: BoardView,
): GuideDrawing {
  const style = getComputedStyle(board);
  const { x: ox, y: oy } = boardOrigin(level, view);
  const columns = trackSizes(style.gridTemplateColumns);
  const rows = trackSizes(style.gridTemplateRows);
  // The probe has no auto-placed pieces outside the goal, so its tracks are the explicit ones.
  const probeStyle = getComputedStyle(probe ?? board);
  const explicitColumns = trackSizes(probeStyle.gridTemplateColumns).length;
  const explicitRows = trackSizes(probeStyle.gridTemplateRows).length;
  const padding = {
    left: parseFloat(style.paddingLeft),
    right: parseFloat(style.paddingRight),
    top: parseFloat(style.paddingTop),
    bottom: parseFloat(style.paddingBottom),
  };
  const columnGap = parseFloat(style.columnGap) || 0;
  const rowGap = parseFloat(style.rowGap) || 0;
  const innerWidth = board.clientWidth - padding.left - padding.right;
  const innerHeight = board.clientHeight - padding.top - padding.bottom;
  const freeWidth = innerWidth - sum(columns) - columnGap * Math.max(0, columns.length - 1);
  const freeHeight = innerHeight - sum(rows) - rowGap * Math.max(0, rows.length - 1);
  const columnLines = gridLines(
    columns,
    columnGap,
    ox + padding.left,
    freeWidth,
    style.justifyContent,
  );
  const rowLines = gridLines(rows, rowGap, oy + padding.top, freeHeight, style.alignContent);
  const x0 = columnLines[0]?.[0] ?? ox;
  const x1 = columnLines.at(-1)?.[1] ?? x0;
  const y0 = rowLines[0]?.[0] ?? oy;
  const y1 = rowLines.at(-1)?.[1] ?? y0;

  const gaps: GuideGap[] = [];
  for (const [a = 0, b = 0] of columnLines) {
    if (b - a > 0.5) gaps.push({ x: a, y: y0, width: b - a, height: Math.max(0, y1 - y0) });
  }
  for (const [a = 0, b = 0] of rowLines) {
    if (b - a > 0.5) gaps.push({ x: x0, y: a, width: Math.max(0, x1 - x0), height: b - a });
  }

  const lines: GuideLine[] = [];
  const labels: GuideLabel[] = [];
  const crowded = (count: number, span: number) => count > 1 && span / count < CROWDED_PX;
  // Each line is drawn twice: a dark shadow under it keeps it readable on any floor.
  const line = (ax: number, ay: number, bx: number, by: number, implicit: boolean) => {
    const ends = { x1: ax, y1: ay, x2: bx, y2: by };
    lines.push({ ...ends, kind: implicit ? 'shadow-implicit' : 'shadow' });
    lines.push({ ...ends, kind: implicit ? 'implicit' : 'main' });
  };
  const skipColumns = crowded(columnLines.length, x1 - x0);
  columnLines.forEach(([a = 0, b = 0], index) => {
    const x = (a + b) / 2;
    const implicit = index > explicitColumns;
    line(x, y0 - 6, x, y1 + 6, implicit);
    if (skipColumns && index % 2) return;
    labels.push({
      x,
      y: oy - 21,
      text: String(index + 1),
      kind: implicit ? 'implicit' : 'normal',
      rotate: false,
    });
    if (!implicit && explicitColumns) {
      const negative = String(index - explicitColumns - 1);
      labels.push({ x, y: oy + view.height + 21, text: negative, kind: 'negative', rotate: false });
    }
  });
  const skipRows = crowded(rowLines.length, y1 - y0);
  rowLines.forEach(([a = 0, b = 0], index) => {
    const y = (a + b) / 2;
    const implicit = index > explicitRows;
    line(x0 - 6, y, x1 + 6, y, implicit);
    if (skipRows && index % 2) return;
    labels.push({
      x: ox - 22,
      y,
      text: String(index + 1),
      kind: implicit ? 'implicit' : 'normal',
      rotate: false,
    });
    if (!implicit && explicitRows) {
      const negative = String(index - explicitRows - 1);
      labels.push({ x: ox + view.width + 23, y, text: negative, kind: 'negative', rotate: false });
    }
  });
  return { ...stageSize(level), gaps, lines, labels };
}

function flexDrawing(level: Level, style: CSSStyleDeclaration, view: BoardView): GuideDrawing {
  const { x: ox, y: oy } = boardOrigin(level, view);
  const row = style.flexDirection.startsWith('row');
  const reverse = style.flexDirection.endsWith('reverse');
  const reverseCross = style.flexWrap === 'wrap-reverse';
  const x0 = ox + AXIS_INSET;
  const x1 = ox + view.width - AXIS_INSET;
  const y0 = oy + AXIS_INSET;
  const y1 = oy + view.height - AXIS_INSET;
  const top = oy - 13;
  const left = ox - 13;
  const lines: GuideLine[] = [];
  const labels: GuideLabel[] = [];
  const horizontal = (kind: 'axis-main' | 'axis-cross', backwards: boolean, text: string) => {
    lines.push({ x1: backwards ? x1 : x0, y1: top, x2: backwards ? x0 : x1, y2: top, kind });
    labels.push({ x: (x0 + x1) / 2, y: top - 5, text, kind, rotate: false });
  };
  const vertical = (kind: 'axis-main' | 'axis-cross', backwards: boolean, text: string) => {
    lines.push({ x1: left, y1: backwards ? y1 : y0, x2: left, y2: backwards ? y0 : y1, kind });
    labels.push({ x: left - 5, y: (y0 + y1) / 2, text, kind, rotate: true });
  };
  if (row) {
    horizontal('axis-main', reverse, `eje principal ${reverse ? '←' : '→'}`);
    vertical('axis-cross', reverseCross, 'eje cruzado');
  } else {
    vertical('axis-main', reverse, 'eje principal');
    horizontal('axis-cross', reverseCross, 'eje cruzado');
  }
  return { ...stageSize(level), gaps: [], lines, labels };
}

/** The guides for the player's board as it is now. */
export function readGuides(
  level: Level,
  player: HTMLElement,
  probe: HTMLElement,
  view: BoardView,
  enabled: boolean,
): Guides {
  if (!enabled) return NONE;
  const board = boardOf(player);
  if (!board) return NONE;
  const style = getComputedStyle(board);
  const flex = style.display.includes('flex');
  const grid = style.display.includes('grid');
  const open = isOpenBoard(level);
  if (level.world === 'flex' || (open && flex)) {
    return {
      drawing: flexDrawing(level, style, view),
      legend: 'flex',
      notice: !flex && !level.hideNotice,
    };
  }
  if (open && !grid) return NONE;
  if (!grid) return { drawing: null, legend: 'grid', notice: !level.hideNotice };
  return {
    drawing: gridDrawing(level, board, boardOf(probe), view),
    legend: 'grid',
    notice: false,
  };
}
