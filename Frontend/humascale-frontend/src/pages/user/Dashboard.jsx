import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  History as HistoryIcon,
  RefreshCw,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Award,
  FileDown,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { dashboardApi } from '../../api/dashboard';
import { reportApi, downloadReport } from '../../api/report';
import { readinessFromKey, readinessFromScore, PILLAR_LABELS_AR } from '../../utils/constants';
import { formatDate, formatScore } from '../../utils/format';
import { PageContainer, PageHeader } from '../../components/layout/Navbar';
import { PillarRadarChart } from '../../components/charts/PillarRadarChart';
import { Card, CardBody, EmptyState } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ReadinessBadge } from '../../components/ui/Badge';
import { FullPageSpinner, InlineSpinner } from '../../components/ui/Spinner';

export default function Dashboard() {
  useDocumentTitle('لوحة المعلومات');
  const { user } = useAuth();
  const { data, loading, error, refresh } = useAsync(() => dashboardApi.get(), {
    deps: [],
  });

  if (loading && !data) return <FullPageSpinner />;
  if (error) {
    return (
      <PageContainer>
        <EmptyState
          icon={<AlertTriangle size={40} />}
          title="تعذّر تحميل لوحة المعلومات"
          description={error}
          action={
            <Button onClick={refresh} leftIcon={<RefreshCw size={16} />}>
              إعادة المحاولة
            </Button>
          }
        />
      </PageContainer>
    );
  }

  if (!data?.has_assessment) {
    return <NoAssessmentState user={user} />;
  }

  const latest = data.latest_assessment;
  const readiness = readinessFromKey(latest.readiness_level);
  const totalAssessments = data.total_assessments || 0;

  return (
    <PageContainer>
      <PageHeader
        title={`أهلاً، ${user?.name?.split(' ')[0] || 'بك'} 👋`}
        subtitle="هذه نظرة سريعة على آخر تقييم لك"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={refresh}
              leftIcon={<RefreshCw size={16} />}
            >
              تحديث
            </Button>
            <Link to="/assessment" className="btn-primary">
              <ClipboardList size={16} />
              تقييم جديد
            </Link>
          </div>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Score card */}
        <Card className="lg:col-span-1">
          <CardBody>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              النتيجة الإجمالية
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span
                className="text-5xl font-extrabold"
                style={{ color: readiness.color }}
              >
                {formatScore(latest.overall_score, 1)}
              </span>
            </div>
            <div className="mt-3">
              <ReadinessBadge level={latest.readiness_level} />
            </div>
            <p className="mt-3 text-sm text-slate-600">
              {readiness.description}
            </p>
            <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
              <Award size={14} />
              أجريت {totalAssessments} {totalAssessments === 1 ? 'تقييم' : 'تقييمات'}
              {' • '}
              {formatDate(latest.created_at, { withTime: false })}
            </div>
            <div className="mt-5 flex flex-col gap-2">
              <Link
                to={`/assessment/${latest.id}/results`}
                className="btn-primary w-full"
              >
                عرض النتائج الكاملة
                <ArrowLeft size={16} />
              </Link>
              <Link to="/history" className="btn-secondary w-full">
                <HistoryIcon size={16} />
                سجل التقييمات
              </Link>
            </div>
          </CardBody>
        </Card>

        {/* Radar chart */}
        <Card className="lg:col-span-2">
          <CardBody>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                رادار المحاور
              </h3>
              <span className="text-xs text-slate-500">
                {data.radar_chart_data?.length || 0} محاور
              </span>
            </div>
            <PillarRadarChart
              data={data.radar_chart_data || []}
              fillColor={readiness.color}
              strokeColor={readiness.color}
              height={320}
            />
          </CardBody>
        </Card>
      </div>

      {/* AI summary + actions */}
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardBody>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Sparkles size={16} />
              </span>
              <h3 className="font-bold text-slate-900">ملخص ذكي</h3>
              {latest.ai_ready ? (
                <span className="badge-good">جاهز</span>
              ) : (
                <span className="badge-neutral">
                  <InlineSpinner label="قيد التوليد…" />
                </span>
              )}
            </div>
            {data.ai_summary_ar ? (
              <p className="text-sm leading-7 text-slate-700">
                {data.ai_summary_ar}
              </p>
            ) : (
              <p className="text-sm text-slate-500">
                الملخص الذكي قيد التوليد — سيتم تحديث هذه الصفحة تلقائياً عند
                الجاهزية. يمكنك الانتقال لصفحة النتائج للمتابعة.
              </p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h3 className="font-bold text-slate-900">الإجراءات السريعة</h3>
            <div className="mt-4 space-y-2">
              <ActionItem
                to={`/assessment/${latest.id}/results`}
                icon={FileDown}
                title="تحميل تقرير PDF"
                desc={latest.pdf_ready ? 'التقرير جاهز' : 'يتم تجهيز التقرير…'}
                disabled={!latest.pdf_ready}
                onClick={async (e) => {
                  if (!latest.pdf_ready) {
                    e.preventDefault();
                    return;
                  }
                  e.preventDefault();
                  try {
                    await downloadReport(latest.id);
                  } catch {
                    /* handled by toast inside component if needed */
                  }
                }}
              />
              <ActionItem
                to="/assessment"
                icon={ClipboardList}
                title="ابدأ تقييماً جديداً"
                desc="18 سؤالاً · ~5 دقائق"
              />
              <ActionItem
                to="/history"
                icon={HistoryIcon}
                title="عرض السجل"
                desc={`لديك ${totalAssessments} تقييم`}
              />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Strengths / weaknesses */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardBody>
            <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
              <CheckCircle2 size={18} className="text-emerald-600" />
              نقاط القوة
            </h3>
            {(data.strengths || []).length === 0 ? (
              <p className="text-sm text-slate-500">لا توجد بيانات بعد.</p>
            ) : (
              <ul className="space-y-3">
                {data.strengths.map((s) => (
                  <li
                    key={s.pillar_ar}
                    className="flex items-center justify-between rounded-xl bg-emerald-50/50 px-4 py-3"
                  >
                    <span className="text-sm font-semibold text-slate-800">
                      {s.pillar_ar}
                    </span>
                    <span className="text-sm font-bold text-emerald-700">
                      {formatScore(s.percentage)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
              <AlertTriangle size={18} className="text-amber-600" />
              نقاط الضعف
            </h3>
            {(data.weaknesses || []).length === 0 ? (
              <p className="text-sm text-slate-500">لا توجد نقاط ضعف حالياً.</p>
            ) : (
              <ul className="space-y-3">
                {data.weaknesses.map((s) => (
                  <li
                    key={s.pillar_ar}
                    className="flex items-center justify-between rounded-xl bg-amber-50/50 px-4 py-3"
                  >
                    <span className="text-sm font-semibold text-slate-800">
                      {s.pillar_ar}
                    </span>
                    <span className="text-sm font-bold text-amber-700">
                      {formatScore(s.percentage)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </PageContainer>
  );
}

function NoAssessmentState({ user }) {
  return (
    <PageContainer>
      <PageHeader
        title={`أهلاً، ${user?.name?.split(' ')[0] || 'بك'} 👋`}
        subtitle="ابدأ رحلتك في تقييم جاهزية فريقك"
      />
      <Card>
        <CardBody>
          <EmptyState
            icon={<ClipboardList size={48} />}
            title="لم تقم بأي تقييم بعد"
            description="ابدأ تقييمك الأول الآن! ستحتاج إلى 5 دقائق فقط للإجابة على 18 سؤالاً."
            action={
              <Link to="/assessment" className="btn-primary">
                ابدأ التقييم
                <ArrowLeft size={16} />
              </Link>
            }
          />
        </CardBody>
      </Card>
    </PageContainer>
  );
}

function ActionItem({ to, icon: Icon, title, desc, disabled, onClick }) {
  if (disabled) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 opacity-60">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-200 text-slate-500">
          <Icon size={18} />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-700">{title}</p>
          <p className="text-xs text-slate-500">{desc}</p>
        </div>
      </div>
    );
  }
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 transition hover:bg-brand-50 hover:text-brand-700"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-brand-600 shadow-sm">
        <Icon size={18} />
      </span>
      <div>
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
    </Link>
  );
}
