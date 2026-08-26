# Locale and theme

Stored on `users`:

| Column | Values | Default |
|---|---|---|
| locale | `ar`, `en` | `ar` |
| theme | `light`, `dark`, `system` | `system` |

## API

`GET /api/profile/preferences`  
`PATCH /api/profile/preferences` (send one or both keys)

Also returned on `GET /api/auth/me` and dashboard `preferences`.

## Frontend

- Locale selects `*_ar` vs `*_en` fields and `dir`.
- Theme only affects CSS (`dark` class). Backend does not render UI.
- Persist to API after toggle so devices stay in sync.
