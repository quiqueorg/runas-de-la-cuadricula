/** The bus a song plays into. Each song gets a fresh one, so a new song never inherits old tails. */
import { glideGain, SILENT } from '../dsp';
import type { AudioEngine } from '../engine';

export interface TrackBus {
  /** The song's fader; percussion and ambience go straight here. */
  readonly gain: GainNode;
  /** The kalimba's wooden body: tuned voices go through it before the fader. */
  readonly body: BiquadFilterNode;
  /** The recorded loop, when the song is one. */
  loop?: AudioBufferSourceNode;
  /** Set while the recorded loop is being fetched and decoded. */
  loading?: boolean;
}

/** Where an instrument plays: the engine and the current song's bus. */
export interface MusicOutput {
  readonly engine: AudioEngine;
  readonly bus: TrackBus;
}

/** A gentle lift of the low mids, like the resonance of a wooden box. */
const BODY_HZ = 280;
const BODY_Q = 1.1;
const BODY_GAIN_DB = 3.5;
/** Tames the highs, which on a thin speaker sound glassy. */
const SOFTEN_HZ = 5000;
const SOFTEN_Q = 0.5;
const FADE_IN_TAU = 0.2;
const RETIRE_TAU = 0.12;
/** A source stopped after six time constants is past -50 dB, so the cut is inaudible. */
const LOOP_STOP_TAUS = 6;
/** How long to wait before disconnecting, so queued notes finish fading first. */
const DISCONNECT_MIN_MS = 900;
const DISCONNECT_MS_PER_TAU = 5000;

/**
 * A new bus. With a `fadeInDelay` it stays silent that long and then fades in, for crossfades;
 * `withReverb` sends it to the room (the recorded title loop is played dry).
 */
export function createTrackBus(
  engine: AudioEngine,
  fadeInDelay: number,
  withReverb: boolean,
): TrackBus {
  const { context, musicMaster, reverbSend } = engine;
  const gain = context.createGain();
  const now = context.currentTime;
  if (fadeInDelay > 0) {
    gain.gain.setValueAtTime(SILENT, now);
    gain.gain.setTargetAtTime(1, now + fadeInDelay, FADE_IN_TAU);
  } else {
    gain.gain.setValueAtTime(1, now);
  }
  const body = context.createBiquadFilter();
  body.type = 'peaking';
  body.frequency.value = BODY_HZ;
  body.Q.value = BODY_Q;
  body.gain.value = BODY_GAIN_DB;
  const soften = context.createBiquadFilter();
  soften.type = 'lowpass';
  soften.frequency.value = SOFTEN_HZ;
  soften.Q.value = SOFTEN_Q;
  body.connect(soften);
  soften.connect(gain);
  gain.connect(musicMaster);
  if (withReverb) gain.connect(reverbSend);
  return { gain, body };
}

/** Fades a bus out, stops its loop and disconnects it once its notes have died away. */
export function retireTrackBus(bus: TrackBus | null, engine: AudioEngine, tau = RETIRE_TAU): void {
  if (!bus) return;
  const now = engine.context.currentTime;
  glideGain(bus.gain.gain, SILENT, now, tau);
  bus.loop?.stop(now + LOOP_STOP_TAUS * tau);
  window.setTimeout(
    () => {
      try {
        bus.body.disconnect();
        bus.gain.disconnect();
      } catch {
        /* already disconnected */
      }
    },
    Math.max(DISCONNECT_MIN_MS, tau * DISCONNECT_MS_PER_TAU),
  );
}
