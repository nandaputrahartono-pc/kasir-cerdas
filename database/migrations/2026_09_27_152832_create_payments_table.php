<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('payment_method')->default('cash');
            $table->decimal('amount_paid', 15, 2)->default(0);
            $table->decimal('change_given', 15, 2)->default(0);
            $table->string('reference_no')->nullable();
            $table->string('status')->default('paid');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
