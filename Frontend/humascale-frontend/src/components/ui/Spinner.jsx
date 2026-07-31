import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

export function Spinner({ size = 20, className = '' }) {
  return (
    <Loader2
      className={clsx('animate-spin', className)}
      size={size}
      aria-hidden="true"
    />
  );
}

export function FullPageSpinner({ label = 'جارٍ التحميل…' }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-slate-500">
      <Spinner size={32} className="text-brand-600" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function InlineSpinner({ label }) {
  return (
    <span className="inline-flex items-center gap-2 text-slate-500">
      <Spinner size={16} className="text-brand-600" />
      {label && <span className="text-sm">{label}</span>}
    </span>
  );
}
