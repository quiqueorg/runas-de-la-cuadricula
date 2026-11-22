/** Map canvases. Callers choose what is visible; this only draws the given scene. */
import { cachedPath, frameOf } from '../../shared/canvas/surface';
import type { WorldId } from '../../core/models';
import type { TrailKind, TrailSpan } from './geometry';

export interface Ink {
  readonly fill: string | null;
  readonly stroke: string | null;
  readonly width: number;
  readonly cap: CanvasLineCap;
  readonly join: CanvasLineJoin;
}

export type Mark =
  | { readonly t: 'path'; readonly d: string; readonly ink: Ink }
  | { readonly t: 'circle'; readonly cx: number; readonly cy: number; readonly r: number; readonly ink: Ink }
  | { readonly t: 'ellipse'; readonly cx: number; readonly cy: number; readonly rx: number; readonly ry: number; readonly ink: Ink }
  | { readonly t: 'rect'; readonly x: number; readonly y: number; readonly w: number; readonly h: number; readonly rx: number; readonly ink: Ink };

export function paintMark(ctx: CanvasRenderingContext2D, mark: Mark): void {
  ctx.beginPath();
  if (mark.t === 'path') {
    const path = cachedPath(mark.d);
    if (mark.ink.fill) { ctx.fillStyle = mark.ink.fill; ctx.fill(path); }
    if (mark.ink.stroke) {
      ctx.strokeStyle = mark.ink.stroke;
      ctx.lineWidth = mark.ink.width;
      ctx.lineCap = mark.ink.cap;
      ctx.lineJoin = mark.ink.join;
      ctx.stroke(path);
    }
    return;
  }
  if (mark.t === 'circle') ctx.arc(mark.cx, mark.cy, mark.r, 0, Math.PI * 2);
  else if (mark.t === 'ellipse') ctx.ellipse(mark.cx, mark.cy, mark.rx, mark.ry, 0, 0, Math.PI * 2);
  else if (mark.rx) ctx.roundRect(mark.x, mark.y, mark.w, mark.h, mark.rx);
  else ctx.rect(mark.x, mark.y, mark.w, mark.h);
  if (mark.ink.fill) { ctx.fillStyle = mark.ink.fill; ctx.fill(); }
  if (mark.ink.stroke) {
    ctx.strokeStyle = mark.ink.stroke;
    ctx.lineWidth = mark.ink.width;
    ctx.lineCap = mark.ink.cap;
    ctx.lineJoin = mark.ink.join;
    ctx.stroke();
  }
}

export function paintBolt(ctx: CanvasRenderingContext2D): void {
  const path = cachedPath('M12 0 3 18h7l-5 22 13-26h-7l5-14z');
  ctx.fillStyle = '#fffbe8';
  ctx.strokeStyle = '#c8b8ff';
  ctx.lineWidth = 1.4;
  ctx.shadowColor = '#a890ff';
  ctx.shadowBlur = 8;
  ctx.fill(path);
  ctx.shadowBlur = 0;
  ctx.stroke(path);
}

