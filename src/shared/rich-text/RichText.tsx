/** Authored lesson HTML becomes React nodes. It is not assigned as innerHTML. */
import { createElement, type ReactNode } from 'react';

const ALLOWED = new Set([
  'p',
  'b',
  'i',
  'em',
  'strong',
  'code',
  'pre',
  'span',
  'br',
  'button',
  'small',
  'ul',
  'ol',
  'li',
  'div',
]);

export interface RichTextProps {
  readonly html: string;
  readonly onAction?: (id: string) => void;
}

function renderNodes(
  parent: Node,
  prefix: string,
  onAction: ((id: string) => void) | undefined,
): ReactNode[] {
  return [...parent.childNodes].map((node, index) => {
    const key = `${prefix}.${index}`;
    if (node.nodeType === Node.TEXT_NODE) return node.textContent;
    if (!(node instanceof HTMLElement)) return null;
    const tag = node.tagName.toLowerCase();
    if (!ALLOWED.has(tag)) return renderNodes(node, key, onAction);
    if (tag === 'br') return <br key={key} />;
    const children = renderNodes(node, key, onAction);
    if (tag === 'button') {
      const id = node.id;
      return (
        <button
          key={key}
          type="button"
          className={node.className || undefined}
          id={id || undefined}
          onClick={() => {
            if (id) onAction?.(id);
          }}
        >
          {children}
        </button>
      );
    }
    return createElement(tag, { key, className: node.className || undefined }, children);
  });
}

export function RichText({ html, onAction }: RichTextProps) {
  if (!html) return null;
  const document = new DOMParser().parseFromString(html, 'text/html');
  return <>{renderNodes(document.body, 'n', onAction)}</>;
}
