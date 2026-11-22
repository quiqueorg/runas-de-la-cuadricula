/** Map trails. Coordinates stay in the original 1600×1100 sheet. */
import { levelsInRegion, regions } from '../../core/catalog';
import type { Level, Region } from '../../core/models';

export const MAP_ASPECT = 1600 / 1100;

export interface MapPoint {
  readonly x: number;
  readonly y: number;
}

export interface MapRegion extends Region {
  readonly ri: number;
}

interface Curve {
  readonly A: MapPoint;
  readonly B: MapPoint;
  readonly C: MapPoint;
}

export interface Trail {
  readonly pts: readonly MapPoint[];
  readonly L: readonly number[];
  readonly total: number;
  readonly tierra: number;
  readonly vuelo: Region['vuelo'] | null;
}

export const allRegions: MapRegion[] = regions
  .map((region, ri) => ({ ...region, ri }))
  .filter((region) => !region.secreto);

function at(region: Region | undefined): MapPoint {
  return { x: region?.x ?? 0, y: region?.y ?? 0 };
}

export function curveFor(ri: number): Curve {
  const A = at(regions[ri]);
  const B = at(regions[ri + 1]);
  const mx = (A.x + B.x) / 2;
  const my = (A.y + B.y) / 2;
  const dx = (B.x - A.x) * MAP_ASPECT;
  const dy = B.y - A.y;
  const len = Math.hypot(dx, dy) || 1;
  let px = -dy / len;
  let py = dx / len;
  if (px * (mx - 0.47) * MAP_ASPECT + py * (my - 0.5) < 0) {
    px = -px;
    py = -py;
  }
  return { A, B, C: { x: mx + (px * 0.07) / MAP_ASPECT, y: my + py * 0.07 } };
}

export function pointOnCurve(curve: Curve, t: number): MapPoint {
  const u = 1 - t;
  return {
    x: u * u * curve.A.x + 2 * u * t * curve.C.x + t * t * curve.B.x,
    y: u * u * curve.A.y + 2 * u * t * curve.C.y + t * t * curve.B.y,
  };
}

export function catmullRom(ctrl: readonly MapPoint[], steps = 16): { pts: MapPoint[]; idx: number[] } {
  const first = ctrl[0];
  const last = ctrl[ctrl.length - 1];
  if (!first || !last) return { pts: [], idx: [] };
  const P = [first, ...ctrl, last];
  const out: MapPoint[] = [];
  const idx = [0];
  const f = (a: number, b: number, c2: number, d: number, t: number) =>
    0.5 * (2 * b + (-a + c2) * t + (2 * a - 5 * b + 4 * c2 - d) * t * t + (-a + 3 * b - 3 * c2 + d) * t * t * t);
  for (let i = 1; i < P.length - 2; i++) {
    const a = P[i - 1];
    const b = P[i];
    const c = P[i + 1];
    const d = P[i + 2];
    if (!a || !b || !c || !d) continue;
    for (let k = 0; k < steps; k++) {
      const t = k / steps;
      out.push({ x: f(a.x, b.x, c.x, d.x, t), y: f(a.y, b.y, c.y, d.y, t) });
    }
    idx.push(out.length);
  }
  out.push(last);
  return { pts: out, idx };
}

const trailCache = new Map<number, Trail>();

export function trailFor(ri: number): Trail {
  const cached = trailCache.get(ri);
  if (cached) return cached;
  const A = regions[ri];
  const B = regions[ri + 1];
  let pts: MapPoint[];
  let puerto = -1;
  if (A?.ruta && B) {
    const spline = catmullRom([{ x: A.x ?? 0, y: A.y ?? 0 }, ...A.ruta.map(([x, y]) => ({ x, y })), { x: B.x ?? 0, y: B.y ?? 0 }]);
    pts = spline.pts;
    if (A.vuelo) puerto = spline.idx[A.vuelo.desde] ?? -1;
  } else {
    const curve = curveFor(ri);
    pts = Array.from({ length: 121 }, (_, i) => pointOnCurve(curve, i / 120));
  }
  const lengths = [0];
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const next = pts[i];
    if (!prev || !next) continue;
    lengths.push(lengths[i - 1]! + Math.hypot((next.x - prev.x) * MAP_ASPECT, next.y - prev.y));
  }
  const total = lengths[lengths.length - 1] ?? 0;
  const trail: Trail = { pts, L: lengths, total, tierra: puerto >= 0 ? lengths[puerto] ?? total : total, vuelo: A?.vuelo ?? null };
  trailCache.set(ri, trail);
  return trail;
}

