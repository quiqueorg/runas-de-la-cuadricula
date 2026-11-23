/** The app's three dialogs. Copy and actions arrive already decided. */
import type { VictoryModel } from '../features/challenge/victory';
import type { SecretNotice } from '../features/map';
import { Modal } from '../shared/dialog/Modal';
import { Rune } from '../shared/icons/Rune';
import { RichText } from '../shared/rich-text/RichText';
import { ColumnPractice } from './ColumnPractice';

export type AppDialog =
  | { readonly kind: 'new-game'; readonly text: string }
  | { readonly kind: 'secret'; readonly secret: SecretNotice }
  | { readonly kind: 'victory'; readonly model: VictoryModel };

export interface DialogsProps {
  readonly dialog: AppDialog;
  readonly onClose: () => void;
  readonly onReset: () => void;
  readonly onOpenLesson: (id: string) => void;
  readonly onMap: () => void;
}

const STARS = [1, 2, 3];

function NewGameDialog({ text, onClose, onReset }: { readonly text: string } & DialogsProps) {
  return (
    <Modal labelledBy="new-game-title" onClose={onClose}>
      <h3 id="new-game-title">¿Empezar de nuevo?</h3>
      <p>{text}</p>
      <div className="dialog-actions">
        {/* The safe choice comes first, so it takes the focus. */}
        <button className="button" type="button" onClick={onClose}>
          Volver
        </button>
        <button className="button danger" type="button" onClick={onReset}>
          Borrar y empezar
        </button>
      </div>
    </Modal>
  );
}

function SecretDialog({
  secret,
  onClose,
  onOpenLesson,
}: { readonly secret: SecretNotice } & DialogsProps) {
  return (
    <Modal className="victory secreto-dlg" labelledBy="secret-title" onClose={onClose}>
      <div className="sunburst" aria-hidden="true" />
      <Rune id={secret.icon} className="dib-grande" />
      <h3 id="secret-title">{secret.title}</h3>
      <p className="dv-sub">{secret.text}</p>
      <div className="dialog-actions">
        <button className="button" type="button" onClick={onClose}>
          Más tarde
        </button>
        <button className="button primary" type="button" onClick={() => onOpenLesson(secret.id)}>
          Explorar
        </button>
      </div>
    </Modal>
  );
}

function VictoryDialog({
  model,
  onClose,
  onMap,
  onOpenLesson,
}: { readonly model: VictoryModel } & DialogsProps) {
  const { stars, nextId } = model;
  return (
    <Modal className="victory" labelledBy="victory-title" onClose={onClose}>
      <div className="sunburst" aria-hidden="true" />
      <Rune id="emblema" className="emblem" />
      <h3 id="victory-title">{model.title}</h3>
      <p className="dv-sub">
        {stars !== null && (
          <span className="stars grande">
            {STARS.map((star) => (
              <Rune key={star} id="i-estrella" className={stars >= star ? 'on' : ''} />
            ))}
          </span>
        )}
        <RichText html={model.bodyHtml} />
      </p>
      {model.quote && (
        <p className="dv-fin">
          <Rune id={model.portrait} className="portrait" />
          <span>«{model.quote}»</span>
        </p>
      )}
      <p className="dv-hito">
        <Rune id={model.landmarkIcon} />
        <span>{model.landmark}</span>
      </p>
      <p className="dv-prog">{model.progressText}</p>
      {model.practice === 'column-gaps' && <ColumnPractice />}
      <div className="dialog-actions">
        <button className="button" type="button" onClick={onClose}>
          Seguir aquí
        </button>
        <button className="button" type="button" onClick={onMap}>
          Mapa
        </button>
        {nextId && (
          <button className="button primary" type="button" onClick={() => onOpenLesson(nextId)}>
            {model.nextLabel}
          </button>
        )}
      </div>
    </Modal>
  );
}

/** Keyed by kind, so switching dialogs opens a fresh `<dialog>`. */
export function Dialogs(props: DialogsProps) {
  const { dialog } = props;
  if (dialog.kind === 'new-game')
    return <NewGameDialog key="new-game" text={dialog.text} {...props} />;
  if (dialog.kind === 'secret')
    return <SecretDialog key="secret" secret={dialog.secret} {...props} />;
  return <VictoryDialog key="victory" model={dialog.model} {...props} />;
}
