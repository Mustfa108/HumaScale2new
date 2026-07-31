import { Link } from 'react-router-dom';
import { Bell, BellOff, CheckCheck, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import { useAsync } from '../../hooks/useAsync';
import { useToast } from '../../contexts/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { notificationApi } from '../../api/notification';
import { PageContainer, PageHeader } from '../../components/layout/Navbar';
import { Card, CardBody, EmptyState } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FullPageSpinner } from '../../components/ui/Spinner';
import { formatDate } from '../../utils/format';

export default function Notifications() {
  useDocumentTitle('الإشعارات');
  const toast = useToast();
  const { data, loading, error, refresh } = useAsync(
    () => notificationApi.list(),
    { deps: [] },
  );
  const [markingAll, setMarkingAll] = useState(false);

  if (loading) return <FullPageSpinner />;
  if (error) {
    return (
      <PageContainer>
        <EmptyState
          title="تعذّر تحميل الإشعارات"
          description={error}
          action={<Button onClick={refresh}>إعادة المحاولة</Button>}
        />
      </PageContainer>
    );
  }

  const items = data?.data || [];
  const unread = data?.unread_count || 0;

  const handleMarkAll = async () => {
    setMarkingAll(true);
    try {
      await notificationApi.markAllRead();
      toast.success('تم تعليم جميع الإشعارات كمقروءة.');
      refresh();
    } catch (err) {
      toast.error(err?.message || 'حدث خطأ.');
    } finally {
      setMarkingAll(false);
    }
  };

  const handleMarkOne = async (id) => {
    try {
      await notificationApi.markRead(id);
      refresh();
    } catch (err) {
      toast.error(err?.message || 'حدث خطأ.');
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="الإشعارات"
        subtitle={`لديك ${unread} إشعار غير مقروء`}
        actions={
          unread > 0 ? (
            <Button
              variant="secondary"
              onClick={handleMarkAll}
              loading={markingAll}
              leftIcon={<CheckCheck size={16} />}
            >
              تعليم الكل كمقروء
            </Button>
          ) : null
        }
      />

      {items.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<BellOff size={48} />}
              title="لا توجد إشعارات"
              description="ستظهر هنا إشعارات النظام عند اكتمال التحليل أو تجهيز التقارير."
            />
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((n) => {
            const isUnread = !n.read_at;
            const assessmentId = n.data?.assessment_id;
            return (
              <Card
                key={n.id}
                className={clsx(
                  'transition',
                  isUnread ? 'border-brand-200 bg-brand-50/30' : '',
                )}
              >
                <CardBody className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span
                        className={clsx(
                          'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                          isUnread
                            ? 'bg-brand-100 text-brand-700'
                            : 'bg-slate-100 text-slate-500',
                        )}
                      >
                        <Bell size={18} />
                      </span>
                      <div>
                        <h3
                          className={clsx(
                            'text-sm font-bold',
                            isUnread ? 'text-slate-900' : 'text-slate-700',
                          )}
                        >
                          {n.title_ar || n.data?.title || 'إشعار'}
                        </h3>
                        {n.body_ar && (
                          <p className="mt-1 text-sm text-slate-600">
                            {n.body_ar}
                          </p>
                        )}
                        <p className="mt-2 text-xs text-slate-400">
                          {formatDate(n.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {assessmentId && (
                        <Link
                          to={`/assessment/${assessmentId}/results`}
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-brand-600"
                          title="فتح"
                        >
                          <ExternalLink size={16} />
                        </Link>
                      )}
                      {isUnread && (
                        <button
                          onClick={() => handleMarkOne(n.id)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-emerald-600"
                          title="تعليم كمقروء"
                        >
                          <CheckCheck size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
