/** Original map figures, replayed with Path2D. Motion stays in the CSS that used to target the SVG. */
import { useEffect, useRef, type CSSProperties } from 'react';
import { paintMarkCanvas, type Ink, type Mark } from './paint';

interface Frame {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

function ink(fill: string | null, stroke: string | null, width: number, cap: CanvasLineCap = 'butt', join: CanvasLineJoin = 'miter'): Ink {
  return { fill, stroke, width, cap, join };
}

function boundsOf(d: string, pad: number): Frame {
  const parts = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e[-+]?\d+)?/g) ?? [];
  let index = 0;
  let cx = 0;
  let cy = 0;
  let sx = 0;
  let sy = 0;
  let command = '';
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const add = (x: number, y: number) => {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  };
  const sample = (x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, cubic: boolean) => {
    for (let step = 0; step <= 16; step += 1) {
      const t = step / 16;
      const u = 1 - t;
      const x = cubic
        ? u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3
        : u * u * x0 + 2 * u * t * x1 + t * t * x2;
      const y = cubic
        ? u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3
        : u * u * y0 + 2 * u * t * y1 + t * t * y2;
      add(x, y);
    }
  };
  while (index < parts.length) {
    const token = parts[index] ?? '';
    if (/[a-zA-Z]/.test(token)) {
      command = token;
      index += 1;
      if (command === 'Z' || command === 'z') { cx = sx; cy = sy; }
      continue;
    }
    const relative = command === command.toLowerCase();
    const read = () => Number(parts[index++] ?? 0);
    if (command === 'M' || command === 'm' || command === 'L' || command === 'l') {
      const x = read();
      const y = read();
      cx = relative ? cx + x : x;
      cy = relative ? cy + y : y;
      if (command === 'M' || command === 'm') { sx = cx; sy = cy; command = relative ? 'l' : 'L'; }
      add(cx, cy);
    } else if (command === 'H' || command === 'h') {
      const x = read();
      cx = relative ? cx + x : x;
      add(cx, cy);
    } else if (command === 'V' || command === 'v') {
      const y = read();
      cy = relative ? cy + y : y;
      add(cx, cy);
    } else if (command === 'C' || command === 'c') {
      const x1 = read();
      const y1 = read();
      const x2 = read();
      const y2 = read();
      const x = read();
      const y = read();
      const ax = relative ? cx + x : x;
      const ay = relative ? cy + y : y;
      sample(cx, cy, relative ? cx + x1 : x1, relative ? cy + y1 : y1, relative ? cx + x2 : x2, relative ? cy + y2 : y2, ax, ay, true);
      cx = ax;
      cy = ay;
    } else if (command === 'Q' || command === 'q') {
      const x1 = read();
      const y1 = read();
      const x = read();
      const y = read();
      const ax = relative ? cx + x : x;
      const ay = relative ? cy + y : y;
      sample(cx, cy, relative ? cx + x1 : x1, relative ? cy + y1 : y1, ax, ay, ax, ay, false);
      cx = ax;
      cy = ay;
    } else index += 1;
  }
  if (!Number.isFinite(minX)) return { x: 0, y: 0, w: 1, h: 1 };
  return { x: minX - pad, y: minY - pad, w: Math.max(0.1, maxX - minX + pad * 2), h: Math.max(0.1, maxY - minY + pad * 2) };
}

function MarkCanvas({ frame, marks, className, style }: { readonly frame: Frame; readonly marks: readonly Mark[]; readonly className?: string; readonly style?: CSSProperties }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const paint = () => paintMarkCanvas(canvas, frame, marks);
    paint();
    const observer = new ResizeObserver(paint);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [frame, marks]);
  return <canvas ref={canvasRef} className={className} style={style} aria-hidden="true" />;
}

function place(part: Frame, whole: Frame): CSSProperties {
  return {
    left: `${((part.x - whole.x) / whole.w) * 100}%`,
    top: `${((part.y - whole.y) / whole.h) * 100}%`,
    width: `${(part.w / whole.w) * 100}%`,
    height: `${(part.h / whole.h) * 100}%`,
  };
}

const GRIFFIN_WING = 'M22 18c-6-14-2-20 6-22-1 8 3 12 10 14z';
const DRAGON_WING = 'M34 18c-4-14 8-20 20-16-6 2-8 6-6 12z';

