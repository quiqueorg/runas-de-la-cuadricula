/**
 * Where each lesson's stop sits on the chart, and which spans of the trails show. Coordinates are
 * fractions of the chart (0 to 1).
 */
import { levelsInRegion, regions } from '../../core/catalog';
import type { Level, Region } from '../../core/models';
import { MAP_ASPECT, type MapPoint, pointAt, type Trail, trailFrom } from './trailShape';

/** Stops on a curved trail spread over its middle: from 12% to 88% of the walk. */
const STOP_START = 0.12;
const STOP_SPAN = 0.76;
/** On a traced path the stops keep this fraction of the walk (but at least `MIN_STOP_MARGIN`) clear at each end. */
const STOP_MARGIN = 0.12;
const MIN_STOP_MARGIN = 0.07;
/** A flight takes off this close after the last stop. */
const TAKE_OFF_GAP = 0.03;
/** Below this stretch the margins do not fit, and the stops spread as on a curved trail. */
const MIN_STOP_STRETCH = 0.05;
const DEFAULT_EXAM_RADIUS = 0.095;

/** Points drawn per span of the trail. */
const LEG_SAMPLES = 12;
const LAST_WALK_SAMPLES = 8;
const FLIGHT_SAMPLES = 40;

/** Regions drawn on the charts: all but the secret places. */
export const allRegions: readonly Region[] = regions.filter((region) => !region.secret);

function spreadOnCurve(stop: number, count: number): number {
  return count === 1 ? 0.5 : STOP_START + (stop / (count - 1)) * STOP_SPAN;
}

/** How far along the trail the region's `stop`-th of `count` lessons sits. */
function stopDistance(trail: Trail, region: Region, stop: number, count: number): number {
  const land = trail.landLength;
  if (!region.path) return land * spreadOnCurve(stop, count);
  const first = Math.max(STOP_MARGIN * land, MIN_STOP_MARGIN);
  const last = region.flight
    ? land - TAKE_OFF_GAP
    : land - Math.max(STOP_MARGIN * land, MIN_STOP_MARGIN);
  if (last - first < MIN_STOP_STRETCH) return land * spreadOnCurve(stop, count);
  return count === 1 ? (first + last) / 2 : first + (stop / (count - 1)) * (last - first);
}

/** A trail leads on to the next region when it is on the same chart; exams are a dead end. */
function hasTrail(regionIndex: number): boolean {
  const next = regions[regionIndex + 1];
  const current = regions[regionIndex];
  return (
    Boolean(next) &&
    Boolean(current) &&
    next?.world === current?.world &&
    !next?.secret &&
    !current?.exam
  );
}

/** Exam lessons sit in a ring round their region, the first one at the top. */
function ringPositions(region: Region, lessons: readonly Level[]): [string, MapPoint][] {
  const radius = region.radius || DEFAULT_EXAM_RADIUS;
  return lessons.map((level, stop) => {
    const angle = ((-90 + (stop * 360) / lessons.length) * Math.PI) / 180;
    return [
      level.id,
      {
        x: (region.x ?? 0) + (Math.cos(angle) * radius) / MAP_ASPECT,
        y: (region.y ?? 0) + Math.sin(angle) * radius,
      },
    ];
  });
}

function layoutStops(): {
  readonly distances: Readonly<Record<number, readonly number[]>>;
  readonly positions: Readonly<Record<string, MapPoint>>;
} {
  const distances: Record<number, number[]> = {};
  const positions: Record<string, MapPoint> = {};
  for (const region of allRegions) {
    const lessons = levelsInRegion(region.index);
    if (region.exam) {
      Object.assign(positions, Object.fromEntries(ringPositions(region, lessons)));
    } else if (hasTrail(region.index)) {
      const trail = trailFrom(region.index);
      const stops = lessons.map((_, stop) => stopDistance(trail, region, stop, lessons.length));
      distances[region.index] = stops;
      lessons.forEach((level, stop) => {
        positions[level.id] = pointAt(trail, stops[stop] ?? 0);
      });
    }
  }
  return { distances, positions };
}

const STOPS = layoutStops();

/** Where each lesson's stop sits on the chart. */
export const stopPositions: Readonly<Record<string, MapPoint>> = STOPS.positions;

function sampleTrail(trail: Trail, from: number, to: number, steps: number): MapPoint[] {
  return Array.from({ length: steps + 1 }, (_, step) =>
    pointAt(trail, from + ((to - from) * step) / steps),
  );
}

export type TrailKind = 'done' | 'upcoming' | 'flight';

export interface TrailSpan {
  readonly points: readonly MapPoint[];
  readonly kind: TrailKind;
}

/** The span from one stop to the next; the last one of a trail with a flight walks, then flies. */
function legSpans(
  trail: Trail,
  start: number,
  end: number,
  next: Level | undefined,
  isCleared: (level: Level) => boolean,
): TrailSpan[] {
  if (!next && trail.flight) {
    return [
      { points: sampleTrail(trail, start, trail.landLength, LAST_WALK_SAMPLES), kind: 'done' },
      {
        points: sampleTrail(trail, trail.landLength, trail.length, FLIGHT_SAMPLES),
        kind: 'flight',
      },
    ];
  }
  return [
    {
      points: sampleTrail(trail, start, end, LEG_SAMPLES),
      kind: next && !isCleared(next) ? 'upcoming' : 'done',
    },
  ];
}

/**
 * The visible part of the trail leaving a region: a span shows once both its ends are visible, and
 * the last one (on to the next region) once the region is complete.
 */
export function trailSpans(
  region: Region,
  isVisible: (level: Level) => boolean,
  isCleared: (level: Level) => boolean,
  complete: boolean,
): TrailSpan[] {
  if (!hasTrail(region.index)) return [];
  const trail = trailFrom(region.index);
  const lessons = levelsInRegion(region.index);
  const stops = [0, ...(STOPS.distances[region.index] ?? []), trail.length];
  const spans: TrailSpan[] = [];
  for (let leg = 0; leg < stops.length - 1; leg++) {
    const previous = lessons[leg - 1];
    const next = lessons[leg];
    const started = leg === 0 || (previous ? isVisible(previous) : false);
    const shown = started && (next ? isVisible(next) : complete);
    if (!shown) continue;
    const start = stops[leg] ?? 0;
    spans.push(...legSpans(trail, start, stops[leg + 1] ?? start, next, isCleared));
  }
  return spans;
}
