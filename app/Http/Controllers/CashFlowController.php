<?php

namespace App\Http\Controllers;

use App\Models\CashFlow;
use App\Models\Team;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CashFlowController extends Controller
{
    public function index(Request $request): Response
    {
        $team = Team::where('slug', $request->route('current_team'))->firstOrFail();

        $query = CashFlow::where('team_id', $team->id)
            ->with('user');

        if ($request->input('type')) {
            $query->where('type', $request->input('type'));
        }
        if ($request->input('start_date')) {
            $query->where('flow_date', '>=', $request->input('start_date'));
        }
        if ($request->input('end_date')) {
            $query->where('flow_date', '<=', $request->input('end_date'));
        }

        $cashFlows = $query->latest('flow_date')->paginate(20)->withQueryString();

        $allFlows = CashFlow::where('team_id', $team->id);
        if ($request->input('start_date')) {
            $allFlows->where('flow_date', '>=', $request->input('start_date'));
        }
        if ($request->input('end_date')) {
            $allFlows->where('flow_date', '<=', $request->input('end_date'));
        }

        $totalIncome = (clone $allFlows)->where('type', 'income')->sum('amount');
        $totalExpense = (clone $allFlows)->where('type', 'expense')->sum('amount');

        return Inertia::render('cashflows/index', [
            'cashFlows' => $cashFlows,
            'summary' => [
                'totalIncome' => $totalIncome,
                'totalExpense' => $totalExpense,
                'netBalance' => $totalIncome - $totalExpense,
            ],
            'filters' => $request->only(['type', 'start_date', 'end_date']),
            'team' => ['id' => $team->id, 'name' => $team->name, 'slug' => $team->slug],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'type' => ['required', 'in:income,expense'],
            'category' => ['required', 'string'],
            'amount' => ['required', 'numeric', 'min:1'],
            'description' => ['required', 'string'],
            'flow_date' => ['required', 'date'],
        ]);

        $team = Team::where('slug', $request->route('current_team'))->firstOrFail();

        $data = $request->only(['type', 'category', 'amount', 'description', 'flow_date']);
        $data['team_id'] = $team->id;
        $data['user_id'] = $request->user()->id;

        if ($request->hasFile('receipt')) {
            $data['receipt_image'] = $request->file('receipt')->store('receipts', 'public');
        }

        CashFlow::create($data);

        return redirect()->back()->with('success', 'Catatan kas berhasil disimpan.');
    }

    public function destroy(CashFlow $cashFlow)
    {
        $cashFlow->delete();

        return redirect()->back()->with('success', 'Catatan kas berhasil dihapus.');
    }
}
