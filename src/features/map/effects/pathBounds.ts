/**
 * The bounding box of SVG path data, so a figure's canvas can be sized to what it draws. Handles the
 * commands the map's figures use (M, L, H, V, C, Q, Z, absolute and relative); curves are sampled.
 */
import type { Box } from './marks';

const CURVE_SAMPLES = 16;
const TOKEN = /[a-zA-Z]|-?\d*\.?\d+(?:e[-+]?\d+)?/g;
const COMMAND = /[a-zA-Z]/;
/** Numbers each command reads. Unknown commands skip their numbers one by one. */
const ARGUMENTS: Readonly<Record<string, number>> = { m: 2, l: 2, h: 1, v: 1, c: 6, q: 4 };
/** An empty path still gets a box, so its canvas is not zero-sized. */
const EMPTY_BOX: Box = { x: 0, y: 0, width: 1, height: 1 };
const MIN_SIDE = 0.1;

type Point = readonly [number, number];

interface Extent {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

interface Pen {
  x: number;
  y: number;
  /** Where the current subpath started, for Z. */
  startX: number;
  startY: number;
}

function include(extent: Extent, x: number, y: number): void {
  extent.minX = Math.min(extent.minX, x);
  extent.minY = Math.min(extent.minY, y);
  extent.maxX = Math.max(extent.maxX, x);
  extent.maxY = Math.max(extent.maxY, y);
}

/** Samples a Bézier from the pen: two control points for a cubic, one for a quadratic. */
function includeCurve(extent: Extent, pen: Pen, controls: readonly Point[], end: Point): void {
  const [first = end, second = end] = controls;
  const cubic = controls.length === 2;
  for (let step = 0; step <= CURVE_SAMPLES; step += 1) {
    const t = step / CURVE_SAMPLES;
    const u = 1 - t;
    const x = cubic
      ? u * u * u * pen.x +
        3 * u * u * t * first[0] +
        3 * u * t * t * second[0] +
        t * t * t * end[0]
      : u * u * pen.x + 2 * u * t * first[0] + t * t * end[0];
    const y = cubic
      ? u * u * u * pen.y +
        3 * u * u * t * first[1] +
        3 * u * t * t * second[1] +
        t * t * t * end[1]
      : u * u * pen.y + 2 * u * t * first[1] + t * t * end[1];
    include(extent, x, y);
  }
}

/** The `index`-th coordinate pair of a command, made absolute. */
function pairAt(numbers: readonly number[], index: number, pen: Pen, relative: boolean): Point {
  const x = numbers[index] ?? 0;
  const y = numbers[index + 1] ?? 0;
  return relative ? [pen.x + x, pen.y + y] : [x, y];
}

function drawCurve(
  kind: string,
  numbers: readonly number[],
  pen: Pen,
  extent: Extent,
  relative: boolean,
): void {
  const cubic = kind === 'c';
  const controls = cubic
    ? [pairAt(numbers, 0, pen, relative), pairAt(numbers, 2, pen, relative)]
    : [pairAt(numbers, 0, pen, relative)];
  const end = pairAt(numbers, cubic ? 4 : 2, pen, relative);
  includeCurve(extent, pen, controls, end);
  [pen.x, pen.y] = end;
}

function drawStraight(kind: string, numbers: readonly number[], pen: Pen, relative: boolean): void {
  const value = numbers[0] ?? 0;
  if (kind === 'h') pen.x = relative ? pen.x + value : value;
  else if (kind === 'v') pen.y = relative ? pen.y + value : value;
  else [pen.x, pen.y] = pairAt(numbers, 0, pen, relative);
}

/** Moves the pen for one command and its numbers. @returns the command that implicitly follows. */
function draw(command: string, numbers: readonly number[], pen: Pen, extent: Extent): string {
  const kind = command.toLowerCase();
  const relative = command === kind;
  if (kind === 'c' || kind === 'q') {
    drawCurve(kind, numbers, pen, extent, relative);
    return command;
  }
  drawStraight(kind, numbers, pen, relative);
  include(extent, pen.x, pen.y);
  if (kind !== 'm') return command;
  pen.startX = pen.x;
  pen.startY = pen.y;
  // Pairs after a moveto are linetos.
  return relative ? 'l' : 'L';
}

export function pathBounds(data: string, pad: number): Box {
  const tokens = data.match(TOKEN) ?? [];
  const extent: Extent = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  const pen: Pen = { x: 0, y: 0, startX: 0, startY: 0 };
  let command = '';
  let index = 0;
  while (index < tokens.length) {
    const token = tokens[index] ?? '';
    if (COMMAND.test(token)) {
      command = token;
      index += 1;
      if (command === 'Z' || command === 'z') {
        pen.x = pen.startX;
        pen.y = pen.startY;
      }
      continue;
    }
    const count = ARGUMENTS[command.toLowerCase()];
    if (!count) {
      index += 1;
      continue;
    }
    const numbers = tokens.slice(index, index + count).map(Number);
    index += count;
    command = draw(command, numbers, pen, extent);
  }
  if (!Number.isFinite(extent.minX)) return EMPTY_BOX;
  return {
    x: extent.minX - pad,
    y: extent.minY - pad,
    width: Math.max(MIN_SIDE, extent.maxX - extent.minX + pad * 2),
    height: Math.max(MIN_SIDE, extent.maxY - extent.minY + pad * 2),
  };
}
