import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  FileDown,
  Loader2,
  RefreshCw,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Share2,
} from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import { useToast } from '../../contexts/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { assessmentApi } from '../../api/assessment';
import { downloadReport } from '../../api/report';
import { readinessFromKey, readinessFromScore } from '../../utils/constants';
import { formatDate, formatScore } from '../../utils/format';
import { pillarLabel } from '../../utils/locale';
import { useLanguage } from '../../contexts/LanguageContext';
import { PageContainer, PageHeader } from '../../components/layout/Navbar';
import { PillarRadarChart } from '../../components/charts/PillarRadarChart';
import { PillarBarChart } from '../../components/charts/PillarBarChart';
import { ActionPlanView } from '../../components/assessment/ActionPlanView';
import { Card, CardBody, CardHeader, EmptyState } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ReadinessBadge } from '../../components/ui/Badge';
import { FullPageSpinner, InlineSpinner } from '../../components/ui/Spinner';

/**
 * Auto-refresh the page every 8s while AI or PDF are still being generated.
 * Stops as soon as both are ready.
 */
function useAutoRefresh(ready, refresh, intervalMs = 8000) {
  useEffect(() => {
    if (ready) return;
    const id = setInterval(refresh, intervalMs);
    return () => clearInterval(id);
  }, [ready, refresh, intervalMs]);
}

export default function AssessmentResults() {
  const { locale, t } = useLanguage();
  useDocumentTitle(t('results.title'));
  const { id } = useParams();
  const toast = useToast();

  const { data, loading, error, refresh } = useAsync(
    () => assessmentApi.results(id),
    { deps: [id] },
  );

  const bothReady = data?.assessment?.ai_ready && data?.assessment?.pdf_ready;
  useAutoRefresh(bothReady, refresh);

  if (loading && !data) return <FullPageSpinner />;
  if (error) {
    return (
      <PageContainer>
        <EmptyState
          icon={<AlertTriangle size={40} />}
          title="تعذّر تحميل النتائج"
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

  const assessment = data.assessment;
  const pillars = data.pillar_results || [];
  const actionPlan = data.action_plan;
  const readiness = readinessFromKey(assessment.readiness_level);

  const handleDownload = async () => {
    try {
      await downloadReport(assessment.id);
      toast.success('جاري تحميل التقرير…');
    } catch (err) {
      toast.error(err?.message || 'تعذّر تحميل التقرير.');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'نتيجة تقييم HumaScale',
          text: `نتيجة تقييمي على HumaScale: ${formatScore(assessment.overall_score)} - جاهزية ${readiness.labelAr}`,
          url: window.location.href,
        });
      } catch {
        /* user cancelled */
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('تم نسخ رابط النتائج.');
      } catch {
        toast.error('تعذّر نسخ الرابط.');
      }
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title={t('results.title')}
        subtitle={`${locale === 'en' ? 'Completed' : 'تم التقييم في'} ${formatDate(assessment.created_at, { withTime: false })}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={handleShare} leftIcon={<Share2 size={16} />}>
              {locale === 'en' ? 'Share' : 'مشاركة'}
            </Button>
            <Button
              onClick={handleDownload}
              disabled={!assessment.pdf_ready}
              leftIcon={assessment.pdf_ready ? <FileDown size={16} /> : <Loader2 size={16} className="animate-spin" />}
            >
              {assessment.pdf_ready ? t('results.pdf') : t('results.pdfPending')}
            </Button>
          </div>
        }
      />

      {/* Score summary */}
      <Card>
        <CardBody>
          <div className="grid items-center gap-6 md:grid-cols-3">
            <div className="text-center md:text-right">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {t('results.overall')}
              </p>
              <p
                className="mt-1 text-6xl font-extrabold"
                style={{ color: readiness.color }}
              >
                {formatScore(assessment.overall_score, 1)}
              </p>
              <div className="mt-3">
                <ReadinessBadge level={assessment.readiness_level} />
              </div>
              <p className="mt-2 text-sm text-slate-600">
                {locale === 'en' ? readiness.descriptionEn : readiness.description}
              </p>
            </div>
            <div className="md:col-span-2">
              <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                <Sparkles size={16} className="text-brand-600" />
                {t('dashboard.aiSummary')}
                {assessment.ai_ready ? (
                  <span className="badge-good">{locale === 'en' ? 'Ready' : 'جاهز'}</span>
                ) : (
                  <span className="badge-neutral">
                    <InlineSpinner label={t('common.loading')} />
                  </span>
                )}
              </div>
              {assessment.ai_summary_ar ? (
                <p className="text-sm leading-8 text-slate-700">
                  {assessment.ai_summary_ar}
                </p>
              ) : (
                <p className="text-sm text-slate-500">
                  {t('results.aiPending')}
                </p>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Charts */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title={t('results.radar')} subtitle={locale === 'en' ? 'Six pillars' : 'نظرة شاملة على 6 محاور'} />
          <CardBody>
            <PillarRadarChart
              data={pillars}
              fillColor={readiness.color}
              strokeColor={readiness.color}
              height={320}
              locale={locale}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={t('results.pillars')} subtitle={locale === 'en' ? 'Percentage per pillar' : 'النسبة المئوية لكل محور'} />
          <CardBody>
            <PillarBarChart data={pillars} height={320} locale={locale} />
          </CardBody>
        </Card>
      </div>

      {/* Pillar breakdown */}
      <Card className="mt-5">
        <CardHeader title="تفاصيل المحاور" subtitle="الدرجة الخام والنسبة لكل محور" />
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
                      className="border-t border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-3 font-semibold text-slate-800">
                        {pillarLabel(p, locale)}
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
                          <span className="badge-low">{t('results.weak')}</span>
                        ) : (
                          <span className="badge-good">{t('results.strong')}</span>
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

      {/* Action plan */}
      <div className="mt-6">
        <h2 className="heading-3 mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-brand-600" />
          {t('results.plan')}
        </h2>
        {actionPlan ? (
          <ActionPlanView actionPlan={actionPlan} />
        ) : (
          <Card>
            <CardBody>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <InlineSpinner label="يتم توليد خطة العمل المخصصة…" />
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm text-slate-500">هل تريد إعادة التقييم؟</p>
        <Link to="/assessment" className="btn-primary">
          تقييم جديد
          <ArrowLeft size={16} />
        </Link>
      </div>
    </PageContainer>
  );
}
