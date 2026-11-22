/** Which screen a hash names. No rendering. */

export type Screen =
  | { readonly view: 'home' }
  | { readonly view: 'map' }
  | { readonly view: 'challenge'; readonly levelId: string };

export function screenOf(hash: string): Screen {
  if (hash.startsWith('prueba-')) return { view: 'challenge', levelId: hash.slice('prueba-'.length) };
  if (hash === 'mapa') return { view: 'map' };
  return { view: 'home' };
}

export function screenTitle(screen: Screen, worldName: string, lessonTitle: string): string {
  if (screen.view === 'home') return 'Runas de la Cuadrícula';
  if (screen.view === 'map') return 'Mapa · Runas de la Cuadrícula';
  return lessonTitle || worldName;
}
