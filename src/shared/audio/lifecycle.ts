/**
 * When the music may play: browsers only allow audio after a user gesture, and a hidden tab should
 * go quiet. Importing this module wires both up.
 */
import { disposeEngine, existingEngine } from './engine';
import { music } from './music/player';
import { audioSettings } from './settings';

declare global {
  interface Window {
    /** Shuts down a previous copy of the audio modules (hot reload / duplicate import). */
    __kalimbaAudioDispose?: () => void;
  }
}

// If an older copy of these modules is still alive (dev hot reload, or the code loaded twice),
// it has its own AudioContext and scheduler and the song would play twice. Shut it down first.
window.__kalimbaAudioDispose?.();

const UNLOCK_EVENTS = ['pointerdown', 'touchend', 'click', 'keydown'] as const;

function removeGestureListeners(): void {
  for (const event of UNLOCK_EVENTS) removeEventListener(event, onFirstGesture);
}

export const onFirstGesture = (): void => {
  if (audioSettings.music) music.start();
  // On touch screens a pointerdown does not unlock audio (touchend/click do), so keep
  // listening until the AudioContext is actually running.
  if (!audioSettings.music || existingEngine()?.context.state === 'running')
    removeGestureListeners();
};

const onVisibility = (): void => {
  if (document.hidden) music.stop();
  else if (audioSettings.music) music.start();
};

for (const event of UNLOCK_EVENTS) addEventListener(event, onFirstGesture);
document.addEventListener('visibilitychange', onVisibility);

window.__kalimbaAudioDispose = () => {
  music.stop();
  removeGestureListeners();
  document.removeEventListener('visibilitychange', onVisibility);
  disposeEngine();
};
