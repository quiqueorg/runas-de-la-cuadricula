/** The sounds of the places around the music: wind, water, birds and the thing under the lagoon. */
import { SILENT } from '../../dsp';
import type { MusicOutput } from '../trackBus';

/** A gust of wind: noise through a band-pass that sweeps up and back down. */
export function playGust({ engine, bus }: MusicOutput, time: number, level: number): void {
  const { context, gustNoise } = engine;
  const source = context.createBufferSource();
  const bandpass = context.createBiquadFilter();
  const gain = context.createGain();
  source.buffer = gustNoise;
  bandpass.type = 'bandpass';
  bandpass.frequency.setValueAtTime(500, time);
  bandpass.frequency.linearRampToValueAtTime(1300, time + 1.2);
  bandpass.frequency.linearRampToValueAtTime(700, time + 2.4);
  bandpass.Q.value = 1.6;
  gain.gain.setValueAtTime(level, time);
  source.connect(bandpass);
  bandpass.connect(gain);
  gain.connect(bus.gain);
  source.start(time);
}

/** Played slower, the gust noise stretches into a wave several seconds long. */
const SWELL_PLAYBACK_RATE = 0.55;

/** Waves on the shore: filtered noise that swells and draws back. */
export function playSwell({ engine, bus }: MusicOutput, time: number, level: number): void {
  const { context, gustNoise } = engine;
  const source = context.createBufferSource();
  const lowpass = context.createBiquadFilter();
  const gain = context.createGain();
  source.buffer = gustNoise;
  source.playbackRate.value = SWELL_PLAYBACK_RATE;
  lowpass.type = 'lowpass';
  lowpass.frequency.setValueAtTime(260, time);
  lowpass.frequency.linearRampToValueAtTime(820, time + 1.9);
  lowpass.frequency.linearRampToValueAtTime(240, time + 4.2);
  gain.gain.setValueAtTime(SILENT, time);
  gain.gain.linearRampToValueAtTime(level, time + 1.6);
  gain.gain.linearRampToValueAtTime(SILENT, time + 4.3);
  source.connect(lowpass);
  lowpass.connect(gain);
  gain.connect(bus.gain);
  source.start(time);
  source.stop(time + 4.4);
}

/** A drop falling into still water: a quick downward sine at a random pitch. */
export function playDrip({ engine, bus }: MusicOutput, time: number, level: number): void {
  const { context } = engine;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const frequency = 900 + Math.random() * 700;
  oscillator.frequency.setValueAtTime(frequency, time);
  oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.45, time + 0.09);
  gain.gain.setValueAtTime(SILENT, time);
  gain.gain.linearRampToValueAtTime(level, time + 0.005);
  gain.gain.exponentialRampToValueAtTime(SILENT, time + 0.16);
  gain.gain.linearRampToValueAtTime(0, time + 0.17);
  oscillator.connect(gain);
  gain.connect(bus.gain);
  oscillator.start(time);
  oscillator.stop(time + 0.18);
}

/** E2 gliding down to D2. */
const DEEP_FROM_HZ = 82.41;
const DEEP_TO_HZ = 73.42;
/** Two voices, the second a little sharp and half as loud, so the rumble slowly beats. */
const DEEP_DETUNES = [1, 1.004];

/** Something big under the lagoon: a low glide that rises out of nothing and sinks back. */
export function playDeep({ engine, bus }: MusicOutput, time: number, level: number): void {
  const { context } = engine;
  for (const [index, detune] of DEEP_DETUNES.entries()) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const lowpass = context.createBiquadFilter();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(DEEP_FROM_HZ * detune, time);
    oscillator.frequency.linearRampToValueAtTime(DEEP_TO_HZ * detune, time + 3.4);
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 320;
    gain.gain.setValueAtTime(SILENT, time);
    gain.gain.linearRampToValueAtTime(level / (index + 1), time + 1.4);
    gain.gain.linearRampToValueAtTime(SILENT, time + 3.8);
    oscillator.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(bus.gain);
    oscillator.start(time);
    oscillator.stop(time + 3.9);
  }
}

const CHIRP_GAP = 0.09;

/** A bird in the wood: two or three quick upward chirps. */
export function playBird({ engine, bus }: MusicOutput, time: number, level: number): void {
  const { context } = engine;
  const base = 2400 + Math.random() * 1400;
  const chirps = 2 + Math.floor(Math.random() * 2);
  for (let index = 0; index < chirps; index++) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = time + index * CHIRP_GAP;
    oscillator.frequency.setValueAtTime(base, start);
    oscillator.frequency.exponentialRampToValueAtTime(base * 1.5, start + 0.05);
    gain.gain.setValueAtTime(SILENT, start);
    gain.gain.linearRampToValueAtTime(level, start + 0.008);
    gain.gain.exponentialRampToValueAtTime(SILENT, start + 0.07);
    gain.gain.linearRampToValueAtTime(0, start + 0.075);
    oscillator.connect(gain);
    gain.connect(bus.gain);
    oscillator.start(start);
    oscillator.stop(start + 0.08);
  }
}
