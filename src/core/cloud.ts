/** Optional per-user cloud copy. Refreshes the UI through an event, not a direct import. */
import type { Progress } from './models';
import { levelsById } from './catalog';
import { migrateSave, progress, saveProgress } from './state';

interface CloudDocument {
  set(value: Pick<Progress, 'v' | 'actual' | 'hechos' | 'codigo' | 'intentos' | 't'>): Promise<void>;
  get(): Promise<unknown>;
}

interface CloudCollection {
  doc(id: string): CloudDocument;
}

interface CloudDatabase {
  collection(path: string): CloudCollection;
}

interface CloudUser {
  id(): Promise<string | null>;
}

interface HostBridge {
  use(name: 'user'): Promise<CloudUser | null>;
  use(name: 'db'): Promise<CloudDatabase | null>;
}

declare global {
  interface Window {
    claude?: HostBridge;
  }
}

function isDataSnapshot(value: unknown): value is { data(): unknown } {
  return typeof value === 'object' && value !== null && 'data' in value && typeof value.data === 'function';
}

export let cloudRef: CloudDocument | null = null;
export let cloudTimer = 0;
export let cloudBusy = false;
export let cloudPending = false;
export function scheduleCloudSync() { if (!cloudRef) return; clearTimeout(cloudTimer); cloudTimer = setTimeout(pushCloudSave, 1800); }
export async function pushCloudSave() {
  if (!cloudRef) return;
  if (cloudBusy) { cloudPending = true; return; }
  cloudBusy = true;
  try { await cloudRef.set({ v: 2, actual: progress.actual, hechos: progress.hechos, codigo: progress.codigo, intentos: progress.intentos, t: progress.t }); } catch (e) { /*offline*/ }
  cloudBusy = false;
  if (cloudPending) { cloudPending = false; scheduleCloudSync(); }
}
export async function initCloudSync() {
  try {
    if (!window.claude || typeof window.claude.use !== 'function') return;
    const [user, db] = await Promise.all([window.claude.use('user'), window.claude.use('db')]);
    if (!user || !db) return;
    const id = await user.id();
    if (!id) return;
    const ref = db.collection('data/users/' + id).doc('progreso');
    let saved: Progress | null = null;
    try {
      const snapshot: unknown = await ref.get();
      const data = isDataSnapshot(snapshot) ? snapshot.data() : snapshot;
      saved = migrateSave(data);
    } catch {
      saved = null;
    }
    cloudRef = ref;
    if (saved?.hechos) {
      for (const [key, attempt] of Object.entries(saved.hechos)) {
        if (!levelsById[key] || !attempt) continue;
        const local = progress.hechos[key];
        if (!local) progress.hechos[key] = attempt;
        else {
          if (attempt.m && !local.m) local.m = true;
          if ((attempt.nota || 0) > (local.nota || 0)) local.nota = attempt.nota;
        }
      }
      for (const [key, code] of Object.entries(saved.codigo)) {
        if (!progress.codigo[key] && Array.isArray(code)) progress.codigo[key] = code;
      }
      if (saved.t > progress.t && saved.actual && levelsById[saved.actual]) progress.actual = saved.actual;
      window.dispatchEvent(new CustomEvent('app-refresh'));
    }
    saveProgress(true);
  } catch (e) { /*capability unavailable*/ }
}

window.addEventListener('progress-saved', () => scheduleCloudSync());
