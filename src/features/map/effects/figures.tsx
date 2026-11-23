/**
 * Small figures that move over the map: flags, flocks, and the griffin and dragon in flight. Each
 * part is a still canvas; the motion (a flapping wing, waving cloth) is CSS on the part's class.
 */
import { type CSSProperties, useEffect, useRef } from 'react';
import {
  type Box,
  circleMark,
  ellipseMark,
  type Ink,
  ink,
  type Mark,
  paintMarkCanvas,
  pathMark,
  rectMark,
} from './marks';
import { pathBounds } from './pathBounds';

/** Room left round a shape's outline when measuring a figure. */
const SHAPE_MARGIN = 2;
/** A flyer's drawing units per `cqi` of the chart. */
const FLYER_UNITS_PER_CQI = 16;

function MarkCanvas({
  frame,
  marks,
  className,
  style,
}: {
  readonly frame: Box;
  readonly marks: readonly Mark[];
  readonly className?: string;
  readonly style?: CSSProperties;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const paint = () => paintMarkCanvas(canvas, frame, marks);
    paint();
    const observer = new ResizeObserver(paint);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [frame, marks]);
  // Figures sit in the effects layer, which is hidden from assistive technology as a whole.
  return <canvas ref={canvasRef} className={className} style={style} />;
}

/** Places a part inside the whole figure, in percentages. */
function placeIn(part: Box, whole: Box): CSSProperties {
  return {
    left: `${((part.x - whole.x) / whole.width) * 100}%`,
    top: `${((part.y - whole.y) / whole.height) * 100}%`,
    width: `${(part.width / whole.width) * 100}%`,
    height: `${(part.height / whole.height) * 100}%`,
  };
}

function markBox(mark: Mark): Box {
  switch (mark.shape) {
    case 'path':
      return pathBounds(mark.path, mark.ink.width);
    case 'circle':
      return {
        x: mark.centerX - mark.radius - SHAPE_MARGIN,
        y: mark.centerY - mark.radius - SHAPE_MARGIN,
        width: mark.radius * 2 + SHAPE_MARGIN * 2,
        height: mark.radius * 2 + SHAPE_MARGIN * 2,
      };
    case 'ellipse':
      return {
        x: mark.centerX - mark.radiusX - SHAPE_MARGIN,
        y: mark.centerY - mark.radiusY - SHAPE_MARGIN,
        width: mark.radiusX * 2 + SHAPE_MARGIN * 2,
        height: mark.radiusY * 2 + SHAPE_MARGIN * 2,
      };
    case 'rect':
      return {
        x: mark.box.x - SHAPE_MARGIN,
        y: mark.box.y - SHAPE_MARGIN,
        width: mark.box.width + SHAPE_MARGIN * 2,
        height: mark.box.height + SHAPE_MARGIN * 2,
      };
  }
}

/** A square frame round the anchor that holds the body and the wing, so the flyer turns about it. */
function centredFrame(anchorX: number, anchorY: number, body: readonly Mark[], wing: string): Box {
  const boxes = [pathBounds(wing, SHAPE_MARGIN), ...body.map(markBox)];
  const minX = Math.min(...boxes.map((box) => box.x));
  const minY = Math.min(...boxes.map((box) => box.y));
  const maxX = Math.max(...boxes.map((box) => box.x + box.width));
  const maxY = Math.max(...boxes.map((box) => box.y + box.height));
  const half =
    Math.max(anchorX - minX, maxX - anchorX, anchorY - minY, maxY - anchorY) + SHAPE_MARGIN;
  return { x: anchorX - half, y: anchorY - half, width: half * 2, height: half * 2 };
}

const OUTLINE = '#211912';

