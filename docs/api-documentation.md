# HumaScale API Documentation

**Last Updated:** 2026-08-27  
**Base URL (dev):** `http://127.0.0.1:8000/api`  
**Frontend proxy:** Vite `/api` → `http://127.0.0.1:8000`  
**Auth:** `Authorization: Bearer {token}` unless marked Public  
**Rate limits:** `throttle:auth` on login/register/password; `throttle:api` on authenticated routes

This is the **live contract** from `Backend/Backend/routes/api.php` and controllers. Frontend must use these field names exactly.

---

## Envelope

Most JSON endpoints use `ApiResponse`:

```json
{
  "success": true,
  "message": "Translated or Arabic message",
  "data": {},
  "errors": {},
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 10,
    "total": 0
  }
}
```

| Field | Type | When present | Description |
|---|---|---|---|
| success | boolean | always | `true` on success, `false` on error |
| message | string | always | Human-readable status (currently Arabic) |
| data | object/array/null | success (omitted if null on some deletes) | Payload |
| errors | object | validation failures | Laravel field errors: `{ "email": ["..."] }` |
| meta | object | paginated lists | Pagination |
| unread_count | integer | notifications index only | Extra top-level field |

**Axios note:** `response.data` is this envelope. Business payload is `response.data.data`.

**Exception — `GET /api/auth/me`:** returns a **flat user object** (no `success` / `message` wrapper).

**Exception — `GET /api/report/{id}/download`:** binary PDF, not JSON.

---

## Error responses

| HTTP | Meaning | Frontend handling |
|---|---|---|
| 400 | Bad signed link / already verified | Show `message` |
| 401 | Bad credentials or missing/invalid token | Clear token, redirect to login |
| 403 | Not owner / not admin | Forbidden UI |
| 404 | Missing resource (`findOrFail`) | Not-found UI |
| 422 | Validation or business rule | Show `message` and `errors` |
| 429 | Rate limited | Retry later |
| 500 | Server error | Generic retry |

```json
{
  "success": false,
  "message": "يجب الإجابة على جميع الأسئلة الثمانية عشر.",
  "errors": {
    "answers": ["يجب الإجابة على جميع الأسئلة الثمانية عشر."]
  }
}
```

---

## Auth (public)

### POST /api/auth/register

**Auth:** Public. **Status:** 201.

Creates a user, marks email verified immediately, returns a Sanctum token (auto-login).

#### Request body

| Field | Type | Required | Validation | Description | Example |
|---|---|---|---|---|---|
| name | string | yes | max 255 | Full name | `Sara Ahmad` |
| email | string | yes | email, unique in `users` | Login email | `sara@ngo.org` |
| password | string | yes | min 8 | Password | `Secret123` |
| password_confirmation | string | yes | must match `password` | Confirmation | `Secret123` |
| organization_name | string | no | max 255 | Organization | `Amal NGO` |

#### Response `data`

| Field | Type | Nullable | Description | Example |
|---|---|---|---|---|
| id | integer | no | User id | `1` |
| name | string | no | Name | `Sara Ahmad` |
| email | string | no | Email | `sara@ngo.org` |
| organization_name | string | yes | Organization | `Amal NGO` |
| created_at | datetime | no | Created | `2026-08-27T10:00:00.000000Z` |
| access_token | string | no | Sanctum token — store this | `1\|abc...` |
| token_type | string | no | Always `Bearer` | `Bearer` |

**Errors:** 422 validation (duplicate email, short password, mismatch). 429 throttle.

---

### POST /api/auth/login

**Auth:** Public. **Status:** 200.

If email is unverified, Backend verifies it on successful login (does not block login).

#### Request body

| Field | Type | Required | Validation | Description | Example |
|---|---|---|---|---|---|
| email | string | yes | email | Login email | `sara@ngo.org` |
| password | string | yes | string | Password | `Secret123` |

#### Response `data`

| Field | Type | Nullable | Description | Example |
|---|---|---|---|---|
| id | integer | no | User id | `1` |
| name | string | no | Name | `Sara Ahmad` |
| email | string | no | Email | `sara@ngo.org` |
| organization_name | string | yes | Organization | `Amal NGO` |
| access_token | string | no | Sanctum token | `1\|abc...` |
| token_type | string | no | `Bearer` | `Bearer` |

