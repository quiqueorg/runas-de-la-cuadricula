/**
 * The sheet every hand-drawn map overlay is drawn in: the landscape ink, the isle's moving bits and
 * the painted isle chart. scenery.json holds positions in the same sheet divided by its size.
 */
export const SHEET_WIDTH = 660;
export const SHEET_HEIGHT = 454;

export type SheetPoint = readonly [number, number];
