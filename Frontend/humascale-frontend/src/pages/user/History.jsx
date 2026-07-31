import { Link } from 'react-router-dom';
import { ArrowLeft, FileDown, ClipboardList, Loader2 } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import { useToast } from '../../contexts/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { assessmentApi } from '../../api/assessment';
import { downloadReport } from '../../api/report';
import { readinessFromKey } from '../../utils/constants';
import { formatDate, formatScore } from '../../utils/format';
import { PageContainer, PageHeader } from '../../components/layout/Navbar';
import { Card, CardBody, EmptyState } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ReadinessBadge } from '../../components/ui/Badge';
import { FullPageSpinner } from '../../components/ui/Spinner';

export default function History() {
  useDocumentTitle('سجل التقييمات');
  const toast = useToast();
  const { data, loading, error } = useAsync(
    () => assessmentApi.history(),
    { deps: [] },
  );

  if (loading) return <FullPageSpinner />;
  if (error) {
    return (
      <PageContainer>
        <EmptyState
          title="تعذّر تحميل السجل"
          description={error}
          action={<Link to="/dashboard" className="btn-primary">العودة للوحة المعلومات</Link>}
        />
      </PageContainer>
    );
  }

  const items = data?.data || [];
  const meta = data?.meta || {};

  return (
    <PageContainer>
      <PageHeader
        title="سجل التقييمات"
        subtitle={`لديك ${meta.total || 0} تقييم مكتمل`}
        actions={
          <Link to="/assessment" className="btn-primary">
            تقييم جديد
            <ArrowLeft size={16} />
          </Link>
        }
      />

      {items.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<ClipboardList size={48} />}
              title="لا توجد تقييمات بعد"
              description="ابدأ تقييمك الأول لرؤية سجل التقييمات هنا."
              action={
                <Link to="/assessment" className="btn-primary">
                  ابدأ التقييم
                  <ArrowLeft size={16} />
                </Link>
              }
            />
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-3">
          {items.map((a) => (
            <Card key={a.id} className="transition hover:shadow-card">
              <CardBody>
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="flex items-start gap-4">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-extrabold text-white"
                      style={{ backgroundColor: readinessFromKey(a.readiness_level).color }}
                    >
                      {Math.round(a.overall_score)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        تقييم رقم #{a.id}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDate(a.created_at)}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <ReadinessBadge level={a.readiness_level} />
                        <span className="text-xs font-semibold text-slate-600">
                          {formatScore(a.overall_score, 1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      disabled={!a.pdf_ready}
                      onClick={async () => {
                        try {
                          await downloadReport(a.id);
                        } catch (err) {
                          toast.error(err?.message || 'تعذّر التحميل.');
                        }
                      }}
                      leftIcon={a.pdf_ready ? <FileDown size={16} /> : <Loader2 size={16} className="animate-spin" />}
                    >
                      {a.pdf_ready ? 'PDF' : 'قيد التجهيز'}
                    </Button>
                    <Link
                      to={`/assessment/${a.id}/results`}
                      className="btn-primary"
                    >
                      عرض النتائج
                      <ArrowLeft size={16} />
                    </Link>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
