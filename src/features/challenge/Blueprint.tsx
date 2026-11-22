/** Blueprint canvases. Uses HTML-in-Canvas when supported, with 2D canvas fallback. */
import { useEffect, useLayoutEffect, useRef } from 'react';
import { observeDevicePixelSize, supportsHtmlInCanvas } from '../../shared/canvas/htmlInCanvas';
import type { BlueprintView } from './engine';
import { paintPlan, paintPlanIcons } from './paint';

const PAD = 6;

export function Blueprint({ views }: { readonly views: readonly BlueprintView[] }) {
  return (
    <div id="blueprint-svg">
      {views.map((view, index) => <Plan key={index} view={view} />)}
    </div>
  );
}

function Plan({ view }: { readonly view: BlueprintView }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef(view);
  viewRef.current = view;
  const painted = useRef('');
  const htmlInCanvas = supportsHtmlInCanvas();
  const boxW = view.boardW + PAD * 2;
  const boxH = view.boardH + PAD * 2;
  const ariaLabel = `Plano del resultado esperado${view.caption ? `, ${view.caption}` : ''}`;

  useEffect(() => {
    if (!htmlInCanvas) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.onpaint = () => {
      const ctx = canvas.getContext('2d');
      const board = boardRef.current;
      if (!ctx || !board || !ctx.drawElementImage) return;
      ctx.reset();
      ctx.drawElementImage(board, 0, 0);
      paintPlanIcons(ctx, canvas, viewRef.current);
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
      canvas.requestPaint?.();
      return;
    }
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
  }, [htmlInCanvas, view]);

  const exportPlan = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `plano${view.caption ? `-${view.caption.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : ''}.png`;
    link.href = url;
    link.click();
  };

  return (
    <figure>
      <canvas
        ref={canvasRef}
        className="rune bp-canvas"
        content={htmlInCanvas ? 'drawable' : undefined}
        style={{ width: '100%', aspectRatio: `${boxW} / ${boxH}` }}
        aria-label={ariaLabel}
      >
        <div
          ref={boardRef}
          className="bp-drawable"
          drawable={htmlInCanvas ? '' : undefined}
          role="list"
          aria-label={ariaLabel}
        >
          <div className="bp-board" style={{ inset: `${(PAD / boxH) * 100}% ${(PAD / boxW) * 100}%` }}>
            {view.pieces.map((piece, index) => {
              if (!piece.w && !piece.h) return null;
              const pieceAria = [
                piece.label || piece.icon || `Pieza ${index + 1}`,
                piece.fixed ? 'fija' : 'móvil',
              ].join(', ');
              return (
                <div
                  key={index}
                  role="listitem"
                  aria-label={pieceAria}
                  className={`bp-piece${piece.fixed ? ' is-fixed' : ''}${piece.color ? ' has-color' : ''}`}
                  style={{
                    left: `${(piece.x / view.boardW) * 100}%`,
                    top: `${(piece.y / view.boardH) * 100}%`,
                    width: `${(piece.w / view.boardW) * 100}%`,
                    height: `${(piece.h / view.boardH) * 100}%`,
                    backgroundColor: piece.color || undefined,
                  }}
                >
                  {piece.label ? <span className="bp-label">{piece.label}</span> : null}
                </div>
              );
            })}
          </div>
        </div>
      </canvas>
      <figcaption className="bp-caption">
        {view.caption ? <span>{view.caption}</span> : null}
        <button type="button" className="bp-export" onClick={exportPlan} aria-label={`Descargar ${ariaLabel} como PNG`}>
          PNG
        </button>
      </figcaption>
    </figure>
  );
}
