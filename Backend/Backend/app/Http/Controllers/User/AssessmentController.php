<?php

namespace App\Http\Controllers\User;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Assessment\SubmitAssessmentRequest;
use App\Jobs\GenerateAssessmentPdf;
use App\Jobs\ProcessAssessmentAI;
use App\Models\Assessment;
use App\Models\AssessmentAnswer;
use App\Models\Pillar;
use App\Notifications\AssessmentCompletedNotification;
use App\Services\AssessmentScoringService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssessmentController extends Controller
{
    public function getQuestions(): JsonResponse
    {
        $pillars = Pillar::with(['questions' => function ($query) {
            $query->where('is_active', true)->orderBy('display_order');
        }])
            ->orderBy('display_order')
            ->get();

        $totalQuestions = $pillars->sum(fn ($p) => $p->questions->count());

        $data = [
            'total_questions' => $totalQuestions,
            'pillars'         => $pillars->map(fn ($pillar) => [
                'id'             => $pillar->id,
                'key'            => $pillar->key,
                'name_ar'        => $pillar->name_ar,
                'description_ar' => $pillar->description_ar,
                'questions'      => $pillar->questions->map(fn ($q) => [
                    'id'            => $q->id,
                    'text_ar'       => $q->text_ar,
                    'display_order' => $q->display_order,
                ]),
            ]),
        ];

        return ApiResponse::success($data, 'تم تحميل أسئلة التقييم بنجاح.');
    }

    public function start(Request $request): JsonResponse
    {
        $user = $request->user();

        // Check for existing in_progress assessment
        $existing = Assessment::where('user_id', $user->id)
            ->where('status', 'in_progress')
            ->first();

        if ($existing) {
            return ApiResponse::success([
                'assessment_id' => $existing->id,
                'status'        => 'in_progress',
            ], 'لديك تقييم قيد التنفيذ.');
        }

        $assessment = Assessment::create([
            'user_id' => $user->id,
            'status'  => 'in_progress',
        ]);

        return ApiResponse::success([
            'assessment_id' => $assessment->id,
        ], 'تم بدء التقييم بنجاح.', 201);
    }

    public function submit(SubmitAssessmentRequest $request, int $id): JsonResponse
    {
        $user       = $request->user();
        $assessment = Assessment::findOrFail($id);

        // Validate ownership
        if ($user->cannot('submit', $assessment)) {
            return ApiResponse::error('غير مصرح لك بتقديم هذا التقييم.', 403);
        }

        if ($assessment->status !== 'in_progress') {
            return ApiResponse::error('تم تقديم هذا التقييم مسبقاً.', 422);
        }

        // Insert all 18 answers (upsert to allow re-submission)
        foreach ($request->answers as $answer) {
            AssessmentAnswer::updateOrCreate(
                [
                    'assessment_id' => $assessment->id,
                    'question_id'   => $answer['question_id'],
                ],
                [
                    'score' => $answer['score'],
                ]
            );
        }

        // Calculate scores
        app(AssessmentScoringService::class)->calculate($assessment);

        // Dispatch AI processing and PDF generation
        ProcessAssessmentAI::dispatch($assessment)->onQueue('ai');
        GenerateAssessmentPdf::dispatch($assessment)->onQueue('pdf');

        return ApiResponse::success(
            ['assessment_id' => $assessment->id],
            'تم إرسال إجاباتك بنجاح. جاري تحليل النتائج، ستصلك إشعار عند الاكتمال.'
        );
    }

    public function results(Request $request, int $id): JsonResponse
    {
        $user       = $request->user();
        $assessment = Assessment::with(['pillarResults.pillar', 'actionPlan.items.pillar'])->findOrFail($id);

        if ($user->cannot('view', $assessment)) {
            return ApiResponse::error('غير مصرح لك بعرض هذا التقييم.', 403);
        }

        if ($assessment->status !== 'completed') {
            return ApiResponse::error('لم يكتمل تحليل التقييم بعد، يرجى الانتظار.', 422);
        }

        $pillarResults = $assessment->pillarResults->sortBy('pillar.display_order')->map(fn ($r) => [
            'pillar_id'      => $r->pillar_id,
            'pillar_key'     => $r->pillar->key,
            'pillar_name_ar' => $r->pillar->name_ar,
            'raw_score'      => $r->raw_score,
            'max_score'      => $r->max_score,
            'percentage'     => $r->percentage,
            'is_weak'        => $r->is_weak,
        ])->values();

        $actionPlanData = null;
        if ($assessment->actionPlan) {
            $groupedItems = $assessment->actionPlan->items->groupBy('phase');
            $phases       = [];

            foreach (['immediate', 'medium', 'long'] as $phase) {
                $labelAr = match ($phase) {
                    'immediate' => '0-30 يوم',
                    'medium'    => '1-3 أشهر',
                    'long'      => '3-6 أشهر',
                };

                $items = ($groupedItems[$phase] ?? collect())->map(fn ($item) => [
                    'pillar_name_ar'  => $item->pillar->name_ar,
                    'action_ar'       => $item->action_ar,
                    'ai_rephrased_ar' => $item->ai_rephrased_ar,
                    'kpi_ar'          => $item->kpi_ar,
                ])->values();

                $phases[$phase] = [
                    'label_ar' => $labelAr,
                    'items'    => $items,
                ];
            }

            $actionPlanData = [
                'id'          => $assessment->actionPlan->id,
                'ai_intro_ar' => $assessment->actionPlan->ai_intro_ar,
                'phases'      => $phases,
            ];
        }

        return ApiResponse::success([
            'assessment' => [
                'id'                 => $assessment->id,
                'status'             => $assessment->status,
                'overall_score'      => $assessment->overall_score,
                'readiness_level'    => $assessment->readiness_level,
                'readiness_level_ar' => $assessment->readiness_level_ar,
                'readiness_color'    => $assessment->readiness_color,
                'ai_summary_ar'      => $assessment->ai_summary_ar,
                'ai_ready'           => $assessment->ai_ready,
                'pdf_ready'          => $assessment->pdf_ready,
                'created_at'         => $assessment->created_at,
            ],
            'pillar_results' => $pillarResults,
            'action_plan'    => $actionPlanData,
        ], 'تم تحميل نتائج التقييم بنجاح.');
    }

    public function history(Request $request): JsonResponse
    {
        $assessments = Assessment::where('user_id', $request->user()->id)
            ->where('status', 'completed')
            ->orderByDesc('created_at')
            ->paginate(10);

        $items = collect($assessments->items())->map(fn ($a) => [
            'id'                 => $a->id,
            'overall_score'      => $a->overall_score,
            'readiness_level'    => $a->readiness_level,
            'readiness_level_ar' => $a->readiness_level_ar,
            'created_at'         => $a->created_at,
            'pdf_ready'          => $a->pdf_ready,
        ]);

        return ApiResponse::paginated($assessments, 'تم تحميل سجل التقييمات بنجاح.');
    }
}