**Does not currently return** `locale` / `theme`. After login, call `GET /api/auth/me` or `GET /api/profile/preferences`.

**Errors:** 401 invalid credentials. 422 validation. 429 throttle.

---

### GET /api/auth/verify-email/{id}/{hash}

**Auth:** Public, signed URL. **Status:** 200.

Email verification is currently auto-completed on register. Kept for compatibility.

**Errors:** 400 invalid hash. 404 unknown user.

---

### POST /api/auth/forgot-password

**Auth:** Public.

#### Request body

| Field | Type | Required | Validation | Description | Example |
|---|---|---|---|---|---|
| email | string | yes | email | Account email | `sara@ngo.org` |

Always returns success (does not reveal whether the email exists). Sends mail if the user exists. Token lives 60 minutes.

---

### POST /api/auth/reset-password

**Auth:** Public.

#### Request body

| Field | Type | Required | Validation | Description | Example |
|---|---|---|---|---|---|
| email | string | yes | email | Account email | `sara@ngo.org` |
| token | string | yes | string | Token from email (plain, not hashed) | `a1b2...` |
| password | string | yes | min 8, confirmed | New password | `NewSecret1` |
| password_confirmation | string | yes | must match | Confirmation | `NewSecret1` |

Success revokes all existing tokens. **Errors:** 422 invalid/expired token or validation.

---

## Auth (authenticated user)

### GET /api/auth/me

**Auth:** Sanctum user. **Not wrapped** in `ApiResponse`.

```json
{
  "id": 1,
  "name": "Sara Ahmad",
  "email": "sara@ngo.org",
  "organization_name": "Amal NGO",
  "locale": "ar",
  "theme": "system",
  "email_verified_at": "2026-08-27T10:00:00.000000Z"
}
```

| Field | Type | Nullable | Description |
|---|---|---|---|
| id | integer | no | User id |
| name | string | no | Name |
| email | string | no | Email |
| organization_name | string | yes | Organization |
| locale | string | no | `ar` or `en` (defaults `ar`) |
| theme | string | no | `light`, `dark`, `system` (defaults `system`) |
| email_verified_at | datetime | yes | Verification time |

Frontend `authApi.me()` already unwraps Axios `response.data`, so this object is the return value (not nested under `.data`).

---

### POST /api/auth/logout

Invalidates the **current** token. `data` omitted.

---

### POST /api/auth/change-password

#### Request body

| Field | Type | Required | Validation | Description |
|---|---|---|---|---|
| current_password | string | yes | must match stored hash | Current password |
| new_password | string | yes | min 8, confirmed, different from current | New password |
| new_password_confirmation | string | yes | must match `new_password` | Confirmation |

On success, **all tokens are revoked**. Frontend must log the user out and send them to login.

**Errors:** 422 wrong current password or validation.

---

### POST /api/auth/email/resend

No-op in current product (email is already verified). Returns 400 if already verified.

---

## Preferences

### GET /api/profile/preferences

**Auth:** Sanctum user.

#### Response `data`

| Field | Type | Nullable | Values | Description | Example |
|---|---|---|---|---|---|
| locale | string | no | `ar`, `en` | Saved UI language | `ar` |
| theme | string | no | `light`, `dark`, `system` | Saved theme | `system` |

---

### PATCH /api/profile/preferences

Send **at least one** field.

#### Request body

| Field | Type | Required | Values | Description |
|---|---|---|---|---|
| locale | string | no | `ar`, `en` | Persist language |
| theme | string | no | `light`, `dark`, `system` | Persist theme |

#### Response `data`

Same as GET: `{ locale, theme }`.

Backend does not apply CSS. Frontend must set `dir`/`lang` and `class="dark"`.

---

## Dashboard

### GET /api/dashboard

**Auth:** Sanctum user. Summary of the latest **completed** assessment.

#### When no completed assessment (`data`)

