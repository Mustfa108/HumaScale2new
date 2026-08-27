# Backend Architecture

**Last Updated:** 2026-08-27  
**Root:** `Backend/Backend`  
**Tables/columns:** [`backend-schema.md`](backend-schema.md)  
**HTTP contract:** [`api-documentation.md`](api-documentation.md)

## Stack

Laravel 13, PHP 8.3, Sanctum, DomPDF, Gemini HTTP, MySQL in production, SQLite in tests.

## Request flow

```
API route (routes/api.php)
  → FormRequest validation
  → Policy / ownership check
  → Controller (thin)
  → Service / Action (business)
  → ApiResponse helper
```

## Scoring

- Single source: `App\Enums\ReadinessLevel::fromScore()`
- Used by `AssessmentScoringService`
- Thresholds: `<50` low, `<70` medium, else good
- Weakest 3 pillars (`is_weak`) feed `ActionPlanService`

## Action plan

- Rules live in `ActionPlanService` (AR + EN + KPI per phase)
- Item `status`: `not_started | in_progress | completed`
- AI may store `ai_rephrased_ar` only; KPIs never come from Gemini

## Jobs

| Queue | Job | Purpose |
|---|---|---|
| `ai` | `ProcessAssessmentAI` | Summary + rephrase |
| `pdf` | `GenerateAssessmentPdf` | DomPDF file |

Run: `php artisan queue:work --queue=ai,pdf,default`

## Security

- AssessmentPolicy for view/submit
- Expansion areas owned by `user_id`
- Action item status requires owning assessment
- CORS via `config/cors.php` + `FRONTEND_URL`
- PDF via authenticated download only (`GET /api/report/{id}/download`)
- Submit wrapped in `DB::transaction`

## Seeders

`php artisan migrate --seed` creates 6 pillars, 18 questions, admin account.

## New tables / columns (2026-08-26)

- `users.locale`, `users.theme`
- `pillars.name_en`, `pillars.description_en`
- `questions.text_en`
- `action_plan_items`: `phase_label_en`, `action_en`, `kpi_en`, `ai_rephrased_en`, `status`
- `expansion_areas`

## Tests

```bash
php artisan test
```

Covers thresholds, weakest pillars, submit validation, ownership, item status, expansion areas, preferences.
