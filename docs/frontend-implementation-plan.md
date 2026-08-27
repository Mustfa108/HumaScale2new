# Frontend Implementation Plan

**Last Updated:** 2026-08-27  
**Canonical app:** `Frontend/humascale-frontend` (React 18 + Vite + JS, **not** a TypeScript rewrite)  
**Backend contract:** [`api-documentation.md`](api-documentation.md) + [`backend-schema.md`](backend-schema.md)  
**Requirements source:** *HumaScale Frontend Requirements* (Word), matched to live Laravel routes

**Do not rebuild the app.** Extend the existing pages, Axios clients, and Recharts. Do not invent endpoints. Do not recompute scores, weak pillars, or KPIs in React as the source of truth.

---

## 1. Product flow the UI must reflect

```text
Landing → Auth → Dashboard
                → Assessment (18 × 1–5) → Submit
                → Results (scores + radar + readiness)
                → Action plan (weakest 3 × Immediate / Medium / Long)
                → KPIs (on each plan item)
                → PDF download
                → Profile (locale + theme)
                → Expansion map (extra Backend feature)
                → Admin (separate token)
```

Backend owns Assessment → Analysis → Guided Action Plan. Frontend only sends answers and **displays** `data`.

Gemini/NLG is optional: if `ai_ready === false`, still show rule-based plan and KPIs.

---

## 2. Requirements vs current code vs Backend

| Requirement page | Required behavior | Backend | Current frontend | Work |
|---|---|---|---|---|
| Landing | Pitch + CTA + 3 stages | None | `Landing.jsx` | Polish copy; keep |
| Login | Email/password, errors, redirect | `POST /auth/login` → `access_token` | `Login.jsx` + `AuthContext` | Keep; after login call `/auth/me` for locale/theme |
| Register | Create account | `POST /auth/register` | `Register.jsx` | Keep |
| Forgot / reset password | Email flow | `/auth/forgot-password`, `/auth/reset-password` | Pages exist | Keep |
| User dashboard | Latest score, readiness, 6 pillars, shortcuts | `GET /dashboard` | `Dashboard.jsx` | Use bilingual names; fix 50/70 helper; link map + results + PDF |
| Assessment | 18 questions, 1–5, block incomplete | `GET /questions`, `POST /start`, `POST /{id}/submit` | `Assessment.jsx` | Keep completeness gate; pick `text_ar`/`text_en` |
| Analysis / Results | Overall + 6 pillars + strength/weak | `GET /{id}/results` | `AssessmentResults.jsx` | Prefer API `readiness_level`; bilingual radar |
| Action plan | Weakest 3 + 3 phases | Nested in results `action_plan` | `ActionPlanView.jsx` | Add status control; bilingual text |
| KPI | Progress indicators | Same items: `kpi_ar` / `kpi_en` | Shown inside plan cards | Dedicated KPI block per item; **no new API** |
| Report / PDF | Download final report | `GET /report/{id}/status` + `/download` blob | `report.js` + results page | Keep blob download; no public URL; empty AI fallback |
| Profile / settings | Account, language, RTL, theme, logout | `GET/PATCH /profile/preferences`, `/auth/me`, `/auth/logout` | `Profile.jsx` (password only) | Add locale + theme toggles |
| Notifications | List / read | `/notifications*` | `Notifications.jsx` | Keep |
| Expansion map | Pins CRUD | `/expansion-areas*` | **Missing** | New page + API module |
| Admin login | Separate auth | `POST /admin/login` → `token` | `AdminLogin.jsx` | Keep; **do not call `/admin/me`** (does not exist) |
| Admin dashboard | Stats | `GET /admin/dashboard` | `AdminDashboard.jsx` | Keep; bilingual later |
| Admin users / assessments | Lists + detail | `/admin/users`, `/admin/assessments`, `/admin/assessments/{id}` | Pages exist | Keep filters |
| Admin analytics | Pillar averages | `GET /admin/analytics/pillars` | `AdminAnalytics.jsx` | Keep |
| i18n RTL/LTR | AR/EN | Preferences + `*_ar`/`*_en` fields | Arabic RTL hardcoded | Language context + `dir` |
| Dark / light | Persist | `theme` on user | Not implemented | ThemeProvider |
| Error states | 401/403/422/500/network | Envelope | Axios interceptor + toasts | Extend empty/error UI; 403 page |