| Field | Type | Description |
|---|---|---|
| has_assessment | boolean | `false` |
| message | string | Empty-state copy |
| expansion_areas_count | integer | Pin count |
| preferences.locale | string | `ar` / `en` |
| preferences.theme | string | theme value |

#### When an assessment exists (`data`)

| Field | Type | Nullable | Description | Example |
|---|---|---|---|---|
| has_assessment | boolean | no | `true` | `true` |
| latest_assessment.id | integer | no | Assessment id | `12` |
| latest_assessment.overall_score | number | no | 0–100 | `61.11` |
| latest_assessment.readiness_level | string | no | `low` / `medium` / `good` | `medium` |
| latest_assessment.readiness_level_ar | string | no | Arabic label | `متوسط` |
| latest_assessment.readiness_level_en | string | no | English label | `Medium` |
| latest_assessment.ai_ready | boolean | no | AI job finished | `false` |
| latest_assessment.pdf_ready | boolean | no | PDF job finished | `false` |
| latest_assessment.created_at | datetime | no | Created | |
| radar_chart_data[] | array | no | Six pillars for radar | |
| radar_chart_data[].pillar_key | string | no | `team` … `sustainability` | `funding` |
| radar_chart_data[].pillar_ar | string | no | Arabic name | `التمويل` |
| radar_chart_data[].pillar_en | string | yes | English name | `Funding` |
| radar_chart_data[].percentage | number | no | 0–100 | `40.00` |
| strengths[] | array | no | Top 2 non-weak pillars | |
| strengths[].pillar_ar / pillar_en | string | en nullable | Names | |
| strengths[].percentage | number | no | Score | `80` |
| weaknesses[] | array | no | All weak pillars (3), lowest first | |
| weaknesses[].pillar_ar / pillar_en | string | en nullable | Names | |
| weaknesses[].percentage | number | no | Score | `40` |
| ai_summary_ar | string | yes | Gemini summary; may be null | |
| total_assessments | integer | no | Count of completed | `2` |
| expansion_areas_count | integer | no | Map pins | `1` |
| preferences | object | no | `{ locale, theme }` | |

**Radar:** plot `percentage` vs `pillar_ar` or `pillar_en` by locale. Do not recompute percentages.

---

## Assessment

### GET /api/assessment/questions

**Auth:** Sanctum user. Catalog of 6 pillars × 3 active questions.

#### Response `data`

| Field | Type | Description |
|---|---|---|
| total_questions | integer | Should be `18` |
| pillars[] | array | Ordered by `display_order` |
| pillars[].id | integer | Pillar id |
| pillars[].key | string | `team`, `funding`, `impact`, `partnerships`, `technology`, `sustainability` |
| pillars[].name_ar / name_en | string | Display names (`name_en` may be null) |
| pillars[].description_ar / description_en | string | Descriptions |
| pillars[].questions[] | array | Active questions |
| pillars[].questions[].id | integer | **Use this as `question_id` on submit** |
| pillars[].questions[].text_ar / text_en | string | Question text |
| pillars[].questions[].display_order | integer | 1–3 inside pillar |

There is no `options` array. Scale is always integer 1–5.

---

### POST /api/assessment/start

**Auth:** Sanctum user. No body.

Resumes an existing `in_progress` assessment if one exists.

#### Response `data` (new — 201)

| Field | Type | Description |
|---|---|---|
| assessment_id | integer | New id |

#### Response `data` (resume — 200)

| Field | Type | Description |
|---|---|---|
| assessment_id | integer | Existing id |
| status | string | `in_progress` |

Frontend should keep `assessment_id` for submit and results.

---

### POST /api/assessment/{id}/submit

**Auth:** Sanctum user. Owner only. Runs in a DB transaction, then queues AI + PDF.

#### Path

| Param | Type | Description |
|---|---|---|
| id | integer | `assessment_id` from start |

#### Request body

| Field | Type | Required | Validation | Description |
|---|---|---|---|---|
| answers | array | yes | size **18** | All questions |
| answers[].question_id | integer | yes | exists in `questions`, distinct | From questions API |
| answers[].score | integer | yes | min 1, max 5 | Likert score |

