import { Link } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  Target,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  FileDown,
  ShieldCheck,
} from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function Landing() {
  useDocumentTitle('الرئيسية');

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Top nav */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
              <Activity size={20} />
            </span>
            <span className="text-lg font-bold text-slate-900">HumaScale</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link to="/login" className="btn-ghost hidden sm:inline-flex">
              تسجيل الدخول
            </Link>
            <Link to="/register" className="btn-primary">
              ابدأ الآن
              <ArrowLeft size={16} />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-bl from-brand-50 via-white to-white" />
        <div className="absolute -top-32 -left-32 -z-10 h-96 w-96 rounded-full bg-brand-200/30 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 -z-10 h-96 w-96 rounded-full bg-brand-300/20 blur-3xl" />

        <div className="container-page grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              <Sparkles size={14} />
              منصة تقييم ذكية للفرق والمنظمات
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl">
              قيّم جاهزية فريقك{' '}
              <span className="bg-gradient-to-l from-brand-600 to-brand-800 bg-clip-text text-transparent">
                للتوسع
              </span>{' '}
              في 18 سؤالاً فقط
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              منصة <strong>HumaScale</strong> تساعد الفرق التطوعية، منظمات
              المجتمع المدني، والمشاريع الناشئة على تقييم وضعها الحالي
              والحصول على خطة عمل عملية مخصصة لتحسين الجاهزية.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/register" className="btn-primary px-6 py-3 text-base">
                ابدأ تقييمك مجاناً
                <ArrowLeft size={18} />
              </Link>
              <Link to="/login" className="btn-secondary px-6 py-3 text-base">
                تسجيل الدخول
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
              <li className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-600" />
                مجاني بالكامل
              </li>
              <li className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-600" />
                نتائج فورية
              </li>
              <li className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-600" />
                تقرير PDF قابل للتحميل
              </li>
            </ul>
          </div>

          {/* Hero visual */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-brand-200/40 to-brand-50/0 blur-2xl" />
            <div className="card relative overflow-hidden p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    جاهزية فريقك
                  </p>
                  <p className="text-3xl font-extrabold text-slate-900">
                    68<span className="text-lg text-slate-400">%</span>
                  </p>
                </div>
                <span className="badge-medium">متوسطة</span>
              </div>

              {/* Mini bars */}
              <div className="space-y-3">
                {[
                  { label: 'الفريق', value: 85, color: '#16A34A' },
                  { label: 'التمويل', value: 42, color: '#DC2626' },
                  { label: 'الأثر', value: 70, color: '#F59E0B' },
                  { label: 'الشراكات', value: 55, color: '#F59E0B' },
                  { label: 'التقنية', value: 78, color: '#16A34A' },
                  { label: 'الاستدامة', value: 60, color: '#F59E0B' },
                ].map((b) => (
                  <div key={b.label}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-600">
                        {b.label}
                      </span>
                      <span className="font-bold text-slate-700">
                        {b.value}٪
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${b.value}%`, backgroundColor: b.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
                <Sparkles size={12} className="ml-1 inline text-brand-600" />
                ملخص ذكي: يحتاج الفريق إلى تعزيز محورَي التمويل والشراكات قبل
                التوسع.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50 py-20">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="heading-2">كيف تعمل المنصة؟</h2>
            <p className="mt-3 text-slate-600">
              ثلاث خطوات بسيطة للحصول على خطة عمل مخصصة لتحسين جاهزية فريقك.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div
                key={s.title}
                className="card relative p-6 transition hover:shadow-card"
              >
                <span className="absolute -top-3 right-6 flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white shadow">
                  {i + 1}
                </span>
                <div className="mt-2 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <s.icon size={22} />
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-20">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="heading-2">6 محاور تقيّمها المنصة</h2>
            <p className="mt-3 text-slate-600">
              تغطية شاملة لجميع جوانب جاهزية فريقك للتوسع.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PILLARS.map((p) => (
              <div
                key={p.key}
                className="card flex items-start gap-4 p-5"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/15 to-brand-700/15 text-brand-600">
                  {p.icon}
                </span>
                <div>
                  <h3 className="font-bold text-slate-900">{p.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-20">
        <div className="container-page">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 className="heading-2">ماذا ستحصل عليه من التقييم؟</h2>
              <p className="mt-3 text-slate-600">
                نتائج فورية + خطة عمل قابلة للتنفيذ + تقرير PDF احترافي.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  { icon: BarChart3, title: 'رسم رادار تفاعلي', desc: 'تصور بصري شامل لجميع المحاور' },
                  { icon: Target, title: 'خطة عمل مخصصة', desc: '3 مراحل: فورية، متوسطة، طويلة المدى' },
                  { icon: Sparkles, title: 'ملخص ذكي', desc: 'شرح مبسّط لنتائجك بالذكاء الاصطناعي' },
                  { icon: FileDown, title: 'تقرير PDF', desc: 'تقرير احترافي قابل للمشاركة والتحميل' },
                ].map((f) => (
                  <li key={f.title} className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                      <f.icon size={18} />
                    </span>
                    <div>
                      <h3 className="font-semibold text-slate-900">{f.title}</h3>
                      <p className="text-sm text-slate-500">{f.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link to="/register" className="btn-primary">
                  جرّب المنصة الآن
                  <ArrowLeft size={16} />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="card p-5 text-center">
                <p className="text-3xl font-extrabold text-brand-600">18</p>
                <p className="text-xs text-slate-500">سؤالاً</p>
              </div>
              <div className="card p-5 text-center">
                <p className="text-3xl font-extrabold text-brand-600">6</p>
                <p className="text-xs text-slate-500">محاور رئيسية</p>
              </div>
              <div className="card p-5 text-center">
                <p className="text-3xl font-extrabold text-brand-600">3</p>
                <p className="text-xs text-slate-500">مراحل خطة عمل</p>
              </div>
              <div className="card p-5 text-center">
                <p className="text-3xl font-extrabold text-brand-600">
                  <ShieldCheck size={28} className="mx-auto" />
                </p>
                <p className="mt-1 text-xs text-slate-500">تقرير PDF</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container-page">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-bl from-brand-700 to-brand-950 px-8 py-14 text-center text-white shadow-card">
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              جاهز لتقييم جاهزية فريقك؟
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-brand-100">
              أنشئ حسابك مجاناً وابدأ التقييم الآن. لا حاجة لبطاقة ائتمان.
            </p>
            <Link
              to="/register"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-brand-700 transition hover:bg-brand-50"
            >
              ابدأ الآن مجاناً
              <ArrowLeft size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="container-page flex flex-col items-center justify-between gap-3 text-sm text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} HumaScale. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-slate-700">
              تسجيل الدخول
            </Link>
            <Link to="/register" className="hover:text-slate-700">
              إنشاء حساب
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

const STEPS = [
  {
    icon: ClipboardList,
    title: 'التقييم',
    desc: 'أجب على 18 سؤالاً تغطي 6 محاور رئيسية، من 1 (ضعيف جداً) إلى 5 (ممتاز).',
  },
  {
    icon: BarChart3,
    title: 'التحليل',
    desc: 'يقوم النظام بحساب نتيجة كل محور، تحديد نقاط القوة والضعف، ومستوى الجاهزية.',
  },
  {
    icon: Target,
    title: 'خطة العمل',
    desc: 'يختار النظام أضعف 3 محاور ويبني خطة من 3 مراحل: فورية، متوسطة، طويلة المدى.',
  },
];

const PILLARS = [
  {
    key: 'team',
    title: 'الفريق',
    desc: 'مدى تنظيم الفريق وكفاءته',
    icon: '👥',
  },
  {
    key: 'funding',
    title: 'التمويل',
    desc: 'مدى استقرار التمويل وتنوعه',
    icon: '💰',
  },
  {
    key: 'impact',
    title: 'الأثر',
    desc: 'مدى تأثير المشروع في المستفيدين',
    icon: '🎯',
  },
  {
    key: 'partnerships',
    title: 'الشراكات',
    desc: 'قوة شبكة الشراكات والتحالفات',
    icon: '🤝',
  },
  {
    key: 'technology',
    title: 'التقنية',
    desc: 'مدى توظيف التقنية وأدوات العمل',
    icon: '⚙️',
  },
  {
    key: 'sustainability',
    title: 'الاستدامة',
    desc: 'قدرة المنظمة على الاستمرارية والتوسع',
    icon: '🌱',
  },
];
