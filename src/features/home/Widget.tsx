import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface WidgetProps {
  to: string;
  tile: string; // view-transition name shared with the destination page
  area: string; // grid area
  label: string; // accessible name of the open link
  index: number; // entrance stagger order
  tone?: 'plain' | 'photo' | 'accent';
  className?: string;
  children: ReactNode;
}

// An iOS-style widget. The whole tile opens its page; interactive
// controls inside sit above the stretched link.
export function Widget({ to, tile, area, label, index, tone = 'plain', className, children }: WidgetProps) {
  const style = {
    gridArea: area,
    viewTransitionName: tile,
    ['--i' as string]: index,
  } as CSSProperties;

  return (
    <section className={['widget', `widget--${tone}`, className].filter(Boolean).join(' ')} style={style}>
      <Link to={to} viewTransition className="widget__link" aria-label={label} />
      {children}
    </section>
  );
}

export function WidgetHead({ icon, title, aside }: { icon: ReactNode; title: string; aside?: ReactNode }) {
  return (
    <div className="widget__head">
      <span className="widget__icon" aria-hidden>
        {icon}
      </span>
      <span className="widget__title">{title}</span>
      {aside && <span className="widget__aside">{aside}</span>}
    </div>
  );
}
