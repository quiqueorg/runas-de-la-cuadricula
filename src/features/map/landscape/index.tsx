/** Hand-drawn ink over each world's chart image, in the shared sheet stretched to the chart. */
import type { ComponentType } from 'react';
import type { WorldId } from '../../../core/models';
import { SHEET_HEIGHT, SHEET_WIDTH } from '../sheet';
import { Caverns } from './Caverns';
import { Coast } from './Coast';
import { Isle } from './Isle';
import { NightChart } from './NightChart';
import { SkyBanks } from './SkyBanks';

const INK: Readonly<Record<WorldId, ComponentType>> = {
  isle: Isle,
  grid: Coast,
  flex: Caverns,
  sky: SkyBanks,
  finale: NightChart,
};

export function Landscape({ world }: { readonly world: WorldId }) {
  const WorldInk = INK[world];
  return (
    <svg
      className={`landscape-ink ink-${world}`}
      viewBox={`0 0 ${SHEET_WIDTH} ${SHEET_HEIGHT}`}
      preserveAspectRatio="none"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <WorldInk />
    </svg>
  );
}
