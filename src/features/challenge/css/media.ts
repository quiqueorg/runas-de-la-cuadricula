/**
 * Media queries on a board. The board plays the window, so a media query becomes a container query
 * on it. What a container cannot measure (the medium, the pointer, the player's preferences) is
 * answered from the current `BoardView` and written as a size test that is always or never true.
 */
import type { BoardView } from '../../../core/models';
import { escapeHtml } from '../../../shared/dom';
import { stripComments } from './declarations';

export type MediaConversion =
  | { readonly kind: 'empty' }
  | { readonly kind: 'error'; readonly message: string }
  | { readonly kind: 'container'; readonly query: string };

/** Words a condition field accepts as runes, besides the properties. */
export const CONDITION_TOKENS: ReadonlySet<string> = new Set([
  'min-width',
  'max-width',
  'width',
  'min-height',
  'max-height',
  'height',
  'orientation',
  'aspect-ratio',
  'min-aspect-ratio',
  'max-aspect-ratio',
  'hover',
  'pointer',
  'prefers-color-scheme',
  'prefers-reduced-motion',
  'screen',
  'print',
  'all',
  'and',
  'or',
  'not',
  '<',
  '<=',
  '>',
  '>=',
]);

const SIZE_FEATURES = new Set([
  'width',
  'min-width',
  'max-width',
  'height',
  'min-height',
  'max-height',
  'aspect-ratio',
  'min-aspect-ratio',
  'max-aspect-ratio',
  'orientation',
]);
const DEVICE_FEATURES = new Set([
  'hover',
  'any-hover',
  'pointer',
  'any-pointer',
  'prefers-color-scheme',
  'prefers-reduced-motion',
]);
const MEDIA_TYPES = new Set(['all', 'screen', 'print', 'speech']);
const ALWAYS = '(width >= 0px)';
const NEVER = '(width < 0px)';
const CACHE_LIMIT = 600;

/** Views that differ only in size answer every device question the same way. */
export const deviceKey = (view: BoardView): string =>
  `${view.media}|${view.colorScheme}|${view.pointer}|${view.reducedMotion ? 1 : 0}`;

/** Splits on commas outside parentheses. */
export const splitList = (value: string): string[] =>
  value.split(/,(?![^(]*\))/).map((part) => part.trim());

function deviceAnswers(feature: string, value: string | undefined, view: BoardView): boolean {
  if (feature === 'hover' || feature === 'any-hover') {
    return value === 'none' ? view.pointer === 'coarse' : view.pointer === 'fine';
  }
  if (feature === 'pointer' || feature === 'any-pointer') {
    return value === undefined || value === view.pointer;
  }
  if (feature === 'prefers-color-scheme') return value === undefined || value === view.colorScheme;
  return value === 'no-preference' ? !view.reducedMotion : view.reducedMotion;
}

const fail = (message: string): MediaConversion => ({ kind: 'error', message });

/** Whether the browser accepts the condition as a media query. */
function browserParses(condition: string): boolean {
  try {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(`@media ${condition} {}`);
    const rule = sheet.cssRules[0];
    const text = rule instanceof CSSMediaRule ? rule.media.mediaText : 'not all';
    return Boolean(text) && text !== 'not all';
  } catch {
    return false;
  }
}

function containerParses(query: string): boolean {
  try {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(`@container ${query} {}`);
    return sheet.cssRules.length > 0;
  } catch {
    return false;
  }
}

