/**
 * What drifts across the chart, under the markers: clouds over the surface worlds, glowing motes in
 * the caverns and in the final battle.
 */
import type { WorldId } from '../../../core/models';
import { cssVars } from '../cssVars';

/** A cloud crossing at height `y`, once every `seconds`, `width` in `cqi`. */
interface CloudLane {
  readonly y: number;
  readonly seconds: number;
  readonly delay: number;
  readonly variant: number;
  readonly width: number;
}

const SKY_CLOUDS: readonly CloudLane[] = [
  { y: 0.08, seconds: 170, delay: -40, variant: 1, width: 11 },
  { y: 0.44, seconds: 210, delay: -150, variant: 2, width: 9 },
  { y: 0.94, seconds: 190, delay: -90, variant: 3, width: 12 },
];

const SURFACE_CLOUDS: readonly CloudLane[] = [
  { y: 0.09, seconds: 220, delay: -31, variant: 1, width: 8 },
  { y: 0.35, seconds: 170, delay: -118, variant: 2, width: 12 },
  { y: 0.63, seconds: 230, delay: -67, variant: 3, width: 9 },
  { y: 0.84, seconds: 155, delay: -22, variant: 1, width: 15 },
];

/** Motes rise in evenly spaced rows; their speeds cycle through four lengths and three colours. */
interface MoteDrift {
  readonly count: number;
  readonly firstY: number;
  readonly rowGap: number;
  readonly seconds: number;
  readonly extraSeconds: number;
  readonly stagger: number;
  readonly colors: readonly string[];
}

const SPEED_STEPS = 4;
const DEFAULT_MOTE_COLOR = '#fff';

const FINALE_MOTES: MoteDrift = {
  count: 10,
  firstY: 0.08,
  rowGap: 0.09,
  seconds: 60,
  extraSeconds: 17,
  stagger: 11,
  colors: ['#c8a8ff', '#ffd0f0', '#a8e8ff'],
};

const CAVERN_MOTES: MoteDrift = {
  count: 9,
  firstY: 0.1,
  rowGap: 0.1,
  seconds: 70,
  extraSeconds: 18,
  stagger: 13,
  colors: ['#a8fff0', '#e0b0ff', '#fff0b0'],
};

function moteRows(drift: MoteDrift) {
  return Array.from({ length: drift.count }, (_, row) => ({
    y: (drift.firstY + row * drift.rowGap).toFixed(2),
    seconds: drift.seconds + (row % SPEED_STEPS) * drift.extraSeconds,
    delay: -row * drift.stagger,
    color: drift.colors[row % drift.colors.length] ?? DEFAULT_MOTE_COLOR,
  }));
}

const MOTES: Partial<Record<WorldId, ReturnType<typeof moteRows>>> = {
  finale: moteRows(FINALE_MOTES),
  flex: moteRows(CAVERN_MOTES),
};

function Clouds({
  lanes,
  classOf,
}: {
  readonly lanes: readonly CloudLane[];
  readonly classOf: (lane: CloudLane, index: number) => string;
}) {
  return lanes.map((lane, index) => (
    <i
      key={lane.y}
      className={classOf(lane, index)}
      style={cssVars({
        '--y': lane.y,
        '--dur': `${lane.seconds}s`,
        '--d': `${lane.delay}s`,
        '--w': `${lane.width}cqi`,
      })}
    >
      <b />
    </i>
  ));
}

export function PassingClouds({ world }: { readonly world: WorldId }) {
  const motes = MOTES[world];
  if (motes) {
    return motes.map((mote) => (
      <i
        key={mote.y}
        className="mota"
        style={cssVars({
          '--y': mote.y,
          '--dur': `${mote.seconds}s`,
          '--d': `${mote.delay}s`,
          '--c': mote.color,
        })}
      />
    ));
  }
  if (world === 'sky') {
    return <Clouds lanes={SKY_CLOUDS} classOf={(lane) => `nube-paso v${lane.variant}`} />;
  }
  return (
    <Clouds
      lanes={SURFACE_CLOUDS}
      classOf={(lane, index) => `passing-cloud ${index % 2 ? 'near' : 'far'} v${lane.variant}`}
    />
  );
}
