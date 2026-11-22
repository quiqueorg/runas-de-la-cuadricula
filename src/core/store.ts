/** React subscription over the progress and session singletons. */

let version = 0;
const listeners = new Set<() => void>();

export function touch(): void {
  version += 1;
  for (const listener of listeners) listener();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function gameVersion(): number {
  return version;
}
