<?php

namespace App\Services;

use App\Models\ActionPlan;
use App\Models\ActionPlanItem;
use App\Models\Assessment;
use App\Models\AssessmentPillarResult;

class ActionPlanService
{
    // ===== RULE-BASED ACTION RULES =====
    // All text in Arabic. These are fixed rules — AI only rephrases them later.
    private array $rules = [
        'team' => [
            'immediate' => 'حدِّد الأدوار والمسؤوليات لكل عضو في الفريق ووثِّقها في وثيقة مشتركة خلال أسبوع.',
            'medium'    => 'نفِّذ جلسة تدريبية لتعزيز مهارات التواصل والتنسيق بين أعضاء الفريق.',
            'long'      => 'ضع خطة تطوير بشري سنوية شاملة تتضمن مسارات نمو واضحة لكل عضو.',
        ],
        'funding' => [
            'immediate' => 'أعدَّ قائمة شاملة بمصادر التمويل المتاحة المحلية والدولية وقيِّم مدى أهلية منظمتك لكل منها.',
            'medium'    => 'طوِّر مقترح مشروع متكاملاً وقدِّمه على الأقل لجهتَين مانحتَين مناسبتَين.',
            'long'      => 'طوِّر استراتيجية تمويل متنوعة تشمل التبرعات، الرسوم، المنح، والشراكات المدرِّة.',
        ],
        'impact' => [
            'immediate' => 'حدِّد مؤشرات أثر واضحة وقابلة للقياس لكل نشاط رئيسي تقوم به منظمتك.',
            'medium'    => 'أنشئ نظامًا منتظمًا لجمع البيانات وقياس الأثر الفعلي على المستفيدين.',
            'long'      => 'طوِّر تقريرًا سنويًا للأثر يُشارَك مع الداعمين والشركاء والمستفيدين.',
        ],
        'partnerships' => [
            'immediate' => 'أعدَّ خريطة بالشركاء المحتملين ذوي الصلة بعملك وحدِّد أولويات التواصل معهم.',
            'medium'    => 'أبرم اتفاقيتَي تعاون رسميتَين على الأقل مع شركاء استراتيجيين.',
            'long'      => 'طوِّر شبكة شراكات استراتيجية متنوعة تشمل المستويَين المحلي والإقليمي.',
        ],
        'technology' => [
            'immediate' => 'قيِّم الأدوات الرقمية التي يستخدمها فريقك وحدِّد الفجوات التقنية الأكثر إلحاحاً.',
            'medium'    => 'تبنَّ منصة إدارة مشاريع رقمية موحدة (مثل Notion أو Trello) لتنظيم عمل الفريق.',
            'long'      => 'ضع خطة تحول رقمي شاملة تتضمن أتمتة العمليات المتكررة وتحليل البيانات.',
        ],
        'sustainability' => [
            'immediate' => 'وثِّق جميع العمليات والإجراءات الأساسية للمنظمة في دليل مكتوب ومحدَّث.',
            'medium'    => 'طوِّر نموذج عمل يضمن استمرارية الأنشطة ذاتيًا حتى في حال انقطاع التمويل الخارجي.',
            'long'      => 'أنشئ خطة استدامة مؤسسية خمسية تشمل الحوكمة والموارد البشرية والمالية.',
        ],
    ];

    private array $phaseLabels = [
        'immediate' => '0-30 يوم',
        'medium'    => '1-3 أشهر',
        'long'      => '3-6 أشهر',
    ];

    public function generate(Assessment $assessment): ActionPlan
    {
        // 1. Get 3 weakest pillars
        $weakPillars = AssessmentPillarResult::with('pillar')
            ->where('assessment_id', $assessment->id)
            ->where('is_weak', true)
            ->orderBy('percentage')
            ->get();

        // 2. Create action plan
        $actionPlan = ActionPlan::create(['assessment_id' => $assessment->id]);

        // 3. For each weak pillar, create 3 items (immediate, medium, long)
        foreach ($weakPillars as $pillarResult) {
            $pillarKey = $pillarResult->pillar->key;
            $pillarRules = $this->rules[$pillarKey] ?? null;

            if (!$pillarRules) {
                continue;
            }

            foreach (['immediate', 'medium', 'long'] as $phase) {
                ActionPlanItem::create([
                    'action_plan_id' => $actionPlan->id,
                    'pillar_id'      => $pillarResult->pillar_id,
                    'phase'          => $phase,
                    'phase_label_ar' => $this->phaseLabels[$phase],
                    'action_ar'      => $pillarRules[$phase],
                ]);
            }
        }

        return $actionPlan;
    }
}
