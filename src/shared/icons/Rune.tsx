/** A sprite symbol painted on a canvas, sized by the same CSS that used to size the SVG. */
import { useLayoutEffect, useRef } from 'react';
import { frameOf } from '../canvas/surface';
import { drawSymbol } from './paint';
import { symbolOf } from './registry';

export interface RuneProps {
  readonly id: string;
  readonly className?: string;
  readonly title?: string;
}

export function Rune({ id, className, title }: RuneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const art = symbolOf(id);
  const aspect = art ? `${art.w} / ${art.h}` : '1 / 1';

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const paint = () => {
      const frame = frameOf(canvas);
      if (!frame) return;
      const color = getComputedStyle(canvas).color;
      drawSymbol(frame.ctx, id, frame.width, frame.height, color);
    };
    paint();
    const observer = new ResizeObserver(paint);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [id, className]);

  return (
    <canvas
      ref={canvasRef}
      className={className ? `rune ${className}` : 'rune'}
      style={{ aspectRatio: aspect }}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    />
  );
}
