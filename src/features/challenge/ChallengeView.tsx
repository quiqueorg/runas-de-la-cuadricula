/** Lesson screen. It draws the chrome it is given and reports named actions. */
import { forwardRef, type ReactNode, type RefObject } from 'react';
import type { Level } from '../../core/models';
import { MusicButton } from '../../shared/audio/MusicButton';
import { Rune } from '../../shared/icons/Rune';
import { RichText } from '../../shared/rich-text/RichText';
import { Blueprint } from './Blueprint';
import { Guides } from './Guides';
import type { BlueprintView, Evaluation, StatusLine } from './engine';
import type { EditorRow, EditorRule, LessonChrome } from './model';
import { highlightTokens } from './model';
import { PieceTree } from './Pieces';

export interface ChallengeViewProps {
  readonly chrome: LessonChrome;
  readonly level: Level;
  readonly view: Evaluation | null;
  readonly plans: readonly BlueprintView[];
  readonly sparks: readonly { x: number; y: number; delay: number; scale: number }[];
  readonly linesOn: boolean;
  readonly active: boolean;
  readonly hintOpen: boolean;
  readonly hintStep: number;
  readonly onNextHint: () => void;
  readonly texts: readonly string[];
  readonly conditions: readonly string[];
  readonly selectors: readonly string[];
  readonly rows: readonly EditorRow[];
  readonly viewIndex: number;
  readonly peeking: boolean;
  readonly rootsRef: RefObject<HTMLElement | null>;
  readonly objectiveStyleRef: RefObject<HTMLStyleElement | null>;
  readonly playerStyleRef: RefObject<HTMLStyleElement | null>;
  readonly frameRef: RefObject<HTMLDivElement | null>;
  readonly stageRef: RefObject<HTMLDivElement | null>;
  readonly canvasRef: RefObject<HTMLDivElement | null>;
  readonly floorRef: RefObject<HTMLDivElement | null>;
  readonly sandRef: RefObject<HTMLDivElement | null>;
  readonly probeRef: RefObject<HTMLDivElement | null>;
  readonly probeTargetRef: RefObject<HTMLDivElement | null>;
  readonly targetRef: RefObject<HTMLDivElement | null>;
  readonly playerRef: RefObject<HTMLDivElement | null>;
  readonly outlineRef: RefObject<HTMLDivElement | null>;
  readonly onNavigate: (hash: string) => void;
  readonly onLines: (on: boolean) => void;
  readonly onViewChange: (index: number) => void;
  readonly onPeek: (on: boolean) => void;
  readonly onToggleState: () => void;
  readonly onSubmit: () => void;
  readonly onToggleHint: () => void;
  readonly onReset: () => void;
  readonly onShowSolution: () => void;
  readonly onInsertRune: (prop: string) => void;
  readonly onEditRule: (index: number, value: string) => void;
  readonly onEditCondition: (index: number, value: string) => void;
  readonly onEditSelector: (index: number, value: string) => void;
  readonly onFocusArea: (area: HTMLTextAreaElement) => void;
  readonly onTab: (area: HTMLTextAreaElement) => void;
  readonly onShake: () => void;
}

