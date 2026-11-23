/** The interface's sound effects, synthesised on the fly (no audio files). */
import { SILENT } from './dsp';
import { type AudioEngine, getEngine } from './engine';
import { audioSettings } from './settings';

const C5 = 523.25;
const E5 = 659.25;
const G5 = 783.99;
const C6 = 1046.5;
const E6 = 1318.5;

/** The pitch each creature chatters at, by how it moves (the map's content keys). */
const CHATTER_PITCH: Record<string, number> = {
  aletea: 980,
  flota: 420,
  tiembla: 200,
  asoma: 300,
  cuelga: 760,
  planea: 1100,
  picotea: 900,
  salta: 520,
  pasta: 340,
};
const DEFAULT_CHATTER_PITCH = 480;
/** Floaters coo with a pure tone that sinks; tremblers buzz. */
const FLOATING_VOICE = 'flota';
const TREMBLING_VOICE = 'tiembla';
/** Three syllables: when each starts (s) and how far it bends from the creature's pitch. */
const CHATTER_SYLLABLES = [
  { delay: 0, bend: 0 },
  { delay: 0.085, bend: 0.18 },
  { delay: 0.17, bend: -0.08 },
] as const;
/** A little randomness, so a creature never says the same thing twice. */
const CHATTER_WOBBLE = 0.06;

/** The engine, unless the player muted the effects. */
function effectsEngine(): AudioEngine | null {
  if (!audioSettings.sound) return null;
  return getEngine();
}

/** One note with a quick swell and an exponential fade. */
function blip(
  frequency: number,
  delay: number,
  duration: number,
  volume = 0.12,
  wave: OscillatorType = 'sine',
): void {
  const engine = effectsEngine();
  if (!engine) return;
  const { context, effectsBus } = engine;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const start = context.currentTime + delay;
  oscillator.type = wave;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(SILENT, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(SILENT, start + duration);
  gain.gain.linearRampToValueAtTime(0, start + duration + 0.015);
  oscillator.connect(gain);
  gain.connect(effectsBus);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.025);
}

/** A pitch sweep with a short swell and fade, used by the creature and water sounds. */
interface Chirp {
  readonly wave: OscillatorType;
  readonly from: number;
  readonly to: number;
  readonly sweep: number;
  readonly peak: number;
  readonly attack: number;
  readonly fade: number;
  readonly release: number;
  readonly stop: number;
}

function chirp(engine: AudioEngine, start: number, shape: Chirp): void {
  const { context, effectsBus } = engine;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = shape.wave;
  oscillator.frequency.setValueAtTime(shape.from, start);
  oscillator.frequency.exponentialRampToValueAtTime(shape.to, start + shape.sweep);
  gain.gain.setValueAtTime(SILENT, start);
  gain.gain.exponentialRampToValueAtTime(shape.peak, start + shape.attack);
  gain.gain.exponentialRampToValueAtTime(SILENT, start + shape.fade);
  gain.gain.linearRampToValueAtTime(0, start + shape.release);
  oscillator.connect(gain);
  gain.connect(effectsBus);
  oscillator.start(start);
  oscillator.stop(start + shape.stop);
}

function chatterWave(voice: string): OscillatorType {
  if (voice === FLOATING_VOICE) return 'sine';
  return voice === TREMBLING_VOICE ? 'sawtooth' : 'triangle';
}

export const sound = {
  click(): void {
    blip(880, 0, 0.08, 0.05, 'triangle');
  },
  snap(): void {
    blip(1318.5, 0, 0.25, 0.05);
    blip(1975.5, 0.05, 0.3, 0.03);
  },
  victory(): void {
    for (const [index, frequency] of [C5, E5, G5, C6, E6].entries()) {
      blip(frequency, index * 0.09, 0.9, 0.09);
      blip(frequency * 2, index * 0.09 + 0.02, 0.5, 0.02, 'triangle');
    }
    for (const frequency of [C5, G5, C6]) blip(frequency, 0.55, 1.8, 0.05);
  },
  error(): void {
    blip(220, 0, 0.18, 0.05, 'triangle');
  },
  /** A lantern chime: the note and a faint octave above it. */
  tone(frequency: number, delay = 0, duration = 0.9): void {
    blip(frequency, delay, duration, 0.1);
    blip(frequency * 2, delay + 0.01, duration * 0.5, 0.02, 'triangle');
  },
  discover(): void {
    for (const [index, frequency] of [392, C5, E5, G5].entries())
      blip(frequency, 0.2 + index * 0.14, 1.4, 0.06);
  },
  secret(): void {
    for (const [index, frequency] of [880, C6, E6, 1760, 2093].entries()) {
      blip(frequency, index * 0.07, 0.8, 0.06);
      blip(frequency * 1.5, index * 0.07 + 0.03, 0.4, 0.02, 'triangle');
    }
  },
  /** A land creature's short chatter: three syllables in a timbre that depends on the creature. */
  chatter(voice: string): void {
    const engine = effectsEngine();
    if (!engine) return;
    const pitch = CHATTER_PITCH[voice] ?? DEFAULT_CHATTER_PITCH;
    const wave = chatterWave(voice);
    for (const { delay, bend } of CHATTER_SYLLABLES) {
      const start = engine.context.currentTime + delay;
      const from = pitch * (1 + bend + Math.random() * CHATTER_WOBBLE);
      chirp(engine, start, {
        wave,
        from,
        to: from * (voice === FLOATING_VOICE ? 0.7 : 1.25),
        sweep: 0.07,
        peak: voice === TREMBLING_VOICE ? 0.025 : 0.045,
        attack: 0.012,
        fade: 0.08,
        release: 0.09,
        stop: 0.1,
      });
    }
  },
  /** Thunder, when the boss attacks or takes a hit: low noise that darkens as it dies away. */
  thunder(strength = 1): void {
    const engine = effectsEngine();
    if (!engine) return;
    const { context, effectsBus, thunderNoise } = engine;
    const start = context.currentTime;
    const duration = Math.min(2.0, 1.6 * strength);
    const source = context.createBufferSource();
    const lowpass = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = thunderNoise;
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(900, start);
    lowpass.frequency.exponentialRampToValueAtTime(120, start + duration);
    gain.gain.setValueAtTime(0.5 * strength, start);
    gain.gain.setTargetAtTime(SILENT, start + duration * 0.65, 0.2);
    source.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(effectsBus);
    source.start(start);
    source.stop(start + duration + 0.1);
    blip(70, 0, 0.6 * strength, 0.08, 'sine');
  },
  /** Two bubbles rising. */
  glub(): void {
    const engine = effectsEngine();
    if (!engine) return;
    for (const [index, delay] of [0, 0.09].entries()) {
      const start = engine.context.currentTime + delay;
      chirp(engine, start, {
        wave: 'sine',
        from: 260 + index * 120,
        to: 900 + index * 300,
        sweep: 0.08,
        peak: 0.06,
        attack: 0.01,
        fade: 0.12,
        release: 0.13,
        stop: 0.14,
      });
    }
  },
  /** A drop falling into water. */
  drop(): void {
    const engine = effectsEngine();
    if (!engine) return;
    chirp(engine, engine.context.currentTime, {
      wave: 'sine',
      from: 900,
      to: 320,
      sweep: 0.12,
      peak: 0.05,
      attack: 0.01,
      fade: 0.18,
      release: 0.19,
      stop: 0.2,
    });
  },
  cluck(): void {
    blip(330, 0, 0.07, 0.07, 'square');
    blip(250, 0.08, 0.09, 0.06, 'square');
  },
};
