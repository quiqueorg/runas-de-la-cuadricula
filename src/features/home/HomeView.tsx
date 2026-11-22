/** Title screen markup. */
import { useState } from 'react';
import type { WorldId } from '../../core/models';
import { MusicButton } from '../../shared/audio/MusicButton';
import { Rune } from '../../shared/icons/Rune';
import type { AdventureCard } from './model';

export function HomeView({ cards, shake, soundOn, onSelect, onNewGame, onToggleSound }: {
  readonly cards: readonly AdventureCard[];
  readonly shake: boolean;
  readonly soundOn: boolean;
  readonly onSelect: (world: WorldId) => void;
  readonly onNewGame: () => void;
  readonly onToggleSound: () => void;
}) {
  const [motes] = useState(() => Array.from({ length: 26 }, () => ({
    left: Math.random() * 100,
    duration: 9 + Math.random() * 12,
    delay: 0,
    drift: Math.random() * 80 - 40,
    scale: 0.5 + Math.random(),
  })).map((mote) => ({ ...mote, delay: -Math.random() * mote.duration })));

  return (
    <section id="view-home" className="view">
      <div className="motes" aria-hidden="true">
        {motes.map((mote, index) => <i key={index} style={{ left: `${mote.left.toFixed(1)}%`, animationDuration: `${mote.duration.toFixed(1)}s`, animationDelay: `${mote.delay.toFixed(1)}s`, ['--dx' as string]: `${mote.drift.toFixed(0)}px`, transform: `scale(${mote.scale.toFixed(2)})` }} />)}
      </div>
      <div className="game-header">
        <Rune id="emblema" className="emblem" title="Runas de la Cuadrícula" />
        <h1 className="logo"><span className="l1">Runas de la</span><span className="l2">Cuadrícula</span></h1>
        <p className="tagline">Tres aventuras para dominar el CSS: Grid en la superficie, Flexbox en las profundidades y, en los cielos, media queries, variables y transiciones</p>
      </div>
      <nav className="main-menu adventure-list" aria-label="Elige aventura">
        {cards.map((card) => (
          <button key={card.world} className={`adventure ${card.className} ${card.locked ? 'locked' : ''} ${card.world === 'final' && shake ? 'shake' : ''}`} type="button" aria-disabled={card.locked} onClick={() => onSelect(card.world)}>
            <span className="adventure-image" aria-hidden="true" />
            <span className="adventure-copy">
              <span className="adventure-tech">{card.tech}</span>
              <span className="adventure-title">{card.title}</span>
              <span className="adventure-progress">{card.status}</span>
              <span className="adventure-bar" aria-hidden="true"><i style={{ width: `${card.width.toFixed(1)}%` }} /></span>
            </span>
            <span className="adventure-cta">{card.action}</span>
          </button>
        ))}
        <button className="button" type="button" onClick={onNewGame}><span>Nueva partida</span></button>
      </nav>
      <footer className="home-footer">
        <span className="progress-label" />
        <MusicButton />
        <button className="button icon-only" type="button" aria-pressed={soundOn} aria-label="Efectos de sonido" onClick={onToggleSound}>
          <Rune id="i-sonido" className="icon-on" />
          <Rune id="i-mudo" className="icon-off" />
        </button>
      </footer>
    </section>
  );
}