export function ChallengeView(props: ChallengeViewProps) {
  const { chrome, level, view } = props;
  const sky = chrome.sky;
  const priorHints = level.pistasPrevias ?? [];
  const reveal = level.b.flatMap((rule) => rule.sol.split(';')).filter((part) => part.trim()).length > 1 ? 'la solución' : 'la declaración';
  const ruleBlock = (rule: EditorRule) => (
    <div key={`rule-${rule.index}`} className={`stack${rule.editable ? '' : ' solo-lectura'}`}>
      {rule.ownSelector ? (
        <div className="bl-lin sel-ed">
          <CodeField value={props.selectors[rule.index] ?? ''} label="Selector de la regla" placeholder="selector" selector={rule.index} allowed={chrome.runes} onChange={(value) => props.onEditSelector(rule.index, value)} onFocus={props.onFocusArea} />{' '}
          <span className="t-llave">{'{'}</span>
        </div>
      ) : <div className="bl-lin"><span className="t-sel">{rule.selector}</span> <span className="t-llave">{'{'}</span></div>}
      {rule.fixed ? <div className="locked-rule"><CodeText text={rule.fixed} fixed allowed={chrome.runes} /></div> : null}
      {rule.editable ? (
        <CodeField
          value={props.texts[rule.index] ?? ''}
          label={`Declaraciones CSS para ${rule.selector}`}
          placeholder="escribe aquí tus runas…"
          rule={rule.index}
          allowed={chrome.runes}
          onChange={(value) => props.onEditRule(rule.index, value)}
          onFocus={props.onFocusArea}
          onTab={props.onTab}
        />
      ) : null}
      <div className="bl-lin"><span className="t-llave">{'}'}</span></div>
    </div>
  );

  return (
    <section id="view-challenge" className={`${chrome.className} ${chrome.blow}`.trim()} ref={props.rootsRef}>
      <style ref={props.objectiveStyleRef} />
      <style ref={props.playerStyleRef} />
      <header className="top-bar">
        <button className="button icon-text" type="button" onClick={() => props.onNavigate('mapa')}><Rune id="i-mapa" /><span>Mapa</span></button>
        <div className="top-bar-title">
          <span className="region-kicker">{chrome.kicker}</span>
          <h2><span className="step-number">{chrome.step}</span> <span>{chrome.title}</span></h2>
        </div>
        <div className="bar-nav">
          <MusicButton />
          <button className="button icon-only" type="button" aria-label="Ejercicio anterior" disabled={!chrome.previousId} onClick={() => { if (chrome.previousId) props.onNavigate(`prueba-${chrome.previousId}`); }}><Rune id="i-atras" /></button>
          <span className="progress-label">{chrome.progressLabel}</span>
          <button className="button icon-only" type="button" aria-label="Ejercicio siguiente" disabled={!chrome.nextId} onClick={() => { if (chrome.nextId) props.onNavigate(`prueba-${chrome.nextId}`); }}><Rune id="i-adelante" /></button>
        </div>
      </header>
      <div className="challenge-layout">
        <div id="board-zone" className={`panel ${chrome.blow}`}>
          <div id="stage-frame" ref={props.frameRef}>
            <div className="stage" id="stage" ref={props.stageRef}>
              <div className={`canvas${props.peeking ? ' peek' : ''}`} id="canvas" ref={props.canvasRef}>
                <div className={`floor t-${chrome.floor}`} ref={props.floorRef} />
                <Guides drawing={view?.guides ?? null} />
                <Layer id="probe" ref={props.probeRef}><div className="tablero">{chrome.probes ? <PieceTree level={level} /> : null}</div></Layer>
                <Layer id="probe-target" ref={props.probeTargetRef}><div className="tablero">{chrome.probes ? <PieceTree level={level} /> : null}</div></Layer>
                <Layer id="target-layer" ref={props.targetRef}><div className="tablero"><PieceTree level={level} /></div></Layer>
                <Layer id="player-layer" ref={props.playerRef}><div className="tablero" aria-label={chrome.boardLabel}><PieceTree level={level} matches={view?.matches} /></div></Layer>
                <Layer id="outline-layer" ref={props.outlineRef}><div className="tablero"><PieceTree level={level} matches={view?.matches} /></div></Layer>
                <div className="sand" ref={props.sandRef} hidden={!chrome.timed} aria-hidden="true" />
                {props.sparks.length ? <div className="chispas">{props.sparks.map((spark, index) => <i key={index} className="chispa" style={{ left: `${spark.x}px`, top: `${spark.y}px`, animationDelay: `${spark.delay}s`, ['--s' as string]: String(spark.scale) }} />)}</div> : null}
              </div>
            </div>
          </div>
          <div className="board-controls">
            {chrome.guides ? (
              <label className="switch">
                <input type="checkbox" checked={props.linesOn} onChange={(event) => props.onLines(event.target.checked)} />
                <span className="switch-track" />
                <span>{chrome.lineLabel}</span>
              </label>
            ) : null}
            {chrome.peek ? (
              <label className="switch">
                <input type="checkbox" checked={props.peeking} onChange={(event) => props.onPeek(event.target.checked)} />
                <span className="switch-track" />
                <span>Ver el objetivo</span>
              </label>
            ) : null}
            {chrome.views.length ? (
              <div className="segmented compact" role="group" aria-label={chrome.viewsLabel}>
                {chrome.views.map((name, viewIndex) => (
                  <button key={viewIndex} type="button" aria-pressed={viewIndex === props.viewIndex} onClick={() => props.onViewChange(viewIndex)}>
                    <span className="match-mark">{view?.widthOk[viewIndex] ? <Rune id="i-hecho" /> : null}</span>{name}
                  </button>
                ))}
              </div>
            ) : null}
            {chrome.state ? (
              <button className="button small state-button" type="button" aria-pressed={props.active} onClick={props.onToggleState}>
                <Rune id={chrome.state.icon} />
                <span>{props.active ? chrome.state.pressed : chrome.state.idle}</span>
              </button>
            ) : null}
            {chrome.timed ? <span className={`timer ${view?.clockClass ?? ''}`}><Rune id="i-reloj" /><b>{view?.clockLabel ?? ''}</b></span> : null}
            <span className="counter"><b>{view?.placed ?? 0}</b> / {view?.movable ?? chrome.pieceCount} en su sitio</span>
            <span className="board-notice" hidden={!view?.showNotice}>{chrome.notice}</span>
          </div>
          <p className="legend" hidden={view?.legend === 'none' || !props.linesOn}>
            {view?.legend === 'flex' ? <><span className="axis-main" />eje principal <span className="axis-cross" />eje cruzado</> : <><span className="axis-explicit" />explícita <span className="axis-implicit" />implícita <span className="axis-gap" />hueco</>}
          </p>
        </div>
        <article id="theory-zone" className="scroll">
          {chrome.boss ? (
            <div className="jefe-barra">
              <Rune id={chrome.boss.portrait} className="portrait" />
              <div className="jb-info">
                <p className="jb-nom">{chrome.boss.name} <small>{chrome.boss.role}</small></p>
                <div className="jb-vida" role="img" aria-label={chrome.boss.life}>{chrome.boss.bars.map((bar) => <i key={bar.id} className={`${bar.broken ? 'rota' : ''} ${bar.current ? 'current' : ''}`} />)}</div>
                <div className="jb-pie">
                  <p className="jb-fase">Fase {chrome.boss.phase} de {chrome.boss.phases} · {chrome.boss.phaseName}</p>
                  <div className="jb-corazones" role="img" aria-label={`Te quedan ${chrome.boss.hearts} de 3 corazones`}>{[0, 1, 2].map((heart) => <Rune key={heart} id="i-corazon" className={heart < chrome.boss!.hearts ? '' : 'perdido'} />)}</div>
                </div>
              </div>
            </div>
          ) : null}
          <div className="commission">
            <Rune id={chrome.portrait} className="portrait" />
            <div>
              <p className="enc-quien">{chrome.speaker}</p>
              <p className="enc-txt">«{chrome.speech}»</p>
            </div>
          </div>
          {chrome.note ? <p className="guide-note">{chrome.note}</p> : null}
          <div className="teo">
            {chrome.theory.kind === 'lesson' ? <RichText html={chrome.theory.html} /> : <p className="examen-intro"><RichText html={chrome.theory.html} /></p>}
          </div>
          {chrome.markup ? <div className="marcado"><h3>El HTML del tablero</h3><pre>{chrome.markup}</pre></div> : null}
          {chrome.exam ? <div className="plano"><h3>Plano del arquitecto</h3><Blueprint views={props.plans} /></div> : null}
          <div className="meta">
            <h3><Rune id="emblema" />Objetivo</h3>
            <RichText html={chrome.objectiveHtml} />
            <ul className="reglas">
              {(view?.rules ?? []).map((rule, ruleIndex) => {
                const coins = rule.coins;
                return (
                <li key={ruleIndex} className={rule.ok ? 'cumple' : rule.limit ? 'falla' : ''}>
                  {coins !== null ? <span className="bolsa">{Array.from({ length: coins }, (_, coin) => <Rune key={coin} id="i-moneda" className={coin < coins - rule.spent ? '' : 'gastada'} />)}</span> : null}
                  <RichText html={rule.html} />
                </li>
                );
              })}
            </ul>
          </div>
        </article>
        <div id="editor-zone" className="panel tablet">
          <div className="tab-cab">
            <h3>Tablilla rúnica</h3>
            <div className="tab-acc">
              {chrome.exam ? <button className="button small primary" type="button" onClick={props.onSubmit}><Rune id="i-entregar" />Entregar</button> : null}
              {chrome.exam ? null : <button className="button small" type="button" aria-expanded={props.hintOpen} onClick={props.onToggleHint}><Rune id="i-ojo" />Pista</button>}
              <button className="button small" type="button" onClick={props.onReset}><Rune id="i-reiniciar" />Reiniciar</button>
            </div>
          </div>
          {props.hintOpen ? (
            <div className="pista-caja">
              <div aria-live="polite">
                {priorHints.length > 0 && <b>Pista {props.hintStep + 1} de {priorHints.length + 1}: </b>}
                <RichText html={priorHints[props.hintStep] ?? chrome.hintHtml} />
              </div>
              {props.hintStep < priorHints.length
                ? <button className="text-link" type="button" onClick={props.onNextHint}>{props.hintStep + 1 === priorHints.length ? `Revelar ${reveal}` : 'Siguiente pista'}</button>
                : <button className="text-link" type="button" onClick={props.onShowSolution}>{priorHints.length ? `Aplicar ${reveal}` : 'Mostrar la solución'}</button>}
            </div>
          ) : null}
          {chrome.runes.length ? <div className="runas-perm"><span className="rp-et">Runas permitidas</span><span>{chrome.runes.map((prop) => <button key={prop} type="button" className="chip" title={`Insertar ${prop}`} onClick={() => props.onInsertRune(prop)}>{prop}</button>)}</span></div> : null}
          <div className="code-surface">
            {props.rows.map((row) => row.kind === 'rule' ? ruleBlock(row) : (
              <div key={`media-${row.id}`} className={`media${row.fixed ? '' : ' cond-ed'}`}>
                <div className="bl-lin">
                  <span className="t-at">@media</span>{' '}
                  {row.fixed ? <span className="cond-fija"><CodeText text={row.condition} fixed allowed={chrome.runes} /></span> : (
                    <CodeField value={props.conditions[row.id] ?? ''} label="Condición de la media query" placeholder="(condición)" media={row.id} allowed={chrome.runes} onChange={(value) => props.onEditCondition(row.id, value)} onFocus={props.onFocusArea} />
                  )}{' '}
                  <span className="t-llave">{'{'}</span>
                </div>
                {row.rules.map((rule) => ruleBlock(rule))}
                <div className="bl-lin"><span className="t-llave">{'}'}</span></div>
              </div>
            ))}
          </div>
          <div className="status-list" aria-live="polite" onClick={(event) => {
            const target = event.target;
            if (target instanceof Element && target.closest('#p-sacudir')) props.onShake();
          }}>
            {(view?.messages ?? []).map((message, messageIndex) => <Status key={messageIndex} line={message} />)}
          </div>
        </div>
      </div>
    </section>
  );
}

