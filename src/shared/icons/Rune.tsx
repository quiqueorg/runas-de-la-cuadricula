/** A registered symbol as inline SVG, sized by CSS; `currentColor` is the element's CSS `color`. */
import { useId } from 'react';
import { symbolOf } from './registry';
import { SymbolShapes, viewBoxOf } from './SymbolShapes';
import type { SymbolArt } from './symbols';

export interface RuneProps {
  readonly id: string;
  readonly className?: string;
  readonly title?: string;
  /** Glazes the ink with light from the top left, for figures standing on the painted chart. */
  readonly painted?: boolean;
}

export function Rune({ id, className, title, painted }: RuneProps) {
  const glazeId = useId();
  const art = symbolOf(id);
  return (
    <svg
      className={className ? `rune ${className}` : 'rune'}
      viewBox={art ? viewBoxOf(art) : undefined}
      style={{ aspectRatio: art ? `${art.w} / ${art.h}` : '1 / 1' }}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {art ? <SymbolShapes art={art} /> : null}
      {art && painted ? <Glaze art={art} id={glazeId} /> : null}
    </svg>
  );
}

/** A wash laid only over the inked silhouette: the symbol itself is its alpha mask. */
function Glaze({ art, id }: { readonly art: SymbolArt; readonly id: string }) {
  const box = { x: art.x, y: art.y, width: art.w, height: art.h };
  return (
    <>
      <defs>
        <linearGradient
          id={`${id}-wash`}
          gradientUnits="userSpaceOnUse"
          x1={art.x + art.w * 0.25}
          y1={art.y}
          x2={art.x + art.w * 0.7}
          y2={art.y + art.h}
        >
          <stop offset={0} stopColor="rgba(255,221,165,.42)" />
          <stop offset={0.46} stopColor="rgba(255,225,185,.05)" />
          <stop offset={1} stopColor="rgba(65,47,68,.38)" />
        </linearGradient>
        <mask id={`${id}-ink`} maskUnits="userSpaceOnUse" {...box} style={{ maskType: 'alpha' }}>
          <SymbolShapes art={art} />
        </mask>
      </defs>
      <rect {...box} fill={`url(#${id}-wash)`} mask={`url(#${id}-ink)`} />
    </>
  );
}
