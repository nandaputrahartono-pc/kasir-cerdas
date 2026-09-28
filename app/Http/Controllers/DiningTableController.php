<?php

namespace App\Http\Controllers;

use App\Models\DiningTable;
use App\Models\Team;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DiningTableController extends Controller
{
    public function index(Request $request): Response
    {
        $team = Team::where('slug', $request->route('current_team'))->firstOrFail();

        $tables = DiningTable::where('team_id', $team->id)
            ->with(['orders' => fn ($q) => $q->whereIn('status', ['pending', 'kitchen', 'wait_list', 'ready'])->latest()->limit(1)])
            ->orderBy('table_number')
            ->get();

        return Inertia::render('tables/index', [
            'tables' => $tables,
            'team' => ['id' => $team->id, 'name' => $team->name, 'slug' => $team->slug],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'table_number' => ['required', 'string', 'max:50'],
            'capacity' => ['required', 'integer', 'min:1'],
        ]);

        $team = Team::where('slug', $request->route('current_team'))->firstOrFail();

        DiningTable::create([
            'team_id' => $team->id,
            'table_number' => $request->input('table_number'),
            'capacity' => $request->input('capacity'),
            'status' => $request->input('status', 'available'),
        ]);

        return redirect()->back()->with('success', 'Meja berhasil ditambahkan.');
    }

    public function update(Request $request, DiningTable $table)
    {
        $request->validate([
            'table_number' => ['required', 'string', 'max:50'],
            'capacity' => ['required', 'integer', 'min:1'],
        ]);

        $table->update($request->only(['table_number', 'capacity', 'status']));

        return redirect()->back()->with('success', 'Meja berhasil diperbarui.');
    }

    public function destroy(DiningTable $table)
    {
        $table->delete();

        return redirect()->back()->with('success', 'Meja berhasil dihapus.');
    }
}