export function paintSpout(ctx: CanvasRenderingContext2D): void {
  ctx.strokeStyle = '#eef9fb';
  ctx.fillStyle = '#eef9fb';
  ctx.lineWidth = 3.4;
  ctx.lineCap = 'round';
  for (const d of ['M20 46C19 30 10 22 4 17', 'M20 46V6', 'M20 46C21 30 30 22 36 17']) {
    ctx.beginPath();
    ctx.stroke(cachedPath(d));
  }
  for (const [x, y, r] of [[4, 15, 2.4], [36, 15, 2.4], [20, 4, 3]] as const) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function paintFish(ctx: CanvasRenderingContext2D): void {
  miniature(ctx, 'M1 6Q6 1 10 2L13 .8 14 3Q17 4 18 5L23 2 22 6 23 10 18 7Q9 14 1 7Z', '#d68854');
  miniature(ctx, 'M4 7Q10 9 16 6Q10 12 4 7Z', '#f7d79a', false);
  miniature(ctx, 'M6 4.3a.95 .95 0 1 0 .01 0Z', '#382a28', false);
}

function miniature(ctx: CanvasRenderingContext2D, d: string, fill: string, outline = true): void {
  const path = cachedPath(d);
  ctx.fillStyle = fill;
  ctx.fill(path);
  if (!outline) return;
  ctx.strokeStyle = '#443436';
  ctx.lineWidth = 1.3;
  ctx.lineJoin = 'round';
  ctx.stroke(path);
}

export function paintAirship(ctx: CanvasRenderingContext2D): void {
  miniature(ctx, 'M38 16L55 5 52 18 58 24 40 22Z', '#aa5447');
  miniature(ctx, 'M5 18C8 5 32 2 46 13Q53 18 45 23C32 32 9 30 5 18Z', '#ddbb80');
  miniature(ctx, 'M7 19Q23 25 47 18Q38 28 22 27Q12 26 7 19Z', '#a77752', false);
  miniature(ctx, 'M12 14Q22 6 36 10Q24 10 13 16Z', '#ffebba', false);
  ctx.strokeStyle = '#7f5944';
  ctx.lineWidth = 1.2;
  ctx.stroke(cachedPath('M20 8Q16 18 21 27L23 32M34 9Q38 18 33 26L31 32'));
  miniature(ctx, 'M18 31Q27 33 36 30L33 36Q26 39 21 36Z', '#795448');
  miniature(ctx, 'M22 32H32L31 34H23Z', '#ffd580', false);
}

export function paintMinecart(ctx: CanvasRenderingContext2D): void {
  miniature(ctx, 'M4 7L8 3 13 4 16 1 21 3 24 7Z', '#758582');
  miniature(ctx, 'M12 6L16 1 18 5Z', '#bed4bc', false);
  miniature(ctx, 'M2 6H26L22 15H6Z', '#996442');
  miniature(ctx, 'M3 6H25L24.5 8H3.5Z', '#e0bc7c', false);
  miniature(ctx, 'M7 10H22L21 13H8Z', '#745346', false);
  for (const x of [8, 20]) {
    ctx.beginPath();
    ctx.arc(x, 16, 2.8, 0, Math.PI * 2);
    ctx.fillStyle = '#473935';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x - .4, 15.6, 1, 0, Math.PI * 2);
    ctx.fillStyle = '#c6ac80';
    ctx.fill();
  }
}

export function paintBlades(ctx: CanvasRenderingContext2D): void {
  ctx.translate(20, 20);
  for (let arm = 0; arm < 4; arm++) {
    miniature(ctx, 'M0 0L-2 -18 3 -18 4 -7 1 -5Z', '#ddc99b');
    miniature(ctx, 'M0 -17H2L2.8 -8 1 -7Z', '#fbefd1', false);
    ctx.rotate(Math.PI / 2);
  }
  ctx.beginPath();
  ctx.arc(0, 0, 2.4, 0, Math.PI * 2);
  ctx.fillStyle = '#7a5230';
  ctx.fill();
  ctx.lineWidth = 0.8;
  ctx.stroke();
}

