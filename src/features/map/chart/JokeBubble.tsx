import type { RefObject } from 'react';
import { useRef } from 'react';
import { useBubblePlacement } from '../hooks/useBubblePlacement';
import type { Joke } from '../inhabitants';

/** What an inhabitant says, in a bubble over them. Must sit directly in the chart's sheet. */
export function JokeBubble({
  joke,
  speakerRef,
  scrollRef,
}: {
  readonly joke: Joke;
  readonly speakerRef: RefObject<HTMLElement | null>;
  readonly scrollRef: RefObject<HTMLElement | null>;
}) {
  const bubbleRef = useRef<HTMLDivElement>(null);
  useBubblePlacement(bubbleRef, speakerRef, scrollRef, joke);
  return (
    <div ref={bubbleRef} className="chiste" role="status">
      <b>{joke.name}</b>
      {joke.text}
    </div>
  );
}
