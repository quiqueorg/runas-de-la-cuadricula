/**
 * The architect's plans as SVG, one per view, each downloadable as a PNG. The board and its pieces
 * are placed in percentages of the plan but keep their borders and labels at a fixed size, so a
 * small plan stays legible; only the icons scale with it.
 */
import { type CSSProperties, useId, useRef } from 'react';
import { downloadSvgAsPng } from '../../shared/canvas/svgToPng';
import { Glyph } from '../../shared/icons/SymbolShapes';
import type { BlueprintPiece, BlueprintView } from './board/blueprint';

/** Margin around the board, in board pixels. */
const PAD = 6;
/** Border widths in screen pixels; colours and dashes are in challenge.css (`.bp-*`). */
const BOARD_BORDER = 2;
const PIECE_BORDER = 2;
const PINNED_BORDER = 1.5;
const RADIUS = 6;
/** From the bottom of a piece up to its label's baseline: border, padding and half a line. */
const LABEL_BASELINE = 8;
const COLORED_OPACITY = 0.75;
const ICON_MAX = 30;
/** How far the icon rises, in board pixels, to make room for a label under it. */
const ICON_LIFT = 7;

interface Box {
  readonly width: number;
  readonly height: number;
}

/** A length of `percent`% of the plan plus `px` screen pixels. */
interface Length {
  readonly percent: number;
  readonly px: number;
}

/** Where something starts and how long it is, along one axis of the plan. */
interface Span {
  readonly start: Length;
  readonly length: Length;
}

const css = ({ percent, px }: Length): string => `calc(${percent}% + ${px}px)`;
const add = (a: Length, b: Length, times = 1): Length => ({
  percent: a.percent + b.percent * times,
  px: a.px + b.px * times,
});

const boardSpan = (boardSize: number, planSize: number): Span => ({
  start: { percent: (PAD / planSize) * 100, px: 0 },
  length: { percent: (boardSize / planSize) * 100, px: 0 },
});

/** Pieces were measured from the board's inner edge, inside its border. */
function pieceSpan(offset: number, size: number, boardSize: number, planSize: number): Span {
  const board = boardSpan(boardSize, planSize);
  const inside: Span = {
    start: add(board.start, { percent: 0, px: BOARD_BORDER }),
    length: add(board.length, { percent: 0, px: -2 * BOARD_BORDER }),
  };
  return {
    start: add(inside.start, inside.length, offset / boardSize),
    length: add({ percent: 0, px: 0 }, inside.length, size / boardSize),
  };
}

/** A span shrunk by `inset` pixels at both ends. */
const shrink = (span: Span, inset: number): Span => ({
  start: add(span.start, { percent: 0, px: inset }),
  length: add(span.length, { percent: 0, px: -2 * inset }),
});

function rectStyle(across: Span, down: Span): CSSProperties {
  return {
    x: css(across.start),
    y: css(down.start),
    width: `max(0px, ${css(across.length)})`,
    height: `max(0px, ${css(down.length)})`,
  };
}

export function Blueprint({ views }: { readonly views: readonly BlueprintView[] }) {
  return (
    <div id="blueprint-svg">
      {views.map((view, index) => (
        // The views come in the level's order and are measured again together.
        // biome-ignore lint/suspicious/noArrayIndexKey: see above.
        <Plan key={index} view={view} />
      ))}
    </div>
  );
}

