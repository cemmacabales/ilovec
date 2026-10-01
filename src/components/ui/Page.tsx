import type { CSSProperties, ReactNode } from 'react';

// Page root. Shares its view-transition name with the Home widget that
// opens it, so the widget appears to grow into the page.
export function Page({ tile, className, children }: { tile: string; className?: string; children: ReactNode }) {
  return (
    <div className={['page', className].filter(Boolean).join(' ')} style={{ viewTransitionName: tile } as CSSProperties}>
      {children}
    </div>
  );
}
