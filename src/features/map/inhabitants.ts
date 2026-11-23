/**
 * The characters and curiosities on each map, and their jokes. Who says what lives in
 * `inhabitants.json`; where each one stands lives in `scenery.json`.
 */
import type { WorldId } from '../../core/models';
import data from './inhabitants.json';
import scenery from './scenery.json';

export interface Inhabitant {
  readonly name: string;
  readonly jokes: readonly string[];
  /** A thing to look at, not a character: it clicks instead of talking. */
  readonly curio?: boolean;
  /** Symbol `i-<sprite>`; without one, the inhabitant is a fish. */
  readonly sprite?: string;
  /** What `sound.chatter` makes them sound like. */
  readonly voice?: string;
  readonly color?: string;
  readonly accent?: string;
}

export interface Joke {
  readonly speaker: string;
  readonly name: string;
  readonly text: string;
}

export interface PlacedInhabitant {
  readonly key: string;
  readonly x: number;
  readonly y: number;
}

const INHABITANTS: Readonly<Record<string, Inhabitant>> = data;

export const inhabitantOf = (key: string): Inhabitant | null => INHABITANTS[key] ?? null;

export function inhabitantsOf(world: WorldId): PlacedInhabitant[] {
  return scenery[world].inhabitants.flatMap(([key, x, y]) =>
    typeof key === 'string' && typeof x === 'number' && typeof y === 'number'
      ? [{ key, x, y }]
      : [],
  );
}

/** Characters who may greet the player unprompted (curiosities stay quiet). */
export const greeters = (world: WorldId): string[] =>
  inhabitantsOf(world)
    .filter(({ key }) => {
      const inhabitant = inhabitantOf(key);
      return inhabitant !== null && !inhabitant.curio;
    })
    .map(({ key }) => key);

/** Each inhabitant tells their jokes in turn; `told` remembers where each one is. */
export function nextJoke(
  key: string,
  told: Readonly<Record<string, number>>,
): { readonly joke: Joke; readonly told: Record<string, number> } | null {
  const inhabitant = inhabitantOf(key);
  if (!inhabitant) return null;
  const cursor = ((told[key] ?? -1) + 1) % inhabitant.jokes.length;
  return {
    joke: { speaker: key, name: inhabitant.name, text: inhabitant.jokes[cursor] ?? '' },
    told: { ...told, [key]: cursor },
  };
}
