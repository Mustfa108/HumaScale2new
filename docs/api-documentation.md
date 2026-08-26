# HumaScale API Documentation

**Base URL (dev):** `http://127.0.0.1:8000/api`  
**Auth:** Sanctum Bearer token unless marked Public.  
**Envelope:** `{ success, message, data?, errors?, meta? }`

Frontend must use bilingual fields (`*_ar` / `*_en`) and authenticated PDF download.

---

## Auth

### POST /api/auth/register (Public)

Body: `name` string required, `email` string required unique, `password` string required, `password_confirmation` required, `organization_name` string optional.

Success 201: user + token (existing behavior).

Errors: 422 validation.

### POST /api/auth/login (Public)

Body: `email`, `password`.

Success 200: user + token. 401 invalid credentials. 422 validation.

### GET /api/auth/me

Returns current user including `locale` (`ar|en`) and `theme` (`light|dark|system`).

### POST /api/auth/logout

Invalidates current token.

---

## Preferences

### GET /api/profile/preferences

Auth required.

Response `data`:

| Field | Type | Nullable | Description | Example |
|---|---|---|---|---|
| locale | string | no | UI language | `ar` |
| theme | string | no | Color theme | `system` |

### PATCH /api/profile/preferences

Body (at least one):

| Field | Type | Required | Values | Description |
|---|---|---|---|---|
| locale | string | no | `ar`, `en` | Saved language |
| theme | string | no | `light`, `dark`, `system` | Saved theme |

Errors: 401, 422 invalid value.

---

## Assessment

### GET /api/assessment/questions

Returns 6 pillars × 3 questions.

`data.pillars[]`: `id`, `key`, `name_ar`, `name_en`, `description_ar`, `description_en`, `questions[]` with `id`, `text_ar`, `text_en`, `display_order`.

### POST /api/assessment/start

Creates or resumes `in_progress` assessment. `data.assessment_id`, `data.status` when resuming.

### POST /api/assessment/{id}/submit

Body:

| Field | Type | Required | Validation |
|---|---|---|---|
| answers | array | yes | size 18 |
| answers.*.question_id | int | yes | exists, distinct |
| answers.*.score | int | yes | 1–5 |

Runs in a DB transaction. Completed assessments cannot be submitted again (422). Other user’s id → 403. Incomplete → 422.

Then queues AI (`ai`) and PDF (`pdf`).

### GET /api/assessment/{id}/results

403 if not owner. 422 if not completed.

`data.assessment`: id, status, overall_score, readiness_level (`low|medium|good`), readiness_level_ar/en, readiness_color, ai_summary_ar, ai_ready, pdf_ready, created_at.

`data.pillar_results[]`: pillar_id, pillar_key, pillar_name_ar/en, raw_score, max_score, percentage, is_weak.

`data.action_plan.phases.{immediate,medium,long}`: label_ar/en, items[] with id, pillar names, action_ar/en, ai_rephrased_ar/en, kpi_ar/en, status.

Readiness: 0–49 low, 50–69 medium, 70–100 good.

### GET /api/assessment/history

Paginated completed assessments. `meta` has pagination.

---

## Action plan status

### PATCH /api/action-plan/items/{id}

Body: `status` required: `not_started` | `in_progress` | `completed`.

Success `data`: id, status, status_ar, status_en.

Errors: 401, 403 not owner, 404, 422 invalid status.

---

## Expansion areas

### GET /api/expansion-areas

`data.items[]`: id, name_ar, name_en, lat, lng, notes, created_at, updated_at.

### POST /api/expansion-areas

| Field | Type | Required | Validation |
|---|---|---|---|
| name_ar | string | yes | max 255 |
| name_en | string | no | max 255 |
| lat | number | yes | -90..90 |
| lng | number | yes | -180..180 |
| notes | string | no | max 2000 |

201 created.

### PATCH /api/expansion-areas/{id}

Same fields, all optional. 403 if not owner.

### DELETE /api/expansion-areas/{id}

403 if not owner.

---

## Reports

### GET /api/report/{id}/status

`data`: assessment_id, pdf_ready, ai_ready, download_via (instruction string). **No public file URL.**

### GET /api/report/{id}/download

Authenticated binary PDF. 403 / 404 / 422 if not ready.

---

## Dashboard

### GET /api/dashboard

Includes bilingual pillar names, `readiness_level_en`, `expansion_areas_count`, `preferences`.

---

## Admin (auth:sanctum + is_admin)

Existing: `POST /api/admin/login`, `GET /api/admin/dashboard`, `GET /api/admin/assessments`, `GET /api/admin/assessments/{id}`, `GET /api/admin/users`, `GET /api/admin/analytics/pillars`.

---

## Error shapes

| Status | Meaning |
|---|---|
| 401 | Unauthenticated |
| 403 | Not owner / not admin |
| 404 | Missing resource |
| 422 | Validation or business rule (incomplete survey, already submitted, PDF not ready) |
| 429 | Rate limit |

```json
{ "success": false, "message": "…", "errors": { "field": ["…"] } }
```
