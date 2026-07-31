import clsx from 'clsx';

export function Card({ as: Tag = 'div', className = '', children, ...rest }) {
  return (
    <Tag className={clsx('card', className)} {...rest}>
      {children}
    </Tag>
  );
}

export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div
      className={clsx(
        'flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4',
        className,
      )}
    >
      <div>
        {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({ className = '', children }) {
  return <div className={clsx('p-6', className)}>{children}</div>;
}

export function EmptyState({ icon, title, description, action, className = '' }) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center',
        className,
      )}
    >
      {icon && <div className="text-slate-400">{icon}</div>}
      {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
      {description && (
        <p className="max-w-md text-sm text-slate-500">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
