/** Background music toggle. */
import { Rune } from '../icons/Rune';

export interface MusicButtonProps {
  readonly on: boolean;
  readonly onToggle: () => void;
}

export function MusicButton({ on, onToggle }: MusicButtonProps) {
  return (
    <button
      className="button icon-only music-toggle"
      type="button"
      aria-pressed={on}
      aria-label="Música de ambiente"
      onClick={onToggle}
    >
      <Rune id="i-musica" className="icon-on" />
      <Rune id="i-musica-no" className="icon-off" />
    </button>
  );
}
