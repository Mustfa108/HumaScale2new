# Frontend Implementation Guide (Cursor-ready)

**Last Updated:** 2026-08-26  
**Audience:** Frontend developer / later Cursor session  
**Constraint:** Backend contracts below are **already live**. Do not invent new endpoints. Do not rebuild the app.

Read [`PROJECT_CONTEXT.md`](../PROJECT_CONTEXT.md), [`frontend.md`](frontend.md), and the full plan [`frontend-implementation-plan.md`](frontend-implementation-plan.md) first. Schema: [`backend-schema.md`](backend-schema.md). API: [`api-documentation.md`](api-documentation.md).

## Do not rebuild

Keep existing routes, Axios clients, assessment flow, Recharts, admin split, and Sanctum Bearer tokens. Only add the gaps listed here.

## Envelope (always)

```json
{
  "success": true,
  "message": "…",
  "data": {},
  "errors": {},
  "meta": {}
}
```

Use `response.data.data`. Auth: `Authorization: Bearer {token}`.

---

## 1. Readiness thresholds 50/70

**File:** `Frontend/humascale-frontend/src/utils/constants.js`

Replace `readinessFromScore`:

```js
export function readinessFromScore(score) {
  if (score < 50) return READINESS_LEVELS.low;
  if (score < 70) return READINESS_LEVELS.medium;
  return READINESS_LEVELS.good;
}
```

Prefer `readiness_level` from API over recomputing. Search the repo for `< 40` and fix every copy.

**Acceptance:** score 49 → low, 50 → medium, 70 → good. Matches results page badges.

---

## 2. AR / EN + RTL

Backend already returns bilingual fields (`name_ar` / `name_en`, `text_ar` / `text_en`, `action_ar` / `action_en`, `kpi_ar` / `kpi_en`, `readiness_level_ar` / `readiness_level_en`).

### What to build

1. Lightweight i18n (react-i18next or a tiny context) for **UI chrome** (buttons, nav, errors).
2. Content from API: pick `*_ar` when locale is `ar`, `*_en` when `en`.
3. Language toggle in Navbar. Persist:
   - localStorage immediately
   - `PATCH /api/profile/preferences` `{ "locale": "ar" | "en" }`
4. On login / `GET /api/profile/preferences` / `GET /api/auth/me`, apply `locale`.
5. Set `document.documentElement.lang` and `dir` (`rtl` for ar, `ltr` for en).
6. Recharts / tables / sidebar must follow `dir`.

### Do not

- Do not wait for the backend to pick language for you.
- Do not strip `*_ar` fields.

**Acceptance:** switching language flips layout direction and all survey/result/plan labels.

---

## 3. Dark mode

Backend stores `theme`: `light | dark | system` via the same preferences endpoint.

### What to build

1. ThemeProvider: apply `class="dark"` on `<html>` for dark.
2. `system` follows `prefers-color-scheme`.
3. Toggle in Navbar/Profile.
4. Persist with `PATCH /api/profile/preferences` `{ "theme": "dark" }`.
5. Test radar/bar/donut colors in both themes.

**Acceptance:** refresh keeps theme; login loads server preference.

---

## 4. Action-plan item status

Results payload now includes `id` and `status` per item:

`not_started | in_progress | completed`

**API:** `PATCH /api/action-plan/items/{id}`  
Body: `{ "status": "in_progress" }`  
Auth required. 403 if not owner. 422 if invalid status.

**File:** `src/components/assessment/ActionPlanView.jsx`

Show three states (لم تبدأ / قيد التنفيذ / مكتملة). Optimistic update, revert on error.

**Acceptance:** changing status survives page reload (refetch results).

---

## 5. Expansion map

New page (suggested `/expansion` or section on dashboard).

| Method | URL | Purpose |
|---|---|---|
| GET | `/api/expansion-areas` | List `{ items: [...] }` |
| POST | `/api/expansion-areas` | Create |
| PATCH/PUT | `/api/expansion-areas/{id}` | Update |
| DELETE | `/api/expansion-areas/{id}` | Delete |

Create body:

```json
{
  "name_ar": "الرياض",
  "name_en": "Riyadh",
  "lat": 24.7136,
  "lng": 46.6753,
  "notes": "optional"
}
```

`lat` −90..90, `lng` −180..180. `name_ar` required.

Use any map library (Leaflet recommended: simple, RTL-friendly). Dashboard already returns `expansion_areas_count`.

**Acceptance:** add pin, edit, delete; another user cannot see the list.

---

## 6. PDF and AI fallback

**Do not** open `storage/...` public URLs. `GET /api/report/{id}/status` no longer returns `pdf_path`.

- Ready? `GET /api/report/{id}/download` as **blob** with Bearer token (existing `src/api/report.js` pattern).
- If `ai_ready === false`, show fallback copy: results and plan still valid (rule-based). Hide empty `ai_summary_ar` or show “الملخص قيد التوليد / Summary pending”.
- Prefer `ai_rephrased_ar` for display when present, else `action_ar`. Never overwrite KPI with AI text.

**Acceptance:** PDF downloads with auth; page works without Gemini.

---

## 7. Suggested implementation order

1. Thresholds in `constants.js`
2. Preferences GET/PATCH + apply locale/theme on boot (`AuthContext`)
3. i18n chrome + bilingual content pickers
4. Action item status UI
5. Map page + API module `src/api/expansionAreas.js`
6. PDF/AI fallback polish
7. Dark-mode chart tokens

## 8. New API modules to add

```js
// src/api/preferences.js
GET  /profile/preferences
PATCH /profile/preferences

// src/api/actionPlan.js
PATCH /action-plan/items/:id

// src/api/expansionAreas.js
GET/POST /expansion-areas
PATCH/DELETE /expansion-areas/:id
```

Axios clients already prefix `/api`.

## 9. Acceptance checklist (graduation demo)

- [ ] 18 questions, cannot submit incomplete
- [ ] Weakest 3 pillars highlighted before plan
- [ ] Immediate / Medium / Long timeline
- [ ] AR/EN + RTL/LTR
- [ ] Light/Dark
- [ ] Task status
- [ ] Map pins saved
- [ ] PDF download works
- [ ] AI missing still shows rule-based plan
