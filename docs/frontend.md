# Current Frontend Map

**Root:** `Frontend/humascale-frontend`  
**Do not change this tree in the Backend-only cycle.** Implementation steps: [`frontend-implementation-guide.md`](frontend-implementation-guide.md)

## Stack

React 18, Vite 5, Tailwind, React Router v6, Axios, Recharts. Arabic RTL is hardcoded (`index.html` `dir="rtl"`). No i18n library. No theme provider.

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
| `/profile` | Profile |
| `/notifications` | Notifications |
| `/admin/*` | Admin |

## Important files

| File | Role |
|---|---|
| `src/utils/constants.js` | Pillar labels + **readinessFromScore** (still 40/70 — must update) |
| `src/api/client.js` | Axios + token interceptors |
| `src/api/assessment.js` | Assessment API |
| `src/api/report.js` | PDF download |
| `src/components/assessment/ActionPlanView.jsx` | Action plan UI |
| `src/pages/user/Assessment.jsx` | Survey completeness gate |
| `src/pages/user/AssessmentResults.jsx` | Results |
| `src/contexts/AuthContext.jsx` | Auth state |

## Envelope

Backend returns `{ success, message, data, errors?, meta? }`. Frontend must read `data`, not the raw Laravel model.
