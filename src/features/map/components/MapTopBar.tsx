import { Rune } from '../../../shared/icons/Rune';
import { MusicToggle } from '../../settings/MusicToggle';
import { INDEX_PANEL_ID } from './LessonIndexPanel';

export function MapTopBar({
  title,
  subtitle,
  indexOpen,
  onHome,
  onToggleIndex,
}: {
  readonly title: string;
  readonly subtitle: string;
  readonly indexOpen: boolean;
  readonly onHome: () => void;
  readonly onToggleIndex: () => void;
}) {
  return (
    <header className="top-bar">
      <button className="button icon-text" type="button" onClick={onHome}>
        <Rune id="i-atras" />
        <span>Inicio</span>
      </button>
      <div className="top-bar-title">
        <span className="region-kicker">{subtitle}</span>
        <h2>{title}</h2>
      </div>
      <div className="bar-nav">
        <MusicToggle />
        <button
          className="button icon-text"
          type="button"
          aria-expanded={indexOpen}
          aria-controls={INDEX_PANEL_ID}
          onClick={onToggleIndex}
        >
          <Rune id="i-lista" />
          <span>Índice</span>
        </button>
      </div>
    </header>
  );
}
