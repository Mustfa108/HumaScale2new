import { Link, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, Filter } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { adminApi_ } from '../../api/admin';
import { formatDate, formatScore } from '../../utils/format';
import { readinessFromKey } from '../../utils/constants';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ReadinessBadge } from '../../components/ui/Badge';
import { FullPageSpinner } from '../../components/ui/Spinner';

export default function AdminAssessments() {
  useDocumentTitle('التقييمات');
  const [params, setParams] = useSearchParams();
  const [page, setPage] = useState(1);

  const filters = {
    readiness_level: params.get('readiness_level') || '',
    date_from: params.get('date_from') || '',
    date_to: params.get('date_to') || '',
    sort_by: params.get('sort_by') || 'created_at',
    sort_order: params.get('sort_order') || 'desc',
  };

  const { data, loading, error, refresh } = useAsync(
    () => adminApi_.assessments({ page, ...filters }),
    { deps: [page, params.toString()] },
  );

  const applyFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
    setPage(1);
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="heading-2">التقييمات</h1>
          <p className="mt-1 text-sm text-slate-500">
            جميع التقييمات المكتملة عبر المنصة
          </p>
        </div>
        <Button variant="secondary" onClick={refresh}>
          تحديث
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <CardBody className="flex flex-wrap items-end gap-3 p-4">
          <div>
            <label className="label">مستوى الجاهزية</label>
            <select
              value={filters.readiness_level}
              onChange={(e) => applyFilter('readiness_level', e.target.value)}
              className="input"
            >
              <option value="">الكل</option>
              <option value="low">منخفض</option>
              <option value="medium">متوسط</option>
              <option value="good">جيد</option>
            </select>
          </div>
          <div>
            <label className="label">من تاريخ</label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => applyFilter('date_from', e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">إلى تاريخ</label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => applyFilter('date_to', e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">ترتيب حسب</label>
            <select
              value={filters.sort_by}
              onChange={(e) => applyFilter('sort_by', e.target.value)}
              className="input"
            >
              <option value="created_at">تاريخ الإنشاء</option>
              <option value="overall_score">النتيجة</option>
            </select>
          </div>
          <div>
            <label className="label">الاتجاه</label>
            <select
              value={filters.sort_order}
              onChange={(e) => applyFilter('sort_order', e.target.value)}
              className="input"
            >
              <option value="desc">تنازلي</option>
              <option value="asc">تصاعدي</option>
            </select>
          </div>
          {(filters.readiness_level ||
            filters.date_from ||
            filters.date_to) && (
            <Button
              variant="ghost"
              onClick={() => {
                setParams(new URLSearchParams());
                setPage(1);
              }}
              leftIcon={<Filter size={14} />}
            >
              مسح الفلاتر
            </Button>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-0">
          {loading ? (
            <div className="p-6">
              <FullPageSpinner />
            </div>
          ) : error ? (
            <div className="p-6 text-sm text-red-600">{error}</div>
          ) : (data?.data || []).length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              لا توجد تقييمات تطابق الفلاتر الحالية
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-6 py-3 text-right font-semibold">المستخدم</th>
                    <th className="px-6 py-3 text-right font-semibold">المنظمة</th>
                    <th className="px-6 py-3 text-right font-semibold">النتيجة</th>
                    <th className="px-6 py-3 text-right font-semibold">الجاهزية</th>
                    <th className="px-6 py-3 text-right font-semibold">التاريخ</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((a) => (
                    <tr
                      key={a.id}
                      className="border-t border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-3 font-semibold text-slate-900">
                        {a.user_name}
                      </td>
                      <td className="px-6 py-3 text-slate-600">
                        {a.organization_name || '—'}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className="font-bold"
                          style={{ color: readinessFromKey(a.readiness_level).color }}
                        >
                          {formatScore(a.overall_score)}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <ReadinessBadge level={a.readiness_level} />
                      </td>
                      <td className="px-6 py-3 text-slate-500">
                        {formatDate(a.created_at, { withTime: false })}
                      </td>
                      <td className="px-6 py-3">
                        <Link
                          to={`/admin/assessments/${a.id}`}
                          className="text-xs font-semibold text-brand-600 hover:underline"
                        >
                          التفاصيل
                          <ArrowLeft size={12} className="inline mr-1" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {data?.meta && data.meta.last_page > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="btn-secondary disabled:opacity-50"
          >
            السابق
          </button>
          <span className="text-sm text-slate-500">
            صفحة {data.meta.current_page} من {data.meta.last_page}
          </span>
          <button
            disabled={page === data.meta.last_page}
            onClick={() => setPage((p) => Math.min(data.meta.last_page, p + 1))}
            className="btn-secondary disabled:opacity-50"
          >
            التالي
          </button>
        </div>
      )}
    </AdminLayout>
  );
}