```json
{
  "answers": [
    { "question_id": 1, "score": 4 },
    { "question_id": 2, "score": 3 }
  ]
}
```

#### Response `data`

| Field | Type | Description |
|---|---|---|
| assessment_id | integer | Same id |

Scores are **not** in this response. Redirect to results and poll.

**Errors:**

| Status | When |
|---|---|
| 403 | Not the owner |
| 404 | Unknown id |
| 422 | Not 18 answers, score outside 1–5, duplicate question, or already `completed` |

---

### GET /api/assessment/{id}/results

**Auth:** Sanctum owner. Assessment must be `completed`.

This single payload covers **Analysis, Action Plan, and KPI** pages from the requirements document. There is no separate `/action-plan` or `/kpis` route.

#### Response `data.assessment`

| Field | Type | Nullable | Description | Example |
|---|---|---|---|---|
| id | integer | no | Assessment id | `12` |
| status | string | no | `completed` | `completed` |
| overall_score | number | no | 0–100 | `61.11` |
| readiness_level | string | no | `low` / `medium` / `good` | `medium` |
| readiness_level_ar | string | no | `منخفض` / `متوسط` / `جيد` | `متوسط` |
| readiness_level_en | string | no | `Low` / `Medium` / `Good` | `Medium` |
| readiness_color | string | no | Hex color | `#F59E0B` |
| ai_summary_ar | string | yes | AI summary; hide if null | |
| ai_ready | boolean | no | AI job done | `false` |
| pdf_ready | boolean | no | PDF job done | `false` |
| created_at | datetime | no | Created | |

#### Response `data.pillar_results[]`

| Field | Type | Description |
|---|---|---|
| pillar_id | integer | Pillar id |
| pillar_key | string | Stable key |
| pillar_name_ar / pillar_name_en | string | Names |
| raw_score | number | Sum of 3 answers |
| max_score | number | Always 15 |
| percentage | number | Pillar % |
| is_weak | boolean | Highlight if `true` (3 weakest) |

#### Response `data.action_plan`

| Field | Type | Nullable | Description |
|---|---|---|---|
| id | integer | no | Plan id |
| ai_intro_ar | string | yes | Optional AI intro |
| phases | object | no | Keys: `immediate`, `medium`, `long` |
| phases.{phase}.label_ar | string | no | `0-30 يوم` / `1-3 أشهر` / `3-6 أشهر` |
| phases.{phase}.label_en | string | no | `0-30 days` / `1-3 months` / `3-6 months` |
| phases.{phase}.items[] | array | no | Usually 3 items per phase |

#### Response `data.action_plan.phases.*.items[]`

| Field | Type | Nullable | Description | Example |
|---|---|---|---|---|
| id | integer | no | Item id for PATCH status | `88` |
| pillar_name_ar / pillar_name_en | string | en nullable | Weak pillar | `التمويل` |
| action_ar / action_en | string | en nullable | Rule text | |
| ai_rephrased_ar / ai_rephrased_en | string | yes | Prefer for display when present | |
| kpi_ar / kpi_en | string | yes | Rule KPI — never replace with AI | |
| status | string | no | `not_started` / `in_progress` / `completed` | `not_started` |

**Display rule:** show `ai_rephrased_*` if not empty, else `action_*`. Always show `kpi_*` from this payload.

**Errors:** 403 not owner. 404 missing. 422 still `in_progress`.

---

### GET /api/assessment/history

**Auth:** Sanctum user. Paginated completed assessments (`per_page` = 10).

#### Query

| Field | Type | Required | Description |
|---|---|---|---|
| page | integer | no | Page number |

#### Response

`data` is an array of Assessment models (Laravel paginator items), including:

| Field | Type | Nullable | Description |
|---|---|---|---|
| id | integer | no | Assessment id |
| user_id | integer | no | Owner |
| status | string | no | `completed` |
| overall_score | number | yes | Score |
| readiness_level | string | yes | Level key |
| ai_summary_ar | string | yes | Summary |
| ai_generated_at | datetime | yes | AI timestamp |
| pdf_path | string | yes | Internal path — **do not open as URL** |
| created_at / updated_at | datetime | no | Dates |

