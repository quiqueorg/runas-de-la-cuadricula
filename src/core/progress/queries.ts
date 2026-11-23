/** Questions about the player's progress. Pure: each one takes the `Progress` it reads. */
import {
  ADVENTURES,
  isExercise,
  isFirstInWorld,
  levels,
  levelsInRegion,
  regionPrerequisites,
  routes,
} from '../catalog';
import type { Level, RegionStats, WorldId } from '../models';
import type { Progress } from './types';

/** `?final` in the URL opens the finale without finishing the adventures, for authors. */
const FINALE_FORCED = typeof location !== 'undefined' && /[?&]final\b/.test(location.search);

export const isDone = (progress: Progress, lessonId: string): boolean =>
  Boolean(progress.results[lessonId]);

/** The world whose map the player is on: the last one visited, or the grid ruins. */
export const currentWorld = (progress: Progress): WorldId => progress.world ?? 'grid';

const countDone = (progress: Progress, list: readonly Level[]): number =>
  list.filter((level) => isDone(progress, level.id)).length;

export const exercisesDone = (progress: Progress, world: WorldId): number =>
  countDone(
    progress,
    levels.filter((level) => level.world === world && isExercise(level)),
  );

export const examsDone = (progress: Progress, world: WorldId): number =>
  countDone(
    progress,
    levels.filter((level) => level.world === world && level.exam),
  );

export const completedCount = (progress: Progress): number => countDone(progress, levels);

export const worldComplete = (progress: Progress, world: WorldId): boolean =>
  routes[world].every((level) => isDone(progress, level.id));

export const finaleUnlocked = (progress: Progress): boolean =>
  FINALE_FORCED || ADVENTURES.every((world) => worldComplete(progress, world));

export const hasStarted = (progress: Progress, world: WorldId): boolean =>
  levels.some(
    (level) => level.world === world && (isDone(progress, level.id) || progress.code[level.id]),
  );

/** The first lesson on the trail not yet solved, if any. */
export const frontierLevel = (progress: Progress, world: WorldId): Level | undefined =>
  routes[world].find((level) => !isDone(progress, level.id));

/** Where "Continue" leads: the frontier, or the start of a finished trail. */
export function nextPendingLevel(progress: Progress, world: WorldId): Level {
  const next = frontierLevel(progress, world) ?? routes[world][0];
  if (!next) throw new Error(`Empty route: ${world}`);
  return next;
}

export function regionStats(progress: Progress, regionIndex: number): RegionStats {
  const inRegion = levelsInRegion(regionIndex);
  return { total: inRegion.length, done: countDone(progress, inRegion) };
}

export function regionComplete(progress: Progress, regionIndex: number): boolean {
  const { total, done } = regionStats(progress, regionIndex);
  return total > 0 && done === total;
}

/** A region shows on the map once the regions it waits for are complete, or once it is started. */
export const isDiscovered = (progress: Progress, regionIndex: number): boolean =>
  isFirstInWorld(regionIndex) ||
  regionPrerequisites(regionIndex).every((index) => regionComplete(progress, index)) ||
  levelsInRegion(regionIndex).some((level) => isDone(progress, level.id));
