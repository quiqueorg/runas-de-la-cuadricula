import { useSyncExternalStore } from 'react';
import { gameVersion, subscribe } from './store';

export function useGame(): number {
  return useSyncExternalStore(subscribe, gameVersion, gameVersion);
}
