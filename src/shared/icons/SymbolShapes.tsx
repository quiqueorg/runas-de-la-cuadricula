/**
 * A symbol's draw ops as SVG elements, painted as the canvas painter they replace did. Paint
 * inherits through groups like SVG, except opacity: an op's own `opacity` fades its fill and its
 * stroke separately and is not passed on, so a group's opacity changes nothing.
 */
import type { CSSProperties, ReactNode, SVGAttributes } from 'react';
import { symbolOf } from './registry';
import type { DrawOp, Paint, SymbolArt } from './symbols';

/** What the ops start from, set on the symbol's own group so page CSS on the `<svg>` cannot leak in. */
const ROOT_PAINT = {
  fill: '#000',
  stroke: 'none',
  strokeWidth: 1,
  strokeLinecap: 'butt',
  strokeLinejoin: 'miter',
  strokeMiterlimit: 10,
  strokeDasharray: 'none',
  fillOpacity: 1,
  strokeOpacity: 1,
  fillRule: 'nonzero',
} as const satisfies SVGAttributes<SVGGElement>;

/** Symbol text is set in its own font, not in whatever the surrounding text uses. */
const TEXT_STYLE: CSSProperties = {
  fontWeight: 400,
  fontStyle: 'normal',
  letterSpacing: 0,
  wordSpacing: 0,
  textTransform: 'none',
};

type Anchor = 'start' | 'middle' | 'end';
const ANCHORS: ReadonlySet<string> = new Set<Anchor>(['start', 'middle', 'end']);
const anchorOf = (value: string): Anchor => (ANCHORS.has(value) ? (value as Anchor) : 'start');

const unlessOne = (value: number): number | undefined => (value === 1 ? undefined : value);

/** The canvas painter drew black for a colour it could not read; an unset property still does. */
const withFallback = (colour: string | undefined): string | undefined =>
  colour?.startsWith('var(') && !colour.includes(',') ? `${colour.slice(0, -1)}, #000)` : colour;

function paintAttributes(paint: Paint, transform: string | undefined): SVGAttributes<SVGElement> {
  return {
    fill: withFallback(paint.fill),
    stroke: withFallback(paint.stroke),
    strokeWidth: paint.strokeWidth,
    strokeLinecap: paint.lineCap,
    strokeLinejoin: paint.lineJoin,
    strokeDasharray: paint.dash && (paint.dash.length ? paint.dash.join(' ') : 'none'),
    transform,
  };
}

/** `fillOpacity` is the inherited one, `opacity` the op's own. */
function leafAlpha(fillOpacity: number, opacity: number): SVGAttributes<SVGElement> {
  return { fillOpacity: unlessOne(fillOpacity * opacity), strokeOpacity: unlessOne(opacity) };
}

function renderUse(
  op: Extract<DrawOp, { t: 'use' }>,
  fillOpacity: number,
  trail: ReadonlySet<string>,
  key: number,
): ReactNode {
  const art = symbolOf(op.id);
  if (!art || trail.has(op.id)) return null;
  const transform = [op.transform, `translate(${-art.x} ${-art.y})`].filter(Boolean).join(' ');
  return (
    <g key={key} {...paintAttributes(op.paint, transform)}>
      {renderOps(art.ops, fillOpacity, new Set([...trail, op.id]))}
    </g>
  );
}

function renderOp(
  op: DrawOp,
  inheritedFillOpacity: number,
  trail: ReadonlySet<string>,
  key: number,
): ReactNode {
  const fillOpacity = op.paint.fillOpacity ?? inheritedFillOpacity;
  const alpha = leafAlpha(fillOpacity, op.paint.opacity ?? 1);
  const paint = paintAttributes(op.paint, op.transform);
  switch (op.t) {
    case 'g':
      return (
        <g key={key} {...paint}>
          {renderOps(op.ops, fillOpacity, trail)}
        </g>
      );
    case 'use':
      return renderUse(op, fillOpacity, trail, key);
    case 'text':
      return (
        <text
          key={key}
          x={op.x}
          y={op.y + op.dy}
          fontSize={op.size}
          fontFamily={op.family}
          textAnchor={anchorOf(op.anchor)}
          {...paint}
          stroke="none"
          fillOpacity={unlessOne(op.paint.opacity ?? 1)}
          style={TEXT_STYLE}
        >
          {op.text}
        </text>
      );
    case 'path':
      return <path key={key} d={op.d} {...paint} {...alpha} />;
    case 'circle':
      return <circle key={key} cx={op.cx} cy={op.cy} r={op.r} {...paint} {...alpha} />;
    case 'ellipse':
      return (
        <ellipse key={key} cx={op.cx} cy={op.cy} rx={op.rx} ry={op.ry} {...paint} {...alpha} />
      );
    case 'rect':
      return (
        <rect
          key={key}
          x={op.x}
          y={op.y}
          width={op.w}
          height={op.h}
          rx={op.rx}
          {...paint}
          {...alpha}
        />
      );
  }
}

function renderOps(
  ops: readonly DrawOp[],
  fillOpacity: number,
  trail: ReadonlySet<string>,
): ReactNode[] {
  return ops.map((op, index) => renderOp(op, fillOpacity, trail, index));
}

/** The symbol's shapes, in its own viewBox coordinates. */
export function SymbolShapes({ art }: { readonly art: SymbolArt }) {
  return <g {...ROOT_PAINT}>{renderOps(art.ops, 1, new Set([art.id]))}</g>;
}

export const viewBoxOf = (art: SymbolArt): string => `${art.x} ${art.y} ${art.w} ${art.h}`;

export interface GlyphProps {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly size: number;
}

/** A registered symbol fitted, centred, into a square of another drawing. Decorative: name the drawing. */
export function Glyph({ id, x, y, size }: GlyphProps) {
  const art = symbolOf(id);
  if (!art) return null;
  return (
    <svg
      x={x}
      y={y}
      width={size}
      height={size}
      viewBox={viewBoxOf(art)}
      overflow="visible"
      aria-hidden="true"
    >
      <SymbolShapes art={art} />
    </svg>
  );
}
