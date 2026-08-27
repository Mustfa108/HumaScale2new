# Backend Database Schema

**Last Updated:** 2026-08-27  
**Source of truth:** Laravel migrations in `Backend/Backend/database/migrations`  
**Database:** MySQL in production, SQLite in tests

This file documents every table and column the Frontend must understand. Do not invent extra fields. Hidden columns (passwords, tokens) are listed so they are **never** sent to the UI.

---

## Entity relationship (domain)

```text
users 1──< assessments 1──< assessment_answers >──1 questions >──1 pillars
                 │
                 ├──< assessment_pillar_results >──1 pillars
                 └──1 action_plans 1──< action_plan_items >──1 pillars

users 1──< expansion_areas
users 1──< notifications (polymorphic)
admins (separate auth table, Sanctum tokens)
```

Catalog data (`pillars`, `questions`) is seeded, not created by users.

---

## Domain tables

### `users`

End-user accounts (nonprofits). Auth via Sanctum. Email verification is currently auto-marked on register/login.

| Column | Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| id | bigint PK | no | auto | User id | `1` |
| name | string | no | — | Display name | `Sara Ahmad` |
| organization_name | string | yes | null | Organization name | `Amal NGO` |
| locale | string(5) | no | `ar` | UI language. Values: `ar`, `en` | `ar` |
| theme | string(16) | no | `system` | Color theme. Values: `light`, `dark`, `system` | `system` |
| email | string unique | no | — | Login email | `sara@ngo.org` |
| email_verified_at | timestamp | yes | null | Verification timestamp | `2026-08-27 10:00:00` |
| password | hashed string | no | — | Never returned in API | — |
| remember_token | string | yes | null | Unused for API | — |
| created_at | timestamp | yes | — | Created | |
| updated_at | timestamp | yes | — | Updated | |

**Hidden from API:** `password`, `remember_token`.

**Relations:** `assessments`, `expansionAreas`, Laravel `notifications`.

---

### `admins`

Separate admin accounts. Not in `users`. Login is `POST /api/admin/login`. Middleware `is_admin` checks the token belongs to an `Admin` model.

| Column | Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| id | bigint PK | no | auto | Admin id | `1` |
| name | string | no | — | Display name | `Admin` |
| email | string unique | no | — | Login email | `admin@example.com` |
| password | hashed string | no | — | Never returned | — |
| remember_token | string | yes | null | Unused for API | — |
| created_at | timestamp | yes | — | Created | |
| updated_at | timestamp | yes | — | Updated | |

**Seed (dev):** `admin@example.com` / `password` via `AdminSeeder`.

---

### `pillars`

Six readiness dimensions. Catalog. Frontend must use `key` + bilingual names from API, not hard-coded labels as source of truth.

| Column | Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| id | bigint PK | no | auto | Pillar id | `2` |
| key | string(50) unique | no | — | Stable code | `funding` |
| name_ar | string | no | — | Arabic name | `التمويل` |
| name_en | string | yes | null | English name | `Funding` |
| description_ar | text | no | — | Arabic description | `يقيس استدامة مصادر التمويل...` |
| description_en | text | yes | null | English description | `Measures funding sustainability...` |
| display_order | tinyint unsigned | no | `0` | Sort order 1–6 | `2` |
| created_at / updated_at | timestamps | yes | — | Audit | |

**Seeded keys (order):** `team`, `funding`, `impact`, `partnerships`, `technology`, `sustainability`.

---

### `questions`

Eighteen Likert items. Three active questions per pillar.

| Column | Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| id | bigint PK | no | auto | Question id used in submit | `7` |
| pillar_id | FK → pillars | no | — | Parent pillar | `3` |
| text_ar | text | no | — | Question in Arabic | `هل حددتم مؤشرات أثر...` |
| text_en | text | yes | null | Question in English | `Have you defined...` |
| display_order | tinyint unsigned | no | `0` | Order inside pillar (1–3) | `1` |
| is_active | boolean | no | `true` | Inactive questions are omitted from `GET /assessment/questions` | `true` |
| created_at / updated_at | timestamps | yes | — | Audit | |

**Business rule:** submit requires **18 distinct** `question_id` values that exist in this table. Score is **integer 1–5**.

---

### `assessments`

One survey attempt. Status starts `in_progress`. After submit, scoring sets `completed` and fills scores. AI/PDF fill later via queues.

