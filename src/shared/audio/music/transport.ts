/** Where the music is: the song, its scene and the scheduler's position, shared by the music modules. */
import { type Scene, type Song, TITLE_SCENE, TITLE_SCENE_NAME } from './scenes';
import type { TrackBus } from './trackBus';

interface Transport {
  song: Song;
  /** The name last passed to `music.setScene`. */
  sceneName: string;
  scene: Scene;
  /** A scene of the same song waiting for the next bar, so tempo changes land on the beat. */
  pendingScene: Scene | null;
  trackBus: TrackBus | null;
  /** The scheduler's interval id; 0 while the music is stopped. */
  timer: number;
  /** When the next eighth note is due, in AudioContext time. */
  nextTime: number;
  /** The next eighth note within the song's cycle. */
  step: number;
  /** How many times the song has gone round; odd passes play the variations. */
  cycle: number;
}

export const transport: Transport = {
  song: 'menu',
  sceneName: TITLE_SCENE_NAME,
  scene: TITLE_SCENE,
  pendingScene: null,
  trackBus: null,
  timer: 0,
  nextTime: 0,
  step: 0,
  cycle: 0,
};

export function applyPendingScene(): void {
  if (transport.pendingScene) {
    transport.scene = transport.pendingScene;
    transport.pendingScene = null;
  }
}
