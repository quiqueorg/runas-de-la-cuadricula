/** The app shell: picks the screen for the current route and owns the dialogs above it. */
import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { levelsById } from '../core/catalog';
import type { WorldId } from '../core/models';
import { goToLesson, goToMap, parseRoute, useHash } from '../core/navigation';
import { currentWorld } from '../core/progress/queries';
import { resetProgress, useProgress } from '../core/progress/store';
import { Home } from '../features/home';
import { type AppDialog, Dialogs } from './Dialogs';

const MapScreen = lazy(() => import('../features/map').then((mod) => ({ default: mod.MapScreen })));
const Lesson = lazy(() =>
  import('../features/challenge').then((mod) => ({ default: mod.Challenge })),
);

type View = 'home' | 'map' | 'challenge';

/** Styles key off the body: `data-view` for the screen, `data-world` for the world's backdrop. */
function useDocumentChrome(view: View, world: WorldId): void {
  useEffect(() => {
    document.body.dataset.view = view;
    document.body.dataset.world = world;
    if (view === 'home') document.title = 'Runas de la Cuadrícula';
    else if (view === 'map') document.title = 'Mapa · Runas de la Cuadrícula';
  }, [view, world]);
}

export function App() {
  const hash = useHash();
  const progress = useProgress();
  const [dialog, setDialog] = useState<AppDialog | null>(null);
  const close = useCallback(() => setDialog(null), []);

  // Any navigation dismisses the dialog that led to it.
  // biome-ignore lint/correctness/useExhaustiveDependencies: the hash is the trigger, not an input.
  useEffect(close, [hash]);

  const route = parseRoute(hash);
  const level = route.view === 'challenge' ? levelsById[route.lessonId] : undefined;
  // An unknown lesson id falls back to the title screen.
  const view: View = route.view === 'challenge' && !level ? 'home' : route.view;
  useDocumentChrome(view, level?.world ?? currentWorld(progress));

  return (
    <>
      <div id="backdrop" aria-hidden="true">
        <div className="backdrop-scene" />
        <div className="backdrop-veil" />
      </div>
      <Suspense fallback={null}>
        {view === 'home' && (
          <Home onConfirmReset={(text) => setDialog({ kind: 'new-game', text })} />
        )}
        {view === 'map' && (
          <MapScreen onSecret={(secret) => setDialog({ kind: 'secret', secret })} />
        )}
        {view === 'challenge' && level && (
          <Lesson
            key={level.id}
            level={level}
            onVictory={(model) => setDialog({ kind: 'victory', model })}
          />
        )}
      </Suspense>
      {dialog && (
        <Dialogs
          dialog={dialog}
          onClose={close}
          onReset={() => {
            close();
            resetProgress();
          }}
          onOpenLesson={(id) => {
            close();
            goToLesson(id);
          }}
          onMap={() => {
            close();
            goToMap();
          }}
        />
      )}
    </>
  );
}
