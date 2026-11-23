/** Reading what the player writes on the tablet: declarations, and whether each one is allowed. */
import { escapeHtml } from '../../../shared/dom';

export const stripComments = (text: string): string => text.replace(/\/\*[\s\S]*?(\*\/|$)/g, ' ');

export type Declaration =
  | { readonly kind: 'malformed'; readonly raw: string }
  | { readonly kind: 'declaration'; readonly property: string; readonly value: string };

/** Splits a rule body into declarations. Custom properties keep their case; others are lowercased. */
export function parseDeclarations(text: string): Declaration[] {
  const declarations: Declaration[] = [];
  for (const part of stripComments(text).split(';')) {
    const raw = part.trim();
    if (!raw) continue;
    const colon = raw.indexOf(':');
    if (colon < 0) {
      declarations.push({ kind: 'malformed', raw });
      continue;
    }
    const name = raw.slice(0, colon).trim();
    declarations.push({
      kind: 'declaration',
      property: name.startsWith('--') ? name : name.toLowerCase(),
      // Braces and angle brackets would let a value escape its rule in the generated sheet.
      value: raw
        .slice(colon + 1)
        .trim()
        .replace(/[{}<>]/g, ''),
    });
  }
  return declarations;
}

function editDistance(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      const substitution = (previous[j - 1] ?? 0) + (a[i - 1] === b[j - 1] ? 0 : 1);
      row[j] = Math.min((previous[j] ?? 0) + 1, (row[j - 1] ?? 0) + 1, substitution);
    }
    previous = row;
  }
  return previous[b.length] ?? 0;
}

/** The closest name within three edits, for "did you mean…?". */
function closest(name: string, candidates: readonly string[]): string | null {
  let best: string | null = null;
  let distance = 4;
  for (const candidate of candidates) {
    const next = editDistance(name, candidate);
    if (next < distance) {
      distance = next;
      best = candidate;
    }
  }
  return best;
}

function supports(property: string, value: string): boolean {
  try {
    return CSS.supports(property, value);
  } catch {
    return false;
  }
}

export type DeclarationCheck =
  | { readonly kind: 'ok' }
  /** A real property this lesson does not allow: it is silently left out of the sheet. */
  | { readonly kind: 'sealed'; readonly property: string }
  | { readonly kind: 'error'; readonly message: string };

const OK: DeclarationCheck = { kind: 'ok' };
const error = (message: string): DeclarationCheck => ({ kind: 'error', message });

function checkCustomProperty(
  property: string,
  value: string,
  allowed: readonly string[],
): DeclarationCheck {
  if (!/^--[a-zA-Z_][\w-]*$/.test(property)) {
    return error(`«${escapeHtml(property)}» no es un nombre de variable válido.`);
  }
  if (!allowed.includes(property) && !allowed.includes('--*')) {
    const suggestion = closest(
      property,
      allowed.filter((name) => name.startsWith('--')),
    );
    return suggestion
      ? error(
          `En este ejercicio no se usa <code>${escapeHtml(property)}</code>. ¿Querías decir <code>${suggestion}</code>? (Mayúsculas y minúsculas cuentan.)`,
        )
      : { kind: 'sealed', property };
  }
  return value ? OK : error(`<code>${escapeHtml(property)}</code> necesita un valor.`);
}

/**
 * @param allowed the lesson's runes
 * @param known every property the game teaches, for suggestions
 */
export function checkDeclaration(
  declaration: Declaration,
  allowed: readonly string[],
  known: readonly string[],
): DeclarationCheck {
  if (declaration.kind === 'malformed') {
    return error(`Falta <code>:</code> en «${escapeHtml(declaration.raw.slice(0, 40))}».`);
  }
  const { property, value } = declaration;
  if (property.startsWith('--')) return checkCustomProperty(property, value, allowed);
  if (!/^-?[a-z][a-z-]*$/.test(property)) {
    return error(`«${escapeHtml(property)}» no es un nombre de propiedad válido.`);
  }
  if (!supports(property, 'inherit')) {
    const suggestion = closest(property, [...allowed, ...known]);
    return error(
      `«${escapeHtml(property)}» no es una propiedad CSS.${suggestion ? ` ¿Querías decir <code>${suggestion}</code>?` : ''}`,
    );
  }
  if (!allowed.includes(property)) return { kind: 'sealed', property };
  if (!value) return error(`<code>${property}</code> necesita un valor.`);
  // `!important` is not part of the value, so CSS.supports() would reject it.
  if (!supports(property, value.replace(/\s*!\s*important\s*$/i, ''))) {
    const semicolon = value.includes(':') ? ' ¿Falta un punto y coma?' : '';
    return error(
      `«${escapeHtml(value.slice(0, 60))}» no es un valor válido para <code>${property}</code>.${semicolon}`,
    );
  }
  return OK;
}