Word also lists TypeScript. **Decision:** stay on current JS/JSX. A TS migration is out of scope for this plan (high cost, no Backend benefit).

---

## 3. Binding map (page → API → fields)

### 3.1 Auth session

| UI | Call | Read |
|---|---|---|
| Login | `POST /auth/login` | `data.access_token`, `data.id/name/email/organization_name` |
| After login / boot | `GET /auth/me` | Flat `{ locale, theme, ... }` — **no envelope** |
| Register | `POST /auth/register` | `data.access_token` |
| Logout | `POST /auth/logout` | message only |
| Change password | `POST /auth/change-password` | then force re-login (tokens revoked) |

Header: `Authorization: Bearer {humascale_user_token}`.

**Fix in `AuthContext` login parser:** `authApi.login` already returns the envelope `{ success, message, data }`. Token is `res.data.access_token`. Avoid `res.data.data`. After login, merge `/auth/me` so locale/theme exist on the user object.

### 3.2 Assessment

| Step | Call | Body / params | UI |
|---|---|---|---|
| Load | `GET /assessment/questions` | — | Group by pillar; Likert 1–5 |
| Start | `POST /assessment/start` | empty | Store `assessment_id` |
| Draft | localStorage keyed by `assessment_id` | — | Temporary only |
| Submit | `POST /assessment/{id}/submit` | `{ answers: [{ question_id, score }] }` size 18 | Block if any missing |
| Results | `GET /assessment/{id}/results` | — | Scores, radar, plan, KPIs, PDF |

Submit 422 if incomplete — also block in UI first.

### 3.3 Results / plan / KPI (one payload)

From `data`:

- Readiness card: `assessment.overall_score`, `readiness_level`, `readiness_level_ar|en`, `readiness_color`
- Radar / bars: `pillar_results[].percentage` + names
- Weak highlight: `pillar_results[].is_weak === true` **before** the plan
- Plan columns: `action_plan.phases.immediate|medium|long`
- Task text: `ai_rephrased_*` else `action_*`
- KPI: always `kpi_ar` / `kpi_en`
- Status chips: `PATCH /action-plan/items/{id}` `{ status }`

### 3.4 Dashboard

`GET /dashboard`:

- Empty: `has_assessment === false` → CTA to `/assessment`
- Filled: `latest_assessment`, `radar_chart_data`, `strengths`, `weaknesses`, `total_assessments`, `expansion_areas_count`
- Shortcuts: results, history, PDF (if `pdf_ready`), expansion map

### 3.5 PDF

1. Show “generating” while `pdf_ready === false` (poll results or `/report/{id}/status` every ~8s).
2. When ready, `GET /report/{id}/download` as blob (existing `downloadReport`).
3. Never navigate to `pdf_path` or `storage/...`.

AI: if `ai_ready === false`, show “Summary pending” and keep rule plan visible.

### 3.6 Preferences

| Control | Persist |
|---|---|
| Language AR/EN | `PATCH /profile/preferences` `{ locale }` + localStorage + `document.documentElement.lang/dir` |
| Theme light/dark/system | `{ theme }` + `class="dark"` on `<html>` when dark (or system + `prefers-color-scheme`) |

Load on boot from `/auth/me` or `GET /profile/preferences`.

### 3.7 Expansion map (new)

| Action | Call |
|---|---|
| List | `GET /expansion-areas` → `data.items` |
| Create | `POST /expansion-areas` `{ name_ar, name_en?, lat, lng, notes? }` |
| Edit | `PATCH /expansion-areas/{id}` |
| Delete | `DELETE /expansion-areas/{id}` |

Suggested route: `/expansion`. Leaflet (or equivalent). Dashboard badge: `expansion_areas_count`.

### 3.8 Admin

| Page | Call | Token |
|---|---|---|
| Admin login | `POST /admin/login` | `data.token` → `humascale_admin_token` |
| Dashboard | `GET /admin/dashboard` | Admin Bearer |
| Users | `GET /admin/users` | |
| Assessments | `GET /admin/assessments?readiness_level=&date_from=&date_to=` | |
| Detail | `GET /admin/assessments/{id}` | |
| Analytics | `GET /admin/analytics/pillars` | |

**Do not call `GET /admin/me` or `POST /admin/logout`.** They are not in Laravel. Restore admin from `localStorage` (`humascale_admin`). Logout = clear storage + redirect `/admin/login`.

