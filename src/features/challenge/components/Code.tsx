/** Coloured CSS, and the editable fields of the tablet. */
import { useLayoutEffect, useRef } from 'react';
import type { TabletField } from '../hooks/useTablet';
import { highlight, type TokenKind } from '../tablet';

/** CSS classes of the tablet's colours (shared with the stylesheet, so they keep their names). */
const TOKEN_CLASS: Record<TokenKind, string> = {
  plain: '',
  comment: 't-com',
  string: 't-cad',
  attribute: 't-nom',
  property: 't-prop',
  variable: 't-prop t-var',
  sealed: 't-prop sellada',
  number: 't-num2',
  punctuation: 't-pun',
};

export interface CodeTextProps {
  readonly text: string;
  /** The lesson's own code: properties are never shown as sealed. */
  readonly fixed: boolean;
  readonly allowed: readonly string[];
}

export function CodeText({ text, fixed, allowed }: CodeTextProps) {
  return (
    <>
      {highlight(text, fixed, allowed).map((token, index) => (
        // Tokens have no identity of their own: their position is their key.
        // biome-ignore lint/suspicious/noArrayIndexKey: see above.
        <span key={index} className={TOKEN_CLASS[token.kind]}>
          {token.text}
        </span>
      ))}
    </>
  );
}

function syncScroll(area: HTMLTextAreaElement, pre: HTMLPreElement | null): void {
  if (!pre) return;
  pre.scrollTop = area.scrollTop;
  pre.scrollLeft = area.scrollLeft;
}

export interface CodeFieldProps {
  readonly value: string;
  readonly label: string;
  readonly placeholder: string;
  readonly field: TabletField;
  readonly index: number;
  readonly allowed: readonly string[];
  readonly onChange: (value: string) => void;
  readonly onFocus: (area: HTMLTextAreaElement) => void;
  /** Tab inserts spaces (declarations only). */
  readonly onTab?: (area: HTMLTextAreaElement) => void;
}

/**
 * A transparent textarea over a `<pre>` that shows its text coloured. Conditions and selectors are
 * one line: Enter does nothing and pasted line breaks become spaces.
 */
export function CodeField({
  value,
  label,
  placeholder,
  field,
  index,
  allowed,
  onChange,
  onFocus,
  onTab,
}: CodeFieldProps) {
  const oneLine = field !== 'declarations';
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  // Both layers must share size and scroll. Growing before paint keeps a new line from being clipped.
  // biome-ignore lint/correctness/useExhaustiveDependencies: the height follows the value.
  useLayoutEffect(() => {
    const area = areaRef.current;
    if (!area) return;
    area.style.height = 'auto';
    area.style.height = `${area.scrollHeight}px`;
    syncScroll(area, preRef.current);
  }, [value]);

  const className = ['code-line', oneLine && 'cond', field === 'selectors' && 'sel']
    .filter(Boolean)
    .join(' ');
  return (
    <div className={className}>
      <pre ref={preRef} aria-hidden="true">
        {field === 'selectors' ? (
          <span className="t-sel">{value || ' '}</span>
        ) : (
          // A trailing space keeps an empty last line as tall as the textarea's.
          <CodeText
            text={value.endsWith('\n') || !value ? `${value} ` : value}
            fixed={false}
            allowed={allowed}
          />
        )}
      </pre>
      <textarea
        ref={areaRef}
        value={value}
        rows={1}
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        aria-label={label}
        placeholder={placeholder}
        data-field={field}
        data-index={index}
        onScroll={(event) => syncScroll(event.currentTarget, preRef.current)}
        onSelect={(event) => syncScroll(event.currentTarget, preRef.current)}
        onFocus={(event) => {
          onFocus(event.currentTarget);
          // scroll-margin keeps the field out from under the pinned board on phones.
          event.currentTarget.scrollIntoView({ block: 'nearest' });
        }}
        onChange={(event) => {
          const text = event.currentTarget.value;
          onChange(oneLine ? text.replace(/\s*\n\s*/g, ' ') : text);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && oneLine) event.preventDefault();
          const plainTab =
            event.key === 'Tab' &&
            !event.shiftKey &&
            !event.altKey &&
            !event.ctrlKey &&
            !event.metaKey;
          if (plainTab && onTab) {
            event.preventDefault();
            onTab(event.currentTarget);
          }
        }}
      />
    </div>
  );
}
