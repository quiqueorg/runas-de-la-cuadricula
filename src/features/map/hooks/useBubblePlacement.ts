import { type RefObject, useLayoutEffect } from 'react';

/** Room the bubble keeps from the sheet's edges and from the visible part of the scroller. */
const SHEET_MARGIN = 12;
const VIEW_MARGIN = 6;
/** Between the speaker and the bubble's tail. */
const GAP = 10;

/**
 * Keeps a speech bubble over its speaker as the chart scrolls and resizes: centred above it, below
 * when there is no room above, inside the sheet, and hidden while the speaker is out of view.
 * The bubble must be a child of the sheet it is positioned in.
 * @param joke what the bubble says; a new one re-places it, since the speaker may have changed.
 */
export function useBubblePlacement(
  bubbleRef: RefObject<HTMLElement | null>,
  speakerRef: RefObject<HTMLElement | null>,
  scrollRef: RefObject<HTMLElement | null>,
  joke: unknown,
): void {
  // biome-ignore lint/correctness/useExhaustiveDependencies: `joke` says when to re-place.
  useLayoutEffect(() => {
    const bubble = bubbleRef.current;
    const speaker = speakerRef.current;
    const sheet = bubble?.parentElement;
    const scroller = scrollRef.current;
    if (!bubble || !speaker || !sheet || !scroller) return;
    // Point at the figure, not at its (larger) button.
    const figure = speaker.querySelector('.rune') ?? speaker;
    const place = () => {
      const anchor = figure.getBoundingClientRect();
      const sheetBox = sheet.getBoundingClientRect();
      const view = scroller.getBoundingClientRect();
      const centre = anchor.left + anchor.width / 2;
      const leftEdge = Math.max(sheetBox.left + SHEET_MARGIN, view.left + VIEW_MARGIN);
      const rightEdge = Math.min(sheetBox.right - SHEET_MARGIN, view.right - VIEW_MARGIN);
      const left = Math.max(
        leftEdge,
        Math.min(centre - bubble.offsetWidth / 2, rightEdge - bubble.offsetWidth),
      );
      const above = anchor.top - GAP - bubble.offsetHeight;
      const below = above < Math.max(sheetBox.top + SHEET_MARGIN, view.top + VIEW_MARGIN);
      const outOfView =
        centre < view.left ||
        centre > view.right ||
        anchor.bottom < view.top ||
        anchor.top > view.bottom;
      bubble.style.visibility = outOfView ? 'hidden' : 'visible';
      bubble.style.left = `${left - sheetBox.left}px`;
      bubble.style.top = `${(below ? anchor.bottom + GAP : above) - sheetBox.top}px`;
      // Where the tail points, from the bubble's own left edge.
      bubble.style.setProperty('--ax', `${centre - left - bubble.clientLeft}px`);
      bubble.classList.toggle('abajo', below);
    };
    place();
    const observer = new ResizeObserver(place);
    for (const node of [figure, bubble, sheet, scroller]) observer.observe(node);
    scroller.addEventListener('scroll', place, { passive: true });
    return () => {
      observer.disconnect();
      scroller.removeEventListener('scroll', place);
    };
  }, [joke, bubbleRef, speakerRef, scrollRef]);
}