const fileNameOf = (caption: string): string =>
  `plano${caption ? `-${caption.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : ''}.png`;

const visible = (piece: BlueprintPiece): boolean => Boolean(piece.width || piece.height);

function Plan({ view }: { readonly view: BlueprintView }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const board: Box = { width: view.boardWidth, height: view.boardHeight };
  const plan: Box = { width: board.width + PAD * 2, height: board.height + PAD * 2 };
  const ariaLabel = `Plano del resultado esperado${view.caption ? `, ${view.caption}` : ''}`;

  const exportPlan = () => {
    if (svgRef.current) void downloadSvgAsPng(svgRef.current, fileNameOf(view.caption));
  };

  return (
    <figure>
      {/* The plan lists its pieces, and an <svg> cannot be a <ul>.
          biome-ignore lint/a11y/useSemanticElements: see above. */}
      <svg
        ref={svgRef}
        className="rune bp-plan"
        style={{ aspectRatio: `${plan.width} / ${plan.height}` }}
        role="list"
        aria-label={ariaLabel}
      >
        <Frame
          className="bp-board"
          across={boardSpan(board.width, plan.width)}
          down={boardSpan(board.height, plan.height)}
          border={BOARD_BORDER}
        />
        {view.pieces.map((piece, index) =>
          visible(piece) ? (
            // A piece's index is its identity: it is the level's piece at that position.
            // biome-ignore lint/suspicious/noArrayIndexKey: see above.
            <PlanPiece key={index} piece={piece} index={index} board={board} plan={plan} />
          ) : null,
        )}
        <svg viewBox={`0 0 ${plan.width} ${plan.height}`} aria-hidden="true">
          <g transform={`translate(${PAD} ${PAD})`}>
            {view.pieces.map((piece, index) =>
              visible(piece) ? (
                // biome-ignore lint/suspicious/noArrayIndexKey: see above.
                <PieceIcon key={index} piece={piece} />
              ) : null,
            )}
          </g>
        </svg>
      </svg>
      <figcaption className="bp-caption">
        {view.caption ? <span>{view.caption}</span> : null}
        <button
          type="button"
          className="bp-export"
          onClick={exportPlan}
          aria-label={`Descargar ${ariaLabel} como PNG`}
        >
          PNG
        </button>
      </figcaption>
    </figure>
  );
}

interface FrameProps {
  readonly className: string;
  readonly across: Span;
  readonly down: Span;
  readonly border: number;
  readonly fill?: string;
}

/** A rounded rectangle with its border inside the span, like a CSS border-box. */
function Frame({ className, across, down, border, fill }: FrameProps) {
  return (
    <rect
      className={className}
      rx={RADIUS - border / 2}
      strokeWidth={border}
      style={{ ...rectStyle(shrink(across, border / 2), shrink(down, border / 2)), fill }}
    />
  );
}

interface PlanPieceProps {
  readonly piece: BlueprintPiece;
  readonly index: number;
  readonly board: Box;
  readonly plan: Box;
}

function PlanPiece({ piece, index, board, plan }: PlanPieceProps) {
  const clipId = useId();
  const name = piece.label || piece.icon || `Pieza ${index + 1}`;
  const border = piece.pinned ? PINNED_BORDER : PIECE_BORDER;
  const across = pieceSpan(piece.x, piece.width, board.width, plan.width);
  const down = pieceSpan(piece.y, piece.height, board.height, plan.height);
  const centre = add(across.start, across.length, 0.5);
  const bottom = add(down.start, down.length);
  return (
    // SVG has no <li>, and Biome takes <g> for an interactive element.
    // biome-ignore lint/a11y/useSemanticElements lint/a11y/noInteractiveElementToNoninteractiveRole: see above.
    <g
      role="listitem"
      aria-label={`${name}, ${piece.pinned ? 'fija' : 'móvil'}`}
      opacity={piece.color ? COLORED_OPACITY : undefined}
    >
      <Frame
        className={piece.pinned ? 'bp-piece is-fixed' : 'bp-piece'}
        across={across}
        down={down}
        border={border}
        fill={piece.color || undefined}
      />
      {piece.label ? (
        <>
          <clipPath id={clipId}>
            <rect style={rectStyle(shrink(across, border), shrink(down, border))} />
          </clipPath>
          <text
            className="bp-label"
            x={`${centre.percent}%`}
            dx={centre.px}
            y={`${bottom.percent}%`}
            dy={bottom.px - LABEL_BASELINE}
            clipPath={`url(#${clipId})`}
          >
            {piece.label}
          </text>
        </>
      ) : null}
    </g>
  );
}

function PieceIcon({ piece }: { readonly piece: BlueprintPiece }) {
  const size = Math.min(ICON_MAX, piece.width * 0.6, piece.height * 0.5);
  if (!piece.icon || size <= 1) return null;
  return (
    <Glyph
      id={`i-${piece.icon}`}
      x={piece.x + piece.width / 2 - size / 2}
      y={piece.y + piece.height / 2 - size / 2 - (piece.label ? ICON_LIFT : 0)}
      size={size}
    />
  );
}
