# HumaScale Improvements Plan (Laravel)

**Last Updated:** 2026-08-26  
**Scope this cycle:** Backend implementation + documentation. Frontend code deferred (see `frontend-implementation-guide.md`).

## Official decisions

- Readiness: **0–49 low**, **50–69 medium**, **70–100 good**
- AI: summary + action rephrase only; **KPIs from rules**
- Features prepared in Backend: action-item status, AR/EN content, locale/theme prefs, expansion areas

## Backend phases

| Phase | Work | Status |
|---|---|---|
| B | Thresholds 50/70, submit transaction, CORS, PDF hardening, rule KPIs | Done |
| C | Action plan item `status` + PATCH API | Done |
| D | `*_en` fields + seeders + preferences API | Done |
| E | Expansion areas CRUD | Done |
| F | Theme preference column (with D) | Done |
| G | Feature tests | Done |
| Docs | PROJECT_CONTEXT, API, Hoppscotch, FE guide | Done |

## Frontend (later)

Follow [`frontend-implementation-guide.md`](frontend-implementation-guide.md). Do not change Backend contracts unless this plan is updated.

## Out of scope (this cycle)

- Editing React/JSX/CSS
- Rebuilding from Express dump
- HttpOnly cookie auth migration