/** `screen and (…)`: the media type, already answered, and the conditions that follow it. */
function splitMediaType(
  part: string,
  view: BoardView,
): { typed: boolean | null; negated: boolean; rest: string } | MediaConversion {
  if (part.startsWith('(') || /^not\s*\(/i.test(part))
    return { typed: null, negated: false, rest: part };
  const lead = /^(?:(not|only)\s+)?([a-z-]+)\b\s*(.*)$/i.exec(part);
  const type = lead?.[2]?.toLowerCase() ?? '';
  if (!lead || !MEDIA_TYPES.has(type)) {
    return SIZE_FEATURES.has(type) || DEVICE_FEATURES.has(type)
      ? fail(`La condición va entre paréntesis: <code>(${escapeHtml(part.slice(0, 40))})</code>.`)
      : fail(
          `«${escapeHtml((type || part).slice(0, 30))}» no es un tipo de medio. Los que se usan son <code>screen</code>, <code>print</code> y <code>all</code>.`,
        );
  }
  let rest = (lead[3] ?? '').trim();
  if (rest) {
    if (!/^and\s/i.test(rest)) {
      return fail(
        'Después del tipo de medio, las condiciones se unen con <code>and</code>: <code>screen and (min-width: 500px)</code>.',
      );
    }
    rest = rest.replace(/^and\s+/i, '');
  }
  return {
    typed: type === 'all' || type === view.media,
    negated: lead[1]?.toLowerCase() === 'not',
    rest,
  };
}

/** The conditions after the media type, as a container condition. */
function convertConditions(
  { typed, negated, rest }: { typed: boolean | null; negated: boolean; rest: string },
  view: BoardView,
): string | MediaConversion {
  const features = [...rest.matchAll(/\(\s*([a-z-]+)\s*[:<>=)]|[<>=]\s*([a-z-]+)\s*[<>=)]/gi)].map(
    (match) => (match[1] ?? match[2] ?? '').toLowerCase(),
  );
  const odd = features.find((name) => !SIZE_FEATURES.has(name) && !DEVICE_FEATURES.has(name));
  if (odd) {
    return fail(
      `Aquí el tablero hace de pantalla, y <code>${escapeHtml(odd)}</code> no es algo que sepa responder.`,
    );
  }
  const sized = rest.replace(
    /\(\s*([a-z-]+)\s*(?::\s*([a-z-]+)\s*)?\)/gi,
    (whole: string, name: string, value: string | undefined) => {
      const feature = name.toLowerCase();
      if (!DEVICE_FEATURES.has(feature)) return whole;
      return deviceAnswers(feature, value?.toLowerCase(), view) ? ALWAYS : NEVER;
    },
  );
  if (typed === null) return sized;
  const medium = typed ? ALWAYS : NEVER;
  const query = sized ? `${medium} and ${/\sor\s/i.test(sized) ? `(${sized})` : sized}` : medium;
  return negated ? `not (${query})` : query;
}

function convert(text: string, view: BoardView): MediaConversion {
  const flat = stripComments(text).replace(/\s+/g, ' ').trim();
  if (!flat) return { kind: 'empty' };
  const condition = flat
    .replace(/^@media\s*/i, '')
    .replace(/\s*\{.*$/, '')
    .trim();
  if (!condition) {
    return fail(
      'Falta la condición entre paréntesis, por ejemplo <code>(max-width: 400px)</code>.',
    );
  }
  const invalid = fail(
    `«${escapeHtml(condition.slice(0, 50))}» no es una condición válida. Revisa los paréntesis, los dos puntos y las unidades.`,
  );
  const parses = browserParses(condition);
  const parts: string[] = [];
  // Each part's media type is explained first: it is a likelier slip than a malformed condition.
  for (const piece of splitList(condition)) {
    const split = splitMediaType(piece, view);
    if ('kind' in split) return split;
    if (!parses) return invalid;
    const converted = convertConditions(split, view);
    if (typeof converted !== 'string') return converted;
    parts.push(converted);
  }
  if (!parses) return invalid;
  const query = parts.length > 1 ? parts.map((part) => `(${part})`).join(' or ') : (parts[0] ?? '');
  if (!containerParses(query)) {
    return fail(`No he sabido interpretar «${escapeHtml(condition.slice(0, 50))}».`);
  }
  return { kind: 'container', query };
}

const cache = new Map<string, MediaConversion>();

export function convertMedia(text: string, view: BoardView): MediaConversion {
  const key = `${deviceKey(view)}|${text}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const result = convert(text, view);
  if (cache.size > CACHE_LIMIT) cache.clear();
  cache.set(key, result);
  return result;
}

/** The container condition, or null when the text does not convert. */
export const containerQuery = (text: string, view: BoardView): string | null => {
  const converted = convertMedia(text, view);
  return converted.kind === 'container' ? converted.query : null;
};
