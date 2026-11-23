/** The underground: D dorian at 104 bpm, eight bars of eighth notes with rhythmic variations. */
import { jitter } from '../../dsp';
import { playPartial, pluck } from '../instruments/kalimba';
import { playKick, playTick, playTin } from '../instruments/percussion';
import { playBass } from '../instruments/voices';
import type { Scene } from '../scenes';
import type { Beat, Score } from '../scheduler';
import { type Bar, notesOn } from './bars';

/**
 * The 17 keys of a kalimba in C (Hz): C4…B4, C5…B5, then C6, D6, E6. The underground's tune is
 * written as indices into these (1 = D4 … 8 = D5), so it only plays what a real kalimba could.
 */
const KALIMBA_KEYS = [
  261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25, 587.33, 659.25, 698.46, 783.99,
  880.0, 987.77, 1046.5, 1174.66, 1318.51,
];
const HIGHEST_KEY = KALIMBA_KEYS.length - 1;
const KEYS_PER_OCTAVE = 7;
/** The two B keys, flattened in the darker places. */
const B_KEYS = [6, 13];
/** A semitone down: 2^(-1/12). */
const FLAT = 0.9439;

// biome-ignore format: one bar per line reads as a score
const MELODY: readonly Bar[] = [
  [[0, 5], [2, 8], [3, 7], [4, 5], [6, 4]],
  [[0, 3], [3, 4], [4, 5], [6, 2]],
  [[0, 5], [2, 8], [3, 7], [4, 5], [5, 7], [6, 8]],
  [[0, 9], [2, 8], [4, 5], [7, 7]],
  [[0, 8], [1, 7], [2, 5], [4, 4], [6, 5]],
  [[0, 3], [2, 4], [3, 3], [4, 2], [6, 1]],
  [[0, 5], [2, 5], [3, 7], [4, 8], [6, 9], [7, 10]],
  [[0, 8], [4, 1]],
];

/** The second pass: syncopation on the even bars. */
// biome-ignore format: one bar per line reads as a score
const MELODY_VARIATION: readonly Bar[] = [
  MELODY[0],
  [[0, 3], [2, 4], [3, 5], [5, 4], [6, 2]],
  MELODY[2],
  [[0, 9], [1, 8], [3, 5], [6, 7], [7, 8]],
  MELODY[4],
  [[0, 3], [1, 4], [3, 3], [5, 2], [6, 1], [7, 2]],
  MELODY[6],
  MELODY[7],
];

/** The bass's root in each bar (Hz). */
const ROOTS = [146.83, 130.81, 146.83, 110.0, 146.83, 130.81, 98.0, 146.83];
/**
 * Bass rhythms, [eighth within the bar, length]. The bars go in pairs: a call, then an answer that
 * the second pass varies.
 */
type BassPattern = readonly (readonly [slot: number, length: number])[];
// biome-ignore format: one pattern per line reads as a score
const BASS_CALL: BassPattern = [[0, 1], [3, 1], [4, 1.5]];
// biome-ignore format: one pattern per line reads as a score
const BASS_ANSWER: BassPattern = [[0, 1], [4, 1], [6, 1.5]];
// biome-ignore format: one pattern per line reads as a score
const BASS_ANSWER_VARIATION: BassPattern = [[0, 1], [2, 1], [4, 1.5], [7, 1]];
/** The long note on beat three jumps up a fifth. */
const FIFTH = 1.5;

const D3 = 146.83;
const HUMANIZE = 0.018;
/** Bars that end with a drum fill. */
const FILL_BARS = [3, 7];

function keyFrequency(key: number, scene: Scene): number {
  if (scene.flat && B_KEYS.includes(key)) return KALIMBA_KEYS[key] * FLAT;
  return KALIMBA_KEYS[key];
}

/** Transposing past the top key folds the note back an octave, onto keys the kalimba has. */
function transposedKey(written: number, scene: Scene): number {
  const key = written + (scene.transpose || 0);
  return key > HIGHEST_KEY ? key - KEYS_PER_OCTAVE : key;
}

function playMelodyNote(beat: Beat, written: number): void {
  const { scene, slot, time } = beat;
  if (scene.sparseness && slot !== 0 && Math.random() < scene.sparseness) return;
  const key = transposedKey(written, scene);
  const start = time + jitter(HUMANIZE);
  const level = 0.145 + Math.random() * 0.035;
  pluck(beat, keyFrequency(key, scene), start, level);
  // harmony only on the strong beats, and only where the kalimba has the key
  if (scene.harmony && (slot === 0 || slot === 4) && key + scene.harmony <= HIGHEST_KEY)
    pluck(beat, keyFrequency(key + scene.harmony, scene), start + 0.03, level * 0.42);
  if (scene.echoDelay !== undefined)
    pluck(beat, keyFrequency(key, scene), start + scene.echoDelay, level * 0.28);
  if (scene.shimmer && key + KEYS_PER_OCTAVE <= HIGHEST_KEY)
    pluck(beat, keyFrequency(key + KEYS_PER_OCTAVE, scene), start + 0.15, level * scene.shimmer);
}

function playMelody(beat: Beat): void {
  const melody = beat.cycle % 2 ? MELODY_VARIATION : MELODY;
  for (const written of notesOn(melody[beat.bar], beat.slot)) playMelodyNote(beat, written);
}

function bassPattern(bar: number, cycle: number): BassPattern {
  if (cycle % 2 && bar % 2) return BASS_ANSWER_VARIATION;
  return bar % 2 ? BASS_ANSWER : BASS_CALL;
}

function playBassLine(beat: Beat): void {
  const { scene, bar, slot, cycle, time } = beat;
  for (const [noteSlot, length] of bassPattern(bar, cycle))
    if (noteSlot === slot)
      playBass(
        beat,
        ROOTS[bar] * (scene.lowBass ? 0.5 : 1) * (noteSlot === 4 && length > 1 ? FIFTH : 1),
        time + jitter(HUMANIZE),
        0.145,
        length,
      );
  if (scene.drone && slot === 0)
    playPartial(beat, { frequency: D3, time, level: 0.048, decay: 2.0, wave: 'sine', attack: 0.4 });
}

function kickLevel(scene: Scene): number {
  if (scene.loud) return 0.28;
  return scene.soft ? 0.12 : 0.21;
}

/** On one and three, and a double hit at the end of the fill bars. */
function isKickSlot(bar: number, slot: number): boolean {
  if (slot === 0 || slot === 4) return true;
  return FILL_BARS.includes(bar) && (slot === 6 || slot === 7);
}

function playDrums(beat: Beat): void {
  const { scene, bar, slot, cycle, time } = beat;
  if (!scene.noKick && isKickSlot(bar, slot))
    playKick(beat, time, kickLevel(scene) * (slot === 0 ? 1 : 0.8));
  if (slot === 2 || slot === 6) playTick(beat, time + jitter(HUMANIZE), scene.soft ? 0.03 : 0.048);
  else if (cycle % 2 && slot % 2) playTick(beat, time + jitter(HUMANIZE), 0.02);
  if (scene.anvil?.includes(slot)) playTin(beat, time + jitter(HUMANIZE), 0.032);
}

export const undergroundScore: Score = {
  lookahead: 0.45,
  eighth: 60 / 104 / 2,
  slotsPerBar: 8,
  slotsPerCycle: 64,
  playBeat(beat) {
    playMelody(beat);
    playBassLine(beat);
    playDrums(beat);
  },
};
