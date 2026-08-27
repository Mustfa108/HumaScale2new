# HumaScale Documentation Index

Canonical stack: **Laravel backend** + **React frontend**. Ignore Express archives.

## Core

| File | Purpose |
|---|---|
| [PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md) | Persistent agent memory |
| [system-flow.md](system-flow.md) | **End-to-end system flow** (Backend + Frontend overview) |
| [improvements.md](improvements.md) | Current maintenance / delivery plan |
| [project-progress.md](project-progress.md) | Progress tracker |
| [backend.md](backend.md) | Backend architecture |
| [backend-schema.md](backend-schema.md) | **All tables and columns** |
| [api-documentation.md](api-documentation.md) | All API inputs / outputs |
| [frontend.md](frontend.md) | Current frontend map |
| [frontend-implementation-plan.md](frontend-implementation-plan.md) | **Frontend plan mapped to live Backend** |
| [frontend-implementation-guide.md](frontend-implementation-guide.md) | Short Cursor task list (gaps only) |

## Modules

| File | Topic |
|---|---|
| [modules/scoring.md](modules/scoring.md) | Readiness scoring rules |
| [modules/action-plan.md](modules/action-plan.md) | Action plan + item status |
| [modules/map.md](modules/map.md) | Expansion areas API |
| [modules/i18n-theme.md](modules/i18n-theme.md) | Locale + theme preferences |

## API tooling

| File | Purpose |
|---|---|
| [hoppscotch/humascale.collection.json](hoppscotch/humascale.collection.json) | Hoppscotch collection with field docs |

## Run (quick)

```bash
# Backend
cd Backend/Backend
composer install
cp .env.example .env   # set DB + FRONTEND_URL + GEMINI_API_KEY
php artisan key:generate
php artisan migrate --seed
php artisan serve
php artisan queue:work --queue=ai,pdf,default

# Frontend
cd Frontend/humascale-frontend
npm install
npm run dev
```
