import { Award, TrendingDown } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { adminApi_ } from '../../api/admin';
import { formatScore } from '../../utils/format';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { PillarBarChart } from '../../components/charts/PillarBarChart';
import { FullPageSpinner } from '../../components/ui/Spinner';

export default function AdminAnalytics() {
  useDocumentTitle('تحليلات المحاور');
  const { data, loading, error } = useAsync(
    () => adminApi_.pillarAnalytics(),
    { deps: [] },
  );

  if (loading) return <AdminLayout><FullPageSpinner /></AdminLayout>;
  if (error) {
    return (
      <AdminLayout>
        <div className="text-sm text-red-600">{error}</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="heading-2">تحليلات المحاور</h1>
        <p className="mt-1 text-sm text-slate-500">
          متوسط الأداء عبر جميع التقييمات لكل محور
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardBody className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Award size={20} />
            </span>
            <div>
              <p className="text-xs text-slate-500">أقوى محور</p>
              <p className="text-lg font-extrabold text-slate-900">
                {data.strongest_pillar_ar}
              </p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <TrendingDown size={20} />
            </span>
            <div>
              <p className="text-xs text-slate-500">أضعف محور</p>
              <p className="text-lg font-extrabold text-slate-900">
                {data.weakest_pillar_ar}
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-5">
        <CardHeader title="متوسط النتائج لكل محور" />
        <CardBody>
          <PillarBarChart
            data={(data.pillars || []).map((p) => ({
              pillar_ar: p.pillar_ar,
              percentage: p.average_percentage,
              is_weak: p.average_percentage < 50,
            }))}
            height={340}
          />
        </CardBody>
      </Card>

      <Card className="mt-5">
        <CardHeader title="جدول المحاور" />
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-6 py-3 text-right font-semibold">المحور</th>
                  <th className="px-6 py-3 text-right font-semibold">المفتاح</th>
                  <th className="px-6 py-3 text-right font-semibold">متوسط النسبة</th>
                </tr>
              </thead>
              <tbody>
                {data.pillars.map((p) => (
                  <tr
                    key={p.pillar_key}
                    className="border-t border-slate-100"
                  >
                    <td className="px-6 py-3 font-semibold text-slate-800">
                      {p.pillar_ar}
                    </td>
                    <td className="px-6 py-3 text-slate-500 font-mono text-xs">
                      {p.pillar_key}
                    </td>
                    <td className="px-6 py-3 font-bold text-slate-700">
                      {formatScore(p.average_percentage)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </AdminLayout>
  );
}
