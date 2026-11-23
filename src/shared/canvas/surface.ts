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

const paths = new Map<string, Path2D>();

export function cachedPath(data: string): Path2D {
  const found = paths.get(data);
  if (found) return found;
  const path = new Path2D(data);
  paths.set(data, path);
  return path;
}
