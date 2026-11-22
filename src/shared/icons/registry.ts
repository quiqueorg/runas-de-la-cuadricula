/** Symbol lookup. Each screen registers the geometry it paints. */
import type { SymbolArt } from './symbols';

const symbols = new Map<string, SymbolArt>();

export function registerSymbols(arts: readonly SymbolArt[]): void {
  for (const art of arts) symbols.set(art.id, art);
}

export function symbolOf(id: string): SymbolArt | undefined {
  return symbols.get(id);
}
