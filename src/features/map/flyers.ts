/** Where an animated flyer (a griffin, a dragon, a boat) is along its route at a given moment. */

export interface RoutePoint {
  readonly x: number;
  readonly y: number;
  readonly opacity: number;
}

/**
 * @param mode `loop` goes round and starts over, `ping` goes and comes back, `flight` travels for
 *   the first four fifths, then holds the end and fades out.
 */
export function routeSample(
  points: readonly (readonly number[])[],
  elapsed: number,
  duration: number,
  mode: 'loop' | 'ping' | 'flight',
): RoutePoint {
  const span = Math.max(duration, 0.001);
  let cycle = (elapsed / span) % 1;
  let opacity = 1;
  if (mode === 'ping') cycle = (1 - Math.cos(cycle * 2 * Math.PI)) / 2;
  else if (mode === 'flight') {
    const fade = Math.min(1, cycle / 0.08, (1 - cycle) / 0.14);
    opacity = fade * fade * (3 - 2 * fade);
  }
  if (points.length < 2) return { x: points[0]?.[0] ?? 0, y: points[0]?.[1] ?? 0, opacity };
  // Some traced routes repeat the landing point; don't spend a beat hovering there.
  let last = points.length - 1;
  while (
    last > 1 &&
    points[last]?.[0] === points[last - 1]?.[0] &&
    points[last]?.[1] === points[last - 1]?.[1]
  ) {
    last--;
  }
  const cursor = cycle * last;
  const index = Math.min(last - 1, Math.floor(cursor));
  const local = cursor - index;
  const [fromX = 0, fromY = 0] = points[index] ?? [];
  const [toX = fromX, toY = fromY] = points[index + 1] ?? [];
  return { x: fromX + (toX - fromX) * local, y: fromY + (toY - fromY) * local, opacity };
}
