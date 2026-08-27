import clsx from 'clsx';
import { LIKERT_SCALE } from '../../utils/constants';
import { useLanguage } from '../../contexts/LanguageContext';

export function QuestionCard({
  index,
  total,
  pillar,
  question,
  value,
  onChange,
}) {
  const { locale, t } = useLanguage();
  return (
    <div className="card-padded animate-fade-in">
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 font-medium text-brand-700 dark:bg-brand-950 dark:text-brand-200">
          {pillar}
        </span>
        <span className="text-slate-500">
          {t('assessment.questionOf', { n: index + 1, total })}
        </span>
      </div>
      <h2 className="text-xl font-bold text-slate-900 text-balance dark:text-slate-50">
        {question}
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        {t('assessment.likertHint')}
      </p>

      <div className="mt-6 grid grid-cols-5 gap-2 sm:gap-3">
        {LIKERT_SCALE.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={clsx(
                'group flex flex-col items-center justify-center rounded-2xl border-2 p-3 transition-all',
                'hover:-translate-y-0.5 hover:shadow-soft focus:outline-none focus:ring-2 focus:ring-offset-2',
                selected
                  ? 'border-transparent bg-white shadow-card ring-2 dark:bg-slate-900'
                  : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900',
              )}
              style={
                selected
                  ? {
                      borderColor: opt.color,
                      boxShadow: `0 0 0 2px ${opt.color}33`,
                    }
                  : undefined
              }
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold text-white"
                style={{ backgroundColor: opt.color }}
              >
                {opt.value}
              </span>
              <span className="mt-2 text-xs font-medium text-slate-700 sm:text-sm dark:text-slate-200">
                {locale === 'en' ? opt.labelEn : opt.labelAr}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
