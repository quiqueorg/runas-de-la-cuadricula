/**
 * Optional per-user cloud copy, available when the page is hosted where `window.claude` offers a
 * user and a database. Offline or unavailable, the game silently keeps to localStorage.
 */
import { levelsById } from '../catalog';
import { fromStored, type StoredProgress, toStored } from './storage';
import { getProgress, replaceProgress, subscribe } from './store';
import type { LessonResult, Progress } from './types';

const SYNC_DELAY_MS = 1800;

type CloudPayload = Pick<StoredProgress, 'v' | 'actual' | 'hechos' | 'codigo' | 'intentos' | 't'>;

interface CloudDocument {
  set(value: CloudPayload): Promise<void>;
  get(): Promise<unknown>;
}

interface HostBridge {
  use(name: 'user'): Promise<{ id(): Promise<string | null> } | null>;
  use(name: 'db'): Promise<{ collection(path: string): { doc(id: string): CloudDocument } } | null>;
}

declare global {
  interface Window {
    claude?: HostBridge;
  }
}

function isDataSnapshot(value: unknown): value is { data(): unknown } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'data' in value &&
    typeof value.data === 'function'
  );
}

function payloadOf(progress: Progress): CloudPayload {
  const { v, actual, hechos, codigo, intentos, t } = toStored(progress);
  return { v, actual, hechos, codigo, intentos, t };
}

function mergeResult(local: LessonResult | undefined, remote: LessonResult): LessonResult {
  if (!local) return remote;
  const stars = Math.max(local.stars ?? 0, remote.stars ?? 0);
  return {
    ...local,
    mastered: local.mastered || remote.mastered,
    ...(stars ? { stars } : {}),
  };
}

/** Keeps the best of both copies: every solved lesson, the better grade, any code not written here. */
export function mergeProgress(local: Progress, remote: Progress): Progress {
  const results = { ...local.results };
  for (const [id, result] of Object.entries(remote.results)) {
    if (levelsById[id]) results[id] = mergeResult(results[id], result);
  }
  const code = { ...remote.code, ...local.code };
  const remoteIsNewer =
    remote.updatedAt > local.updatedAt &&
    remote.currentLessonId !== null &&
    Boolean(levelsById[remote.currentLessonId]);
  return {
    ...local,
    results,
    code,
    currentLessonId: remoteIsNewer ? remote.currentLessonId : local.currentLessonId,
  };
}

class CloudSync {
  private timer: ReturnType<typeof setTimeout> | undefined;
  private busy = false;
  private pending = false;

  constructor(private readonly document: CloudDocument) {}

  schedule(): void {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.push(), SYNC_DELAY_MS);
  }

  private async push(): Promise<void> {
    if (this.busy) {
      this.pending = true;
      return;
    }
    this.busy = true;
    try {
      await this.document.set(payloadOf(getProgress()));
    } catch {
      // Offline: the next change tries again.
    }
    this.busy = false;
    if (this.pending) {
      this.pending = false;
      this.schedule();
    }
  }
}

async function openCloudDocument(): Promise<CloudDocument | null> {
  const bridge = window.claude;
  if (!bridge || typeof bridge.use !== 'function') return null;
  const [user, db] = await Promise.all([bridge.use('user'), bridge.use('db')]);
  const id = await user?.id();
  if (!db || !id) return null;
  return db.collection(`data/users/${id}`).doc('progreso');
}

async function readRemote(document: CloudDocument): Promise<Progress | null> {
  try {
    const snapshot = await document.get();
    return fromStored(isDataSnapshot(snapshot) ? snapshot.data() : snapshot);
  } catch {
    return null;
  }
}

/** Merges the cloud copy in, then keeps it up to date with every change. */
export async function startCloudSync(): Promise<void> {
  try {
    const document = await openCloudDocument();
    if (!document) return;
    const remote = await readRemote(document);
    const sync = new CloudSync(document);
    subscribe(() => sync.schedule());
    if (remote) replaceProgress(mergeProgress(getProgress(), remote));
    sync.schedule();
  } catch {
    // The host does not offer a cloud: localStorage is enough.
  }
}
