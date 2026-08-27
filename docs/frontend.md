# Current Frontend Map

**Root:** `Frontend/humascale-frontend`  
**Do not rebuild.** Full plan: [`frontend-implementation-plan.md`](frontend-implementation-plan.md). Short tasks: [`frontend-implementation-guide.md`](frontend-implementation-guide.md).

## Stack

React 18, Vite 5, Tailwind (`darkMode: class`), React Router v6, Axios, Recharts, Leaflet. i18n via `LanguageContext` (AR/EN + RTL/LTR). Theme via `ThemeContext` (`light|dark|system`).

## Runtime

- Dev: Vite port **5173**, proxies `/api` → `http://127.0.0.1:8000`
- Auth tokens: `localStorage` keys `humascale_user_token` / `humascale_admin_token`

## Routes (`src/App.jsx`)

| Path | Page |
|---|---|
| `/` | Landing or redirect |
| `/login` `/register` `/forgot-password` `/reset-password` | Auth |
| `/dashboard` | User dashboard |
| `/assessment` | 18-question survey |
| `/assessment/:id/results` | Results + action plan + PDF |
| `/history` | Past assessments |
| `/expansion` | Expansion map pins |
| `/profile` | Profile + locale/theme |
| `/notifications` | Notifications |
| `/admin/*` | Admin |

## Important files

| File | Role |
|---|---|
| `src/utils/constants.js` | Pillar labels + **readinessFromScore (50/70)** |
| `src/api/client.js` | Axios + token interceptors |
| `src/api/assessment.js` | Assessment API |
| `src/api/preferences.js` | Locale/theme |
| `src/api/actionPlan.js` | Item status |
| `src/api/expansionAreas.js` | Map pins |
| `src/api/report.js` | PDF download |
| `src/components/assessment/ActionPlanView.jsx` | Action plan + KPI + status |
| `src/pages/user/Assessment.jsx` | Survey completeness gate |
| `src/pages/user/AssessmentResults.jsx` | Results |
| `src/contexts/AuthContext.jsx` | Auth state (`access_token` / skip admin me) |
| `src/contexts/LanguageContext.jsx` | Locale |
| `src/contexts/ThemeContext.jsx` | Theme |

## Envelope

Backend returns `{ success, message, data, errors?, meta? }`. Frontend must read `data`, not the raw Laravel model.
