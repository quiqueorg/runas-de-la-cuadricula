/** The tablet: what the player edits, how it is laid out, saved and coloured. Pure. */
import type { Level } from '../../core/models';

/** Everything the player can write in one lesson. */
export interface TabletText {
  /** Declarations, one entry per rule (empty for rules that are not editable). */
  readonly declarations: readonly string[];
  /** Conditions, one entry per media group. */
  readonly conditions: readonly string[];
  /** Selectors, one entry per rule; only rules with `ownSelector` use theirs. */
  readonly selectors: readonly string[];
}

/** The tablet filled with the solution, or as the lesson starts. */
export function tabletOf(level: Level, which: 'solution' | 'initial'): TabletText {
  return {
    declarations: level.rules.map((rule) => rule[which]),
    conditions: level.mediaGroups.map((group) => group[which]),
    selectors: level.rules.map((rule) => {
      if (rule.ownSelector === undefined) return '';
      return which === 'solution' ? rule.selector : rule.ownSelector;
    }),
  };
}

/**
 * The saved form, a flat list: every rule's declarations, then every group's condition (empty for
 * fixed ones), then the selectors the player writes. Saved games depend on this order.
 */
export function savedCodeOf(level: Level, tablet: TabletText): string[] {
  return [
    ...tablet.declarations,
    ...level.mediaGroups.map((group, index) =>
      group.fixed ? '' : (tablet.conditions[index] ?? ''),
    ),
    ...level.rules.flatMap((rule, index) =>
      rule.ownSelector === undefined ? [] : [tablet.selectors[index] ?? ''],
    ),
  ];
}

/** Reads `savedCodeOf`'s list back, falling back to the lesson's start for anything missing. */
export function tabletFromSaved(level: Level, saved: readonly string[] | undefined): TabletText {
  const start = tabletOf(level, 'initial');
  const read = (position: number, fallback: string) => {
    const value = saved?.[position];
    return typeof value === 'string' ? value : fallback;
  };
  const conditionsAt = level.rules.length;
  let selectorAt = conditionsAt + level.mediaGroups.length;
  return {
    declarations: start.declarations.map((text, index) => read(index, text)),
    conditions: start.conditions.map((text, index) => read(conditionsAt + index, text)),
    selectors: level.rules.map((rule, index) =>
      rule.ownSelector === undefined ? '' : read(selectorAt++, start.selectors[index] ?? ''),
    ),
  };
}

export const replaceAt = <T>(list: readonly T[], index: number, value: T): T[] =>
  list.map((item, at) => (at === index ? value : item));

// ─── Layout ──────────────────────────────────────────────────────────────────────────────────────

export interface EditorRule {
  readonly index: number;
  readonly selector: string;
  /** The player writes this rule's selector. */
  readonly ownSelector: boolean;
  readonly fixed: string | null;
  readonly editable: boolean;
}

export type EditorRow =
  | ({ readonly kind: 'rule' } & EditorRule)
  | {
      readonly kind: 'media';
      readonly group: number;
      readonly fixed: boolean;
      readonly condition: string;
      readonly rules: readonly EditorRule[];
    };

/** The tablet's rows: plain rules, and media blocks around the rules they wrap. Hidden rules are left out. */
export function editorRows(level: Level): EditorRow[] {
  const rows: EditorRow[] = [];
  level.rules.forEach((rule, index) => {
    if (rule.hidden) return;
    const item: EditorRule = {
      index,
      selector: rule.selector,
      ownSelector: rule.ownSelector !== undefined,
      fixed: rule.fixed || null,
      editable: rule.editable,
    };
    if (rule.mediaGroup < 0) {
      rows.push({ kind: 'rule', ...item });
      return;
    }
    const last = rows.at(-1);
    if (last?.kind === 'media' && last.group === rule.mediaGroup) {
      rows[rows.length - 1] = { ...last, rules: [...last.rules, item] };
      return;
    }
    const group = level.mediaGroups[rule.mediaGroup];
    rows.push({
      kind: 'media',
      group: rule.mediaGroup,
      fixed: Boolean(group?.fixed),
      condition: group?.solution ?? '',
      rules: [item],
    });
  });
  return rows;
}

// ─── Syntax colouring ────────────────────────────────────────────────────────────────────────────

export type TokenKind =
  | 'plain'
  | 'comment'
  | 'string'
  | 'attribute'
  | 'property'
  | 'variable'
  | 'sealed'
  | 'number'
  | 'punctuation';

export interface CodeToken {
  readonly text: string;
  readonly kind: TokenKind;
}

const TOKENS =
  /(\/\*[\s\S]*?(?:\*\/|$))|("[^"\n]*"?|'[^'\n]*'?)|(\[[^\]\n]*\]?)|(-{0,2}[a-zA-Z][\w-]*)(\s*:)|(--[a-zA-Z][\w-]*)|(-?\d*\.?\d+(?:px|fr|%|em|rem|vh|vw|deg|ms|s)?)|([;:/{}(),<>=*])/g;

/** Capture groups of `TOKENS` that map straight to a kind. Group 4 (a name before `:`) is special. */
const GROUP_KINDS: readonly (readonly [number, TokenKind])[] = [
  [1, 'comment'],
  [2, 'string'],
  [3, 'attribute'],
  [6, 'variable'],
  [7, 'number'],
  [8, 'punctuation'],
];

function propertyKind(name: string, fixed: boolean, allowed: readonly string[]): TokenKind {
  if (name.startsWith('--')) return 'variable';
  const property = name.toLowerCase();
  return fixed || allowed.includes(property) ? 'property' : 'sealed';
}

function tokensOf(
  match: RegExpMatchArray,
  fixed: boolean,
  allowed: readonly string[],
): CodeToken[] {
  const name = match[4];
  if (name) {
    return [
      { text: name, kind: propertyKind(name, fixed, allowed) },
      { text: match[5] ?? '', kind: 'punctuation' },
    ];
  }
  const [group, kind] = GROUP_KINDS.find(([index]) => match[index]) ?? [8, 'punctuation'];
  return [{ text: match[group] ?? '', kind }];
}

/**
 * Colours CSS for the tablet. A property the lesson does not allow is marked sealed, unless the text
 * is fixed (the lesson's own declarations). A custom property is never sealed here.
 */
export function highlight(text: string, fixed: boolean, allowed: readonly string[]): CodeToken[] {
  const tokens: CodeToken[] = [];
  let last = 0;
  for (const match of text.matchAll(TOKENS)) {
    tokens.push(
      { text: text.slice(last, match.index), kind: 'plain' },
      ...tokensOf(match, fixed, allowed),
    );
    last = match.index + match[0].length;
  }
  tokens.push({ text: text.slice(last), kind: 'plain' });
  return tokens.filter((token) => token.text);
}

// ─── Inserting runes ─────────────────────────────────────────────────────────────────────────────

/** Words that stand alone in a condition, without parentheses. */
const BARE_WORDS = new Set([
  'width',
  'height',
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

/** What a rune chip inserts, and how far back the caret goes (inside the value or the parentheses). */
export function runeSnippet(
  property: string,
  inCondition: boolean,
): { text: string; rewind: number } {
  if (!inCondition) return { text: `${property}: ;`, rewind: 1 };
  if (property === 'width' || property === 'height') return { text: property, rewind: 0 };
  if (BARE_WORDS.has(property)) return { text: ` ${property} `, rewind: 0 };
  return { text: `(${property}: )`, rewind: 1 };
}
