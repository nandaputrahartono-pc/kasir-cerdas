<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cashier_shifts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->datetime('opened_at');
            $table->datetime('closed_at')->nullable();
            $table->decimal('initial_cash', 15, 2)->default(0);
            $table->decimal('system_total_cash', 15, 2)->default(0);
            $table->decimal('actual_cash', 15, 2)->nullable();
            $table->decimal('difference', 15, 2)->nullable();
            $table->text('notes')->nullable();
            $table->string('status')->default('open');
            $table->timestamps();

            $table->index(['team_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cashier_shifts');
    }
};
