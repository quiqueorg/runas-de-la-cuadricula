/**
 * Painters for the map's small canvas sketches. Each draws in its own box of drawing units (the
 * `box` its `Sketch` is given); `paintSketch` fits that box into the canvas.
 */
import { cachedPath, frameOf } from '../../../shared/canvas/surface';

/** Draws in the sketch's own units; `seconds` is the time since it started, 0 for still ones. */
export type SketchPainter = (ctx: CanvasRenderingContext2D, seconds: number) => void;

/** Width and height of a sketch's drawing, in its own units. */
export type SketchBox = readonly [width: number, height: number];

const FULL_TURN = Math.PI * 2;
const OUTLINE = '#443436';

/** A filled shape, outlined in the miniatures' brown unless `outline` is false. */
function shape(ctx: CanvasRenderingContext2D, path: string, fill: string, outline = true): void {
  const shapePath = cachedPath(path);
  ctx.fillStyle = fill;
  ctx.fill(shapePath);
  if (!outline) return;
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 1.3;
  ctx.lineJoin = 'round';
  ctx.stroke(shapePath);
}

function dot(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number): void {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, FULL_TURN);
  ctx.fill();
}

export const BOLT_BOX: SketchBox = [20, 40];
export const paintBolt: SketchPainter = (ctx) => {
  const path = cachedPath('M12 0 3 18h7l-5 22 13-26h-7l5-14z');
  ctx.fillStyle = '#fffbe8';
  ctx.strokeStyle = '#c8b8ff';
  ctx.lineWidth = 1.4;
  ctx.shadowColor = '#a890ff';
  ctx.shadowBlur = 8;
  ctx.fill(path);
  ctx.shadowBlur = 0;
  ctx.stroke(path);
};

const SPOUT_JETS = ['M20 46C19 30 10 22 4 17', 'M20 46V6', 'M20 46C21 30 30 22 36 17'];
const SPOUT_DROPS = [
  [4, 15, 2.4],
  [36, 15, 2.4],
  [20, 4, 3],
] as const;

export const SPOUT_BOX: SketchBox = [40, 46];
/** The whale's spout. */
export const paintSpout: SketchPainter = (ctx) => {
  ctx.strokeStyle = '#eef9fb';
  ctx.fillStyle = '#eef9fb';
  ctx.lineWidth = 3.4;
  ctx.lineCap = 'round';
  for (const jet of SPOUT_JETS) {
    ctx.beginPath();
    ctx.stroke(cachedPath(jet));
  }
  for (const [x, y, radius] of SPOUT_DROPS) dot(ctx, x, y, radius);
};

export const FISH_BOX: SketchBox = [24, 12];
export const paintFish: SketchPainter = (ctx) => {
  shape(ctx, 'M1 6Q6 1 10 2L13 .8 14 3Q17 4 18 5L23 2 22 6 23 10 18 7Q9 14 1 7Z', '#d68854');
  shape(ctx, 'M4 7Q10 9 16 6Q10 12 4 7Z', '#f7d79a', false);
  shape(ctx, 'M6 4.3a.95 .95 0 1 0 .01 0Z', '#382a28', false);
};

export const AIRSHIP_BOX: SketchBox = [60, 40];
export const paintAirship: SketchPainter = (ctx) => {
  shape(ctx, 'M38 16L55 5 52 18 58 24 40 22Z', '#aa5447');
  shape(ctx, 'M5 18C8 5 32 2 46 13Q53 18 45 23C32 32 9 30 5 18Z', '#ddbb80');
  shape(ctx, 'M7 19Q23 25 47 18Q38 28 22 27Q12 26 7 19Z', '#a77752', false);
  shape(ctx, 'M12 14Q22 6 36 10Q24 10 13 16Z', '#ffebba', false);
  ctx.strokeStyle = '#7f5944';
  ctx.lineWidth = 1.2;
  ctx.stroke(cachedPath('M20 8Q16 18 21 27L23 32M34 9Q38 18 33 26L31 32'));
  shape(ctx, 'M18 31Q27 33 36 30L33 36Q26 39 21 36Z', '#795448');
  shape(ctx, 'M22 32H32L31 34H23Z', '#ffd580', false);
};

const MINECART_WHEELS = [8, 20];