User token cannot access admin routes (403). `ProtectedRoute requireAdmin` must stay.

---

## 4. Gaps to close (code)

| ID | Gap | Files |
|---|---|---|
| G1 | `readinessFromScore` uses **40/70**; Backend uses **50/70** | `src/utils/constants.js` |
| G2 | No i18n; `index.html` is `dir="rtl"` only | new `LanguageContext`, `Navbar`, `index.html` |
| G3 | No theme provider | new `ThemeContext`, Tailwind `darkMode: 'class'` |
| G4 | Preferences API unused | new `src/api/preferences.js`, `Profile.jsx`, `AuthContext` |
| G5 | Action item status not editable | `ActionPlanView.jsx`, new `src/api/actionPlan.js` |
| G6 | Expansion map missing | new page, `src/api/expansionAreas.js`, `App.jsx` route |
| G7 | Content always Arabic fields | small helper `pickLocale(obj, 'name')` → `name_ar` / `name_en` |
| G8 | Admin boot calls missing `/admin/me` | `AuthContext.jsx` — skip me; trust stored admin |
| G9 | Login token parse fragile | `AuthContext.jsx` |
| G10 | Results poll waits for **both** AI and PDF; page should work when only scores exist | `AssessmentResults.jsx` — poll PDF/AI independently; never block scores |
| G11 | Likert / phase labels Arabic-only | `constants.js` bilingual |
| G12 | History may expose `pdf_path` | never use it as href |

---

## 5. Implementation phases

Do these in order. Each phase is demoable without the next.

### Phase 0 — Contract hygiene (0.5 day)

- Fix `readinessFromScore` to `<50` low, `<70` medium, else good.
- Prefer `readiness_level` from API everywhere (`Dashboard`, `AssessmentResults`, `History`).
- Fix login token read: `res.data.access_token`.
- Stop `adminAuthApi.me()` on bootstrap; keep stored admin.
- Confirm Axios reads envelope `data` (already true for most modules).

**Done when:** score 49 → low, 50 → medium, 70 → good; login still works.

### Phase 1 — Preferences, language, theme (1–2 days)

1. `GET/PATCH /profile/preferences`.
2. `LanguageContext`: `ar` | `en`; set `lang` + `dir` (`rtl` / `ltr`).
3. UI chrome strings (nav, buttons, errors) in a small dictionary (no need for a heavy i18n library unless you already want one).
4. `pick(field)` for API bilingual content.
5. `ThemeContext`: `light` | `dark` | `system`; Tailwind dark class.
6. Toggles in `Navbar` and `Profile`.
7. Hydrate from `/auth/me` after login.

**Done when:** refresh keeps language/theme; survey questions and plan labels flip; layout direction flips.

### Phase 2 — Assessment display polish (0.5 day)

- Questions already load from API — switch displayed text by locale.
- Keep client-side “all 18 answered” + Backend 422.
- Progress = answered / `total_questions`.
- Likert labels AR/EN.

**Done when:** incomplete submit is impossible in UI; EN questions render.

### Phase 3 — Results + radar + strengths (0.5–1 day)

- Results page already exists — bind bilingual pillar names.
- Highlight `is_weak` before the plan.
- Strengths/weaknesses from payload (dashboard already has arrays).
- Do not locally re-rank pillars.

**Done when:** radar matches `pillar_results` percentages.

### Phase 4 — Action plan + KPI + status (1 day)

- `ActionPlanView`: three columns from `phases`.
- Each item: action (AI fallback), KPI, status select.
- Optimistic PATCH; revert on 403/422.
- Optional compact KPI list (requirements “KPI page”) as a section on the same results route (`#kpis`) — **no extra Backend**.

**Done when:** status survives reload; KPIs always visible even if AI empty.

### Phase 5 — PDF + AI fallback (0.5 day)

- Keep blob download.
- If `pdf_ready` false: disable button + “generating”.
- If `ai_ready` false: placeholder for summary; plan still shown.
- Stop treating “both ready” as a hard gate for the page.

**Done when:** demo works without `GEMINI_API_KEY` and without waiting for PDF.

### Phase 6 — Expansion map (1–1.5 days)

- Route `/expansion` behind `ProtectedRoute`.
- CRUD around map clicks.
- Validate lat/lng before POST.
- Empty state + 403 isolation (another account sees none).

