/** The three dialogs. Copy and actions arrive already decided. */
import type { VictoryModel } from '../features/challenge/engine';
import type { SecretNotice } from '../features/map';
import { Rune } from '../shared/icons/Rune';
import { RichText } from '../shared/rich-text/RichText';

export type AppDialog =
  | { readonly kind: 'new-game'; readonly text: string }
  | { readonly kind: 'secret'; readonly secret: SecretNotice }
  | { readonly kind: 'victory'; readonly model: VictoryModel };

export function Dialogs({ dialog, onClose, onReset, onExplore, onMap, onNext }: {
  readonly dialog: AppDialog;
  readonly onClose: () => void;
  readonly onReset: () => void;
  readonly onExplore: (id: string) => void;
  readonly onMap: () => void;
  readonly onNext: (id: string) => void;
}) {
  if (dialog.kind === 'new-game') {
    return (
      <div className="dialog-backdrop" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
        <div className="panel dialog-card" role="dialog" aria-modal="true" aria-labelledby="dn-tit">
          <h3 id="dn-tit">¿Empezar de nuevo?</h3>
          <p>{dialog.text}</p>
          <div className="dialog-actions">
            <button className="button" type="button" onClick={onClose}>Volver</button>
            <button className="button danger" type="button" onClick={onReset}>Borrar y empezar</button>
          </div>
        </div>
      </div>
    );
  }
  if (dialog.kind === 'secret') {
    return (
      <div className="dialog-backdrop victory secreto-dlg" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
        <div className="panel dialog-card" role="dialog" aria-modal="true" aria-labelledby="secret-title">
          <div className="sunburst" aria-hidden="true" />
          <Rune id={dialog.secret.icon} className="dib-grande" />
          <h3 id="secret-title">{dialog.secret.title}</h3>
          <p className="dv-sub">{dialog.secret.text}</p>
          <div className="dialog-actions">
            <button className="button" type="button" onClick={onClose}>Más tarde</button>
            <button className="button primary" type="button" onClick={() => onExplore(dialog.secret.id)}>Explorar</button>
          </div>
        </div>
      </div>
    );
  }
  const model = dialog.model;
  return (
    <div className="dialog-backdrop victory" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="panel dialog-card" role="dialog" aria-modal="true" aria-labelledby="victory-title">
        <div className="sunburst" aria-hidden="true" />
        <Rune id="emblema" className="emblem" />
        <h3 id="victory-title">{model.title}</h3>
        <p className="dv-sub">{model.stars !== null ? <span className="stars grande">{[1, 2, 3].map((star) => <Rune key={star} id="i-estrella" className={(model.stars ?? 0) >= star ? 'on' : ''} />)}</span> : null}<RichText html={model.bodyHtml} /></p>
        {model.quote ? <p className="dv-fin"><Rune id={model.portrait} className="portrait" /><span>«{model.quote}»</span></p> : null}
        <p className="dv-hito"><Rune id={model.landmarkIcon} /><span>{model.landmark}</span></p>
        <p className="dv-prog">{model.progressText}</p>
        <div className="dialog-actions">
          <button className="button" type="button" onClick={onClose}>Seguir aquí</button>
          <button className="button" type="button" onClick={onMap}>Mapa</button>
          {model.nextId ? <button className="button primary" type="button" onClick={() => onNext(model.nextId ?? '')}>{model.nextLabel}</button> : null}
        </div>
      </div>
    </div>
  );
}