export function pointOnTrail(trail: Trail, distance: number): MapPoint {
  const { pts, L } = trail;
  const s = Math.max(0, Math.min(trail.total, distance));
  let i = 1;
  while (i < L.length - 1 && (L[i] ?? 0) < s) i++;
  const prevL = L[i - 1] ?? 0;
  const nextL = L[i] ?? prevL;
  const f = (s - prevL) / ((nextL - prevL) || 1);
  const prev = pts[i - 1] ?? { x: 0, y: 0 };
  const next = pts[i] ?? prev;
  return { x: prev.x + (next.x - prev.x) * f, y: prev.y + (next.y - prev.y) * f };
}

const stoneProgress = (k: number, n: number) => (n === 1 ? 0.5 : 0.12 + (k / (n - 1)) * 0.76);

export function progressOnSegment(trail: Trail, region: Region, k: number, n: number): number {
  const land = trail.tierra;
  if (!region.ruta) return land * stoneProgress(k, n);
  const a = Math.max(0.12 * land, 0.07);
  const b = region.vuelo ? land - 0.03 : land - Math.max(0.12 * land, 0.07);
  if (b - a < 0.05) return land * stoneProgress(k, n);
  return n === 1 ? (a + b) / 2 : a + (k / (n - 1)) * (b - a);
}

export function hasSegment(ri: number): boolean {
  const next = regions[ri + 1];
  const current = regions[ri];
  return !!next && !!current && next.mundo === current.mundo && !next.secreto && !current.examen;
}

export const segmentPoints: Record<number, number[]> = {};
export const stopPositions: Record<string, MapPoint> = {};

for (const region of allRegions) {
  const levelsHere = levelsInRegion(region.ri);
  const radius = region.radio || 0.095;
  if (region.examen) {
    levelsHere.forEach((level, k) => {
      const angle = ((-90 + (k * 360) / levelsHere.length) * Math.PI) / 180;
      stopPositions[level.id] = { x: (region.x ?? 0) + (Math.cos(angle) * radius) / MAP_ASPECT, y: (region.y ?? 0) + Math.sin(angle) * radius };
    });
  } else if (hasSegment(region.ri)) {
    const trail = trailFor(region.ri);
    const stops = levelsHere.map((_, k) => progressOnSegment(trail, region, k, levelsHere.length));
    segmentPoints[region.ri] = stops;
    levelsHere.forEach((level, k) => {
      stopPositions[level.id] = pointOnTrail(trail, stops[k] ?? 0);
    });
  }
}

export function sampleTrail(trail: Trail, from: number, to: number, steps: number): MapPoint[] {
  const points: MapPoint[] = [];
  for (let step = 0; step <= steps; step++) points.push(pointOnTrail(trail, from + ((to - from) * step) / steps));
  return points;
}

export type TrailKind = 'done' | 'upcoming' | 'flight';

export interface TrailSpan {
  readonly points: readonly MapPoint[];
  readonly kind: TrailKind;
}

export function trailSpans(
  region: MapRegion,
  visible: (level: Level) => boolean,
  cleared: (level: Level) => boolean,
  complete: boolean,
): TrailSpan[] {
  if (!hasSegment(region.ri)) return [];
  const trail = trailFor(region.ri);
  const levelsHere = levelsInRegion(region.ri);
  const stops = [0, ...(segmentPoints[region.ri] ?? []), trail.total];
  const spans: TrailSpan[] = [];
  for (let j = 0; j < stops.length - 1; j++) {
    const previous = levelsHere[j - 1];
    const started = j === 0 || (previous ? visible(previous) : false);
    const next = j < levelsHere.length ? levelsHere[j] : undefined;
    const show = started && (next ? visible(next) : complete);
    if (!show) continue;
    const start = stops[j] ?? 0;
    const end = stops[j + 1] ?? start;
    if (!next && trail.vuelo) {
      spans.push({ points: sampleTrail(trail, start, trail.tierra, 8), kind: 'done' });
      spans.push({ points: sampleTrail(trail, trail.tierra, trail.total, 40), kind: 'flight' });
    } else {
      spans.push({ points: sampleTrail(trail, start, end, 12), kind: next && !cleared(next) ? 'upcoming' : 'done' });
    }
  }
  return spans;
}
