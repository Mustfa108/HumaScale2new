import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input, PasswordInput } from '../../components/ui/Input';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { AuthLayout } from './AuthLayout';

export default function Register() {
  useDocumentTitle('تسجيل حساب جديد');
  const navigate = useNavigate();
  const { register } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({
    name: '',
    email: '',
    organization_name: '',
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
      await register(form);
      toast.success('تم إنشاء حسابك وتسجيل دخولك بنجاح!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (err?.errors) setErrors(err.errors);
      toast.error(err?.message || 'تعذّر إنشاء الحساب.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="أنشئ حسابك في HumaScale"
      subtitle="ابدأ رحلتك في تقييم جاهزية فريقك خلال دقائق"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          name="name"
          label="الاسم الكامل"
          placeholder="مثال: محمد الأحمدي"
          required
          value={form.name}
          onChange={handleChange}
          error={errors.name?.[0]}
        />
        <Input
          type="email"
          name="email"
          label="البريد الإلكتروني"
          placeholder="example@org.com"
          autoComplete="email"
          required
          value={form.email}
          onChange={handleChange}
          error={errors.email?.[0]}
        />
        <Input
          name="organization_name"
          label="اسم المنظمة (اختياري)"
          placeholder="مثال: مؤسسة بناء"
          value={form.organization_name}
          onChange={handleChange}
          error={errors.organization_name?.[0]}
        />
        <PasswordInput
          name="password"
          label="كلمة المرور"
          placeholder="8 أحرف على الأقل"
          autoComplete="new-password"
          required
          value={form.password}
          onChange={handleChange}
          error={errors.password?.[0]}
          hint="8 أحرف على الأقل"
        />
        <PasswordInput
          name="password_confirmation"
          label="تأكيد كلمة المرور"
          placeholder="أعد كتابة كلمة المرور"
          autoComplete="new-password"
          required
          value={form.password_confirmation}
          onChange={handleChange}
          error={errors.password_confirmation?.[0]}
        />
        <Button type="submit" loading={submitting} className="w-full">
          إنشاء حساب
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        لديك حساب بالفعل؟{' '}
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
