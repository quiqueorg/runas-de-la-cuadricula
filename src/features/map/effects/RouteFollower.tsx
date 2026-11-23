import { type CSSProperties, type ReactNode, useEffect, useRef } from 'react';
import { trackMotion } from '../../../shared/canvas/motion';
import { routeSample } from '../flyers';

const MS_PER_SECOND = 1000;

/** Centred on `--x`, `--y`, which the animation moves along the route. */
const FOLLOWER_STYLE: CSSProperties = {
  position: 'absolute',
  left: 'calc(var(--x) * 100%)',
  top: 'calc(var(--y) * 100%)',
  translate: '-50% -50%',
};

/**
 * Carries its children along a route of `[x, y]` points (fractions of the chart), once every
 * `seconds`. The position is written straight to the element every frame, so React does not re-render.
 */
export function RouteFollower({
  route,
  seconds,
  mode = 'loop',
  className,
  style,
  children,
}: {
  readonly route: readonly (readonly number[])[];
  readonly seconds: number;
  readonly mode?: 'loop' | 'ping' | 'flight';
  readonly className: string;
  readonly style?: CSSProperties;
  readonly children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || route.length < 2) return;
    const started = performance.now();
    const move = (now: number) => {
      const pose = routeSample(route, (now - started) / MS_PER_SECOND, seconds, mode);
      node.style.setProperty('--x', String(pose.x));
      node.style.setProperty('--y', String(pose.y));
      node.style.opacity = String(pose.opacity);
    };
    move(started);
    return trackMotion(move);
  }, [route, seconds, mode]);
  return (
    <div ref={ref} className={className} style={{ ...FOLLOWER_STYLE, ...style }}>
      {children}
    </div>
  );
}
