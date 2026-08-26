# Scoring module

Official readiness:

| Overall % | Level | AR | EN |
|---|---|---|---|
| 0–49 | `low` | منخفضة / منخفض | Low |
| 50–69 | `medium` | متوسطة / متوسط | Medium |
| 70–100 | `good` | جيدة / جيد | Good |

Source of truth: `App\Enums\ReadinessLevel::fromScore()`.

Per pillar: `(sum of 3 scores / 15) * 100`. Overall: average of 6 pillar percentages.

Weak pillars: lowest 3 percentages (`is_weak = true`). Ties keep `asort` order then first 3 keys.

Frontend must use the same 50/70 cutoffs in `readinessFromScore` until it trusts API `readiness_level` only.
