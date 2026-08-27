import clsx from 'clsx';
import { readinessFromKey } from '../../utils/constants';

export function Badge({ children, variant = 'neutral', className = '' }) {
  const variantClass = {
    neutral: 'badge-neutral',
    good: 'badge-good',
    medium: 'badge-medium',
    low: 'badge-low',
    brand: 'bg-brand-50 text-brand-700',
  }[variant] || 'badge-neutral';

  return <span className={clsx(variantClass, className)}>{children}</span>;
}

export function ReadinessBadge({ level, className = '' }) {
  const cfg = readinessFromKey(level);
  if (!cfg) return null;
  const isEn = document.documentElement.lang === 'en';
  return (
    <span className={clsx(cfg.badgeClass, className)}>
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: cfg.color }}
      />
      {isEn ? cfg.labelEn : `جاهزية ${cfg.labelAr}`}
    </span>
  );
}
