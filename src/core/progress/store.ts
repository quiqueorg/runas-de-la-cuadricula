/**
 * The single source of truth for the player's progress.
 *
 * State is immutable: every change goes through one of the actions below, which builds a new
 * `Progress`, notifies subscribers and schedules a save. Read it in components with
 * `useProgress()`, and outside React with `getProgress()`.
 */
import { useSyncExternalStore } from 'react';
import type { Level, WorldId } from '../models';
import { loadLocal, saveLocal } from './storage';
import { EMPTY_PROGRESS, type LessonResult, type Progress, type Settings } from './types';

const SAVE_DELAY_MS = 400;

type Listener = () => void;

let state: Progress = loadLocal();
const listeners = new Set<Listener>();
let saveTimer: ReturnType<typeof setTimeout> | undefined;

export function getProgress(): Progress {
  return state;
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Writes any pending change now, e.g. before the page goes away. */
export function flushSave(): void {
  if (saveTimer === undefined) return;
  clearTimeout(saveTimer);
  saveTimer = undefined;
  saveLocal(state);
}

function update(change: (current: Progress) => Progress): void {
  const next = change(state);
  if (next === state) return;
  state = { ...next, updatedAt: Date.now() };
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flushSave, SAVE_DELAY_MS);
  for (const listener of listeners) listener();
}

if (typeof window !== 'undefined') window.addEventListener('pagehide', flushSave);

/** Re-renders when the progress changes. */
export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, getProgress, getProgress);
}

// ─── Actions ─────────────────────────────────────────────────────────────────────────────────────

export function openLesson(level: Level): void {
  update((current) => ({
    ...current,
    currentLessonId: level.id,
    world: level.world,
    foundSecrets: level.secret
      ? { ...current.foundSecrets, [level.id]: true }
      : current.foundSecrets,
  }));
}

export function enterWorld(world: WorldId): void {
  update((current) => (current.world === world ? current : { ...current, world }));
}

export function saveCode(lessonId: string, code: readonly string[]): void {
  update((current) => {
    const saved = current.code[lessonId];
    const same =
      saved?.length === code.length && saved.every((text, index) => text === code[index]);
    return same ? current : { ...current, code: { ...current.code, [lessonId]: [...code] } };
  });
}

/** Records a solved lesson. A passed exam also clears its failed deliveries. */
export function completeLesson(lessonId: string, result: LessonResult, exam: boolean): void {
  update((current) => ({
    ...current,
    results: { ...current.results, [lessonId]: result },
    failedAttempts: exam ? { ...current.failedAttempts, [lessonId]: 0 } : current.failedAttempts,
  }));
  flushSave();
}

/** Counts a failed exam delivery and returns how many there have been. */
export function recordFailedAttempt(lessonId: string): number {
  const attempts = (state.failedAttempts[lessonId] ?? 0) + 1;
  update((current) => ({
    ...current,
    failedAttempts: { ...current.failedAttempts, [lessonId]: attempts },
  }));
  flushSave();
  return attempts;
}

export function findSecret(lessonId: string): void {
  update((current) =>
    current.foundSecrets[lessonId]
      ? current
      : { ...current, foundSecrets: { ...current.foundSecrets, [lessonId]: true } },
  );
}

export function markRegionSeen(regionIndex: number): void {
  update((current) =>
    current.seenRegions[regionIndex]
      ? current
      : { ...current, seenRegions: { ...current.seenRegions, [regionIndex]: true } },
  );
}

export function changeSettings(change: Partial<Settings>): void {
  update((current) => ({ ...current, settings: { ...current.settings, ...change } }));
}

/** Forgets every lesson, keeping the settings and the world. */
export function resetProgress(): void {
  update((current) => ({ ...EMPTY_PROGRESS, settings: current.settings, world: current.world }));
  flushSave();
}

/** Replaces the whole state: used by cloud sync and by the self-test, which puts the real one back. */
export function replaceProgress(next: Progress): void {
  update(() => next);
  flushSave();
}
