<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CashierShift extends Model
{
    use HasFactory;

    protected $fillable = [
        'team_id',
        'user_id',
        'opened_at',
        'closed_at',
        'initial_cash',
        'system_total_cash',
        'actual_cash',
        'difference',
        'notes',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'opened_at' => 'datetime',
            'closed_at' => 'datetime',
            'initial_cash' => 'decimal:2',
            'system_total_cash' => 'decimal:2',
            'actual_cash' => 'decimal:2',
            'difference' => 'decimal:2',
        ];
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
