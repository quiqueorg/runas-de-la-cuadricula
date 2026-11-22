/** Blueprint canvases. Drawing is in the painter. */
import { useLayoutEffect, useRef } from 'react';
import type { BlueprintView } from './engine';
import { paintPlan } from './paint';

export function Blueprint({ views }: { readonly views: readonly BlueprintView[] }) {
  return (
    <div id="blueprint-svg">
      {views.map((view, index) => <Plan key={index} view={view} />)}
    </div>
  );
}

function Plan({ view }: { readonly view: BlueprintView }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const painted = useRef('');
  const boxW = view.boardW + 12;
  const boxH = view.boardH + 12;
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const token = `${Math.round(rect.width * dpr)}x${Math.round(rect.height * dpr)}:${JSON.stringify(view)}`;
      if (token === painted.current) return;
      painted.current = token;
      paintPlan(canvas, view);
    };
    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [view]);
  return (
    <figure>
      <canvas ref={canvasRef} className="rune" style={{ width: '100%', aspectRatio: `${boxW} / ${boxH}` }} role="img" aria-label={`Plano del resultado esperado${view.caption ? `, ${view.caption}` : ''}`} />
      {view.caption ? <figcaption>{view.caption}</figcaption> : null}
    </figure>
  );
}
