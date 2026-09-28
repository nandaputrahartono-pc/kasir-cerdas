<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CashFlow extends Model
{
    use HasFactory;

    protected $fillable = [
        'team_id',
        'user_id',
        'type',
        'category',
        'amount',
        'description',
        'receipt_image',
        'flow_date',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'flow_date' => 'date',
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
