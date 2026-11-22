/** Portraits of the isle's teachers. Their ids follow the region index, like every other portrait. */
import type { DrawOp, SymbolArt } from './symbols';

const INK = '#2a1d14';

const eyes = (y: number, r = 1.7): DrawOp[] => [
  { t: 'circle', cx: 27, cy: y, r, paint: { fill: INK } },
  { t: 'circle', cx: 37, cy: y, r, paint: { fill: INK } },
];
const cheeks = (color = '#ff9a8a'): DrawOp[] => [
  { t: 'circle', cx: 24.5, cy: 36.5, r: 2.4, paint: { fill: color, opacity: 0.6 } },
  { t: 'circle', cx: 39.5, cy: 36.5, r: 2.4, paint: { fill: color, opacity: 0.6 } },
];
const smile = (d = 'M28 38q4 3 8 0', width = 1.7): DrawOp => ({ t: 'path', d, paint: { fill: 'none', stroke: INK, strokeWidth: width, lineCap: 'round' } });

function portrait(index: number, sky: string, clothes: string, skin: string, ops: readonly DrawOp[]): SymbolArt {
  return {
    id: `pj-${index}`, x: 0, y: 0, w: 64, h: 64,
    ops: [
      { t: 'circle', cx: 32, cy: 32, r: 31, paint: { fill: sky } },
      { t: 'path', d: 'M9 64c2-12 11-18 23-18s21 6 23 18z', paint: { fill: clothes } },
      { t: 'circle', cx: 32, cy: 32, r: 13, paint: { fill: skin } },
      ...ops,
    ],
  };
}

