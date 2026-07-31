<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActionPlanItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'action_plan_id',
        'pillar_id',
        'phase',
        'phase_label_ar',
        'action_ar',
        'ai_rephrased_ar',
        'kpi_ar',
    ];

    public function actionPlan(): BelongsTo
    {
        return $this->belongsTo(ActionPlan::class);
    }

    public function pillar(): BelongsTo
    {
        return $this->belongsTo(Pillar::class);
    }
}
