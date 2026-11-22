/** The walked path. Finished spans stay put; dashed spans march until they are done. */
import { useEffect, useLayoutEffect, useRef } from 'react';
import type { WorldId } from '../../core/models';
import { trackMotion } from '../../shared/canvas/motion';
import { observeRenderVisibility } from '../../shared/canvas/visibility';
import type { TrailSpan } from './geometry';
import { paintTrailCanvas } from './paint';

export function Trail({ world, spans }: { readonly world: WorldId; readonly spans: readonly TrailSpan[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spansRef = useRef(spans);
  spansRef.current = spans;
  const worldRef = useRef(world);
  worldRef.current = world;
  const syncRef = useRef<(now: number) => void>(() => {});
  const sceneKey = `${world}:${JSON.stringify(spans)}`;
  const seen = useRef('');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const started = performance.now();
    let moving = false;
    let visible = true;
    let stop = () => {};
    const paint = (now: number) => paintTrailCanvas(canvas, worldRef.current, spansRef.current, (now - started) / 1000);
    syncRef.current = (now: number) => {
      paint(now);
      const next = visible && spansRef.current.some((span) => span.kind !== 'done');
      if (next && !moving) {
        moving = true;
        stop = trackMotion((frame) => syncRef.current(frame));
      } else if (!next && moving) {
        moving = false;
        stop();
        stop = () => {};
      }
    };
    syncRef.current(performance.now());
    const stopVisibility = observeRenderVisibility(canvas, (isVisible) => {
      visible = isVisible;
      syncRef.current(performance.now());
    });
    const observer = new ResizeObserver(() => syncRef.current(performance.now()));
    observer.observe(canvas);
    return () => {
      stop();
      stopVisibility();
      observer.disconnect();
    };
  }, []);

  useLayoutEffect(() => {
    if (seen.current === sceneKey) return;
    seen.current = sceneKey;
    syncRef.current(performance.now());
  }, [sceneKey]);

  return <canvas ref={canvasRef} className="trail rune" aria-hidden="true" />;
}
