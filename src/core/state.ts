/** Saved progress. The localStorage key and object shape are a compatibility contract. */
import { touch } from './store';
import type { AttemptRecord, Progress } from './models';
import { isWorldId } from './models';

export const STORAGE_KEY = 'runas-cuadricula-v1';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringMap<T>(value: unknown, read: (entry: unknown) => T | null): Record<string, T> {
  if (!isRecord(value)) return {};
  const out: Record<string, T> = {};
  for (const [key, entry] of Object.entries(value)) {
    const parsed = read(entry);
    if (parsed !== null) out[key] = parsed;
  }
  return out;
}

function readAttempt(value: unknown): AttemptRecord | null {
  if (!isRecord(value)) return null;
  const attempt: AttemptRecord = {};
  if (value.m === true) attempt.m = true;
  if (typeof value.nota === 'number') attempt.nota = value.nota;
  return attempt;
}

function readCode(value: unknown): string[] | null {
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) return null;
  return value;
}

function readCount(value: unknown): number | null {
  return typeof value === 'number' ? value : null;
}

function readFlag(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null;
}

export function migrateSave(raw: unknown): Progress | null {
  if (!isRecord(raw)) return null;
  if (typeof raw.v === 'number' && raw.v >= 2) return readProgress(raw);
  const rename = (key: string) => (/^7-[1-5]$/.test(key) ? '9-' + key.slice(2) : key);
  const hechos = stringMap(raw.hechos, readAttempt);
  const codigo = stringMap(raw.codigo, readCode);
  const renamedHechos: Record<string, AttemptRecord> = {};
  const renamedCode: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(hechos)) renamedHechos[rename(key)] = value;
  for (const [key, value] of Object.entries(codigo)) renamedCode[rename(key)] = value;
  raw.hechos = renamedHechos;
  raw.codigo = renamedCode;
  if (typeof raw.actual === 'string') raw.actual = rename(raw.actual);
  raw.v = 2;
  return readProgress(raw);
}

function readProgress(raw: Record<string, unknown>): Progress {
  const mundo = typeof raw.mundo === 'string' && isWorldId(raw.mundo) ? raw.mundo : undefined;
  return {
    v: 2,
    actual: typeof raw.actual === 'string' ? raw.actual : null,
    hechos: stringMap(raw.hechos, readAttempt),
    codigo: stringMap(raw.codigo, readCode),
    intentos: stringMap(raw.intentos, readCount),
    sonido: raw.sonido !== false,
    lineas: raw.lineas !== false,
    musica: raw.musica !== false,
    secretos: stringMap(raw.secretos, readFlag),
    vistas: stringMap(raw.vistas, readFlag),
    mundo,
    t: typeof raw.t === 'number' ? raw.t : 0,
  };
}

export const progress: Progress = migrateSave(readStored()) ?? {
  v: 2,
  actual: null,
  hechos: {},
  codigo: {},
  intentos: {},
  sonido: true,
  lineas: true,
  musica: true,
  secretos: {},
  vistas: {},
  t: 0,
};

function readStored(): unknown {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') as unknown;
  } catch {
    return null;
  }
}

export let saveTimer = 0;

export function saveProgress(immediate?: boolean, quiet = false): void {
  progress.t = Date.now();
  clearTimeout(saveTimer);
  const write = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      /* storage unavailable */
    }
    window.dispatchEvent(new CustomEvent('progress-saved'));
  };
  if (immediate) write();
  else saveTimer = window.setTimeout(write, 400);
  if (!quiet) touch();
}