/** `first` is the index of the isle's first region in the catalog. */
export function isleSymbols(first: number): readonly SymbolArt[] {
  return [
    // Maese Cálamo, the old scribe
    portrait(first, '#6f9fc4', '#7a5a3a', '#f0c49a', [
      { t: 'path', d: 'M26 46l6 7 6-7', paint: { fill: '#e8dcc0' } },
      { t: 'path', d: 'M19 31c-2-6 0-11 3-13M45 31c2-6 0-11-3-13', paint: { fill: 'none', stroke: '#f4f2ec', strokeWidth: 4, lineCap: 'round' } },
      { t: 'path', d: 'M20 36c0 10 5 17 12 17s12-7 12-17c-3 3-7 4-12 4s-9-1-12-4z', paint: { fill: '#f4f2ec', stroke: INK, strokeWidth: 1.2 } },
      { t: 'circle', cx: 27, cy: 31, r: 3.2, paint: { fill: 'none', stroke: INK, strokeWidth: 1.3 } },
      { t: 'circle', cx: 37, cy: 31, r: 3.2, paint: { fill: 'none', stroke: INK, strokeWidth: 1.3 } },
      { t: 'path', d: 'M30.2 31h3.6', paint: { stroke: INK, strokeWidth: 1.3 } },
      ...eyes(31, 1.3),
      { t: 'path', d: 'M29 42q3 2 6 0', paint: { fill: 'none', stroke: '#a86a4a', strokeWidth: 1.4, lineCap: 'round' } },
      { t: 'path', d: 'M46 23l8-15c2 6 0 12-5 16z', paint: { fill: '#f6f1e6', stroke: INK, strokeWidth: 1.2, lineJoin: 'round' } },
      { t: 'path', d: 'M47 23l6-12', paint: { stroke: INK, strokeWidth: 0.8 } },
    ]),
    // Hilera, the drill sergeant
    portrait(first + 1, '#8fbf5a', '#b03a30', '#e8b48c', [
      { t: 'path', d: 'M12 53h10M42 53h10', paint: { stroke: '#f2d27a', strokeWidth: 3, lineCap: 'round' } },
      { t: 'circle', cx: 32, cy: 53, r: 1.7, paint: { fill: '#f2d27a' } },
      { t: 'circle', cx: 32, cy: 59.5, r: 1.7, paint: { fill: '#f2d27a' } },
      { t: 'path', d: 'M17 27c0-9 7-15 15-15s15 6 15 15z', paint: { fill: '#2f4a7a', stroke: '#1a2238', strokeWidth: 1.6 } },
      { t: 'path', d: 'M14 27h36', paint: { stroke: '#1a2238', strokeWidth: 3.2, lineCap: 'round' } },
      { t: 'path', d: 'M32 12c2-6 8-8 12-6-4 1-7 4-8 8z', paint: { fill: '#f2d27a', stroke: '#7a5a26', strokeWidth: 1 } },
      { t: 'path', d: 'M24 30l5 1.6M40 30l-5 1.6', paint: { stroke: INK, strokeWidth: 1.8, lineCap: 'round' } },
      ...eyes(33.6, 1.6),
      ...cheeks('#f07a6a'),
      { t: 'ellipse', cx: 32, cy: 40, rx: 3.6, ry: 2.8, paint: { fill: '#5a1a1a', stroke: INK, strokeWidth: 1 } },
    ]),
    // Bermellón, the master dyer
    portrait(first + 2, '#e8a04a', '#f1e6cc', '#f0c49a', [
      { t: 'circle', cx: 22, cy: 56, r: 2.6, paint: { fill: '#d8483a' } },
      { t: 'circle', cx: 41, cy: 58, r: 2.1, paint: { fill: '#3a7ad8' } },
      { t: 'circle', cx: 31, cy: 60, r: 1.9, paint: { fill: '#3aa85a' } },
      { t: 'path', d: 'M19 28c-1 4 0 8 1 10M45 28c1 4 0 8-1 10', paint: { fill: 'none', stroke: '#3a2a1a', strokeWidth: 3.5, lineCap: 'round' } },
      { t: 'path', d: 'M15 25c2-9 10-13 19-12s14 6 13 12c-8 3-24 3-32 0z', paint: { fill: '#b83a2e', stroke: '#5a1a14', strokeWidth: 1.6 } },
      { t: 'path', d: 'M33 13v-3.4', paint: { stroke: '#5a1a14', strokeWidth: 2, lineCap: 'round' } },
      ...eyes(32),
      ...cheeks(),
      { t: 'path', d: 'M32 37c-3-2-7-1-9 2 3 1 6 1 9-1 3 2 6 2 9 1-2-3-6-4-9-2z', paint: { fill: '#3a2a1a' } },
      smile('M29 41.5q3 2 6 0', 1.4),
    ]),
    // Doña Serifa, the printer
    portrait(first + 3, '#b9a0d8', '#3a3048', '#f2ccae', [
      { t: 'path', d: 'M25 46h14l-2 6.5h-10z', paint: { fill: '#f4f2ec' } },
      { t: 'circle', cx: 32, cy: 50, r: 1.8, paint: { fill: '#f2d27a' } },
      { t: 'circle', cx: 32, cy: 11.5, r: 5.2, paint: { fill: '#c8c8d0', stroke: '#5a5a68', strokeWidth: 1.4 } },
      { t: 'path', d: 'M18 31c0-10 6-17 14-17s14 7 14 17c-3-6-8-9-14-9s-11 3-14 9z', paint: { fill: '#c8c8d0', stroke: '#5a5a68', strokeWidth: 1.4 } },
      { t: 'circle', cx: 27.5, cy: 32, r: 3, paint: { fill: 'none', stroke: INK, strokeWidth: 1.2 } },
      { t: 'circle', cx: 36.5, cy: 32, r: 3, paint: { fill: 'none', stroke: INK, strokeWidth: 1.2 } },
      { t: 'path', d: 'M30.5 32h3', paint: { stroke: INK, strokeWidth: 1.2 } },
      { t: 'path', d: 'M39.5 32c4 2 5 8 4 14', paint: { fill: 'none', stroke: '#f2d27a', strokeWidth: 1 } },
      { t: 'circle', cx: 27.5, cy: 32, r: 1.3, paint: { fill: INK } },
      { t: 'circle', cx: 36.5, cy: 32, r: 1.3, paint: { fill: INK } },
      ...cheeks('#f0a0a0'),
      smile('M29 39.5q3 1.6 6 0', 1.5),
    ]),
    // Tara, the stevedore
    portrait(first + 4, '#4fa8a0', '#c88a4a', '#c8875a', [
      { t: 'path', d: 'M22 47l4 17M42 47l-4 17', paint: { stroke: '#7a4a22', strokeWidth: 3 } },
      { t: 'path', d: 'M18 28c1-9 7-14 14-14s13 5 14 14c-9-3-19-3-28 0z', paint: { fill: '#d8483a', stroke: '#5a1a14', strokeWidth: 1.6 } },
      { t: 'path', d: 'M45 27l6-3-1 6z', paint: { fill: '#d8483a', stroke: '#5a1a14', strokeWidth: 1.2, lineJoin: 'round' } },
      { t: 'circle', cx: 26, cy: 21, r: 1.2, paint: { fill: '#f4f2ec' } },
      { t: 'circle', cx: 34, cy: 18, r: 1.2, paint: { fill: '#f4f2ec' } },
      { t: 'circle', cx: 40, cy: 23, r: 1.2, paint: { fill: '#f4f2ec' } },
      ...eyes(33, 1.8),
      { t: 'circle', cx: 24, cy: 36.5, r: 0.7, paint: { fill: '#7a4a22' } },
      { t: 'circle', cx: 26, cy: 38, r: 0.7, paint: { fill: '#7a4a22' } },
      { t: 'circle', cx: 38, cy: 38, r: 0.7, paint: { fill: '#7a4a22' } },
      { t: 'circle', cx: 40, cy: 36.5, r: 0.7, paint: { fill: '#7a4a22' } },
      smile('M27 38.5q5 4 10 0', 1.8),
    ]),
    // Remo, the boatman
    portrait(first + 5, '#8ac8e8', '#3a6a8a', '#e8b890', [
      { t: 'path', d: 'M15 56h34M12.5 61h39', paint: { stroke: '#e8f0f4', strokeWidth: 1.6, opacity: 0.7 } },
      { t: 'path', d: 'M21 37c2 8 6 11 11 11s9-3 11-11c-3 3-7 4-11 4s-8-1-11-4z', paint: { fill: '#8a6a4a', opacity: 0.5 } },
      { t: 'ellipse', cx: 32, cy: 23, rx: 22, ry: 5.5, paint: { fill: '#e8c76c', stroke: '#7a5a26', strokeWidth: 1.6 } },
      { t: 'path', d: 'M21 23q11-15 22 0z', paint: { fill: '#dcb653', stroke: '#7a5a26', strokeWidth: 1.6 } },
      { t: 'path', d: 'M21.5 21.5h21', paint: { stroke: '#3a6a8a', strokeWidth: 3 } },
      { t: 'path', d: 'M25 32.6q2-1.6 4 0M35 32.6q2-1.6 4 0', paint: { fill: 'none', stroke: INK, strokeWidth: 1.6, lineCap: 'round' } },
      ...cheeks(),
      smile('M29 39q3 2 6 0', 1.5),
      { t: 'path', d: 'M35 39.4l9 4', paint: { stroke: '#dcb653', strokeWidth: 1.6, lineCap: 'round' } },
    ]),
    // Fanal, the lighthouse keeper
    portrait(first + 6, '#2f4a7a', '#f2c230', '#f0c49a', [
      { t: 'circle', cx: 12, cy: 15, r: 1, paint: { fill: '#fff6c8' } },
      { t: 'circle', cx: 52, cy: 19, r: 1.2, paint: { fill: '#fff6c8' } },
      { t: 'circle', cx: 47, cy: 8, r: 0.8, paint: { fill: '#fff6c8' } },
      { t: 'path', d: 'M32 48v16', paint: { stroke: '#a87a10', strokeWidth: 1.6 } },
      { t: 'path', d: 'M22 28q10-7 20 0', paint: { fill: 'none', stroke: '#7a3a1a', strokeWidth: 3.2, lineCap: 'round' } },
      { t: 'path', d: 'M15 31c0-11 7-19 17-19s17 8 17 19c-4-5-10-8-17-8s-13 3-17 8z', paint: { fill: '#f2c230', stroke: '#a87a10', strokeWidth: 1.6 } },
      { t: 'path', d: 'M12.5 31c6-3 12.5-4 19.5-4s13.5 1 19.5 4', paint: { fill: 'none', stroke: '#a87a10', strokeWidth: 2.4, lineCap: 'round' } },
      ...eyes(34),
      ...cheeks(),
      smile('M28 39.5q4 3 8 0'),
      { t: 'circle', cx: 52, cy: 46, r: 7.5, paint: { fill: '#ffe890', opacity: 0.35 } },
      { t: 'rect', x: 49.5, y: 42.5, w: 5, h: 7, rx: 1, paint: { fill: '#ffd25a', stroke: '#7a5a10', strokeWidth: 1 } },
      { t: 'path', d: 'M50 42.5q2-4 4 0', paint: { fill: 'none', stroke: '#7a5a10', strokeWidth: 1 } },
    ]),
    // Maestra Rúbrica, the examiner
    portrait(first + 7, '#8a3a4a', '#1e1e2a', '#e8bc98', [
      { t: 'path', d: 'M26 46l6 8 6-8', paint: { fill: '#f4f2ec' } },
      { t: 'path', d: 'M19 33c-1-8 4-15 13-15s14 7 13 15c-2-5-6-8-13-8s-11 3-13 8z', paint: { fill: '#5a3a2a' } },
      { t: 'path', d: 'M22 20v5c6 3 14 3 20 0v-5', paint: { fill: '#2a2a3a', stroke: '#0a0a12', strokeWidth: 1.2 } },
      { t: 'path', d: 'M12 17l20-7 20 7-20 7z', paint: { fill: '#1e1e2a', stroke: '#0a0a12', strokeWidth: 1.4, lineJoin: 'round' } },
      { t: 'path', d: 'M52 17v8', paint: { stroke: '#f2d27a', strokeWidth: 1.6 } },
      { t: 'circle', cx: 52, cy: 26.5, r: 1.9, paint: { fill: '#f2d27a' } },
      { t: 'rect', x: 23.5, y: 29.5, w: 7, h: 5.2, rx: 1.5, paint: { fill: 'none', stroke: INK, strokeWidth: 1.2 } },
      { t: 'rect', x: 33.5, y: 29.5, w: 7, h: 5.2, rx: 1.5, paint: { fill: 'none', stroke: INK, strokeWidth: 1.2 } },
      { t: 'path', d: 'M30.5 32h3', paint: { stroke: INK, strokeWidth: 1.2 } },
      ...eyes(32.2, 1.3),
      ...cheeks('#f09a8a'),
      smile('M28.5 39.5q3.5 2 7 0', 1.6),
    ]),
  ];
}
