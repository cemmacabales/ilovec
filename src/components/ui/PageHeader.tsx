import type { ReactNode } from 'react';

interface PageHeaderProps {
  icon: ReactNode;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}

// Notion-style page head: icon, large title, one line of context, actions.
export function PageHeader({ icon, title, description, actions }: PageHeaderProps) {
  return (
    <header className="page-header">
      <span className="page-header__icon" aria-hidden>
        {icon}
      </span>
      <div className="page-header__text">
        <h1 className="page-header__title">{title}</h1>
        {description && <p className="page-header__desc">{description}</p>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </header>
  );
}
