// Bakes the apprentice's isle into assets/mapa-isla.jpg, the same size as the other worlds' maps.
// Usage: pnpm isle-map   (needs Chrome or Chromium; set CHROME=/path/to/chrome if it is not found)
// The painter is scripts/isle-chart.ts; this only turns its SVG into pixels with a headless browser.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const WIDTH = 2400;
const HEIGHT = 1650;
const QUALITY = 0.86;

const root = fileURLToPath(new URL('..', import.meta.url));
const out = join(root, 'assets', 'mapa-isla.jpg');

function findChrome() {
  const candidates = [
    process.env.CHROME,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].filter(Boolean);
  const found = candidates.find((path) => existsSync(path));
  if (!found) throw new Error('Chrome not found. Set CHROME=/path/to/chrome and try again.');
  return found;
}

const dir = mkdtempSync(join(tmpdir(), 'isla-'));
// Its own cache, so a dev server running at the same time keeps the dependency bundle it is serving.
const server = await createServer({ root, cacheDir: join(dir, 'vite'), logLevel: 'error', appType: 'custom', server: { middlewareMode: true, hmr: false, watch: null }, optimizeDeps: { noDiscovery: true } });
let svg;
try {
  const { isleChart } = await server.ssrLoadModule('/scripts/isle-chart.ts');
  // Same drawing, rasterised at full size rather than scaled up afterwards.
  svg = isleChart().replace(/width="660" height="454"/, `width="${WIDTH}" height="${HEIGHT}"`);
} finally {
  await server.close();
}

try {
  const page = join(dir, 'bake.html');
  writeFileSync(page, `<!doctype html><meta charset="utf-8"><body><script>
const img = new Image();
img.onload = () => {
  const canvas = document.createElement('canvas');
  canvas.width = ${WIDTH}; canvas.height = ${HEIGHT};
  canvas.getContext('2d').drawImage(img, 0, 0, ${WIDTH}, ${HEIGHT});
  document.body.textContent = 'JPEG:' + canvas.toDataURL('image/jpeg', ${QUALITY});
};
img.onerror = () => { document.body.textContent = 'ERROR'; };
img.src = 'data:image/svg+xml;base64,' + ${JSON.stringify(Buffer.from(svg).toString('base64'))};
</script>`);
  const dom = execFileSync(findChrome(), [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check',
    `--user-data-dir=${join(dir, 'profile')}`, '--virtual-time-budget=120000', '--dump-dom', `file://${page}`,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 180000, stdio: ['ignore', 'pipe', 'ignore'] });
  const match = dom.match(/JPEG:data:image\/jpeg;base64,([A-Za-z0-9+/=]+)/);
  if (!match) throw new Error(`The browser did not return an image: ${dom.slice(0, 300)}`);
  writeFileSync(out, Buffer.from(match[1], 'base64'));
  console.log(`assets/mapa-isla.jpg · ${WIDTH}×${HEIGHT} · ${Math.round(Buffer.byteLength(match[1], 'base64') / 1024)} kB`);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
