/**
 * Hash routes. The URLs are public (players bookmark and share them), so they stay in Spanish:
 * `#mapa`, `#prueba-<lesson id>`, and anything else is the title screen.
 */
import { useSyncExternalStore } from 'react';

export type Route =
  | { readonly view: 'home' }
  | { readonly view: 'map' }
  | { readonly view: 'challenge'; readonly lessonId: string };

const LESSON_PREFIX = 'prueba-';
const MAP_HASH = 'mapa';
const HOME_HASH = 'inicio';

export function parseRoute(hash: string): Route {
  const path = hash.replace(/^#/, '');
  if (path.startsWith(LESSON_PREFIX)) {
    return { view: 'challenge', lessonId: path.slice(LESSON_PREFIX.length) };
  }
  return path === MAP_HASH ? { view: 'map' } : { view: 'home' };
}

export function hashOf(route: Route): string {
  if (route.view === 'challenge') return `${LESSON_PREFIX}${route.lessonId}`;
  return route.view === 'map' ? MAP_HASH : HOME_HASH;
}

// Where the hash cannot be written (some sandboxed frames), the route is kept here instead.
let memoryHash: string | null = null;
const listeners = new Set<() => void>();

const currentHash = (): string => memoryHash ?? location.hash.replace(/^#/, '');

function notify(): void {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener('hashchange', notify);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener('hashchange', notify);
  };
}

export function navigate(route: Route): void {
  const hash = hashOf(route);
  if (currentHash() === hash) return;
  try {
    location.hash = hash;
  } catch {
    memoryHash = hash;
    notify();
  }
}

export const goToLesson = (lessonId: string): void => navigate({ view: 'challenge', lessonId });
export const goToMap = (): void => navigate({ view: 'map' });
export const goHome = (): void => navigate({ view: 'home' });

/** The current hash; parse it with `parseRoute`. A string, so React can compare it cheaply. */
export function useHash(): string {
  return useSyncExternalStore(subscribe, currentHash, () => '');
}
