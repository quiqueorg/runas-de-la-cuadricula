/**
 * The isle: E dorian at 72 bpm. Suspended and add9 chords that never quite land, a slow kalimba
 * with a long echo over a glassy pad, water lapping and dripping, bells far off, and now and then
 * something big moving under the lagoon. Calm, and a little curious.
 */
import { jitter } from '../../dsp';
import { playDeep, playDrip, playSwell } from '../instruments/ambience';
import { playBell, playPartial, pluck } from '../instruments/kalimba';
import { playTick } from '../instruments/percussion';
import { playBass } from '../instruments/voices';
import { midiToFrequency } from '../pitch';
import type { Beat, Score } from '../scheduler';
import { type Bar, notesOn } from './bars';

/** Each bar's [bass, chord tones] in MIDI. */
const CHORDS: readonly (readonly [bass: number, tones: readonly number[]])[] = [
  [40, [64, 67, 71, 74, 78]], // Em9
  [36, [64, 67, 71, 74, 78]], // Cmaj9(#11): the same tones over a new floor
  [45, [60, 64, 67, 71, 74]], // Am9
  [35, [64, 66, 71, 76]], //     Bsus4, left hanging
  [40, [64, 67, 71, 74, 78]], // Em9
  [43, [62, 64, 67, 69, 71]], // G6/9
  [36, [64, 67, 71, 72, 78]], // Cmaj7(#11)
  [38, [62, 64, 66, 69, 71]], // D6sus2, back round without resolving
];
/** The chord tone the kalimba picks on each eighth; -1 is a rest, to breathe. */
const ARPEGGIO_ORDER = [0, -1, 2, 1, -1, 3, 2, -1];
const REST = -1;

// biome-ignore format: one bar per line reads as a score
const MELODY: readonly Bar[] = [
  [[0, 76], [3, 79], [6, 78]],
  [[2, 74], [4, 71]],
  [[0, 72], [3, 76], [5, 74]],
  [[0, 71]],
  [[0, 76], [2, 78], [3, 79], [6, 83]],
  [[1, 81], [4, 79]],
  [[0, 78], [3, 76], [6, 74]],
  [[0, 78], [5, 76]],
];

// biome-ignore format: one bar per line reads as a score
const MELODY_VARIATION: readonly Bar[] = [
  [[0, 71], [4, 74]],
  [[0, 76], [3, 74], [6, 71]],
  [[2, 69], [4, 72]],
  [[0, 71], [6, 66]],
  [[0, 79], [4, 78]],
  [[0, 76], [2, 74], [5, 71]],
  [[0, 72], [4, 71]],
  [[0, 71], [4, 76]],
];

const HUMANIZE = 0.02;
const HIGHEST_NOTE = 100;
/** The bar where, every other pass, something stirs under the lagoon. */
const DEEP_BAR = 4;
/** Each pad tone has a twin this much sharp, so the pair shimmers like glass. */
const PAD_DETUNE = 1.003;
const DEFAULT_PAD_LEVEL = 0.026;
const DEFAULT_DRIPS = 0.05;
const DEFAULT_CHIMES = 0.04;
const E2 = 40;
const E6 = 88;

function playArpeggio(beat: Beat, tones: readonly number[]): void {
  const { scene, slot, time } = beat;
  const tone = ARPEGGIO_ORDER[slot] ?? REST;
  if (tone >= 0 && !(scene.sparseness && Math.random() < scene.sparseness))
    pluck(
      beat,
      midiToFrequency((tones[tone % tones.length] ?? 64) - 12),
      time + jitter(HUMANIZE),
      0.06,
    );
}

function playMelodyNote(beat: Beat, written: number): void {
  const { scene, time, eighth } = beat;
  const note = written + (scene.transpose || 0);
  const start = time + jitter(HUMANIZE);
  const level = 0.13 + Math.random() * 0.025;
  pluck(beat, midiToFrequency(note), start, level);
  pluck(beat, midiToFrequency(note), start + eighth * 1.5, level * 0.3);
  if (scene.harmony)
    pluck(beat, midiToFrequency(note - 12 + scene.harmony), start + 0.03, level * 0.38);
  if (scene.shimmer && note + 12 <= HIGHEST_NOTE)
    pluck(beat, midiToFrequency(note + 12), start + 0.2, level * scene.shimmer);
}

/** The tune, answered by its own echo. */
function playMelody(beat: Beat): void {
  const melody = beat.cycle % 2 ? MELODY_VARIATION : MELODY;
  for (const written of notesOn(melody[beat.bar], beat.slot)) playMelodyNote(beat, written);
}

/** A glassy pad: three low chord tones, slow to arrive, each a hair out of tune with its twin. */
function playPad(beat: Beat, tones: readonly number[]): void {
  const { scene, time, eighth } = beat;
  for (const [index, note] of tones.slice(0, 3).entries()) {
    playPartial(beat, {
      frequency: midiToFrequency(note - 12),
      time: time + index * 0.05,
      level: scene.padLevel || DEFAULT_PAD_LEVEL,
      decay: 3.2 * eighth,
      wave: 'sine',
      attack: 1.6 * eighth,
    });
    playPartial(beat, {
      frequency: midiToFrequency(note - 12) * PAD_DETUNE,
      time: time + index * 0.05 + 0.03,
      level: (scene.padLevel || DEFAULT_PAD_LEVEL) * 0.6,
      decay: 3.2 * eighth,
      wave: 'sine',
      attack: 1.8 * eighth,
    });
  }
}

function playDownbeat(beat: Beat, bass: number, tones: readonly number[]): void {
  const { scene, bar, cycle, time } = beat;
  playPad(beat, tones);
  playBass(beat, midiToFrequency(bass), time, scene.bass ? 0.11 : 0.075, 3);
  if (scene.drone)
    playPartial(beat, {
      frequency: midiToFrequency(E2),
      time,
      level: 0.03,
      decay: 4,
      wave: 'sine',
      attack: 0.8,
    });
  if (bar % 2 === 0 && (scene.waves || bar === 0)) playSwell(beat, time, scene.waves ? 0.05 : 0.03);
  if (scene.bells && bar % 4 === 0) playBell(beat, midiToFrequency(E6), time + 0.3, 0.022);
  if (bar === DEEP_BAR && cycle % 2 === 0) playDeep(beat, time, scene.deepLevel ?? 0.022);
}

/** The clock, drips and far-off chimes between the notes. */
function playTexture(beat: Beat, tones: readonly number[]): void {
  const { scene, slot, time, eighth } = beat;
  if (scene.clockwork && (slot === 2 || slot === 6))
    playTick(beat, time + jitter(HUMANIZE), 0.022, 4200, 0.03);
  if (Math.random() < (scene.drips ?? DEFAULT_DRIPS))
    playDrip(beat, time + eighth * Math.random(), 0.018);
  if (Math.random() < (scene.chimes ?? DEFAULT_CHIMES))
    pluck(
      beat,
      midiToFrequency(
        Math.min(HIGHEST_NOTE, (tones[Math.floor(Math.random() * tones.length)] ?? 76) + 24),
      ),
      time + 0.13,
      0.024,
    );
}

export const isleScore: Score = {
  lookahead: 0.5,
  eighth: 60 / 72 / 2,
  slotsPerBar: 8,
  slotsPerCycle: 64,
  playBeat(beat) {
    const chord = CHORDS[beat.bar];
    if (!chord) return;
    const [bass, tones] = chord;
    playArpeggio(beat, tones);
    playMelody(beat);
    if (beat.slot === 0) playDownbeat(beat, bass, tones);
    playTexture(beat, tones);
  },
};
