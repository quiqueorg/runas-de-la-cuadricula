/** The apprentice's isle: the canal and its paper boats, the dye vats, butterflies and stray glyphs. */

import { cssVars } from '../cssVars';
import scenery from '../scenery.json';
import { FlowCanvas, river, Sketch } from './canvases';
import { PAPER_BOAT_BOX, paintPaperBoat } from './miniatures';
import { type FlockLane, Flocks, lag, placeAt, Scatter, Smoke, tintOf } from './particles';
import { RouteFollower } from './RouteFollower';

const SPOTS = scenery.isle;
const CANAL = [river(SPOTS.canal, 7)];
/** Two boats, sailing the canal at different speeds. */
const BOAT_CROSSINGS = [31, 47];
/** CSS's own punctuation, floating up from the aura. */
const GLYPHS = ['{', ';', '#', '}', ':', '.'];
const GLYPH_STAGGER = 0.87;
const GLYPH_SPREAD = 0.8;
const FLOCKS: readonly FlockLane[] = [
  { y: 0.3, seconds: 78, delay: -14 },
  { y: 0.72, seconds: 96, delay: -58 },
];

export function IsleEffects() {
  const glyphMiddle = (GLYPHS.length - 1) / 2;
  return (
    <>
      <FlowCanvas flows={CANAL} />
      <Smoke chimneys={SPOTS.chimneys} chimneyStagger={0.6} />
      <i className="fx-faro" style={placeAt(SPOTS.lighthouse)} />
      <i className="fx-lampara" style={placeAt(SPOTS.lighthouse)} />
      <Scatter spots={SPOTS.waves} className="fx-onda" stagger={0.9} />
      <Scatter spots={SPOTS.sparkles} className="fx-brillo" stagger={0.77} digits={2} />
      <i className="fx-aura" style={placeAt(SPOTS.aura)} />
      {/* someone upstream keeps folding boats out of misprints */}
      {BOAT_CROSSINGS.map((seconds) => (
        <RouteFollower
          key={seconds}
          route={SPOTS.canal}
          seconds={seconds}
          mode="flight"
          className="barquito"
        >
          <Sketch
            box={PAPER_BOAT_BOX}
            style={{ aspectRatio: `${PAPER_BOAT_BOX[0]} / ${PAPER_BOAT_BOX[1]}` }}
            paint={paintPaperBoat}
          />
        </RouteFollower>
      ))}
      <Scatter
        spots={SPOTS.dyeVats}
        className="fx-tinta"
        stagger={1.2}
        vars={(spot) => ({ '--c': tintOf(spot) })}
      />
      <Scatter
        spots={SPOTS.butterflies}
        className="fx-mariposa"
        stagger={1.9}
        vars={(spot) => ({ '--c': tintOf(spot) })}
      >
        <b />
        <b />
      </Scatter>
      <i className="fx-glifos" style={placeAt(SPOTS.aura)}>
        {GLYPHS.map((glyph, index) => (
          <b
            key={glyph}
            style={cssVars({
              '--d': lag(index, GLYPH_STAGGER, 2),
              '--dx': (index - glyphMiddle) * GLYPH_SPREAD,
            })}
          >
            {glyph}
          </b>
        ))}
      </i>
      <Flocks lanes={FLOCKS} />
    </>
  );
}
