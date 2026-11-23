/** The board's pieces. Icons are canvases; the boxes stay real elements so student CSS can measure them. */
import { createElement, type MouseEvent, type ReactNode } from 'react';
import type { Level, RuntimePiece } from '../../core/models';
import { Rune } from '../../shared/icons/Rune';

function classes(piece: RuntimePiece): string {
  return ['pieza', piece.t, piece.k, piece.T.a ? `area m-${piece.T.a}` : 'objeto', piece.fija ? 'fija' : '', piece.e ? 'with-label' : '', piece.cont ? 'contenedor' : ''].filter(Boolean).join(' ');
}

/** A piece that is a real element keeps only the classes a student could have written, plus the board's own. */
function elementClasses(piece: RuntimePiece): string {
  const look = piece.T.texto ? 'texto' : piece.T.a ? `material m-${piece.T.a}` : piece.T.i || piece.T.o ? 'cosa' : piece.T.tag ? 'bloque' : 'caja';
  return ['pieza', 'el', piece.T.tag ? '' : piece.t, piece.k, look, piece.fija ? 'fija' : '', piece.cont ? 'contenedor' : ''].filter(Boolean).join(' ');
}

function Icon({ piece }: { readonly piece: RuntimePiece }) {
  const name = piece.T.i || piece.T.o;
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

export function PieceTree({ level, matches }: { readonly level: Level; readonly matches?: readonly boolean[] }) {
  const children: number[][] = level.p.map(() => []);
  const roots: number[] = [];
  level.p.forEach((piece, index) => {
    if (piece.padre >= 0) children[piece.padre]?.push(index);
    else roots.push(index);
  });
  const renderPiece = (index: number): ReactNode => {
    const piece = level.p[index];
    if (!piece) return null;
    const nested = (children[index] ?? []).map(renderPiece);
    const matched = matches?.[index] ? ' matched' : '';
    if (piece.T.tag || level.mundo === 'base') {
      // Nothing but the piece's own content goes inside: `:first-child` and friends must see the real children.
      return createElement(
        piece.T.tag ?? 'div',
        {
          ...piece.attrs,
          key: index,
          className: `${elementClasses(piece)}${matched}`,
          'data-id': piece.id || undefined,
          'data-marca': piece.marca || undefined,
          // A board link is there to be selected, not followed.
          ...(piece.T.tag === 'a' ? { onClick: (event: MouseEvent) => event.preventDefault() } : {}),
        },
        piece.cont ? null : <Icon piece={piece} />,
        piece.txt || null,
        ...nested,
      );
    }
    if (piece.T.cartel) {
      return (
        <div key={index} className={`pieza cartel${piece.k ? ` ${piece.k}` : ''}${matched}`} data-id={piece.id || undefined}>
          <span className="txt">{piece.txt}</span>
          {piece.e ? <span className="et">{piece.e}</span> : null}
        </div>
      );
    }
    const icon = piece.T.i || piece.T.o;
    return (
      <div key={index} className={`${classes(piece)}${matched}`} data-id={piece.id || undefined}>
        {icon === 'casa' ? <i className="humo" aria-hidden="true" /> : null}
        {icon === 'faro' ? <i className="haz" aria-hidden="true" /> : null}
        <Icon piece={piece} />
        {piece.e ? <span className="et">{piece.e}</span> : null}
        {nested}
      </div>
    );
  };
  return <>{roots.map(renderPiece)}</>;
}

/** The board's markup as a student would read it in the page source. */
export function boardMarkup(level: Level): string {
  const children: number[][] = level.p.map(() => []);
  const roots: number[] = [];
  level.p.forEach((piece, index) => {
    if (piece.padre >= 0) children[piece.padre]?.push(index);
    else roots.push(index);
  });
  const lines: string[] = ['<div class="tablero">'];
  const write = (index: number, depth: number) => {
    const piece = level.p[index];
    if (!piece) return;
    const tag = piece.T.tag ?? 'div';
    const names = [piece.T.tag ? '' : piece.t, piece.k].filter(Boolean).join(' ');
    const extra = Object.entries(piece.attrs ?? {}).map(([name, value]) => (value ? ` ${name}="${value}"` : ` ${name}`)).join('');
    const open = `<${tag}${names ? ` class="${names}"` : ''}${piece.id ? ` id="${piece.id}"` : ''}${extra}>`;
    const pad = '  '.repeat(depth);
    const inside = children[index] ?? [];
    const text = piece.txt.length > 30 ? `${piece.txt.slice(0, 28)}…` : piece.txt;
    if (!inside.length) { lines.push(`${pad}${open}${text}</${tag}>`); return; }
    lines.push(`${pad}${open}${text}`);
    inside.forEach((child) => write(child, depth + 1));
    lines.push(`${pad}</${tag}>`);
  };
  roots.forEach((index) => write(index, 1));
  lines.push('</div>');
  return lines.join('\n');
}
