/** The Flexbox world's caverns: water and lava, the minecart, candles, ghosts and the rune circle. */
import { Rune } from '../../../shared/icons/Rune';
import { cssVars } from '../cssVars';
import scenery from '../scenery.json';
import { FlowCanvas, river, Sketch } from './canvases';
import { MINECART_BOX, paintMinecart, paintRuneCircle, RUNE_CIRCLE_BOX } from './miniatures';
import { type FlockLane, Flocks, lag, placeAt, Scatter, Smoke, tintOf } from './particles';
import { RouteFollower } from './RouteFollower';

const SPOTS = scenery.flex;
const RIVERS = [
  river(SPOTS.rivers.water, 8, 'rgba(230,255,255,.95)'),
  river(SPOTS.rivers.lava, 4, 'rgba(255,240,170,.95)', [3, 14]),
];
const MINECART_SECONDS = 16;
const SPORE_COLORS = { most: '#a8fff0', everyThird: '#e0b0ff' } as const;
/** The runes on the sealed door, rising one after another. */
const DOOR_RUNES = ['ᚠ', 'ᚱ', 'ᛟ', 'ᚦ'];
const DOOR_RUNE_STAGGER = 1.1;
const DOOR_RUNE_SPREAD = 0.7;
const BAT_FLOCKS: readonly FlockLane[] = [
  { y: 0.3, seconds: 60, delay: -10 },
  { y: 0.66, seconds: 80, delay: -44 },
];

function RuneDoor() {
  const middle = (DOOR_RUNES.length - 1) / 2;
  return (
    <i className="fx-puerta" style={placeAt(SPOTS.runeDoor)}>
      {DOOR_RUNES.map((rune, index) => (
        <b
          key={rune}
          style={cssVars({
            '--d': lag(index, DOOR_RUNE_STAGGER),
            '--dx': (index - middle) * DOOR_RUNE_SPREAD,
          })}
        >
          {rune}
        </b>
      ))}
    </i>
  );
}

export function UndergroundEffects() {
  const [waterfallX, waterfallY, waterfallHeight] = SPOTS.waterfall;
  return (
    <>
      <FlowCanvas flows={RIVERS} />
      <RouteFollower route={SPOTS.rail} seconds={MINECART_SECONDS} mode="ping" className="vag">
        <Sketch
          box={MINECART_BOX}
          style={{ aspectRatio: `${MINECART_BOX[0]} / ${MINECART_BOX[1]}` }}
          paint={paintMinecart}
        />
      </RouteFollower>
      <i className="fx-rayo" style={placeAt(SPOTS.lightShaft)} />
      <Scatter
        spots={SPOTS.spores}
        className="fx-espora"
        stagger={0.9}
        vars={(_, index) => ({
          '--c': index % 3 ? SPORE_COLORS.most : SPORE_COLORS.everyThird,
        })}
      />
      <i
        className="fx-cascada"
        style={cssVars({
          '--x': waterfallX ?? 0,
          '--y': waterfallY ?? 0,
          '--h': waterfallHeight ?? 0,
        })}
      />
      <Scatter
        spots={SPOTS.crystals}
        className="fx-cristal"
        stagger={0.7}
        vars={(spot) => ({ '--c': tintOf(spot) })}
      />
      <Smoke chimneys={SPOTS.chimneys} chimneyStagger={0.6} />
      <Scatter
        spots={SPOTS.fires}
        className="fx-fuego"
        stagger={1.1}
        vars={(spot) => ({ '--c': tintOf(spot) })}
      />
      <Scatter
        spots={SPOTS.ghosts}
        className="fx-alma"
        stagger={2.7}
        vars={(_, index) => ({ '--dx': index % 2 ? 1 : -1 })}
      />
      <Scatter spots={SPOTS.candles} className="fx-cirio" stagger={0.23} digits={2} />
      <Scatter spots={SPOTS.lanterns} className="fx-cirio farol" stagger={0.41} digits={2} />
      <RuneDoor />
      <i className="fx-hoguera" style={placeAt(SPOTS.bonfire)}>
        <b />
        <b />
        <b />
      </i>
      <Scatter spots={SPOTS.drips} className="fx-gota" stagger={1.37} digits={2} />
      <Scatter spots={SPOTS.rockSparkles} className="fx-brillo" stagger={0.83} digits={2} />
      <Scatter spots={SPOTS.spiders} className="fx-arana" stagger={2.3}>
        <Rune id="i-arana" />
      </Scatter>
      <Sketch
        className="fx-runas"
        style={placeAt(SPOTS.runeCircle)}
        box={RUNE_CIRCLE_BOX}
        paint={paintRuneCircle}
        moving
      />
      <Flocks lanes={BAT_FLOCKS} bats />
      <i className="fx-zzz" style={placeAt(SPOTS.sleepingDragon)}>
        <b>z</b>
        <b>z</b>
        <b>Z</b>
      </i>
      <i className="fx-polvo" style={placeAt(SPOTS.worm)} />
    </>
  );
}