const GRIFFIN_WING = 'M23 19C18 13 14 4 15 -4Q19 -2 23 3L21 -6Q27 -2 30 6L30 0Q34 5 36 12Z';
const GRIFFIN_BODY: readonly Mark[] = [
  pathMark('M11 23c-5-1-8 2-8 5', ink(null, '#c8883a', 2.2, 'round')),
  ellipseMark(24, 24, 13, 7, ink('#e0a85a', OUTLINE, 1.8)),
  circleMark(38, 18, 6, ink('#faf6ec', OUTLINE, 1.6)),
  pathMark('M43 17l6 2-6 2z', ink('#f0b030', OUTLINE, 1, 'butt', 'round')),
  circleMark(39.5, 16.5, 1.2, ink(OUTLINE, null, 1)),
  pathMark('M18 30l-1 6M30 30l1 6', ink(null, OUTLINE, 1.2)),
  circleMark(24, 34, 3.2, ink('#f6c8a0', OUTLINE, 1)),
  rectMark({ x: 15, y: 35.5, width: 18, height: 8 }, 2, ink('#a8703a', OUTLINE, 1.6)),
];
const GRIFFIN_WING_MARKS: readonly Mark[] = [
  pathMark(GRIFFIN_WING, ink('#f3e1b9', '#473832', 1.6, 'butt', 'round')),
  pathMark('M23 18Q21 14 20 8L25 13 26 8 30 12 32 9 35 12Z', ink('#bd9569', null, 0)),
];

const DRAGON_WING = 'M34 20Q31 5 42 -3L56 0Q50 3 52 9Q46 7 46 14Q40 11 34 20Z';
const DRAGON_BODY: readonly Mark[] = [
  pathMark('M56 26c6 2 9 7 5 12', ink(null, '#2f7a52', 4, 'round')),
  ellipseMark(38, 25, 20, 8, ink('#4aa070', OUTLINE, 2)),
  pathMark('M21 23c-6-3-11-1-13 3 3 3 9 4 13 1z', ink('#4aa070', OUTLINE, 1.8, 'butt', 'round')),
  pathMark('M15 20l-3-6 6 4', ink('#e8d870', OUTLINE, 1, 'butt', 'round')),
  circleMark(13, 24, 1.3, ink(OUTLINE, null, 1)),
  pathMark('M30 31v5M45 31v5', ink(null, OUTLINE, 2.2, 'round')),
  pathMark('M37 19h7v5h-7z', ink('#3a6ad8', OUTLINE, 1)),
  circleMark(40.5, 16, 3, ink('#f6c8a0', OUTLINE, 1)),
];
const DRAGON_WING_MARKS: readonly Mark[] = [
  pathMark(DRAGON_WING, ink('#92b899', '#39463e', 1.6, 'butt', 'round')),
  pathMark('M34 19Q37 6 42 -2L51 8Q44 4 42 1L46 13 41 5Z', ink('#598676', null, 0)),
];

export type FlyerKind = 'griffin' | 'dragon';

interface FlyerDrawing {
  readonly frame: Box;
  readonly body: readonly Mark[];
  readonly wingFrame: Box;
  readonly wing: readonly Mark[];
}

const FLYERS: Readonly<Record<FlyerKind, FlyerDrawing>> = {
  griffin: {
    frame: centredFrame(26, 24, GRIFFIN_BODY, GRIFFIN_WING),
    body: GRIFFIN_BODY,
    wingFrame: pathBounds(GRIFFIN_WING, SHAPE_MARGIN),
    wing: GRIFFIN_WING_MARKS,
  },
  dragon: {
    frame: centredFrame(34, 24, DRAGON_BODY, DRAGON_WING),
    body: DRAGON_BODY,
    wingFrame: pathBounds(DRAGON_WING, SHAPE_MARGIN),
    wing: DRAGON_WING_MARKS,
  },
};

/** Three birds, or three bats, each a wing beat of its own. */
const FLOCK_FRAME: Box = { x: 0, y: 0, width: 60, height: 30 };
const BIRD_INK = ink(null, '#2e2620', 1.8, 'round', 'round');
const BAT_INK = ink('#1e1626', '#0a0610', 0.8, 'round', 'round');

