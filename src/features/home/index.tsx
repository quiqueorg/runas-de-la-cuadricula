/** Title screen: the adventures, new game and the sound switches. */
import { useEffect, useState } from 'react';
import type { WorldId } from '../../core/models';
import { goToMap } from '../../core/navigation';
import { finaleUnlocked } from '../../core/progress/queries';
import {
  changeSettings,
  enterWorld,
  getProgress,
  resetProgress,
  useProgress,
} from '../../core/progress/store';
import { music, sound } from '../../shared/audio/audio';
import { HomeView } from './HomeView';
import { adventureCards, resetWarning } from './model';

export interface HomeProps {
  /** Ask the player to confirm before the progress is wiped. */
  readonly onConfirmReset: (warning: string) => void;
}

export function Home({ onConfirmReset }: HomeProps) {
  const progress = useProgress();
  const [shake, setShake] = useState(false);

  useEffect(() => {
    music.setScene('inicio');
  }, []);

  const select = (world: WorldId) => {
    if (world === 'finale' && !finaleUnlocked(getProgress())) {
      sound.error();
      // Restart the animation even if it is still running from the last click.
      setShake(false);
      requestAnimationFrame(() => setShake(true));
      return;
    }
    sound.click();
    enterWorld(world);
    goToMap();
  };

  const newGame = () => {
    sound.click();
    const warning = resetWarning(getProgress());
    if (warning) onConfirmReset(warning);
    else resetProgress();
  };

  return (
    <HomeView
      cards={adventureCards(progress)}
      shake={shake}
      soundOn={progress.settings.sound}
      onSelect={select}
      onNewGame={newGame}
      onToggleSound={() => {
        changeSettings({ sound: !progress.settings.sound });
        sound.click();
      }}
    />
  );
}
