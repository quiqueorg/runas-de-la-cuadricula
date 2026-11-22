/** A sprite symbol painted on a canvas, sized by the same CSS that used to size the SVG. */
import { useLayoutEffect, useRef } from 'react';
import { observeDevicePixelSize } from '../canvas/htmlInCanvas';
import { frameOf } from '../canvas/surface';
import { drawSymbol } from './paint';
import { symbolOf } from './registry';

export interface RuneProps {
  readonly id: string;
  readonly className?: string;
  readonly title?: string;
  readonly painted?: boolean;
}

export function Rune({ id, className, title, painted }: RuneProps) {
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
      if (painted) {
        const { ctx, width, height } = frame;
        // Glaze only the inked silhouette, leaving transparent pixels untouched.
        const wash = ctx.createLinearGradient(width * .25, 0, width * .7, height);
        wash.addColorStop(0, 'rgba(255,221,165,.42)');
        wash.addColorStop(.46, 'rgba(255,225,185,.05)');
        wash.addColorStop(1, 'rgba(65,47,68,.38)');
        ctx.save();
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = wash;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }
    };
    paint();
    return observeDevicePixelSize(canvas, paint);
  }, [id, className, painted]);

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
