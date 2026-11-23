/** Building blocks shared by every lesson file of the isle. */
import type { BoardRuleDraft } from '../../models';

/** Local region indexes (the order of `baseRegions`), so lesson files do not hard-code them. */
export const ISLE = { mercado: 7, invernaderos: 8, observatorio: 9, biblioteca: 10, aula: 11, secretos: 12 } as const;

export const GOLD = 'background-color: gold;';
export const BG = ['background-color'];
export const BORDER = ['border-top-width', 'border-top-style', 'border-top-color', 'border-bottom-width', 'border-bottom-style', 'border-bottom-color', 'border-top-left-radius'];
export const POSITION = ['position', 'top', 'right', 'bottom', 'left'];
export const fixed = (s: string, f: string): BoardRuleDraft => ({ s, f, ed: false });
/** Scenery the lesson is not about: applied to both boards, never shown on the tablet. */
export const hidden = (s: string, f: string): BoardRuleDraft => ({ s, f, ed: false, oculto: true });
/** The declarations are given; the student says who they are for. The third argument is what the field starts with. */
export const pick = (s: string, f: string, sel = ''): BoardRuleDraft => ({ s, sel, f, ed: false });
export const GAP = hidden('.pieza', 'margin-bottom: 6px;');
export const inRow = (selector: string): BoardRuleDraft => hidden(selector, 'display: inline-block;\nvertical-align: top;\nmargin: 6px;');
export const BORDER_BOX = hidden('*', 'box-sizing: border-box;');
export const LAMPS = hidden('.farol', 'width: 64px;');
/** The link in a timed lesson's message that gives the player another go. */
export const refill = (action: string): string => `<button type="button" class="text-link" id="p-sacudir">${action}</button>`;
