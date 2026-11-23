import { music } from './music/player';
import { audioSettings } from './settings';

/** Applies the player's settings; turning music on or off starts or stops it straight away. */
export function configureAudio(settings: {
  readonly sound: boolean;
  readonly music: boolean;
}): void {
  audioSettings.sound = settings.sound;
  if (audioSettings.music === settings.music) return;
  audioSettings.music = settings.music;
  if (settings.music) music.start();
  else music.stop();
}