export const MINECART_BOX: SketchBox = [28, 20];
export const paintMinecart: SketchPainter = (ctx) => {
  shape(ctx, 'M4 7L8 3 13 4 16 1 21 3 24 7Z', '#758582');
  shape(ctx, 'M12 6L16 1 18 5Z', '#bed4bc', false);
  shape(ctx, 'M2 6H26L22 15H6Z', '#996442');
  shape(ctx, 'M3 6H25L24.5 8H3.5Z', '#e0bc7c', false);
  shape(ctx, 'M7 10H22L21 13H8Z', '#745346', false);
  for (const x of MINECART_WHEELS) {
    ctx.fillStyle = '#473935';
    dot(ctx, x, 16, 2.8);
    ctx.fillStyle = '#c6ac80';
    dot(ctx, x - 0.4, 15.6, 1);
  }
};

export const PAPER_BOAT_BOX: SketchBox = [20, 14];
export const paintPaperBoat: SketchPainter = (ctx) => {
  shape(ctx, 'M10 1 15 8H5Z', '#f1e6cc');
  shape(ctx, 'M1 8H19L15 13H5Z', '#fffaf0');
  ctx.strokeStyle = '#8a7a5a';
  ctx.lineWidth = 0.7;
  ctx.stroke(cachedPath('M10 1V8M5 13 10 8 15 13'));
};

const BLADE_COUNT = 4;

export const BLADES_BOX: SketchBox = [40, 40];
/** A windmill's sails; CSS turns the canvas. */
export const paintBlades: SketchPainter = (ctx) => {
  ctx.translate(BLADES_BOX[0] / 2, BLADES_BOX[1] / 2);
  for (let blade = 0; blade < BLADE_COUNT; blade++) {
    shape(ctx, 'M0 0L-2 -18 3 -18 4 -7 1 -5Z', '#ddc99b');
    shape(ctx, 'M0 -17H2L2.8 -8 1 -7Z', '#fbefd1', false);
    ctx.rotate(FULL_TURN / BLADE_COUNT);
  }
  ctx.fillStyle = '#7a5230';
  dot(ctx, 0, 0, 2.4);
  ctx.lineWidth = 0.8;
  ctx.stroke();
};

const RUNE_CIRCLE = {
  outerRadius: 92,
  dashedRadius: 78,
  glyphRadius: 85,
  glyphCount: 12,
  /** Seconds per turn: the dashed ring turns back, the glyphs forward. */
  dashedTurn: 40,
  glyphTurn: 28,
} as const;

export const RUNE_CIRCLE_BOX: SketchBox = [200, 200];
/** The summoning circle in the caverns: two rings and a band of glyphs turning against each other. */
export const paintRuneCircle: SketchPainter = (ctx, seconds) => {
  ctx.translate(RUNE_CIRCLE_BOX[0] / 2, RUNE_CIRCLE_BOX[1] / 2);
  ctx.strokeStyle = 'rgba(255,220,130,.55)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(0, 0, RUNE_CIRCLE.outerRadius, 0, FULL_TURN);
  ctx.stroke();
  ctx.save();
  ctx.rotate((-seconds * FULL_TURN) / RUNE_CIRCLE.dashedTurn);
  ctx.setLineDash([6, 10]);
  ctx.strokeStyle = 'rgba(200,150,255,.5)';
  ctx.beginPath();
  ctx.arc(0, 0, RUNE_CIRCLE.dashedRadius, 0, FULL_TURN);
  ctx.stroke();
  ctx.restore();
  ctx.rotate((seconds * FULL_TURN) / RUNE_CIRCLE.glyphTurn);
  ctx.strokeStyle = '#ffe6a0';
  ctx.lineWidth = 1.6;
  ctx.setLineDash([]);
  for (let glyph = 0; glyph < RUNE_CIRCLE.glyphCount; glyph += 1) {
    ctx.save();
    ctx.rotate((glyph * FULL_TURN) / RUNE_CIRCLE.glyphCount);
    ctx.translate(0, -RUNE_CIRCLE.glyphRadius);
    ctx.stroke(cachedPath('M-4 4L0-5 4 4M-2 0h4'));
    ctx.restore();
  }
};

/** Fits the sketch's box into the canvas, centred, and paints it. */
export function paintSketch(
  canvas: HTMLCanvasElement,
  [boxWidth, boxHeight]: SketchBox,
  paint: SketchPainter,
  seconds: number,
): void {
  const surface = frameOf(canvas);
  if (!surface) return;
  const scale = Math.min(surface.width / boxWidth, surface.height / boxHeight);
  const ctx = surface.ctx;
  ctx.save();
  ctx.translate((surface.width - boxWidth * scale) / 2, (surface.height - boxHeight * scale) / 2);
  ctx.scale(scale, scale);
  paint(ctx, seconds);
  ctx.restore();
}
