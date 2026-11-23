/** Vector figures as data (paths and simple shapes), and their painting on a canvas. */
import { cachedPath, frameOf } from '../../../shared/canvas/surface';

/** A rectangle in a figure's own drawing units. */
export interface Box {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface Ink {
  readonly fill: string | null;
  readonly stroke: string | null;
  readonly width: number;
  readonly cap: CanvasLineCap;
  readonly join: CanvasLineJoin;
}

export type Mark =
  | { readonly shape: 'path'; readonly path: string; readonly ink: Ink }
  | {
      readonly shape: 'circle';
      readonly centerX: number;
      readonly centerY: number;
      readonly radius: number;
      readonly ink: Ink;
    }
  | {
      readonly shape: 'ellipse';
      readonly centerX: number;
      readonly centerY: number;
      readonly radiusX: number;
      readonly radiusY: number;
      readonly ink: Ink;
    }
  | {
      readonly shape: 'rect';
      readonly box: Box;
      readonly cornerRadius: number;
      readonly ink: Ink;
    };

export function ink(
  fill: string | null,
  stroke: string | null,
  width: number,
  cap: CanvasLineCap = 'butt',
  join: CanvasLineJoin = 'miter',
): Ink {
  return { fill, stroke, width, cap, join };
}

export const pathMark = (path: string, markInk: Ink): Mark => ({
  shape: 'path',
  path,
  ink: markInk,
});

export const circleMark = (
  centerX: number,
  centerY: number,
  radius: number,
  markInk: Ink,
): Mark => ({
  shape: 'circle',
  centerX,
  centerY,
  radius,
  ink: markInk,
});

export const ellipseMark = (
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
  markInk: Ink,
): Mark => ({ shape: 'ellipse', centerX, centerY, radiusX, radiusY, ink: markInk });

export const rectMark = (box: Box, cornerRadius: number, markInk: Ink): Mark => ({
  shape: 'rect',
  box,
  cornerRadius,
  ink: markInk,
});

function applyStroke(ctx: CanvasRenderingContext2D, stroke: string, markInk: Ink): void {
  ctx.strokeStyle = stroke;
  ctx.lineWidth = markInk.width;
  ctx.lineCap = markInk.cap;
  ctx.lineJoin = markInk.join;
}

function paintPath(ctx: CanvasRenderingContext2D, data: string, markInk: Ink): void {
  const path = cachedPath(data);
  if (markInk.fill) {
    ctx.fillStyle = markInk.fill;
    ctx.fill(path);
  }
  if (markInk.stroke) {
    applyStroke(ctx, markInk.stroke, markInk);
    ctx.stroke(path);
  }
}

function traceShape(ctx: CanvasRenderingContext2D, mark: Exclude<Mark, { shape: 'path' }>): void {
  if (mark.shape === 'circle') {
    ctx.arc(mark.centerX, mark.centerY, mark.radius, 0, Math.PI * 2);
  } else if (mark.shape === 'ellipse') {
    ctx.ellipse(mark.centerX, mark.centerY, mark.radiusX, mark.radiusY, 0, 0, Math.PI * 2);
  } else if (mark.cornerRadius) {
    ctx.roundRect(mark.box.x, mark.box.y, mark.box.width, mark.box.height, mark.cornerRadius);
  } else {
    ctx.rect(mark.box.x, mark.box.y, mark.box.width, mark.box.height);
  }
}

function paintMark(ctx: CanvasRenderingContext2D, mark: Mark): void {
  ctx.beginPath();
  if (mark.shape === 'path') {
    paintPath(ctx, mark.path, mark.ink);
    return;
  }
  traceShape(ctx, mark);
  if (mark.ink.fill) {
    ctx.fillStyle = mark.ink.fill;
    ctx.fill();
  }
  if (mark.ink.stroke) {
    applyStroke(ctx, mark.ink.stroke, mark.ink);
    ctx.stroke();
  }
}

/** Paints the marks so that `frame` fills the canvas (keeping the aspect, from the top left). */
export function paintMarkCanvas(
  canvas: HTMLCanvasElement,
  frame: Box,
  marks: readonly Mark[],
): void {
  const surface = frameOf(canvas);
  if (!surface) return;
  const scale = Math.min(surface.width / frame.width, surface.height / frame.height);
  const ctx = surface.ctx;
  ctx.save();
  ctx.scale(scale, scale);
  ctx.translate(-frame.x, -frame.y);
  for (const mark of marks) paintMark(ctx, mark);
  ctx.restore();
}
