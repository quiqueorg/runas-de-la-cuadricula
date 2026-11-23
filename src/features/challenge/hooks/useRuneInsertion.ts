/** Writing into the tablet's fields from the rune chips and the Tab key. */
import { type RefObject, useCallback, useRef } from 'react';
import { CONDITION_TOKENS } from '../css/media';
import { runeSnippet } from '../tablet';
import type { TabletField } from './useTablet';

type Edit = (field: TabletField, index: number, value: string) => void;

const fieldOf = (area: HTMLTextAreaElement): TabletField =>
  (area.dataset.field as TabletField | undefined) ?? 'declarations';

/**
 * Inserts at the caret through the browser's own editing, so it lands in the undo history and fires
 * the same input event as typing. The manual path is for browsers that dropped `insertText`.
 */
function insertAtCaret(area: HTMLTextAreaElement, text: string, rewind: number, edit: Edit): void {
  area.focus();
  const start = area.selectionStart ?? area.value.length;
  const end = area.selectionEnd ?? start;
  const next = area.value.slice(0, start) + text + area.value.slice(end);
  const caret = start + text.length - rewind;
  if (document.execCommand?.('insertText', false, text) && area.value === next) {
    area.setSelectionRange(caret, caret);
    return;
  }
  edit(fieldOf(area), Number(area.dataset.index), next);
  requestAnimationFrame(() => area.setSelectionRange(caret, caret));
}

/** Where a rune goes, and what to write: condition words into a condition, the rest into declarations. */
function placementOf(
  areas: readonly HTMLTextAreaElement[],
  last: HTMLTextAreaElement | null,
  property: string,
): { readonly area: HTMLTextAreaElement; readonly text: string; readonly rewind: number } | null {
  const area = (last && areas.includes(last) ? last : null) ?? areas[0];
  if (!area) return null;
  const conditions = areas.filter((item) => fieldOf(item) === 'conditions');
  if (conditions.length && CONDITION_TOKENS.has(property)) {
    const target = fieldOf(area) === 'conditions' ? area : conditions[0];
    return target ? { area: target, ...runeSnippet(property, true) } : null;
  }
  const declarations =
    fieldOf(area) === 'declarations'
      ? area
      : (areas.find((item) => fieldOf(item) === 'declarations') ?? area);
  // A new line, unless the caret's line is still empty.
  const caret = declarations.selectionStart ?? declarations.value.length;
  const lineStart = declarations.value.lastIndexOf('\n', caret - 1) + 1;
  const newLine = declarations.value.slice(lineStart, caret).trim() ? '\n' : '';
  const snippet = runeSnippet(property, false);
  return { area: declarations, text: `${newLine}${snippet.text}`, rewind: snippet.rewind };
}

export interface RuneInsertion {
  /** Remembers the field a rune chip should write into. */
  readonly focus: (area: HTMLTextAreaElement) => void;
  readonly insertRune: (property: string) => void;
  readonly indent: (area: HTMLTextAreaElement) => void;
}

/**
 * A condition word goes into a condition field; a property goes into a declarations field, on a new
 * line if the caret's line already has something.
 */
export function useRuneInsertion(root: RefObject<HTMLElement | null>, edit: Edit): RuneInsertion {
  const lastArea = useRef<HTMLTextAreaElement | null>(null);

  const insertRune = useCallback(
    (property: string) => {
      const areas = [...(root.current?.querySelectorAll<HTMLTextAreaElement>('textarea') ?? [])];
      const placement = placementOf(areas, lastArea.current, property);
      if (placement) insertAtCaret(placement.area, placement.text, placement.rewind, edit);
    },
    [root, edit],
  );

  return {
    focus: useCallback((area: HTMLTextAreaElement) => {
      lastArea.current = area;
    }, []),
    insertRune,
    indent: useCallback((area: HTMLTextAreaElement) => insertAtCaret(area, '  ', 0, edit), [edit]),
  };
}
