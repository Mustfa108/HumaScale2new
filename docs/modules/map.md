# Expansion areas (map)

Table `expansion_areas` belongs to the authenticated user.

## Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| id | integer | — | DB id |
| name_ar | string | yes | Arabic label |
| name_en | string | no | English label |
| lat | float | yes | −90 to 90 |
| lng | float | yes | −180 to 180 |
| notes | string | no | max 2000 |
| created_at / updated_at | datetime | — | |

## Endpoints

All require Sanctum.

- `GET /api/expansion-areas` → `{ items: [...] }`
- `POST /api/expansion-areas`
- `PUT|PATCH /api/expansion-areas/{id}`
- `DELETE /api/expansion-areas/{id}`

Dashboard includes `expansion_areas_count` for a badge.

Frontend: new map page, Leaflet or equivalent, CRUD around markers. Not implemented in React yet.
