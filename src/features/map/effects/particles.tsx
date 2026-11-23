/**
 * HTML particles: small elements placed on the chart through `--x` and `--y` and animated by their
 * CSS class. Copies of one effect get staggered negative delays (`--d`), so they never move in step.
 */
import type { CSSProperties, ReactNode } from 'react';
import { type CustomProperties, cssVars } from '../cssVars';
import { Flag, Flock } from './figures';

/** A spot from scenery.json: `[x, y]` in fractions of the chart, sometimes followed by a colour. */
export type Spot = readonly (number | string)[];

const DEFAULT_TINT = '#fff';
/** Each chimney sends up three puffs, one after another. */
const PUFFS = [0, 1, 2];
const PUFF_STAGGER = 1.8;

export function placeAt(spot: Spot, vars: CustomProperties = {}): CSSProperties {
  const x = typeof spot[0] === 'number' ? spot[0] : 0;
  const y = typeof spot[1] === 'number' ? spot[1] : 0;
  return cssVars({ '--x': x, '--y': y, ...vars });
}

/** The `index`-th copy starts `step` seconds further into its animation. */
export const lag = (index: number, step: number, digits = 1): string =>
  `${(-index * step).toFixed(digits)}s`;

/** A spot's colour, its third item. */
export const tintOf = (spot: Spot): string | number => spot[2] ?? DEFAULT_TINT;

/** Spots in one list never repeat, so the spot itself names its element. */
export const spotKey = (spot: Spot): string => spot.join(' ');

/** One `<i>` of `className` at each spot, `stagger` seconds apart. */
export function Scatter({
  spots,
  className,
  stagger,
  digits = 1,
  vars,
  children,
}: {
  readonly spots: readonly Spot[];
  readonly className: string;
  readonly stagger: number;
  readonly digits?: number;
  /** More custom properties for each copy. */
  readonly vars?: (spot: Spot, index: number) => CustomProperties;
  readonly children?: ReactNode;
}) {
  return spots.map((spot, index) => (
    <i
      key={spotKey(spot)}
      className={className}
      style={placeAt(spot, { '--d': lag(index, stagger, digits), ...vars?.(spot, index) })}
    >
      {children}
    </i>
  ));
}

/** Three puffs over each chimney; each chimney starts `chimneyStagger` seconds after the last. */
export function Smoke({
  chimneys,
  chimneyStagger,
}: {
  readonly chimneys: readonly Spot[];
  readonly chimneyStagger: number;
}) {
  return chimneys.flatMap((chimney, chimneyIndex) =>
    PUFFS.map((puff) => (
      <i
        key={`${spotKey(chimney)}-${puff}`}
        className="fx-humo chica"
        style={placeAt(chimney, {
          '--d': `${(-puff * PUFF_STAGGER - chimneyIndex * chimneyStagger).toFixed(1)}s`,
        })}
      />
    )),
  );
}

const FLAG_STAGGER = 0.37;

export function Flags({ spots }: { readonly spots: readonly Spot[] }) {
  return spots.map((spot, index) => (
    <Flag key={spotKey(spot)} style={placeAt(spot, { '--d': lag(index, FLAG_STAGGER, 2) })} />
  ));
}

/** A flock crossing the chart at height `y`, once every `seconds`, starting `delay` seconds in. */
export interface FlockLane {
  readonly y: number;
  readonly seconds: number;
  readonly delay: number;
}

export function Flocks({
  lanes,
  bats,
}: {
  readonly lanes: readonly FlockLane[];
  readonly bats?: boolean;
}) {
  return lanes.map((lane) => (
    <Flock
      key={lane.y}
      bats={bats}
      style={cssVars({ '--y': lane.y, '--dur': `${lane.seconds}s`, '--d': `${lane.delay}s` })}
    />
  ));
}
