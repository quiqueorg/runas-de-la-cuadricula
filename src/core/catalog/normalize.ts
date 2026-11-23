/** Turns an authored `LevelDraft` into the `Level` every feature reads. Pure: no DOM, no progress. */
import type {
  BoardRule,
  BoardRuleDraft,
  BoardView,
  BoardViewDraft,
  Level,
  LevelDraft,
  MediaDraft,
  MediaGroup,
  PieceTypeMap,
  Region,
  WorldId,
} from '../models';
import { parsePieces } from './pieces';

const DEFAULT_SIZE = 400;
const DEFAULT_DEVICE = {
  media: 'screen',
  colorScheme: 'light',
  pointer: 'fine',
  reducedMotion: false,
} as const;
/** Token pieces in these worlds have a fixed size unless the lesson says otherwise. */
const SIZED_TOKEN_WORLDS: ReadonlySet<WorldId> = new Set(['sky', 'finale']);
const SIZED_TOKEN: readonly [number, number] = [64, 64];
const EXAM_TAG = 'prueba de aprendizaje';

export interface NormalizeContext {
  readonly world: WorldId;
  /** The lesson's region, already resolved to the global catalog. */
  readonly region: Region;
  readonly index: number;
  readonly pieceTypes: PieceTypeMap;
  /** Every property the index can filter by, in display order. */
  readonly cssProperties: readonly string[];
}

/** Widths alone name a view by its width; views that differ in anything else need their own label. */
function viewsOf(draft: LevelDraft): BoardView[] {
  const width = draft.width ?? DEFAULT_SIZE;
  const height = draft.height ?? DEFAULT_SIZE;
  const drafts: readonly BoardViewDraft[] = draft.views?.length
    ? draft.views
    : (draft.widths ?? [width]).map((each) => ({ width: each, name: `${each}px` }));
  const sized = drafts.map((view) => ({
    ...DEFAULT_DEVICE,
    ...view,
    width: view.width ?? width,
    height: view.height ?? height,
  }));
  const sameHeight = sized.every((view) => view.height === sized[0]?.height);
  const distinctWidths = new Set(sized.map((view) => view.width)).size === sized.length;
  const bySize = sameHeight && distinctWidths;
  return sized.map((view) => ({
    ...view,
    name: view.name ?? (bySize ? `${view.width}px` : `${view.width}×${view.height}`),
  }));
}

const mediaGroupOf = (media: string | MediaDraft): MediaGroup =>
  typeof media === 'string'
    ? { fixed: true, solution: media, initial: '' }
    : { fixed: false, solution: media.solution, initial: media.initial ?? '' };

/** A rule with every default filled in. */
function ruleOf(draft: BoardRuleDraft, mediaGroup: number): BoardRule {
  return {
    selector: draft.selector,
    fixed: draft.fixed ?? '',
    solution: draft.solution ?? '',
    editable: draft.editable ?? true,
    initial: draft.initial ?? '',
    hidden: draft.hidden ?? false,
    mediaGroup,
    ...(draft.ownSelector === undefined ? {} : { ownSelector: draft.ownSelector }),
  };
}

/** Consecutive rules wrapped in the same media query share one group (and one condition field). */
function groupMedia(draft: LevelDraft): { rules: BoardRule[]; groups: MediaGroup[] } {
  const groups: MediaGroup[] = [];
  let previous: string | MediaDraft | undefined;
  const rules = draft.rules.map((rule) => {
    if (rule.media && rule.media !== previous) groups.push(mediaGroupOf(rule.media));
    previous = rule.media;
    return ruleOf(rule, rule.media ? groups.length - 1 : -1);
  });
  return { rules, groups };
}

/** Properties the solution writes, as filter tags in the index's order. */
function propertiesUsed(rules: readonly BoardRule[], cssProperties: readonly string[]): string[] {
  const used = new Set<string>();
  for (const rule of rules) {
    for (const [, property] of rule.solution.matchAll(/([a-z-]+)\s*:/g)) {
      if (property) used.add(property);
    }
  }
  return cssProperties.filter((property) => used.has(property));
}

export function normalizeLevel(draft: LevelDraft, context: NormalizeContext): Level {
  const { world, region } = context;
  const views = viewsOf(draft);
  const { rules, groups } = groupMedia(draft);
  const pieces = parsePieces(draft.pieces, {
    world,
    pieceTypes: context.pieceTypes,
    selectors: new Set(rules.map((rule) => rule.selector)),
    labels: draft.labels !== false,
    labelPinned: draft.labelPinned !== false,
  });
  const movable = pieces.flatMap((piece, index) => (piece.pinned ? [] : [index]));
  const firstMovable = movable[0] === undefined ? undefined : pieces[movable[0]];
  const tags = new Set([
    ...(draft.exam ? [EXAM_TAG] : []),
    ...(draft.variant ? [draft.variant] : []),
    ...propertiesUsed(rules, context.cssProperties),
    ...(draft.concepts ?? []),
  ]);
  return {
    ...draft,
    world,
    region: region.index,
    index: context.index,
    width: draft.width ?? DEFAULT_SIZE,
    height: Math.max(...views.map((view) => view.height)),
    widths: views.map((view) => view.width),
    views,
    rules,
    pieces,
    mediaGroups: groups,
    movable,
    tags: [...tags],
    allowed: draft.allowed ?? [],
    landmark: draft.landmark ?? firstMovable?.kind.icon ?? firstMovable?.kind.token ?? 'runa',
    tokenSize:
      draft.tokenSize === undefined && SIZED_TOKEN_WORLDS.has(world)
        ? SIZED_TOKEN
        : draft.tokenSize,
    boss: Boolean(region.boss) || draft.boss,
    maxDeclarations: draft.purse
      ? Math.floor(draft.purse.total / draft.purse.price)
      : draft.maxDeclarations,
  };
}
