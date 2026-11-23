/**
 * The saved-game document and its translation to `Progress`.
 *
 * The stored shape lives in every player's localStorage and in their cloud copy. Only documents of
 * the current `VERSION` are read; older saves are discarded, never migrated. Any change to the
 * shape, to how a field is written or to lesson ids bumps `VERSION`.
 *
 * Version 3 stores the world as the current `WorldId` (version 2 wrote `base`, `cielo`, `final`).
 */
import { isWorldId, type WorldId } from '../models';
import { EMPTY_PROGRESS, type LessonResult, type Progress } from './types';

export const STORAGE_KEY = 'runas-cuadricula-v1';
const VERSION = 3;

interface StoredResult {
  /** mastered */
  m?: boolean;
  /** stars */
  nota?: number;
  /** completedAt */
  t?: number;
}

export interface StoredProgress {
  v: number;
  actual: string | null;
  hechos: Record<string, StoredResult>;
  codigo: Record<string, readonly string[]>;
  intentos: Record<string, number>;
  sonido: boolean;
  lineas: boolean;
  musica: boolean;
  secretos: Record<string, boolean>;
  vistas: Record<string, boolean>;
  mundo?: WorldId;
  t: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Keeps the entries `read` accepts; anything malformed is dropped rather than trusted. */
function recordOf<T>(value: unknown, read: (entry: unknown) => T | null): Record<string, T> {
  if (!isRecord(value)) return {};
  const out: Record<string, T> = {};
  for (const [key, entry] of Object.entries(value)) {
    const parsed = read(entry);
    if (parsed !== null) out[key] = parsed;
  }
  return out;
}

function readResult(value: unknown): LessonResult | null {
  if (!isRecord(value)) return null;
  return {
    mastered: value.m === true,
    ...(typeof value.nota === 'number' ? { stars: value.nota } : {}),
    ...(typeof value.t === 'number' ? { completedAt: value.t } : {}),
  };
}

const readCode = (value: unknown): string[] | null =>
  Array.isArray(value) && value.every((item) => typeof item === 'string') ? value : null;
const readNumber = (value: unknown): number | null => (typeof value === 'number' ? value : null);
const readFlag = (value: unknown): boolean | null => (typeof value === 'boolean' ? value : null);

/** Reads a stored document (local or cloud). Returns null when there is nothing usable. */
export function fromStored(value: unknown): Progress | null {
  if (!isRecord(value) || value.v !== VERSION) return null;
  return {
    currentLessonId: typeof value.actual === 'string' ? value.actual : null,
    world: isWorldId(value.mundo) ? value.mundo : undefined,
    results: recordOf(value.hechos, readResult),
    code: recordOf(value.codigo, readCode),
    failedAttempts: recordOf(value.intentos, readNumber),
    foundSecrets: recordOf(value.secretos, readFlag),
    seenRegions: recordOf(value.vistas, readFlag),
    settings: {
      sound: value.sonido !== false,
      music: value.musica !== false,
      guides: value.lineas !== false,
    },
    updatedAt: typeof value.t === 'number' ? value.t : 0,
  };
}

function toStoredResult(result: LessonResult): StoredResult {
  return {
    m: result.mastered,
    ...(result.stars === undefined ? {} : { nota: result.stars }),
    ...(result.completedAt === undefined ? {} : { t: result.completedAt }),
  };
}

export function toStored(progress: Progress): StoredProgress {
  return {
    v: VERSION,
    actual: progress.currentLessonId,
    hechos: Object.fromEntries(
      Object.entries(progress.results).map(([id, result]) => [id, toStoredResult(result)]),
    ),
    codigo: { ...progress.code },
    intentos: { ...progress.failedAttempts },
    sonido: progress.settings.sound,
    lineas: progress.settings.guides,
    musica: progress.settings.music,
    secretos: { ...progress.foundSecrets },
    vistas: { ...progress.seenRegions },
    ...(progress.world ? { mundo: progress.world } : {}),
    t: progress.updatedAt,
  };
}

export function loadLocal(): Progress {
  try {
    return fromStored(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')) ?? EMPTY_PROGRESS;
  } catch {
    return EMPTY_PROGRESS;
  }
}

export function saveLocal(progress: Progress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStored(progress)));
  } catch {
    // Storage can be full or disabled (private mode); the game still plays without saving.
  }
}
