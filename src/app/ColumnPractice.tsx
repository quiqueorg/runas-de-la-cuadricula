import { useRef, useState } from 'react';
import { Rune } from '../shared/icons/Rune';

export function ColumnPractice() {
  const board = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState('');
  const [feedback, setFeedback] = useState('');
  return (
    <details className="column-practice">
      <summary className="button">Pruébalo en columna</summary>
      <p>
        Las cuatro setas trepan por la pared. Deja cinco huecos iguales de arriba abajo, incluidos
        el techo y el suelo. Esta práctica es opcional y no tiene pistas.
      </p>
      <div className="practice-board" ref={board} aria-label="Cuatro setas en columna" role="img">
        {[0, 1, 2, 3].map((i) => (
          <Rune key={i} id="i-seta" />
        ))}
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const element = board.current;
          if (!element) return;
          const css = value.trim();
          if (!CSS.supports('justify-content', css)) {
            element.style.removeProperty('justify-content');
            setFeedback('Escribe un valor CSS válido para esta propiedad.');
            return;
          }
          element.style.justifyContent = css;
          setFeedback(
            getComputedStyle(element).justifyContent === 'space-evenly'
              ? '¡Conseguido sin pistas! Al cambiar de fila a columna, el mismo reparto actúa de arriba abajo.'
              : 'Todavía no hay cinco huecos iguales. Observa la columna y vuelve a intentarlo.',
          );
        }}
      >
        <label>
          justify-content:{' '}
          <input
            value={value}
            autoComplete="off"
            spellCheck={false}
            onChange={(event) => {
              setValue(event.target.value);
              setFeedback('');
            }}
          />
        </label>
        <button className="button small" type="submit">
          Comprobar
        </button>
      </form>
      <p role="status">{feedback}</p>
    </details>
  );
}