| Column | Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| id | bigint PK | no | auto | Assessment id | `12` |
| user_id | FK → users cascade | no | — | Owner | `1` |
| status | enum | no | `in_progress` | `in_progress` or `completed` | `completed` |
| overall_score | decimal(5,2) | yes | null | Average of 6 pillar percentages | `61.11` |
| readiness_level | enum | yes | null | `low`, `medium`, `good` | `medium` |
| ai_summary_ar | text | yes | null | Gemini summary (AR). Optional | `ملخص...` |
| ai_generated_at | timestamp | yes | null | Set when AI job finishes. Drives `ai_ready` | |
| pdf_path | string | yes | null | Storage path, **not a public URL**. Drives `pdf_ready` | `reports/12.pdf` |
| created_at / updated_at | timestamps | yes | — | Audit | |

**Computed (not columns):**

| Accessor | Type | Meaning |
|---|---|---|
| readiness_level_ar | string | `منخفض` / `متوسط` / `جيد` |
| readiness_level_en | string | `Low` / `Medium` / `Good` |
| readiness_color | string hex | `#DC2626` / `#F59E0B` / `#16A34A` |
| ai_ready | boolean | `ai_generated_at` is not null |
| pdf_ready | boolean | `pdf_path` is not null |

**Readiness thresholds:** `0–49` low, `50–69` medium, `70–100` good.

**Ownership:** a user may only view/submit their own assessments (`AssessmentPolicy`).

---

### `assessment_answers`

One row per question per assessment. Unique `(assessment_id, question_id)`.

| Column | Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| id | bigint PK | no | auto | Answer id | `101` |
| assessment_id | FK → assessments cascade | no | — | Parent assessment | `12` |
| question_id | FK → questions cascade | no | — | Question | `7` |
| score | tinyint unsigned | no | — | Likert **1–5** | `4` |
| created_at / updated_at | timestamps | yes | — | Audit | |

Not returned as a standalone list after submit. Results use aggregated pillar rows instead.

---

### `assessment_pillar_results`

Six rows per completed assessment (one per pillar). Written by `AssessmentScoringService`.

| Column | Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| id | bigint PK | no | auto | Result id | `40` |
| assessment_id | FK → assessments cascade | no | — | Parent | `12` |
| pillar_id | FK → pillars cascade | no | — | Pillar | `2` |
| raw_score | decimal(5,2) | no | — | Sum of 3 question scores (3–15) | `6.00` |
| max_score | decimal(5,2) | no | `15.00` | Always 15 (3 × 5) | `15.00` |
| percentage | decimal(5,2) | no | — | `(raw / 15) * 100` | `40.00` |
| is_weak | boolean | no | `false` | `true` for the **3 lowest** pillars | `true` |
| created_at / updated_at | timestamps | yes | — | Audit | |

Unique `(assessment_id, pillar_id)`.

**Formula:** overall score = average of the six `percentage` values.

**Weak pillars:** `asort` by percentage, take first 3 ids, set `is_weak = true`. Those three feed the action plan.

---

### `action_plans`

One plan per completed assessment.

| Column | Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| id | bigint PK | no | auto | Plan id | `12` |
| assessment_id | FK → assessments cascade | no | — | Parent | `12` |
| ai_intro_ar | text | yes | null | Optional Gemini intro | `مقدمة...` |
| created_at / updated_at | timestamps | yes | — | Audit | |

There is **no** separate “get action plan” endpoint. It is nested under `GET /api/assessment/{id}/results` as `data.action_plan`.

---

### `action_plan_items`

Nine items: 3 weak pillars × 3 phases. Rules live in `ActionPlanService`. AI may only fill `ai_rephrased_*`. KPIs always come from rules.

| Column | Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| id | bigint PK | no | auto | Item id (used in PATCH status) | `88` |
| action_plan_id | FK → action_plans cascade | no | — | Parent plan | `12` |
| pillar_id | FK → pillars | no | — | Weak pillar this task belongs to | `2` |
| phase | enum | no | — | `immediate`, `medium`, `long` | `immediate` |
| phase_label_ar | string | no | — | Stored Arabic phase label | `فوري (0-30 يوم)` |
| phase_label_en | string | yes | null | Stored English phase label | `Immediate (0-30 days)` |
| action_ar | text | no | — | Rule-based action (AR) | `أعدَّ قائمة...` |
| action_en | text | yes | null | Rule-based action (EN) | `Prepare a full list...` |
| kpi_ar | text | yes | null | Rule-based KPI (AR). Never from AI | `قائمة مقيّمة لـ10 مصادر...` |
| kpi_en | text | yes | null | Rule-based KPI (EN) | `An assessed list of at least 10...` |
| ai_rephrased_ar | text | yes | null | Optional Gemini rewrite of action AR | |
| ai_rephrased_en | text | yes | null | Optional Gemini rewrite of action EN | |
| status | string(32) | no | `not_started` | `not_started`, `in_progress`, `completed` | `not_started` |
| created_at / updated_at | timestamps | yes | — | Audit | |

