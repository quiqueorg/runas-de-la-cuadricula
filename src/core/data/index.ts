/** Every world's content, in catalog order. */
import type { WorldContent } from '../models';
import { finaleWorld } from './finale';
import { flexWorld } from './flex';
import { gridWorld } from './grid';
import { isleWorld } from './isle';
import { skyWorld } from './sky';

/**
 * Catalog order, not menu order. Global region indexes follow it, and they are saved (regions the
 * player has seen) and name the portraits (`pj-<index>`), so a new world goes at the end.
 */
export const WORLDS: readonly WorldContent[] = [
  gridWorld,
  flexWorld,
  skyWorld,
  finaleWorld,
  isleWorld,
];
