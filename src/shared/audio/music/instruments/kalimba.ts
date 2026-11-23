/** The kalimba and the other struck voices built from decaying sine partials. */
import { decayedLevel, isInaudible, isPlayable, SILENT } from '../../dsp';
import type { MusicOutput } from '../trackBus';

export interface PartialTone {
  readonly frequency: number;
  readonly time: number;
  readonly level: number;
  /** Time constant of the exponential decay (s). */
  readonly decay: number;
  readonly wave?: OscillatorType;
  /** Linear rise to `level` (s). */
  readonly attack?: number;
}

/** After this many time constants a partial is about -50 dB, quiet enough to cut. */
const DECAY_TAUS = 5.8;
const RELEASE = 0.03;
const STOP_MARGIN = 0.04;

/** One sine (or other wave) that rises and decays into the kalimba's wooden body. */
export function playPartial(
  { engine, bus }: MusicOutput,
  { frequency, time, level, decay, wave = 'sine', attack = 0.004 }: PartialTone,
): void {
  const { context } = engine;
  if (!isPlayable(context, frequency)) return;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const decayDuration = decay * DECAY_TAUS;
  const fadeEnd = time + attack + decayDuration;
  const endLevel = decayedLevel(level, decayDuration, decay);
  oscillator.type = wave;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(SILENT, time);
  gain.gain.linearRampToValueAtTime(level, time + attack);
  gain.gain.setTargetAtTime(SILENT, time + attack, decay);
  gain.gain.setValueAtTime(endLevel, fadeEnd);
  gain.gain.linearRampToValueAtTime(0, fadeEnd + RELEASE);
  oscillator.connect(gain);
  gain.connect(bus.body);
  oscillator.start(time);
  oscillator.stop(fadeEnd + STOP_MARGIN);
}

const MIDDLE_C = 261.63;
/** Lower tines ring longer: the decay scales with (middle C / f) to this power. */
const TINE_DECAY_SLOPE = 0.35;
const TINE_DECAY_AT_MIDDLE_C = 1.15;
/** A second partial a hair sharp beats slowly against the first, like a real tine. */
const TINE_BEATING_RATIO = 1.0014;
/** The tine's bright, short metallic overtone (skipped where it would alias). */
const TINE_OVERTONE_RATIO = 6.27;
const NAIL_TAP_HZ = 2600;
const NAIL_TAP_Q = 1.4;

/** A kalimba tine: a fundamental, its beating twin, an octave, a metallic attack and a nail tap. */
export function pluck(output: MusicOutput, frequency: number, time: number, level: number): void {
  if (isInaudible(frequency)) return;
  const { context, tapNoise } = output.engine;
  const decay = TINE_DECAY_AT_MIDDLE_C * (MIDDLE_C / frequency) ** TINE_DECAY_SLOPE;
  playPartial(output, { frequency, time, level, decay });
  playPartial(output, {
    frequency: frequency * TINE_BEATING_RATIO,
    time,
    level: level * 0.24,
    decay: decay * 0.85,
  });
  playPartial(output, { frequency: frequency * 2, time, level: level * 0.07, decay: decay * 0.42 });
  playPartial(output, {
    frequency: frequency * TINE_OVERTONE_RATIO,
    time,
    level: level * 0.12,
    decay: 0.045,
  });
  const tap = context.createBufferSource();
  const bandpass = context.createBiquadFilter();
  const tapGain = context.createGain();
  tap.buffer = tapNoise;
  bandpass.type = 'bandpass';
  bandpass.frequency.value = NAIL_TAP_HZ;
  bandpass.Q.value = NAIL_TAP_Q;
  tapGain.gain.setValueAtTime(level * 0.32, time);
  tap.connect(bandpass);
  bandpass.connect(tapGain);
  tapGain.connect(output.bus.body);
  tap.start(time);
}

/**
 * A bell across the water. Bells ring at inharmonic ratios to their pitch; the low hum an octave
 * down lasts longest. [ratio, level, decay]
 */
const BELL_PARTIALS: readonly (readonly [number, number, number])[] = [
  [1, 1, 2.6],
  [2.76, 0.42, 1.4],
  [5.4, 0.2, 0.7],
  [0.5, 0.3, 3],
];
const BELL_ATTACK = 0.006;

export function playBell(
  output: MusicOutput,
  frequency: number,
  time: number,
  level: number,
): void {
  for (const [ratio, amplitude, decay] of BELL_PARTIALS)
    playPartial(output, {
      frequency: frequency * ratio,
      time,
      level: level * amplitude,
      decay,
      wave: 'sine',
      attack: BELL_ATTACK,
    });
}
