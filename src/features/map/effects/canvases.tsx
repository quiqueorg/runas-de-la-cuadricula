/**
 * The effects' canvases. They sit in the effects layer, which is hidden from assistive technology as
 * a whole, so they carry no ARIA of their own.
 */
import type { CSSProperties } from 'react';
import { useAnimatedCanvas } from '../hooks/useAnimatedCanvas';
import { type Flow, paintFlows } from './flows';
import { paintSketch, type SketchBox, type SketchPainter } from './miniatures';

/** River dashes: short dots with long gaps. */
const RIVER_DASH = [2, 16] as const;
const RIVER_WIDTH = 1.3;
export const RIVER_INK = 'rgba(236,255,252,.9)';

/** A river at the map's usual dash and width. */
export function river(
  course: Flow['course'],
  speed: number,
  color: string = RIVER_INK,
  dash: readonly number[] = RIVER_DASH,
): Flow {
  return { course, dash, color, width: RIVER_WIDTH, speed };
}

/** Every flow of a world on one chart-sized canvas. */
export function FlowCanvas({ flows }: { readonly flows: readonly Flow[] }) {
  const canvasRef = useAnimatedCanvas(
    (canvas, seconds) => paintFlows(canvas, flows, seconds),
    true,
  );
  return <canvas ref={canvasRef} className="fx-rios rune" />;
}

/** A small drawing that fills its canvas; `moving` ones repaint every frame. */
export function Sketch({
  className = '',
  style,
  box,
  paint,
  moving = false,
}: {
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly box: SketchBox;
  readonly paint: SketchPainter;
  readonly moving?: boolean;
}) {
  const canvasRef = useAnimatedCanvas(
    (canvas, seconds) => paintSketch(canvas, box, paint, seconds),
    moving,
  );
  return <canvas ref={canvasRef} className={`${className} rune`} style={style} />;
}
