/** Rivers, lava and canals: dashed lines over the chart whose dashes march downstream. */
import { frameOf } from '../../../shared/canvas/surface';

export interface Flow {
  /** The course as `[x, y]` points, in fractions of the chart. */
  readonly course: readonly (readonly number[])[];
  readonly dash: readonly number[];
  readonly color: string;
  readonly width: number;
  /** Chart pixels per second. */
  readonly speed: number;
}

function traceCourse(
  ctx: CanvasRenderingContext2D,
  course: Flow['course'],
  width: number,
  height: number,
): void {
  ctx.beginPath();
  for (let index = 0; index < course.length; index++) {
    const x = (course[index]?.[0] ?? 0) * width;
    const y = (course[index]?.[1] ?? 0) * height;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
}

export function paintFlows(
  canvas: HTMLCanvasElement,
  flows: readonly Flow[],
  seconds: number,
): void {
  const surface = frameOf(canvas);
  if (!surface) return;
  const { ctx, width, height } = surface;
  for (const flow of flows) {
    traceCourse(ctx, flow.course, width, height);
    ctx.strokeStyle = flow.color;
    ctx.lineWidth = flow.width;
    ctx.lineCap = 'round';
    ctx.setLineDash([...flow.dash]);
    ctx.lineDashOffset = -seconds * flow.speed;
    ctx.stroke();
  }
}
