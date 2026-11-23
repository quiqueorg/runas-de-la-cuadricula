/** Compares the transitions two elements would run, as the browser computes them. */
import { splitList } from './media';

interface Transition {
  readonly duration: number;
  readonly delay: number;
  /** Normalized timing function, so `ease` and its cubic-bezier compare equal. */
  readonly curve: string;
}

export type TransitionMap = ReadonlyMap<string, Transition>;

const NAMED_CURVES: Record<string, readonly number[]> = {
  ease: [0.25, 0.1, 0.25, 1],
  'ease-in': [0.42, 0, 1, 1],
  'ease-out': [0, 0, 0.58, 1],
  'ease-in-out': [0.42, 0, 0.58, 1],
  linear: [0, 0, 1, 1],
};
const STEP_POSITIONS: Record<string, string> = { 'jump-start': 'start', 'jump-end': 'end' };
const TOLERANCE_S = 0.001;

function normalizeCurve(value: string): string {
  const curve = value.replace(/\s+/g, '').toLowerCase();
  const named = NAMED_CURVES[curve];
  if (named) return named.join(',');
  const bezier = curve.match(/^cubic-bezier\((.*)\)$/);
  if (bezier?.[1]) {
    return bezier[1]
      .split(',')
      .map((n) => Number(Number(n).toFixed(3)))
      .join(',');
  }
  if (curve === 'step-start') return 'steps(1,start)';
  if (curve === 'step-end') return 'steps(1,end)';
  const steps = curve.match(/^steps\((\d+)(?:,(.*))?\)$/);
  if (steps) {
    const position = steps[2] || 'end';
    return `steps(${steps[1]},${STEP_POSITIONS[position] ?? position})`;
  }
  return curve;
}

/**
 * The transitions an element runs, by property. `filter` is left out (the board uses it for its
 * own effects), and so is `box-shadow` unless the lesson compares shadows.
 */
export function readTransitions(element: Element, withShadows: boolean): TransitionMap {
  const style = getComputedStyle(element);
  const properties = splitList(style.transitionProperty);
  const durations = splitList(style.transitionDuration).map(parseFloat);
  const delays = splitList(style.transitionDelay).map(parseFloat);
  const curves = splitList(style.transitionTimingFunction);
  const map = new Map<string, Transition>();
  properties.forEach((property, index) => {
    if (property === 'none' || property === 'filter') return;
    if (property === 'box-shadow' && !withShadows) return;
    // Lists repeat to cover every property; a property listed twice keeps its last entry.
    const duration = durations[index % durations.length] || 0;
    const delay = delays[index % delays.length] || 0;
    map.delete(property);
    if (duration > 0 || delay > 0) {
      map.set(property, {
        duration,
        delay,
        curve: normalizeCurve(curves[index % curves.length] || ''),
      });
    }
  });
  return map;
}

const seconds = (n: number) => `${Number(n.toFixed(3))}s`;

/** What differs between the player's transitions and the goal's, or null when they match. */
export function transitionDifference(
  name: string,
  player: TransitionMap,
  goal: TransitionMap,
): string | null {
  for (const [property, expected] of goal) {
    const actual = player.get(property) ?? player.get('all');
    if (!actual)
      return `${name} cambia de golpe: a <code>${property}</code> le falta una transición.`;
    if (Math.abs(actual.duration - expected.duration) > TOLERANCE_S) {
      return `${name}: <code>${property}</code> dura ${seconds(actual.duration)} y debería durar ${seconds(expected.duration)}.`;
    }
    if (Math.abs(actual.delay - expected.delay) > TOLERANCE_S) {
      return `${name}: <code>${property}</code> espera ${seconds(actual.delay)} antes de empezar y debería esperar ${seconds(expected.delay)}.`;
    }
    if (actual.curve !== expected.curve) {
      return `${name}: <code>${property}</code> no lleva el ritmo pedido (revisa la función de tiempo).`;
    }
  }
  for (const property of player.keys()) {
    if (goal.has(property)) continue;
    return property === 'all'
      ? `${name} anima todas sus propiedades (<code>all</code>); aquí solo deben animarse las del objetivo.`
      : `${name} también anima <code>${property}</code>, y eso debería cambiar de golpe.`;
  }
  return null;
}
