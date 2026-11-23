/** Building blocks shared by every lesson file of the isle. */
import type { BoardRuleDraft } from '../../models';

/** Local region indexes (the order of the isle regions), so lesson files do not hard-code them. */
export const ISLE = {
  market: 7,
  greenhouses: 8,
  observatory: 9,
  library: 10,
  classroom: 11,
  secrets: 12,
} as const;

export const GOLD = 'background-color: gold;';
export const BG = ['background-color'];
export const BORDER = [
  'border-top-width',
  'border-top-style',
  'border-top-color',
  'border-bottom-width',
  'border-bottom-style',
  'border-bottom-color',
  'border-top-left-radius',
];
export const POSITION = ['position', 'top', 'right', 'bottom', 'left'];
export const fixed = (s: string, f: string): BoardRuleDraft => ({
  selector: s,
  fixed: f,
  editable: false,
});
/** Scenery the lesson is not about: applied to both boards, never shown on the tablet. */
export const hidden = (s: string, f: string): BoardRuleDraft => ({
  selector: s,
  fixed: f,
  editable: false,
  hidden: true,
});
/** The declarations are given; the student says who they are for. The third argument is what the field starts with. */
export const pick = (s: string, f: string, sel = ''): BoardRuleDraft => ({
  selector: s,
  ownSelector: sel,
  fixed: f,
  editable: false,
});
export const GAP = hidden('.pieza', 'margin-bottom: 6px;');
export const inRow = (selector: string): BoardRuleDraft =>
  hidden(selector, 'display: inline-block;\nvertical-align: top;\nmargin: 6px;');
export const BORDER_BOX = hidden('*', 'box-sizing: border-box;');
export const LAMPS = hidden('.farol', 'width: 64px;');
/** The link in a timed lesson's message that gives the player another go. */
export const refill = (action: string): string =>
  `<button type="button" class="text-link" id="p-sacudir">${action}</button>`;
