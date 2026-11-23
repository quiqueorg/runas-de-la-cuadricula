/** The index's search box, status switch and tag filters. */
import { Rune } from '../../../shared/icons/Rune';
import type { IndexFilters } from '../lessonIndex';
import type { StatusFilter } from '../state';

const STATUSES: readonly (readonly [StatusFilter, string])[] = [
  ['all', 'Todos'],
  ['pending', 'Pendientes'],
  ['done', 'Superados'],
];

export interface IndexFilterHandlers {
  readonly onQuery: (value: string) => void;
  readonly onStatus: (value: StatusFilter) => void;
  readonly onTag: (tag: string) => void;
  readonly onClearFilters: () => void;
}

function StatusSwitch({
  status,
  onStatus,
}: {
  readonly status: StatusFilter;
  readonly onStatus: (value: StatusFilter) => void;
}) {
  return (
    <fieldset className="segmented" aria-label="Estado">
      {STATUSES.map(([value, label]) => (
        <button
          key={value}
          type="button"
          aria-pressed={status === value}
          onClick={() => onStatus(value)}
        >
          {label}
        </button>
      ))}
    </fieldset>
  );
}

function activeCount(active: number): string {
  if (!active) return '';
  return `${active} activa${active > 1 ? 's' : ''}`;
}

function TagFilters({
  filters,
  onTag,
  onClearFilters,
}: {
  readonly filters: IndexFilters;
  readonly onTag: (tag: string) => void;
  readonly onClearFilters: () => void;
}) {
  return (
    <details className="rune-filter">
      <summary>
        <span>Filtrar por runa</span>
        <small className="filter-hint">propiedades y conceptos</small>
        <span className="filter-count">{activeCount(filters.active)}</span>
      </summary>
      <div>
        {filters.groups.map((group) => (
          <div key={group.title} className="filter-group">
            <h4>{group.title}</h4>
            <div>
              {group.chips.map((chip) => (
                <button
                  key={chip.tag}
                  type="button"
                  className="chip"
                  aria-pressed={chip.pressed}
                  onClick={() => onTag(chip.tag)}
                >
                  {chip.tag} <small>{chip.count}</small>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button type="button" className="text-link" hidden={!filters.dirty} onClick={onClearFilters}>
        Quitar filtros
      </button>
    </details>
  );
}

export function IndexFilterBar({
  filters,
  onQuery,
  onStatus,
  onTag,
  onClearFilters,
}: { readonly filters: IndexFilters } & IndexFilterHandlers) {
  return (
    <div className="filter-bar">
      <label className="search-field">
        <Rune id="i-lupa" />
        <input
          type="search"
          value={filters.query}
          placeholder="Buscar ejercicio o propiedad…"
          autoComplete="off"
          spellCheck={false}
          onChange={(event) => onQuery(event.target.value)}
        />
      </label>
      <StatusSwitch status={filters.status} onStatus={onStatus} />
      <TagFilters filters={filters} onTag={onTag} onClearFilters={onClearFilters} />
    </div>
  );
}
