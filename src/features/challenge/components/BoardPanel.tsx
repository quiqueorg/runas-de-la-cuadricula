/** The board: its layers on the stage, and the controls under it. */
import { type CSSProperties, forwardRef, type ReactNode } from 'react';
import type { Level } from '../../../core/models';
import { Rune } from '../../../shared/icons/Rune';
import { ACTIVE_CLASS, SIMULATED_CLASSES } from '../board/layers';
import type { LessonChrome } from '../chrome';
import type { Clock } from '../clock';
import { clockLabel, clockTone } from '../clock';
import type { Evaluation } from '../evaluate';
import { Guides } from '../Guides';
import type { BoardRefs } from '../hooks/useBoard';
import { PieceTree } from '../Pieces';

export interface Spark {
  readonly x: number;
  readonly y: number;
  readonly delay: number;
  readonly scale: number;
}

export interface BoardPanelProps {
  readonly level: Level;
  readonly chrome: LessonChrome;
  readonly evaluation: Evaluation | null;
  readonly refs: BoardRefs;
  readonly clock: Clock;
  readonly viewIndex: number;
  readonly guidesOn: boolean;
  readonly peeking: boolean;
  /** The visible boards show the simulated state. */
  readonly active: boolean;
  readonly flashing: ReadonlySet<number>;
  readonly sparks: readonly Spark[];
  readonly blow: string;
  readonly onGuides: (on: boolean) => void;
  readonly onPeek: (on: boolean) => void;
  readonly onView: (index: number) => void;
  readonly onToggleState: () => void;
}

const Layer = forwardRef<HTMLDivElement, { readonly id: string; readonly children: ReactNode }>(
  function Layer({ id, children }, ref) {
    // Only the player's board is read by assistive technology; the others are copies.
    const hidden = id === 'player-layer' ? undefined : true;
    return (
      <div className="board-layer" id={id} aria-hidden={hidden} ref={ref}>
        {children}
      </div>
    );
  },
);

const boardClass = (active: boolean) =>
  active ? `tablero ${ACTIVE_CLASS} ${SIMULATED_CLASSES.join(' ')}` : 'tablero';

function Switch({
  checked,
  label,
  onChange,
}: {
  readonly checked: boolean;
  readonly label: string;
  readonly onChange: (on: boolean) => void;
}) {
  return (
    <label className="switch">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="switch-track" />
      <span>{label}</span>
    </label>
  );
}

function Stage(props: BoardPanelProps) {
  const { level, chrome, evaluation, refs, active } = props;
  return (
    <div id="stage-frame" ref={refs.frame}>
      <div className="stage" id="stage" ref={refs.stage}>
        <div className={`canvas${props.peeking ? ' peek' : ''}`} id="canvas" ref={refs.canvas}>
          <div className={`floor t-${chrome.floor}`} ref={refs.floor} />
          <Guides drawing={evaluation?.guides.drawing ?? null} />
          <Layer id="probe" ref={refs.probe}>
            <div className="tablero">{chrome.probes ? <PieceTree level={level} /> : null}</div>
          </Layer>
          <Layer id="probe-target" ref={refs.probeTarget}>
            <div className="tablero">{chrome.probes ? <PieceTree level={level} /> : null}</div>
          </Layer>
          <Layer id="target-layer" ref={refs.target}>
            <div className={boardClass(active)}>
              <PieceTree level={level} simulated={active} />
            </div>
          </Layer>
          <Layer id="player-layer" ref={refs.player}>
            {/* The board stays a <div>: lessons select elements by tag, and only pieces may match.
                biome-ignore lint/a11y/useSemanticElements: see above. */}
            <div className={boardClass(active)} role="group" aria-label={chrome.boardLabel}>
              <PieceTree
                level={level}
                matches={evaluation?.glowing}
                simulated={active}
                flashing={props.flashing}
              />
            </div>
          </Layer>
          <Layer id="outline-layer" ref={refs.outline}>
            <div className={boardClass(active)}>
              <PieceTree level={level} matches={evaluation?.matches} simulated={active} />
            </div>
          </Layer>
          <div className="sand" ref={refs.sand} hidden={!chrome.timed} aria-hidden="true" />
          {props.sparks.length > 0 && (
            <div className="chispas">
              {props.sparks.map((spark, index) => (
                <i
                  // Sparks are recreated together and never reordered.
                  // biome-ignore lint/suspicious/noArrayIndexKey: see above.
                  key={index}
                  className="chispa"
                  style={
                    {
                      left: `${spark.x}px`,
                      top: `${spark.y}px`,
                      animationDelay: `${spark.delay}s`,
                      '--s': String(spark.scale),
                    } as CSSProperties
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Controls(props: BoardPanelProps) {
  const { chrome, evaluation, clock } = props;
  return (
    <div className="board-controls">
      {chrome.guides && (
        <Switch checked={props.guidesOn} label={chrome.guidesLabel} onChange={props.onGuides} />
      )}
      {chrome.peek && (
        <Switch checked={props.peeking} label="Ver el objetivo" onChange={props.onPeek} />
      )}
      {chrome.views.length > 0 && (
        // A toolbar of toggle buttons, not a form: a <fieldset> would bring form semantics and styles.
        // biome-ignore lint/a11y/useSemanticElements: see above.
        <div className="segmented compact" role="group" aria-label={chrome.viewsLabel}>
          {chrome.views.map((name, index) => (
            <button
              key={name}
              type="button"
              aria-pressed={index === props.viewIndex}
              onClick={() => props.onView(index)}
            >
              <span className="match-mark">
                {evaluation?.viewsOk[index] ? <Rune id="i-hecho" /> : null}
              </span>
              {name}
            </button>
          ))}
        </div>
      )}
      {chrome.state && (
        <button
          className="button small state-button"
          type="button"
          aria-pressed={props.active}
          onClick={props.onToggleState}
        >
          <Rune id={chrome.state.icon} />
          <span>{props.active ? chrome.state.pressed : chrome.state.idle}</span>
        </button>
      )}
      {chrome.timed && (
        <span className={`timer ${clockTone(clock)}`}>
          <Rune id="i-reloj" />
          <b>{clockLabel(clock)}</b>
        </span>
      )}
      <span className="counter">
        <b>{evaluation?.placed ?? 0}</b> / {evaluation?.movable ?? chrome.pieceCount} en su sitio
      </span>
      <span className="board-notice" hidden={!evaluation?.guides.notice}>
        {chrome.notice}
      </span>
    </div>
  );
}

function Legend({
  evaluation,
  guidesOn,
}: {
  readonly evaluation: Evaluation | null;
  readonly guidesOn: boolean;
}) {
  const legend = evaluation?.guides.legend ?? 'none';
  return (
    <p className="legend" hidden={legend === 'none' || !guidesOn}>
      {legend === 'flex' ? (
        <>
          <span className="axis-main" />
          eje principal <span className="axis-cross" />
          eje cruzado
        </>
      ) : (
        <>
          <span className="axis-explicit" />
          explícita <span className="axis-implicit" />
          implícita <span className="axis-gap" />
          hueco
        </>
      )}
    </p>
  );
}

export function BoardPanel(props: BoardPanelProps) {
  return (
    <div id="board-zone" className={`panel ${props.blow}`.trim()}>
      <Stage {...props} />
      <Controls {...props} />
      <Legend evaluation={props.evaluation} guidesOn={props.guidesOn} />
    </div>
  );
}
