import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Search, ArrowLeft, Mail, Building2 } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { adminApi_ } from '../../api/admin';
import { formatDate } from '../../utils/format';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { FullPageSpinner } from '../../components/ui/Spinner';

export default function AdminUsers() {
  useDocumentTitle('المستخدمون');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, loading, error } = useAsync(
    () => adminApi_.users({ page, search }),
    { deps: [page, search] },
  );

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="heading-2">المستخدمون</h1>
          <p className="mt-1 text-sm text-slate-500">
            جميع المستخدمين المسجلين في المنصة
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <Input
            type="search"
            placeholder="ابحث بالاسم أو البريد…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pr-9"
          />
        </div>
      </div>

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
              لا توجد نتائج
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-6 py-3 text-right font-semibold">المستخدم</th>
                    <th className="px-6 py-3 text-right font-semibold">المنظمة</th>
                    <th className="px-6 py-3 text-right font-semibold">التقييمات</th>
                    <th className="px-6 py-3 text-right font-semibold">آخر تقييم</th>
                    <th className="px-6 py-3 text-right font-semibold">تاريخ التسجيل</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((u) => (
                    <tr
                      key={u.id}
                      className="border-t border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                            {u.name?.[0] || '؟'}
                          </span>
                          <div>
                            <p className="font-semibold text-slate-900">{u.name}</p>
                            <p className="flex items-center gap-1 text-xs text-slate-500">
                              <Mail size={11} />
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-slate-600">
                        {u.organization_name ? (
                          <span className="inline-flex items-center gap-1">
                            <Building2 size={12} className="text-slate-400" />
                            {u.organization_name}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3 font-semibold text-slate-700">
                        {u.assessments_count || 0}
                      </td>
                      <td className="px-6 py-3 text-slate-500">
                        {u.last_assessment_at
                          ? formatDate(u.last_assessment_at, { withTime: false })
                          : '—'}
                      </td>
                      <td className="px-6 py-3 text-slate-500">
                        {formatDate(u.created_at, { withTime: false })}
                      </td>
                      <td className="px-6 py-3">
                        <Link
                          to={`/admin/assessments?user_id=${u.id}`}
                          className="text-xs font-semibold text-brand-600 hover:underline"
                        >
                          عرض التقييمات
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

      {/* Pagination */}
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