const GRIFFIN_BODY: readonly Mark[] = [
  { t: 'path', d: 'M11 23c-5-1-8 2-8 5', ink: ink(null, '#c8883a', 2.2, 'round') },
  { t: 'ellipse', cx: 24, cy: 24, rx: 13, ry: 7, ink: ink('#e0a85a', '#211912', 1.8) },
  { t: 'circle', cx: 38, cy: 18, r: 6, ink: ink('#faf6ec', '#211912', 1.6) },
  { t: 'path', d: 'M43 17l6 2-6 2z', ink: ink('#f0b030', '#211912', 1, 'butt', 'round') },
  { t: 'circle', cx: 39.5, cy: 16.5, r: 1.2, ink: ink('#211912', null, 1) },
  { t: 'path', d: 'M18 30l-1 6M30 30l1 6', ink: ink(null, '#211912', 1.2) },
  { t: 'circle', cx: 24, cy: 34, r: 3.2, ink: ink('#f6c8a0', '#211912', 1) },
  { t: 'rect', x: 15, y: 35.5, w: 18, h: 8, rx: 2, ink: ink('#a8703a', '#211912', 1.6) },
];

const DRAGON_BODY: readonly Mark[] = [
  { t: 'path', d: 'M56 26c6 2 9 7 5 12', ink: ink(null, '#2f7a52', 4, 'round') },
  { t: 'ellipse', cx: 38, cy: 25, rx: 20, ry: 8, ink: ink('#4aa070', '#211912', 2) },
  { t: 'path', d: 'M21 23c-6-3-11-1-13 3 3 3 9 4 13 1z', ink: ink('#4aa070', '#211912', 1.8, 'butt', 'round') },
  { t: 'path', d: 'M15 20l-3-6 6 4', ink: ink('#e8d870', '#211912', 1, 'butt', 'round') },
  { t: 'circle', cx: 13, cy: 24, r: 1.3, ink: ink('#211912', null, 1) },
  { t: 'path', d: 'M30 31v5M45 31v5', ink: ink(null, '#211912', 2.2, 'round') },
  { t: 'path', d: 'M37 19h7v5h-7z', ink: ink('#3a6ad8', '#211912', 1) },
  { t: 'circle', cx: 40.5, cy: 16, r: 3, ink: ink('#f6c8a0', '#211912', 1) },
];

function centered(anchorX: number, anchorY: number, marks: readonly Mark[], wing: string): Frame {
  const boxes = [boundsOf(wing, 2), ...marks.filter((mark): mark is Extract<Mark, { t: 'path' }> => mark.t === 'path').map((mark) => boundsOf(mark.d, mark.ink.width))];
  for (const mark of marks) {
    if (mark.t === 'circle') boxes.push({ x: mark.cx - mark.r - 2, y: mark.cy - mark.r - 2, w: mark.r * 2 + 4, h: mark.r * 2 + 4 });
    else if (mark.t === 'ellipse') boxes.push({ x: mark.cx - mark.rx - 2, y: mark.cy - mark.ry - 2, w: mark.rx * 2 + 4, h: mark.ry * 2 + 4 });
    else if (mark.t === 'rect') boxes.push({ x: mark.x - 2, y: mark.y - 2, w: mark.w + 4, h: mark.h + 4 });
  }
  const minX = Math.min(...boxes.map((box) => box.x));
  const minY = Math.min(...boxes.map((box) => box.y));
  const maxX = Math.max(...boxes.map((box) => box.x + box.w));
  const maxY = Math.max(...boxes.map((box) => box.y + box.h));
  const half = Math.max(anchorX - minX, maxX - anchorX, anchorY - minY, maxY - anchorY) + 2;
  return { x: anchorX - half, y: anchorY - half, w: half * 2, h: half * 2 };
}

const GRIFFIN_FRAME = centered(26, 24, GRIFFIN_BODY, GRIFFIN_WING);
const DRAGON_FRAME = centered(34, 24, DRAGON_BODY, DRAGON_WING);
const GRIFFIN_WING_FRAME = boundsOf(GRIFFIN_WING, 2);
const DRAGON_WING_FRAME = boundsOf(DRAGON_WING, 2);
const GRIFFIN_WING_MARK: readonly Mark[] = [{ t: 'path', d: GRIFFIN_WING, ink: ink('#efe4d0', '#211912', 1.6, 'butt', 'round') }];
const DRAGON_WING_MARK: readonly Mark[] = [{ t: 'path', d: DRAGON_WING, ink: ink('#7ad0a0', '#211912', 1.6, 'butt', 'round') }];

