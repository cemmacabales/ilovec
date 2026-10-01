import { useState, type ReactNode } from 'react';
import { CloudSlash } from '@phosphor-icons/react';
import { Button } from './Button';

export function EmptyState({
  icon,
  title,
  children,
  action,
  compact,
}: {
  icon: ReactNode;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={['empty', compact && 'empty--compact'].filter(Boolean).join(' ')}>
      <span className="empty__icon" aria-hidden>
        {icon}
      </span>
      <p className="empty__title">{title}</p>
      {children && <p className="empty__text">{children}</p>}
      {action && <div className="empty__action">{action}</div>}
    </div>
  );
}

export function LoadError({ what, onRetry }: { what: string; onRetry?: () => void }) {
  return (
    <EmptyState
      icon={<CloudSlash size={28} />}
      title={`Couldn't load ${what}`}
      action={onRetry && <Button size="sm" onClick={onRetry}>Try again</Button>}
    >
      Your shared data isn't reachable right now.
    </EmptyState>
  );
}

export function SkeletonRows({ count = 4 }: { count?: number }) {
  return (
    <div className="skeleton-rows" aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton-row" style={{ ['--i' as string]: i }}>
          <span className="skeleton skeleton--dot" />
          <span className="skeleton skeleton--line" style={{ width: `${62 - i * 9}%` }} />
        </div>
      ))}
    </div>
  );
}

// Two-step destructive button: first tap arms it, second tap confirms.
export function ConfirmButton({
  onConfirm,
  children,
  confirmLabel = 'Tap again to delete',
}: {
  onConfirm: () => void;
  children: ReactNode;
  confirmLabel?: string;
}) {
  const [armed, setArmed] = useState(false);
  return (
    <Button
      variant="danger"
      onClick={() => (armed ? onConfirm() : setArmed(true))}
      onBlur={() => setArmed(false)}
    >
      {armed ? confirmLabel : children}
    </Button>
  );
}
