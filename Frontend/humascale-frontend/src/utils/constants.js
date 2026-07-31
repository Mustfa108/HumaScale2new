/**
 * Static labels and helper lookups for the 6 readiness pillars.
 * Mirrors backend `PillarKey` enum.
 */
export const PILLAR_LABELS_AR = {
  team: 'الفريق',
  funding: 'التمويل',
  impact: 'الأثر',
  partnerships: 'الشراكات',
  technology: 'التقنية',
  sustainability: 'الاستدامة',
};

export const PILLAR_DESCRIPTIONS_AR = {
  team: 'مدى تنظيم الفريق وكفاءته وقدرته على تنفيذ المهام',
  funding: 'مدى استقرار التمويل ومصادره وتنوعه',
  impact: 'مدى تأثير المنظمة أو المشروع في المستفيدين',
  partnerships: 'قوة شبكة الشراكات والتحالفات',
  technology: 'مدى توظيف التقنية وأدوات العمل',
  sustainability: 'مدى قدرة المنظمة على الاستمرارية والتوسع',
};

export const PILLARS = [
  'team',
  'funding',
  'impact',
  'partnerships',
  'technology',
  'sustainability',
];

/**
 * Score → readiness level. Mirrors backend `ReadinessLevel::fromScore`.
 */
export const READINESS_LEVELS = {
  low: {
    key: 'low',
    labelAr: 'منخفضة',
    shortAr: 'منخفض',
    color: '#DC2626',
    bgClass: 'bg-red-50',
    textClass: 'text-red-700',
    badgeClass: 'badge-low',
    description: 'الفريق في مرحلة مبكرة ويحتاج إلى بناء الأساسيات قبل التوسع.',
  },
  medium: {
    key: 'medium',
    labelAr: 'متوسطة',
    shortAr: 'متوسط',
    color: '#F59E0B',
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-700',
    badgeClass: 'badge-medium',
    description: 'لدى الفريق مقومات جيدة لكنه يحتاج إلى معالجة فجوات محددة قبل التوسع.',
  },
  good: {
    key: 'good',
    labelAr: 'جيدة',
    shortAr: 'جيد',
    color: '#16A34A',
    bgClass: 'bg-emerald-50',
    textClass: 'text-emerald-700',
    badgeClass: 'badge-good',
    description: 'الفريق جاهز للتوسع مع توصيات لتعزيز الأداء.',
  },
};

export function readinessFromScore(score) {
  if (score < 40) return READINESS_LEVELS.low;
  if (score < 70) return READINESS_LEVELS.medium;
  return READINESS_LEVELS.good;
}

export function readinessFromKey(key) {
  return READINESS_LEVELS[key] || READINESS_LEVELS.low;
}

/**
 * Likert scale shown to the user on each question.
 * 1 = ضعيف جداً, 5 = ممتاز
 */
export const LIKERT_SCALE = [
  { value: 1, labelAr: 'ضعيف جداً', shortAr: 'ضعيف جداً', color: '#DC2626' },
  { value: 2, labelAr: 'ضعيف', shortAr: 'ضعيف', color: '#F97316' },
  { value: 3, labelAr: 'متوسط', shortAr: 'متوسط', color: '#EAB308' },
  { value: 4, labelAr: 'جيد', shortAr: 'جيد', color: '#22C55E' },
  { value: 5, labelAr: 'ممتاز', shortAr: 'ممتاز', color: '#16A34A' },
];

export const PHASE_LABELS_AR = {
  immediate: '0-30 يوم',
  medium: '1-3 أشهر',
  long: '3-6 أشهر',
};
