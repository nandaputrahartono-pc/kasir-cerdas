<?php

use App\Http\Controllers\CashFlowController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DiningTableController;
use App\Http\Controllers\PosController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ShiftController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::prefix('{current_team}')
    ->middleware(['auth', 'verified', EnsureTeamMembership::class])
    ->group(function () {
        Route::get('dashboard', DashboardController::class)->name('dashboard');

        // POS Kasir Terminal
        Route::get('pos', [PosController::class, 'index'])->name('pos.index');
        Route::post('pos/order', [PosController::class, 'store'])->name('pos.order.store');
        Route::patch('pos/orders/{order}/status', [PosController::class, 'updateStatus'])->name('pos.order.status');

        // Products & Dishes CRUD
        Route::resource('products', ProductController::class)->except(['create', 'show', 'edit']);

        // Dining Tables CRUD
        Route::resource('tables', DiningTableController::class)->except(['create', 'show', 'edit']);

        // Cash Flow (Pemasukan & Pengeluaran)
        Route::resource('cash-flows', CashFlowController::class)->only(['index', 'store', 'destroy']);

        // Reports & Laba Rugi
        Route::get('reports', [ReportController::class, 'index'])->name('reports.index');

        // Cashier Shift (Buka / Tutup Kas)
        Route::post('shifts/start', [ShiftController::class, 'store'])->name('shifts.start');
        Route::patch('shifts/{shift}/close', [ShiftController::class, 'update'])->name('shifts.close');
    });

Route::middleware(['auth'])->group(function () {
    Route::post('invitations/{invitation}/accept', [TeamInvitationController::class, 'accept'])->name('invitations.accept');
    Route::delete('invitations/{invitation}', [TeamInvitationController::class, 'decline'])->name('invitations.decline');
});

require __DIR__.'/settings.php';
