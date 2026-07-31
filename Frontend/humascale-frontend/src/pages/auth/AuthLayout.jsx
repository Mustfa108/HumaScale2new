import { Link } from 'react-router-dom';
import { Activity, BarChart3, Target, Sparkles } from 'lucide-react';
import clsx from 'clsx';

/**
 * Centered card layout used by the auth pages (login, register, etc.)
 * On wider screens, shows a brand panel on the left with the value props.
 */
export function AuthLayout({ title, subtitle, children, maxWidth = 'max-w-md' }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50/30" dir="rtl">
      <div className="container-page grid min-h-screen items-center gap-8 py-10 lg:grid-cols-2 lg:gap-12">
        {/* Brand panel (hidden on small screens) */}
        <div className="hidden lg:block">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
              <Activity size={22} />
            </span>
            <span className="text-xl font-bold text-slate-900">HumaScale</span>
          </Link>
          <h2 className="mt-8 text-3xl font-bold leading-tight text-slate-900">
            قيّم جاهزية فريقك للتوسع في{' '}
            <span className="bg-gradient-to-l from-brand-600 to-brand-800 bg-clip-text text-transparent">
              18 سؤالاً
            </span>{' '}
            فقط.
          </h2>
          <p className="mt-3 max-w-md text-slate-600">
            منصة ذكية تساعد المنظمات غير الربحية والفرق التطوعية والمشاريع
            الناشئة على تقييم وضعها الحالي والحصول على خطة عمل عملية للتطوير.
          </p>

          <ul className="mt-8 space-y-3">
            <FeatureItem
              icon={BarChart3}
              title="رادار بصري شامل"
              desc="رسم بياني يوضح نقاط القوة والضعف في 6 محاور رئيسية"
            />
            <FeatureItem
              icon={Target}
              title="خطة عمل مخصصة"
              desc="3 مراحل قصيرة ومتوسطة وطويلة مع مهام واضحة ومؤشرات أداء"
            />
            <FeatureItem
              icon={Sparkles}
              title="ملخص ذكي بالذكاء الاصطناعي"
              desc="شرح مبسّط لنتائجك بطريقة سهلة الفهم"
            />
          </ul>
        </div>

        {/* Card */}
        <div className="mx-auto w-full" style={{ maxWidth: '28rem' }}>
          <div className="card-padded animate-slide-up">
            <div className="mb-6 flex items-center gap-2 lg:hidden">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
                <Activity size={22} />
              </span>
              <span className="text-xl font-bold text-slate-900">HumaScale</span>
            </div>
            <h1 className="heading-2 text-center">{title}</h1>
            {subtitle && (
              <p className="mt-1 text-center text-sm text-slate-500">
                {subtitle}
              </p>
            )}
            <div className="mt-6">{children}</div>
          </div>
          <p className="mt-6 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} HumaScale. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon: Icon, title, desc }) {
  return (
    <li className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white/60 p-3 backdrop-blur-sm">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
        <Icon size={18} />
      </span>
      <div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <p className="mt-0.5 text-xs text-slate-500">{desc}</p>
      </div>
    </li>
  );
}
