/** The player's progress as the game reads it. How it is stored is `storage.ts`'s business. */
import type { WorldId } from '../models';

export interface LessonResult {
  /** Solved without hints or solutions (and, for an exam, with three stars). */
  readonly mastered: boolean;
  /** Best exam grade, 1 to 3. */
  readonly stars?: number;
  readonly completedAt?: number;
}

export interface Settings {
  readonly sound: boolean;
  readonly music: boolean;
  /** Draw grid lines and flex axes over the board. */
  readonly guides: boolean;
}

export interface Progress {
  /** The last lesson opened. */
  readonly currentLessonId: string | null;
  /** The world whose map the player last visited. */
  readonly world: WorldId | undefined;
  /** Solved lessons by id. A lesson is done when it has a result. */
  readonly results: Readonly<Record<string, LessonResult>>;
  /** What the player wrote, by lesson id: declarations, then conditions, then own selectors. */
  readonly code: Readonly<Record<string, readonly string[]>>;
  /** Failed exam deliveries by lesson id, reset when the exam is passed. */
  readonly failedAttempts: Readonly<Record<string, number>>;
  /** Secret places found on the map, by lesson id. */
  readonly foundSecrets: Readonly<Record<string, boolean>>;
  /** Regions whose welcome the player has already seen, by global region index. */
  readonly seenRegions: Readonly<Record<string, boolean>>;
  readonly settings: Settings;
  readonly updatedAt: number;
}

export const EMPTY_PROGRESS: Progress = {
  currentLessonId: null,
  world: undefined,
  results: {},
  code: {},
  failedAttempts: {},
  foundSecrets: {},
  seenRegions: {},
  settings: { sound: true, music: true, guides: true },
  updatedAt: 0,
};
