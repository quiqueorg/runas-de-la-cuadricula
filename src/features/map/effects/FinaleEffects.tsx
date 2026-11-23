/** The final battle: the scribble at the centre, portals, drifting shards and sparks. */
import scenery from '../scenery.json';
import { placeAt, Scatter, tintOf } from './particles';

const SPOTS = scenery.finale;
/** Shards tilt alternately left and right, by one of five angles. */
const SHARD_TILT = { base: 12, step: 7, steps: 5 } as const;

const shardTilt = (index: number): string =>
  `${(index % 2 ? 1 : -1) * (SHARD_TILT.base + (index % SHARD_TILT.steps) * SHARD_TILT.step)}deg`;

export function FinaleEffects() {
  return (
    <>
      <i className="fx-garabato" style={placeAt(SPOTS.scribble)}>
        <b />
        <b />
        <b />
      </i>
      <Scatter
        spots={SPOTS.portals}
        className="fx-portal"
        stagger={1.3}
        vars={(spot) => ({ '--c': tintOf(spot) })}
      >
        <b />
        <b />
      </Scatter>
      <Scatter
        spots={SPOTS.shards}
        className="fx-fragmento"
        stagger={1.7}
        vars={(spot, index) => ({ '--c': tintOf(spot), '--g': shardTilt(index) })}
      />
      <Scatter spots={SPOTS.sparks} className="fx-brillo" stagger={0.47} digits={2} />
    </>
  );
}
