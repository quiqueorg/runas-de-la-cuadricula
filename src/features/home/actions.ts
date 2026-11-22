/** What the title screen can ask for. */
import type { WorldId } from '../../core/models';

export type HomeAction =
  | { readonly type: 'select'; readonly world: WorldId }
  | { readonly type: 'new-game' }
  | { readonly type: 'toggle-sound' };

export type HomeEffect =
  | { readonly type: 'enter'; readonly world: WorldId }
  | { readonly type: 'shake' }
  | { readonly type: 'confirm-reset'; readonly text: string }
  | { readonly type: 'reset' }
  | { readonly type: 'toggle-sound' };
