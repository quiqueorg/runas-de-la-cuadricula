/** The skies: F lydian in 3/4, music-box arpeggios, a soft pad and wind chimes. */
import { jitter } from '../../dsp';
import { playGust } from '../instruments/ambience';
import { playPartial, pluck } from '../instruments/kalimba';
import { playKick, playTick, playTin } from '../instruments/percussion';
import { playBass } from '../instruments/voices';
import { midiToFrequency, toMinor, toWhiteKeys } from '../pitch';
import type { Scene } from '../scenes';
import type { Beat, Score } from '../scheduler';
import { type Bar, notesOn } from './bars';

/** Each bar's [bass, arpeggio] in MIDI. */
const CHORDS: readonly (readonly [bass: number, arpeggio: readonly number[]])[] = [
  [41, [65, 69, 72, 76]],
  [43, [67, 71, 74, 79]],
  [41, [65, 69, 72, 76]],
  [43, [67, 71, 74, 79]],
  [38, [62, 65, 69, 72]],
  [40, [64, 67, 71, 74]],
  [41, [65, 69, 72, 76, 79]],
  [36, [60, 62, 67, 72]],
];
/** Which chord tone the music box plays on each eighth: up and back down. */
const ARPEGGIO_ORDER = [0, 1, 2, 3, 2, 1];

// biome-ignore format: one bar per line reads as a score
const MELODY: readonly Bar[] = [
  [[0, 81], [4, 84]],
  [[0, 83], [3, 79]],
  [[0, 81], [2, 84], [4, 88]],
  [[0, 86]],
  [[0, 84], [4, 81]],
  [[0, 83], [2, 79], [4, 76]],
  [[0, 77], [2, 79], [4, 81]],
  [[0, 79]],
];

/** The second pass answers bars two, four and eight differently. */
// biome-ignore format: one bar per line reads as a score
const MELODY_VARIATION: readonly Bar[] = [
  MELODY[0],
  [[0, 83], [2, 86], [4, 88]],
  MELODY[2],
  [[0, 86], [3, 84], [5, 83]],
  MELODY[4],
  MELODY[5],
  MELODY[6],
  [[0, 79], [3, 77], [4, 76]],
];

/** The final battle plays the surface's kalimba theme here instead. */
// biome-ignore format: one bar per line reads as a score
const FINALE_THEME: readonly Bar[] = [
  [[0, 77], [1, 79], [2, 84], [4, 83]],
  [[0, 81]],
  [[0, 77], [1, 79], [2, 84], [4, 83]],
  [[0, 81]],
  [[0, 77], [1, 79], [2, 88], [4, 83]],
  [[0, 84]],
  [[0, 77], [1, 79], [2, 88], [4, 83]],
  [[0, 84], [3, 79]],
];

const HUMANIZE = 0.014;
const HIGHEST_SHIMMER = 100;
const HIGHEST_CHIME = 98;
const DEFAULT_CHIMES = 0.06;

function pitch(scene: Scene, note: number): number {
  return midiToFrequency(scene.minor ? toMinor(note) : note);
}

function melodyFor(scene: Scene, cycle: number): readonly Bar[] {
  if (scene.finaleTheme) return FINALE_THEME;
  return cycle % 2 ? MELODY_VARIATION : MELODY;
}

function playArpeggio(beat: Beat, arpeggio: readonly number[]): void {
  const { scene, slot, time } = beat;
  if (scene.sparseness && slot % 2 && Math.random() < scene.sparseness) return;
  const note = arpeggio[ARPEGGIO_ORDER[slot] % arpeggio.length] + (scene.transpose || 0);
  pluck(beat, pitch(scene, note), time + jitter(HUMANIZE), 0.08);
}

function playMelodyNote(beat: Beat, written: number): void {
  const { scene, time } = beat;
  const note = written + (scene.transpose || 0);
  const start = time + jitter(HUMANIZE);
  const level = 0.15 + Math.random() * 0.03;
  pluck(beat, pitch(scene, note), start, level);
  if (scene.harmony)
    pluck(beat, pitch(scene, toWhiteKeys(note - 12 + scene.harmony)), start + 0.03, level * 0.4);
  if (scene.echoDelay !== undefined)
    pluck(beat, pitch(scene, note), start + scene.echoDelay, level * 0.28);
  if (scene.shimmer && note + 12 <= HIGHEST_SHIMMER)
    pluck(beat, pitch(scene, note + 12), start + 0.18, level * scene.shimmer);
}

function playMelody(beat: Beat): void {
  const melody = melodyFor(beat.scene, beat.cycle);
  for (const written of notesOn(melody[beat.bar], beat.slot)) playMelodyNote(beat, written);
}

/** The pad, bass, bells and wind that enter on the downbeat. */
function playDownbeat(beat: Beat, bass: number, arpeggio: readonly number[]): void {
  const { scene, bar, time, eighth } = beat;
  // three chord tones that enter slowly
  for (const [index, note] of arpeggio.slice(0, 3).entries())
    playPartial(beat, {
      frequency: pitch(scene, note - 12),
      time: time + index * 0.02,
      level: scene.padLevel || 0.024,
      decay: 2 * eighth,
      wave: 'sine',
      attack: eighth,
    });
  if (scene.bass) playBass(beat, pitch(scene, bass), time, scene.minor ? 0.15 : 0.11, 2);
  if (scene.bells)
    for (const [index, delay] of [0, 0.12].entries())
      playTin(beat, time + delay, 0.02 / (index + 1));
  if (scene.wind && bar % 2 === 0) playGust(beat, time, 0.05);
}

function playDrums(beat: Beat): void {
  const { bar, slot, cycle, time } = beat;
  if (slot === 0 || (slot === 3 && bar % 2)) playKick(beat, time, slot === 0 ? 0.26 : 0.19, 90, 40);
  if (slot === 2 || slot === 4) playTick(beat, time + jitter(HUMANIZE), 0.048, 3000, 0.04);
  if (slot === 0 && bar === 7 && cycle % 2) playGust(beat, time, 0.085);
}

function playChime(beat: Beat, arpeggio: readonly number[]): void {
  const { scene, time } = beat;
  if (Math.random() >= (scene.chimes || DEFAULT_CHIMES)) return;
  const note = Math.min(HIGHEST_CHIME, arpeggio[Math.floor(Math.random() * arpeggio.length)] + 24);
  pluck(beat, pitch(scene, note), time + 0.11, 0.028);
}

export const skyScore: Score = {
  lookahead: 0.45,
  eighth: 60 / 84 / 2,
  slotsPerBar: 6,
  slotsPerCycle: 48,
  playBeat(beat) {
    const chord = CHORDS[beat.bar];
    if (!chord) return;
    const [bass, arpeggio] = chord;
    playArpeggio(beat, arpeggio);
    playMelody(beat);
    if (beat.slot === 0) playDownbeat(beat, bass, arpeggio);
    if (beat.scene.drums) playDrums(beat);
    playChime(beat, arpeggio);
  },
};
