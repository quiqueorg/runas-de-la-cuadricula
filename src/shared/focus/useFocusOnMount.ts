import { type RefObject, useEffect } from 'react';

/**
 * Moves focus to a screen's heading when the screen opens. Without it, the control that led there
 * is gone and focus falls to the page body: a screen reader announces nothing and the keyboard
 * starts over from the top. The heading needs `tabIndex={-1}`. The scroll is left alone: it is the
 * browser's to restore when the player comes back.
 */
export function useFocusOnMount(ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, [ref]);
}
