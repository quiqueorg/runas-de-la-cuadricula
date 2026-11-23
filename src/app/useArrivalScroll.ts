import { useEffect, useLayoutEffect, useRef } from 'react';

/** Names a history entry, in the entry's own state, so its scroll can be found again. */
const ENTRY_KEY = 'runasEntry';

function entryOf(state: unknown): string | null {
  if (typeof state !== 'object' || state === null || !(ENTRY_KEY in state)) return null;
  const entry = (state as Record<string, unknown>)[ENTRY_KEY];
  return typeof entry === 'string' ? entry : null;
}

/** Names the current entry. Null where history refuses it (some sandboxed frames). */
function nameEntry(): string | null {
  const entry = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  try {
    history.replaceState({ ...(history.state as object | null), [ENTRY_KEY]: entry }, '');
    return entry;
  } catch {
    return null;
  }
}

/** How long a restore waits for the page to grow tall enough (a lazy screen still loading). */
const RESTORE_PATIENCE_MS = 3000;
/** Any of these means the player has taken over the scroll. */
const PLAYER_INPUT = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;

/**
 * Scrolls to `y`. While the page is too short to reach it (the screen not rendered yet, or still
 * growing), tries again each time the page grows. Returns what cancels the attempt.
 */
function restoreScroll(y: number): () => void {
  const reached = () => {
    window.scrollTo(0, y);
    return window.scrollY >= y - 1;
  };
  if (reached()) return () => {};
  const observer = new ResizeObserver(() => {
    if (reached()) stop();
  });
  const timer = setTimeout(stop, RESTORE_PATIENCE_MS);
  function stop() {
    observer.disconnect();
    clearTimeout(timer);
    for (const type of PLAYER_INPUT) window.removeEventListener(type, stop);
  }
  observer.observe(document.body);
  for (const type of PLAYER_INPUT) window.addEventListener(type, stop, { passive: true });
  return stop;
}

/**
 * A screen opened from a link or button starts at its top; one reached with back or forward (the
 * browser's buttons, a swipe, Android's back) returns to where the player left it.
 *
 * The browser's own restoration cannot do this: it scrolls while the previous screen is still on
 * the page, so coming back from the map (which does not scroll) to a long lesson lands at the top.
 * Here the scroll is put back once the new screen is there.
 */
export function useArrivalScroll(hash: string): void {
  const positions = useRef(new Map<string, number>());
  const current = useRef<{ entry: string | null; y: number }>({ entry: null, y: 0 });

  useEffect(() => {
    history.scrollRestoration = 'manual';
    // Read on every scroll, written only on navigation: a navigation's own scroll events arrive a
    // frame later, after the position of the screen being left has been saved.
    const track = () => {
      current.current.y = window.scrollY;
    };
    window.addEventListener('scroll', track, { passive: true });
    return () => window.removeEventListener('scroll', track);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: the hash is the trigger, not an input.
  useLayoutEffect(() => {
    const left = current.current;
    if (left.entry) positions.current.set(left.entry, left.y);
    const known = entryOf(history.state);
    const entry = known ?? nameEntry();
    const y = known ? (positions.current.get(known) ?? 0) : 0;
    const cancel = restoreScroll(y);
    current.current = { entry, y: window.scrollY };
    return cancel;
  }, [hash]);
}
