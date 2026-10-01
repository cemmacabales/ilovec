import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { CheckCircle, WarningCircle } from '@phosphor-icons/react';

type Tone = 'ok' | 'error';
interface Toast {
  id: number;
  message: string;
  tone: Tone;
}

const ToastContext = createContext<((message: string, tone?: Tone) => void) | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const next = useRef(1);

  const show = useCallback((message: string, tone: Tone = 'ok') => {
    const id = next.current++;
    setToasts((prev) => [...prev.slice(-2), { id, message, tone }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200);
  }, []);

  const value = useMemo(() => show, [show]);

  // Toasts live in the top layer as a manual popover, re-raised on each new
  // toast so they sit above any open sheet.
  const regionRef = useRef<HTMLDivElement>(null);
  const newest = toasts[toasts.length - 1]?.id;
  useEffect(() => {
    const el = regionRef.current;
    if (!el || typeof el.showPopover !== 'function') return;
    try {
      if (el.matches(':popover-open')) el.hidePopover();
      if (newest !== undefined) el.showPopover();
    } catch {
      // Popover unsupported or element detached; toasts still render in place.
    }
  }, [newest]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div ref={regionRef} popover="manual" className="toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.tone}`} role={t.tone === 'error' ? 'alert' : 'status'}>
            {t.tone === 'error' ? <WarningCircle size={18} weight="fill" /> : <CheckCircle size={18} weight="fill" />}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

// Standard copy when a write fails because the database can't be reached.
export const SAVE_FAILED = "Couldn't save. Your shared data isn't reachable right now.";
