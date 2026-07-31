import { Link } from 'react-router-dom';
import {
  Users,
  ClipboardList,
  CheckCircle2,
  Clock,
  TrendingUp,
  Award,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { adminApi_ } from '../../api/admin';
import { formatDate, formatScore } from '../../utils/format';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { ReadinessDonut } from '../../components/charts/ReadinessDonut';
import { PillarBarChart } from '../../components/charts/PillarBarChart';
import { FullPageSpinner } from '../../components/ui/Spinner';
import { readinessFromScore } from '../../utils/constants';

export default function AdminDashboard() {
  useDocumentTitle('لوحة الإدارة');
  const { data, loading, error } = useAsync(() => adminApi_.dashboard(), {
    deps: [],
  });

  if (loading) return <AdminLayout><FullPageSpinner /></AdminLayout>;
  if (error) {
    return (
      <AdminLayout>
        <div className="text-sm text-red-600">{error}</div>
      </AdminLayout>
    );
  }

  const dist = data.readiness_distribution || {};
  const total = data.total_assessments || 0;

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="heading-2">نظرة عامة</h1>
        <p className="mt-1 text-sm text-slate-500">
          إحصائيات مجمعة لجميع المستخدمين والتقييمات
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={Users}
          label="إجمالي المستخدمين"
          value={data.total_users}
          tone="brand"
        />
        <KpiCard
          icon={ClipboardList}
          label="إجمالي التقييمات"
          value={data.total_assessments}
          tone="amber"
        />
        <KpiCard
          icon={CheckCircle2}
          label="تقييمات مكتملة"
          value={data.completed_assessments}
          tone="emerald"
        />
        <KpiCard
          icon={Clock}
          label="تقييمات قيد التنفيذ"
          value={data.in_progress_assessments}
          tone="slate"
        />
      </div>

      {/* Average + month stats */}
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <KpiCard
          icon={Award}
          label="متوسط النتيجة الإجمالية"
          value={formatScore(data.average_overall_score)}
          tone="brand"
        />
        <KpiCard
          icon={TrendingUp}
          label="تقييمات هذا الشهر"
          value={data.assessments_this_month}
          tone="emerald"
        />
        <KpiCard
          icon={Users}
          label="مستخدمون جدد هذا الشهر"
          value={data.new_users_this_month}
          tone="amber"
        />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader title="توزيع الجاهزية" subtitle="نسبة التقييمات حسب المستوى" />
          <CardBody>
            <ReadinessDonut data={Object.values(dist)} />
            <ul className="mt-3 space-y-1.5 text-sm">
              {Object.values(dist).map((d) => (
                <li
                  key={d.key || d.label_ar}
                  className="flex items-center justify-between"
                >
                  <span className="text-slate-600">{d.label_ar}</span>
                  <span className="font-semibold text-slate-800">
                    {d.count} ({d.percentage}%)
                  </span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="متوسط نتائج المحاور"
            subtitle="متوسط النسبة المئوية لكل محور عبر جميع التقييمات"
          />
          <CardBody>
            <PillarBarChart
              data={(data.pillar_averages || []).map((p) => ({
                pillar_ar: p.pillar_ar,
                percentage: p.average_percentage,
                is_weak: p.average_percentage < 50,
              }))}
              height={300}
            />
          </CardBody>
        </Card>
      </div>

      <Card className="mt-5">
        <CardHeader
          title="أضعف محور لدى المستخدمين"
          subtitle="المحور الأكثر تكراراً في نقاط الضعف"
          action={
            <Link
              to="/admin/analytics"
              className="text-sm font-semibold text-brand-600 hover:underline"
            >
              عرض التحليلات الكاملة
              <ArrowLeft size={14} className="inline mr-1" />
            </Link>
          }
        />
        <CardBody>
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <AlertTriangle size={22} />
            </span>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">
                {data.most_common_weak_pillar_ar}
              </p>
              <p className="text-sm text-slate-500">
                هذا هو المحور الذي يعاني منه أغلب المستخدمين حالياً.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </AdminLayout>
  );
}

function KpiCard({ icon: Icon, label, value, tone = 'brand' }) {
  const toneClass = {
    brand: 'bg-brand-50 text-brand-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    slate: 'bg-slate-100 text-slate-600',
  }[tone];

  return (
    <Card>
      <CardBody className="flex items-center gap-3 p-5">
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${toneClass}`}>
          <Icon size={20} />
        </span>
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className="text-xl font-extrabold text-slate-900">{value ?? 0}</p>
        </div>
      </CardBody>
    </Card>
  );
}
