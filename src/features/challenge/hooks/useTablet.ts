/** The tablet's text: restored from the save, edited by the player, saved back as it changes. */
import { useCallback, useEffect, useState } from 'react';
import type { Level } from '../../../core/models';
import { getProgress, saveCode } from '../../../core/progress/store';
import { type FillKind, registerFill } from '../fill';
import { replaceAt, savedCodeOf, type TabletText, tabletFromSaved, tabletOf } from '../tablet';

export type TabletField = 'declarations' | 'conditions' | 'selectors';

export interface TabletControls {
  readonly tablet: TabletText;
  readonly edit: (field: TabletField, index: number, value: string) => void;
  /** Replaces everything with the solution or the lesson's start. */
  readonly fill: (kind: FillKind) => void;
}

export function useTablet(level: Level): TabletControls {
  const [tablet, setTablet] = useState(() => tabletFromSaved(level, getProgress().code[level.id]));

  const fill = useCallback((kind: FillKind) => setTablet(tabletOf(level, kind)), [level]);
  const edit = useCallback((field: TabletField, index: number, value: string) => {
    setTablet((current) => ({ ...current, [field]: replaceAt(current[field], index, value) }));
  }, []);

  // Opening a lesson saves its tablet too: that is what marks a world as started.
  useEffect(() => saveCode(level.id, savedCodeOf(level, tablet)), [level, tablet]);
  useEffect(() => registerFill(level.id, fill), [level.id, fill]);

  return { tablet, edit, fill };
}
