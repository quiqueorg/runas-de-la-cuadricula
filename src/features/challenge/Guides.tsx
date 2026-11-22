/** Guide canvas. Drawing is in the painter, and an unchanged scene is left alone. */
import { useLayoutEffect, useRef } from 'react';
import type { GuideDrawing } from './engine';
import { paintGuides } from './paint';

export function Guides({ drawing }: { readonly drawing: GuideDrawing | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const painted = useRef('');
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const paint = () => {
      if (!drawing) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const token = `${Math.round(rect.width * dpr)}x${Math.round(rect.height * dpr)}:${JSON.stringify(drawing)}`;
      if (token === painted.current) return;
      painted.current = token;
      paintGuides(canvas, drawing);
    };
    paint();
    const observer = new ResizeObserver(paint);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [drawing]);
  return <canvas ref={canvasRef} className="guides rune" aria-hidden="true" />;
}
