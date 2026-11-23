/**
 * On a phone the pinned board can fold away to leave room to read. It is the best explanation of
 * what the code does, so writing brings it back.
 */
import { type RefObject, useLayoutEffect, useRef, useState } from 'react';

/** Room between the bottom of the pinned board and the field being written. */
const FIELD_CLEARANCE_PX = 12;

export interface BoardFold {
  readonly folded: boolean;
  readonly setFolded: (folded: boolean) => void;
}

/** Unfolding grows the pinned board over the page: scrolls the field being written back below it. */
function revealFocusedField(root: HTMLElement | null): void {
  const field = document.activeElement;
  const board = root?.querySelector('#board-zone');
  if (!(field instanceof HTMLTextAreaElement) || !board || !root?.contains(field)) return;
  if (getComputedStyle(board).position !== 'sticky') return;
  const hiddenBy =
    board.getBoundingClientRect().bottom + FIELD_CLEARANCE_PX - field.getBoundingClientRect().top;
  if (hiddenBy > 0) window.scrollBy(0, -hiddenBy);
}

export function useBoardFold(root: RefObject<HTMLElement | null>): BoardFold {
  const [folded, setFolded] = useState(false);
  const wasFolded = useRef(folded);

  useLayoutEffect(() => {
    const unfolded = wasFolded.current && !folded;
    wasFolded.current = folded;
    if (!unfolded) return;
    // A frame later, once the browser's own scroll anchoring has settled.
    const frame = requestAnimationFrame(() => revealFocusedField(root.current));
    return () => cancelAnimationFrame(frame);
  }, [folded, root]);

  return { folded, setFolded };
}
