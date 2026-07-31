import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Activity, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input, PasswordInput } from '../../components/ui/Input';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function AdminLogin() {
  useDocumentTitle('تسجيل دخول المدير');
  const navigate = useNavigate();
  const location = useLocation();
  const { adminLogin } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/admin';

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    try {
      await adminLogin(form.email, form.password);
      toast.success('تم تسجيل دخولك كمدير.');
      navigate(from, { replace: true });
    } catch (err) {
      if (err?.errors) setErrors(err.errors);
      toast.error(err?.message || 'تعذّر تسجيل الدخول.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 p-4"
      dir="rtl"
    >
      <div className="w-full max-w-md">
        <div className="mb-6 text-center text-white">
          <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
            <Shield size={28} />
          </span>
          <h1 className="text-2xl font-extrabold">HumaScale Admin</h1>
          <p className="mt-1 text-sm text-brand-100">
            لوحة إدارة المنصة
          </p>
        </div>

        <div className="card-padded animate-slide-up">
          <h2 className="text-center text-lg font-bold text-slate-900">
            تسجيل دخول المدير
          </h2>
          <p className="mt-1 text-center text-xs text-slate-500">
            هذه اللوحة مخصصة لمديري النظام فقط
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <Input
              type="email"
              name="email"
              label="البريد الإلكتروني"
              placeholder="admin@humascale.com"
              required
              value={form.email}
              onChange={handleChange}
              error={errors.email?.[0]}
            />
            <PasswordInput
              name="password"
              label="كلمة المرور"
              required
              value={form.password}
              onChange={handleChange}
              error={errors.password?.[0]}
            />
            <Button
              type="submit"
              loading={submitting}
              className="w-full"
            >
              دخول
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-brand-100">
          <Link to="/login" className="hover:text-white">
            ← العودة لتسجيل دخول المستخدمين
          </Link>
        </p>
      </div>
    </div>
  );
}
