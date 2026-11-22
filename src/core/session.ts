/** Mutable session pointers. ESM live bindings cannot be reassigned across modules. */
import type { Session } from './models';

export const session: Session = {
  world: 'grid',
  level: null,
};
