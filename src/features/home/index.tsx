/** Title screen: cards from the model, sounds and navigation here. */
import { useEffect, useState } from 'react';
import { navigate } from '../../core/navigation';
import { session } from '../../core/session';
import { progress, saveProgress } from '../../core/state';
import { useGame } from '../../core/useGame';
import { music, sound } from '../../shared/audio/audio';
import type { HomeAction } from './actions';
import { HomeView } from './HomeView';
import { adventureCards, clearProgress, decideHome } from './model';

export function Home({ onNewGame }: { readonly onNewGame: (text: string) => void }) {
  useGame();
  const [shake, setShake] = useState(false);
  useEffect(() => { music.escala('inicio'); }, []);

  const apply = (action: HomeAction) => {
    const effect = decideHome(action);
    if (effect.type === 'shake') {
      sound.error();
      setShake(false);
      requestAnimationFrame(() => setShake(true));
      return;
    }
    if (effect.type === 'enter') {
      sound.clic();
      session.world = effect.world;
      progress.mundo = effect.world;
      saveProgress();
      navigate('mapa');
      return;
    }
    if (effect.type === 'confirm-reset') {
      sound.clic();
      onNewGame(effect.text);
      return;
    }
    if (effect.type === 'reset') {
      sound.clic();
      clearProgress();
      saveProgress(true);
      return;
    }
    progress.sonido = !progress.sonido;
    saveProgress();
    sound.clic();
  };

  return <HomeView cards={adventureCards()} shake={shake} soundOn={progress.sonido} onSelect={(world) => apply({ type: 'select', world })} onNewGame={() => apply({ type: 'new-game' })} onToggleSound={() => apply({ type: 'toggle-sound' })} />;
}

export { clearProgress as resetProgress };
