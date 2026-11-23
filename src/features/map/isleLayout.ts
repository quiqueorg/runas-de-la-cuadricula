/**
 * Where things stand on the apprentice's isle, in the shared sheet (`sheet.ts`).
 * The isle is an atoll: each area is its own island in a ring round a lagoon, joined by bridges,
 * with the library and the Aula Magna on islands inside the lagoon.
 * The painted chart (scripts/isle-chart.ts → assets/mapa-isla.jpg) and the moving bits on top of it
 * (landscape/Isle.tsx) both read from here. scenery.json and the regions' `x`, `y` and `path` in
 * src/core/data/isle.ts hold the same spots divided by the sheet's size.
 */
import type { SheetPoint } from './sheet';

/** Region landmarks (they match `baseRegions`) and the secrets drawn on the chart. */
export const ISLE_SPOTS = {
  harbour: [108, 358],
  yard: [70, 236],
  dyes: [134, 104],
  press: [262, 62],
  depot: [414, 58],
  canal: [552, 112],
  lighthouse: [618, 232],
  market: [540, 364],
  glass: [405, 402],
  observatory: [258, 398],
  library: [208, 258],
  aula: [360, 232],
  cave: [576, 262],
  well: [180, 290],
  oldLight: [172, 24],
  palm: [292, 330],
  twins: [630, 410],
  // under the lagoon
  sunken: [480, 250],
  wreck: [148, 190],
} as const satisfies Record<string, SheetPoint>;

/** Curiosities: small things painted on the chart that tell why CSS is the way it is (inhabitants.json). */
export const CURIOS = {
  balanza: [515, 352],
  toldo_viejo: [568, 386],
  vidriera: [372, 414],
  esquinas_redondas: [440, 414],
  pixel_de_mentira: [290, 414],
  cero_del_ch: [226, 416],
  dos_puntos: [176, 246],
  atril_vacio: [238, 282],
  piedra_hakon: [402, 254],
  mesa_maqueta: [318, 252],
  kraken: [462, 140],
  campana: [296, 172],
} as const satisfies Record<string, SheetPoint>;

export interface Island {
  readonly name: string;
  readonly at: SheetPoint;
  readonly radiusX: number;
  readonly radiusY: number;
  /** Bays bite into the outline: [angle in radians, depth as a fraction of the radius, width in radians]. */
  readonly bays?: readonly (readonly [number, number, number])[];
}

/** In trail order round the ring, then the two islands inside the lagoon. */
export const ISLANDS: readonly Island[] = [
  { name: 'muelle', at: [105, 372], radiusX: 58, radiusY: 40, bays: [[Math.PI, 0.62, 0.5]] },
  { name: 'poniente', at: [70, 240], radiusX: 34, radiusY: 62 },
  { name: 'tintas', at: [135, 108], radiusX: 54, radiusY: 36 },
  { name: 'norte', at: [338, 62], radiusX: 132, radiusY: 32, bays: [[-Math.PI / 2, 0.45, 0.3]] },
  { name: 'canal', at: [555, 118], radiusX: 54, radiusY: 44 },
  { name: 'faro', at: [590, 240], radiusX: 44, radiusY: 60 },
  { name: 'mercado', at: [540, 368], radiusX: 58, radiusY: 38 },
  { name: 'invernaderos', at: [405, 404], radiusX: 62, radiusY: 30 },
  { name: 'observatorio', at: [258, 402], radiusX: 52, radiusY: 32 },
  { name: 'biblioteca', at: [205, 262], radiusX: 52, radiusY: 42 },
  { name: 'aula', at: [360, 232], radiusX: 56, radiusY: 44 },
];

/** Bridges between consecutive islands; the trail crosses on them (the regions' `ruta`). */
export const BRIDGES: readonly (readonly [SheetPoint, SheetPoint])[] = [
  [
    [86, 340],
    [80, 294],
  ],
  [
    [80, 184],
    [108, 140],
  ],
  [
    [182, 100],
    [218, 78],
  ],
  [
    [466, 72],
    [510, 94],
  ],
  [
    [580, 158],
    [586, 188],
  ],
  [
    [582, 294],
    [566, 336],
  ],
  [
    [488, 384],
    [460, 398],
  ],
  [
    [348, 404],
    [304, 404],
  ],
  [
    [246, 374],
    [222, 298],
  ],
  [
    [254, 254],
    [308, 240],
  ],
];
