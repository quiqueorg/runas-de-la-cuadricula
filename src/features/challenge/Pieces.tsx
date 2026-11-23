/**
 * The board's pieces. They are real elements, so the player's CSS lays them out and the game
 * measures them. The classes they carry are what lessons select, so they stay Spanish.
 */
import { createElement, type MouseEvent, type ReactNode } from 'react';
import type { Level, Piece } from '../../core/models';
import { Rune } from '../../shared/icons/Rune';
import { SIMULATED_CLASSES } from './board/layers';

const join = (...names: (string | false | undefined)[]): string => names.filter(Boolean).join(' ');

/** The pieces' tree: each piece's children, and the pieces at the top. */
function treeOf(level: Level): { readonly roots: number[]; readonly children: number[][] } {
  const children: number[][] = level.pieces.map(() => []);
  const roots: number[] = [];
  level.pieces.forEach((piece, index) => {
    if (piece.parent >= 0) children[piece.parent]?.push(index);
    else roots.push(index);
  });
  return { roots, children };
}

const iconOf = (piece: Piece): string | undefined => piece.kind.icon || piece.kind.token;

/** A drawn piece: a material area or a token, with its label. */
function drawnClasses(piece: Piece): string {
  return join(
    'pieza',
    piece.type,
    piece.variant,
    piece.kind.material ? `area m-${piece.kind.material}` : 'objeto',
    piece.pinned && 'fija',
    piece.label && 'with-label',
    piece.hasChildren && 'contenedor',
  );
}

/** How a real element looks when the player has not styled it yet. */
function elementLook(piece: Piece): string {
  if (piece.kind.isText) return 'texto';
  if (piece.kind.material) return `material m-${piece.kind.material}`;
  if (iconOf(piece)) return 'cosa';
  return piece.kind.tag ? 'bloque' : 'caja';
}

/** A real element keeps only the classes a player could have written, plus the board's own. */
function elementClasses(piece: Piece): string {
  return join(
    'pieza',
    'el',
    !piece.kind.tag && piece.type,
    piece.variant,
    elementLook(piece),
    piece.pinned && 'fija',
    piece.hasChildren && 'contenedor',
  );
}

function Icon({ piece }: { readonly piece: Piece }) {
  const name = iconOf(piece);
  if (!name) return null;
  if (name === 'molino') {
    return (
      <span className="ic">
        <Rune id="i-molino" />
        <Rune id="i-aspas" className="aspas" />
      </span>
    );
  }
  return <Rune id={`i-${name}`} className="ic" />;
}

/** A board link is there to be selected, not followed. */
const stayOnBoard = (event: MouseEvent) => event.preventDefault();

function elementPiece(piece: Piece, index: number, states: string, nested: ReactNode[]): ReactNode {
  return createElement(
    piece.kind.tag ?? 'div',
    {
      ...piece.attrs,
      key: index,
      className: `${elementClasses(piece)}${states}`,
      'data-id': piece.id || undefined,
      'data-marca': piece.markup || undefined,
      ...(piece.kind.tag === 'a' ? { onClick: stayOnBoard } : {}),
    },
    // Nothing but the piece's own content goes inside: `:first-child` and friends must see the
    // real children.
    piece.hasChildren ? null : <Icon piece={piece} />,
    piece.text || null,
    ...nested,
  );
}

function signPiece(piece: Piece, index: number, states: string): ReactNode {
  return (
    <div
      key={index}
      className={`${join('pieza cartel', piece.variant)}${states}`}
      data-id={piece.id || undefined}
    >
      <span className="txt">{piece.text}</span>
      {piece.label && <span className="et">{piece.label}</span>}
    </div>
  );
}

function drawnPiece(piece: Piece, index: number, states: string, nested: ReactNode[]): ReactNode {
  const icon = iconOf(piece);
  return (
    <div key={index} className={`${drawnClasses(piece)}${states}`} data-id={piece.id || undefined}>
      {icon === 'casa' && <i className="humo" aria-hidden="true" />}
      {icon === 'faro' && <i className="haz" aria-hidden="true" />}
      <Icon piece={piece} />
      {piece.label && <span className="et">{piece.label}</span>}
      {nested}
    </div>
  );
}

export interface PieceTreeProps {
  readonly level: Level;
  /** Pieces that take the `matched` class. */
  readonly matches?: readonly boolean[];
  /** The board shows the lesson's simulated state. */
  readonly simulated?: boolean;
  /** Pieces that flash after a failed exam delivery. */
  readonly flashing?: ReadonlySet<number>;
}

const SIMULATED = ` ${SIMULATED_CLASSES.join(' ')}`;

export function PieceTree({ level, matches, simulated = false, flashing }: PieceTreeProps) {
  const { roots, children } = treeOf(level);
  const statesOf = (index: number) =>
    [
      matches?.[index] ? ' matched' : '',
      simulated ? SIMULATED : '',
      flashing?.has(index) ? ' mismatch' : '',
    ].join('');
  const render = (index: number): ReactNode => {
    const piece = level.pieces[index];
    if (!piece) return null;
    const nested = (children[index] ?? []).map(render);
    const states = statesOf(index);
    if (piece.kind.tag || level.world === 'isle') return elementPiece(piece, index, states, nested);
    if (piece.kind.sign) return signPiece(piece, index, states);
    return drawnPiece(piece, index, states, nested);
  };
  return <>{roots.map(render)}</>;
}

const MARKUP_TEXT_MAX = 30;

function openingTag(piece: Piece): { readonly tag: string; readonly open: string } {
  const tag = piece.kind.tag ?? 'div';
  const names = join(!piece.kind.tag && piece.type, piece.variant);
  const attributes = Object.entries(piece.attrs ?? {})
    .map(([name, value]) => (value ? ` ${name}="${value}"` : ` ${name}`))
    .join('');
  const id = piece.id ? ` id="${piece.id}"` : '';
  return { tag, open: `<${tag}${names ? ` class="${names}"` : ''}${id}${attributes}>` };
}

/** The board's markup as a player would read it in the page source. */
export function boardMarkup(level: Level): string {
  const { roots, children } = treeOf(level);
  const lines = ['<div class="tablero">'];
  const write = (index: number, depth: number) => {
    const piece = level.pieces[index];
    if (!piece) return;
    const { tag, open } = openingTag(piece);
    const pad = '  '.repeat(depth);
    const inside = children[index] ?? [];
    const text =
      piece.text.length > MARKUP_TEXT_MAX
        ? `${piece.text.slice(0, MARKUP_TEXT_MAX - 2)}…`
        : piece.text;
    if (!inside.length) {
      lines.push(`${pad}${open}${text}</${tag}>`);
      return;
    }
    lines.push(`${pad}${open}${text}`);
    for (const child of inside) write(child, depth + 1);
    lines.push(`${pad}</${tag}>`);
  };
  for (const index of roots) write(index, 1);
  lines.push('</div>');
  return lines.join('\n');
}
