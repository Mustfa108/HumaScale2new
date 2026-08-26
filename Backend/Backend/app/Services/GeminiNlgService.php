<?php

namespace App\Services;

use App\Models\Assessment;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiNlgService
{
    private string $apiKey;

    private string $model;

    private string $apiUrl;

    public function __construct()
    {
        $this->apiKey = (string) config('gemini.api_key');
        $this->model = (string) config('gemini.model', 'gemini-2.0-flash');
        $this->apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent";
    }

    /**
     * Generate Arabic analytical summary. Must not invent new scores or priorities.
     */
    public function generateAssessmentSummary(Assessment $assessment): ?string
    {
        $pillarResults = $assessment->pillarResults()->with('pillar')->get();
        $weakPillars = $pillarResults->where('is_weak', true)->pluck('pillar.name_ar')->join(' و');

        $readinessAr = match ($assessment->readiness_level) {
            'low' => 'منخفض',
            'medium' => 'متوسط',
            'good' => 'جيد',
            default => 'غير محدد',
        };

        $pillarLines = $pillarResults->map(fn ($r) => "  - {$r->pillar->name_ar}: {$r->percentage}%"
        )->join("\n");

        $prompt = <<<PROMPT
أنت مستشار تنظيمي محترف متخصص في دعم منظمات المجتمع المدني والمبادرات المجتمعية.

مهم: النتائج والمستوى وأضعف المحاور محددة مسبقاً بنظام قواعد ثابت. اشرحها فقط. لا تغيّر الأرقام ولا تقترح محاور ضعف بديلة ولا تغيّر مستوى الجاهزية.

بناءً على نتائج تقييم الاستعداد للنمو التالية:

المستوى العام: {$readinessAr} ({$assessment->overall_score}%)

نتائج المحاور الستة:
{$pillarLines}

المحاور الأضعف التي تحتاج أولوية تطوير: {$weakPillars}

المطلوب: اكتب ملخصًا تحليليًا احترافيًا من 3 إلى 4 جمل باللغة العربية الفصيحة يوضح:
1. الوضع الراهن للمنظمة بشكل موضوعي
2. نقاط القوة البارزة إن وُجدت
3. أسباب أولوية تطوير المحاور الضعيفة المعطاة أعلاه فقط

الأسلوب: مهني، داعم، موجَّه نحو الحلول، ومحفِّز على العمل.
أجب بالملخص مباشرةً دون أي مقدمة أو تنسيق إضافي.
PROMPT;

        return $this->callGemini($prompt);
    }

    /**
     * Rephrase action texts only. Do not invent KPIs, phases, or priorities.
     *
     * @param  array<int, array{id:int, phase_label_ar:string, pillar_name_ar:string, action_ar:string}>  $actions
     * @return array<int, array{ai_rephrased_ar?: string}>|null
     */
    public function rephraseActionPlanItems(array $actions): ?array
    {
        $actionsList = collect($actions)->map(fn ($a, $i) => ($i + 1).". [{$a['phase_label_ar']} - {$a['pillar_name_ar']}]: {$a['action_ar']}"
        )->join("\n");

        $prompt = <<<PROMPT
أنت مستشار تنظيمي محترف. أعد صياغة الإجراءات التنموية التالية بأسلوب تحفيزي وإنساني وعملي باللغة العربية.

قيود صارمة:
- أعد صياغة نص الإجراء فقط.
- لا تقترح مؤشرات أداء (KPI).
- لا تغيّر المرحلة الزمنية ولا المحور.
- لا تضف إجراءات جديدة.

الإجراءات:
{$actionsList}

أجب بصيغة JSON صالحة فقط، بدون أي نص إضافي أو ```json أو أي تنسيق، على الشكل الآتي:
[
  {"ai_rephrased_ar": "..."},
  {"ai_rephrased_ar": "..."}
]

يجب أن يكون عدد العناصر في المصفوفة مساويًا لعدد الإجراءات المدخلة.
PROMPT;

        $response = $this->callGemini($prompt);

        if (! $response) {
            return null;
        }

        try {
            $clean = trim(preg_replace('/^```json|```$/m', '', $response) ?? $response);

            return json_decode($clean, true, 512, JSON_THROW_ON_ERROR);
        } catch (\Throwable $e) {
            Log::channel('ai')->error('Gemini JSON parse failed', [
                'response' => $response,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    private function callGemini(string $prompt): ?string
    {
        if ($this->apiKey === '' || $this->apiKey === 'your_gemini_api_key_here') {
            Log::channel('ai')->warning('Gemini API key missing; skipping AI call.');

            return null;
        }

        $startTime = microtime(true);

        try {
            $response = Http::timeout(60)
                ->post("{$this->apiUrl}?key={$this->apiKey}", [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => $prompt],
                            ],
                        ],
                    ],
                    'generationConfig' => [
                        'temperature' => 0.7,
                        'maxOutputTokens' => 1024,
                    ],
                ]);

            $duration = round((microtime(true) - $startTime) * 1000);

            if ($response->failed()) {
                Log::channel('ai')->error('Gemini API request failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'duration' => "{$duration}ms",
                ]);

                return null;
            }

            $text = $response->json('candidates.0.content.parts.0.text');

            Log::channel('ai')->info('Gemini API call success', [
                'duration' => "{$duration}ms",
                'response_chars' => strlen($text ?? ''),
            ]);

            return $text;
        } catch (\Throwable $e) {
            Log::channel('ai')->error('Gemini API exception', [
                'message' => $e->getMessage(),
            ]);

            return null;
        }
    }
}
