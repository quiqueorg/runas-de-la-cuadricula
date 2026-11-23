/** The scroll beside the board: who asks, the theory, the exam's plan and the objective. */
import { Rune } from '../../../shared/icons/Rune';
import { RichText } from '../../../shared/rich-text/RichText';
import { Blueprint } from '../Blueprint';
import type { BlueprintView } from '../board/blueprint';
import type { BossBar, LessonChrome } from '../chrome';
import type { CheckLine } from '../evaluate';

const HEARTS = [0, 1, 2];

function Boss({ boss }: { readonly boss: BossBar }) {
  return (
    <div className="jefe-barra">
      <Rune id={boss.portrait} className="portrait" />
      <div className="jb-info">
        <p className="jb-nom">
          {boss.name} <small>{boss.role}</small>
        </p>
        <div className="jb-vida" role="img" aria-label={boss.life}>
          {boss.bars.map((bar) => (
            <i
              key={bar.id}
              className={`${bar.broken ? 'rota' : ''} ${bar.current ? 'current' : ''}`}
            />
          ))}
        </div>
        <div className="jb-pie">
          <p className="jb-fase">
            Fase {boss.phase} de {boss.phases} · {boss.phaseName}
          </p>
          <div
            className="jb-corazones"
            role="img"
            aria-label={`Te quedan ${boss.hearts} de 3 corazones`}
          >
            {HEARTS.map((heart) => (
              <Rune key={heart} id="i-corazon" className={heart < boss.hearts ? '' : 'perdido'} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Check({ line }: { readonly line: CheckLine }) {
  const { coins } = line;
  return (
    <li className={line.ok ? 'cumple' : line.limit ? 'falla' : ''}>
      {coins !== null && (
        <span className="bolsa">
          {Array.from({ length: coins }, (_, coin) => (
            // Coins are interchangeable: their position is all they have.
            // biome-ignore lint/suspicious/noArrayIndexKey: see above.
            <Rune key={coin} id="i-moneda" className={coin < coins - line.spent ? '' : 'gastada'} />
          ))}
        </span>
      )}
      <RichText html={line.html} />
    </li>
  );
}

export interface TheoryPanelProps {
  readonly chrome: LessonChrome;
  readonly checks: readonly CheckLine[];
  readonly plans: readonly BlueprintView[];
}

export function TheoryPanel({ chrome, checks, plans }: TheoryPanelProps) {
  return (
    <article id="theory-zone" className="scroll">
      {chrome.boss && <Boss boss={chrome.boss} />}
      <div className="commission">
        <Rune id={chrome.portrait} className="portrait" />
        <div>
          <p className="enc-quien">{chrome.speaker}</p>
          <p className="enc-txt">«{chrome.speech}»</p>
        </div>
      </div>
      {chrome.note && <p className="guide-note">{chrome.note}</p>}
      <div className="teo">
        {chrome.theory.kind === 'lesson' ? (
          <RichText html={chrome.theory.html} />
        ) : (
          <p className="examen-intro">
            <RichText html={chrome.theory.html} />
          </p>
        )}
      </div>
      {chrome.markup && (
        <div className="marcado">
          <h3>El HTML del tablero</h3>
          <pre>{chrome.markup}</pre>
        </div>
      )}
      {chrome.exam && (
        <div className="plano">
          <h3>Plano del arquitecto</h3>
          <Blueprint views={plans} />
        </div>
      )}
      <div className="meta">
        <h3>
          <Rune id="emblema" />
          Objetivo
        </h3>
        <RichText html={chrome.objectiveHtml} />
        <ul className="reglas">
          {checks.map((line) => (
            <Check key={line.html} line={line} />
          ))}
        </ul>
      </div>
    </article>
  );
}
