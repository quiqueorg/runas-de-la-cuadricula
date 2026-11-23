/**
 * The saved-game document and its translation to `Progress`.
 *
 * The stored shape below is a compatibility contract: it lives in every player's localStorage and in
 * their cloud copy. Never rename or retype its fields; add a migration in `migrate()` instead.
 */
import { isWorldId, type WorldId } from '../models';
import { EMPTY_PROGRESS, type LessonResult, type Progress } from './types';

export const STORAGE_KEY = 'runas-cuadricula-v1';
const VERSION = 2;

/** World ids as they were first saved. */
const STORED_WORLD: Record<WorldId, string> = {
  isle: 'base',
  grid: 'grid',
  flex: 'flex',
  sky: 'cielo',
  finale: 'final',
};

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
  mundo?: string;
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

function readWorld(value: unknown): WorldId | undefined {
  const found = Object.entries(STORED_WORLD).find(([, stored]) => stored === value)?.[0];
  return isWorldId(found) ? found : undefined;
}

/** Version 1 saves numbered the grid world's last region 7; it became 9. */
function migrateV1(raw: Record<string, unknown>): Record<string, unknown> {
  const rename = (key: string) => (/^7-[1-5]$/.test(key) ? `9-${key.slice(2)}` : key);
  const renameKeys = (value: unknown) =>
    isRecord(value)
      ? Object.fromEntries(Object.entries(value).map(([key, entry]) => [rename(key), entry]))
      : value;
  return {
    ...raw,
    v: VERSION,
    hechos: renameKeys(raw.hechos),
    codigo: renameKeys(raw.codigo),
    actual: typeof raw.actual === 'string' ? rename(raw.actual) : raw.actual,
  };
}

function migrate(raw: Record<string, unknown>): Record<string, unknown> {
  return typeof raw.v === 'number' && raw.v >= VERSION ? raw : migrateV1(raw);
}

/** Reads a stored document (local or cloud). Returns null when there is nothing usable. */
export function fromStored(value: unknown): Progress | null {
  if (!isRecord(value)) return null;
  const raw = migrate(value);
  return {
    currentLessonId: typeof raw.actual === 'string' ? raw.actual : null,
    world: readWorld(raw.mundo),
    results: recordOf(raw.hechos, readResult),
    code: recordOf(raw.codigo, readCode),
    failedAttempts: recordOf(raw.intentos, readNumber),
    foundSecrets: recordOf(raw.secretos, readFlag),
    seenRegions: recordOf(raw.vistas, readFlag),
    settings: {
      sound: raw.sonido !== false,
      music: raw.musica !== false,
      guides: raw.lineas !== false,
    },
    updatedAt: typeof raw.t === 'number' ? raw.t : 0,
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
    ...(progress.world ? { mundo: STORED_WORLD[progress.world] } : {}),
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
