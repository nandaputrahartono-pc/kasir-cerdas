<?php

namespace App\Http\Controllers;

use App\Models\CashierShift;
use App\Models\Team;
use Illuminate\Http\Request;

class ShiftController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'initial_cash' => ['required', 'numeric', 'min:0'],
        ]);

        $team = Team::where('slug', $request->route('current_team'))->firstOrFail();

        CashierShift::create([
            'team_id' => $team->id,
            'user_id' => $request->user()->id,
            'opened_at' => now(),
            'initial_cash' => $request->input('initial_cash'),
            'system_total_cash' => $request->input('initial_cash'),
            'notes' => $request->input('notes'),
            'status' => 'open',
        ]);

        return redirect()->back()->with('success', 'Shift kasir berhasil dibuka.');
    }

    public function update(Request $request, $current_team, $shift)
    {
        $request->validate([
            'actual_cash' => ['required', 'numeric', 'min:0'],
        ]);

        $shiftModel = $shift instanceof CashierShift ? $shift : CashierShift::findOrFail($shift);

        $actualCash = $request->input('actual_cash');
        $difference = $actualCash - $shiftModel->system_total_cash;

        $shiftModel->update([
            'closed_at' => now(),
            'actual_cash' => $actualCash,
            'difference' => $difference,
            'notes' => $request->input('notes', $shiftModel->notes),
            'status' => 'closed',
        ]);

        return redirect()->back()->with('success', 'Shift kasir berhasil ditutup.');
    }
}
