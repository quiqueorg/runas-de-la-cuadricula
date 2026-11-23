/** The architect's plan an exam shows: the goal measured in every view (and state), as boxes. */
import { isOpenBoard } from '../../../core/catalog';
import type { BoardView, Level } from '../../../core/models';
import { containerQuery } from '../css/media';
import { GOAL_LAYERS, layerCss } from '../css/stylesheet';
import {
  type BoardLayers,
  boardOf,
  piecesOf,
  placeBoard,
  STILL_CLASS,
  simulateState,
  stateLabels,
} from './layers';

export interface BlueprintPiece {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly pinned: boolean;
  /** Computed background, when the exam compares colours. */
  readonly color: string;
  readonly icon: string;
  readonly label: string;
}

export interface BlueprintView {
  readonly boardWidth: number;
  readonly boardHeight: number;
  readonly caption: string;
  readonly pieces: readonly BlueprintPiece[];
}

/** The solution's stylesheet for one view. */
export function goalCss(level: Level, view: BoardView): string {
  return layerCss(level, GOAL_LAYERS, {
    bodies: level.rules.map((rule) => rule.solution),
    conditions: level.mediaGroups.map((group) => containerQuery(group.solution, view)),
  });
}

const viewCaption = (view: BoardView): string =>
  /^\d/.test(view.name) ? `Tablero de ${view.name}` : view.name;

function measureGoal(level: Level, layer: HTMLElement, scale: number): BlueprintPiece[] {
  const board = boardOf(layer)?.getBoundingClientRect();
  if (!board) return [];
  const withColor = Boolean(level.compare?.includes('background-color'));
  return piecesOf(layer).map((element, index) => {
    const box = element.getBoundingClientRect();
    const piece = level.pieces[index];
    return {
      x: (box.left - board.left) / scale,
      y: (box.top - board.top) / scale,
      width: box.width / scale,
      height: box.height / scale,
      pinned: Boolean(piece?.pinned),
      color: withColor ? getComputedStyle(element).backgroundColor : '',
      icon: piece?.kind.icon || piece?.kind.token || '',
      label: piece?.label || piece?.markup || '',
    };
  });
}

/** `Tablero de 400px · con el cursor`: which view and state a plan shows, when there are several. */
function captionOf(level: Level, view: BoardView, on: boolean): string {
  const state = level.state ? (on ? stateLabels[level.state] : 'en reposo') : '';
  return [level.views.length > 1 ? viewCaption(view) : '', state].filter(Boolean).join(' · ');
}

/** Each view at rest, and in the simulated state when the lesson has one. */
const stagesOf = (level: Level): { view: BoardView; on: boolean }[] =>
  level.views.flatMap((view) =>
    (level.state ? [false, true] : [false]).map((on) => ({ view, on })),
  );

/**
 * Repaints the goal in each view and state to measure it, then leaves the board showing `current`.
 * `sheet` is the goal's `<style>` element.
 */
export function readBlueprint(
  level: Level,
  layers: BoardLayers,
  current: BoardView,
  scale: number,
  sheet: HTMLStyleElement | null,
): BlueprintView[] {
  // Open boards are measured on the hidden copy, where states can be switched without transitions.
  const open = isOpenBoard(level);
  const layer = open ? layers.probeTarget : layers.target;
  const show = (view: BoardView) => {
    const css = goalCss(level, view);
    if (sheet && sheet.textContent !== css) sheet.textContent = css;
    placeBoard(layers, level, view);
  };
  const plans = stagesOf(level).map(({ view, on }): BlueprintView => {
    show(view);
    if (open) {
      layers.probeTarget.classList.add(STILL_CLASS);
      simulateState([layers.probeTarget], on);
    }
    return {
      boardWidth: view.width,
      boardHeight: view.height,
      caption: captionOf(level, view, on),
      pieces: measureGoal(level, layer, scale),
    };
  });
  if (open) {
    simulateState([layers.probeTarget], false);
    void layers.probeTarget.offsetWidth;
    layers.probeTarget.classList.remove(STILL_CLASS);
  }
  show(current);
  return plans;
}
