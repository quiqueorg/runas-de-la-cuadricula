/** Pitches and the scale bends the scenes apply to a tune. */

const A4_MIDI = 69;
const A4_HZ = 440;

export function midiToFrequency(note: number): number {
  return A4_HZ * 2 ** ((note - A4_MIDI) / 12);
}

/** 0 = C … 11 = B, also for negative notes. */
function pitchClass(note: number): number {
  return ((note % 12) + 12) % 12;
}

const C = 0;
const E = 4;
const F_SHARP = 6;
const A = 9;
const B = 11;
const BLACK_KEYS = [1, 3, 6, 8, 10];

/** Lowers E, A and B a semitone: the sky's F lydian turns minor for storms and the final battle. */
export function toMinor(note: number): number {
  return [E, A, B].includes(pitchClass(note)) ? note - 1 : note;
}

/**
 * Nudges a black key down onto the white keys. F lydian uses only white keys, so harmony notes
 * computed by interval stay in key.
 */
export function toWhiteKeys(note: number): number {
  return BLACK_KEYS.includes(pitchClass(note)) ? note - 1 : note;
}

/** The desert flattens G major's second and sixth (A and E), which turns the road south. */
export function toDesertScale(note: number): number {
  return [A, E].includes(pitchClass(note)) ? note - 1 : note;
}

/** The village keeps to G major's five notes: C steps down to B and F sharp down to E. */
export function toPentatonic(note: number): number {
  const pitch = pitchClass(note);
  if (pitch === C) return note - 1;
  return pitch === F_SHARP ? note - 2 : note;
}
