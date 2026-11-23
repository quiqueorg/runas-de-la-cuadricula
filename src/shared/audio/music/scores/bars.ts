/** A bar of a tune: [eighth within the bar, note]. */
export type Bar = readonly (readonly [slot: number, note: number])[];

/** The notes of `bar` that fall on eighth `slot`. */
export function notesOn(bar: Bar | undefined, slot: number): number[] {
  const notes: number[] = [];
  for (const [noteSlot, note] of bar ?? []) if (noteSlot === slot) notes.push(note);
  return notes;
}
