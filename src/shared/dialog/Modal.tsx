/**
 * A modal on the native `<dialog>`: the browser makes the page inert, keeps focus inside, closes on
 * Esc and returns focus when it goes. Clicking the backdrop also closes it.
 */
import { type ReactNode, type RefObject, useEffect, useLayoutEffect, useRef } from 'react';

declare module 'react' {
  interface DialogHTMLAttributes<T> {
    /** Which user actions close the dialog. Not yet in React's types. */
    closedby?: 'any' | 'closerequest' | 'none';
  }
}

const outside = (event: PointerEvent, dialog: HTMLDialogElement): boolean => {
  const box = dialog.getBoundingClientRect();
  return (
    event.clientX < box.left ||
    event.clientX > box.right ||
    event.clientY < box.top ||
    event.clientY > box.bottom
  );
};

/** Light dismiss where `closedby` is not supported (Safari). */
function useBackdropDismiss(ref: RefObject<HTMLDialogElement | null>): void {
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || 'closedBy' in HTMLDialogElement.prototype) return;
    // The press and the release must both land outside, so a text selection dragged onto the
    // backdrop does not close it. The pointer is tested, not the target: the dialog's own padding
    // is the dialog too.
    let pressedOutside = false;
    const press = (event: PointerEvent) => {
      pressedOutside = outside(event, dialog);
    };
    const release = (event: PointerEvent) => {
      if (pressedOutside && outside(event, dialog)) dialog.close();
    };
    dialog.addEventListener('pointerdown', press);
    dialog.addEventListener('pointerup', release);
    return () => {
      dialog.removeEventListener('pointerdown', press);
      dialog.removeEventListener('pointerup', release);
    };
  }, [ref]);
}

export interface ModalProps {
  readonly className?: string;
  /** Id of the heading that names the dialog. */
  readonly labelledBy: string;
  /** Called however the dialog was closed (Esc, backdrop, or unmounting the owner's state). */
  readonly onClose: () => void;
  readonly children: ReactNode;
}

export function Modal({ className, labelledBy, onClose, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  // Removing the element closes it, so there is nothing to undo on unmount.
  useLayoutEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);
  useBackdropDismiss(ref);

  return (
    <dialog
      ref={ref}
      className={['panel', 'dialog-card', className].filter(Boolean).join(' ')}
      closedby="any"
      aria-labelledby={labelledBy}
      onClose={onClose}
    >
      {children}
    </dialog>
  );
}
