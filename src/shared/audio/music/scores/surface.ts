/**
 * The surface: a deep lo-fi stroll in G at 70 bpm, swung. A dark electric piano on jazzy sevenths
 * and ninths over a sub-bass and a warm low bed, brushed drums, the kalimba tune down in its low
 * register taking its time, and a little vinyl crackle.
 */
import { jitter } from '../../dsp';
import { playBird, playDrip, playGust } from '../instruments/ambience';
import { playPartial, pluck } from '../instruments/kalimba';
import { playBrush, playKick, playTick, playTin } from '../instruments/percussion';
import { playBass, playFlute, playKeys } from '../instruments/voices';
import { midiToFrequency, toDesertScale, toPentatonic, toWhiteKeys } from '../pitch';
import type { Scene } from '../scenes';
import type { Beat, Score } from '../scheduler';
import { type Bar, notesOn } from './bars';

/** Each bar's [bass, chord tones] in MIDI. */
const CHORDS: readonly (readonly [bass: number, tones: readonly number[]])[] = [
  [43, [59, 62, 66, 69]], // Gmaj9
  [47, [57, 62, 66, 69]], // Bm7
  [40, [59, 62, 66, 67]], // Em9
  [36, [59, 62, 64, 67]], // Cmaj7
  [45, [55, 60, 64, 67]], // Am9
  [38, [57, 60, 64, 67]], // D9sus4
  [43, [59, 62, 66, 69]], // Gmaj9
  [36, [59, 62, 66, 67]], // Cmaj7(#11)
];

// biome-ignore format: one bar per line reads as a score
const MELODY: readonly Bar[] = [
  [[0, 74], [3, 76], [5, 79]],
  [[2, 78], [4, 74]],
  [[0, 71], [3, 74], [6, 76]],
  [[1, 74]],
  [[0, 72], [2, 76], [3, 79], [6, 81]],
  [[1, 79], [4, 76]],
  [[0, 78], [3, 74], [5, 71]],
  [[2, 74]],
];

// biome-ignore format: one bar per line reads as a score
const MELODY_VARIATION: readonly Bar[] = [
  [[1, 79], [3, 81], [6, 83]],
  [[0, 81], [4, 78]],
  [[0, 79], [2, 76], [5, 74]],
  [[0, 76], [6, 71]],
  [[1, 76], [3, 79], [5, 84]],
  [[0, 83], [4, 79]],
  [[1, 78], [3, 76], [6, 74]],
  [[0, 79]],
];

/** How late the off-beat eighths land, as a fraction of an eighth: that lean is the whole groove. */
const SWING = 0.17;
const HUMANIZE = 0.016;
const HIGHEST_NOTE = 100;
const DEFAULT_KEYS_LEVEL = 0.042;
/** The tune plays an octave below where it is written. */
const TUNE_OCTAVE_DOWN = 12;
const G2 = 43;
/** Chance per eighth of a crackle of dust on the record. */
const CRACKLE = 0.22;
const BIRDSONG = 0.04;

function pitch(scene: Scene, note: number): number {
  return midiToFrequency(scene.flat ? toDesertScale(note) : note);
}

/** The keys play the chord on the downbeat and push it again just before beat three. */
function playKeysChord(beat: Beat, tones: readonly number[]): void {
  const { scene, slot, time, eighth } = beat;
  if (slot !== 0 && slot !== 3) return;
  for (const [index, note] of tones.entries())
    playKeys(
      beat,
      pitch(scene, note),
      time + index * 0.012 + jitter(HUMANIZE),
      eighth * (slot === 0 ? 2.6 : 4),
      (scene.padLevel || DEFAULT_KEYS_LEVEL) * (slot === 0 ? 1 : 0.75),
    );
}

/** Root on one, with the floor under it all; a passing fifth or octave before the next bar. */
function playBassLine(beat: Beat, bass: number): void {
  const { scene, bar, slot, time, eighth } = beat;
  if (slot === 0) {
    playBass(beat, pitch(scene, bass), time, scene.bass ? 0.115 : 0.1, 2.4);
    // a sub an octave down, and root and fifth held low and warm
    playPartial(beat, {
      frequency: pitch(scene, bass - 12),
      time,
      level: 0.05,
      decay: 1.6,
      wave: 'sine',
      attack: 0.03,
    });
    for (const [index, note] of [bass + 12, bass + 19].entries())
      playPartial(beat, {
        frequency: pitch(scene, note),
        time: time + index * 0.04,
        level: 0.018,
        decay: 3.4 * eighth,
        wave: 'sine',
        attack: 1.4 * eighth,
      });
  }
  if (slot === 5 && bar % 2) playBass(beat, pitch(scene, bass + 7), time, 0.07, 1.2);
  if (slot === 7 && !(bar % 2)) playBass(beat, pitch(scene, bass + 12), time, 0.05, 0.8);
}

