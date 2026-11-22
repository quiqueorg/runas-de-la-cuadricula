/** Guide canvas. Uses HTML-in-Canvas for accessible guide labels when supported, with 2D fallback. */
import { useEffect, useLayoutEffect, useRef } from 'react';
import { observeDevicePixelSize, supportsHtmlInCanvas } from '../../shared/canvas/htmlInCanvas';
import type { GuideDrawing } from './engine';
import { paintGuideGeometry, paintGuides } from './paint';

export function Guides({ drawing }: { readonly drawing: GuideDrawing | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const drawingRef = useRef(drawing);
  drawingRef.current = drawing;
  const painted = useRef('');
  const htmlInCanvas = supportsHtmlInCanvas();
  const hasLabels = Boolean(drawing && drawing.labels.length > 0);

  useEffect(() => {
    if (!htmlInCanvas) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.onpaint = () => {
      const current = drawingRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.reset();
      if (!current || current.width < 1 || current.height < 1) return;
      const scaleX = canvas.width / current.width;
      const scaleY = canvas.height / current.height;
      ctx.save();
      ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);
      paintGuideGeometry(ctx, canvas, current);
      ctx.restore();
      const labelsEl = labelsRef.current;
      if (labelsEl && ctx.drawElementImage) {
        ctx.drawElementImage(labelsEl, 0, 0);
      }
    };
    const disconnect = observeDevicePixelSize(canvas, () => {
      canvas.requestPaint?.();
    });
    canvas.requestPaint?.();
    return () => {
      disconnect();
      canvas.onpaint = null;
    };
  }, [htmlInCanvas]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (htmlInCanvas) {
      if (drawing && drawing.width >= 1 && drawing.height >= 1) {
        canvas.style.width = `${drawing.width}px`;
        canvas.style.height = `${drawing.height}px`;
      }
      canvas.requestPaint?.();
      return;
    }
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
  }, [htmlInCanvas, drawing]);

  return (
    <canvas
      ref={canvasRef}
      className="guides rune"
      content={htmlInCanvas ? 'drawable' : undefined}
      aria-hidden={hasLabels ? undefined : true}
    >
      {drawing && drawing.labels.length > 0 ? (
        <div
          ref={labelsRef}
          className="guides-drawable"
          drawable={htmlInCanvas ? '' : undefined}
          role="list"
          aria-label="Guías del tablero"
          style={{ width: `${drawing.width}px`, height: `${drawing.height}px` }}
        >
          {drawing.labels.map((label, index) => (
            <span
              key={index}
              role="listitem"
              className={`guide-lbl is-${label.kind}${label.rotate ? ' is-rot' : ''}`}
              style={{ left: `${label.x}px`, top: `${label.y}px` }}
            >
              {label.text}
            </span>
          ))}
        </div>
      ) : null}
    </canvas>
  );
}