interface FlockMember {
  readonly path: string;
  readonly frame: Box;
  readonly marks: readonly Mark[];
}

const flockOf = (paths: readonly string[], memberInk: Ink): readonly FlockMember[] =>
  paths.map((path) => ({
    path,
    frame: pathBounds(path, memberInk.width),
    marks: [pathMark(path, memberInk)],
  }));

const BIRDS = flockOf(
  ['M2 12q4-5 8 0q4-5 8 0', 'M22 4q3-4 6 0q3-4 6 0', 'M30 20q3-4 6 0q3-4 6 0'],
  BIRD_INK,
);
const BATS = flockOf(
  [
    'M2 12q3-6 7-2 2-3 4 0 4-4 7 2-4-1-5 2-2-2-4 0-2-2-4 0-1-3-5-2z',
    'M24 6q3-6 7-2 2-3 4 0 4-4 7 2-4-1-5 2-2-2-4 0-2-2-4 0-1-3-5-2z',
    'M32 20q3-6 7-2 2-3 4 0 4-4 7 2-4-1-5 2-2-2-4 0-2-2-4 0-1-3-5-2z',
  ],
  BAT_INK,
);

const FLAG_FRAME: Box = { x: 0, y: 0, width: 20, height: 16 };
const CLOTH_PATH = 'M1 2Q5 0 9 2Q13 4 18 2L14 6 17 10Q13 12 9 10Q5 8 1 10Z';
const CLOTH_FRAME = pathBounds(CLOTH_PATH, 1.2);
const POLE_MARKS: readonly Mark[] = [pathMark('M1 15V1', ink(null, '#3a2a20', 1.6))];
const CLOTH_MARKS: readonly Mark[] = [
  pathMark(CLOTH_PATH, ink('#af5045', '#463432', 1)),
  pathMark('M2 3Q6 1 10 3L9 8Q6 6 2 8Z', ink('#dc8566', null, 0)),
  pathMark('M6 3L8 5 6 7 4 5Z', ink('#ffe4a1', null, 0)),
];

export function Flag({ style }: { readonly style: CSSProperties }) {
  return (
    <span className="fx-bandera" style={style}>
      <MarkCanvas frame={FLAG_FRAME} marks={POLE_MARKS} />
      <MarkCanvas
        className="tela"
        frame={CLOTH_FRAME}
        marks={CLOTH_MARKS}
        style={placeIn(CLOTH_FRAME, FLAG_FRAME)}
      />
    </span>
  );
}

export function Flock({ style, bats }: { readonly style: CSSProperties; readonly bats?: boolean }) {
  return (
    <span className={bats ? 'fx-aves murcis' : 'fx-aves'} style={style}>
      <span className="flock">
        {(bats ? BATS : BIRDS).map((member) => (
          <MarkCanvas
            key={member.path}
            className="wing"
            frame={member.frame}
            marks={member.marks}
            style={placeIn(member.frame, FLOCK_FRAME)}
          />
        ))}
      </span>
    </span>
  );
}

/** How wide a flyer is drawn, so its route can be sized before it paints. */
export function flyerWidth(kind: FlyerKind): string {
  return `${FLYERS[kind].frame.width / FLYER_UNITS_PER_CQI}cqi`;
}

export function Flyer({ kind }: { readonly kind: FlyerKind }) {
  const { frame, body, wingFrame, wing } = FLYERS[kind];
  return (
    <span className="volador" style={{ aspectRatio: `${frame.width} / ${frame.height}` }}>
      <MarkCanvas
        className="ala"
        frame={wingFrame}
        marks={wing}
        style={placeIn(wingFrame, frame)}
      />
      <MarkCanvas
        frame={frame}
        marks={body}
        style={{ left: 0, top: 0, width: '100%', height: '100%' }}
      />
    </span>
  );
}