function playKickAndBrush(beat: Beat): void {
  const { scene, slot, time } = beat;
  if (slot === 0 || slot === 5)
    playKick(beat, time, (scene.drums ? 0.18 : 0.13) * (slot === 0 ? 1 : 0.7), 68, 36);
  if (slot === 2 || slot === 6)
    playBrush(beat, time + jitter(HUMANIZE), scene.drums ? 0.06 : 0.042);
}

/** Brushed drums; soft scenes keep only the downbeat. */
function playDrums(beat: Beat): void {
  const { scene, slot, time } = beat;
  if (scene.soft && slot !== 0) return;
  playKickAndBrush(beat);
  if (!(scene.sparseness && slot % 2))
    playTick(beat, time + jitter(HUMANIZE), slot % 2 ? 0.012 : 0.02, 6800, 0.025);
}

function playTuneNote(beat: Beat, written: number): void {
  const { scene, time, eighth } = beat;
  if (scene.sparseness && Math.random() < scene.sparseness) return;
  const note =
    (scene.pentatonic ? toPentatonic(written) : written) -
    TUNE_OCTAVE_DOWN +
    (scene.transpose || 0);
  const start = time + jitter(HUMANIZE);
  const level = 0.16 + Math.random() * 0.025;
  pluck(beat, pitch(scene, note), start, level);
  pluck(beat, pitch(scene, note), start + (scene.echoDelay ?? eighth * 2), level * 0.3);
  if (scene.harmony)
    pluck(beat, pitch(scene, toWhiteKeys(note - scene.harmony)), start + 0.02, level * 0.38);
  if (scene.shimmer && note + 12 <= HIGHEST_NOTE)
    pluck(beat, pitch(scene, note + 12), start + 0.16, level * scene.shimmer);
}

/** The kalimba tune, an octave down and unhurried, with its echo a quarter behind. */
function playTune(beat: Beat): void {
  const melody = beat.cycle % 2 ? MELODY_VARIATION : MELODY;
  for (const written of notesOn(melody[beat.bar], beat.slot)) playTuneNote(beat, written);
}

/** The flute, drone, bells and wind that enter on the downbeat. */
function playDownbeat(beat: Beat, tones: readonly number[]): void {
  const { scene, bar, time, eighth } = beat;
  if (scene.flute && bar % 2 === 0)
    playFlute(
      beat,
      pitch(scene, (tones[tones.length - 1] ?? 69) + 12 + (scene.transpose || 0)),
      time + 0.05,
      eighth * 6,
      scene.flute,
    );
  if (scene.drone)
    playPartial(beat, {
      frequency: midiToFrequency(G2),
      time,
      level: 0.022,
      decay: 3,
      wave: 'sine',
      attack: 0.3,
    });
  if (scene.bells && bar % 4 === 0)
    for (const [index, delay] of [0, 0.14].entries())
      playTin(beat, time + delay, 0.018 / (index + 1));
  if (scene.wind && bar % 2 === 0) playGust(beat, time, 0.045);
}

/** Dust on the record, birds, drips and chimes, scattered within the eighth. */
function playTexture(beat: Beat, tones: readonly number[]): void {
  const { scene, time, eighth } = beat;
  if (Math.random() < CRACKLE)
    playTick(
      beat,
      time + eighth * Math.random(),
      0.004 + Math.random() * 0.006,
      2500 + Math.random() * 4000,
      0.004,
    );
  if (scene.birds && Math.random() < BIRDSONG) playBird(beat, time + eighth * Math.random(), 0.014);
  if (scene.drips && Math.random() < scene.drips)
    playDrip(beat, time + eighth * Math.random(), 0.015);
  if (scene.chimes && Math.random() < scene.chimes)
    pluck(
      beat,
      pitch(
        scene,
        Math.min(HIGHEST_NOTE, (tones[Math.floor(Math.random() * tones.length)] ?? 69) + 24),
      ),
      time + 0.1,
      0.022,
    );
}

export const surfaceScore: Score = {
  lookahead: 0.45,
  eighth: 60 / 70 / 2,
  slotsPerBar: 8,
  slotsPerCycle: 64,
  playBeat(straight) {
    const chord = CHORDS[straight.bar];
    if (!chord) return;
    const [bass, tones] = chord;
    // the off-beats land late
    const swing = straight.slot % 2 ? straight.eighth * SWING : 0;
    const beat: Beat = { ...straight, time: straight.time + swing };
    playKeysChord(beat, tones);
    playBassLine(beat, bass);
    playDrums(beat);
    playTune(beat);
    if (beat.slot === 0) playDownbeat(beat, tones);
    playTexture(beat, tones);
  },
};
