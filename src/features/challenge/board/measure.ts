/** Measures the player's board against the goal: positions, computed styles and transitions. */
import type { Level, Piece } from '../../../core/models';
import { readTransitions, transitionDifference } from '../css/transitions';
import { boardOf, piecesOf, STILL_CLASS, simulateState } from './layers';

/** Pixels of slack, at a stage scale of 1. */
const TOLERANCE_PX = 1.5;

/** What a compared property is called in a message. */
const PROPERTY_NAMES: Record<string, string> = {
  'background-color': 'el color de fondo',
  opacity: 'la transparencia',
  transform: 'la transformación',
  color: 'el color del texto',
  'border-top-width': 'el grosor del borde',
  'border-top-style': 'el estilo del borde',
  'border-top-color': 'el color del borde',
  'border-bottom-width': 'el grosor del borde de abajo',
  'border-bottom-style': 'el estilo del borde de abajo',
  'border-bottom-color': 'el color del borde de abajo',
  'border-left-width': 'el grosor del borde izquierdo',
  'border-left-style': 'el estilo del borde izquierdo',
  'border-left-color': 'el color del borde izquierdo',
  'border-top-left-radius': 'el redondeo de las esquinas',
  'background-image': 'la imagen de fondo',
  'background-repeat': 'la repetición del fondo',
  'background-position': 'la posición del fondo',
  'background-size': 'el tamaño del fondo',
  'font-family': 'la familia de letra',
  'font-size': 'el tamaño de letra',
  'font-weight': 'el grosor de la letra',
  'font-style': 'el estilo de la letra',
  'text-align': 'la alineación del texto',
  'text-decoration-line': 'el subrayado',
  'text-transform': 'las mayúsculas',
  'line-height': 'el interlineado',
  'letter-spacing': 'el espaciado entre letras',
  'box-shadow': 'la sombra',
  'list-style-type': 'la viñeta de la lista',
  visibility: 'la visibilidad',
  'text-shadow': 'la sombra del texto',
  filter: 'el filtro',
  'outline-style': 'el estilo del contorno',
  'outline-width': 'el grosor del contorno',
  'outline-color': 'el color del contorno',
  'outline-offset': 'la separación del contorno',
  'white-space': 'cómo se parten las líneas',
  'text-overflow': 'cómo se corta el texto que no cabe',
  'overflow-x': 'lo que pasa con el contenido que sobra',
  'writing-mode': 'la dirección de la escritura',
  'overflow-y': 'lo que pasa con el contenido que sobra',
  'z-index': 'la capa',
  position: 'el tipo de posición',
  float: 'la flotación',
  display: 'el tipo de caja',
};

