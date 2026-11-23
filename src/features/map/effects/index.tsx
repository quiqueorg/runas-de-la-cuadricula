/**
 * The scenery that moves on each world's chart. Particles are HTML animated by CSS; illustrations
 * are canvases, painted once or, if they move, on every frame while on screen.
 */
import type { ComponentType } from 'react';
import type { WorldId } from '../../../core/models';
import { FinaleEffects } from './FinaleEffects';
import { GridEffects } from './GridEffects';
import { IsleEffects } from './IsleEffects';
import { SkyEffects } from './SkyEffects';
import { UndergroundEffects } from './UndergroundEffects';

export { PassingClouds } from './PassingClouds';

const EFFECTS: Readonly<Record<WorldId, ComponentType>> = {
  isle: IsleEffects,
  grid: GridEffects,
  flex: UndergroundEffects,
  sky: SkyEffects,
  finale: FinaleEffects,
};

export function Effects({ world }: { readonly world: WorldId }) {
  const WorldEffects = EFFECTS[world];
  return <WorldEffects />;
}
