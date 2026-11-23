/** The walked trail. Finished spans stay put; dashed spans march until they are done. */
import { useEffect, useLayoutEffect, useRef } from 'react';
import type { WorldId } from '../../../core/models';
import { trackMotion } from '../../../shared/canvas/motion';
import { observeRenderVisibility } from '../../../shared/canvas/visibility';
import type { TrailSpan } from '../geometry';
import { paintTrail } from './paintTrail';

const MS_PER_SECOND = 1000;

export function Trail({
  world,
  spans,
}: {
  readonly world: WorldId;
  readonly spans: readonly TrailSpan[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const latest = useRef({ world, spans });
  latest.current = { world, spans };
  /** Repaints, and starts or stops the frame loop as the trail gains or loses moving spans. */
  const syncRef = useRef<(now: number) => void>(() => {});
  const sceneKey = `${world}:${JSON.stringify(spans)}`;
  const paintedKey = useRef('');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const started = performance.now();
    let animating = false;
    let onScreen = true;
    let stopMotion = () => {};
    syncRef.current = (now: number) => {
      paintTrail(
        canvas,
        latest.current.world,
        latest.current.spans,
        (now - started) / MS_PER_SECOND,
      );
      const marching = onScreen && latest.current.spans.some((span) => span.kind !== 'done');
      if (marching && !animating) {
        animating = true;
        stopMotion = trackMotion((frame) => syncRef.current(frame));
      } else if (!marching && animating) {
        animating = false;
        stopMotion();
        stopMotion = () => {};
      }
    };
    syncRef.current(performance.now());
    const stopVisibility = observeRenderVisibility(canvas, (visible) => {
      onScreen = visible;
      syncRef.current(performance.now());
    });
    const observer = new ResizeObserver(() => syncRef.current(performance.now()));
    observer.observe(canvas);
    return () => {
      stopMotion();
      stopVisibility();
      observer.disconnect();
    };
  }, []);

  useLayoutEffect(() => {
    if (paintedKey.current === sceneKey) return;
    paintedKey.current = sceneKey;
    syncRef.current(performance.now());
  }, [sceneKey]);

  return (
    // biome-ignore lint/a11y/noAriaHiddenOnFocusable: a canvas without tabindex takes no focus, and Chrome would announce this one; the stops on the trail are the buttons.
    <canvas ref={canvasRef} className="trail rune" aria-hidden="true" />
  );
}
