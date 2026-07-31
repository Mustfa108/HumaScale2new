import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/ui/Button';
import { PasswordInput } from '../../components/ui/Input';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { AuthLayout } from './AuthLayout';

export default function ResetPassword() {
  useDocumentTitle('إعادة تعيين كلمة المرور');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  const initialEmail = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';

  const [form, setForm] = useState({
    email: initialEmail,
    token,
    password: '',
    password_confirmation: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    try {
      await authApi.resetPassword(form);
      toast.success('تم تغيير كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.');
      navigate('/login', { replace: true });
    } catch (err) {
      if (err?.errors) setErrors(err.errors);
      toast.error(err?.message || 'تعذّر إعادة تعيين كلمة المرور.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout
        title="رابط غير صالح"
        subtitle="يبدو أن رابط إعادة التعيين غير مكتمل أو منتهي الصلاحية"
      >
        <div className="text-center">
          <p className="text-sm text-slate-600">
            يرجى طلب رابط جديد لإعادة تعيين كلمة المرور.
          </p>
          <Link
            to="/forgot-password"
            className="mt-6 inline-block font-semibold text-brand-600 hover:text-brand-700"
          >
            طلب رابط جديد
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="إعادة تعيين كلمة المرور"
      subtitle="أدخل كلمة مرور جديدة لحسابك"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <PasswordInput
          name="password"
          label="كلمة المرور الجديدة"
          required
          value={form.password}
          onChange={handleChange}
          error={errors.password?.[0]}
          hint="8 أحرف على الأقل"
        />
        <PasswordInput
          name="password_confirmation"
          label="تأكيد كلمة المرور"
          required
          value={form.password_confirmation}
          onChange={handleChange}
          error={errors.password_confirmation?.[0]}
        />
        <Button type="submit" loading={submitting} className="w-full">
          حفظ كلمة المرور الجديدة
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        <Link
          to="/login"
          className="font-semibold text-brand-600 hover:text-brand-700"
        >
          العودة لتسجيل الدخول
        </Link>
      </p>
    </AuthLayout>
  );
}
