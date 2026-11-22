/** Lesson canvases: guides and the architect's plan. */
import { frameOf, paintLayout } from '../../shared/canvas/surface';
import { drawSymbol } from '../../shared/icons/paint';
import type { BlueprintView, GuideDrawing, GuideKind, LabelKind } from './engine';

const LINE: Record<GuideKind, { stroke: string; width: number; dash: number[] }> = {
  shadow: { stroke: 'rgba(10,16,18,.38)', width: 3.4, dash: [6, 4] },
  main: { stroke: 'rgba(250,244,228,.8)', width: 1.3, dash: [6, 4] },
  'shadow-implicit': { stroke: 'rgba(10,16,18,.38)', width: 3.4, dash: [1.5, 4.5] },
  implicit: { stroke: 'rgba(242,234,214,.42)', width: 1.3, dash: [1.5, 4.5] },
  'axis-main': { stroke: '#72f2e0', width: 2.4, dash: [] },
  'axis-cross': { stroke: '#f0c45a', width: 2, dash: [6, 5] },
};

function stripePattern(ctx: CanvasRenderingContext2D): CanvasPattern | null {
  const tile = document.createElement('canvas');
  tile.width = 6;
  tile.height = 6;
  const pen = tile.getContext('2d');
  if (!pen) return null;
  pen.fillStyle = 'rgba(114,242,224,.05)';
  pen.fillRect(0, 0, 6, 6);
  pen.fillStyle = 'rgba(114,242,224,.3)';
  pen.fillRect(0, 0, 2, 6);
  const pattern = ctx.createPattern(tile, 'repeat');
  if (pattern) pattern.setTransform(new DOMMatrix().rotate(45));
  return pattern;
}

function labelColor(kind: LabelKind, gold: string, accent: string): string {
  if (kind === 'negative') return gold;
  if (kind === 'implicit') return 'rgba(246,239,221,.55)';
  if (kind === 'axis-main') return accent;
  if (kind === 'axis-cross') return '#f0c45a';
  return '#f6efdd';
}

export function paintGuides(canvas: HTMLCanvasElement, drawing: GuideDrawing): void {
  const ctx = paintLayout(canvas, drawing.width, drawing.height);
  if (!ctx) return;
  const style = getComputedStyle(canvas);
  const gold = style.getPropertyValue('--gold').trim() || '#dcc38a';
  const accent = style.getPropertyValue('--accent').trim() || '#72f2e0';
  const stripes = stripePattern(ctx);
  if (stripes) {
    ctx.fillStyle = stripes;
    for (const gap of drawing.gaps) ctx.fillRect(gap.x, gap.y, gap.w, gap.h);
  }
  for (const line of drawing.lines) {
    const ink = LINE[line.kind];
    ctx.beginPath();
    ctx.moveTo(line.x1, line.y1);
    ctx.lineTo(line.x2, line.y2);
    ctx.strokeStyle = line.kind === 'axis-main' ? accent : ink.stroke;
    ctx.lineWidth = ink.width;
    ctx.setLineDash(ink.dash);
    ctx.lineCap = 'butt';
    ctx.stroke();
    if (line.kind === 'axis-main' || line.kind === 'axis-cross') {
      const angle = Math.atan2(line.y2 - line.y1, line.x2 - line.x1);
      ctx.save();
      ctx.translate(line.x2, line.y2);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-8, -3.5);
      ctx.lineTo(-8, 3.5);
      ctx.closePath();
      ctx.fillStyle = line.kind === 'axis-main' ? accent : '#f0c45a';
      ctx.fill();
      ctx.restore();
    }
  }
  ctx.setLineDash([]);
  ctx.lineJoin = 'round';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const label of drawing.labels) {
    ctx.save();
    ctx.translate(label.x, label.y);
    if (label.rotate) ctx.rotate(-Math.PI / 2);
    const axis = label.kind === 'axis-main' || label.kind === 'axis-cross';
    ctx.font = axis ? '600 12px Alegreya Sans, sans-serif' : '600 11.5px "JetBrains Mono", monospace';
    ctx.lineWidth = axis ? 0 : 3.5;
    ctx.strokeStyle = 'rgba(6,10,12,.92)';
    if (!axis) ctx.strokeText(label.text, 0, 0);
    ctx.fillStyle = labelColor(label.kind, gold, accent);
    ctx.fillText(label.text, 0, 0);
    ctx.restore();
  }
}

export function paintPlan(canvas: HTMLCanvasElement, view: BlueprintView): void {
  const pad = 6;
  const boxW = view.boardW + pad * 2;
  const boxH = view.boardH + pad * 2;
  const frame = frameOf(canvas);
  if (!frame) return;
  const scale = Math.min(frame.width / boxW, frame.height / boxH);
  const ctx = frame.ctx;
  const color = getComputedStyle(canvas).color;
  ctx.save();
  ctx.translate((frame.width - boxW * scale) / 2, (frame.height - boxH * scale) / 2);
  ctx.scale(scale, scale);
  ctx.translate(pad, pad);
  ctx.beginPath();
  ctx.roundRect(0, 0, view.boardW, view.boardH, 6);
  ctx.fillStyle = 'rgba(90,58,30,.06)';
  ctx.fill();
  ctx.strokeStyle = '#5a3a1e';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([8, 5]);
  ctx.stroke();
  for (const piece of view.pieces) {
    if (!piece.w && !piece.h) continue;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(piece.x, piece.y, piece.w, piece.h, 6);
    ctx.fillStyle = piece.color || (piece.fixed ? 'rgba(60,110,140,.22)' : 'rgba(255,250,236,.75)');
    ctx.globalAlpha = piece.color ? 0.75 : 1;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.setLineDash(piece.fixed ? [4, 4] : []);
    ctx.strokeStyle = piece.fixed ? '#3a5a70' : '#5a3a1e';
    ctx.lineWidth = piece.fixed ? 1.5 : 2.5;
    ctx.stroke();
    const size = Math.min(30, piece.w * 0.6, piece.h * 0.5);
    if (piece.icon && size > 1) {
      const cx = piece.x + piece.w / 2;
      const cy = piece.y + piece.h / 2;
      ctx.save();
      ctx.translate(cx - size / 2, cy - size / 2 - (piece.label ? 7 : 0));
      drawSymbol(ctx, `i-${piece.icon}`, size, size, color);
      ctx.restore();
    }
    if (piece.label) {
      ctx.fillStyle = '#5a3a1e';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(piece.label, piece.x + piece.w / 2, piece.y + piece.h / 2 + size / 2 + 6);
    }
    ctx.restore();
  }
  ctx.restore();
}
