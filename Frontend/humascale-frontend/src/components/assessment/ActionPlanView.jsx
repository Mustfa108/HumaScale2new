import { Clock, Target, Sparkles, TrendingUp } from 'lucide-react';
import clsx from 'clsx';
import { PHASE_LABELS_AR } from '../../utils/constants';

const PHASE_ICONS = {
  immediate: Clock,
  medium: Target,
  long: TrendingUp,
};

const PHASE_TONE = {
  immediate: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    accent: 'border-rose-200',
    iconBg: 'bg-rose-100',
  },
  medium: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    accent: 'border-amber-200',
    iconBg: 'bg-amber-100',
  },
  long: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    accent: 'border-emerald-200',
    iconBg: 'bg-emerald-100',
  },
};

export function ActionPlanView({ actionPlan }) {
  if (!actionPlan) {
    return (
      <div className="card p-6 text-sm text-slate-500">
        لم يتم إنشاء خطة عمل بعد.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {actionPlan.ai_intro_ar && (
        <div className="card flex gap-3 p-5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <Sparkles size={18} />
          </span>
          <div>
            <h4 className="text-sm font-semibold text-slate-700">مقدمة ذكية</h4>
            <p className="mt-1 text-sm leading-7 text-slate-600">
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
                    المرحلة {phase === 'immediate' ? 'الفورية' : phase === 'medium' ? 'المتوسطة' : 'طويلة المدى'}
                  </h3>
                  <p className="text-xs text-slate-600">{data.label_ar}</p>
                </div>
              </div>
              <ul className="space-y-3 p-5">
                {data.items?.length ? (
                  data.items.map((item, idx) => (
                    <li
                      key={idx}
                      className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
                    >
                      <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        {item.pillar_name_ar}
                      </span>
                      <p className="mt-2 text-sm font-medium text-slate-900">
                        {item.ai_rephrased_ar || item.action_ar}
                      </p>
                      {item.kpi_ar && (
                        <p className="mt-2 flex items-start gap-1.5 text-xs text-slate-500">
                          <Target size={12} className="mt-0.5 shrink-0" />
                          <span>{item.kpi_ar}</span>
                        </p>
                      )}
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-slate-400">لا توجد مهام لهذه المرحلة.</li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
