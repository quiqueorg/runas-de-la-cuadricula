/** The card a region marker opens: its character, progress and lessons, or why it is still closed. */
import { Rune } from '../../../shared/icons/Rune';
import type { RegionCard, RegionCardRow } from '../regionCard';
import { LessonMark } from './Stars';

const TITLE_ID = 'region-card-title';

function CloseButton({ onClose }: { readonly onClose: () => void }) {
  return (
    <button type="button" className="button icon-only" aria-label="Cerrar" onClick={onClose}>
      <Rune id="i-cerrar" />
    </button>
  );
}

function LessonRow({
  row,
  onOpen,
}: {
  readonly row: RegionCardRow;
  readonly onOpen: (id: string) => void;
}) {
  return (
    <li>
      <button type="button" className={row.className} onClick={() => onOpen(row.id)}>
        <span className="card-number">{row.label}</span>
        <span className="entry-name">
          {row.name}
          {row.extra ? (
            <>
              {' '}
              <small>{row.extra}</small>
            </>
          ) : null}
        </span>
        <LessonMark exam={row.exam} score={row.score} done={row.done} gem={row.gem} />
      </button>
    </li>
  );
}

export function RegionCardPanel({
  card,
  onClose,
  onOpen,
}: {
  readonly card: RegionCard;
  readonly onClose: () => void;
  readonly onOpen: (id: string) => void;
}) {
  if (!card.known) {
    return (
      <div className="panel region-card" role="dialog" aria-labelledby={TITLE_ID}>
        <div className="ficha-cab">
          <div>
            <h3 id={TITLE_ID}>{card.title}</h3>
          </div>
          <CloseButton onClose={onClose} />
        </div>
        <p className="f-txt">{card.blocked}</p>
      </div>
    );
  }
  const next = card.next;
  return (
    <div className="panel region-card" role="dialog" aria-labelledby={TITLE_ID}>
      <div className="ficha-cab">
        <Rune id={card.portrait} className="portrait" />
        <div>
          <p className="f-sub">{card.kicker}</p>
          <h3 id={TITLE_ID}>{card.title}</h3>
          <p className="f-pj">{card.speaker}</p>
        </div>
        <CloseButton onClose={onClose} />
      </div>
      <div className="f-barra" aria-hidden="true">
        <i style={{ width: `${card.bar.toFixed(0)}%` }} />
      </div>
      <p className="f-prog">{card.progress}</p>
      <ol className="f-lista">
        {card.rows.map((row) => (
          <LessonRow key={row.id} row={row} onOpen={onOpen} />
        ))}
      </ol>
      {next ? (
        <button type="button" className="button primary" onClick={() => onOpen(next.id)}>
          {next.label}
        </button>
      ) : null}
    </div>
  );
}
