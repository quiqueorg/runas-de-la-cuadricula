import { type RefObject, useEffect, useRef } from 'react';
import { trackMotion } from '../../../shared/canvas/motion';
import { observeRenderVisibility } from '../../../shared/canvas/visibility';

const MS_PER_SECOND = 1000;

/** Runs `draw` on every frame while the element is rendered (and motion is allowed). */
export function animateWhileRendered(
  element: HTMLElement,
  draw: (now: number) => void,
): () => void {
  let stopMotion: (() => void) | null = trackMotion(draw);
  const stopVisibility = observeRenderVisibility(element, (visible) => {
    if (visible && !stopMotion) {
      stopMotion = trackMotion(draw);
    } else if (!visible && stopMotion) {
      stopMotion();
      stopMotion = null;
    }
  });
  return () => {
    stopMotion?.();
    stopVisibility();
  };
}

/**
 * A canvas painted by `paint`, given the seconds since it mounted. A moving canvas repaints every
 * frame while it is on screen; a still one paints with 0 seconds, and again when its size changes.
 */
export function useAnimatedCanvas(
  paint: (canvas: HTMLCanvasElement, seconds: number) => void,
  moving: boolean,
): RefObject<HTMLCanvasElement | null> {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paintRef = useRef(paint);
  paintRef.current = paint;
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const started = performance.now();
    const draw = (now: number) =>
      paintRef.current(canvas, moving ? (now - started) / MS_PER_SECOND : 0);
    draw(started);
    if (moving) return animateWhileRendered(canvas, draw);
    const observer = new ResizeObserver(() => draw(performance.now()));
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [moving]);
  return canvasRef;
}
