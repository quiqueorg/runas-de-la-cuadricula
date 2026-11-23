/** The Grid world's coast: rivers, smoke, the mill, the lighthouse, the whale and the market square. */
import { Rune } from '../../../shared/icons/Rune';
import scenery from '../scenery.json';
import { FlowCanvas, river, Sketch } from './canvases';
import { BLADES_BOX, FISH_BOX, paintBlades, paintFish, paintSpout, SPOUT_BOX } from './miniatures';
import {
  Flags,
  type FlockLane,
  Flocks,
  lag,
  placeAt,
  Scatter,
  Smoke,
  spotKey,
  tintOf,
} from './particles';

const SPOTS = scenery.grid;
const RIVERS = Object.values(SPOTS.rivers).map((course) => river(course, 8));
const FLOCKS: readonly FlockLane[] = [
  { y: 0.36, seconds: 70, delay: -8 },
  { y: 0.62, seconds: 90, delay: -52 },
];
/** The smoke column over the square: puffs drift left, straight up and right in turn. */
const PILLAR_PUFFS = [0, 1, 2, 3, 4, 5];
const PILLAR_STAGGER = 0.55;
const PILLAR_DRIFT = 0.35;
const FISH_STAGGER = 2.9;

export function GridEffects() {
  return (
    <>
      <FlowCanvas flows={RIVERS} />
      <Smoke chimneys={SPOTS.chimneys} chimneyStagger={0.7} />
      <Sketch
        className="fx-aspas"
        style={placeAt(SPOTS.windmill)}
        box={BLADES_BOX}
        paint={paintBlades}
      />
      <i className="fx-faro" style={placeAt(SPOTS.lighthouse)} />
      <i className="fx-lampara" style={placeAt(SPOTS.lighthouse)} />
      <Sketch
        className="fx-chorro"
        style={placeAt(SPOTS.whale)}
        box={SPOUT_BOX}
        paint={paintSpout}
      />
      {SPOTS.fish.map((spot, index) => (
        <i
          key={spotKey(spot)}
          className="fx-pez"
          style={placeAt(spot, { '--d': lag(index, FISH_STAGGER) })}
        >
          <Sketch box={FISH_BOX} paint={paintFish} />
        </i>
      ))}
      <i className="fx-runa" style={placeAt(SPOTS.rune)} />
      <Scatter spots={SPOTS.sparkles} className="fx-brillo" stagger={0.77} digits={2} />
      <Scatter spots={SPOTS.waves} className="fx-onda" stagger={0.6} />
      <i className="fx-aura" style={placeAt(SPOTS.aura)} />
      <i className="fx-destello" style={placeAt(SPOTS.chest)} />
      <i className="fx-pilar" style={placeAt(SPOTS.pillar)}>
        {PILLAR_PUFFS.map((puff) => (
          <b
            key={puff}
            style={placeAt([0, 0], {
              '--d': lag(puff, PILLAR_STAGGER, 2),
              '--dx': ((puff % 3) - 1) * PILLAR_DRIFT,
            })}
          />
        ))}
      </i>
      <Flags spots={SPOTS.flags} />
      <i className="fx-globo" style={placeAt(SPOTS.balloon)}>
        <Rune id="globo-aire" />
      </i>
      <Scatter
        spots={SPOTS.butterflies}
        className="fx-mariposa"
        stagger={1.7}
        vars={(spot) => ({ '--c': tintOf(spot) })}
      >
        <b />
        <b />
      </Scatter>
      <Flocks lanes={FLOCKS} />
    </>
  );
}
