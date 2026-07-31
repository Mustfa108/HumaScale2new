import { CheckCircle2, Circle } from 'lucide-react';
import clsx from 'clsx';

export function AssessmentProgress({ pillars = [], answers = {} }) {
  // Total questions across all pillars
  const totalQuestions = pillars.reduce(
    (acc, p) => acc + (p.questions?.length || 0),
    0,
  );
  const answered = Object.keys(answers).filter((k) => answers[k] != null).length;
  const percent = totalQuestions
    ? Math.round((answered / totalQuestions) * 100)
    : 0;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-700">تقدم التقييم</span>
        <span className="font-bold text-brand-700">{percent}٪</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-l from-brand-500 to-brand-700 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-slate-500">
        {answered} من {totalQuestions} سؤال تمت الإجابة عليه
      </p>

      <ul className="mt-4 space-y-2">
        {pillars.map((p) => {
          const total = p.questions?.length || 0;
          const done = (p.questions || []).filter(
            (q) => answers[q.id] != null,
          ).length;
          const complete = total > 0 && done === total;
          return (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
            >
              <span className="flex items-center gap-2 text-slate-700">
                {complete ? (
                  <CheckCircle2 size={16} className="text-emerald-600" />
                ) : (
                  <Circle size={16} className="text-slate-300" />
                )}
                {p.name_ar}
              </span>
              <span
                className={clsx(
                  'text-xs font-semibold',
                  complete ? 'text-emerald-600' : 'text-slate-500',
                )}
              >
                {done}/{total}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
