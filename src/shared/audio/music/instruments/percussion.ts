/** Drums: a kick, noise ticks, a small anvil and a brushed snare. Percussion skips the wooden body. */
import { decayedLevel, SILENT, wouldAlias } from '../../dsp';
import type { MusicOutput } from '../trackBus';

const KICK_ATTACK = 0.004;
const KICK_DECAY_TAU = 0.085;
const KICK_DECAY_SECONDS = 0.516;
/** The pitch drop that makes a sine thump instead of hum. */
const KICK_SWEEP_SECONDS = 0.12;
const KICK_END = 0.55;
const KICK_STOP = 0.57;

/** A kick: a sine that drops from `from` to `to` Hz as it fades. */
export function playKick(
  { engine, bus }: MusicOutput,
  time: number,
  level: number,
  from = 110,
  to = 45,
): void {
  const { context } = engine;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const endLevel = decayedLevel(level, KICK_DECAY_SECONDS, KICK_DECAY_TAU);
  oscillator.frequency.setValueAtTime(from, time);
  oscillator.frequency.exponentialRampToValueAtTime(to, time + KICK_SWEEP_SECONDS);
  gain.gain.setValueAtTime(SILENT, time);
  gain.gain.linearRampToValueAtTime(level, time + KICK_ATTACK);
  gain.gain.setTargetAtTime(SILENT, time + KICK_ATTACK, KICK_DECAY_TAU);
  gain.gain.setValueAtTime(endLevel, time + KICK_ATTACK + KICK_DECAY_SECONDS);
  gain.gain.linearRampToValueAtTime(0, time + KICK_END);
  oscillator.connect(gain);
  gain.connect(bus.gain);
  oscillator.start(time);
  oscillator.stop(time + KICK_STOP);
}

/** A tick of high-passed noise: a hi-hat, a clock, or dust on the record. */
export function playTick(
  { engine, bus }: MusicOutput,
  time: number,
  level: number,
  cutoff = 6500,
  duration = 0.035,
): void {
  const { context, tickNoise } = engine;
  const source = context.createBufferSource();
  const highpass = context.createBiquadFilter();
  const gain = context.createGain();
  source.buffer = tickNoise;
  highpass.type = 'highpass';
  highpass.frequency.value = cutoff;
  gain.gain.setValueAtTime(level, time);
  source.connect(highpass);
  highpass.connect(gain);
  gain.connect(bus.gain);
  source.start(time, 0, Math.min(duration, tickNoise.duration));
}

/** A small anvil or bell: three inharmonic partials, each quieter and shorter than the last. */
const TIN_PARTIALS_HZ = [2210, 3140, 5230];
const TIN_ATTACK = 0.003;
const TIN_DECAY_SECONDS = 0.447;
const TIN_END = 0.48;
const TIN_STOP = 0.5;

export function playTin({ engine, bus }: MusicOutput, time: number, level: number): void {
  const { context } = engine;
  for (const [index, frequency] of TIN_PARTIALS_HZ.entries()) {
    if (wouldAlias(context, frequency)) continue;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const peak = level / (index + 1);
    const tau = 0.05 + 0.04 / (index + 1);
    const endLevel = decayedLevel(peak, TIN_DECAY_SECONDS, tau);
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(SILENT, time);
    gain.gain.linearRampToValueAtTime(peak, time + TIN_ATTACK);
    gain.gain.setTargetAtTime(SILENT, time + TIN_ATTACK, tau);
    gain.gain.setValueAtTime(endLevel, time + TIN_ATTACK + TIN_DECAY_SECONDS);
    gain.gain.linearRampToValueAtTime(0, time + TIN_END);
    oscillator.connect(gain);
    gain.connect(bus.gain);
    oscillator.start(time);
    oscillator.stop(time + TIN_STOP);
  }
}

/** How much of the gust noise a brush stroke uses; the start point is random, for variety. */
const BRUSH_SECONDS = 0.26;
const BRUSH_MAX_OFFSET = 1.5;

/** A brushed snare: a short breath of band-passed noise. */
export function playBrush({ engine, bus }: MusicOutput, time: number, level: number): void {
  const { context, gustNoise } = engine;
  const source = context.createBufferSource();
  const bandpass = context.createBiquadFilter();
  const gain = context.createGain();
  source.buffer = gustNoise;
  bandpass.type = 'bandpass';
  bandpass.frequency.value = 2400;
  bandpass.Q.value = 0.7;
  gain.gain.setValueAtTime(SILENT, time);
  gain.gain.linearRampToValueAtTime(level, time + 0.02);
  gain.gain.exponentialRampToValueAtTime(SILENT, time + 0.24);
  gain.gain.linearRampToValueAtTime(0, time + 0.25);
  source.connect(bandpass);
  bandpass.connect(gain);
  gain.connect(bus.gain);
  source.start(time, Math.random() * BRUSH_MAX_OFFSET, BRUSH_SECONDS);
}
