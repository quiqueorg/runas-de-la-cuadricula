/** The band around the kalimba: a bass, a wooden flute and an electric piano. */
import { decayedLevel, isPlayable, SILENT } from '../../dsp';
import type { MusicOutput } from '../trackBus';

const BASS_ATTACK = 0.008;
const BASS_TAU_PER_LENGTH = 0.16;
const BASS_DECAY_TAUS = 6.2;
const BASS_MAX_DECAY_SECONDS = 2.6;
/** Keeps the bass round and out of the kalimba's register. */
const BASS_TONE_HZ = 680;

/** A plucked bass: a triangle and a sine in unison, low-passed. `length` scales how long it rings. */
export function playBass(
  { engine, bus }: MusicOutput,
  frequency: number,
  time: number,
  level: number,
  length: number,
): void {
  const { context } = engine;
  const triangle = context.createOscillator();
  const sine = context.createOscillator();
  const lowpass = context.createBiquadFilter();
  const gain = context.createGain();
  const tau = BASS_TAU_PER_LENGTH * length;
  const decayDuration = Math.min(BASS_MAX_DECAY_SECONDS, tau * BASS_DECAY_TAUS);
  const end = time + BASS_ATTACK + decayDuration;
  const endLevel = decayedLevel(level, decayDuration, tau);
  triangle.type = 'triangle';
  triangle.frequency.value = frequency;
  sine.type = 'sine';
  sine.frequency.value = frequency;
  lowpass.type = 'lowpass';
  lowpass.frequency.value = BASS_TONE_HZ;
  gain.gain.setValueAtTime(SILENT, time);
  gain.gain.linearRampToValueAtTime(level, time + BASS_ATTACK);
  gain.gain.setTargetAtTime(SILENT, time + BASS_ATTACK, tau);
  gain.gain.setValueAtTime(endLevel, end);
  gain.gain.linearRampToValueAtTime(0, end + 0.03);
  triangle.connect(lowpass);
  sine.connect(lowpass);
  lowpass.connect(gain);
  gain.connect(bus.gain);
  triangle.start(time);
  sine.start(time);
  triangle.stop(end + 0.04);
  sine.stop(end + 0.04);
}

const FLUTE_VIBRATO_HZ = 5.2;
/** Vibrato depth as a fraction of the pitch (about a tenth of a semitone). */
const FLUTE_VIBRATO_DEPTH = 0.006;

/** A wooden flute, held and breathing: a sine with a slow vibrato and a soft attack. */
export function playFlute(
  { engine, bus }: MusicOutput,
  frequency: number,
  time: number,
  duration: number,
  level: number,
): void {
  const { context } = engine;
  if (!isPlayable(context, frequency)) return;
  const oscillator = context.createOscillator();
  const vibrato = context.createOscillator();
  const depth = context.createGain();
  const gain = context.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  vibrato.frequency.value = FLUTE_VIBRATO_HZ;
  depth.gain.value = frequency * FLUTE_VIBRATO_DEPTH;
  vibrato.connect(depth);
  depth.connect(oscillator.frequency);
  gain.gain.setValueAtTime(SILENT, time);
  gain.gain.linearRampToValueAtTime(level, time + 0.09);
  gain.gain.setValueAtTime(level, time + duration * 0.7);
  gain.gain.linearRampToValueAtTime(SILENT, time + duration);
  gain.gain.linearRampToValueAtTime(0, time + duration + 0.02);
  oscillator.connect(gain);
  gain.connect(bus.body);
  oscillator.start(time);
  vibrato.start(time);
  oscillator.stop(time + duration + 0.05);
  vibrato.stop(time + duration + 0.05);
}

const KEYS_TONE_HZ = 950;
const KEYS_TREMOLO_HZ = 4.6;
/** Tremolo depth as a fraction of the level. */
const KEYS_TREMOLO_DEPTH = 0.25;
/** A faint, slightly sharp octave on a triangle gives the tine-like bark of an electric piano. */
const KEYS_OCTAVE_RATIO = 2.001;
const KEYS_OCTAVE_LEVEL = 0.1;
/** The note sags to this fraction of its peak while held. */
const KEYS_SUSTAIN = 0.45;
const KEYS_RING_OUT = 0.8;

/** An electric piano, worn and warm: a sine pair with a slow tremolo, rounded off by a lowpass. */
export function playKeys(
  { engine, bus }: MusicOutput,
  frequency: number,
  time: number,
  duration: number,
  level: number,
): void {
  const { context } = engine;
  if (!isPlayable(context, frequency)) return;
  const fundamental = context.createOscillator();
  const octave = context.createOscillator();
  const lowpass = context.createBiquadFilter();
  const gain = context.createGain();
  const tremolo = context.createOscillator();
  const depth = context.createGain();
  fundamental.type = 'sine';
  fundamental.frequency.value = frequency;
  octave.type = 'triangle';
  octave.frequency.value = frequency * KEYS_OCTAVE_RATIO;
  lowpass.type = 'lowpass';
  lowpass.frequency.value = KEYS_TONE_HZ;
  tremolo.frequency.value = KEYS_TREMOLO_HZ;
  depth.gain.value = level * KEYS_TREMOLO_DEPTH;
  tremolo.connect(depth);
  depth.connect(gain.gain);
  const octaveGain = context.createGain();
  octaveGain.gain.value = KEYS_OCTAVE_LEVEL;
  fundamental.connect(lowpass);
  octave.connect(octaveGain);
  octaveGain.connect(lowpass);
  lowpass.connect(gain);
  gain.connect(bus.body);
  gain.gain.setValueAtTime(SILENT, time);
  gain.gain.linearRampToValueAtTime(level, time + 0.012);
  gain.gain.setTargetAtTime(level * KEYS_SUSTAIN, time + 0.012, 0.35);
  gain.gain.setTargetAtTime(SILENT, time + duration, 0.18);
  const end = time + duration + KEYS_RING_OUT;
  fundamental.start(time);
  octave.start(time);
  tremolo.start(time);
  fundamental.stop(end);
  octave.stop(end);
  tremolo.stop(end);
}
