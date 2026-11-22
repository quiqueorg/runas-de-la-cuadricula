/** Map commands. The view reports what was pointed at; it does not decide what that means. */
export type StatusFilter = 'todas' | 'pendientes' | 'hechas';

export interface Ripple {
  readonly id: number;
  readonly x: string;
  readonly y: string;
}

export interface Joke {
  readonly speaker: string;
  readonly name: string;
  readonly text: string;
}

export interface MapUi {
  readonly card: number | null;
  readonly indexOpen: boolean;
  readonly query: string;
  readonly status: StatusFilter;
  readonly tags: ReadonlySet<string>;
  readonly joke: Joke | null;
  readonly spin: boolean;
  readonly ripples: readonly Ripple[];
  readonly cursors: Readonly<Record<string, number>>;
}

export const initialMapUi: MapUi = {
  card: null,
  indexOpen: false,
  query: '',
  status: 'todas',
  tags: new Set(),
  joke: null,
  spin: false,
  ripples: [],
  cursors: {},
};

export type MapHit =
  | { readonly kind: 'inhabitant'; readonly key: string }
  | { readonly kind: 'secret'; readonly id: string }
  | { readonly kind: 'stop'; readonly id: string }
  | { readonly kind: 'region'; readonly region: number }
  | { readonly kind: 'compass' }
  | { readonly kind: 'ground'; readonly x: string; readonly y: string };

export type MapAction =
  | { readonly type: 'hit'; readonly hit: MapHit; readonly rippleId: number }
  | { readonly type: 'close-card' }
  | { readonly type: 'toggle-index' }
  | { readonly type: 'query'; readonly value: string }
  | { readonly type: 'status'; readonly value: StatusFilter }
  | { readonly type: 'toggle-tag'; readonly tag: string }
  | { readonly type: 'clear-filters' }
  | { readonly type: 'spin-done' }
  | { readonly type: 'drop-ripple'; readonly id: number }
  | { readonly type: 'greet'; readonly key: string }
  | { readonly type: 'close-index' };

export interface SecretNotice {
  readonly id: string;
  readonly title: string;
  readonly text: string;
  readonly icon: string;
}

export type MapEffect =
  | { readonly type: 'none' }
  | { readonly type: 'sound'; readonly name: 'clic' | 'gota' | 'glub' | 'secreto' }
  | { readonly type: 'talk'; readonly animal: string }
  | { readonly type: 'navigate'; readonly hash: string }
  | { readonly type: 'secret'; readonly notice: SecretNotice }
  | { readonly type: 'schedule-ripple'; readonly id: number };
