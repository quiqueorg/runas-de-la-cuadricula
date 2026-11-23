/**
 * The map screen's own state (open card, index filters, jokes, ripples) and what each click means.
 * Pure: `reduceMap` returns the next state and the effect the screen should run.
 */
import { levelsById } from '../../core/catalog';
import type { Progress } from '../../core/progress/types';
import { inhabitantOf, type Joke, nextJoke } from './inhabitants';

export type StatusFilter = 'all' | 'pending' | 'done';

export interface Ripple {
  readonly id: number;
  readonly x: string;
  readonly y: string;
}

export interface MapUi {
  /** Region whose card is open. */
  readonly card: number | null;
  readonly indexOpen: boolean;
  readonly query: string;
  readonly status: StatusFilter;
  readonly tags: ReadonlySet<string>;
  readonly joke: Joke | null;
  /** Which joke each inhabitant told last. */
  readonly told: Readonly<Record<string, number>>;
  readonly spin: boolean;
  readonly ripples: readonly Ripple[];
}

export const initialMapUi: MapUi = {
  card: null,
  indexOpen: false,
  query: '',
  status: 'all',
  tags: new Set(),
  joke: null,
  told: {},
  spin: false,
  ripples: [],
};

/** What the player clicked on the chart. */
export type MapHit =
  | { readonly kind: 'inhabitant'; readonly key: string }
  | { readonly kind: 'secret'; readonly id: string }
  | { readonly kind: 'stop'; readonly id: string }
  | { readonly kind: 'region'; readonly region: number }
  | { readonly kind: 'compass' }
  /** Empty ground, in percentages of the chart. */
  | { readonly kind: 'ground'; readonly x: string; readonly y: string; readonly rippleId: number };

export type MapAction =
  | { readonly type: 'hit'; readonly hit: MapHit }
  | { readonly type: 'close-card' }
  | { readonly type: 'toggle-index' }
  | { readonly type: 'close-index' }
  | { readonly type: 'query'; readonly value: string }
  | { readonly type: 'status'; readonly value: StatusFilter }
  | { readonly type: 'toggle-tag'; readonly tag: string }
  | { readonly type: 'clear-filters' }
  | { readonly type: 'spin'; readonly on: boolean }
  | { readonly type: 'drop-ripple'; readonly id: number }
  | { readonly type: 'greet'; readonly key: string };

export interface SecretNotice {
  readonly id: string;
  readonly title: string;
  readonly text: string;
  readonly icon: string;
}

export type MapEffect =
  | { readonly type: 'none' }
  | { readonly type: 'sound'; readonly name: 'click' | 'glub' }
  | { readonly type: 'talk'; readonly voice: string }
  | { readonly type: 'open-lesson'; readonly id: string }
  /** A secret place found for the first time. */
  | { readonly type: 'secret'; readonly notice: SecretNotice }
  | { readonly type: 'ripple'; readonly id: number }
  | { readonly type: 'spin-compass' };

const NONE: MapEffect = { type: 'none' };
const CLICK: MapEffect = { type: 'sound', name: 'click' };

function jokeEffect(key: string): MapEffect {
  const inhabitant = inhabitantOf(key);
  if (inhabitant?.curio) return CLICK;
  if (inhabitant?.sprite) return { type: 'talk', voice: inhabitant.voice ?? '' };
  return { type: 'sound', name: 'glub' };
}

function secretEffect(id: string, progress: Progress): MapEffect {
  const level = levelsById[id];
  if (!level?.secret) return NONE;
  if (progress.foundSecrets[id]) return { type: 'open-lesson', id };
  return {
    type: 'secret',
    notice: {
      id,
      title: `Lugar secreto: ${level.title}`,
      text: `${level.character ?? ''} te espera con un ejercicio que no aparece en ningún camino.`,
      icon: `dib-${level.secret.drawing}`,
    },
  };
}

function reduceHit(ui: MapUi, hit: MapHit, progress: Progress): { ui: MapUi; effect: MapEffect } {
  switch (hit.kind) {
    case 'inhabitant': {
      const told = nextJoke(hit.key, ui.told);
      if (!told) return { ui, effect: NONE };
      return { ui: { ...ui, joke: told.joke, told: told.told }, effect: jokeEffect(hit.key) };
    }
    case 'secret':
      return { ui, effect: secretEffect(hit.id, progress) };
    case 'stop':
      return { ui, effect: { type: 'open-lesson', id: hit.id } };
    case 'region':
      return { ui: { ...ui, indexOpen: false, card: hit.region }, effect: CLICK };
    case 'compass':
      // Stop first, so a second click restarts the spin.
      return { ui: { ...ui, spin: false }, effect: { type: 'spin-compass' } };
    case 'ground':
      return {
        ui: {
          ...ui,
          joke: null,
          card: null,
          ripples: [...ui.ripples, { id: hit.rippleId, x: hit.x, y: hit.y }],
        },
        effect: { type: 'ripple', id: hit.rippleId },
      };
  }
}

export function reduceMap(
  ui: MapUi,
  action: MapAction,
  progress: Progress,
): { readonly ui: MapUi; readonly effect: MapEffect } {
  switch (action.type) {
    case 'hit':
      return reduceHit(ui, action.hit, progress);
    case 'close-card':
      return { ui: { ...ui, card: null }, effect: NONE };
    case 'toggle-index':
      return { ui: { ...ui, card: null, indexOpen: !ui.indexOpen }, effect: CLICK };
    case 'close-index':
      return { ui: { ...ui, indexOpen: false }, effect: NONE };
    case 'query':
      return { ui: { ...ui, query: action.value }, effect: NONE };
    case 'status':
      return { ui: { ...ui, status: action.value }, effect: NONE };
    case 'toggle-tag': {
      const tags = new Set(ui.tags);
      if (tags.has(action.tag)) tags.delete(action.tag);
      else tags.add(action.tag);
      return { ui: { ...ui, tags }, effect: CLICK };
    }
    case 'clear-filters':
      return { ui: { ...ui, tags: new Set(), query: '', status: 'all' }, effect: NONE };
    case 'spin':
      return { ui: { ...ui, spin: action.on }, effect: NONE };
    case 'drop-ripple':
      return {
        ui: { ...ui, ripples: ui.ripples.filter((item) => item.id !== action.id) },
        effect: NONE,
      };
    case 'greet': {
      // A greeting never interrupts a joke the player asked for.
      if (ui.joke) return { ui, effect: NONE };
      const told = nextJoke(action.key, ui.told);
      return told
        ? { ui: { ...ui, joke: told.joke, told: told.told }, effect: NONE }
        : { ui, effect: NONE };
    }
  }
}

/** A click's position as percentages of the chart. */
export function chartPercent(
  clientX: number,
  clientY: number,
  chart: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>,
): { x: string; y: string } {
  return {
    x: `${(((clientX - chart.left) / chart.width) * 100).toFixed(2)}%`,
    y: `${(((clientY - chart.top) / chart.height) * 100).toFixed(2)}%`,
  };
}
