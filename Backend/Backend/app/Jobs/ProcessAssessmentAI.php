<?php

namespace App\Jobs;

use App\Models\ActionPlanItem;
use App\Models\Assessment;
use App\Notifications\AssessmentCompletedNotification;
use App\Services\GeminiNlgService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessAssessmentAI implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 120;
    public int $tries   = 3;
    public array $backoff = [30, 60];

    public function __construct(public Assessment $assessment)
    {
    }

    public function handle(GeminiNlgService $gemini): void
    {
        // Step 1: Generate assessment summary
        $summary = $gemini->generateAssessmentSummary($this->assessment);

        if ($summary) {
            $this->assessment->update([
                'ai_summary_ar'   => $summary,
                'ai_generated_at' => now(),
            ]);
        }

        // Step 2: Rephrase action plan items
        $items = ActionPlanItem::with(['actionPlan', 'pillar'])
            ->whereHas('actionPlan', fn ($q) => $q->where('assessment_id', $this->assessment->id))
            ->get();

        if ($items->isEmpty()) {
            return;
        }

        $actionsForAi = $items->map(fn ($item) => [
            'id'             => $item->id,
            'phase_label_ar' => $item->phase_label_ar,
            'pillar_name_ar' => $item->pillar->name_ar,
            'action_ar'      => $item->action_ar,
        ])->toArray();

        $rephrased = $gemini->rephraseActionPlanItems($actionsForAi);

        if ($rephrased) {
            foreach ($items as $index => $item) {
                if (isset($rephrased[$index])) {
                    $item->update([
                        'ai_rephrased_ar' => $rephrased[$index]['ai_rephrased_ar'] ?? null,
                        'kpi_ar'          => $rephrased[$index]['kpi_ar'] ?? null,
                    ]);
                }
            }
        }

        // Step 3: Notify user
        $this->assessment->user->notify(new AssessmentCompletedNotification($this->assessment));
    }

    public function failed(\Throwable $exception): void
    {
        Log::channel('ai')->error('ProcessAssessmentAI job failed', [
            'assessment_id' => $this->assessment->id,
            'error'         => $exception->getMessage(),
        ]);
        
        // Ensure the user still gets notified that the assessment is ready (without AI text)
        $this->assessment->user->notify(new AssessmentCompletedNotification($this->assessment));
    }
}