/** A font list means the same with or without quotes, in any case. */
const comparable = (property: string, value: string): string =>
  property === 'font-family'
    ? value
        .toLowerCase()
        .replace(/["']/g, '')
        .replace(/\s*,\s*/g, ',')
        .trim()
    : value;

const pieceName = (piece: Piece) =>
  `«${piece.id ? `#${piece.id}` : piece.label || piece.variant || piece.type}»`;

/** Same box relative to each board, within the tolerance. */
function samePlace(
  piece: DOMRect,
  board: DOMRect,
  goalPiece: DOMRect,
  goalBoard: DOMRect,
  tolerance: number,
): boolean {
  return (
    Math.abs(piece.left - board.left - (goalPiece.left - goalBoard.left)) <= tolerance &&
    Math.abs(piece.top - board.top - (goalPiece.top - goalBoard.top)) <= tolerance &&
    Math.abs(piece.width - goalPiece.width) <= tolerance &&
    Math.abs(piece.height - goalPiece.height) <= tolerance
  );
}

/** Whether each piece of `player` sits where the same piece of `goal` does. */
export function measurePlacement(player: HTMLElement, goal: HTMLElement, scale: number): boolean[] {
  const playerPieces = piecesOf(player);
  const goalPieces = piecesOf(goal);
  const playerBoard = boardOf(player)?.getBoundingClientRect();
  const goalBoard = boardOf(goal)?.getBoundingClientRect();
  if (!playerBoard || !goalBoard) return playerPieces.map(() => false);
  return playerPieces.map((piece, index) => {
    const other = goalPieces[index];
    return Boolean(
      other &&
        samePlace(
          piece.getBoundingClientRect(),
          playerBoard,
          other.getBoundingClientRect(),
          goalBoard,
          TOLERANCE_PX * scale,
        ),
    );
  });
}

export interface ProbeResult {
  /** Per piece: in place, with the compared styles and transitions of the goal. */
  readonly matches: readonly boolean[];
  readonly messages: readonly string[];
  /** The board's own transitions differ from the goal's. */
  readonly boardDiffers: boolean;
}

/** A piece on the player's copy, the same piece on the goal's, and its spec. */
interface PiecePair {
  readonly index: number;
  readonly mine: HTMLElement;
  readonly goal: HTMLElement;
  readonly spec: Piece;
}

function pairsOf(level: Level, player: HTMLElement, goal: HTMLElement): PiecePair[] {
  const goalPieces = piecesOf(goal);
  return piecesOf(player).flatMap((mine, index) => {
    const other = goalPieces[index];
    const spec = level.pieces[index];
    return other && spec ? [{ index, mine, goal: other, spec }] : [];
  });
}

/** Records a piece that does not match, and why (once per message). */
type Mismatch = (index: number | null, message?: string | null) => void;

function compareStyles(level: Level, pair: PiecePair, on: boolean, mismatch: Mismatch): void {
  for (const property of level.compare ?? []) {
    const mine = comparable(property, getComputedStyle(pair.mine).getPropertyValue(property));
    const goal = comparable(property, getComputedStyle(pair.goal).getPropertyValue(property));
    if (mine === goal) continue;
    const what = PROPERTY_NAMES[property] ?? `<code>${property}</code>`;
    mismatch(
      pair.index,
      `${pieceName(pair.spec)}: ${what} no coincide con el objetivo${on ? ' al activar' : ''}.`,
    );
  }
}

/** Positions and compared styles, in one state. */
function compareAtState(
  level: Level,
  pairs: readonly PiecePair[],
  boards: { readonly mine: HTMLElement; readonly goal: HTMLElement },
  tolerance: number,
  on: boolean,
  mismatch: Mismatch,
): void {
  const mineBox = boards.mine.getBoundingClientRect();
  const goalBox = boards.goal.getBoundingClientRect();
  for (const pair of pairs) {
    const goalRect = pair.goal.getBoundingClientRect();
    if (!samePlace(pair.mine.getBoundingClientRect(), mineBox, goalRect, goalBox, tolerance)) {
      mismatch(pair.index);
    }
    compareStyles(level, pair, on, mismatch);
  }
}

/** Transitions of the board and every piece. Returns whether the board's own differ. */
function compareTransitions(
  level: Level,
  pairs: readonly PiecePair[],
  boards: { readonly mine: HTMLElement; readonly goal: HTMLElement },
  mismatch: Mismatch,
): boolean {
  const withShadows = Boolean(level.compare?.includes('box-shadow'));
  const differenceOf = (name: string, mine: Element, goal: Element) =>
    transitionDifference(
      name,
      readTransitions(mine, withShadows),
      readTransitions(goal, withShadows),
    );
  const board = differenceOf('El tablero', boards.mine, boards.goal);
  mismatch(null, board);
  for (const pair of pairs) {
    const difference = differenceOf(pieceName(pair.spec), pair.mine, pair.goal);
    if (difference) mismatch(pair.index, difference);
  }
  return board !== null;
}

const setStill = (layers: readonly HTMLElement[], still: boolean) => {
  for (const layer of layers) layer.classList.toggle(STILL_CLASS, still);
};

/**
 * Measures the hidden copies. They show no transitions, so a lesson about a state is measured at
 * rest and in the state, and its transitions are compared separately.
 */
export function measureProbes(
  level: Level,
  probe: HTMLElement,
  probeTarget: HTMLElement,
  scale: number,
): ProbeResult {
  const mineBoard = boardOf(probe);
  const goalBoard = boardOf(probeTarget);
  if (!mineBoard || !goalBoard) {
    return { matches: level.pieces.map(() => false), messages: [], boardDiffers: false };
  }
  const boards = { mine: mineBoard, goal: goalBoard };
  const pairs = pairsOf(level, probe, probeTarget);
  const layers = [probe, probeTarget];
  const matches = level.pieces.map(() => true);
  const messages: string[] = [];
  const mismatch: Mismatch = (index, message) => {
    if (index !== null) matches[index] = false;
    if (message && !messages.includes(message)) messages.push(message);
  };
  let boardDiffers = false;

  for (const on of level.state ? [false, true] : [false]) {
    setStill(layers, true);
    simulateState(layers, on);
    compareAtState(level, pairs, boards, TOLERANCE_PX * scale, on, mismatch);
    if (!level.state) continue;
    // Transitions are read with transitions on: the still class would report them all as none.
    setStill(layers, false);
    if (compareTransitions(level, pairs, boards, mismatch)) boardDiffers = true;
  }

  // Back to rest without animating the way back.
  setStill(layers, true);
  simulateState(layers, false);
  void mineBoard.offsetWidth;
  void goalBoard.offsetWidth;
  setStill(layers, false);
  return { matches, messages, boardDiffers };
}

/** Whether every piece matching `upper` is drawn above every piece matching `lower`. */
export function isAbove(player: HTMLElement, upper: string, lower: string): boolean {
  const children = [...player.querySelectorAll<HTMLElement>(':scope > .tablero > .pieza')];
  const painted = children
    .map((element, index) => ({
      element,
      index,
      order: Number.parseInt(getComputedStyle(element).order, 10) || 0,
    }))
    .sort((a, b) => a.order - b.order || a.index - b.index);
  const paintIndex = new Map(painted.map((item, index) => [item.element, index]));
  const zIndex = (element: Element) => {
    const value = getComputedStyle(element).zIndex;
    return value === 'auto' ? 0 : Number.parseInt(value, 10) || 0;
  };
  const drawnAbove = (a: HTMLElement, b: HTMLElement) =>
    zIndex(a) > zIndex(b) ||
    (zIndex(a) === zIndex(b) && (paintIndex.get(a) ?? 0) > (paintIndex.get(b) ?? 0));
  const uppers = [...player.querySelectorAll<HTMLElement>(`.pieza.${upper}`)];
  const lowers = [...player.querySelectorAll<HTMLElement>(`.pieza.${lower}`)];
  return (
    uppers.length > 0 &&
    lowers.length > 0 &&
    uppers.every((a) => lowers.every((b) => drawnAbove(a, b)))
  );
}
