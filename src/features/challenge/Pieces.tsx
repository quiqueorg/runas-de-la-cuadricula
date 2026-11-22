/** The board's pieces. Icons are canvases; the boxes stay real elements so student CSS can measure them. */
import type { ReactNode } from 'react';
import type { Level, RuntimePiece } from '../../core/models';
import { Rune } from '../../shared/icons/Rune';

function classes(piece: RuntimePiece): string {
  return ['pieza', piece.t, piece.k, piece.T.a ? `area m-${piece.T.a}` : 'objeto', piece.fija ? 'fija' : '', piece.e ? 'with-label' : '', piece.cont ? 'contenedor' : ''].filter(Boolean).join(' ');
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
    if (piece.T.cartel) {
      return (
        <div key={index} className={`pieza cartel${piece.k ? ` ${piece.k}` : ''}${matches?.[index] ? ' matched' : ''}`}>
          <span className="txt">{piece.txt}</span>
          {piece.e ? <span className="et">{piece.e}</span> : null}
        </div>
      );
    }
    const icon = piece.T.i || piece.T.o;
    return (
      <div key={index} className={`${classes(piece)}${matches?.[index] ? ' matched' : ''}`}>
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
