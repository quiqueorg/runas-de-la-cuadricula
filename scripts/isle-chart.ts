/**
 * Paints the apprentice's isle, an atoll of small islands round a lagoon, in the atlas' own hand, to be baked into assets/mapa-isla.jpg by
 * scripts/render-isle.mjs (`pnpm isle-map`). Grain, mottled grass, two-tone peaks with hatching, shaded
 * crowns with cast shadows, rivers that spring from the range, towns in three-quarter view.
 * Everything here is still; whatever moves lives in src/features/map (landscape/Isle.tsx, effects/) on top of the image.
 * Coordinates are in the 660×454 sheet; the bake scales them up, so line widths are in sheet units too.
 */
import { BRIDGES, CURIOS, ISLANDS, ISLE_SPOTS, type Island } from '../src/features/map/isleLayout';
import { type SheetPoint as Point, SHEET_HEIGHT, SHEET_WIDTH } from '../src/features/map/sheet';

const INK = '#3a2e24';

// ───────────────────────────────────────────── geometry

function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f1 = (n: number) => (Math.round(n * 100) / 100).toString();

/** `items[index]`, for an index the caller has kept in range. */
function itemAt<T>(items: readonly T[], index: number): T {
  const item = items[index];
  if (item === undefined) throw new RangeError(`No item ${index} in a list of ${items.length}`);
  return item;
}

