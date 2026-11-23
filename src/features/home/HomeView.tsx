/** Title screen markup. */
import { useRef, useState } from 'react';
import type { WorldId } from '../../core/models';
import { useFocusOnMount } from '../../shared/focus/useFocusOnMount';
import { Rune } from '../../shared/icons/Rune';
import { MusicToggle } from '../settings/MusicToggle';
import type { AdventureCard } from './model';

/** Floating specks of light over the title screen. */
const MOTE_COUNT = 26;

export function HomeView({
  cards,
  shake,
  soundOn,
  onSelect,
  onNewGame,
  onToggleSound,
}: {
  readonly cards: readonly AdventureCard[];
  readonly shake: boolean;
  readonly soundOn: boolean;
  readonly onSelect: (world: WorldId) => void;
  readonly onNewGame: () => void;
  readonly onToggleSound: () => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  useFocusOnMount(heading);
  const [motes] = useState(() =>
    Array.from({ length: MOTE_COUNT }, (_, id) => ({
      id,
      left: Math.random() * 100,
      duration: 9 + Math.random() * 12,
      delay: 0,
      drift: Math.random() * 80 - 40,
      scale: 0.5 + Math.random(),
    })).map((mote) => ({ ...mote, delay: -Math.random() * mote.duration })),
  );

  return (
    <section id="view-home" className="view">
      <div className="motes" aria-hidden="true">
        {motes.map((mote) => (
          <i
            key={mote.id}
            style={{
              left: `${mote.left.toFixed(1)}%`,
              animationDuration: `${mote.duration.toFixed(1)}s`,
              animationDelay: `${mote.delay.toFixed(1)}s`,
              ['--dx' as string]: `${mote.drift.toFixed(0)}px`,
              transform: `scale(${mote.scale.toFixed(2)})`,
            }}
          />
        ))}
      </div>
      <div className="game-header">
        <Rune id="emblema" className="emblem" title="Runas de la Cuadrícula" />
        <h1 className="logo" ref={heading} tabIndex={-1}>
          <span className="l1">Runas de la</span>
          <span className="l2">Cuadrícula</span>
        </h1>
        <p className="tagline">
          Aprende CSS escribiéndolo: los fundamentos en la isla, Grid en la superficie, Flexbox en
          las profundidades y, en los cielos, media queries, variables y transiciones
        </p>
      </div>
      <nav className="main-menu adventure-list" aria-label="Elige aventura">
        {cards.map((card) => (
          <button
            key={card.world}
            className={`adventure ${card.className} ${card.locked ? 'locked' : ''} ${card.world === 'finale' && shake ? 'shake' : ''}`}
            type="button"
            aria-disabled={card.locked}
            onClick={() => onSelect(card.world)}
          >
            <span className="adventure-image" aria-hidden="true" />
            <span className="adventure-copy">
              <span className="adventure-tech">{card.tech}</span>
              <span className="adventure-title">{card.title}</span>
              <span className="adventure-progress">{card.status}</span>
              <span className="adventure-bar" aria-hidden="true">
                <i style={{ width: `${card.percent.toFixed(1)}%` }} />
              </span>
            </span>
            <span className="adventure-cta">{card.action}</span>
          </button>
        ))}
        <button className="button" type="button" onClick={onNewGame}>
          <span>Nueva partida</span>
        </button>
      </nav>
      <footer className="home-footer">
        <span className="progress-label" />
        <MusicToggle />
        <button
          id="sound-toggle"
          className="button icon-only"
          type="button"
          aria-pressed={soundOn}
          aria-label="Efectos de sonido"
          onClick={onToggleSound}
        >
          <Rune id="i-sonido" className="icon-on" />
          <Rune id="i-mudo" className="icon-off" />
        </button>
      </footer>
    </section>
  );
}
