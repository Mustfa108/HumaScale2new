import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Building2, Mail, Sparkles } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { adminApi_ } from '../../api/admin';
import { formatDate, formatScore } from '../../utils/format';
import { readinessFromKey, readinessFromScore } from '../../utils/constants';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { ReadinessBadge } from '../../components/ui/Badge';
import { FullPageSpinner } from '../../components/ui/Spinner';
import { PillarRadarChart } from '../../components/charts/PillarRadarChart';
import { PillarBarChart } from '../../components/charts/PillarBarChart';
import { ActionPlanView } from '../../components/assessment/ActionPlanView';

export default function AdminAssessmentDetail() {
  useDocumentTitle('تفاصيل التقييم');
  const { id } = useParams();
  const { data, loading, error } = useAsync(
    () => adminApi_.assessment(id),
    { deps: [id] },
  );

  if (loading) return <AdminLayout><FullPageSpinner /></AdminLayout>;
  if (error) {
    return (
      <AdminLayout>
        <div className="text-sm text-red-600">{error}</div>
      </AdminLayout>
    );
  }

  const a = data.assessment;
  const pillars = data.pillar_results || [];
  const actionPlan = data.action_plan;
  const readiness = readinessFromKey(a.readiness_level);

  return (
    <AdminLayout>
      <div className="mb-4">
        <Link
          to="/admin/assessments"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowRight size={14} />
          العودة لقائمة التقييمات
        </Link>
      </div>

      <Card>
        <CardBody>
          <div className="grid items-center gap-6 md:grid-cols-3">
            <div className="text-center md:text-right">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                النتيجة الإجمالية
              </p>
              <p
                className="mt-1 text-6xl font-extrabold"
                style={{ color: readiness.color }}
              >
                {formatScore(a.overall_score, 1)}
              </p>
              <div className="mt-3">
                <ReadinessBadge level={a.readiness_level} />
              </div>
            </div>

            <div className="md:col-span-2">
              <h2 className="text-lg font-bold text-slate-900">
                {a.user_name}
              </h2>
              <div className="mt-2 space-y-1 text-sm text-slate-600">
                {a.organization_name && (
                  <p className="flex items-center gap-1">
                    <Building2 size={14} className="text-slate-400" />
                    {a.organization_name}
                  </p>
                )}
                <p className="text-xs text-slate-500">
                  رقم التقييم #{a.id} • {formatDate(a.created_at)}
                </p>
              </div>
              {a.ai_summary_ar && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="mb-1 flex items-center gap-1 text-sm font-bold text-slate-700">
                    <Sparkles size={14} className="text-brand-600" />
                    ملخص ذكي
                  </h3>
                  <p className="text-sm leading-7 text-slate-700">
                    {a.ai_summary_ar}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="رادار المحاور" />
          <CardBody>
            <PillarRadarChart
              data={pillars}
              fillColor={readiness.color}
              strokeColor={readiness.color}
              height={300}
            />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="تفاصيل المحاور" />
          <CardBody>
            <PillarBarChart data={pillars} height={300} />
          </CardBody>
        </Card>
      </div>

      <Card className="mt-5">
        <CardHeader title="نتائج المحاور" />
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-6 py-3 text-right font-semibold">المحور</th>
                  <th className="px-6 py-3 text-right font-semibold">الدرجة</th>
                  <th className="px-6 py-3 text-right font-semibold">النسبة</th>
                  <th className="px-6 py-3 text-right font-semibold">التقييم</th>
                </tr>
              </thead>
              <tbody>
                {pillars.map((p) => {
                  const cfg = readinessFromScore(Number(p.percentage) || 0);
                  return (
                    <tr
                      key={p.pillar_id}
                      className="border-t border-slate-100"
                    >
                      <td className="px-6 py-3 font-semibold text-slate-800">
                        {p.pillar_name_ar}
                      </td>
                      <td className="px-6 py-3 text-slate-600">
                        {p.raw_score} / {p.max_score}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min(100, p.percentage)}%`,
                                backgroundColor: cfg.color,
                              }}
                            />
                          </div>
                          <span className="font-bold text-slate-700">
                            {formatScore(p.percentage)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        {p.is_weak ? (
                          <span className="badge-low">يحتاج تحسين</span>
                        ) : (
                          <span className="badge-good">جيد</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {actionPlan && (
        <div className="mt-6">
          <h3 className="heading-3 mb-4">خطة العمل</h3>
          <ActionPlanView actionPlan={actionPlan} />
        </div>
      )}
    </AdminLayout>
  );
}
