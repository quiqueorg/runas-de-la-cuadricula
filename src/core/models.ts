/**
 * Domain model. Lessons are authored as drafts (`LevelDraft`, `RegionDraft`) in `core/data` and
 * normalized by the catalog into the runtime shapes (`Level`, `Region`) the features read.
 *
 * Player-facing copy stays in Spanish, and so do the CSS classes a player writes (`.tablero`,
 * `.pieza`, piece types such as `huerto`): they are lesson content, not identifiers.
 */

export type WorldId = 'isle' | 'grid' | 'flex' | 'sky' | 'finale';

/** A simulated interaction the lesson asks the player to style. */
export type BoardState = 'active' | 'hover' | 'pressed' | 'focus';

/** A piece written `type@class.class#id[attr=value]:text`, or a list of children of the piece before it. */
export type PieceSpec = string | readonly PieceSpec[];

/** How a piece type is drawn. */
export interface PieceType {
  /** Material that stretches over the whole piece (a `.m-<material>` texture). */
  readonly material?: string;
  /** Token drawn centred on the piece (an `i-<token>` symbol). */
  readonly token?: string;
  /** Icon drawn over the material. */
  readonly icon?: string;
  /** A sign that shows the piece's text. */
  readonly sign?: boolean;
  /** Real element name. The type is then not a class: the tag identifies the piece. */
  readonly tag?: string;
  /** The piece is its text, written straight inside the element. */
  readonly isText?: boolean;
}

export type PieceTypeMap = Readonly<Record<string, PieceType>>;

/** One way of looking at the board: its size and what the device reports to media queries. */
export interface BoardView {
  readonly width: number;
  readonly height: number;
  /** Label of the view switcher, e.g. `400px` or `Móvil`. */
  readonly name: string;
  readonly media: 'screen' | 'print';
  readonly colorScheme: 'light' | 'dark';
  readonly pointer: 'fine' | 'coarse';
  readonly reducedMotion: boolean;
}

export type BoardViewDraft = Partial<BoardView>;

/** A media query the player writes. */
export interface MediaDraft {
  readonly solution: string;
  readonly initial?: string;
}

export interface BoardRuleDraft {
  readonly selector: string;
  /** Declarations shown on the tablet but not editable. */
  readonly fixed?: string;
  readonly solution?: string;
  /** Defaults to true. A rule that is not editable is scenery. */
  readonly editable?: boolean;
  /** What the player's field starts with. */
  readonly initial?: string;
  /** Applied to both boards but never shown on the tablet. */
  readonly hidden?: boolean;
  /** Media query around the rule: fixed text, or a condition the player writes. */
  readonly media?: string | MediaDraft;
  /** The player writes the selector; this is the field's starting text and `selector` the solution. */
  readonly ownSelector?: string;
}

export interface BoardRule {
  readonly selector: string;
  readonly fixed: string;
  readonly solution: string;
  readonly editable: boolean;
  readonly initial: string;
  readonly hidden: boolean;
  /** Index in `Level.mediaGroups`, or -1 when the rule is not inside a media query. */
  readonly mediaGroup: number;
  readonly ownSelector?: string;
}

/** Consecutive rules that share one media query. */
export interface MediaGroup {
  readonly fixed: boolean;
  readonly solution: string;
  readonly initial: string;
}

/** A lesson hidden on the map, found by clicking a drawing. */
export interface SecretPlace {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  /** Symbol `dib-<drawing>` shown when the secret is found. */
  readonly drawing: string;
  readonly hint: string;
}

/** A bargaining lesson: every declaration costs `price` out of `total`. */
export interface Purse {
  readonly total: number;
  readonly price: number;
}

/** An extra condition of the objective, tested against what the player wrote. */
export interface RuleCheck {
  readonly pattern: RegExp;
  readonly message: string;
  /** Test only this rule's declarations. */
  readonly rule?: number;
  /** Test the media query conditions. */
  readonly inCondition?: boolean;
  /** Test the selectors the player wrote. */
  readonly inSelector?: boolean;
}

/** A recognisable wrong turn: when every listed property computes to its value, say what to look at. */
export interface Misstep {
  readonly selector?: string;
  readonly when: Readonly<Record<string, string>>;
  readonly message: string;
}

/** The pieces matching `upper` must be drawn above those matching `lower`. */
export interface StackingCheck {
  readonly upper: string;
  readonly lower: string;
  readonly message: string;
}

export interface TimeMessages {
  /** Shown when the clock runs out. */
  readonly expired?: string;
  /** Victory text when the lesson was solved after the clock ran out. */
  readonly late?: string;
}

export interface Piece {
  readonly type: string;
  /** Extra classes, space separated. */
  readonly variant: string;
  /** Fixed to the board: the player does not need to place it. */
  readonly pinned: boolean;
  readonly text: string;
  /** Index of the parent piece, or -1. */
  readonly parent: number;
  readonly kind: PieceType;
  /** Class label drawn on the piece, or ''. */
  readonly label: string;
  readonly id: string;
  /** How the piece reads in the markup (`p.nota#aviso`), shown on pieces that are real elements. */
  readonly markup: string;
  readonly hasChildren: boolean;
  /** HTML attributes written `[name=value]` after the class and id, for attribute selectors. */
  readonly attrs?: Readonly<Record<string, string>>;
}

