import { useState } from 'react';
import { Building2, Mail, ShieldCheck, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { authApi } from '../../api/auth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PageContainer, PageHeader } from '../../components/layout/Navbar';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Input, PasswordInput } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { formatDate } from '../../utils/format';

export default function Profile() {
  useDocumentTitle('الملف الشخصي');
  const { user, refreshUser, logout } = useAuth();
  const toast = useToast();

  // Password change form
  const [pwForm, setPwForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [pwErrors, setPwErrors] = useState({});
  const [pwSubmitting, setPwSubmitting] = useState(false);

  // Resend verification
  const [resending, setResending] = useState(false);

  const handleChangePw = async (e) => {
    e.preventDefault();
    setPwErrors({});
    setPwSubmitting(true);
    try {
      await authApi.changePassword({
        current_password: pwForm.current_password,
        new_password: pwForm.new_password,
        new_password_confirmation: pwForm.new_password_confirmation,
      });
      toast.success('تم تغيير كلمة المرور بنجاح. يرجى تسجيل الدخول مجدداً.');
      setPwForm({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
      // Backend revokes all tokens → log the user out
      setTimeout(async () => {
        await logout();
        window.location.href = '/login';
      }, 800);
    } catch (err) {
      if (err?.errors) setPwErrors(err.errors);
      toast.error(err?.message || 'تعذّر تغيير كلمة المرور.');
    } finally {
      setPwSubmitting(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authApi.resendVerification();
      toast.success('تم إعادة إرسال رابط التحقق.');
    } catch (err) {
      toast.error(err?.message || 'تعذّر إعادة الإرسال.');
    } finally {
      setResending(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader title="الملف الشخصي" subtitle="معلوماتك وإعدادات الأمان" />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardBody>
            <div className="flex flex-col items-center text-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-2xl font-extrabold text-white">
                {user?.name?.[0] || '؟'}
              </span>
              <h3 className="mt-4 text-lg font-bold text-slate-900">
                {user?.name}
              </h3>
              <p className="text-sm text-slate-500">{user?.email}</p>
              {user?.organization_name && (
                <p className="mt-1 text-xs text-slate-500">
                  {user.organization_name}
                </p>
              )}
              <div className="mt-4">
                {user?.email_verified_at ? (
                  <span className="badge-good">
                    <ShieldCheck size={12} />
                    بريد موثّق
                  </span>
                ) : (
                  <span className="badge-medium">بريد غير موثّق</span>
                )}
              </div>
            </div>

            <ul className="mt-6 space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <UserIcon size={14} className="text-slate-400" />
                {user?.name}
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-slate-400" />
                {user?.email}
              </li>
              {user?.organization_name && (
                <li className="flex items-center gap-2">
                  <Building2 size={14} className="text-slate-400" />
                  {user.organization_name}
                </li>
              )}
              <li className="text-xs text-slate-400">
                عضو منذ {formatDate(user?.created_at, { withTime: false })}
              </li>
            </ul>
          </CardBody>
        </Card>

        <div className="space-y-5 lg:col-span-2">
          {!user?.email_verified_at && (
            <Card>
              <CardBody>
                <h3 className="font-bold text-amber-700">تأكيد البريد الإلكتروني</h3>
                <p className="mt-1 text-sm text-slate-600">
                  حسابك لم يتم تفعيله بعد. يرجى التحقق من بريدك الإلكتروني أو
                  إعادة إرسال رابط التحقق.
                </p>
                <Button
                  variant="secondary"
                  className="mt-3"
                  onClick={handleResend}
                  loading={resending}
                >
                  إعادة إرسال رابط التحقق
                </Button>
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader title="تغيير كلمة المرور" />
            <CardBody>
              <form
                onSubmit={handleChangePw}
                className="space-y-4"
                noValidate
              >
                <PasswordInput
                  name="current_password"
                  label="كلمة المرور الحالية"
                  required
                  value={pwForm.current_password}
                  onChange={(e) =>
                    setPwForm((f) => ({ ...f, current_password: e.target.value }))
                  }
                  error={pwErrors.current_password?.[0]}
                />
                <PasswordInput
                  name="new_password"
                  label="كلمة المرور الجديدة"
                  required
                  value={pwForm.new_password}
                  onChange={(e) =>
                    setPwForm((f) => ({ ...f, new_password: e.target.value }))
                  }
                  error={pwErrors.new_password?.[0]}
                  hint="8 أحرف على الأقل وتختلف عن الحالية"
                />
                <PasswordInput
                  name="new_password_confirmation"
                  label="تأكيد كلمة المرور الجديدة"
                  required
                  value={pwForm.new_password_confirmation}
                  onChange={(e) =>
                    setPwForm((f) => ({
                      ...f,
                      new_password_confirmation: e.target.value,
                    }))
                  }
                  error={pwErrors.new_password_confirmation?.[0]}
                />
                <Button type="submit" loading={pwSubmitting}>
                  حفظ كلمة المرور الجديدة
                </Button>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
