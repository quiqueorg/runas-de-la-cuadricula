/** The one AudioContext the game uses, and the buses every sound goes through. */
import { SILENT } from './dsp';
import { createNoiseBuffers, type NoiseBuffers } from './noise';
import { createRoomReverb } from './reverb';

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

export interface AudioEngine extends NoiseBuffers {
  readonly context: AudioContext;
  /** A limiter in front of the speakers. */
  readonly master: DynamicsCompressorNode;
  /** Where the interface sounds go: a little filtered echo on the way to the master. */
  readonly effectsBus: GainNode;
  /** The music's fader. It starts silent; `music.start` brings it up. */
  readonly musicMaster: GainNode;
  /** Feeds the music's room reverb. */
  readonly reverbSend: GainNode;
}

/** Keeps stacked effects and overlapping music voices from clipping. */
const LIMITER = { threshold: -10, knee: 12, ratio: 6, attack: 0.004, release: 0.15 } as const;

const EFFECTS_LEVEL = 0.5;
const EFFECTS_ECHO_SECONDS = 0.21;
const EFFECTS_ECHO_MAX_SECONDS = 0.5;
const EFFECTS_ECHO_FEEDBACK = 0.28;
/** Each repeat comes back darker, so the echo stays behind the dry sound. */
const EFFECTS_ECHO_TONE_HZ = 2600;

let current: AudioEngine | null = null;

function resumeIfSuspended(context: AudioContext): void {
  if (context.state === 'suspended') context.resume().catch(() => {});
}

function createLimiter(context: AudioContext): DynamicsCompressorNode {
  const limiter = context.createDynamicsCompressor();
  limiter.threshold.value = LIMITER.threshold;
  limiter.knee.value = LIMITER.knee;
  limiter.ratio.value = LIMITER.ratio;
  limiter.attack.value = LIMITER.attack;
  limiter.release.value = LIMITER.release;
  limiter.connect(context.destination);
  return limiter;
}

function createEffectsBus(context: AudioContext, master: AudioNode): GainNode {
  const bus = context.createGain();
  bus.gain.value = EFFECTS_LEVEL;
  const echo = context.createDelay(EFFECTS_ECHO_MAX_SECONDS);
  echo.delayTime.value = EFFECTS_ECHO_SECONDS;
  const feedback = context.createGain();
  feedback.gain.value = EFFECTS_ECHO_FEEDBACK;
  const tone = context.createBiquadFilter();
  tone.type = 'lowpass';
  tone.frequency.value = EFFECTS_ECHO_TONE_HZ;
  bus.connect(master);
  bus.connect(echo);
  echo.connect(tone);
  tone.connect(feedback);
  feedback.connect(echo);
  tone.connect(master);
  return bus;
}

function createEngine(): AudioEngine | null {
  const AudioContextClass = window.AudioContext ?? window.webkitAudioContext;
  if (!AudioContextClass) return null;
  const context = new AudioContextClass();
  const master = createLimiter(context);
  const effectsBus = createEffectsBus(context, master);
  const musicMaster = context.createGain();
  musicMaster.gain.value = SILENT;
  musicMaster.connect(master);
  const reverbSend = createRoomReverb(context, musicMaster);
  return { context, master, effectsBus, musicMaster, reverbSend, ...createNoiseBuffers(context) };
}

/**
 * The engine, created on first use. Browsers keep a new AudioContext suspended until a user
 * gesture, so every call also asks it to resume. Null where Web Audio is unavailable.
 */
export function getEngine(): AudioEngine | null {
  if (current) {
    resumeIfSuspended(current.context);
    return current;
  }
  try {
    current = createEngine();
    if (current) resumeIfSuspended(current.context);
    return current;
  } catch {
    return null;
  }
}

/** The engine if one has been created, without creating it. */
export function existingEngine(): AudioEngine | null {
  return current;
}

/** Closes the AudioContext; the next `getEngine` starts a fresh one. */
export function disposeEngine(): void {
  current?.context.close().catch(() => {});
  current = null;
}
