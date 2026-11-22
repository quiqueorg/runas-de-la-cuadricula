/** Paints a sprite symbol with Canvas 2D. Strokes stay in the symbol's viewBox, matching the old vectors. */
import { cachedPath } from '../canvas/surface';
import { symbolOf } from './registry';
import type { DrawOp, Paint } from './symbols';

interface ResolvedPaint {
  fill: string | null;
  stroke: string | null;
  strokeWidth: number;
  lineCap: CanvasLineCap;
  lineJoin: CanvasLineJoin;
  fillOpacity: number;
  opacity: number;
  dash: readonly number[];
}

const ROOT_PAINT: ResolvedPaint = {
  fill: '#000',
  stroke: null,
  strokeWidth: 1,
  lineCap: 'butt',
  lineJoin: 'miter',
  fillOpacity: 1,
  opacity: 1,
  dash: [],
};

function cssColor(value: string, current: string): string {
  return value === 'currentColor' ? current : value;
}

function mergePaint(parent: ResolvedPaint, paint: Paint, current: string): ResolvedPaint {
  const fill = paint.fill === undefined ? parent.fill : paint.fill === 'none' ? null : cssColor(paint.fill, current);
  const stroke = paint.stroke === undefined ? parent.stroke : paint.stroke === 'none' ? null : cssColor(paint.stroke, current);
  return {
    fill,
    stroke,
    strokeWidth: paint.strokeWidth ?? parent.strokeWidth,
    lineCap: paint.lineCap ?? parent.lineCap,
    lineJoin: paint.lineJoin ?? parent.lineJoin,
    fillOpacity: paint.fillOpacity ?? parent.fillOpacity,
    opacity: paint.opacity ?? 1,
    dash: paint.dash ?? parent.dash,
  };
}

function applyTransform(ctx: CanvasRenderingContext2D, transform: string | undefined): void {
  if (!transform) return;
  for (const match of transform.matchAll(/([a-z]+)\(([^)]*)\)/g)) {
    const name = match[1] ?? '';
    const args = (match[2] ?? '').split(/[\s,]+/).filter(Boolean).map(Number);
    if (name === 'rotate') {
      const degrees = args[0] ?? 0;
      const cx = args[1];
      const cy = args[2];
      if (cx !== undefined && cy !== undefined) {
        ctx.translate(cx, cy);
        ctx.rotate((degrees * Math.PI) / 180);
        ctx.translate(-cx, -cy);
      } else ctx.rotate((degrees * Math.PI) / 180);
    } else if (name === 'translate') ctx.translate(args[0] ?? 0, args[1] ?? 0);
    else if (name === 'scale') ctx.scale(args[0] ?? 1, args[1] ?? args[0] ?? 1);
  }
}

function trace(ctx: CanvasRenderingContext2D, op: DrawOp): void {
  if (op.t === 'path') ctx.fill(cachedPath(op.d));
  else if (op.t === 'circle') {
    ctx.beginPath();
    ctx.arc(op.cx, op.cy, op.r, 0, Math.PI * 2);
  } else if (op.t === 'ellipse') {
    ctx.beginPath();
    ctx.ellipse(op.cx, op.cy, op.rx, op.ry, 0, 0, Math.PI * 2);
  } else if (op.t === 'rect') {
    ctx.beginPath();
    if (op.rx) ctx.roundRect(op.x, op.y, op.w, op.h, op.rx);
    else ctx.rect(op.x, op.y, op.w, op.h);
  }
}

function paintShape(ctx: CanvasRenderingContext2D, op: DrawOp, paint: ResolvedPaint): void {
  if (op.t === 'text') {
    ctx.globalAlpha *= paint.opacity;
    ctx.fillStyle = paint.fill ?? '#000';
    ctx.font = `${op.size}px ${op.family}`;
    ctx.textAlign = op.anchor === 'middle' ? 'center' : op.anchor === 'end' ? 'right' : 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(op.text, op.x, op.y + op.dy);
    return;
  }
  if (op.t !== 'path' && op.t !== 'circle' && op.t !== 'ellipse' && op.t !== 'rect') return;
  ctx.lineWidth = paint.strokeWidth;
  ctx.lineCap = paint.lineCap;
  ctx.lineJoin = paint.lineJoin;
  ctx.setLineDash([...paint.dash]);
  ctx.globalAlpha *= paint.opacity;
  if (op.t === 'path') {
    const path = cachedPath(op.d);
    if (paint.fill) {
      ctx.globalAlpha *= paint.fillOpacity;
      ctx.fillStyle = paint.fill;
      ctx.fill(path);
      ctx.globalAlpha /= paint.fillOpacity || 1;
    }
    if (paint.stroke) {
      ctx.strokeStyle = paint.stroke;
      ctx.stroke(path);
    }
    return;
  }
  trace(ctx, op);
  if (paint.fill) {
    ctx.save();
    ctx.globalAlpha *= paint.fillOpacity;
    ctx.fillStyle = paint.fill;
    ctx.fill();
    ctx.restore();
  }
  if (paint.stroke) {
    ctx.strokeStyle = paint.stroke;
    ctx.stroke();
  }
}

function drawOps(ctx: CanvasRenderingContext2D, ops: readonly DrawOp[], parent: ResolvedPaint, current: string, stack: ReadonlySet<string>): void {
  for (const op of ops) {
    ctx.save();
    applyTransform(ctx, op.transform);
    const paint = mergePaint(parent, op.paint, current);
    if (op.t === 'g') drawOps(ctx, op.ops, paint, current, stack);
    else if (op.t === 'use') {
      const art = symbolOf(op.id);
      if (art && !stack.has(op.id)) {
        const next = new Set(stack);
        next.add(op.id);
        ctx.translate(-art.x, -art.y);
        drawOps(ctx, art.ops, paint, current, next);
      }
    } else paintShape(ctx, op, paint);
    ctx.restore();
  }
}

export function drawSymbol(ctx: CanvasRenderingContext2D, id: string, width: number, height: number, current: string): void {
  const art = symbolOf(id);
  if (!art || width < 1 || height < 1) return;
  const scale = Math.min(width / art.w, height / art.h);
  ctx.save();
  ctx.translate((width - art.w * scale) / 2, (height - art.h * scale) / 2);
  ctx.scale(scale, scale);
  ctx.translate(-art.x, -art.y);
  drawOps(ctx, art.ops, ROOT_PAINT, current, new Set([id]));
  ctx.restore();
}