export function paintRunes(ctx: CanvasRenderingContext2D, time: number): void {
  ctx.translate(100, 100);
  ctx.strokeStyle = 'rgba(255,220,130,.55)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(0, 0, 92, 0, Math.PI * 2);
  ctx.stroke();
  ctx.save();
  ctx.rotate(-time * Math.PI * 2 / 40);
  ctx.setLineDash([6, 10]);
  ctx.strokeStyle = 'rgba(200,150,255,.5)';
  ctx.beginPath();
  ctx.arc(0, 0, 78, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  ctx.rotate(time * Math.PI * 2 / 28);
  ctx.strokeStyle = '#ffe6a0';
  ctx.lineWidth = 1.6;
  ctx.setLineDash([]);
  for (let mark = 0; mark < 12; mark += 1) {
    ctx.save();
    ctx.rotate((mark * 30 * Math.PI) / 180);
    ctx.translate(0, -85);
    ctx.stroke(cachedPath('M-4 4L0-5 4 4M-2 0h4'));
    ctx.restore();
  }
}

export interface FlowPath {
  readonly d: readonly (readonly number[])[];
  readonly dash: number[];
  readonly color: string;
  readonly width: number;
  readonly speed: number;
}

export function paintFlows(ctx: CanvasRenderingContext2D, paths: readonly FlowPath[], width: number, height: number, elapsed: number): void {
  for (const path of paths) {
    ctx.beginPath();
    path.d.forEach((point, index) => {
      const x = (point[0] ?? 0) * width;
      const y = (point[1] ?? 0) * height;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = path.color;
    ctx.lineWidth = path.width;
    ctx.lineCap = 'round';
    ctx.setLineDash(path.dash);
    ctx.lineDashOffset = -elapsed * path.speed;
    ctx.stroke();
  }
}

function trailInk(world: WorldId, kind: TrailKind): { stroke: string; width: number; dash: readonly number[]; alpha: number; speed: number } {
  if (kind === 'flight') return { stroke: '#fff', width: 3, dash: [1, 10], alpha: 0.95, speed: 9.5 / 1.4 };
  const stroke = world === 'flex' ? '#ffcf6a' : world === 'cielo' ? '#7a3412' : world === 'base' ? '#6b2a12' : '#8a2e14';
  if (kind === 'upcoming') return { stroke, width: 2.6, dash: [0.5, 9], alpha: 0.55, speed: 9.5 / 1.1 };
  return { stroke, width: 3.4, dash: [0.5, 8], alpha: 0.9, speed: 0 };
}

export function paintTrail(ctx: CanvasRenderingContext2D, world: WorldId, spans: readonly TrailSpan[], width: number, height: number, elapsed: number): void {
  for (const span of spans) {
    const paint = trailInk(world, span.kind);
    ctx.beginPath();
    span.points.forEach((point, index) => {
      const x = point.x * width;
      const y = point.y * height;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = paint.stroke;
    ctx.globalAlpha = paint.alpha;
    ctx.lineWidth = paint.width;
    ctx.lineCap = 'round';
    ctx.setLineDash([...paint.dash]);
    ctx.lineDashOffset = paint.speed ? -elapsed * paint.speed : 0;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

export function paintFlowCanvas(canvas: HTMLCanvasElement, paths: readonly FlowPath[], elapsed: number): void {
  const surface = frameOf(canvas);
  if (!surface) return;
  paintFlows(surface.ctx, paths, surface.width, surface.height, elapsed);
}

export function paintSketch(canvas: HTMLCanvasElement, boxW: number, boxH: number, draw: (ctx: CanvasRenderingContext2D, time: number) => void, time: number): void {
  const surface = frameOf(canvas);
  if (!surface) return;
  const scale = Math.min(surface.width / boxW, surface.height / boxH);
  const ctx = surface.ctx;
  ctx.save();
  ctx.translate((surface.width - boxW * scale) / 2, (surface.height - boxH * scale) / 2);
  ctx.scale(scale, scale);
  draw(ctx, time);
  ctx.restore();
}

export function paintMarkCanvas(canvas: HTMLCanvasElement, frame: { readonly x: number; readonly y: number; readonly w: number; readonly h: number }, marks: readonly Mark[]): void {
  const surface = frameOf(canvas);
  if (!surface) return;
  const scale = Math.min(surface.width / frame.w, surface.height / frame.h);
  const ctx = surface.ctx;
  ctx.save();
  ctx.scale(scale, scale);
  ctx.translate(-frame.x, -frame.y);
  for (const mark of marks) paintMark(ctx, mark);
  ctx.restore();
}

export function paintTrailCanvas(canvas: HTMLCanvasElement, world: WorldId, spans: readonly TrailSpan[], elapsed: number): void {
  const surface = frameOf(canvas);
  if (!surface) return;
  paintTrail(surface.ctx, world, spans, surface.width, surface.height, elapsed);
}
