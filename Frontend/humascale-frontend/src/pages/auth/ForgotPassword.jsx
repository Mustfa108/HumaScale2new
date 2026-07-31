import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { authApi } from '../../api/auth';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { AuthLayout } from './AuthLayout';

export default function ForgotPassword() {
  useDocumentTitle('نسيت كلمة المرور');
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [error, setError] = useState();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(undefined);
    setSubmitting(true);
    try {
      await authApi.forgotPassword({ email });
      setSubmitted(true);
    } catch (err) {
      toast.error(err?.message || 'حدث خطأ.');
      setError(err?.errors?.email?.[0]);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <AuthLayout
        title="تم إرسال الرابط"
        subtitle="إذا كان البريد مسجلاً لدينا، فستصلك رسالة تحتوي على رابط إعادة التعيين."
      >
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <MailCheck size={28} />
          </div>
          <p className="mt-4 text-sm text-slate-600">
            تحقق من بريدك الإلكتروني واتبع التعليمات لإعادة تعيين كلمة المرور.
            الرابط صالح لمدة 60 دقيقة.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-block font-semibold text-brand-600 hover:text-brand-700"
          >
            العودة لتسجيل الدخول
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="نسيت كلمة المرور؟"
      subtitle="أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة التعيين"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          type="email"
          name="email"
          label="البريد الإلكتروني"
          placeholder="example@org.com"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(undefined);
          }}
          error={error}
        />
        <Button type="submit" loading={submitting} className="w-full">
          إرسال رابط إعادة التعيين
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        تذكرت كلمة المرور؟{' '}
        <Link
          to="/login"
          className="font-semibold text-brand-600 hover:text-brand-700"
        >
          تسجيل الدخول
        </Link>
      </p>
    </AuthLayout>
  );
}