function Status({ line }: { readonly line: StatusLine }) {
  return <div className={`msg ${line.tone}`}><Rune id={line.icon} /><span><RichText html={line.html} /></span></div>;
}

function CodeText({ text, fixed, allowed }: { readonly text: string; readonly fixed: boolean; readonly allowed: readonly string[] }) {
  return <>{highlightTokens(text, fixed, allowed).map((token, index) => <span key={index} className={tokenClass(token.kind)}>{token.text}</span>)}</>;
}

function tokenClass(kind: string): string {
  if (kind === 'plain') return '';
  if (kind === 'com') return 't-com';
  if (kind === 'cad') return 't-cad';
  if (kind === 'nom') return 't-nom';
  if (kind === 'prop') return 't-prop';
  if (kind === 'var') return 't-prop t-var';
  if (kind === 'sealed') return 't-prop sellada';
  if (kind === 'num') return 't-num2';
  return 't-pun';
}

function CodeField({ value, label, placeholder, rule, media, selector, allowed, onChange, onFocus, onTab }: {
  readonly value: string;
  readonly label: string;
  readonly placeholder: string;
  readonly rule?: number;
  readonly media?: number;
  readonly selector?: number;
  readonly allowed: readonly string[];
  readonly onChange: (value: string) => void;
  readonly onFocus: (area: HTMLTextAreaElement) => void;
  readonly onTab?: (area: HTMLTextAreaElement) => void;
}) {
  const oneLine = media !== undefined || selector !== undefined;
  return (
    <div className={`code-line${media !== undefined ? ' cond' : ''}${selector !== undefined ? ' cond sel' : ''}`}>
      <pre aria-hidden="true">{selector !== undefined ? <span className="t-sel">{value || ' '}</span> : <CodeText text={value.endsWith('\n') || !value ? `${value} ` : value} fixed={false} allowed={allowed} />}</pre>
      <textarea
        value={value}
        rows={1}
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        aria-label={label}
        placeholder={placeholder}
        data-b={rule}
        data-m={media}
        data-s={selector}
        onFocus={(event) => onFocus(event.currentTarget)}
        onChange={(event) => onChange(event.currentTarget.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && oneLine) event.preventDefault();
          if (event.key === 'Tab' && onTab && !event.shiftKey && !event.altKey && !event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            onTab(event.currentTarget);
          }
        }}
      />
    </div>
  );
}

const Layer = forwardRef<HTMLDivElement, { readonly id: string; readonly children: ReactNode }>(function Layer({ id, children }, ref) {
  return <div className="board-layer" id={id} aria-hidden={id === 'player-layer' ? undefined : true} ref={ref}>{children}</div>;
});
