# HumaScale — Frontend

> **منصة ذكية لتقييم جاهزية الفرق والمنظمات للتوسع.**
> واجهة React حديثة، عربية بالكامل (RTL)، مرتبطة مع باك إند Laravel 13 + Sanctum.

[![React](https://img.shields.io/badge/React-18.3-61dafb)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8)](https://tailwindcss.com/)

---

## ✨ المميزات

- 🎨 **تصميم RTL عربي كامل** — خط Cairo، ألوان متناسقة، وتجربة استخدام محلية.
- 🔐 **مصادقة كاملة** — تسجيل / دخول / استعادة كلمة المرور / تفعيل البريد.
- 📊 **رسم رادار تفاعلي** (Recharts) لعرض نتائج المحاور الستة.
- 🧠 **عرض ملخص AI** و **خطة عمل** بثلاث مراحل (فورية / متوسطة / طويلة المدى).
- 📄 **تحميل PDF** للتقييمات المكتملة.
- 🔔 **إشعارات** مع تعليم كمقروء فردي وجماعي.
- 👨‍💼 **لوحة إدارة منفصلة** للأدمن (Dashboard / Users / Assessments / Analytics).
- 🚦 **حماية المسارات** + تحديث تلقائي للنتائج أثناء توليد AI / PDF.
- 📱 **Responsive** — يعمل على الموبايل واللابتوب والشاشات الكبيرة.

---

## 🛠️ التقنيات

| الطبقة | التقنية |
|--------|---------|
| Build tool | **Vite 5** |
| Framework | **React 18** (Hooks + Context API) |
| Styling | **TailwindCSS 3** + custom theme |
| Routing | **React Router v6** (BrowserRouter) |
| HTTP | **Axios** (interceptors + actor-scoped tokens) |
| Charts | **Recharts** (Radar / Bar / Donut) |
| Toasts | **react-hot-toast** |
| Icons | **lucide-react** |
| Date utils | **date-fns** + custom Arabic formatter |

---

## 📁 بنية المشروع

```
src/
├── api/                  # كل طلبات الـ API
│   ├── client.js         # Axios instance (user + admin) + interceptors
│   ├── auth.js
│   ├── assessment.js
│   ├── dashboard.js
│   ├── report.js         # PDF download
│   ├── notification.js
│   └── admin.js
├── components/
│   ├── ui/               # Button, Input, Card, Modal, Spinner, Badge
│   ├── layout/           # Navbar, AdminLayout, ProtectedRoute
│   ├── charts/           # PillarRadarChart, PillarBarChart, ReadinessDonut
│   └── assessment/       # QuestionCard, AssessmentProgress, ActionPlanView
├── contexts/             # AuthContext, ToastContext
├── hooks/                # useAsync, useDocumentTitle
├── pages/
│   ├── auth/             # Login, Register, ForgotPassword, ResetPassword, VerifyEmail
│   ├── user/             # Dashboard, Assessment, AssessmentResults, History, Profile, Notifications
│   ├── admin/            # AdminLogin, AdminDashboard, AdminUsers, AdminAssessments, AdminAssessmentDetail, AdminAnalytics
│   └── Landing.jsx
├── utils/                # constants.js, format.js
├── App.jsx               # كل الراوتات
├── main.jsx              # نقطة الدخول
└── index.css             # Tailwind + global styles
```

---

## 🚀 التشغيل

### 1) المتطلبات
- Node.js **18+** (يفضّل 20+)
- الباك إند Laravel يعمل (افتراضياً على `http://127.0.0.1:8000`)

### 2) تثبيت الحزم
```bash
cd humascale-frontend
npm install
```

### 3) إعدادات البيئة
انسخ `.env.example` إلى `.env` وعرّف عنوان الباك إند:

```bash
# للتطوير — سيستخدم Vite proxy إلى http://127.0.0.1:8000
VITE_API_BASE_URL=
VITE_API_PROXY=http://127.0.0.1:8000

# للإنتاج — ضع عنوان الـ API الكامل (يشمل /api)
# VITE_API_BASE_URL=https://api.humascale.com/api
```

### 4) تشغيل وضع التطوير
```bash
npm run dev
```
سيفتح على `http://localhost:5173`.

### 5) بناء نسخة الإنتاج
```bash
npm run build
npm run preview     # معاينة محلية للنسخة المبنية
```

---

## 🔌 الربط مع الباك إند (Laravel)

الواجهة تتوقع الباك إند على `/api/*` (نفس الأصل). في وضع التطوير، Vite يمرّر
كل طلبات `/api` إلى `VITE_API_PROXY` (افتراضياً `http://127.0.0.1:8000`).

### إعداد Sanctum (مهم!)
في `config/sanctum.php` للباك إند، ضع دومين الفرونت إند ضمن `stateful`:
```php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 'localhost,localhost:5173')),
```
و `config/cors.php`:
```php
'allowed_origins' => ['http://localhost:5173'],
'supports_credentials' => true,
```

### Endpoints المستخدمة
| Method | Path | الوصف |
|--------|------|------|
| POST | `/api/auth/register` | تسجيل مستخدم جديد |
| POST | `/api/auth/login` | تسجيل دخول |
| POST | `/api/auth/logout` | تسجيل خروج |
| GET  | `/api/auth/me` | المستخدم الحالي |
| POST | `/api/auth/change-password` | تغيير كلمة المرور |
| POST | `/api/auth/forgot-password` | طلب رابط إعادة التعيين |
| POST | `/api/auth/reset-password` | تنفيذ إعادة التعيين |
| POST | `/api/auth/email/resend` | إعادة إرسال رابط التحقق |
| GET  | `/api/dashboard` | لوحة المستخدم |
| GET  | `/api/assessment/questions` | جلب الـ 18 سؤال |
| POST | `/api/assessment/start` | بدء تقييم |
| POST | `/api/assessment/{id}/submit` | إرسال الإجابات |
| GET  | `/api/assessment/{id}/results` | جلب النتائج |
| GET  | `/api/assessment/history` | السجل |
| GET  | `/api/report/{id}/download` | تحميل PDF |
| GET  | `/api/report/{id}/status` | حالة التقرير |
| GET  | `/api/notifications` | الإشعارات |
| POST | `/api/notifications/{id}/read` | تعليم كمقروء |
| POST | `/api/notifications/read-all` | تعليم الكل |
| POST | `/api/admin/login` | دخول الأدمن |
| GET  | `/api/admin/dashboard` | لوحة الأدمن |
| GET  | `/api/admin/users` | المستخدمون |
| GET  | `/api/admin/assessments` | التقييمات |
| GET  | `/api/admin/assessments/{id}` | تفاصيل تقييم |
| GET  | `/api/admin/analytics/pillars` | تحليلات المحاور |

---

## 🎨 المسارات الرئيسية

| المسار | الوصف |
|--------|------|
| `/` | Landing Page (أو توجيه تلقائي للوحة المناسبة) |
| `/login` · `/register` | المصادقة |
| `/forgot-password` · `/reset-password` | استعادة كلمة المرور |
| `/dashboard` | لوحة المستخدم |
| `/assessment` | التقييم (18 سؤال) |
| `/assessment/:id/results` | نتائج التقييم |
| `/history` | السجل |
| `/profile` | الملف الشخصي |
| `/notifications` | الإشعارات |
| `/admin/login` · `/admin/*` | لوحة الأدمن |

---

## 🧪 الاختبار السريع

```bash
# Lint (اختياري)
npm run lint

# Build
npm run build && npm run preview
```

---

## 📝 ملاحظات

- التوكنات محفوظة في `localStorage` تحت مفاتيح `humascale_user_token` و
  `humascale_admin_token`. الباك إند يُلغي كل التوكنات عند تغيير كلمة المرور.
- الـ Frontend يحدّث صفحة النتائج تلقائياً كل 8 ثوانٍ حتى يكتمل توليد AI و PDF.
- التصميم RTL كامل — `dir="rtl"` على `<html>` و Tailwind يطبّق الانعكاس تلقائياً.

---

## 📄 الرخصة

مشروع تخرج — جميع الحقوق محفوظة لـ HumaScale Team.
