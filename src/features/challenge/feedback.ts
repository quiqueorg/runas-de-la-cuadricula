/** The sounds a lesson makes as pieces fall into place, and when it is solved. */
import type { Level, Piece } from '../../core/models';
import { sound } from '../../shared/audio/audio';
import { piecesOf } from './board/layers';
import { readTransitions } from './css/transitions';

const C5 = 523.25;
const E5 = 659.25;
const G4 = 392;
/** Lanterns sing by their class: `alto`, `medio`, `bajo`. */
const LANTERN_PITCH: Record<string, number> = { alto: E5, medio: C5, bajo: G4 };
const CHIME_NOTES = [C5, E5, 783.99, 1046.5, 1318.51];
const MELODY_START_S = 0.3;
const MELODY_STEP_S = 0.26;
const POULTRY = /gallina|gallo|pollito/;

const lanternPitch = (piece: Piece): number => LANTERN_PITCH[piece.variant] ?? C5;

/** The lanterns in board order, then a closing chord. */
function playMelody(level: Level): void {
  level.pieces.forEach((piece, index) => {
    sound.tone(lanternPitch(piece), MELODY_START_S + index * MELODY_STEP_S, 1.1);
  });
  const end = MELODY_START_S + level.pieces.length * MELODY_STEP_S + 0.2;
  for (const frequency of [G4, C5, E5]) sound.tone(frequency, end, 2.2);
}

export function playVictory(level: Level): void {
  if (level.musical) playMelody(level);
  else sound.victory();
}

/** Pieces that just matched: a note each in a musical lesson, a cluck for poultry, a click otherwise. */
export function playMatched(level: Level, newlyMatched: readonly number[]): void {
  if (!newlyMatched.length || level.exam) return;
  if (level.musical) {
    newlyMatched.forEach((index, order) => {
      const piece = level.pieces[index];
      if (piece) sound.tone(lanternPitch(piece), order * 0.12);
    });
  } else if (newlyMatched.some((index) => POULTRY.test(level.pieces[index]?.type ?? ''))) {
    sound.cluck();
  } else {
    sound.snap();
  }
}

/** A musical board rings each piece as its transform starts, so the transition delays are heard. */
export function playChimes(player: HTMLElement): void {
  piecesOf(player).forEach((piece, index) => {
    const transitions = readTransitions(piece, false);
    const transform = transitions.get('transform') ?? transitions.get('all');
    sound.tone(CHIME_NOTES[index % CHIME_NOTES.length] ?? C5, transform?.delay ?? 0, 1.4);
  });
}
