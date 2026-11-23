/** The sky world: the storm's eye, lightning, the airship, bells, and the griffin and dragon in flight. */
import { Rune } from '../../../shared/icons/Rune';
import scenery from '../scenery.json';
import { Sketch } from './canvases';
import { Flyer, type FlyerKind, flyerWidth } from './figures';
import {
  AIRSHIP_BOX,
  BLADES_BOX,
  BOLT_BOX,
  paintAirship,
  paintBlades,
  paintBolt,
} from './miniatures';
import { Flags, type FlockLane, Flocks, placeAt, Smoke, spotKey } from './particles';
import { RouteFollower } from './RouteFollower';

const SPOTS = scenery.sky;
const AIRSHIP_SECONDS = 80;
/** Bolts strike out of step: each starts later and repeats on one of three periods. */
const BOLT = { stagger: 2.3, offset: 1, seconds: 6, periods: 3, periodStep: 1.7 } as const;
const FLOCKS: readonly FlockLane[] = [
  { y: 0.3, seconds: 74, delay: -12 },
  { y: 0.7, seconds: 96, delay: -60 },
];
/** Seconds per flight, and the class its route's CSS hangs on. */
const FLIGHTS: Readonly<
  Record<FlyerKind, { readonly seconds: number; readonly className: string }>
> = {
  griffin: { seconds: 7, className: 'vuelo-grifo' },
  dragon: { seconds: 9, className: 'vuelo-dragon' },
};
/** Two streams, drawn in the sky chart's own 900 × 618.75 units. */
const STREAMS = [
  'M195 384 C197 405 216 415 220 430 S220 450 231 461 S243 479 243 492 S249 518 253 532',
  'M837 301 Q836 305 841 309 Q844 312 835 316',
];

function Bolts() {
  return SPOTS.bolts.map((spot, index) => (
    <Sketch
      key={spotKey(spot)}
      className="fx-relampago"
      style={placeAt(spot, {
        '--d': `${(-index * BOLT.stagger - BOLT.offset).toFixed(1)}s`,
        '--dur': `${(BOLT.seconds + (index % BOLT.periods) * BOLT.periodStep).toFixed(1)}s`,
      })}
      box={BOLT_BOX}
      paint={paintBolt}
    />
  ));
}

function Flights() {
  return Object.entries(SPOTS.flights).map(([name, route]) => {
    const kind: FlyerKind = name === 'dragon' ? 'dragon' : 'griffin';
    return (
      <RouteFollower
        key={name}
        route={route}
        seconds={FLIGHTS[kind].seconds}
        mode="flight"
        className={`flyer ${FLIGHTS[kind].className}`}
        style={{ width: flyerWidth(kind) }}
      >
        <Flyer kind={kind} />
      </RouteFollower>
    );
  });
}

export function SkyEffects() {
  return (
    <>
      <i className="fx-vortice" style={placeAt(SPOTS.vortex)}>
        <b />
        <b />
      </i>
      <i className="fx-aura ojo" style={placeAt(SPOTS.vortex)} />
      <Bolts />
      <RouteFollower route={SPOTS.airship} seconds={AIRSHIP_SECONDS} className="dir">
        <Sketch box={AIRSHIP_BOX} style={{ aspectRatio: '3 / 2' }} paint={paintAirship} />
      </RouteFollower>
      {SPOTS.bells.map((spot) => (
        <i key={spotKey(spot)} className="fx-campana" style={placeAt(spot)}>
          <Rune id="i-campana" />
        </i>
      ))}
      <Flags spots={SPOTS.flags} />
      <svg
        className="fx-rios sky-streams"
        viewBox="0 0 900 618.75"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {STREAMS.map((stream) => (
          <path key={stream} d={stream} />
        ))}
      </svg>
      <Smoke chimneys={SPOTS.chimneys} chimneyStagger={0.6} />
      <i className="fx-faro" style={placeAt(SPOTS.lighthouse)} />
      <i className="fx-lampara" style={placeAt(SPOTS.lighthouse)} />
      <Sketch
        className="fx-aspas"
        style={placeAt(SPOTS.windmill)}
        box={BLADES_BOX}
        paint={paintBlades}
      />
      <i className="fx-surtidor" style={placeAt(SPOTS.fountain)}>
        <b />
        <b />
        <b />
      </i>
      <Flocks lanes={FLOCKS} />
      <Flights />
    </>
  );
}
