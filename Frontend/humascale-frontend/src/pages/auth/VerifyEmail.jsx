import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { authApi } from '../../api/auth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { AuthLayout } from './AuthLayout';

export default function VerifyEmail() {
  useDocumentTitle('تفعيل البريد الإلكتروني');
  const { id, hash } = useParams();
  const [state, setState] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function verify() {
      try {
        const res = await authApi.verifyEmail(id, hash);
        if (!cancelled) {
          setState('success');
          setMessage(res?.message || 'تم تفعيل بريدك الإلكتروني بنجاح.');
        }
      } catch (err) {
        if (!cancelled) {
          setState('error');
          setMessage(err?.message || 'رابط التحقق غير صالح أو منتهي الصلاحية.');
        }
      }
    }
    if (id && hash) verify();
    else {
      setState('error');
      setMessage('رابط التحقق غير مكتمل.');
    }
    return () => {
      cancelled = true;
    };
  }, [id, hash]);

  return (
    <AuthLayout
      title="تفعيل البريد الإلكتروني"
      subtitle="نتحقق من بريدك الإلكتروني لتفعيل حسابك"
    >
      <div className="text-center">
        {state === 'loading' && (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <Loader2 className="animate-spin" size={28} />
            </div>
            <p className="mt-4 text-sm text-slate-500">جارٍ التحقق…</p>
          </>
        )}
        {state === 'success' && (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={28} />
            </div>
            <p className="mt-4 text-sm text-slate-600">{message}</p>
            <Link
              to="/login"
              className="mt-6 inline-block rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              تسجيل الدخول الآن
            </Link>
          </>
        )}
        {state === 'error' && (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
              <XCircle size={28} />
            </div>
            <p className="mt-4 text-sm text-slate-600">{message}</p>
            <Link
              to="/login"
              className="mt-6 inline-block font-semibold text-brand-600 hover:text-brand-700"
            >
              العودة لتسجيل الدخول
            </Link>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
