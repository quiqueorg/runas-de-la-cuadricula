/** Rasterizes an inline SVG to a PNG download, as large as it is drawn on screen. */

/**
 * An SVG loaded as an image sees none of the page's CSS, so every property that can come from a
 * stylesheet, a custom property or `currentColor` is copied onto the copy as its computed value.
 */
const RESOLVED = [
  'color',
  'fill',
  'stroke',
  'stop-color',
  'stroke-width',
  'stroke-dasharray',
  'stroke-linejoin',
  'paint-order',
  'text-anchor',
  'dominant-baseline',
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
] as const;

/** `box` is the size on screen; `width` and `height` the image's, in device pixels. */
function standaloneCopy(svg: SVGSVGElement, box: DOMRect, width: number, height: number): string {
  const copy = svg.cloneNode(true) as SVGSVGElement;
  const sources = [svg, ...svg.querySelectorAll<SVGElement>('*')];
  const targets = [copy, ...copy.querySelectorAll<SVGElement>('*')];
  sources.forEach((source, index) => {
    const target = targets[index];
    if (!target) return;
    const computed = getComputedStyle(source);
    for (const property of RESOLVED) {
      target.style.setProperty(property, computed.getPropertyValue(property));
    }
  });
  // Without a viewBox, lengths in pixels would not grow with the device pixel ratio.
  if (!copy.hasAttribute('viewBox')) copy.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
  copy.style.removeProperty('aspect-ratio');
  copy.style.width = `${width}px`;
  copy.style.height = `${height}px`;
  copy.setAttribute('width', String(width));
  copy.setAttribute('height', String(height));
  return new XMLSerializer().serializeToString(copy);
}

export async function downloadSvgAsPng(svg: SVGSVGElement, fileName: string): Promise<void> {
  const box = svg.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(1, Math.round(box.width * dpr));
  const height = Math.max(1, Math.round(box.height * dpr));
  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(standaloneCopy(svg, box, width, height))}`;
  await image.decode();
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.drawImage(image, 0, 0, width, height);
  const link = document.createElement('a');
  link.download = fileName;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
