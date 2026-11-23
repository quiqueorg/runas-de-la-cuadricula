/**
 * The board's layers and where they sit on the stage.
 *
 * The canvas stacks several copies of the same pieces: the player's board, the goal, the goal's
 * dashed outline, and two hidden "probes" measured without transitions. Their DOM nodes are the
 * one thing this feature reads imperatively; everything here only positions or flags them.
 */
import type { BoardState, BoardView, Level } from '../../../core/models';

/** Space around the board on the stage, for the guide labels. */
export const BOARD_GUTTER = 30;

export interface BoardLayers {
  readonly canvas: HTMLElement;
  readonly floor: HTMLElement;
  readonly sand: HTMLElement;
  readonly player: HTMLElement;
  readonly target: HTMLElement;
  readonly outline: HTMLElement;
  readonly probe: HTMLElement;
  readonly probeTarget: HTMLElement;
}

/** The stage fits the widest view. */
export function stageSize(level: Level): { readonly width: number; readonly height: number } {
  return {
    width: Math.max(...level.widths) + 2 * BOARD_GUTTER,
    height: level.height + 2 * BOARD_GUTTER,
  };
}

/** Top-left corner of a view's board on the stage: narrower views are centred. */
export function boardOrigin(
  level: Level,
  view: BoardView,
): { readonly x: number; readonly y: number } {
  return { x: BOARD_GUTTER + (Math.max(...level.widths) - view.width) / 2, y: BOARD_GUTTER };
}

export const boardOf = (layer: ParentNode): HTMLElement | null => layer.querySelector('.tablero');

export const piecesOf = (layer: ParentNode): HTMLElement[] => [
  ...layer.querySelectorAll<HTMLElement>('.pieza'),
];

/**
 * Class the board takes in a simulated state. Lessons write it in their CSS (`.tablero.activo`),
 * so it stays Spanish like every class a player reads.
 */
export const ACTIVE_CLASS = 'activo';
/** Classes that stand in for the real pseudo-classes on layers no pointer can reach. */
export const SIMULATED_CLASSES = ['sim-hover', 'sim-active', 'sim-focus'] as const;
/** Turns transitions off on the hidden copies while they are measured. */
export const STILL_CLASS = 'sin-trans';

/** Switches the simulated state on or off on a layer, its board and its pieces. */
export function simulateState(layers: readonly ParentNode[], on: boolean): void {
  for (const layer of layers) {
    const board = boardOf(layer);
    if (!board) continue;
    board.classList.toggle(ACTIVE_CLASS, on);
    for (const name of SIMULATED_CLASSES) {
      board.classList.toggle(name, on);
      for (const piece of piecesOf(layer)) piece.classList.toggle(name, on);
    }
  }
}

/** Sizes every layer to `view` and tells the canvas what the device reports. */
export function placeBoard(layers: BoardLayers, level: Level, view: BoardView): void {
  const { x, y } = boardOrigin(level, view);
  const boards = [...layers.canvas.querySelectorAll<HTMLElement>('.board-layer')];
  for (const element of [layers.floor, layers.sand, ...boards]) {
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    element.style.width = `${view.width}px`;
    element.style.height = `${view.height}px`;
  }
  layers.canvas.dataset.media = view.media;
  layers.canvas.dataset.colorScheme = view.colorScheme;
}

export const stateLabels: Record<BoardState, string> = {
  active: 'activado',
  hover: 'con el cursor',
  pressed: 'pulsado',
  focus: 'con el foco',
};
