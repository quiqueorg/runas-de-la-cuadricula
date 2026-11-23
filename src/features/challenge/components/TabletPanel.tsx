/** The runic tablet: actions, hints, the allowed runes, the editable CSS and the verdict. */
import { Rune } from '../../../shared/icons/Rune';
import { RichText } from '../../../shared/rich-text/RichText';
import type { LessonChrome } from '../chrome';
import type { StatusLine } from '../evaluate';
import type { TabletField } from '../hooks/useTablet';
import type { EditorRow, EditorRule, TabletText } from '../tablet';
import { CodeField, CodeText } from './Code';

/** Id of the button in a timed lesson's message that gives the player another go. */
const SHAKE_ACTION = 'p-sacudir';

export interface HintState {
  readonly open: boolean;
  /** Which early hint is showing; past the last one, the full hint. */
  readonly step: number;
}

export interface TabletPanelProps {
  readonly chrome: LessonChrome;
  readonly rows: readonly EditorRow[];
  readonly tablet: TabletText;
  readonly messages: readonly StatusLine[];
  readonly hint: HintState;
  readonly onEdit: (field: TabletField, index: number, value: string) => void;
  readonly onFocusField: (area: HTMLTextAreaElement) => void;
  readonly onTab: (area: HTMLTextAreaElement) => void;
  readonly onInsertRune: (property: string) => void;
  readonly onDeliver: () => void;
  readonly onToggleHint: () => void;
  readonly onNextHint: () => void;
  readonly onShowSolution: () => void;
  readonly onReset: () => void;
  readonly onShake: () => void;
}

function HintBox({ chrome, hint, onNextHint, onShowSolution }: TabletPanelProps) {
  const early = chrome.earlyHints;
  const last = hint.step >= early.length;
  let button = (
    <button className="text-link" type="button" onClick={onShowSolution}>
      {early.length ? `Aplicar ${chrome.revealWhat}` : 'Mostrar la solución'}
    </button>
  );
  if (!last) {
    button = (
      <button className="text-link" type="button" onClick={onNextHint}>
        {hint.step + 1 === early.length ? `Revelar ${chrome.revealWhat}` : 'Siguiente pista'}
      </button>
    );
  }
  return (
    <div className="pista-caja">
      <div aria-live="polite">
        {early.length > 0 && (
          <b>
            Pista {hint.step + 1} de {early.length + 1}:{' '}
          </b>
        )}
        <RichText html={early[hint.step] ?? chrome.hintHtml} />
      </div>
      {button}
    </div>
  );
}

function RuleBlock({
  rule,
  props,
}: {
  readonly rule: EditorRule;
  readonly props: TabletPanelProps;
}) {
  const { chrome, tablet, onEdit, onFocusField } = props;
  return (
    <div className={`stack${rule.editable ? '' : ' solo-lectura'}`}>
      {rule.ownSelector ? (
        <div className="bl-lin sel-ed">
          <CodeField
            value={tablet.selectors[rule.index] ?? ''}
            label="Selector de la regla"
            placeholder="selector"
            field="selectors"
            index={rule.index}
            allowed={chrome.runes}
            onChange={(value) => onEdit('selectors', rule.index, value)}
            onFocus={onFocusField}
          />{' '}
          <span className="t-llave">{'{'}</span>
        </div>
      ) : (
        <div className="bl-lin">
          <span className="t-sel">{rule.selector}</span> <span className="t-llave">{'{'}</span>
        </div>
      )}
      {rule.fixed && (
        <div className="locked-rule">
          <CodeText text={rule.fixed} fixed allowed={chrome.runes} />
        </div>
      )}
      {rule.editable && (
        <CodeField
          value={tablet.declarations[rule.index] ?? ''}
          label={`Declaraciones CSS para ${rule.selector}`}
          placeholder="escribe aquí tus runas…"
          field="declarations"
          index={rule.index}
          allowed={chrome.runes}
          onChange={(value) => onEdit('declarations', rule.index, value)}
          onFocus={onFocusField}
          onTab={props.onTab}
        />
      )}
      <div className="bl-lin">
        <span className="t-llave">{'}'}</span>
      </div>
    </div>
  );
}

function CodeSurface(props: TabletPanelProps) {
  const { chrome, tablet } = props;
  return (
    <div className="code-surface">
      {props.rows.map((row) =>
        row.kind === 'rule' ? (
          <RuleBlock key={`rule-${row.index}`} rule={row} props={props} />
        ) : (
          <div key={`media-${row.group}`} className={`media${row.fixed ? '' : ' cond-ed'}`}>
            <div className="bl-lin">
              <span className="t-at">@media</span>{' '}
              {row.fixed ? (
                <span className="cond-fija">
                  <CodeText text={row.condition} fixed allowed={chrome.runes} />
                </span>
              ) : (
                <CodeField
                  value={tablet.conditions[row.group] ?? ''}
                  label="Condición de la media query"
                  placeholder="(condición)"
                  field="conditions"
                  index={row.group}
                  allowed={chrome.runes}
                  onChange={(value) => props.onEdit('conditions', row.group, value)}
                  onFocus={props.onFocusField}
                />
              )}{' '}
              <span className="t-llave">{'{'}</span>
            </div>
            {row.rules.map((rule) => (
              <RuleBlock key={`rule-${rule.index}`} rule={rule} props={props} />
            ))}
            <div className="bl-lin">
              <span className="t-llave">{'}'}</span>
            </div>
          </div>
        ),
      )}
    </div>
  );
}

export function TabletPanel(props: TabletPanelProps) {
  const { chrome } = props;
  const onAction = (id: string) => {
    if (id === SHAKE_ACTION) props.onShake();
  };
  return (
    <div id="editor-zone" className="panel tablet">
      <div className="tab-cab">
        <h3>Tablilla rúnica</h3>
        <div className="tab-acc">
          {chrome.exam ? (
            <button className="button small primary" type="button" onClick={props.onDeliver}>
              <Rune id="i-entregar" />
              Entregar
            </button>
          ) : (
            <button
              className="button small"
              type="button"
              aria-expanded={props.hint.open}
              onClick={props.onToggleHint}
            >
              <Rune id="i-ojo" />
              Pista
            </button>
          )}
          <button className="button small" type="button" onClick={props.onReset}>
            <Rune id="i-reiniciar" />
            Reiniciar
          </button>
        </div>
      </div>
      {props.hint.open && <HintBox {...props} />}
      {chrome.runes.length > 0 && (
        <div className="runas-perm">
          <span className="rp-et">Runas permitidas</span>
          <span>
            {chrome.runes.map((property) => (
              <button
                key={property}
                type="button"
                className="chip"
                title={`Insertar ${property}`}
                onClick={() => props.onInsertRune(property)}
              >
                {property}
              </button>
            ))}
          </span>
        </div>
      )}
      <CodeSurface {...props} />
      <div className="status-list" aria-live="polite">
        {props.messages.map((line) => (
          <div key={`${line.tone}:${line.html}`} className={`msg ${line.tone}`}>
            <Rune id={line.icon} />
            <span>
              <RichText html={line.html} onAction={onAction} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
