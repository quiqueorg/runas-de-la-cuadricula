/** Screens, hash routes and the three dialogs. Drawings stay inside each feature. */
import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { levels, levelsById } from '../core/catalog';
import { initCloudSync } from '../core/cloud';
import { navigate, registerRouteResolver } from '../core/navigation';
import { screenOf } from '../core/screen';
import { session } from '../core/session';
import { progress } from '../core/state';
import { touch } from '../core/store';
import '../core/theme';
import { useGame } from '../core/useGame';
import type { VictoryModel } from '../features/challenge/engine';
import { Home, resetProgress } from '../features/home';
import type { SecretNotice } from '../features/map';
import { registerSymbols } from '../shared/icons/registry';
import { SHELL_SYMBOLS } from '../shared/icons/shellSymbols';
import { AppDialog, Dialogs } from './Dialogs';

registerSymbols(SHELL_SYMBOLS);

const MapScreen = lazy(() => import('../features/map').then((mod) => ({ default: mod.MapViewScreen })));
const Lesson = lazy(() => import('../features/challenge').then((mod) => ({ default: mod.Challenge })));

function currentHash(): string {
  return location.hash.replace(/^#/, '');
}

export function App() {
  useGame();
  const [hash, setHash] = useState(currentHash);
  const [dialog, setDialog] = useState<AppDialog | null>(null);
  const showVictory = useCallback((model: VictoryModel) => setDialog({ kind: 'victory', model }), []);

  useEffect(() => {
    registerRouteResolver((forced) => setHash(forced ?? currentHash()));
    const onHash = () => { setHash(currentHash()); setDialog(null); };
    const onRefresh = () => { touch(); setHash(currentHash()); };
    window.addEventListener('hashchange', onHash);
    window.addEventListener('app-refresh', onRefresh);
    initCloudSync();
    if (/[?&]test\b/.test(location.search)) {
      void import('../features/challenge').then(({ requestFill }) => {
        window.__runas = { NIVELES: levels, rellenar: (id) => { navigate(`prueba-${id}`); requestFill(id, 'sol'); } };
      });
    }
    return () => {
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('app-refresh', onRefresh);
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setDialog(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const screen = screenOf(hash);
  const level = screen.view === 'challenge' ? levelsById[screen.levelId] : undefined;
  const view = screen.view === 'challenge' ? (level ? 'challenge' : 'home') : screen.view;
  if (view === 'map' && progress.mundo) session.world = progress.mundo;
  if (level && view === 'challenge') {
    session.level = level;
    session.world = level.mundo;
  }

  useEffect(() => {
    document.body.dataset.view = view;
    document.body.dataset.mundo = level?.mundo ?? session.world;
    if (view === 'home') document.title = 'Runas de la Cuadrícula';
    else if (view === 'map') document.title = 'Mapa · Runas de la Cuadrícula';
  }, [view, level, session.world]);

  return (
    <>
      <div id="backdrop" aria-hidden="true"><div className="backdrop-scene" /><div className="backdrop-veil" /></div>
      <Suspense fallback={null}>
        {view === 'home' ? <Home onNewGame={(text) => setDialog({ kind: 'new-game', text })} /> : null}
        {view === 'map' ? <MapScreen onSecret={(secret: SecretNotice) => setDialog({ kind: 'secret', secret })} /> : null}
        {view === 'challenge' && level ? <Lesson level={level} onVictory={showVictory} /> : null}
      </Suspense>
      {dialog ? (
        <Dialogs
          dialog={dialog}
          onClose={() => setDialog(null)}
          onReset={() => { setDialog(null); resetProgress(); }}
          onExplore={(id) => { setDialog(null); navigate(`prueba-${id}`); }}
          onMap={() => { setDialog(null); navigate('mapa'); }}
          onNext={(id) => { setDialog(null); navigate(`prueba-${id}`); }}
        />
      ) : null}
    </>
  );
}

declare global {
  interface Window {
    __runas?: {
      NIVELES: typeof levels;
      rellenar: (id: string) => void;
    };
  }
}
