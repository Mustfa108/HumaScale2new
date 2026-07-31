<?php

namespace App\Enums;

enum ReadinessLevel: string
{
    case LOW = 'low';
    case MEDIUM = 'medium';
    case GOOD = 'good';

    public function labelAr(): string
    {
        return match ($this) {
            self::LOW => 'منخفض',
            self::MEDIUM => 'متوسط',
            self::GOOD => 'جيد',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::LOW => '#DC2626',
            self::MEDIUM => '#F59E0B',
            self::GOOD => '#16A34A',
        };
    }

    public static function fromScore(float $score): self
    {
        return match (true) {
            $score < 40 => self::LOW,
            $score < 70 => self::MEDIUM,
            default => self::GOOD,
        };
    }
}
