/** The board's guides as SVG: hatched gaps, grid lines or flex axes, and their numbered labels. */
import { useId } from 'react';
import type { GuideDrawing, GuideGap, GuideKind, GuideLine } from './board/guides';

const ACCENT = 'var(--accent, #72f2e0)';
const CROSS = '#f0c45a';

const INK: Record<
  GuideKind,
  { readonly stroke: string; readonly width: number; readonly dash: string }
> = {
  shadow: { stroke: 'rgba(10,16,18,.38)', width: 3.4, dash: '6 4' },
  main: { stroke: 'rgba(250,244,228,.8)', width: 1.3, dash: '6 4' },
  'shadow-implicit': { stroke: 'rgba(10,16,18,.38)', width: 3.4, dash: '1.5 4.5' },
  implicit: { stroke: 'rgba(242,234,214,.42)', width: 1.3, dash: '1.5 4.5' },
  'axis-main': { stroke: ACCENT, width: 2.4, dash: 'none' },
  'axis-cross': { stroke: CROSS, width: 2, dash: '6 5' },
};

/** The hatch tile: a faint wash with one bright stripe. */
const HATCH_TILE = 6;
const HATCH_STRIPE = 2;
/** Arrowhead at the end of an axis, pointing along +x before it is turned. */
const ARROW = 'M0 0L-8 -3.5L-8 3.5Z';

export function Guides({ drawing }: { readonly drawing: GuideDrawing | null }) {
  if (!drawing || drawing.width < 1 || drawing.height < 1) return null;
  const { width, height } = drawing;
  const hasLabels = drawing.labels.length > 0;
  // Everything here is redrawn together from the board and never reordered: position is identity.
  return (
    <svg
      className="guides rune"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role={hasLabels ? 'list' : undefined}
      aria-label={hasLabels ? 'Guías del tablero' : undefined}
      aria-hidden={hasLabels ? undefined : true}
    >
      <Gaps gaps={drawing.gaps} />
      {drawing.lines.map((line, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: see above.
        <Line key={index} line={line} />
      ))}
      {drawing.labels.map((label, index) => (
        // SVG has no <li>, and Biome takes <text> for an interactive element.
        // biome-ignore lint/a11y/useSemanticElements lint/a11y/noInteractiveElementToNoninteractiveRole: see above.
        <text
          // biome-ignore lint/suspicious/noArrayIndexKey: see above.
          key={index}
          role="listitem"
          className={`guide-lbl is-${label.kind}`}
          transform={`translate(${label.x} ${label.y})${label.rotate ? ' rotate(-90)' : ''}`}
        >
          {label.text}
        </text>
      ))}
    </svg>
  );
}

/** Gaps between tracks, hatched with a stripe that runs diagonally. */
function Gaps({ gaps }: { readonly gaps: readonly GuideGap[] }) {
  const hatchId = useId();
  if (gaps.length === 0) return null;
  return (
    <>
      <defs>
        <pattern
          id={hatchId}
          patternUnits="userSpaceOnUse"
          width={HATCH_TILE}
          height={HATCH_TILE}
          patternTransform="rotate(45)"
        >
          <rect width={HATCH_TILE} height={HATCH_TILE} fill="rgba(114,242,224,.05)" />
          <rect width={HATCH_STRIPE} height={HATCH_TILE} fill="rgba(114,242,224,.3)" />
        </pattern>
      </defs>
      {gaps.map((gap, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: redrawn together, never reordered.
        <rect key={index} {...gap} fill={`url(#${hatchId})`} />
      ))}
    </>
  );
}

function Line({ line }: { readonly line: GuideLine }) {
  const ink = INK[line.kind];
  const axis = line.kind === 'axis-main' || line.kind === 'axis-cross';
  const degrees = (Math.atan2(line.y2 - line.y1, line.x2 - line.x1) * 180) / Math.PI;
  return (
    <>
      <line
        x1={line.x1}
        y1={line.y1}
        x2={line.x2}
        y2={line.y2}
        strokeWidth={ink.width}
        strokeDasharray={ink.dash}
        style={{ stroke: ink.stroke }}
      />
      {axis ? (
        <path
          d={ARROW}
          transform={`translate(${line.x2} ${line.y2}) rotate(${degrees})`}
          style={{ fill: ink.stroke }}
        />
      ) : null}
    </>
  );
}
