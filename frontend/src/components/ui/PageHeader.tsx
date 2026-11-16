import type { ReactNode } from 'react';

export default function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
      <div>
        <h1 className="h3 mb-0">{title}</h1>
        {subtitle && <small className="text-muted">{subtitle}</small>}
      </div>
      {actions}
    </div>
  );
}
