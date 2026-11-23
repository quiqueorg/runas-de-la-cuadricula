/** The background music: start, stop, and follow the player from place to place. */
import { glideGain, SILENT } from '../dsp';
import { existingEngine, getEngine } from '../engine';
import { audioSettings } from '../settings';
import { playMenuLoop } from './recording';
import { resolveScene, type Song } from './scenes';
import { type Score, schedule } from './scheduler';
import { isleScore } from './scores/isle';
import { skyScore } from './scores/sky';
import { surfaceScore } from './scores/surface';
import { undergroundScore } from './scores/underground';
import { createTrackBus, type MusicOutput, retireTrackBus } from './trackBus';
import { applyPendingScene, transport } from './transport';

const SCORES: Readonly<Record<Exclude<Song, 'menu'>, Score>> = {
  underground: undergroundScore,
  sky: skyScore,
  isle: isleScore,
  surface: surfaceScore,
};

/** How often the scheduler tops up its queue; well inside every score's look-ahead. */
const SCHEDULER_INTERVAL_MS = 100;
const MUSIC_LEVEL = 0.55;
const FADE_IN_TAU = 0.45;
const FADE_OUT_TAU = 0.25;
/** When starting, the first note waits this long, for the fade-in to get going. */
const START_DELAY = 0.25;
/** On a change of song the new bus stays silent this long while the old one fades… */
const CROSSFADE_DELAY = 0.16;
/** …and its first note waits this long. */
const NEW_SONG_DELAY = 0.22;

function ensureTrackBus(): MusicOutput | null {
  const engine = getEngine();
  if (!engine) return null;
  if (!transport.trackBus)
    transport.trackBus = createTrackBus(engine, 0, transport.song !== 'menu');
  return { engine, bus: transport.trackBus };
}

/** The timer's tick: queue the score's next notes, or keep the title loop playing. */
function scheduleNotes(): void {
  if (!audioSettings.music) return;
  const output = ensureTrackBus();
  if (!output) return;
  if (output.engine.context.state !== 'running') return;
  if (transport.song !== 'menu') {
    schedule(SCORES[transport.song], output);
    return;
  }
  // only the title screen still plays a recorded loop
  applyPendingScene();
  if (!output.bus.loading) void playMenuLoop(output);
}

function startMusic(): void {
  if (!audioSettings.music) return;
  const output = ensureTrackBus();
  if (!output) return;
  const { engine } = output;
  glideGain(engine.musicMaster.gain, MUSIC_LEVEL, engine.context.currentTime, FADE_IN_TAU);
  if (!transport.timer) {
    transport.step = 0;
    transport.nextTime = engine.context.currentTime + START_DELAY;
    transport.timer = window.setInterval(scheduleNotes, SCHEDULER_INTERVAL_MS);
    scheduleNotes();
  }
}

function stopMusic(): void {
  if (transport.timer) {
    clearInterval(transport.timer);
    transport.timer = 0;
  }
  const engine = existingEngine();
  if (!engine) return;
  glideGain(engine.musicMaster.gain, SILENT, engine.context.currentTime, FADE_OUT_TAU);
  // Drop the notes already queued ~0.5 s ahead: otherwise a quick stop → start (tab switch)
  // lets them play on top of the restarted song.
  retireTrackBus(transport.trackBus, engine, FADE_OUT_TAU);
  transport.trackBus = null;
}

/**
 * Moves the music to the scene `name` (a region terrain, `inicio`, `final` or a secret). A new
 * world crossfades to its own song from the top; a new place in the same world waits for the next
 * bar, so its tempo change lands on the beat.
 */
function setScene(name: string): void {
  if (name === transport.sceneName) return;
  transport.sceneName = name;
  const { song, scene } = resolveScene(name);
  if (song !== transport.song) {
    // A fresh bus, so the old world's notes and tails don't clash with the new song
    transport.song = song;
    transport.scene = scene;
    transport.pendingScene = null;
    transport.step = 0;
    transport.cycle = 0;
    const engine = existingEngine();
    if (engine && transport.timer) {
      retireTrackBus(transport.trackBus, engine);
      transport.trackBus = createTrackBus(engine, CROSSFADE_DELAY, song !== 'menu');
      transport.nextTime = engine.context.currentTime + NEW_SONG_DELAY;
    }
  } else if (transport.timer) {
    transport.pendingScene = scene;
  } else {
    transport.scene = scene;
    transport.pendingScene = null;
  }
}

export const music = { start: startMusic, stop: stopMusic, setScene };
