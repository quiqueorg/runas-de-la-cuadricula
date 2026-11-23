/**
 * Builds the CSS that styles the board layers. The same lesson rules are drawn several times (the
 * player's board, the goal, hidden copies for measuring), so every selector is scoped to its layer.
 */
import type { Level } from '../../../core/models';
import { escapeHtml } from '../../../shared/dom';
import { stripComments } from './declarations';
import { splitList } from './media';

/** Layers the player's CSS is applied to. */
export const PLAYER_LAYERS = ['#player-layer', '#probe'] as const;
/** Layers the lesson's solution is applied to. */
export const GOAL_LAYERS = ['#target-layer', '#outline-layer', '#probe-target'] as const;

/**
 * Keeps a lesson selector inside its layer. `:root` is the board (the element everything hangs
 * from, and one a container query can still reach); an id is matched through `data-id` too, since
 * the same piece is drawn in several layers; and the interactive states can be switched on by a
 * class, so the goal and the hidden copies can show them without a real pointer.
 */
function scopeSelector(layer: string, selector: string): string {
  const live = layer === '#player-layer';
  const state = (name: string) => (live ? `:is(:${name},.sim-${name})` : `.sim-${name}`);
  return splitList(selector)
    .map((part) => {
      const text = part
        .replace(/#([a-zA-Z_][\w-]*)/g, ':is(#$1,[data-id="$1"])')
        .replace(/:hover\b/g, state('hover'))
        .replace(/:active\b/g, state('active'))
        .replace(/:focus\b(?!-)/g, state('focus'));
      return text.startsWith(':root') ? `${layer} .tablero${text.slice(5)}` : `${layer} ${text}`;
    })
    .join(',');
}

/** Why a selector the player wrote cannot be used, or null when it can. */
export function selectorProblem(text: string): string | null {
  const selector = stripComments(text).trim();
  if (!selector) return null;
  if (/[{};@]/.test(selector)) {
    return 'El selector no lleva llaves ni punto y coma: solo dice <b>a quién</b> se aplica la regla.';
  }
  try {
    document.createDocumentFragment().querySelector(selector);
  } catch {
    return `«${escapeHtml(selector.slice(0, 50))}» no es un selector válido.`;
  }
  return null;
}

export interface SheetSource {
  /** Declarations for each rule. */
  readonly bodies: readonly string[];
  /** Container condition for each media group; null leaves the group's rules out. */
  readonly conditions: readonly (string | null)[];
  /** Selector for each rule the player writes the selector of. */
  readonly selectors?: readonly (string | null)[];
}

/** The lesson's rules, scoped to `layers`, with the given declarations and conditions. */
export function layerCss(level: Level, layers: readonly string[], source: SheetSource): string {
  return level.rules
    .map((rule, index) => {
      const selector =
        source.selectors && rule.ownSelector !== undefined
          ? source.selectors[index]
          : rule.selector;
      if (!selector) return '';
      const scoped = layers.map((layer) => scopeSelector(layer, selector)).join(',');
      const block = `${scoped}{${rule.fixed}\n${source.bodies[index] ?? ''}}`;
      if (rule.mediaGroup < 0) return block;
      const condition = source.conditions[rule.mediaGroup];
      return condition ? `@container ${condition}{${block}}` : '';
    })
    .join('\n');
}