`meta`: `current_page`, `last_page`, `per_page`, `total`.

---

## Action plan status

### PATCH /api/action-plan/items/{id}

**Auth:** Sanctum. Must own the parent assessment.

#### Request body

| Field | Type | Required | Values | Description |
|---|---|---|---|---|
| status | string | yes | `not_started`, `in_progress`, `completed` | New status |

#### Response `data`

| Field | Type | Description | Example |
|---|---|---|---|
| id | integer | Item id | `88` |
| status | string | Stored value | `in_progress` |
| status_ar | string | `لم تبدأ` / `قيد التنفيذ` / `مكتملة` | `قيد التنفيذ` |
| status_en | string | `Not started` / `In progress` / `Completed` | `In progress` |

**Errors:** 401, 403 not owner, 404, 422 invalid status.

---

## Expansion areas (map)

All require Sanctum. Users only see their own pins.

### GET /api/expansion-areas

#### Response `data`

| Field | Type | Description |
|---|---|---|
| items | array | Pins, newest first |

Each item:

| Field | Type | Nullable | Description | Example |
|---|---|---|---|---|
| id | integer | no | Pin id | `3` |
| name_ar | string | no | Arabic name | `الرياض` |
| name_en | string | yes | English name | `Riyadh` |
| lat | number | no | Latitude | `24.7136` |
| lng | number | no | Longitude | `46.6753` |
| notes | string | yes | Notes | `فرع مقترح` |
| created_at / updated_at | datetime | no | Audit | |

---

### POST /api/expansion-areas

**Status:** 201. Returns the created item (same shape as above, not wrapped in `items`).

#### Request body

| Field | Type | Required | Validation | Description | Example |
|---|---|---|---|---|---|
| name_ar | string | yes | max 255 | Arabic label | `الرياض` |
| name_en | string | no | max 255 | English label | `Riyadh` |
| lat | number | yes | −90..90 | Latitude | `24.7136` |
| lng | number | yes | −180..180 | Longitude | `46.6753` |
| notes | string | no | max 2000 | Notes | `فرع مقترح` |

---

### PUT|PATCH /api/expansion-areas/{id}

All body fields optional. Same validation when present. 403 if not owner. Returns updated item.

---

### DELETE /api/expansion-areas/{id}

403 if not owner. Success with `data` omitted.

---

## Reports

### GET /api/report/{assessment_id}/status

**Auth:** Sanctum owner.

#### Response `data`

| Field | Type | Description | Example |
|---|---|---|---|
| assessment_id | integer | Id | `12` |
| pdf_ready | boolean | File exists | `true` |
| ai_ready | boolean | AI job done | `false` |
| download_via | string | Instruction only, not a URL | `GET /api/report/{assessment_id}/download` |

**No `pdf_path` and no public file URL.**

---

### GET /api/report/{assessment_id}/download

**Auth:** Sanctum owner. **Response:** `application/pdf` binary (`humascale_report_{id}.pdf`).

Frontend must download as **blob** with the Bearer header (`src/api/report.js`).

**Errors (JSON):** 403, 404 file missing, 422 not generated yet.

---

## Notifications

### GET /api/notifications

**Auth:** Sanctum user. Paginated (`per_page` 15). Extra top-level `unread_count`.

#### Response item

| Field | Type | Nullable | Description |
|---|---|---|---|
| id | uuid string | no | Notification id |
| type | string | yes | From `data.type` |
| title_ar | string | yes | Title |
| body_ar | string | yes | Body |
| data | object | no | Full payload |
| read_at | datetime | yes | Null = unread |
| created_at | datetime | no | Created |

---

### POST /api/notifications/{id}/read

Marks one notification read.

---

### POST /api/notifications/read-all

Marks all unread as read.

---

## Admin

Admin tokens come from `POST /api/admin/login`. Protected routes need `auth:sanctum` **and** `is_admin` (token must belong to `Admin`, not `User`).

