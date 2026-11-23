/**
 * Lets the self-test write a lesson's solution (or its start) into the open tablet. A request for a
 * lesson that is not open yet waits until that lesson's tablet registers.
 */
export type FillKind = 'solution' | 'initial';

type Filler = (kind: FillKind) => void;

let open: { readonly id: string; readonly fill: Filler } | null = null;
let pending: { readonly id: string; readonly kind: FillKind } | null = null;

/** Called by the open lesson. Returns the unregister function. */
export function registerFill(id: string, fill: Filler): () => void {
  open = { id, fill };
  if (pending?.id === id) {
    fill(pending.kind);
    pending = null;
  }
  return () => {
    if (open?.fill === fill) open = null;
  };
}

export function requestFill(id: string, kind: FillKind): void {
  if (open?.id === id) open.fill(kind);
  else pending = { id, kind };
}
