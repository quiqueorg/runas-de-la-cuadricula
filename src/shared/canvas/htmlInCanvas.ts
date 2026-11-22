/** HTML-in-Canvas feature detection, device-pixel ResizeObserver, and DOM/JSX typings. */

export interface CanvasPaintEvent extends Event {
  readonly changedElements?: readonly Element[];
}

declare module 'react' {
  interface CanvasHTMLAttributes<T> {
    content?: 'drawable';
  }
  interface HTMLAttributes<T> {
    drawable?: boolean | '';
  }
}

declare global {
  interface HTMLCanvasElement {
    content?: string;
    onpaint: ((event: CanvasPaintEvent) => void) | null;
    requestPaint?: () => void;
    updateElementGeometry?: (
      element: Element,
      options?: { canvasTransform?: DOMMatrixInit; preserveHitTestOrder?: boolean },
    ) => void;
    clearElementGeometry?: (element: Element) => void;
  }

  interface CanvasRenderingContext2D {
    drawElementImage?: (
      element: Element,
      dx: number,
      dy: number,
      dWidth?: number,
      dHeight?: number,
      options?: { preserveElementGeometry?: boolean },
    ) => void;
  }
}

export function supportsHtmlInCanvas(): boolean {
  return typeof HTMLCanvasElement !== 'undefined' && 'content' in HTMLCanvasElement.prototype;
}

export const supportsDevicePixelContentBox: boolean =
  typeof ResizeObserverEntry !== 'undefined' &&
  'devicePixelContentBoxSize' in ResizeObserverEntry.prototype;

/**
 * Observes a canvas's exact physical backing-store size using device-pixel-content-box
 * when available, avoiding sub-pixel blurriness on fractional DPR displays.
 */
export function observeDevicePixelSize(
  canvas: HTMLCanvasElement,
  onResize: (pixelsWide: number, pixelsHigh: number) => void,
): () => void {
  const observer = new ResizeObserver((entries) => {
    const entry = entries[0];
    if (!entry) return;
    const dpr = window.devicePixelRatio || 1;
    const dpc = entry.devicePixelContentBoxSize?.[0];
    const pixelsWide = Math.max(
      1,
      Math.round(dpc ? dpc.inlineSize : entry.contentRect.width * dpr),
    );
    const pixelsHigh = Math.max(
      1,
      Math.round(dpc ? dpc.blockSize : entry.contentRect.height * dpr),
    );
    if (pixelsWide > 8192 || pixelsHigh > 8192) return;
    if (canvas.width !== pixelsWide || canvas.height !== pixelsHigh) {
      canvas.width = pixelsWide;
      canvas.height = pixelsHigh;
    }
    onResize(pixelsWide, pixelsHigh);
  });

  const options: ResizeObserverOptions = supportsDevicePixelContentBox
    ? { box: 'device-pixel-content-box' }
    : {};
  observer.observe(canvas, options);
  return () => observer.disconnect();
}