**Not implemented (do not call):** `GET /api/admin/me`, `POST /api/admin/logout`. Persist admin from the login payload. To log out, drop the token client-side (optional Backend follow-up).

### POST /api/admin/login

**Auth:** Public.

#### Request body

| Field | Type | Required | Description |
|---|---|---|---|
| email | string | yes | Admin email |
| password | string | yes | Password |

#### Response `data`

| Field | Type | Description | Example |
|---|---|---|---|
| token | string | Sanctum token (**not** `access_token`) | `2\|xyz...` |
| token_type | string | `Bearer` | `Bearer` |
| admin.id | integer | Admin id | `1` |
| admin.name | string | Name | `Admin` |
| admin.email | string | Email | `admin@example.com` |

Dev seed: `admin@example.com` / `password`.

**Errors:** 401 bad credentials. 422 validation.

---

### GET /api/admin/dashboard

#### Response `data`

| Field | Type | Description |
|---|---|---|
| total_users | integer | User count |
| total_assessments | integer | All assessments |
| completed_assessments | integer | Completed |
| in_progress_assessments | integer | In progress |
| readiness_distribution.low/medium/good.count | integer | Count per level |
| readiness_distribution.*.label_ar | string | `منخفض` / `متوسط` / `جيد` |
| readiness_distribution.*.percentage | number | Share of completed |
| average_overall_score | number | Average completed score |
| assessments_this_month | integer | Completed this calendar month |
| new_users_this_month | integer | New users this month |
| pillar_averages[] | array | `{ pillar_ar, average_percentage }` |
| most_common_weak_pillar_ar | string | Arabic name or `غير محدد` |

---

### GET /api/admin/users

Paginated (`per_page` 20). `data[]` is User models plus:

| Field | Type | Description |
|---|---|---|
| assessments_count | integer | `withCount` |
| last_assessment_at | datetime | Latest assessment timestamp (may be null) |

Password is hidden. `meta` pagination as usual.

---

### GET /api/admin/assessments

Completed assessments only. Paginated (`per_page` 20).

#### Query params

| Field | Type | Required | Values | Description |
|---|---|---|---|---|
| readiness_level | string | no | `low`, `medium`, `good` | Filter |
| date_from | date | no | YYYY-MM-DD | Inclusive |
| date_to | date | no | YYYY-MM-DD | Inclusive |
| sort_by | string | no | `created_at` (default), `overall_score` | Sort field |
| sort_order | string | no | `desc` (default), `asc` | Direction |
| page | integer | no | | Page |

#### Response `data[]`

| Field | Type | Nullable | Description |
|---|---|---|---|
| id | integer | no | Assessment id |
| user_name | string | no | Owner name |
| organization_name | string | yes | Organization |
| overall_score | number | no | Score |
| readiness_level | string | no | Key |
| readiness_level_ar | string | no | Arabic label |
| status | string | no | `completed` |
| created_at | datetime | no | Created |

---

### GET /api/admin/assessments/{id}

Detail for any completed/in-progress assessment (no user ownership check; admin-only).

Shape is similar to user results, plus `user_name` / `organization_name` on `assessment`. Pillar results currently omit `pillar_name_en`. Action-plan phase objects currently omit `label_en`. Prefer bilingual fields when present; fall back to Arabic.

---

### GET /api/admin/analytics/pillars

#### Response `data`

| Field | Type | Description |
|---|---|---|
| pillars[] | array | `{ pillar_key, pillar_ar, average_percentage }` |
| strongest_pillar_ar | string | Highest average name |
| weakest_pillar_ar | string | Lowest average name |

---

## Token field cheat sheet

| Login | Token key in `data` | Storage key (current FE) |
|---|---|---|
| User | `access_token` | `humascale_user_token` |
| Admin | `token` | `humascale_admin_token` |

---

## Endpoints that do not exist

| Guessed path | Reality |
|---|---|
| GET /api/admin/me | Missing — persist `data.admin` from login |
| POST /api/admin/logout | Missing — delete token client-side |
| GET /api/kpis | Missing — KPIs are on action-plan items |
| GET /api/action-plan | Missing — nested in results |
| Public PDF URL | Missing — authenticated download only |
