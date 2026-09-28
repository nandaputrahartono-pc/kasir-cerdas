<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cash_flows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type');
            $table->string('category');
            $table->decimal('amount', 15, 2)->default(0);
            $table->text('description');
            $table->string('receipt_image')->nullable();
            $table->date('flow_date');
            $table->timestamps();

            $table->index(['team_id', 'type']);
            $table->index(['team_id', 'flow_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_flows');
    }
};