const BIRD = ['M2 12q4-5 8 0q4-5 8 0', 'M22 4q3-4 6 0q3-4 6 0', 'M30 20q3-4 6 0q3-4 6 0'] as const;
const BAT = [
  'M2 12q3-6 7-2 2-3 4 0 4-4 7 2-4-1-5 2-2-2-4 0-2-2-4 0-1-3-5-2z',
  'M24 6q3-6 7-2 2-3 4 0 4-4 7 2-4-1-5 2-2-2-4 0-2-2-4 0-1-3-5-2z',
  'M32 20q3-6 7-2 2-3 4 0 4-4 7 2-4-1-5 2-2-2-4 0-2-2-4 0-1-3-5-2z',
] as const;
const FLOCK_FRAME: Frame = { x: 0, y: 0, w: 60, h: 30 };
const BIRD_INK = ink(null, '#2e2620', 1.8, 'round', 'round');
const BAT_INK = ink('#1e1626', '#0a0610', 0.8, 'round', 'round');
const BIRD_WINGS: readonly Mark[][] = BIRD.map((d) => [{ t: 'path', d, ink: BIRD_INK }]);
const BAT_WINGS: readonly Mark[][] = BAT.map((d) => [{ t: 'path', d, ink: BAT_INK }]);
const BIRD_FRAMES = BIRD.map((d) => boundsOf(d, BIRD_INK.width));
const BAT_FRAMES = BAT.map((d) => boundsOf(d, BAT_INK.width));

const CLOTH_PATH = 'M1 1.5h14l-4 3.5 4 3.5H1z';
const POLE_MARKS: readonly Mark[] = [{ t: 'path', d: 'M1 15V1', ink: ink(null, '#3a2a20', 1.6) }];
const CLOTH_MARKS: readonly Mark[] = [{ t: 'path', d: CLOTH_PATH, ink: ink('#c9463a', '#3a2a20', 1) }];
const FLAG_FRAME: Frame = { x: 0, y: 0, w: 20, h: 16 };
const CLOTH_FRAME = boundsOf(CLOTH_PATH, 1.2);

const WALKER_FRAME: Frame = { x: 0, y: 0, w: 60, h: 40 };
const WALKER: readonly Mark[] = [
  { t: 'path', d: 'M4 22 56 18', ink: ink(null, '#8a5a3a', 1.8, 'round') },
  { t: 'circle', cx: 30, cy: 8, r: 4, ink: ink('#f6c8a0', '#3a2030', 2.4, 'round') },
  { t: 'path', d: 'M30 12v12M30 24l-5 10M30 24l5 10M30 16l-9 5M30 16l9 3', ink: ink(null, '#3a2030', 2.4, 'round') },
];

export function Flag({ style }: { readonly style: CSSProperties }) {
  return (
    <span className="fx-bandera" style={style}>
      <MarkCanvas frame={FLAG_FRAME} marks={POLE_MARKS} />
      <MarkCanvas className="tela" frame={CLOTH_FRAME} marks={CLOTH_MARKS} style={place(CLOTH_FRAME, FLAG_FRAME)} />
    </span>
  );
}

export function Flock({ style, bats }: { readonly style: CSSProperties; readonly bats?: boolean }) {
  const paths = bats ? BAT : BIRD;
  const frames = bats ? BAT_FRAMES : BIRD_FRAMES;
  const wings = bats ? BAT_WINGS : BIRD_WINGS;
  return (
    <span className={bats ? 'fx-aves murcis' : 'fx-aves'} style={style}>
      <span className="flock">
        {paths.map((d, index) => {
          const frame = frames[index] ?? FLOCK_FRAME;
          const marks = wings[index] ?? [];
          return <MarkCanvas key={d} className="wing" frame={frame} marks={marks} style={place(frame, FLOCK_FRAME)} />;
        })}
      </span>
    </span>
  );
}

export function Walker({ style }: { readonly style: CSSProperties }) {
  return (
    <span className="fx-funambula" style={style}>
      <MarkCanvas className="rune" frame={WALKER_FRAME} marks={WALKER} />
    </span>
  );
}

export function flyerSize(kind: 'grifo' | 'dragon'): string {
  const frame = kind === 'dragon' ? DRAGON_FRAME : GRIFFIN_FRAME;
  return `${frame.w / 16}cqi`;
}

export function Flyer({ kind }: { readonly kind: 'grifo' | 'dragon' }) {
  const dragon = kind === 'dragon';
  const frame = dragon ? DRAGON_FRAME : GRIFFIN_FRAME;
  const wingFrame = dragon ? DRAGON_WING_FRAME : GRIFFIN_WING_FRAME;
  const wing = dragon ? DRAGON_WING_MARK : GRIFFIN_WING_MARK;
  const body = dragon ? DRAGON_BODY : GRIFFIN_BODY;
  return (
    <span className="volador" style={{ aspectRatio: `${frame.w} / ${frame.h}` }}>
      <MarkCanvas className="ala" frame={wingFrame} marks={wing} style={place(wingFrame, frame)} />
      <MarkCanvas frame={frame} marks={body} style={{ left: 0, top: 0, width: '100%', height: '100%' }} />
    </span>
  );
}