/** What an author writes for one lesson. See README.md for the full guide. */
export interface LevelDraft {
  /** Save key: never renumber or reuse one. */
  readonly id: string;
  /** Region index inside the lesson's world. */
  readonly region: number;
  readonly title: string;
  /** Symbol shown on the map when the lesson is done. Defaults to the first movable piece's. */
  readonly landmark?: string;
  /** Properties the player may write ("runes"). Any other one is sealed. */
  readonly allowed?: readonly string[];
  /** What the region's character asks for. */
  readonly speech?: string;
  readonly theory?: string;
  readonly objective?: string;
  readonly hint?: string;
  /** Gentler hints shown before `hint`. */
  readonly earlyHints?: readonly string[];
  /** A small optional exercise offered in the victory dialog. */
  readonly practice?: 'column-gaps';
  readonly missteps?: readonly Misstep[];
  readonly note?: string;
  readonly pieces: readonly PieceSpec[];
  readonly rules: readonly BoardRuleDraft[];
  readonly width?: number;
  readonly height?: number;
  /** Several board widths, each one a view. */
  readonly widths?: readonly number[];
  readonly views?: readonly BoardViewDraft[];
  /** Draw class labels on pieces. Defaults to true. */
  readonly labels?: boolean;
  /** Draw labels on pinned pieces too. Defaults to true. */
  readonly labelPinned?: boolean;
  /** Kind of special lesson, shown as a filter tag (`contra reloj`, `a oscuras`…). */
  readonly variant?: string;
  readonly className?: string;
  readonly exam?: boolean;
  readonly boss?: boolean;
  readonly secret?: SecretPlace;
  /** Floor texture and music; defaults to the region's. */
  readonly terrain?: string;
  readonly character?: string;
  readonly role?: string;
  readonly portrait?: string;
  /** What the character says once the lesson is solved. */
  readonly farewell?: string;
  /** Seconds on the clock. */
  readonly timeLimit?: number;
  readonly timeMessages?: TimeMessages;
  readonly state?: BoardState;
  /** Size of token pieces, or false for their natural size. */
  readonly tokenSize?: false | readonly [number, number];
  /** Computed styles compared besides the position. */
  readonly compare?: readonly string[];
  /** Concept tags for the map index filters. */
  readonly concepts?: readonly string[];
  /** Pieces sing when they fall into place. */
  readonly musical?: boolean;
  /** Name of a boss phase. */
  readonly phase?: string;
  /** The goal cannot be peeked at on the board. */
  readonly mirage?: boolean;
  readonly purse?: Purse;
  readonly purseMessage?: string;
  readonly above?: readonly StackingCheck[];
  readonly checks?: readonly RuleCheck[];
  /** Show the board's markup next to the theory. */
  readonly showMarkup?: boolean;
  /** The board is not the container being taught, so do not warn that it is not one. */
  readonly hideNotice?: boolean;
  readonly maxDeclarations?: number;
}

/** A normalized lesson. */
export interface Level
  extends Omit<
    LevelDraft,
    'pieces' | 'rules' | 'width' | 'height' | 'widths' | 'views' | 'allowed' | 'landmark' | 'region'
  > {
  readonly world: WorldId;
  /** Global region index in `catalog.regions`. */
  readonly region: number;
  /** Position in `catalog.levels`. */
  readonly index: number;
  /** Width of the first view. */
  readonly width: number;
  /** Tallest view. */
  readonly height: number;
  readonly widths: readonly number[];
  readonly views: readonly BoardView[];
  readonly rules: readonly BoardRule[];
  readonly pieces: readonly Piece[];
  readonly mediaGroups: readonly MediaGroup[];
  /** Filter tags: exam, variant, the properties the solution uses, and the concepts. */
  readonly tags: readonly string[];
  /** Indexes of the pieces the player has to place. */
  readonly movable: readonly number[];
  readonly allowed: readonly string[];
  readonly landmark: string;
}

export interface RegionDraft {
  readonly name: string;
  readonly subtitle: string;
  /** Position on the map, in fractions of its size. */
  readonly x?: number;
  readonly y?: number;
  readonly terrain: string;
  readonly character?: string;
  readonly role?: string;
  readonly exam?: boolean;
  readonly boss?: boolean;
  readonly secret?: boolean;
  /** Extra points the trail goes through on its way to this region. */
  readonly path?: readonly (readonly [number, number])[];
  /** The trail to this region is a flight, starting at point `from` of the previous trail. */
  readonly flight?: { readonly from: number; readonly via: string };
  readonly radius?: number;
  /**
   * Regions (local indexes in its world) that must be complete before this one opens; without it,
   * the previous one. Several regions waiting for the same one make a branch.
   */
  readonly after?: readonly number[];
  readonly icon?: string;
  /** How the boss is named after "a" (Spanish contracts "a el" to "al"): `al Huracán`. */
  readonly nameWithArticle?: string;
  /** What the boss says when an exam delivery fails. */
  readonly taunts?: readonly string[];
}

export interface Region extends RegionDraft {
  readonly world: WorldId;
  /** Global index in `catalog.regions`; portraits are named `pj-<index>`. */
  readonly index: number;
  /** One-based position inside its world. */
  readonly number: number;
}

/** A labelled list of filter tags for the map index. */
export type FilterGroup = readonly [label: string, tags: readonly string[]];

/** Everything one world contributes to the catalog. */
export interface WorldContent {
  readonly id: WorldId;
  readonly name: string;
  readonly mapTitle: string;
  readonly topic: string;
  /** Title-screen card. */
  readonly card: { readonly tech: string; readonly className: string };
  readonly regions: readonly RegionDraft[];
  readonly pieceTypes: PieceTypeMap;
  /** Index filters: the first group is the kinds of exercise, the last the concepts, the rest properties. */
  readonly filters: readonly FilterGroup[];
  readonly lessons: readonly LevelDraft[];
}

export interface RegionStats {
  readonly total: number;
  readonly done: number;
}

export const WORLD_IDS: readonly WorldId[] = ['isle', 'grid', 'flex', 'sky', 'finale'];

export function isWorldId(value: unknown): value is WorldId {
  return typeof value === 'string' && (WORLD_IDS as readonly string[]).includes(value);
}
