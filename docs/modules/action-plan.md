# Action plan module

## Generation

`ActionPlanService` creates 9 items: 3 weakest pillars × 3 phases (`immediate`, `medium`, `long`).

Each item includes rule text + KPI in AR and EN. Status defaults to `not_started`.

## Item status API

`PATCH /api/action-plan/items/{id}`

| Field | Type | Required | Values |
|---|---|---|---|
| status | string | yes | `not_started`, `in_progress`, `completed` |

Success example:

```json
{
  "success": true,
  "message": "تم تحديث حالة المهمة بنجاح.",
  "data": {
    "id": 12,
    "status": "completed",
    "status_ar": "مكتملة",
    "status_en": "Completed"
  }
}
```

Errors: 401 unauthenticated, 403 not owner, 404 missing, 422 invalid status.

## Frontend

Update `ActionPlanView.jsx`. Display `ai_rephrased_*` when present; always show rule `kpi_*`.
