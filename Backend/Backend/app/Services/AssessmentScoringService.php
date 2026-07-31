<?php

namespace App\Services;

use App\Models\Assessment;
use App\Models\AssessmentAnswer;
use App\Models\AssessmentPillarResult;

class AssessmentScoringService
{
    public function calculate(Assessment $assessment): void
    {
        // Step 1: Load all answers with their questions and pillars
        $answers = AssessmentAnswer::with('question.pillar')
            ->where('assessment_id', $assessment->id)
            ->get();

        // Step 2: Group by pillar
        $grouped = $answers->groupBy('question.pillar_id');

        // Step 3: Calculate per pillar
        $pillarResults = [];
        foreach ($grouped as $pillarId => $pillarAnswers) {
            $rawScore   = $pillarAnswers->sum('score');
            $maxScore   = 15; // 3 questions × max 5
            $percentage = round(($rawScore / $maxScore) * 100, 2);

            AssessmentPillarResult::updateOrCreate(
                ['assessment_id' => $assessment->id, 'pillar_id' => $pillarId],
                [
                    'raw_score'  => $rawScore,
                    'max_score'  => $maxScore,
                    'percentage' => $percentage,
                    'is_weak'    => false, // will be updated below
                ]
            );

            $pillarResults[$pillarId] = $percentage;
        }

        // Step 4: Calculate overall score
        $overallScore = round(array_sum($pillarResults) / count($pillarResults), 2);

        // Step 5: Determine readiness level
        $readinessLevel = match (true) {
            $overallScore < 40  => 'low',
            $overallScore < 70  => 'medium',
            default             => 'good',
        };

        // Step 6: Mark 3 weakest pillars
        asort($pillarResults);
        $weakPillarIds = array_slice(array_keys($pillarResults), 0, 3);

        AssessmentPillarResult::where('assessment_id', $assessment->id)
            ->whereIn('pillar_id', $weakPillarIds)
            ->update(['is_weak' => true]);

        // Step 7: Update assessment
        $assessment->update([
            'overall_score'   => $overallScore,
            'readiness_level' => $readinessLevel,
            'status'          => 'completed',
        ]);

        // Step 8: Generate action plan
        app(ActionPlanService::class)->generate($assessment);
    }
}
