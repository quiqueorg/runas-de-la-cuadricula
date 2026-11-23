/** The lesson's top bar: back to the map, the title, and the previous and next lessons. */
import { useRef } from 'react';
import { goToLesson, goToMap } from '../../../core/navigation';
import { useFocusOnMount } from '../../../shared/focus/useFocusOnMount';
import { Rune } from '../../../shared/icons/Rune';
import { MusicToggle } from '../../settings/MusicToggle';
import type { LessonChrome } from '../chrome';

export function TopBar({ chrome }: { readonly chrome: LessonChrome }) {
  const { previousId, nextId } = chrome;
  const heading = useRef<HTMLHeadingElement>(null);
  useFocusOnMount(heading);
  return (
    <header className="top-bar">
      <button className="button icon-text" type="button" onClick={goToMap}>
        <Rune id="i-mapa" />
        <span>Mapa</span>
      </button>
      <div className="top-bar-title">
        <span className="region-kicker">{chrome.kicker}</span>
        <h2 ref={heading} tabIndex={-1}>
          <span className="step-number">{chrome.step}</span> <span>{chrome.title}</span>
        </h2>
      </div>
      <div className="bar-nav">
        <MusicToggle />
        <button
          className="button icon-only"
          type="button"
          aria-label="Ejercicio anterior"
          disabled={!previousId}
          onClick={() => previousId && goToLesson(previousId)}
        >
          <Rune id="i-atras" />
        </button>
        <span className="progress-label">{chrome.progressLabel}</span>
        <button
          className="button icon-only"
          type="button"
          aria-label="Ejercicio siguiente"
          disabled={!nextId}
          onClick={() => nextId && goToLesson(nextId)}
        >
          <Rune id="i-adelante" />
        </button>
      </div>
    </header>
  );
}
