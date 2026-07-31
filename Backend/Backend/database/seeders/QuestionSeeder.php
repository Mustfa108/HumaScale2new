<?php

namespace Database\Seeders;

use App\Models\Pillar;
use App\Models\Question;
use Illuminate\Database\Seeder;

class QuestionSeeder extends Seeder
{
    public function run(): void
    {
        $questions = [
            // محور الفريق
            ['pillar_key' => 'team', 'order' => 1,
             'text_ar' => 'هل يمتلك فريقك أدواراً ومسؤوليات محددة ومكتوبة بوضوح لكل عضو؟'],
            ['pillar_key' => 'team', 'order' => 2,
             'text_ar' => 'هل توجد آليات واضحة ومعتمدة لاتخاذ القرار داخل الفريق؟'],
            ['pillar_key' => 'team', 'order' => 3,
             'text_ar' => 'هل يمتلك الفريق خطة لتطوير الكفاءات البشرية وتنمية المهارات باستمرار؟'],

            // محور التمويل
            ['pillar_key' => 'funding', 'order' => 1,
             'text_ar' => 'هل تمتلك منظمتك مصادر تمويل متنوعة وغير معتمدة على مصدر واحد فقط؟'],
            ['pillar_key' => 'funding', 'order' => 2,
             'text_ar' => 'هل لديكم ميزانية سنوية واضحة ومعتمدة للعام القادم؟'],
            ['pillar_key' => 'funding', 'order' => 3,
             'text_ar' => 'هل نجحتم في تقديم واستكمال مقترح تمويلي واحد على الأقل خلال العام الماضي؟'],

            // محور الأثر
            ['pillar_key' => 'impact', 'order' => 1,
             'text_ar' => 'هل حددتم مؤشرات أثر واضحة وقابلة للقياس لجميع أنشطتكم الرئيسية؟'],
            ['pillar_key' => 'impact', 'order' => 2,
             'text_ar' => 'هل تجمعون بيانات منتظمة ومنهجية لتقييم الأثر الفعلي على المستفيدين؟'],
            ['pillar_key' => 'impact', 'order' => 3,
             'text_ar' => 'هل تُعِدُّون تقارير أثر دورية وتشاركونها مع الجهات المعنية والداعمين؟'],

            // محور الشراكات
            ['pillar_key' => 'partnerships', 'order' => 1,
             'text_ar' => 'هل لديكم شراكات رسمية موثقة مع منظمات أو جهات أخرى؟'],
            ['pillar_key' => 'partnerships', 'order' => 2,
             'text_ar' => 'هل تتعاونون بفاعلية مع جهات حكومية أو قطاع خاص لتحقيق أهدافكم؟'],
            ['pillar_key' => 'partnerships', 'order' => 3,
             'text_ar' => 'هل لديكم استراتيجية واضحة لبناء شبكة شراكات جديدة وتطويرها مستقبلاً؟'],

            // محور التقنية
            ['pillar_key' => 'technology', 'order' => 1,
             'text_ar' => 'هل توظف منظمتك أدوات رقمية لإدارة المشاريع وتنسيق عمل الفريق يومياً؟'],
            ['pillar_key' => 'technology', 'order' => 2,
             'text_ar' => 'هل لديكم حضور رقمي فاعل (موقع إلكتروني أو منصات تواصل) لخدمة مستفيديكم؟'],
            ['pillar_key' => 'technology', 'order' => 3,
             'text_ar' => 'هل تستخدمون البيانات والتحليلات الرقمية بشكل منتظم في اتخاذ قراراتكم؟'],

            // محور الاستدامة
            ['pillar_key' => 'sustainability', 'order' => 1,
             'text_ar' => 'هل وثَّقتم السياسات والإجراءات والعمليات الأساسية للمنظمة بشكل مكتوب؟'],
            ['pillar_key' => 'sustainability', 'order' => 2,
             'text_ar' => 'هل لديكم نموذج عمل واضح يضمن استمرارية الأنشطة ذاتيًا دون اعتماد كامل على التمويل الخارجي؟'],
            ['pillar_key' => 'sustainability', 'order' => 3,
             'text_ar' => 'هل يوجد لديكم خطة لضمان استمرار العمل المؤسسي في حالة تغيير الأعضاء أو القيادة الرئيسية؟'],
        ];

        foreach ($questions as $q) {
            $pillar = Pillar::where('key', $q['pillar_key'])->first();

            if ($pillar) {
                Question::updateOrCreate(
                    ['pillar_id' => $pillar->id, 'display_order' => $q['order']],
                    [
                        'text_ar'       => $q['text_ar'],
                        'display_order' => $q['order'],
                        'is_active'     => true,
                    ]
                );
            }
        }
    }
}
