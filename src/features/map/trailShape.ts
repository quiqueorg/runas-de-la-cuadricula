/**
 * The line of each trail from one region to the next: a traced path smoothed into a spline, or a
 * gentle curve when none was traced. Coordinates are fractions of the chart (0 to 1); distances are
 * measured with the chart's aspect, so they match what the eye sees.
 */
import { regions } from '../../core/catalog';
import type { Region } from '../../core/models';

/** Width over height of the 1600×1100 sheet the trails were traced on. */
export const MAP_ASPECT = 1600 / 1100;

/** Trails without a traced path bow away from this point, so they curve round the chart's middle. */
const CHART_MIDDLE = { x: 0.47, y: 0.5 } as const;
/** How far a curved trail bows out, in chart heights. */
const CURVE_BOW = 0.07;
const CURVE_SAMPLES = 120;
/** Points per traced-path section between two control points. */
const SPLINE_STEPS = 16;

export interface MapPoint {
  readonly x: number;
  readonly y: number;
}

/** A quadratic Bézier from one region to the next. */
interface Curve {
  readonly start: MapPoint;
  readonly control: MapPoint;
  readonly end: MapPoint;
}

export interface Trail {
  readonly points: readonly MapPoint[];
  /** Distance walked when reaching each point. */
  readonly distances: readonly number[];
  readonly length: number;
  /** Where the walk ends and the flight begins; the whole length when there is no flight. */
  readonly landLength: number;
  readonly flight: Region['flight'] | null;
}

function positionOf(region: Region | undefined): MapPoint {
  return { x: region?.x ?? 0, y: region?.y ?? 0 };
}

function curveFrom(regionIndex: number): Curve {
  const start = positionOf(regions[regionIndex]);
  const end = positionOf(regions[regionIndex + 1]);
  const middleX = (start.x + end.x) / 2;
  const middleY = (start.y + end.y) / 2;
  const deltaX = (end.x - start.x) * MAP_ASPECT;
  const deltaY = end.y - start.y;
  const length = Math.hypot(deltaX, deltaY) || 1;
  let normalX = -deltaY / length;
  let normalY = deltaX / length;
  const towardsMiddle =
    normalX * (middleX - CHART_MIDDLE.x) * MAP_ASPECT + normalY * (middleY - CHART_MIDDLE.y) < 0;
  if (towardsMiddle) {
    normalX = -normalX;
    normalY = -normalY;
  }
  return {
    start,
    end,
    control: { x: middleX + (normalX * CURVE_BOW) / MAP_ASPECT, y: middleY + normalY * CURVE_BOW },
  };
}

function pointOnCurve(curve: Curve, t: number): MapPoint {
  const rest = 1 - t;
  return {
    x: rest * rest * curve.start.x + 2 * rest * t * curve.control.x + t * t * curve.end.x,
    y: rest * rest * curve.start.y + 2 * rest * t * curve.control.y + t * t * curve.end.y,
  };
}

/** One coordinate of a Catmull-Rom section from `from` to `to`, `t` of the way along. */
function catmullRomAt(before: number, from: number, to: number, after: number, t: number): number {
  return (
    0.5 *
    (2 * from +
      (-before + to) * t +
      (2 * before - 5 * from + 4 * to - after) * t * t +
      (-before + 3 * from - 3 * to + after) * t * t * t)
  );
}

/**
 * A smooth line through the control points.
 * @returns the points, and the index in them where each control point falls.
 */
function catmullRom(controls: readonly MapPoint[]): {
  readonly points: MapPoint[];
  readonly controlIndex: number[];
} {
  const first = controls[0];
  const last = controls[controls.length - 1];
  if (!first || !last) return { points: [], controlIndex: [] };
  const padded = [first, ...controls, last];
  const points: MapPoint[] = [];
  const controlIndex = [0];
  for (let section = 1; section < padded.length - 2; section++) {
    const before = padded[section - 1];
    const from = padded[section];
    const to = padded[section + 1];
    const after = padded[section + 2];
    if (!before || !from || !to || !after) continue;
    for (let step = 0; step < SPLINE_STEPS; step++) {
      const t = step / SPLINE_STEPS;
      points.push({
        x: catmullRomAt(before.x, from.x, to.x, after.x, t),
        y: catmullRomAt(before.y, from.y, to.y, after.y, t),
      });
    }
    controlIndex.push(points.length);
  }
  points.push(last);
  return { points, controlIndex };
}

/** The trail's line, and the index of the point where its flight takes off (-1 for none). */
function trailLine(regionIndex: number): { points: MapPoint[]; takeOff: number } {
  const from = regions[regionIndex];
  const to = regions[regionIndex + 1];
  if (from?.path && to) {
    const spline = catmullRom([
      positionOf(from),
      ...from.path.map(([x, y]) => ({ x, y })),
      positionOf(to),
    ]);
    const takeOff = from.flight ? (spline.controlIndex[from.flight.from] ?? -1) : -1;
    return { points: spline.points, takeOff };
  }
  const curve = curveFrom(regionIndex);
  const points = Array.from({ length: CURVE_SAMPLES + 1 }, (_, step) =>
    pointOnCurve(curve, step / CURVE_SAMPLES),
  );
  return { points, takeOff: -1 };
}

function cumulativeDistances(points: readonly MapPoint[]): number[] {
  const distances = [0];
  let walked = 0;
  for (let index = 1; index < points.length; index++) {
    const previous = points[index - 1];
    const next = points[index];
    if (!previous || !next) continue;
    walked += Math.hypot((next.x - previous.x) * MAP_ASPECT, next.y - previous.y);
    distances.push(walked);
  }
  return distances;
}

const trailCache = new Map<number, Trail>();

/** The trail from a region to the next one. */
export function trailFrom(regionIndex: number): Trail {
  const cached = trailCache.get(regionIndex);
  if (cached) return cached;
  const { points, takeOff } = trailLine(regionIndex);
  const distances = cumulativeDistances(points);
  const length = distances[distances.length - 1] ?? 0;
  const trail: Trail = {
    points,
    distances,
    length,
    landLength: takeOff >= 0 ? (distances[takeOff] ?? length) : length,
    flight: regions[regionIndex]?.flight ?? null,
  };
  trailCache.set(regionIndex, trail);
  return trail;
}

export function pointAt(trail: Trail, distance: number): MapPoint {
  const { points, distances } = trail;
  const walked = Math.max(0, Math.min(trail.length, distance));
  let index = 1;
  while (index < distances.length - 1 && (distances[index] ?? 0) < walked) index++;
  const before = distances[index - 1] ?? 0;
  const after = distances[index] ?? before;
  const fraction = (walked - before) / (after - before || 1);
  const previous = points[index - 1] ?? { x: 0, y: 0 };
  const next = points[index] ?? previous;
  return {
    x: previous.x + (next.x - previous.x) * fraction,
    y: previous.y + (next.y - previous.y) * fraction,
  };
}
