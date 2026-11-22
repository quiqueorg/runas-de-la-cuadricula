/**
 * Efficient background processing helper.
 * Uses `contentvisibilityautostatechange` when `content-visibility` is supported,
 * falling back to `IntersectionObserver` with a pre-render margin.
 */

interface ContentVisibilityEvent extends Event {
  readonly skipped: boolean;
}

export function observeRenderVisibility(
  element: HTMLElement,
  onChange: (visible: boolean) => void,
): () => void {
  const supportsContentVisibility =
    typeof document !== 'undefined' && 'contentVisibility' in document.documentElement.style;

  if (supportsContentVisibility) {
    const handler = (event: Event) => {
      onChange(!(event as ContentVisibilityEvent).skipped);
    };
    element.addEventListener('contentvisibilityautostatechange', handler);
    return () => element.removeEventListener('contentvisibilityautostatechange', handler);
  }

  if (typeof IntersectionObserver === 'undefined') return () => {};

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        onChange(entry.isIntersecting);
      }
    },
    { rootMargin: '200px' },
  );
  observer.observe(element);
  return () => observer.disconnect();
}
