/** Paints the walked trail: solid where it is done, marching dashes ahead and in flight. */
import type { WorldId } from '../../../core/models';
import { frameOf } from '../../../shared/canvas/surface';
import type { TrailKind, TrailSpan } from '../geometry';

interface TrailInk {
  readonly stroke: string;
  readonly width: number;
  readonly dash: readonly number[];
  readonly alpha: number;
  /** Chart pixels per second the dashes march; 0 holds them still. */
  readonly speed: number;
}

/** Dashes march at this pace, divided by each kind's own slowness. */
const MARCH = 9.5;

const TRAIL_COLOR: Readonly<Record<WorldId, string>> = {
  grid: '#8a2e14',
  isle: '#6b2a12',
  flex: '#ffcf6a',
  sky: '#7a3412',
  finale: '#8a2e14',
};

const FLIGHT_INK: TrailInk = {
  stroke: '#fff',
  width: 3,
  dash: [1, 10],
  alpha: 0.95,
  speed: MARCH / 1.4,
};

function trailInk(world: WorldId, kind: TrailKind): TrailInk {
  if (kind === 'flight') return FLIGHT_INK;
  const stroke = TRAIL_COLOR[world];
  if (kind === 'upcoming')
    return { stroke, width: 2.6, dash: [0.5, 9], alpha: 0.55, speed: MARCH / 1.1 };
  return { stroke, width: 3.4, dash: [0.5, 8], alpha: 0.9, speed: 0 };
}

export function paintTrail(
  canvas: HTMLCanvasElement,
  world: WorldId,
  spans: readonly TrailSpan[],
  seconds: number,
): void {
  const surface = frameOf(canvas);
  if (!surface) return;
  const { ctx, width, height } = surface;
  for (const span of spans) {
    const spanInk = trailInk(world, span.kind);
    ctx.beginPath();
    span.points.forEach((point, index) => {
      const x = point.x * width;
      const y = point.y * height;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = spanInk.stroke;
    ctx.globalAlpha = spanInk.alpha;
    ctx.lineWidth = spanInk.width;
    ctx.lineCap = 'round';
    ctx.setLineDash([...spanInk.dash]);
    ctx.lineDashOffset = spanInk.speed ? -seconds * spanInk.speed : 0;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}
