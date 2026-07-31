<?php

namespace Database\Seeders;

use App\Models\Pillar;
use Illuminate\Database\Seeder;

class PillarSeeder extends Seeder
{
    public function run(): void
    {
        $pillars = [
            [
                'key'            => 'team',
                'name_ar'        => 'الفريق',
                'description_ar' => 'يقيس متانة الفريق وجاهزيته البشرية والمؤسسية للنمو',
                'display_order'  => 1,
            ],
            [
                'key'            => 'funding',
                'name_ar'        => 'التمويل',
                'description_ar' => 'يقيس استدامة مصادر التمويل وتنوعها وقدرة المنظمة على الاستمرار ماليًا',
                'display_order'  => 2,
            ],
            [
                'key'            => 'impact',
                'name_ar'        => 'الأثر',
                'description_ar' => 'يقيس وضوح الأثر المُحقَّق وآليات قياسه وتوثيقه',
                'display_order'  => 3,
            ],
            [
                'key'            => 'partnerships',
                'name_ar'        => 'الشراكات',
                'description_ar' => 'يقيس عمق الشبكة التعاونية للمنظمة ومستوى الشراكات الاستراتيجية',
                'display_order'  => 4,
            ],
            [
                'key'            => 'technology',
                'name_ar'        => 'التقنية',
                'description_ar' => 'يقيس مستوى توظيف الأدوات الرقمية في إدارة العمل المؤسسي',
                'display_order'  => 5,
            ],
            [
                'key'            => 'sustainability',
                'name_ar'        => 'الاستدامة',
                'description_ar' => 'يقيس قدرة المنظمة على الاستمرارية المؤسسية على المدى البعيد',
                'display_order'  => 6,
            ],
        ];

        foreach ($pillars as $pillar) {
            Pillar::updateOrCreate(['key' => $pillar['key']], $pillar);
        }
    }
}
