/**
 * Parses the compact piece notation lessons are written in:
 *
 *   `type@class.class#id[attr=value]:text`   a piece
 *   `#…`                                     the same, pinned to the board
 *   `[…]` after a piece                      that piece's children
 */
import type { Piece, PieceSpec, PieceTypeMap, WorldId } from '../models';

interface PieceSource {
  readonly spec: string;
  readonly parent: number;
}

/** Depth-first list of every spec, each with the index of its parent (-1 at the top). */
function flatten(list: readonly PieceSpec[], parent = -1, out: PieceSource[] = []): PieceSource[] {
  for (const item of list) {
    if (typeof item === 'string') out.push({ spec: item, parent });
    else flatten(item, out.length - 1, out);
  }
  return out;
}

interface SplitSpec {
  readonly head: string;
  readonly text: string;
  readonly attrs: Record<string, string> | undefined;
}

/**
 * Splits `head[attr=value][flag]:text`. Brackets are read before the colon, so a value may hold one
 * (`a[href=https://isla.es]:Puerto`). Quotes around a value are optional.
 */
function split(body: string): SplitSpec {
  let head = '';
  let attrs: Record<string, string> | undefined;
  let at = 0;
  while (at < body.length && body[at] !== ':') {
    if (body[at] !== '[') {
      head += body[at++];
      continue;
    }
    const close = body.indexOf(']', at);
    if (close < 0) break;
    const [name = '', ...rest] = body.slice(at + 1, close).split('=');
    const value = rest.join('=').replace(/^(["'])(.*)\1$/, '$2');
    if (name.trim()) {
      attrs ??= {};
      attrs[name.trim()] = value;
    }
    at = close + 1;
  }
  return { head, text: body[at] === ':' ? body.slice(at + 1) : '', attrs };
}

export interface PieceContext {
  readonly world: WorldId;
  readonly pieceTypes: PieceTypeMap;
  /** Selectors of the lesson's rules: a piece shows its class only when a rule targets it. */
  readonly selectors: ReadonlySet<string>;
  readonly labels: boolean;
  readonly labelPinned: boolean;
}

/** How a piece reads in the markup: `p.nota#aviso`, or `.type` for a piece that is not an element. */
function markupOf(tag: string | undefined, type: string, variant: string, id: string): string {
  const classes = variant ? `.${variant.replace(/ /g, '.')}` : tag ? '' : `.${type}`;
  return `${tag ?? ''}${classes}${id ? `#${id}` : ''}`;
}

function parsePiece({ spec, parent }: PieceSource, context: PieceContext): Piece {
  const pinned = spec.startsWith('#');
  const { head, text, attrs } = split(pinned ? spec.slice(1) : spec);
  const [names = '', id = ''] = head.split('#');
  const [type = '', dotted = ''] = names.split('@');
  const variant = dotted.replace(/\./g, ' ');
  const known = context.pieceTypes[type];
  // Real elements, and every piece on the isle, show their markup instead of a class label.
  const element = Boolean(known?.tag) || context.world === 'isle';
  const labelled = context.labels && !(pinned && !context.labelPinned);
  const targeted = context.selectors.has(`.${variant || type}`);
  return {
    type,
    variant,
    pinned,
    text,
    parent,
    kind: known ?? { token: type },
    label: !element && labelled && targeted ? variant || type : '',
    id,
    markup: element && labelled ? markupOf(known?.tag, type, variant, id) : '',
    hasChildren: false,
    ...(attrs ? { attrs } : {}),
  };
}

export function parsePieces(specs: readonly PieceSpec[], context: PieceContext): Piece[] {
  const pieces = flatten(specs).map((source) => parsePiece(source, context));
  const parents = new Set(pieces.map((piece) => piece.parent));
  return pieces.map((piece, index) =>
    parents.has(index) ? { ...piece, hasChildren: true } : piece,
  );
}