**Done when:** add/edit/delete pin; count on dashboard matches.

### Phase 7 — Admin pass (0.5 day)

- Confirm admin token vs user token isolation (manual).
- Filters on assessments list already supported by query params — wire UI if missing.
- 403 if a user hits `/admin`.

**Done when:** seeded admin can see stats; a normal user cannot.

### Phase 8 — UX hardening (1 day)

- Loading / empty / retry on every data page (several already exist).
- Dedicated 403 page.
- Network error retry (interceptor already normalizes this).
- Responsive pass: assessment Likert, radar, plan columns → stack on mobile.
- Keyboard focus on Likert and dialogs.
- Remove unused `Frontend/src` CRA leftovers from the mental model (do not run that tree).

**Done when:** 401 returns to login; 422 field errors show; mobile usable.

---

## 6. New / updated frontend modules

| Module | Action |
|---|---|
| `src/utils/constants.js` | Fix thresholds; add EN labels |
| `src/utils/locale.js` | `pickBilingual(obj, base)` |
| `src/api/preferences.js` | GET/PATCH preferences |
| `src/api/actionPlan.js` | PATCH item status |
| `src/api/expansionAreas.js` | CRUD |
| `src/contexts/LanguageContext.jsx` | New |
| `src/contexts/ThemeContext.jsx` | New |
| `src/contexts/AuthContext.jsx` | Token parse, skip admin me, hydrate prefs |
| `src/components/assessment/ActionPlanView.jsx` | Status + KPI + bilingual |
| `src/pages/user/Profile.jsx` | Language + theme |
| `src/pages/user/ExpansionMap.jsx` | New |
| `src/App.jsx` | `/expansion` route |
| `src/components/layout/Navbar.jsx` | Toggles + map link |
| `tailwind.config.js` | `darkMode: 'class'` if not set |

Do **not** add a second Axios stack. Reuse `userApi` / `adminApi`.

---

## 7. What React must never do

1. Recalculate overall score or weak pillars except as a visual fallback that still displays API values when present.
2. Invent KPIs or rewrite phases.
3. Treat AI text as authoritative over `action_*` / `kpi_*`.
4. Call missing admin me/logout endpoints.
5. Open PDF via public storage.
6. Send a user token to `/api/admin/*`.
7. Change Laravel routes “to match the Word file.” The Word file is functional; **Laravel is the contract**.

---

## 8. Word-doc items that are already satisfied

These exist — only polish, don’t rebuild:

- Landing, login, register, dashboard, 18-question assessment, results, radar, plan layout, history, profile password, notifications, admin area, Axios envelope handling, 401 redirect, 404 page, PDF blob helper, ProtectedRoute / admin split.

---

## 9. Acceptance checklist (graduation demo)

- [ ] Login / register / logout
- [ ] 18 questions, scores 1–5, cannot submit incomplete
- [ ] Results show 6 pillars + readiness from Backend (49 low, 50 medium, 70 good)
- [ ] Radar matches API percentages
- [ ] Weakest 3 highlighted, then Immediate / Medium / Long
- [ ] KPI visible on each task
- [ ] Task status persists
- [ ] AR/EN + RTL/LTR
- [ ] Light / dark (and system)
- [ ] Map pin create/edit/delete
- [ ] PDF downloads with Bearer token
- [ ] Works if AI/PDF still pending
- [ ] User cannot open admin dashboard
- [ ] 401 / 403 / 422 / network handled

---

## 10. Suggested demo script

1. Register → Dashboard empty state → Start assessment.
2. Answer 18 → Submit → Results (scores appear even if AI pending).
3. Show weak pillars + 3-phase plan + KPIs → change one task to in progress.
4. Switch language (RTL/LTR) and theme.
5. Download PDF when ready.
6. Drop a map pin.
7. Admin login (`admin@example.com` / `password` on seeded DB) → users + assessments.

---

## 11. Backend follow-ups (optional, not required for FE)

Only if you want them later (would need API docs + Hoppscotch updates):

- `GET /api/admin/me` and `POST /api/admin/logout`
- Wrap `GET /api/auth/me` in `ApiResponse` (breaking; don’t do it without FE change)
- History mapper that hides `pdf_path` and adds `pdf_ready`
- English titles on notifications

Do **not** block the frontend plan on these.