**Phase meaning (results API labels):**

| phase | AR | EN |
|---|---|---|
| immediate | 0-30 يوم | 0-30 days |
| medium | 1-3 أشهر | 1-3 months |
| long | 3-6 أشهر | 3-6 months |

**Status labels:** `لم تبدأ` / `قيد التنفيذ` / `مكتملة` and `Not started` / `In progress` / `Completed`.

---

### `expansion_areas`

User-owned map pins (geographic expansion targets). Isolated per `user_id`.

| Column | Type | Nullable | Default | Description | Example |
|---|---|---|---|---|---|
| id | bigint PK | no | auto | Pin id | `3` |
| user_id | FK → users cascade | no | — | Owner | `1` |
| name_ar | string | no | — | Arabic label | `الرياض` |
| name_en | string | yes | null | English label | `Riyadh` |
| lat | decimal(10,7) | no | — | Latitude −90..90 | `24.7136000` |
| lng | decimal(10,7) | no | — | Longitude −180..180 | `46.6753000` |
| notes | text | yes | null | Free notes, max 2000 on write | `فرع مقترح` |
| created_at / updated_at | timestamps | yes | — | Audit | |

---

## Supporting / framework tables

These are required by Laravel. Frontend does not call them directly.

### `password_reset_tokens`

| Column | Type | Notes |
|---|---|---|
| email | string PK | User email |
| token | string | Hashed reset token |
| created_at | timestamp | Expires after 60 minutes |

### `sessions`

Web session store. API uses Sanctum tokens, not this table.

### `personal_access_tokens`

Sanctum tokens for users and admins (`tokenable` morph).

| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| tokenable_type / tokenable_id | morph | `App\Models\User` or `App\Models\Admin` |
| name | text | `auth_token` or `admin_token` |
| token | string(64) unique | Hashed token |
| abilities | text | null = all |
| last_used_at / expires_at | timestamps | |
| created_at / updated_at | timestamps | |

### `notifications`

Laravel database notifications (UUID primary key).

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | Used in mark-read |
| type | string | Notification class |
| notifiable_type / notifiable_id | morph | Usually `User` |
| data | JSON text | Payload: `type`, `title_ar`, `body_ar`, extra keys |
| read_at | timestamp nullable | Null = unread |
| created_at / updated_at | timestamps | |

Typical `data` after assessment complete:

```json
{
  "type": "assessment_completed",
  "title_ar": "اكتمل تقييمك",
  "body_ar": "نتائج التقييم جاهزة للعرض.",
  "assessment_id": 12
}
```

Exact keys depend on `AssessmentCompletedNotification`. Frontend should tolerate missing English titles.

### `jobs` / `job_batches` / `failed_jobs`

Queue tables. Assessment submit dispatches:

| Queue | Job | Writes |
|---|---|---|
| `ai` | `ProcessAssessmentAI` | `assessments.ai_summary_ar`, `ai_generated_at`, `action_plans.ai_intro_ar`, `action_plan_items.ai_rephrased_*` |
| `pdf` | `GenerateAssessmentPdf` | `assessments.pdf_path` |

Without `php artisan queue:work --queue=ai,pdf,default`, scores and the rule-based plan still exist; AI and PDF stay pending.

### `cache` / `cache_locks`

Laravel cache. Not part of the product API.

---

## Scoring recap (how rows are filled)

1. User submits 18 answers → `assessment_answers`.
2. Per pillar: `raw_score = sum(3 scores)`, `percentage = raw/15*100`.
3. `overall_score = average(6 percentages)`.
4. `readiness_level = fromScore(overall_score)`.
5. Lowest 3 percentages → `is_weak = true`.
6. `ActionPlanService` creates 9 `action_plan_items`.
7. Assessment `status` becomes `completed`.
8. Queues try AI + PDF asynchronously.

Frontend **must not** recompute weak pillars or readiness as the source of truth. Display API values.

---

## What Frontend never writes

Frontend never inserts into `pillars`, `questions`, `assessment_pillar_results`, `action_plans`, or scoring columns. Those are Backend-owned.

Frontend **writes** only:

| Via API | Tables touched |
|---|---|
| Register / profile prefs | `users` |
| Start / submit assessment | `assessments`, `assessment_answers` (then Backend fills the rest) |
| PATCH action item status | `action_plan_items.status` |
| Expansion CRUD | `expansion_areas` |
| Notifications mark-read | `notifications.read_at` |
| Auth login | `personal_access_tokens` |
