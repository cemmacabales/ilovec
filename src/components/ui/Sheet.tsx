import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from '@phosphor-icons/react';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}

// Bottom sheet on phones, centered panel on larger screens.
// Built on <dialog> for focus trapping, Esc and the top layer.
export function Sheet({ open, onClose, title, children, footer, wide }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      // showModal() moves focus to the first focusable (the close button);
      // send it to the first field instead so typing starts right away.
      d.querySelector<HTMLElement>('.sheet__body :is(input:not([type="hidden"]), textarea)')?.focus();
    }
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={['sheet', wide && 'sheet--wide'].filter(Boolean).join(' ')}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {open && (
        <div className="sheet__panel">
          <span className="sheet__grabber" aria-hidden />
          <header className="sheet__header">
            <h2 id={titleId} className="sheet__title">
              {title}
            </h2>
            <button type="button" className="icon-btn" aria-label="Close" title="Close" onClick={onClose}>
              <X size={18} weight="bold" />
            </button>
          </header>
          <div className="sheet__body">{children}</div>
          {footer && <footer className="sheet__footer">{footer}</footer>}
        </div>
      )}
    </dialog>
  );
}
