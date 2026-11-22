/** Device-pixel-ratio aware canvas backing store. */

export interface CanvasFrame {
  readonly ctx: CanvasRenderingContext2D;
  readonly width: number;
  readonly height: number;
  readonly dpr: number;
}

export function frameOf(canvas: HTMLCanvasElement): CanvasFrame | null {
  // Layout size, not the rotated bounding box. A spinning canvas must not
  // feed that box back into its own width attribute.
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (width < 1 || height < 1 || width > 4000 || height > 4000) return null;
  const dpr = window.devicePixelRatio || 1;
  const pixelsWide = Math.max(1, Math.round(width * dpr));
  const pixelsHigh = Math.max(1, Math.round(height * dpr));
  if (canvas.width !== pixelsWide || canvas.height !== pixelsHigh) {
    canvas.width = pixelsWide;
    canvas.height = pixelsHigh;
    if (canvas.clientWidth !== width || canvas.clientHeight !== height) {
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  return { ctx, width, height, dpr };
}

/** Draws in the element's layout box, including when a parent CSS transform scales it. */
export function paintLayout(canvas: HTMLCanvasElement, width: number, height: number): CanvasRenderingContext2D | null {
  if (width < 1 || height < 1) return null;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const pixelsWide = Math.max(1, Math.round(rect.width * dpr));
  const pixelsHigh = Math.max(1, Math.round(rect.height * dpr));
  if (canvas.width !== pixelsWide || canvas.height !== pixelsHigh) {
    canvas.width = pixelsWide;
    canvas.height = pixelsHigh;
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const scaleX = rect.width > 0 ? rect.width / width : 1;
  const scaleY = rect.height > 0 ? rect.height / height : 1;
  ctx.setTransform(dpr * scaleX, 0, 0, dpr * scaleY, 0, 0);
  ctx.clearRect(0, 0, width, height);
  return ctx;
}

const paths = new Map<string, Path2D>();

export function cachedPath(data: string): Path2D {
  const found = paths.get(data);
  if (found) return found;
  const path = new Path2D(data);
  paths.set(data, path);
  return path;
}
