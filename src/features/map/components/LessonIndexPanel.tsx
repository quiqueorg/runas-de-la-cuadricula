/** Every lesson of the world, grouped by region, with search and filters. */
import { Rune } from '../../../shared/icons/Rune';
import type { IndexCard, IndexFilters, IndexGroup } from '../lessonIndex';
import { IndexFilterBar, type IndexFilterHandlers } from './IndexFilterBar';
import { LessonMark } from './Stars';

/** The panel's id, for the button that opens it. */
export const INDEX_PANEL_ID = 'exercise-index';

/** An undiscovered secret: only its hint, and nothing to open. */
function HiddenCard({ card }: { readonly card: IndexCard }) {
  return (
    <div className="exercise-card undiscovered">
      <span className="card-number">{card.label}</span>
      <span>
        <span className="card-title">{card.title}</span>
        <span className="card-hint">{card.hint}</span>
      </span>
    </div>
  );
}

function LessonCard({
  card,
  onOpen,
}: {
  readonly card: IndexCard;
  readonly onOpen: (id: string) => void;
}) {
  return (
    <button type="button" className={card.className} onClick={() => onOpen(card.id)}>
      <span className="card-number">{card.label}</span>
      <span>
        <span className="card-title">{card.title}</span>
        {card.badge ? <span className="badge">{card.badge}</span> : null}
        <span className="card-tags">
          {card.tags.map((tag) => (
            <code key={tag.text} className={tag.concept ? 'c' : ''}>
              {tag.text}
            </code>
          ))}
        </span>
      </span>
      <span className={`card-status ${card.exam ? 'with-stars' : ''}`}>
        <LessonMark exam={card.exam} score={card.score} done={card.done} gem={card.gem} />
      </span>
    </button>
  );
}

function RegionGroup({
  group,
  onOpen,
}: {
  readonly group: IndexGroup;
  readonly onOpen: (id: string) => void;
}) {
  return (
    <section className={group.className}>
      <h3>
        <span className="group-number">{group.emblem ? <Rune id="emblema" /> : group.number}</span>
        <span className="group-title">
          <span>{group.title}</span>
          <small>{group.detail}</small>
        </span>
      </h3>
      <div className="exercise-cards">
        {group.cards.map((card) =>
          card.hidden ? (
            <HiddenCard key={card.id} card={card} />
          ) : (
            <LessonCard key={card.id} card={card} onOpen={onOpen} />
          ),
        )}
      </div>
    </section>
  );
}

export function LessonIndexPanel({
  filters,
  groups,
  onClose,
  onOpen,
  ...filterHandlers
}: {
  readonly filters: IndexFilters;
  readonly groups: readonly IndexGroup[];
  readonly onClose: () => void;
  readonly onOpen: (id: string) => void;
} & IndexFilterHandlers) {
  return (
    <aside className="panel index-panel" id={INDEX_PANEL_ID} aria-label="Índice de ejercicios">
      <div className="index-header">
        <h3>Índice de ejercicios</h3>
        <button
          className="button icon-only"
          type="button"
          aria-label="Cerrar el índice"
          onClick={onClose}
        >
          <Rune id="i-cerrar" />
        </button>
      </div>
      <IndexFilterBar filters={filters} {...filterHandlers} />
      <div id="exercise-list">
        {groups.map((group) => (
          <RegionGroup key={group.id} group={group} onOpen={onOpen} />
        ))}
      </div>
    </aside>
  );
}
