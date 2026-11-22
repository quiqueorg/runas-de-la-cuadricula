/** Music toggle. The preference lives in progress; this only draws the button. */
import { progress, saveProgress } from '../../core/state';
import { useGame } from '../../core/useGame';
import { Rune } from '../icons/Rune';
import { music } from './audio';

export function MusicButton() {
  useGame();
  return (
    <button className="button icon-only music-toggle" type="button" aria-pressed={progress.musica} aria-label="Música de ambiente" onClick={() => { progress.musica = !progress.musica; saveProgress(); if (progress.musica) music.sonar(); else music.callar(); }}>
      <Rune id="i-musica" className="icon-on" />
      <Rune id="i-musica-no" className="icon-off" />
    </button>
  );
}
