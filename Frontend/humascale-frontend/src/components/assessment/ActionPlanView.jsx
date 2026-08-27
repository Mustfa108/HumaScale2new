import { useState } from 'react';
import { Clock, Target, Sparkles, TrendingUp } from 'lucide-react';
import clsx from 'clsx';
import { PHASE_LABELS_AR, PHASE_LABELS_EN, ACTION_STATUSES } from '../../utils/constants';
import { pickLocale } from '../../utils/locale';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { actionPlanApi } from '../../api/actionPlan';

const PHASE_ICONS = {
  immediate: Clock,
  medium: Target,
  long: TrendingUp,
};

const PHASE_TONE = {
  immediate: {
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-300',
    accent: 'border-rose-200 dark:border-rose-900',
    iconBg: 'bg-rose-100 dark:bg-rose-900',
  },
  medium: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    accent: 'border-amber-200 dark:border-amber-900',
    iconBg: 'bg-amber-100 dark:bg-amber-900',
  },
  long: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    accent: 'border-emerald-200 dark:border-emerald-900',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900',
  },
};

export function ActionPlanView({ actionPlan, onStatusChange }) {
  const { locale, t } = useLanguage();
  const toast = useToast();
  const [busyId, setBusyId] = useState(null);
  const [localStatus, setLocalStatus] = useState({});

  if (!actionPlan) {
    return (
      <div className="card p-6 text-sm text-slate-500">
        {locale === 'en' ? 'No action plan yet.' : 'لم يتم إنشاء خطة عمل بعد.'}
      </div>
    );
  }

  const phaseLabels = locale === 'en' ? PHASE_LABELS_EN : PHASE_LABELS_AR;

  const handleStatus = async (item, status) => {
    const previous = localStatus[item.id] ?? item.status;
    setLocalStatus((s) => ({ ...s, [item.id]: status }));
    setBusyId(item.id);
    try {
      await actionPlanApi.updateStatus(item.id, status);
      onStatusChange?.(item.id, status);
    } catch (err) {
      setLocalStatus((s) => ({ ...s, [item.id]: previous }));
      toast.error(err?.message || (locale === 'en' ? 'Could not update status.' : 'تعذّر تحديث الحالة.'));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      {actionPlan.ai_intro_ar && (
        <div className="card flex gap-3 p-5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950">
            <Sparkles size={18} />
          </span>
          <div>
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {t('dashboard.aiSummary')}
            </h4>
            <p className="mt-1 text-sm leading-7 text-slate-600 dark:text-slate-300">
              {actionPlan.ai_intro_ar}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {['immediate', 'medium', 'long'].map((phase) => {
          const data = actionPlan.phases?.[phase] || { items: [], label_ar: PHASE_LABELS_AR[phase] };
          const Icon = PHASE_ICONS[phase];
          const tone = PHASE_TONE[phase];
          const label = locale === 'en' ? data.label_en || phaseLabels[phase] : data.label_ar || phaseLabels[phase];
          return (
            <div
              key={phase}
              className={clsx('card overflow-hidden border-2', tone.accent)}
            >
              <div className={clsx('flex items-center gap-3 px-5 py-4', tone.bg)}>
                <span
                  className={clsx(
                    'flex h-9 w-9 items-center justify-center rounded-full',
                    tone.iconBg,
                    tone.text,
                  )}
                >
                  <Icon size={18} />
                </span>
                <div>
                  <h3 className={clsx('text-sm font-bold', tone.text)}>
                    {t(`phases.${phase}`)}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{label}</p>
                </div>
              </div>
              <ul className="space-y-3 p-5">
                {data.items?.length ? (
                  data.items.map((item) => {
                    const status = localStatus[item.id] ?? item.status ?? 'not_started';
                    const action = pickLocale(item, 'ai_rephrased', locale) || pickLocale(item, 'action', locale);
                    const kpi = pickLocale(item, 'kpi', locale);
                    const pillar = pickLocale({ name_ar: item.pillar_name_ar, name_en: item.pillar_name_en }, 'name', locale);
                    return (
                      <li
                        key={item.id}
                        className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                      >
                        <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {pillar}
                        </span>
                        <p className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                          {action}
                        </p>
                        {kpi && (
                          <p className="mt-2 flex items-start gap-1.5 text-xs text-slate-500">
                            <Target size={12} className="mt-0.5 shrink-0" />
                            <span>
                              <span className="font-semibold text-slate-600 dark:text-slate-300">{t('results.kpi')}: </span>
                              {kpi}
                            </span>
                          </p>
                        )}
                        <label className="mt-3 block text-[11px] font-semibold text-slate-500">
                          {t('results.status')}
                          <select
                            className="input mt-1 py-1.5 text-xs"
                            value={status}
                            disabled={busyId === item.id}
                            onChange={(e) => handleStatus(item, e.target.value)}
                          >
                            {ACTION_STATUSES.map((value) => (
                              <option key={value} value={value}>
                                {t(`planStatus.${value}`)}
                              </option>
                            ))}
                          </select>
                        </label>
                      </li>
                    );
                  })
                ) : (
                  <li className="text-sm text-slate-400">
                    {locale === 'en' ? 'No tasks in this phase.' : 'لا توجد مهام لهذه المرحلة.'}
                  </li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