/** Catmull-Rom through the points; closed for coasts and patches, open for rivers. */
function smooth(points: readonly Point[], closed: boolean, steps = 6): Point[] {
  const n = points.length;
  const at = (i: number): Point =>
    itemAt(points, closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i)));
  const out: Point[] = [];
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    for (let k = 0; k < steps; k++) {
      const t = k / steps;
      const t2 = t * t;
      const t3 = t2 * t;
      const c = (a: number, b: number, d: number, e: number) =>
        0.5 *
        (2 * b + (-a + d) * t + (2 * a - 5 * b + 4 * d - e) * t2 + (-a + 3 * b - 3 * d + e) * t3);
      out.push([c(p0[0], p1[0], p2[0], p3[0]), c(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  if (!closed) out.push(itemAt(points, n - 1));
  return out;
}

/** Roughens an outline the way a coast is rough: small, irregular, never self-crossing. */
function roughen(
  points: readonly Point[],
  amount: number,
  rand: () => number,
  closed = true,
): Point[] {
  const n = points.length;
  let phase = rand() * 10;
  return points.map(([x, y], i) => {
    if (!closed && (i === 0 || i === n - 1)) return [x, y];
    const [ax, ay] = itemAt(points, (i - 1 + n) % n);
    const [bx, by] = itemAt(points, (i + 1) % n);
    const dx = bx - ax;
    const dy = by - ay;
    const len = Math.hypot(dx, dy) || 1;
    phase += 0.7 + rand() * 0.6;
    const push = (Math.sin(phase) * 0.6 + (rand() - 0.5) * 0.8) * amount;
    return [x + (dy / len) * push, y - (dx / len) * push];
  });
}

function pathOf(points: readonly Point[], closed = true): string {
  return (
    points.map(([x, y], i) => `${i ? 'L' : 'M'}${f1(x)} ${f1(y)}`).join('') + (closed ? 'Z' : '')
  );
}

function inside(poly: readonly Point[], x: number, y: number): boolean {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = itemAt(poly, i);
    const [xj, yj] = itemAt(poly, j);
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

interface Keepout {
  readonly x: number;
  readonly y: number;
  readonly r: number;
}

/** Rejection sampling: points inside the patch, apart from each other and from the kept-out spots. */
function scatter(
  poly: readonly Point[],
  count: number,
  gap: number,
  rand: () => number,
  keepout: readonly Keepout[] = [],
  also?: (x: number, y: number) => boolean,
): Point[] {
  const xs = poly.map((p) => p[0]);
  const ys = poly.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const out: Point[] = [];
  for (let tries = 0; tries < count * 40 && out.length < count; tries++) {
    const x = x0 + rand() * (x1 - x0);
    const y = y0 + rand() * (y1 - y0);
    if (!inside(poly, x, y)) continue;
    if (also && !also(x, y)) continue;
    if (keepout.some((k) => Math.hypot(k.x - x, k.y - y) < k.r)) continue;
    if (out.some(([ox, oy]) => Math.hypot(ox - x, (oy - y) * 1.15) < gap)) continue;
    out.push([x, y]);
  }
  return out;
}

/** Voronoi cells by clipping a box with the bisector of every other seed. Fine for a few dozen. */
function cells(seeds: readonly Point[], box: readonly [number, number, number, number]): Point[][] {
  const [x0, y0, x1, y1] = box;
  return seeds.map(([sx, sy], i) => {
    let poly: Point[] = [
      [x0, y0],
      [x1, y0],
      [x1, y1],
      [x0, y1],
    ];
    seeds.forEach(([ox, oy], j) => {
      if (i === j || !poly.length) return;
      const mx = (sx + ox) / 2;
      const my = (sy + oy) / 2;
      const nx = ox - sx;
      const ny = oy - sy;
      const side = (p: Point) => (p[0] - mx) * nx + (p[1] - my) * ny;
      const next: Point[] = [];
      poly.forEach((a, k) => {
        const b = itemAt(poly, (k + 1) % poly.length);
        const da = side(a);
        const db = side(b);
        if (da <= 0) next.push(a);
        if (da <= 0 !== db <= 0) {
          const t = da / (da - db);
          next.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
        }
      });
      poly = next;
    });
    return poly;
  });
}

function shrink(poly: readonly Point[], by: number): Point[] {
  const cx = poly.reduce((sum, p) => sum + p[0], 0) / poly.length;
  const cy = poly.reduce((sum, p) => sum + p[1], 0) / poly.length;
  return poly.map(([x, y]) => {
    const d = Math.hypot(x - cx, y - cy) || 1;
    const k = Math.max(0, (d - by) / d);
    return [cx + (x - cx) * k, cy + (y - cy) * k];
  });
}

// ───────────────────────────────────────────── the chart's layout

const shapeRand = seeded(2026);

/** An island's outline: an ellipse with lumps, and bays bitten out of it. */
function blob(island: Island): Point[] {
  const {
    at: [cx, cy],
    radiusX: rx,
    radiusY: ry,
    bays = [],
  } = island;
  const phase: [number, number, number] = [shapeRand() * 6, shapeRand() * 6, shapeRand() * 6];
  const n = 48;
  return Array.from({ length: n }, (_, k): Point => {
    const a = (k / n) * Math.PI * 2;
    const r =
      1 +
      0.1 *
        (0.5 * Math.sin(3 * a + phase[0]) +
          0.3 * Math.sin(5 * a + phase[1]) +
          0.2 * Math.sin(8 * a + phase[2]));
    let [x, y] = [cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r];
    // a bay pushes the shore straight in, so its mouth stays as wide as the bite
    for (const [angle, depth, width] of bays) {
      const d = Math.atan2(Math.sin(a - angle), Math.cos(a - angle));
      const push =
        depth *
        (rx * Math.abs(Math.cos(angle)) + ry * Math.abs(Math.sin(angle))) *
        Math.exp(-(d * d) / (2 * width * width));
      x -= Math.cos(angle) * push;
      y -= Math.sin(angle) * push;
    }
    return [x, y];
  });
}

const OUTLINES: Record<string, Point[]> = Object.fromEntries(
  ISLANDS.map((island) => [
    island.name,
    roughen(roughen(smooth(blob(island), true, 4), 1.4, shapeRand), 0.6, shapeRand),
  ]),
);
function outline(name: string): Point[] {
  const shape = OUTLINES[name];
  if (!shape) throw new Error(`No island called ${name}`);
  return shape;
}
const INNER = Object.values(OUTLINES).map((poly) => shrink(poly, 5));
/** Somewhere on dry land, a little in from the beach. */
const onLand = (x: number, y: number) => INNER.some((poly) => inside(poly, x, y));
const SHEET: Point[] = [
  [0, 0],
  [SHEET_WIDTH, 0],
  [SHEET_WIDTH, SHEET_HEIGHT],
  [0, SHEET_HEIGHT],
];

const ISLETS: { readonly at: Point; readonly rx: number; readonly ry: number }[] = [
  { at: ISLE_SPOTS.palm, rx: 9, ry: 5 },
  { at: ISLE_SPOTS.twins, rx: 17, ry: 7.5 },
  { at: ISLE_SPOTS.oldLight, rx: 13, ry: 8 },
  { at: [470, 306], rx: 6, ry: 3.4 },
  { at: [640, 330], rx: 6, ry: 3.5 },
];

/** The atoll's rim runs through the ring islands; inside it lies the lagoon. */
const RING: Point[] = [
  [105, 372],
  [62, 304],
  [70, 240],
  [92, 170],
  [135, 108],
  [214, 72],
  [338, 58],
  [462, 64],
  [555, 118],
  [596, 176],
  [592, 240],
  [582, 308],
  [540, 368],
  [472, 396],
  [405, 404],
  [330, 410],
  [258, 402],
  [180, 398],
];

/** Rivers spring from the peaks; `fall` marks where the water drops off the rock. */
const RIVERS: { readonly points: Point[]; readonly width: number; readonly fall?: Point }[] = [
  // from the lighthouse peaks, west into the lagoon
  {
    points: [
      [576, 224],
      [566, 230],
      [556, 238],
      [546, 248],
      [538, 254],
    ],
    width: 2.4,
    fall: [574, 226],
  },
  // and south, down to the strait before the market
  {
    points: [
      [590, 274],
      [592, 286],
      [588, 298],
      [584, 306],
    ],
    width: 1.8,
    fall: [590, 276],
  },
  // the print town's mill race, across the north island
  {
    points: [
      [304, 40],
      [296, 54],
      [289, 66],
      [285, 80],
      [283, 96],
    ],
    width: 1.8,
  },
];

const CANAL: Point[] = [
  [506, 100],
  [528, 110],
  [552, 118],
  [578, 124],
  [606, 124],
];

const MOUNTAINS: Point[] = [
  [556, 206],
  [572, 192],
  [596, 192],
  [606, 212],
  [604, 250],
  [598, 280],
  [580, 290],
  [562, 282],
  [552, 252],
];
const LIBRARY_WOODS: Point[] = shrink(outline('biblioteca'), 3);
const NORTH_PINES: Point[] = [
  [518, 90],
  [546, 78],
  [578, 80],
  [600, 100],
  [588, 106],
  [556, 96],
  [526, 102],
];
const FIELDS: Point[] = shrink(outline('canal'), 4);
const GARDENS: Point[] = shrink(outline('invernaderos'), 4);
const MARKET: Point[] = shrink(outline('mercado'), 6);
const DYE_FIELDS: Point[] = [
  [84, 104],
  [96, 84],
  [116, 76],
  [132, 80],
  [132, 132],
  [108, 140],
  [88, 126],
];
const ORCHARD: Point = [338, 68];
const MILL: Point = [386, 78];

// ───────────────────────────────────────────── stamps

/** Crowns are lit from the upper left, like every tree on the continent. */
function crownGradient(id: string, light: string, mid: string, dark: string): string {
  return `<radialGradient id="${id}" cx=".36" cy=".32" r=".78"><stop stop-color="${light}"/><stop offset=".55" stop-color="${mid}"/><stop offset="1" stop-color="${dark}"/></radialGradient>`;
}

const CROWNS = [
  ['ca', '#9fd27a', '#5fa64d', '#2f6a35'],
  ['cb', '#8cc86c', '#4f9846', '#285e31'],
  ['cc', '#b0da84', '#70b558', '#3a7a3c'],
  ['cd', '#7dbb63', '#3f8a44', '#21522c'],
  ['cp', '#ffd6e4', '#f2a6c2', '#c46a8c'],
  ['ce', '#6fae58', '#367d3c', '#1a4626'],
  ['cf', '#86c066', '#468e45', '#22542c'],
] as const;

const DEFS = `
<radialGradient id="sea" cx=".5" cy=".48" r=".74"><stop stop-color="#3f95bb"/><stop offset=".6" stop-color="#2d7eaa"/><stop offset="1" stop-color="#1f5c87"/></radialGradient>
<radialGradient id="meadow" cx=".48" cy=".46" r=".62"><stop stop-color="#c8e38d"/><stop offset=".55" stop-color="#aed476"/><stop offset="1" stop-color="#92c060"/></radialGradient>
<linearGradient id="peak-lit" x1="0" y1="0" x2=".3" y2="1"><stop stop-color="#cfcbe2"/><stop offset=".6" stop-color="#aaa5c6"/><stop offset="1" stop-color="#928db4"/></linearGradient>
<linearGradient id="peak-shade" x1="0" y1="0" x2=".2" y2="1"><stop stop-color="#8d88ae"/><stop offset="1" stop-color="#5f5a85"/></linearGradient>
<linearGradient id="snow-shade" x1="0" y1="0" x2="1" y2="0"><stop offset=".5" stop-color="#ffffff"/><stop offset=".5" stop-color="#dfe6f2"/></linearGradient>
<linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f0fdff" stop-opacity=".95"/><stop offset=".45" stop-color="#a8e2ee" stop-opacity=".9"/><stop offset="1" stop-color="#5aaec4" stop-opacity=".95"/></linearGradient>
<linearGradient id="river" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#7dd0e4"/><stop offset="1" stop-color="#58b2d0"/></linearGradient>
<radialGradient id="lagoon" cx=".55" cy=".52" r=".62"><stop stop-color="#3f9db8"/><stop offset=".55" stop-color="#5cb8c8"/><stop offset="1" stop-color="#86d4d4"/></radialGradient>
<filter id="underwater" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="turbulence" baseFrequency=".09 .18" numOctaves="2" seed="9" result="w"/><feDisplacementMap in="SourceGraphic" in2="w" scale="2.4" xChannelSelector="R" yChannelSelector="G"/><feGaussianBlur stdDeviation=".28"/></filter>
${CROWNS.map(([id, a, b, c]) => crownGradient(`g-${id}`, a, b, c)).join('')}
<filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation=".9"/></filter>
<filter id="softer" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.4"/></filter>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7"/><feColorMatrix type="matrix" values="0 0 0 0 .16  0 0 0 0 .24  0 0 0 0 .08  1.6 0 0 0 -.62"/><feComposite in2="SourceGraphic" operator="in"/></filter>
<filter id="grain-light" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.3" numOctaves="1" seed="11"/><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 .86  1.8 0 0 0 -1.05"/><feComposite in2="SourceGraphic" operator="in"/></filter>
<filter id="mottle" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".028" numOctaves="3" seed="3"/><feColorMatrix type="matrix" values="0 0 0 0 .2  0 0 0 0 .36  0 0 0 0 .12  2.2 0 0 0 -1"/><feComposite in2="SourceGraphic" operator="in"/></filter>
<filter id="mottle-light" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".04" numOctaves="2" seed="19"/><feColorMatrix type="matrix" values="0 0 0 0 .95  0 0 0 0 .97  0 0 0 0 .7  2.4 0 0 0 -1.25"/><feComposite in2="SourceGraphic" operator="in"/></filter>
<filter id="sand-grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="1" seed="23"/><feColorMatrix type="matrix" values="0 0 0 0 .55  0 0 0 0 .42  0 0 0 0 .22  2 0 0 0 -.95"/><feComposite in2="SourceGraphic" operator="in"/></filter>
<filter id="sea-grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".02 .07" numOctaves="3" seed="5"/><feColorMatrix type="matrix" values="0 0 0 0 .78  0 0 0 0 .92  0 0 0 0 1  1.8 0 0 0 -.9"/><feComposite in2="SourceGraphic" operator="in"/></filter>
<filter id="paper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="3" seed="29"/><feColorMatrix type="matrix" values="0 0 0 0 .42  0 0 0 0 .32  0 0 0 0 .2  .9 0 0 0 -.3"/><feComposite in2="SourceGraphic" operator="in"/></filter>
<filter id="fibres" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".012 .3" numOctaves="2" seed="31"/><feColorMatrix type="matrix" values="0 0 0 0 .45  0 0 0 0 .35  0 0 0 0 .22  1.4 0 0 0 -.72"/><feComposite in2="SourceGraphic" operator="in"/></filter>
<radialGradient id="vignette" cx=".5" cy=".5" r=".72"><stop offset=".62" stop-color="#3a2a14" stop-opacity="0"/><stop offset="1" stop-color="#3a2a14" stop-opacity=".32"/></radialGradient>
${CROWNS.map(([id]) => `<symbol id="${id}" overflow="visible"><circle cx="1.5" cy="1.7" r="5.4" fill="#173a22" opacity=".42" filter="url(#soft)"/><circle r="5.4" fill="url(#g-${id})" stroke="#1f4426" stroke-width=".55"/><path d="M-1.4 3.6a4 4 0 0 0 4.6-2.6" stroke="#1f4426" stroke-width=".45" fill="none" opacity=".55"/><path d="M-3.4-1.4a3.6 3.6 0 0 1 3.4-2.8" stroke="#f0ffd8" stroke-width=".85" fill="none" opacity=".75" stroke-linecap="round"/></symbol>`).join('')}
${CROWNS.map(([id]) => `<symbol id="t${id}" overflow="visible"><ellipse cx="3.4" cy=".8" rx="6.2" ry="2" fill="#173a22" opacity=".38" filter="url(#soft)"/><path d="M0 .6v-4" stroke="#5c4128" stroke-width="1.5" stroke-linecap="round"/><circle cy="-7" r="5.2" fill="url(#g-${id})" stroke="#1f4426" stroke-width=".55"/><path d="M-1.6-3.2a4 4 0 0 0 4.6-2.6" stroke="#1f4426" stroke-width=".45" fill="none" opacity=".5"/><path d="M-3.2-8.6a3.4 3.4 0 0 1 3.4-2.6" stroke="#f0ffd8" stroke-width=".85" fill="none" opacity=".75" stroke-linecap="round"/></symbol>`).join('')}
<symbol id="pine" overflow="visible"><ellipse cx="3" cy=".7" rx="5" ry="1.6" fill="#173a22" opacity=".38" filter="url(#soft)"/><path d="M0 .6v-2.6" stroke="#4d3520" stroke-width="1.3"/><path d="M0-15.4 4.2-8.6H2.6L5.6-2.4H-5.6L-2.6-8.6H-4.2Z" fill="#2c6640" stroke="#173a26" stroke-width=".6" stroke-linejoin="round"/><path d="M0-15.4-4.2-8.6h1.6L-5.6-2.4H0Z" fill="#4c9560"/><path d="M-1.6-11.6l1.2-1.6m-2.6 7.8 1.8-2.2" stroke="#8fd09a" stroke-width=".5" opacity=".8"/></symbol>
<symbol id="bush" overflow="visible"><ellipse cx="2" cy="1.2" rx="6" ry="1.6" fill="#173a22" opacity=".32" filter="url(#soft)"/><path d="M-5.4 1q-1.2-4.6 2.8-4.8 1-3 4-1.2 3.8-.8 3.8 3 1.2 3-2 3Z" fill="url(#g-cc)" stroke="#2f5d2b" stroke-width=".55"/><path d="M-3-2.6q1-1.4 2.6-1.2" stroke="#f0ffd8" stroke-width=".6" fill="none" opacity=".7"/></symbol>
<symbol id="house" overflow="visible"><path d="M-6 4.2 10 6 13 3.6-3 1.6Z" fill="#173a22" opacity=".3" filter="url(#soft)"/><path d="M-6-1.6h8.6v6h-8.6Z" fill="#fbf3dd" stroke="${INK}" stroke-width=".55"/><path d="M2.6-1.6l4.4-2.4v6l-4.4 2.4Z" fill="#d9cbaa" stroke="${INK}" stroke-width=".55" stroke-linejoin="round"/><path d="M-7-1.4-2.4-7.6h5.8L8-4.2 2.6-1.4Z" fill="currentColor" stroke="${INK}" stroke-width=".55" stroke-linejoin="round"/><path d="M3.4-7.6 8-4.2 2.6-1.4Z" fill="#000" opacity=".22"/><path d="M-5.6-2.6-1.8-6.8" stroke="#fff" stroke-width=".5" opacity=".45"/><path d="M-2.6 4.4V1.6h2v2.8Z" fill="#6b4a2c"/><path d="M-5 .2h1.8v1.6H-5ZM.4.2h1.6v1.6H.4Z" fill="#7fb4d8" stroke="${INK}" stroke-width=".3"/><path d="M4.2-6.8v-2.4h1.4v3.2" fill="#a0654a" stroke="${INK}" stroke-width=".4"/></symbol>
<symbol id="tent" overflow="visible"><path d="M-4 1.4 7 2.6 6 .4Z" fill="#173a22" opacity=".3" filter="url(#soft)"/><path d="M-5 1.4 0-5.4 5 1.4Z" fill="#f6eedc" stroke="${INK}" stroke-width=".55" stroke-linejoin="round"/><path d="M0-5.4 5 1.4H1.2Z" fill="#d8ccb0"/><path d="M0-5.4 1.2 1.4H-1.2Z" fill="currentColor"/></symbol>
<symbol id="crate" overflow="visible"><path d="M-3-3h6v6h-6Z" fill="#d2a468" stroke="#5a3e22" stroke-width=".45"/><path d="M3-3 4.4-4.2v6L3 3Z" fill="#a87a44" stroke="#5a3e22" stroke-width=".4"/><path d="M-3-3l1.4-1.2h6L3-3Z" fill="#e6c08a" stroke="#5a3e22" stroke-width=".4"/><path d="m-3-3 6 6m0-6-6 6" stroke="#8a5a30" stroke-width=".35"/></symbol>
<symbol id="stall" overflow="visible"><path d="M-4 2.4 8 3.6 7 1.4Z" fill="#173a22" opacity=".28" filter="url(#soft)"/><path d="M-4.4-1h8.8v3.4h-8.8Z" fill="#c89a62" stroke="${INK}" stroke-width=".5"/><path d="M-5.4-1-4-4.6h8L5.4-1Z" fill="currentColor" stroke="${INK}" stroke-width=".5" stroke-linejoin="round"/><path d="M-2.4-4.6-2.8-1m2.8-3.6v3.6m2.4-3.6.4 3.6" stroke="#fffaf0" stroke-width="1.1"/><circle cx="-2.4" cy=".8" r=".7" fill="#e8483a"/><circle cx="0" cy=".9" r=".7" fill="#f0c030"/><circle cx="2.2" cy=".8" r=".7" fill="#7cc062"/></symbol>
<symbol id="dome" overflow="visible"><ellipse cx="3" cy="2.4" rx="9.4" ry="2.4" fill="#173a22" opacity=".3" filter="url(#soft)"/><path d="M-8 2a8 8 0 0 1 16 0Z" fill="url(#glass)" stroke="#2a5f6c" stroke-width=".6"/><path d="M-4-4.6Q-4.6-1-4 2M0-6V2m4-6.6Q4.6-1 4 2M-7-1.6h14M-7.6.4h15.2" stroke="#2a5f6c" stroke-width=".35" fill="none"/><path d="M-5.6-2.6a6 6 0 0 1 3.8-3" stroke="#fff" stroke-width=".9" fill="none" opacity=".9"/><path d="M-8 2h16v1.2h-16Z" fill="#cfc4a8" stroke="#2a5f6c" stroke-width=".4"/></symbol>
<symbol id="glasshouse" overflow="visible"><path d="M-9 3 14 4.6 12 1Z" fill="#173a22" opacity=".3" filter="url(#soft)"/><path d="M-10 3V-2l10-5 10 5v5Z" fill="url(#glass)" stroke="#2a5f6c" stroke-width=".6" stroke-linejoin="round"/><path d="M0-7 10-2v5H0Z" fill="#2a5f6c" opacity=".14"/><path d="M-5 3v-7.4M0 3v-10M5 3v-7.4M-10-2h20M-10 .6h20" stroke="#2a5f6c" stroke-width=".35"/><path d="M-8-1.4 0-5.4" stroke="#fff" stroke-width=".9" opacity=".85"/><path d="M-10 3h20v1h-20Z" fill="#cfc4a8" stroke="#2a5f6c" stroke-width=".35"/></symbol>
`;

function use(id: string, x: number, y: number, scale = 1, color?: string): string {
  return `<use href="#${id}" transform="translate(${f1(x)} ${f1(y)})${scale !== 1 ? ` scale(${scale.toFixed(2)})` : ''}"${color ? ` color="${color}"` : ''}/>`;
}

interface Sprite {
  readonly y: number;
  readonly svg: string;
}

// ───────────────────────────────────────────── sea and shore

function seaMarks(rand: () => number, rim: readonly Point[]): string {
  const marks: string[] = [];
  for (let i = 0; i < 200; i++) {
    const x = 18 + rand() * (SHEET_WIDTH - 36);
    const y = 18 + rand() * (SHEET_HEIGHT - 36);
    if (inside(rim, x, y)) continue;
    const s = 0.7 + rand() * 0.6;
    marks.push(
      `M${f1(x)} ${f1(y)}q${f1(2.2 * s)}-${f1(2.2 * s)} ${f1(4.4 * s)} 0t${f1(4.4 * s)} 0`,
    );
  }
  return `<path d="${marks.join('')}" fill="none" stroke="#d6f0f2" stroke-width=".7" stroke-linecap="round" opacity=".55"/>`;
}

/** The atoll: contour lines round its rim, the lagoon inside, a pale reef along the ring. */
function atoll(ring: string, lagoonShape: readonly Point[], rand: () => number): string {
  const rings: [number, string][] = [
    [96, '#337aa8'],
    [82, '#3887b2'],
    [68, '#4294bb'],
    [56, '#4fa3c2'],
  ];
  const contours = rings
    .map(
      ([width, water]) =>
        `<path d="${ring}" fill="none" stroke="#dff6f4" stroke-width="${width}" stroke-linejoin="round" opacity=".45"/><path d="${ring}" fill="none" stroke="${water}" stroke-width="${width - 0.9}" stroke-linejoin="round"/>`,
    )
    .join('');
  const lagoon = pathOf(lagoonShape);
  const bars = [
    [300, 300, 22, 6, -12],
    [470, 300, 18, 5, 18],
    [250, 180, 16, 4.6, -30],
    [440, 170, 20, 5, 10],
    [380, 320, 14, 4, 4],
  ]
    .map(
      ([x, y, rx, ry, a]) =>
        `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${a} ${x} ${y})" fill="#bfeee2" opacity=".55" filter="url(#soft)"/><ellipse cx="${x}" cy="${y}" rx="${Number(rx) * 0.6}" ry="${Number(ry) * 0.5}" transform="rotate(${a} ${x} ${y})" fill="#efe2b0" opacity=".55" filter="url(#soft)"/>`,
    )
    .join('');
  const ripples: string[] = [];
  for (let i = 0; i < 70; i++) {
    const x = 60 + rand() * 540;
    const y = 60 + rand() * 340;
    if (!inside(lagoonShape, x, y) || onLand(x, y)) continue;
    ripples.push(`M${f1(x)} ${f1(y)}q1.8-1.8 3.6 0t3.6 0`);
  }
  return (
    contours +
    `<path d="${ring}" fill="#5cb6c6" stroke="#5cb6c6" stroke-width="46" stroke-linejoin="round"/>` +
    `<path d="${lagoon}" fill="url(#lagoon)"/>` +
    `<path d="${lagoon}" fill="#fff" filter="url(#sea-grain)" opacity=".35"/>` +
    bars +
    underwater(lagoonShape, rand) +
    `<path d="${ring}" fill="none" stroke="#f4fffc" stroke-width="31.6" stroke-linejoin="round" opacity=".75"/>` +
    `<path d="${ring}" fill="none" stroke="#96dcd5" stroke-width="30" stroke-linejoin="round"/>` +
    `<path d="${ring}" fill="none" stroke="#c4efe6" stroke-width="12" stroke-linejoin="round" opacity=".55"/>` +
    `<path d="${ripples.join('')}" fill="none" stroke="#e8fbf8" stroke-width=".55" stroke-linecap="round" opacity=".8"/>`
  );
}

/**
 * What lies under the lagoon: a sunken city, a wreck, a bell, coral and a big shadow. Drawn faint and
 * rippled, so it reads as seen through the water, and only a curious eye goes looking.
 */
const UNDERWATER_INK = 'stroke="#1f5868" stroke-width=".55" stroke-linejoin="round"';

/** The sunken city's streets and house footprints, half of them broken. */
function sunkenBlocks(rand: () => number): string[] {
  const [cx, cy] = ISLE_SPOTS.sunken;
  const ink = UNDERWATER_INK;
  const blocks: string[] = [];
  for (let gx = -3; gx <= 3; gx++)
    for (let gy = -2; gy <= 2; gy++) {
      if (Math.hypot(gx * 1.1, gy * 1.4) > 3.6 || (gx === 1 && gy === -1) || rand() < 0.3) continue;
      const x = cx + gx * 11 - 4 + (gy % 2) * 3 + (rand() - 0.5) * 4;
      const y = cy + gy * 10 - 4 + (rand() - 0.5) * 3;
      const w = 6 + rand() * 3;
      const h = 5 + rand() * 2;
      blocks.push(
        rand() > 0.4
          ? `<path d="M${f1(x)} ${f1(y)}h${f1(w)}v${f1(h)}h${f1(-w)}Z" fill="#4c98a8" ${ink}/>`
          : `<path d="M${f1(x)} ${f1(y + h)}V${f1(y)}h${f1(w)}v${f1(h * 0.5)}" fill="none" ${ink}/>`,
      );
    }
  return blocks;
}

/** Coral and weed in the lagoon, close to the shores. */
function coralOf(lagoonShape: readonly Point[], rand: () => number): string[] {
  const coral: string[] = [];
  for (let i = 0; i < 260 && coral.length < 70; i++) {
    const x = 60 + rand() * 540;
    const y = 60 + rand() * 340;
    if (
      !inside(lagoonShape, x, y) ||
      onLand(x, y) ||
      !Object.values(OUTLINES).some((poly) => inside(shrink(poly, -14), x, y))
    )
      continue;
    const color = ['#f08a8a', '#f4b06a', '#e87ab4', '#c8a0f0', '#7cd6a0'][i % 5];
    coral.push(
      `<g fill="${color}" opacity=".7"><circle cx="${f1(x)}" cy="${f1(y)}" r=".9"/><circle cx="${f1(x + 1.4)}" cy="${f1(y - 0.8)}" r=".7"/><circle cx="${f1(x - 1.2)}" cy="${f1(y - 0.6)}" r=".6"/></g>`,
    );
  }
  return coral;
}

function underwater(lagoonShape: readonly Point[], rand: () => number): string {
  const [cx, cy] = ISLE_SPOTS.sunken;
  const ink = UNDERWATER_INK;
  const blocks = sunkenBlocks(rand);
  // the temple: a ring of columns round a broken dome, steps down to it
  const temple =
    Array.from({ length: 10 }, (_, k) => {
      const a = (k / 10) * Math.PI * 2;
      return `<circle cx="${f1(cx + 12 + Math.cos(a) * 9)}" cy="${f1(cy - 10 + Math.sin(a) * 6)}" r="1.2" fill="#7cc2cc" ${ink}/>`;
    }).join('') +
    `<path d="M${cx + 7} ${cy - 10}a5 4 0 0 1 10 0" fill="#5aa8b6" ${ink}/><path d="M${cx + 6} ${cy - 1}h12m-11 1.6h10m-9 1.6h8" ${ink}/>`;
  const statue = `<ellipse cx="${cx - 22}" cy="${cy + 18}" rx="7" ry="2.4" transform="rotate(-18 ${cx - 22} ${cy + 18})" fill="#6cb4c0" ${ink}/><circle cx="${cx - 29}" cy="${cy + 21}" r="2.2" fill="#6cb4c0" ${ink}/>`;
  const walls = `<path d="M${cx - 40} ${cy}q0-30 40-32 40 2 42 32" fill="none" stroke="#1f5868" stroke-width=".8" stroke-dasharray="9 4 3 6"/><path d="M${cx + 38} ${cy + 12}q-10 18-38 18" fill="none" stroke="#1f5868" stroke-width=".8" stroke-dasharray="5 7"/>`;
  // the wreck: a brigantine on its side, mast broken, a chest spilled on the sand
  const [wx, wy] = ISLE_SPOTS.wreck;
  const wreck = `<g transform="rotate(-22 ${wx} ${wy})"><ellipse cx="${wx}" cy="${wy + 1}" rx="17" ry="6" fill="#d8c98e" opacity=".5"/><path d="M${wx - 15} ${wy}q15 7 30 0l-3 4q-12 4-24 0Z" fill="#4a7a74" ${ink}/><path d="M${wx - 13} ${wy}h26" ${ink}/><path d="M${wx - 9} ${wy + 1}v2m5-2v2.4m5-2.4v2.4m5-2.4v2" ${ink}/><path d="M${wx - 2} ${wy}l-10-11m5 5 6-3" fill="none" stroke="#1f5868" stroke-width=".8"/><path d="M${wx + 9} ${wy + 6}h4v3h-4Z" fill="#8a8a5a" ${ink}/></g>`;
  const [bx, by] = CURIOS.campana;
  const bell = `<path d="M${bx - 3} ${by + 2}q0-6 3-6t3 6l1 1h-8Z" fill="#7aa88a" ${ink}/><circle cx="${bx}" cy="${by + 3.6}" r=".8" fill="#4c7a6a"/>`;
  const [kx, ky] = CURIOS.kraken;
  const shadowBody = `<ellipse cx="${kx}" cy="${ky + 2}" rx="15" ry="8" fill="#1d4f62" opacity=".55" filter="url(#softer)"/>`;
  const coral = coralOf(lagoonShape, rand);
  const fishAt: Point[] = [
    [cx - 30, cy - 20],
    [cx + 30, cy + 14],
    [wx + 18, wy - 10],
    [cx - 6, cy + 30],
  ];
  const fish = fishAt
    .map(
      ([x, y], i) =>
        `<path d="M${f1(x)} ${f1(y)}q3-2 6 0q-3 2-6 0l-2-1.4v2.8Z" fill="#1f5868" opacity=".55" transform="rotate(${i * 25 - 20} ${x} ${y})"/>`,
    )
    .join('');
  const caustics: string[] = [];
  for (let i = 0; i < 46; i++) {
    const x = cx - 46 + rand() * 92;
    const y = cy - 34 + rand() * 66;
    caustics.push(`M${f1(x)} ${f1(y)}q2-1.6 4 0t4 0`);
  }
  return (
    `<g filter="url(#underwater)" opacity=".42" transform="rotate(-9 ${cx} ${cy})">${walls}${blocks.join('')}${temple}${statue}${wreck}${bell}${shadowBody}</g>` +
    coral.join('') +
    fish +
    `<path d="${caustics.join('')}" fill="none" stroke="#e6fbff" stroke-width=".45" opacity=".55"/>`
  );
}

function shallows(shores: string): string {
  return (
    `<path d="${shores}" fill="#a6e2d8" stroke="#a6e2d8" stroke-width="12" stroke-linejoin="round" opacity=".9"/>` +
    `<path d="${shores}" fill="#c6eee2" stroke="#c6eee2" stroke-width="7" stroke-linejoin="round"/>`
  );
}

function beach(shores: string, coasts: readonly Point[], rand: () => number): string {
  // broken foam: dashes along the waterline, not a clean ring
  const foam =
    `<path d="${shores}" fill="none" stroke="#ffffff" stroke-width="5.6" stroke-linejoin="round" stroke-dasharray="7 2 3 2" opacity=".85"/>` +
    `<path d="${shores}" fill="none" stroke="#ffffff" stroke-width="7.4" stroke-linejoin="round" stroke-dasharray="1.4 6" opacity=".55"/>`;
  const sand =
    `<path d="${shores}" fill="#f2e0a8" stroke="#f2e0a8" stroke-width="4.2" stroke-linejoin="round"/>` +
    `<path d="${shores}" fill="none" stroke="#d8bd7c" stroke-width="2.2" stroke-linejoin="round" opacity=".5"/>` +
    `<path d="${shores}" fill="#f2e0a8" stroke="#f2e0a8" stroke-width="1.4" filter="url(#sand-grain)"/>`;
  // a few rocks on the shore
  const rocks = Array.from({ length: 40 }, () => {
    const [x, y] = itemAt(coasts, Math.floor(rand() * coasts.length));
    const r = 0.9 + rand() * 1.4;
    return `<ellipse cx="${f1(x + (rand() - 0.5) * 3)}" cy="${f1(y + (rand() - 0.5) * 3)}" rx="${f1(r * 1.3)}" ry="${f1(r)}" fill="#9a9a92" stroke="#55534e" stroke-width=".4"/>`;
  }).join('');
  return foam + sand + rocks;
}

// ───────────────────────────────────────────── ground

/** Open meadow: dry land that no biome has claimed. */
function openGround(x: number, y: number): boolean {
  return (
    onLand(x, y) &&
    !inside(LIBRARY_WOODS, x, y) &&
    !inside(MOUNTAINS, x, y) &&
    !inside(FIELDS, x, y) &&
    !inside(GARDENS, x, y) &&
    !inside(DYE_FIELDS, x, y)
  );
}

function grassTufts(rand: () => number): string {
  const tufts: string[] = [];
  for (let i = 0; i < 1600; i++) {
    const x = 30 + rand() * 600;
    const y = 20 + rand() * 420;
    if (!openGround(x, y)) continue;
    const s = 0.6 + rand() * 0.5;
    tufts.push(
      `M${f1(x - 1.2 * s)} ${f1(y)}l${f1(0.5 * s)}-${f1(1.6 * s)}M${f1(x)} ${f1(y)}v-${f1(2 * s)}M${f1(x + 1.2 * s)} ${f1(y)}l-${f1(0.5 * s)}-${f1(1.6 * s)}`,
    );
  }
  return `<path d="${tufts.join('')}" fill="none" stroke="#5f8f3e" stroke-width=".35" stroke-linecap="round" opacity=".6"/>`;
}

function sparkles(rand: () => number): string {
  const colors = ['#fffaf0', '#f8d24a', '#f58ab0', '#c8a8f0', '#ffffff', '#ffb070'];
  const dots: string[] = [];
  for (let i = 0; i < 1100; i++) {
    const x = 30 + rand() * 600;
    const y = 20 + rand() * 420;
    if (!openGround(x, y) || inside(FIELDS, x, y)) continue;
    dots.push(
      `<circle cx="${f1(x)}" cy="${f1(y)}" r="${(0.32 + rand() * 0.34).toFixed(2)}" fill="${colors[i % colors.length]}"/>`,
    );
  }
  return `<g opacity=".9">${dots.join('')}</g>`;
}

function folds(rand: () => number): string {
  const arcs: string[] = [];
  for (let i = 0; i < 120; i++) {
    const x = 30 + rand() * 600;
    const y = 20 + rand() * 420;
    if (
      !openGround(x, y) ||
      inside(MARKET, x, y) ||
      !INNER.some((poly) => inside(shrink(poly, 8), x, y))
    )
      continue;
    const s = 0.5 + rand() * 0.5;
    arcs.push(
      `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s.toFixed(2)})"><path d="M-12 3Q-5-8 3-5T13 3Z" fill="#9cc865" opacity=".8"/><path d="M-12 3Q-5-8 3-5T13 3" fill="none" stroke="#5f8a3a" stroke-width=".7"/><path d="M-6-1.6Q-2-4.6 2-3.8" fill="none" stroke="#eaf6c4" stroke-width=".7" opacity=".8"/><path d="M4 3 6-1m1 4 1.4-3" stroke="#5f8a3a" stroke-width=".4" opacity=".7"/></g>`,
    );
  }
  return arcs.join('');
}

/** Faint height lines across the bigger islands, as on the continent: the chart knows where the ground rises. */
function heightLines(): string {
  return ISLANDS.filter((island) =>
    ['faro', 'norte', 'observatorio', 'biblioteca', 'muelle'].includes(island.name),
  )
    .flatMap((island) =>
      [0.55, 0.78].map((k, i) => {
        const [cx, cy] = island.at;
        const pts = Array.from({ length: 28 }, (_, n): Point => {
          const a = (n / 28) * Math.PI * 2;
          return [
            cx + Math.cos(a) * island.radiusX * k * (1 + Math.sin(a * 4 + i + cx) * 0.06),
            cy + Math.sin(a) * island.radiusY * k * (1 + Math.cos(a * 3 + cy) * 0.06),
          ];
        });
        return `<path d="${pathOf(smooth(pts, true, 3))}" fill="none" stroke="#6c8f48" stroke-width=".45" opacity=".38"/>`;
      }),
    )
    .join('');
}

// ───────────────────────────────────────────── features

function peaks(rand: () => number): Sprite[] {
  const spots = scatter(MOUNTAINS, 22, 10, rand, [
    { x: ISLE_SPOTS.cave[0], y: ISLE_SPOTS.cave[1] + 4, r: 9 },
  ]);
  const sprites: Sprite[] = spots.map(([x, y]) => {
    const tall = 18 + rand() * 14 + (y < 230 ? 6 : 0) - (y > 270 ? 4 : 0);
    const w = tall * (0.82 + rand() * 0.22);
    const tip: Point = [x + (rand() - 0.5) * w * 0.14, y - tall];
    const left: Point = [x - w / 2, y];
    const right: Point = [x + w / 2, y];
    const foot: Point = [x + w * 0.06 + (rand() - 0.5) * 2, y];
    const snow = tall * (0.26 + rand() * 0.1);
    const k = snow / tall;
    const sl: Point = [tip[0] + (left[0] - tip[0]) * k, tip[1] + snow];
    const sr: Point = [tip[0] + (right[0] - tip[0]) * k, tip[1] + snow];
    const notch = (t: number, drop: number): Point => [sl[0] + (sr[0] - sl[0]) * t, sl[1] + drop];
    const hatch = Array.from({ length: 6 }, (_, i) => {
      const t = 0.22 + i * 0.13;
      const top: Point = [tip[0] + (right[0] - tip[0]) * t, tip[1] + (right[1] - tip[1]) * t];
      const bottom: Point = [top[0] - w * 0.1, top[1] + tall * 0.16];
      return `M${f1(top[0] - 0.8)} ${f1(top[1] + 1)}L${f1(bottom[0])} ${f1(Math.min(bottom[1], y - 1))}`;
    }).join('');
    const litHatch = Array.from({ length: 3 }, (_, i) => {
      const t = 0.45 + i * 0.16;
      const top: Point = [tip[0] + (left[0] - tip[0]) * t + 2.4, tip[1] + (left[1] - tip[1]) * t];
      return `M${f1(top[0])} ${f1(top[1])}l${f1(1.2)} ${f1(tall * 0.12)}`;
    }).join('');
    const svg =
      `<g stroke-linejoin="round">` +
      `<path d="M${f1(right[0] - 2)} ${f1(y)}L${f1(tip[0] + 6)} ${f1(tip[1] + tall * 0.35)}L${f1(right[0] + w * 0.5)} ${f1(y + 3)}Z" fill="#2a2a3e" opacity=".22" filter="url(#soft)"/>` +
      `<path d="M${f1(left[0])} ${f1(y)}L${f1(tip[0])} ${f1(tip[1])}L${f1(right[0])} ${f1(y)}Z" fill="url(#peak-lit)"/>` +
      `<path d="M${f1(tip[0])} ${f1(tip[1])}L${f1(right[0])} ${f1(y)}L${f1(foot[0])} ${f1(y)}Z" fill="url(#peak-shade)"/>` +
      `<path d="${hatch}" stroke="#4a4570" stroke-width=".38" opacity=".55" fill="none"/>` +
      `<path d="${litHatch}" stroke="#eeeaf8" stroke-width=".38" opacity=".6" fill="none"/>` +
      `<path d="M${f1(tip[0])} ${f1(tip[1])}L${f1(sl[0])} ${f1(sl[1])}L${f1(notch(0.22, -snow * 0.18)[0])} ${f1(notch(0.22, -snow * 0.18)[1])}L${f1(notch(0.4, snow * 0.12)[0])} ${f1(notch(0.4, snow * 0.12)[1])}L${f1(notch(0.62, -snow * 0.2)[0])} ${f1(notch(0.62, -snow * 0.2)[1])}L${f1(notch(0.8, snow * 0.06)[0])} ${f1(notch(0.8, snow * 0.06)[1])}L${f1(sr[0])} ${f1(sr[1])}Z" fill="url(#snow-shade)"/>` +
      `<path d="M${f1(left[0])} ${f1(y)}L${f1(tip[0])} ${f1(tip[1])}L${f1(right[0])} ${f1(y)}" fill="none" stroke="#3a3558" stroke-width=".7"/>` +
      `<path d="M${f1(tip[0])} ${f1(tip[1])}L${f1(foot[0])} ${f1(y)}" stroke="#3a3558" stroke-width=".4" opacity=".6" fill="none"/>` +
      `<path d="M${f1(left[0] + 2)} ${f1(y - 0.3)}h${f1(w - 4)}" stroke="#8a8478" stroke-width=".8" stroke-dasharray=".6 1.4" opacity=".6"/>` +
      `</g>`;
    return { y, svg };
  });
  // pines on the lower slopes, a scree of rocks among them
  scatter(
    shrink(outline('faro'), 2),
    60,
    4.2,
    rand,
    [],
    (x, y) =>
      !inside(shrink(MOUNTAINS, 3), x, y) &&
      Math.hypot(x - ISLE_SPOTS.lighthouse[0], y - ISLE_SPOTS.lighthouse[1]) > 16,
  ).forEach(([x, y]) => {
    sprites.push({ y, svg: use('pine', x, y, 0.5 + rand() * 0.28) });
  });
  return sprites;
}

function woods(rand: () => number): { ground: string; sprites: Sprite[] } {
  // the deep woods are darker than the meadow trees, and never two greens alike
  const tones = ['cb', 'cd', 'ce', 'cf', 'ca', 'ce', 'cd', 'cf'];
  const clearings: Keepout[] = [
    { x: ISLE_SPOTS.library[0], y: ISLE_SPOTS.library[1] + 2, r: 17 },
    { x: ISLE_SPOTS.well[0], y: ISLE_SPOTS.well[1], r: 9 },
    { x: CURIOS.dos_puntos[0], y: CURIOS.dos_puntos[1], r: 8 },
    { x: CURIOS.atril_vacio[0], y: CURIOS.atril_vacio[1], r: 8 },
  ];
  const sprites: Sprite[] = scatter(LIBRARY_WOODS, 700, 4, rand, clearings).map(([x, y]) => ({
    y,
    svg: use(itemAt(tones, Math.floor(rand() * tones.length)), x, y, 0.62 + rand() * 0.26),
  }));
  for (const [x, y] of scatter(NORTH_PINES, 50, 4.4, rand)) {
    sprites.push({ y, svg: use('pine', x, y, 0.62 + rand() * 0.3) });
  }
  const woodsPath = pathOf(smooth(LIBRARY_WOODS, true));
  const ground =
    `<path d="${woodsPath}" fill="#2f6a35" stroke="#2f6a35" stroke-width="6" stroke-linejoin="round" opacity=".55" filter="url(#softer)"/>` +
    `<path d="${woodsPath}" fill="#356f37"/>` +
    `<path d="${pathOf(smooth(NORTH_PINES, true))}" fill="#4a8442" opacity=".45" filter="url(#softer)"/>` +
    clearings
      .map(
        (c) =>
          `<ellipse cx="${c.x}" cy="${c.y}" rx="${f1(c.r * 0.95)}" ry="${f1(c.r * 0.75)}" fill="#b4d67e" stroke="#8cb860" stroke-width=".6"/>`,
      )
      .join('');
  return { ground, sprites };
}

function fields(rand: () => number): string {
  const tones = [
    '#c9d96a',
    '#a9cc5c',
    '#d9c867',
    '#9cc062',
    '#e2cf7a',
    '#b6d46e',
    '#8fba58',
    '#d6b45e',
  ];
  const seeds = scatter(FIELDS, 18, 13, rand);
  const patches = cells(seeds, [490, 66, 620, 172])
    .map((cell, i) => {
      const inner = shrink(cell, 1.5);
      if (inner.length < 3) return '';
      const tone = tones[i % tones.length];
      const [cx, cy] = itemAt(seeds, i);
      const angle = Math.floor(rand() * 180);
      const furrows = Array.from(
        { length: 14 },
        (_, k) => `M${f1(cx - 24)} ${f1(cy - 20 + k * 3)}h48`,
      ).join('');
      const shade = `<path d="${pathOf(inner)}" fill="url(#g-ca)" opacity=".12"/>`;
      return `<g><path d="${pathOf(inner)}" fill="${tone}"/>${shade}<clipPath id="fc${i}"><path d="${pathOf(inner)}"/></clipPath><path d="${furrows}" stroke="#6f8a34" stroke-width=".4" opacity=".55" transform="rotate(${angle} ${f1(cx)} ${f1(cy)})" clip-path="url(#fc${i})"/><path d="${pathOf(inner)}" fill="none" stroke="#fff6c8" stroke-width=".5" opacity=".55"/></g>`;
    })
    .join('');
  // hedges: little bushes along the borders between patches
  const hedge = scatter(FIELDS, 80, 3.2, rand)
    .map(([x, y]) => `<circle cx="${f1(x)}" cy="${f1(y)}" r=".9" fill="#3f6e2e" opacity=".55"/>`)
    .join('');
  const outline = pathOf(smooth(FIELDS, true, 4));
  return `<clipPath id="fields-clip"><path d="${outline}"/></clipPath><g clip-path="url(#fields-clip)"><path d="${outline}" fill="#3f6a2e"/>${patches}${hedge}</g><path d="${outline}" fill="none" stroke="#3f6a2e" stroke-width="1.2" opacity=".7"/>`;
}

function dyeFields(): string {
  const stripes = ['#b47ad8', '#f0c030', '#d8483a', '#f58ab0', '#3a7ad8', '#f6e7c8', '#e88a3c'];
  const outline = pathOf(smooth(DYE_FIELDS, true));
  const rows = Array.from({ length: 16 }, (_, i) => {
    const y = 68 + i * 4.6;
    const plants = Array.from(
      { length: 22 },
      (_, k) =>
        `<circle cx="${f1(72 + k * 3.8 + (i % 2) * 1.9)}" cy="${f1(y + 2)}" r=".85" fill="${stripes[i % stripes.length]}"/>`,
    ).join('');
    return `<path d="M70 ${y}h90v3.6h-90Z" fill="#7aa64c"/>${plants}`;
  }).join('');
  return `<clipPath id="dye-clip"><path d="${outline}"/></clipPath><g clip-path="url(#dye-clip)" transform="rotate(-8 110 108)"><path d="M60 56h110v100H60Z" fill="#6a9440"/>${rows}</g><path d="${outline}" fill="none" stroke="#5a7e38" stroke-width="1.1"/>`;
}

function terraces(): string {
  const [x, y] = ISLE_SPOTS.observatory;
  const colors = ['#9ec66a', '#acd074', '#bad97e', '#c8e288', '#d4ea94'];
  const rings = [34, 28, 22, 16, 10].map((r, i) => {
    const pts = Array.from({ length: 30 }, (_, k): Point => {
      const a = (k / 30) * Math.PI * 2;
      const wob = 1 + Math.sin(a * 3 + i) * 0.06;
      return [x + Math.cos(a) * r * 1.35 * wob, y + 4 + Math.sin(a) * r * 0.78 * wob];
    });
    const d = pathOf(smooth(pts, true, 3));
    return `<path d="${d}" fill="#5f8a3a" transform="translate(.8 1.6)" opacity=".45"/><path d="${d}" fill="${colors[i]}" stroke="#f0f8cc" stroke-width=".8"/><path d="${d}" fill="none" stroke="#7aa24c" stroke-width=".35" stroke-dasharray="1 1.6" transform="translate(0 2)" opacity=".7"/>`;
  });
  return `<g>${rings.join('')}</g>`;
}

function gardens(rand: () => number): { ground: string; sprites: Sprite[] } {
  const outline = pathOf(smooth(GARDENS, true));
  const beds: string[] = [];
  const colors = ['#f58ab0', '#f8d24a', '#ffffff', '#b47ad8', '#e8603c', '#7ad0f0'];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 8; col++) {
      const bx = 349 + col * 14.5 + (row % 2) * 5;
      const by = 379 + row * 10.5;
      if (!inside(GARDENS, bx + 6, by + 3)) continue;
      if (Math.hypot(bx + 6 - ISLE_SPOTS.glass[0], by + 3 - ISLE_SPOTS.glass[1]) < 16) continue;
      beds.push(
        `<path d="M${bx + 0.6} ${by + 1}h11v5h-11Z" fill="#3f6a2e" opacity=".35"/><path d="M${bx} ${by}h11v5h-11Z" fill="#6aa94e" stroke="#3f6a2e" stroke-width=".45"/><path d="M${bx} ${by}h11v1.2h-11Z" fill="#a8d888" opacity=".7"/>`,
      );
      for (let k = 0; k < 6; k++)
        beds.push(
          `<circle cx="${f1(bx + 1.4 + k * 1.9)}" cy="${f1(by + 1.8 + (k % 2) * 2)}" r=".75" fill="${colors[(row + col + k) % colors.length]}" stroke="#3f6a2e" stroke-width=".15"/>`,
        );
    }
  }
  const paths = `<path d="M346 405h118M405 378v54" stroke="#e8dcb8" stroke-width="2.2" opacity=".9"/>`;
  const sprites: Sprite[] = [
    { y: 394, svg: use('glasshouse', 368, 394, 0.95) },
    { y: 394, svg: use('glasshouse', 444, 394, 0.9) },
    { y: 426, svg: use('dome', 405, 426, 0.9) },
    { y: 398, svg: use('dome', ISLE_SPOTS.glass[0], ISLE_SPOTS.glass[1] - 2, 1.4) },
  ];
  scatter(GARDENS, 12, 9, rand, [
    { x: ISLE_SPOTS.glass[0], y: ISLE_SPOTS.glass[1], r: 18 },
    ...Object.values(CURIOS).map(([x, y]) => ({ x, y, r: 9 })),
  ]).forEach(([x, y], i) => {
    sprites.push({ y, svg: use(i % 3 ? 'bush' : 'tcp', x, y, i % 3 ? 0.75 : 0.6) });
  });
  return {
    ground: `<path d="${outline}" fill="#d2e6a0" stroke="#8cb860" stroke-width=".9"/>${paths}<g>${beds.join('')}</g>`,
    sprites,
  };
}

function town(
  points: readonly Point[],
  count: number,
  roofs: readonly string[],
  rand: () => number,
  keepout: readonly Keepout[] = [],
): Sprite[] {
  return scatter(points, count, 8.5, rand, keepout, onLand).map(([x, y]) => ({
    y,
    svg: use('house', x, y, 0.78 + rand() * 0.24, roofs[Math.floor(rand() * roofs.length)]),
  }));
}

function shadow(x: number, y: number, rx: number, ry = rx * 0.24): string {
  return `<ellipse cx="${f1(x + rx * 0.25)}" cy="${f1(y)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="#173a22" opacity=".3" filter="url(#soft)"/>`;
}

function landmarks(rand: () => number): Sprite[] {
  const s: Sprite[] = [];
  const [hx, hy] = ISLE_SPOTS.harbour;
  // 1 · harbour: a town on the bay, two piers on stilts, a crane and stacked nets
  s.push(
    ...town(
      [
        [hx - 6, hy - 22],
        [hx + 36, hy - 18],
        [hx + 46, hy + 10],
        [hx + 20, hy + 30],
        [hx - 6, hy + 16],
      ],
      11,
      ['#c8553c', '#3a7ab0', '#b0563a', '#7a4a8a'],
      rand,
      [{ x: hx, y: hy, r: 9 }],
    ),
  );
  const pier = (x: number, y: number, dx: number, dy: number, n: number) => {
    const planks = Array.from(
      { length: n },
      (_, i) =>
        `<path d="M${f1(x + dx * i)} ${f1(y + dy * i)}l3.6 2.2-1.6 2.6-3.6-2.2Z" fill="${i % 2 ? '#c49660' : '#b88a52'}" stroke="#6b4a2c" stroke-width=".35"/>`,
    ).join('');
    const posts = Array.from(
      { length: Math.ceil(n / 2) },
      (_, i) =>
        `<path d="M${f1(x + dx * i * 2 - 0.4)} ${f1(y + dy * i * 2 + 2.6)}v2.4" stroke="#5a3e22" stroke-width=".7"/>`,
    ).join('');
    return posts + planks;
  };
  s.push({ y: 372, svg: `${pier(86, 360, -2.6, 0.9, 8)}${pier(90, 378, -2.6, 1.4, 8)}` });
  // 2 · drill yard: rows of tents on a beaten ground
  const [yx, yy] = ISLE_SPOTS.yard;
  const tents: string[] = [];
  for (let row = 0; row < 3; row++)
    for (let col = 0; col < 5; col++)
      tents.push(
        use('tent', yx - 20 + col * 10, yy - 16 + row * 9, 0.8, row === 1 ? '#3a7ab0' : '#c8553c'),
      );
  s.push({
    y: yy - 16,
    svg: `<path d="M${yx - 28} ${yy - 26}h56v36h-56Z" fill="#e2d09c" stroke="#a89466" stroke-width=".7"/><path d="M${yx - 28} ${yy - 26}h56v36h-56Z" fill="#e2d09c" filter="url(#sand-grain)"/><path d="M${yx - 25} ${yy - 21}h50m-50 9h50m-50 9h50" stroke="#c8b47e" stroke-width=".5" stroke-dasharray="1.4 1.6"/>${tents.join('')}`,
  });
  // 3 · dye works: the workshop and three vats
  const [dx, dy] = ISLE_SPOTS.dyes;
  s.push({
    y: dy - 6,
    svg: `${use('house', dx - 14, dy - 8, 1.5, '#b03a66')}${use('house', dx + 14, dy - 10, 1.1, '#7a4ab0')}`,
  });
  s.push({
    y: dy + 14,
    svg: ['#d8483a', '#f0c030', '#3a7ad8']
      .map((c, i) => {
        const vx = dx - 10 + i * 11;
        const vy = dy + 12 + (i % 2) * 3;
        return `${shadow(vx, vy + 3.6, 5)}<ellipse cx="${vx}" cy="${vy + 1.4}" rx="4.6" ry="3.8" fill="#6a4a2e" stroke="${INK}" stroke-width=".5"/><ellipse cx="${vx}" cy="${vy}" rx="4.4" ry="3.2" fill="#8a6440" stroke="${INK}" stroke-width=".5"/><ellipse cx="${vx}" cy="${vy}" rx="3.3" ry="2.3" fill="${c}"/><path d="M${vx - 2} ${vy - 0.6}q1-1 2.4-.8" stroke="#fff" stroke-width=".5" fill="none" opacity=".8"/>`;
      })
      .join(''),
  });
  // 4 · print town on the north shore, with its press house
  const [px, py] = ISLE_SPOTS.press;
  s.push(
    ...town(
      [
        [px - 40, py - 12],
        [px + 26, py - 22],
        [px + 40, py + 8],
        [px - 6, py + 22],
        [px - 44, py + 12],
      ],
      13,
      ['#5d6a7c', '#c8553c', '#8a5230', '#3a7ab0'],
      rand,
      [{ x: px, y: py, r: 9 }],
    ),
  );
  s.push({
    y: py + 4,
    svg: `${use('house', px, py + 2, 1.7, '#4a5668')}<path d="M${px + 5} ${py - 14}h2.6v6h-2.6Z" fill="#8a5a3a" stroke="${INK}" stroke-width=".45"/>`,
  });
  // 5 · the depot: long sheds on the north bay, crates everywhere, a crane
  const [wx, wy] = ISLE_SPOTS.depot;
  s.push({
    y: wy - 6,
    svg: [0, 1]
      .map((k) => {
        const x0 = wx - 30 + k * 26;
        return `${shadow(x0 + 12, wy - 2, 14)}<path d="M${x0} ${wy - 12}h20v9h-20Z" fill="#f0dcae" stroke="${INK}" stroke-width=".55"/><path d="M${x0 + 20} ${wy - 12}l3-2v9l-3 2Z" fill="#c8b080" stroke="${INK}" stroke-width=".5"/><path d="m${x0 - 1.4} ${wy - 12} 4-6h18l2.4 4-2 2Z" fill="#8a5230" stroke="${INK}" stroke-width=".55" stroke-linejoin="round"/><path d="m${x0 + 21} ${wy - 14} -0.8-4" stroke="${INK}" stroke-width=".4"/><path d="M${x0 + 6} ${wy - 3}v-6h8v6Z" fill="#5a3a1e"/><path d="M${x0 + 10} ${wy - 9}v6" stroke="#8a6a3a" stroke-width=".4"/>`;
      })
      .join(''),
  });
  const crates: string[] = [];
  for (let i = 0; i < 16; i++)
    crates.push(
      use('crate', wx - 28 + (i % 8) * 6.4 + (i > 7 ? 3 : 0), wy + 7 + (i > 7 ? -5 : 0), 0.85),
    );
  s.push({ y: wy + 7, svg: crates.join('') });
  s.push({
    y: wy - 14,
    svg: `<g stroke="${INK}" stroke-width=".6"><path d="m${wx + 34} ${wy - 6} 4-16h3l-4 16Z" fill="#b88a52"/><path d="M${wx + 38} ${wy - 20}l14 4" stroke-width="1"/><path d="M${wx + 51} ${wy - 16}v8" stroke-width=".45"/><path d="M${wx + 49} ${wy - 8}h4v3h-4Z" fill="#d2a468"/></g>`,
  });
  // 7 · the lighthouse on its cliff
  const [lx, ly] = ISLE_SPOTS.lighthouse;
  s.push({
    y: ly + 8,
    svg: `${shadow(lx + 4, ly + 8, 16, 3)}<g stroke="${INK}" stroke-width=".7" stroke-linejoin="round"><path d="m${lx - 18} ${ly + 10} 6-10 12-5 14 3 9 9-4 6-30 2Z" fill="#a8b0a6"/><path d="m${lx + 2} ${ly - 2} 12 3 9 9-4 6-14 1Z" fill="#7e877d"/><path d="m${lx - 14} ${ly + 4} 6 2m10-8 3 5m6-2 2 6" stroke="#5e665d" stroke-width=".45"/><path d="m${lx - 4} ${ly + 3} 2.6-26h7l2.6 26Z" fill="#fffaf0"/><path d="m${lx + 3} ${ly - 23}h2.6l2.6 26H${lx + 3}Z" fill="#d9d2c0"/><path d="m${lx - 3.1} ${ly - 5} .9-8h8.4l.9 8Z" fill="#d8483a"/><path d="m${lx - 1.8} ${ly - 17} .6-4h6.4l.6 4Z" fill="#d8483a"/><path d="M${lx - 2} ${ly - 23}h12v-2.4h-12Z" fill="${INK}"/><path d="M${lx + 0.6} ${ly - 25.4}v-5.4h6.8v5.4Z" fill="#ffe890"/><path d="m${lx - 0.6} ${ly - 30.8} 4.6-4.4 4.6 4.4Z" fill="#d8483a"/></g>`,
  });
  // 8 · market town: roofs and striped stalls round a paved square
  const [mx, my] = ISLE_SPOTS.market;
  s.push(
    ...town(MARKET, 16, ['#c8553c', '#e8a04a', '#3a7ab0', '#b03a66', '#4a9a8a'], rand, [
      { x: mx, y: my, r: 16 },
    ]),
  );
  s.push({
    y: my - 12,
    svg: `<circle cx="${mx}" cy="${my + 2}" r="13" fill="#e8dcbc" stroke="#a89466" stroke-width=".7"/><circle cx="${mx}" cy="${my + 2}" r="13" fill="#e8dcbc" filter="url(#sand-grain)"/><path d="M${mx - 12} ${my + 2}h24M${mx} ${my - 11}v26" stroke="#d0c098" stroke-width=".5" stroke-dasharray="2 1.2"/>`,
  });
  [
    [-8, -4, '#d8483a'],
    [6, -6, '#3a7ad8'],
    [-10, 8, '#f0c030'],
    [9, 7, '#3aa85a'],
    [0, 12, '#b03a66'],
  ].forEach(([ox, oy, c]) => {
    s.push({
      y: my + Number(oy),
      svg: use('stall', mx + Number(ox), my + Number(oy), 0.85, String(c)),
    });
  });
  // 10 · observatory on top of the terraces
  const [ox, oy] = ISLE_SPOTS.observatory;
  s.push({
    y: oy + 2,
    svg: `${shadow(ox + 3, oy + 4, 14, 3)}<g stroke="${INK}" stroke-width=".7" stroke-linejoin="round"><path d="M${ox - 9} ${oy + 3}v-8h14v8Z" fill="#f7eed4"/><path d="M${ox + 5} ${oy + 3}v-8l4-2v8Z" fill="#d8c9a6"/><path d="M${ox - 10} ${oy - 5}a10 9 0 0 1 20 0Z" fill="#9aa2b6"/><path d="M${ox} ${oy - 14}a10 9 0 0 1 10 9H${ox}Z" fill="#000" opacity=".16"/><path d="M${ox - 1.6} ${oy - 13.6}l3.2 0 .6 8.6h-4.4Z" fill="#2e3442"/><path d="m${ox + 2} ${oy - 10} 9-7 1.6 1.8-8.6 7.6Z" fill="#c8a24a"/><path d="M${ox - 3} ${oy + 3}v-4.6h4V${oy + 3}Z" fill="#6b4a2c"/><path d="M${ox - 7} ${oy - 3}h2v2h-2Z" fill="#7fb4d8"/></g>`,
  });
  // 11 · the library in its clearing: columns under a green dome
  const [bx, by] = ISLE_SPOTS.library;
  s.push({
    y: by + 6,
    svg: `${shadow(bx + 3, by + 8, 18, 3.4)}<g stroke="${INK}" stroke-width=".7" stroke-linejoin="round"><path d="M${bx - 15} ${by + 7}h30v-3h-30Z" fill="#d8ccb0"/><path d="M${bx - 13} ${by + 4}v-11h26v11Z" fill="#efe6cf"/>${[-10, -5, 0, 5, 10].map((k) => `<path d="M${bx + k - 1} ${by + 4}v-11h2v11Z" fill="#fffaf0" stroke-width=".4"/><path d="M${bx + k + 0.4} ${by + 4}v-11h.6v11Z" fill="#c8bca0" stroke="none"/>`).join('')}<path d="m${bx - 15} ${by - 7} 15-6 15 6Z" fill="#d8c8a0"/><path d="m${bx} ${by - 13} 15 6H${bx}Z" fill="#000" opacity=".12"/><path d="M${bx - 7} ${by - 10}a7 7 0 0 1 14 0Z" fill="#5f9a7a"/><path d="M${bx} ${by - 17}a7 7 0 0 1 7 7H${bx}Z" fill="#000" opacity=".15"/><circle cx="${bx}" cy="${by - 17.6}" r="1.4" fill="#e8c76c"/></g>`,
  });
  // 12 · the Aula Magna: a ring of pillars round the domed hall
  const [ax, ay] = ISLE_SPOTS.aula;
  s.push({
    y: ay - 24,
    svg: `<ellipse cx="${ax + 1}" cy="${ay + 2}" rx="39" ry="26" fill="#5f7a3a" opacity=".35" filter="url(#soft)"/><ellipse cx="${ax}" cy="${ay}" rx="38" ry="25" fill="#ecdfba" stroke="#a89466" stroke-width=".8"/><ellipse cx="${ax}" cy="${ay}" rx="38" ry="25" fill="#ecdfba" filter="url(#sand-grain)"/><ellipse cx="${ax}" cy="${ay}" rx="38" ry="25" fill="none" stroke="#fffaf0" stroke-width="3" stroke-dasharray="2.2 7"/><ellipse cx="${ax}" cy="${ay}" rx="22" ry="14" fill="none" stroke="#c9b98a" stroke-width="1.4"/><ellipse cx="${ax}" cy="${ay}" rx="16" ry="10" fill="none" stroke="#7fe8da" stroke-width=".6" stroke-dasharray="1 2" opacity=".9"/>`,
  });
  Array.from({ length: 10 }, (_, k) => {
    const a = (k / 10) * Math.PI * 2 + 0.3;
    return [ax + Math.cos(a) * 30, ay + Math.sin(a) * 19] as Point;
  }).forEach(([x, y]) => {
    s.push({
      y,
      svg: `${shadow(x + 1, y + 1, 3)}<g stroke="${INK}" stroke-width=".5"><path d="M${f1(x - 1.6)} ${f1(y + 1)}v-7h3.2v7Z" fill="#fffaf0"/><path d="M${f1(x + 0.4)} ${f1(y + 1)}v-7h1.2v7Z" fill="#d6ccb4" stroke="none"/><path d="M${f1(x - 2.4)} ${f1(y - 6)}h4.8l-2.4-2.6Z" fill="#3a7ab0"/></g>`,
    });
  });
  s.push({
    y: ay + 4,
    svg: `${shadow(ax + 3, ay + 6, 15, 3)}<g stroke="${INK}" stroke-width=".7" stroke-linejoin="round"><path d="M${ax - 11} ${ay + 5}v-9h18v9Z" fill="#f7eed4"/><path d="M${ax + 7} ${ay + 5}v-9l4-2v9Z" fill="#d8c9a6"/><path d="M${ax - 8} ${ay - 4}a8 8 0 0 1 16 0Z" fill="#9aa2b6"/><path d="M${ax} ${ay - 12}a8 8 0 0 1 8 8H${ax}Z" fill="#000" opacity=".16"/><path d="M${ax - 2} ${ay + 5}v-5h4v5Z" fill="#6b4a2c"/><path d="M${ax - 8} ${ay - 1}h2v2h-2Zm12 0h2v2h-2Z" fill="#7fb4d8"/><circle cx="${ax}" cy="${ay - 13}" r="1.5" fill="#8cfff0" stroke="#2b8f88" stroke-width=".5"/></g>`,
  });
  return s;
}

/** Off the trail and drawn into the chart: places a curious eye can find. */
function hideouts(): Sprite[] {
  const [cx, cy] = ISLE_SPOTS.cave;
  const [wx, wy] = ISLE_SPOTS.well;
  const [ox, oy] = ISLE_SPOTS.oldLight;
  return [
    {
      y: cy + 6,
      svg: `<g stroke="#3a3558" stroke-width=".7" stroke-linejoin="round"><path d="M${cx - 11} ${cy + 6}q1-12 11-13 10 1 11 13Z" fill="url(#peak-lit)"/><path d="M${cx} ${cy - 7}q10 1 11 13H${cx}Z" fill="url(#peak-shade)" stroke="none"/><path d="M${cx - 5} ${cy + 6}q0-7.4 5-7.8 5 .4 5 7.8Z" fill="#1e1a2c"/><path d="M${cx - 2} ${cy + 2.4}h1m2-1h1" stroke="#fff6c8" stroke-width=".9"/><path d="M${cx - 9} ${cy + 6.4}h18" stroke="#8a8478" stroke-width=".8" stroke-dasharray=".6 1.2"/></g>`,
    },
    {
      y: wy + 3,
      svg: `${shadow(wx + 1, wy + 3, 6, 1.6)}<g stroke="${INK}" stroke-width=".6" stroke-linejoin="round"><ellipse cx="${wx}" cy="${wy + 2}" rx="5.4" ry="2.4" fill="#a8b0a6"/><path d="M${wx - 5.4} ${wy + 2}v1.6a5.4 2.4 0 0 0 10.8 0V${wy + 2}" fill="#7e877d"/><ellipse cx="${wx}" cy="${wy + 1.6}" rx="3.4" ry="1.3" fill="#1f3a4a"/><path d="M${wx - 4.4} ${wy + 1}v-7m8.8 7v-7" stroke-width=".9"/><path d="M${wx - 6} ${wy - 6}l6-3.6 6 3.6Z" fill="#a8643a"/><path d="M${wx} ${wy - 5}v4" stroke-width=".4"/></g>`,
    },
    {
      y: oy + 4,
      svg: `<g stroke="#6a6a6a" stroke-width=".6" stroke-linejoin="round" opacity=".95"><path d="m${ox - 9} ${oy + 4} 4-6 7-2 8 2 3 6Z" fill="#a8a8a2"/><path d="m${ox - 3} ${oy - 2} 1.6-14h5l1.6 14Z" fill="#e2dccc"/><path d="m${ox + 1.6} ${oy - 16}h1.6l1.6 14h-3.2Z" fill="#c4beb0" stroke="none"/><path d="m${ox - 2.2} ${oy - 7} .6-4h4.4l.6 4Z" fill="#9a948a"/><path d="M${ox - 2} ${oy - 16}h7" stroke-width=".9"/><path d="m${ox + 4} ${oy - 18} 2-3 1 3" fill="none"/></g>`,
    },
  ];
}

function curios(): Sprite[] {
  const stroke = `stroke="${INK}" stroke-width=".55" stroke-linejoin="round"`;
  const sprite = (key: keyof typeof CURIOS, draw: (x: number, y: number) => string): Sprite => {
    const [x, y] = CURIOS[key];
    return { y, svg: `${shadow(x + 1, y + 1, 5, 1.4)}<g ${stroke}>${draw(x, y)}</g>` };
  };
  return [
    sprite(
      'balanza',
      (x, y) =>
        `<path d="M${x} ${y}v-8m-6 1h12" fill="none" stroke-width=".8"/><path d="M${x - 6} ${y - 7}l-2.4 4h4.8Zm12 0-2.4 4h4.8Z" fill="#e8c76c"/><path d="M${x - 2} ${y}h4" stroke-width="1.2"/>`,
    ),
    sprite(
      'toldo_viejo',
      (x, y) =>
        `${use('stall', x, y, 1.2, '#7a4ab0')}<path d="M${x - 7} ${y - 6}h14" stroke="#c8a24a" stroke-width="1.6"/>`,
    ),
    sprite(
      'vidriera',
      (x, y) =>
        `<path d="M${x - 4} ${y}v-10a4 4 0 0 1 8 0v10Z" fill="#2a4a5a"/><path d="M${x - 3} ${y - 1}v-4h3v4Zm3 0v-4h3v4Zm-3-4.6v-4h3v4Z" fill="#f0c030" stroke-width=".25"/><path d="M${x} ${y - 5.6}v-4.4a3 3 0 0 1 3 3v1.4Z" fill="#d8483a" stroke-width=".25"/><path d="M${x} ${y - 1}v-4h3v4Z" fill="#3a7ad8" stroke-width=".25"/>`,
    ),
    sprite(
      'esquinas_redondas',
      (x, y) =>
        `<path d="M${x - 7} ${y - 3}h14a2 2 0 0 1 0 3h-14a2 2 0 0 1 0-3Z" fill="#b88a52"/><path d="M${x - 6} ${y}v2.4m12-2.4v2.4" stroke-width="1"/>`,
    ),
    sprite(
      'pixel_de_mentira',
      (x, y) =>
        `<path d="M${x - 4} ${y}v-7h8v7Z" fill="#d8d2c2"/><path d="M${x - 4} ${y - 7}l2-2h8l-2 2Z" fill="#efe9da"/><path d="M${x + 4} ${y}v-7l2-2v7Z" fill="#a8a294"/>`,
    ),
    sprite(
      'cero_del_ch',
      (x, y) =>
        `<ellipse cx="${x}" cy="${y - 5}" rx="4" ry="5.4" fill="#c8c2b4"/><ellipse cx="${x}" cy="${y - 5}" rx="1.8" ry="3.2" fill="#8fbf5c"/>`,
    ),
    sprite(
      'dos_puntos',
      (x, y) =>
        `<circle cx="${x - 3}" cy="${y - 2}" r="2.4" fill="#c8c2b4"/><circle cx="${x + 3}" cy="${y - 2}" r="2.4" fill="#c8c2b4"/><circle cx="${x - 3}" cy="${y - 8}" r="2.4" fill="#c8c2b4"/><circle cx="${x + 3}" cy="${y - 8}" r="2.4" fill="#c8c2b4"/>`,
    ),
    sprite(
      'atril_vacio',
      (x, y) =>
        `<path d="M${x} ${y}v-6" stroke-width="1.1"/><path d="M${x - 5} ${y - 6}l5-2.6 5 2.6-5 2Z" fill="#fffaf0"/><path d="M${x} ${y - 8.6}v4.6" stroke-width=".4"/>`,
    ),
    sprite(
      'piedra_hakon',
      (x, y) =>
        `<path d="M${x - 4} ${y}l1-11 3-2 3 2 1 11Z" fill="#a8a8b4"/><path d="M${x} ${y - 13}l3 2 1 11h-4Z" fill="#000" opacity=".15" stroke="none"/><path d="M${x - 1.6} ${y - 8}h3.2m-3.2 2h3.2m-3.2 2h2" stroke="#5a5a6a" stroke-width=".45"/>`,
    ),
    (() => {
      const [x, y] = CURIOS.kraken;
      const arm = (dx: number, flip: number, h: number) =>
        `<path d="M${x + dx - 1.6} ${y + 2}q${-flip * 2} ${-h * 0.6} ${flip * 1.6} ${-h}q${flip * 2.6} -1.6 ${flip * 1.2} 2q-1.6 .8-.4-1q-1.2 2-2 ${h - 1}Z" fill="#b8507a" stroke="#5a1f3a" stroke-width=".5" stroke-linejoin="round"/><circle cx="${x + dx}" cy="${y + 2 - h * 0.45}" r=".45" fill="#f6d0de"/><circle cx="${x + dx + flip * 0.3}" cy="${y + 2 - h * 0.7}" r=".4" fill="#f6d0de"/>`;
      const rings = `<ellipse cx="${x}" cy="${y + 2.4}" rx="12" ry="3" fill="none" stroke="#e8fbf8" stroke-width=".55" opacity=".85"/><ellipse cx="${x}" cy="${y + 2.4}" rx="16" ry="4.2" fill="none" stroke="#e8fbf8" stroke-width=".4" opacity=".5"/>`;
      return { y, svg: rings + arm(-8, -1, 9) + arm(-2, 1, 12) + arm(5, -1, 8) + arm(10, 1, 6) };
    })(),
    sprite(
      'mesa_maqueta',
      (x, y) =>
        `<path d="M${x - 8} ${y - 6}h16l-2 5h-16Z" fill="#c89a62"/><path d="M${x - 4} ${y - 6}l-2 5m6-5-2 5m6-5-2 5M${x - 9} ${y - 3.5}h16" stroke="#7a5230" stroke-width=".35"/><path d="M${x - 9} ${y - 1}v3m14-3v3" stroke-width=".9"/>`,
    ),
  ];
}

function orchard(): Sprite[] {
  const [x0, y0] = ORCHARD;
  const trees: Sprite[] = [];
  for (let row = 0; row < 4; row++)
    for (let col = 0; col < 6; col++) {
      const x = x0 - 25 + col * 9 + (row % 2) * 4.5;
      const y = y0 - 12 + row * 7;
      trees.push({ y, svg: use(row % 2 ? 'tca' : 'tcc', x, y, 0.55) });
    }
  return trees;
}

function windmill(): Sprite {
  const [x, y] = MILL;
  return {
    y,
    svg: `${shadow(x + 3, y + 1, 7, 1.6)}<g stroke="${INK}" stroke-width=".6" stroke-linejoin="round"><path d="M${x - 3.6} ${y}l1.4-11h4.4l1.4 11Z" fill="#f7eed4"/><path d="M${x + 0.6} ${y - 11}h1.6l1.4 11H${x + 0.6}Z" fill="#d8c9a6" stroke="none"/><path d="M${x - 3} ${y - 11}l3-3.4 3 3.4Z" fill="#a8643a"/><path d="M${x - 1} ${y}v-3h2v3Z" fill="#6b4a2c"/><g transform="translate(${x} ${y - 9})"><path d="M0 0-8-6.4-6.6-7.6 0 0 6.4-8 7.6-6.6 0 0 8 6.4 6.6 7.6 0 0-6.4 8-7.6 6.6Z" fill="#f6f1e6" stroke-width=".5"/><path d="M-7.2-7-4.6-4.4M7-7.2 4.4-4.6M7.2 7 4.6 4.4M-7 7.2-4.4 4.6" stroke="#a89466" stroke-width=".4"/></g><circle cx="${x}" cy="${y - 9}" r=".9" fill="${INK}"/></g>`,
  };
}

function meadow(rand: () => number): Sprite[] {
  const avoid: Keepout[] = [
    ...Object.values(ISLE_SPOTS).map(([x, y]) => ({ x, y, r: 20 })),
    ...Object.values(CURIOS).map(([x, y]) => ({ x, y, r: 9 })),
    ...BRIDGES.flatMap(([a, b]) => [
      { x: a[0], y: a[1], r: 7 },
      { x: b[0], y: b[1], r: 7 },
    ]),
  ];
  const free = (x: number, y: number) =>
    openGround(x, y) &&
    !inside(MARKET, x, y) &&
    !inside(NORTH_PINES, x, y) &&
    Math.hypot(x - ORCHARD[0], y - ORCHARD[1]) > 30 &&
    Math.hypot(x - MILL[0], y - MILL[1]) > 9 &&
    Math.hypot(x - ISLE_SPOTS.observatory[0], (y - ISLE_SPOTS.observatory[1]) * 1.6) > 46 &&
    Math.hypot(x - ISLE_SPOTS.aula[0], (y - ISLE_SPOTS.aula[1]) * 1.5) > 44;
  const sprites: Sprite[] = [];
  scatter(SHEET, 170, 8.5, rand, avoid, free).forEach(([x, y], i) => {
    const kind = i % 6;
    if (kind === 5) sprites.push({ y, svg: use('bush', x, y, 0.8) });
    else if (kind === 4 && (x > 420 || y > 300))
      sprites.push({ y, svg: use('tcp', x, y, 0.66 + rand() * 0.2) });
    else
      sprites.push({
        y,
        svg: use(itemAt(['tca', 'tcb', 'tcc'], kind % 3), x, y, 0.66 + rand() * 0.26),
      });
  });
  return sprites;
}

/** Wooden bridges where the trail crosses; the longest crossings are stepping stones instead. */
function bridges(): Sprite[] {
  return BRIDGES.map(([a, b]) => {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy);
    const [ux, uy] = [dx / len, dy / len];
    const [nx, ny] = [-uy, ux];
    if (len > 62) {
      const stones = Array.from({ length: Math.floor(len / 5.2) }, (_, i) => {
        const t = (i + 0.5) * 5.2;
        const x = a[0] + ux * t + nx * Math.sin(i * 1.7) * 1.2;
        const y = a[1] + uy * t + ny * Math.sin(i * 1.7) * 1.2;
        return `<ellipse cx="${f1(x + 0.5)}" cy="${f1(y + 0.9)}" rx="2.3" ry="1.5" fill="#2c5f78" opacity=".35"/><ellipse cx="${f1(x)}" cy="${f1(y)}" rx="2.2" ry="1.5" fill="#c8c2b2" stroke="#5a564c" stroke-width=".4"/><path d="M${f1(x - 1.2)} ${f1(y - 0.5)}q1-.7 2 0" stroke="#fff" stroke-width=".4" fill="none" opacity=".7"/>`;
      }).join('');
      return { y: Math.min(a[1], b[1]), svg: stones };
    }
    const w = 2.4;
    const corner = (p: Point, side: number): string =>
      `${f1(p[0] + nx * w * side)} ${f1(p[1] + ny * w * side)}`;
    const planks = Array.from({ length: Math.floor(len / 1.6) }, (_, i) => {
      const t = i * 1.6;
      const [x, y] = [a[0] + ux * t, a[1] + uy * t];
      return `M${f1(x + nx * w)} ${f1(y + ny * w)}L${f1(x - nx * w)} ${f1(y - ny * w)}`;
    }).join('');
    const posts = [0.12, 0.5, 0.88]
      .flatMap((t) =>
        [1, -1].map((side) => {
          const [x, y] = [
            a[0] + dx * t + nx * (w + 0.4) * side,
            a[1] + dy * t + ny * (w + 0.4) * side,
          ];
          return `<circle cx="${f1(x)}" cy="${f1(y)}" r=".7" fill="#5a3e22"/>`;
        }),
      )
      .join('');
    return {
      y: Math.min(a[1], b[1]),
      svg:
        `<path d="M${corner(a, 1)}L${corner(b, 1)}L${corner(b, -1)}L${corner(a, -1)}Z" fill="#173a22" opacity=".3" transform="translate(1 1.6)" filter="url(#soft)"/>` +
        `<path d="M${corner(a, 1)}L${corner(b, 1)}L${corner(b, -1)}L${corner(a, -1)}Z" fill="#c49660" stroke="${INK}" stroke-width=".5" stroke-linejoin="round"/>` +
        `<path d="${planks}" stroke="#7a5230" stroke-width=".35"/>` +
        `<path d="M${corner(a, 1.25)}L${corner(b, 1.25)}M${corner(a, -1.25)}L${corner(b, -1.25)}" stroke="#5a3e22" stroke-width=".55"/>${posts}`,
    };
  });
}

function water(rand: () => number): string {
  const rivers = RIVERS.map(({ points, width, fall }) => {
    const course = roughen(smooth(points, false, 6), width * 0.18, rand, false);
    const d = pathOf(course, false);
    const fallArt = fall
      ? `<g><ellipse cx="${f1(fall[0])}" cy="${f1(fall[1] + 2)}" rx="${f1(width * 1.2)}" ry="${f1(width * 0.55)}" fill="#e8fbff" opacity=".9"/><path d="M${f1(fall[0] - width * 0.5)} ${f1(fall[1] - 4)}v5m${f1(width * 0.5)}-6v6m${f1(width * 0.5)}-5v5" stroke="#ffffff" stroke-width=".6" stroke-linecap="round"/><circle cx="${f1(fall[0] - width)}" cy="${f1(fall[1] + 2.4)}" r=".7" fill="#fff"/><circle cx="${f1(fall[0] + width)}" cy="${f1(fall[1] + 2)}" r=".6" fill="#fff"/></g>`
      : '';
    return (
      `<path d="${d}" fill="none" stroke="#2c5f78" stroke-width="${width + 1.8}" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/>` +
      `<path d="${d}" fill="none" stroke="#e8d8a8" stroke-width="${width + 0.8}" stroke-linecap="round" stroke-linejoin="round" opacity=".5"/>` +
      `<path d="${d}" fill="none" stroke="url(#river)" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<path d="${d}" fill="none" stroke="#d6f6fb" stroke-width="${f1(width * 0.28)}" stroke-linecap="round" stroke-dasharray="${f1(width * 1.4)} ${f1(width * 2.2)}" opacity=".85"/>` +
      `<path d="${d}" fill="none" stroke="#3a8aaa" stroke-width="${f1(width * 0.22)}" stroke-dasharray="${f1(width * 0.8)} ${f1(width * 3.4)}" stroke-dashoffset="${f1(width * 2)}" opacity=".55"/>` +
      fallArt
    );
  }).join('');
  const canal = pathOf(CANAL, false);
  const locks = CANAL.slice(1, -1)
    .map(
      ([x, y]) =>
        `<circle cx="${x}" cy="${y}" r="2.6" fill="#d4c094" stroke="${INK}" stroke-width=".45"/><path d="M${x - 1.6} ${y}h3.2" stroke="#6b4a2c" stroke-width=".6"/>`,
    )
    .join('');
  return `${rivers}<path d="${canal}" fill="none" stroke="#6a5a3e" stroke-width="6.6" stroke-linejoin="round"/><path d="${canal}" fill="none" stroke="#b8a678" stroke-width="5.4" stroke-linejoin="round"/><path d="${canal}" fill="none" stroke="url(#river)" stroke-width="3.8" stroke-linejoin="round"/><path d="${canal}" fill="none" stroke="#d6f6fb" stroke-width=".9" stroke-dasharray="4 6" opacity=".85"/>${locks}`;
}

function frame(): string {
  return (
    `<rect x="9" y="9" width="642" height="436" fill="none" stroke="#17405a" stroke-width="1.1" opacity=".85"/>` +
    `<rect x="12.5" y="12.5" width="635" height="429" fill="none" stroke="#17405a" stroke-width=".5" opacity=".6"/>` +
    `<g stroke="#17405a" stroke-width=".5" opacity=".6">${Array.from({ length: 31 }, (_, i) => {
      const x = 30 + i * 20;
      const h = i % 5 === 0 ? 3.2 : 1.5;
      return `<path d="M${x} 9v${h}M${x} 445v-${h}"/>`;
    }).join('')}${Array.from({ length: 21 }, (_, i) => {
      const y = 27 + i * 20;
      const h = i % 5 === 0 ? 3.2 : 1.5;
      return `<path d="M9 ${y}h${h}M651 ${y}h-${h}"/>`;
    }).join('')}</g>` +
    `<g font-family="Georgia, 'Times New Roman', serif" fill="#12384f"><text x="490" y="430" font-size="7" letter-spacing="1.4">ISLA DEL APRENDIZ</text><path d="M490 434h96m3 0h6" stroke="#12384f" stroke-width=".7" opacity=".7"/><text x="490" y="441" font-size="4.4" letter-spacing=".9" opacity=".8">CARTA DE PRIMERAS RUNAS</text></g>`
  );
}

/** The whole chart as one SVG document. Same seed, same isle. */
export function isleChart(): string {
  const rand = seeded(1994);
  const isletOutlines = ISLETS.map(({ at: [x, y], rx, ry }) =>
    roughen(
      Array.from({ length: 18 }, (_, k): Point => {
        const a = (k / 18) * Math.PI * 2;
        return [x + Math.cos(a) * rx, y + Math.sin(a) * ry];
      }),
      0.6,
      rand,
    ),
  );
  const islands = Object.values(OUTLINES);
  const landPaths = islands.map((poly) => pathOf(poly)).join('');
  const shores = [...islands, ...isletOutlines].map((poly) => pathOf(poly)).join('');
  const ringPoints = roughen(smooth(RING, true, 5), 2, rand);
  const ring = pathOf(ringPoints);
  const lagoonShape = shrink(ringPoints, 20);
  const wood = woods(rand);
  const garden = gardens(rand);
  const sprites: Sprite[] = [
    ...peaks(rand),
    ...wood.sprites,
    ...garden.sprites,
    ...landmarks(rand),
    ...hideouts(),
    ...orchard(),
    windmill(),
    ...curios(),
    ...meadow(rand),
  ];
  sprites.sort((a, b) => a.y - b.y);
  const palm = ISLE_SPOTS.palm;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SHEET_WIDTH} ${SHEET_HEIGHT}" width="${SHEET_WIDTH}" height="${SHEET_HEIGHT}" preserveAspectRatio="none">` +
    `<defs>${DEFS}<clipPath id="land">${islands.map((poly) => `<path d="${pathOf(poly)}"/>`).join('')}</clipPath></defs>` +
    // open sea, then the atoll and its lagoon
    `<rect width="${SHEET_WIDTH}" height="${SHEET_HEIGHT}" fill="url(#sea)"/>` +
    `<rect width="${SHEET_WIDTH}" height="${SHEET_HEIGHT}" fill="#fff" filter="url(#sea-grain)" opacity=".35"/>` +
    seaMarks(rand, shrink(ringPoints, -54)) +
    atoll(ring, lagoonShape, rand) +
    shallows(shores) +
    beach(shores, [...islands.flat(), ...isletOutlines.flat()], rand) +
    // the islands
    islands.map((poly) => `<path d="${pathOf(poly)}" fill="url(#meadow)"/>`).join('') +
    isletOutlines.map((poly) => `<path d="${pathOf(poly)}" fill="#aed476"/>`).join('') +
    `<g clip-path="url(#land)">` +
    `<rect width="${SHEET_WIDTH}" height="${SHEET_HEIGHT}" fill="#000" filter="url(#mottle)" opacity=".75"/>` +
    `<rect width="${SHEET_WIDTH}" height="${SHEET_HEIGHT}" fill="#000" filter="url(#mottle-light)" opacity=".6"/>` +
    heightLines() +
    wood.ground +
    fields(rand) +
    dyeFields() +
    terraces() +
    garden.ground +
    `<path d="${pathOf(MARKET)}" fill="#e4d6ae" opacity=".6" filter="url(#soft)"/>` +
    grassTufts(rand) +
    folds(rand) +
    sparkles(rand) +
    water(rand) +
    `<rect width="${SHEET_WIDTH}" height="${SHEET_HEIGHT}" fill="#000" filter="url(#grain)" opacity=".7"/>` +
    `</g>` +
    `<path d="${landPaths}" fill="none" stroke="#5f8a3a" stroke-width=".7" opacity=".8"/>` +
    bridges()
      .map((bridge) => bridge.svg)
      .join('') +
    use('tcc', palm[0], palm[1] + 2, 0.62) +
    sprites.map((sprite) => sprite.svg).join('') +
    // the parchment it is all drawn on
    `<rect width="${SHEET_WIDTH}" height="${SHEET_HEIGHT}" fill="#000" filter="url(#paper)" opacity=".32"/>` +
    `<rect width="${SHEET_WIDTH}" height="${SHEET_HEIGHT}" fill="#000" filter="url(#fibres)" opacity=".22"/>` +
    `<rect width="${SHEET_WIDTH}" height="${SHEET_HEIGHT}" fill="#fff" filter="url(#grain-light)" opacity=".18"/>` +
    `<rect width="${SHEET_WIDTH}" height="${SHEET_HEIGHT}" fill="url(#vignette)"/>` +
    frame() +
    `</svg>`
  );
}
