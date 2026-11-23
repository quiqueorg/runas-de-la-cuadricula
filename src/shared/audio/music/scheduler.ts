/**
 * The look-ahead scheduler. A timer wakes it every 100 ms and it queues, at exact AudioContext
 * times, every eighth note due before `now + lookahead`. Timers are late and jittery; the audio
 * clock isn't, so notes are timed by it and the timer only has to keep the queue topped up.
 */
import type { Scene } from './scenes';
import type { MusicOutput } from './trackBus';
import { applyPendingScene, transport } from './transport';

/** One eighth note of a score, and where it falls. */
export interface Beat extends MusicOutput {
  readonly scene: Scene;
  readonly bar: number;
  /** The eighth within the bar, from 0. */
  readonly slot: number;
  readonly cycle: number;
  /** When it sounds, in AudioContext time. */
  readonly time: number;
  /** The length of an eighth at the scene's tempo (s). */
  readonly eighth: number;
}

export interface Score {
  /** How far ahead to queue notes (s). */
  readonly lookahead: number;
  /** The length of an eighth note at the score's own tempo (s). */
  readonly eighth: number;
  readonly slotsPerBar: number;
  /** Eighths before the song goes round again. */
  readonly slotsPerCycle: number;
  playBeat(beat: Beat): void;
}

/** Never queue a note this close to now: it would start late and click. */
const MIN_LEAD = 0.02;
/** If the scheduler fell further behind than this, it skips ahead instead of catching up. */
const MAX_LAG = 0.15;
const RESUME_LEAD = 0.05;

/** Mobile timers stall in the background; catching up afterwards would play a burst of notes. */
function clampDrift(now: number): void {
  if (transport.nextTime < now - MAX_LAG) transport.nextTime = now + RESUME_LEAD;
}

/** Queues the score's notes up to `lookahead` seconds ahead. */
export function schedule(score: Score, output: MusicOutput): void {
  const now = output.engine.context.currentTime;
  clampDrift(now);
  while (transport.nextTime < now + score.lookahead) {
    const bar = Math.floor(transport.step / score.slotsPerBar);
    const slot = transport.step % score.slotsPerBar;
    if (slot === 0) applyPendingScene();
    const scene = transport.scene;
    const eighth = score.eighth * (scene.stretch || 1);
    const time = Math.max(transport.nextTime, now + MIN_LEAD);
    score.playBeat({ ...output, scene, bar, slot, cycle: transport.cycle, time, eighth });
    transport.nextTime += eighth;
    if (++transport.step >= score.slotsPerCycle) {
      transport.step = 0;
      transport.cycle++;
    }
  }
}
