# HumaScale — Project Context

**Last Updated:** 2026-08-27

## Overview

HumaScale is a readiness assessment platform for nonprofit teams. Users answer **18 questions** across **6 pillars**, a **rule-based engine** scores results and builds a 3-phase action plan from the **3 weakest pillars**, and optional **Gemini AI** only rephrases text / writes summaries.

## Canonical Stack (source of truth)

| Layer | Path | Stack |
|---|---|---|
| Backend | `Backend/Backend` | Laravel 13, Sanctum, DomPDF, Gemini HTTP, queues |
| Frontend | `Frontend/humascale-frontend` | React 18, Vite 5, Tailwind, Axios, Recharts |
| Docs | `docs/` | API, FE guide, modules, Hoppscotch |

**Start here for flow:** [`docs/system-flow.md`](docs/system-flow.md)

**Do not** treat Express / `humascale-full (2)` as the live app.

## Business Rules

1. **6 pillars:** team, funding, impact, partnerships, technology, sustainability (3 questions each).
2. **Scores:** integer 1–5 per question.
3. **Readiness thresholds (official):** `0–49` low, `50–69` medium, `70–100` good.
4. **Weak pillars:** lowest 3 by percentage → action plan source.
5. **Action plan phases:** immediate (0–30 days), medium (1–3 months), long (3–6 months).
6. **AI is non-decisive:** never changes score, readiness level, weak pillars, phases, or KPIs. KPIs come from rules. AI may only summarize and rephrase action text.
7. **Ownership:** users only access their own assessments / expansion areas / action items.

## Active Work

- **Frontend in progress** on `Frontend/humascale-frontend`: readiness 50/70, i18n + theme, action-item status, expansion map, envelope unwrap, auth token/`me` fixes.
- Plan: `docs/frontend-implementation-plan.md`. Laravel contracts stay unchanged.
- Requirements Word file is functional only; **Laravel routes/fields are the live contract**.

## Key Backend Paths

- Scoring: `app/Services/AssessmentScoringService.php`, `app/Enums/ReadinessLevel.php`
- Action plan: `app/Services/ActionPlanService.php`
- AI: `app/Services/GeminiNlgService.php`, `app/Jobs/ProcessAssessmentAI.php`
- Routes: `routes/api.php`
- Seeders: `database/seeders/{Pillar,Question,Admin}Seeder.php`

## Known Decisions

- API returns bilingual fields (`*_ar` / `*_en`); frontend picks language.
- Theme preference stored on `users.theme` (`light|dark|system`); UI is frontend-only.
- PDF download must go through authenticated `GET /api/report/{id}/download` (no public storage URL for FE).
- Frontend work is documented in `docs/frontend-implementation-plan.md` (full plan) and `docs/frontend-implementation-guide.md` (short task list).
- `GET /api/auth/me` is a flat user object (no `ApiResponse` envelope). User login token key is `access_token`; admin login token key is `token`.
- `GET /api/admin/me` and `POST /api/admin/logout` are **not** implemented — persist admin from login and clear the token client-side.
