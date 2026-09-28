<?php

namespace App\Http\Controllers;

use App\Models\CashFlow;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Team;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $team = Team::where('slug', $request->route('current_team'))->firstOrFail();

        $startDate = $request->input('start_date', now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', now()->format('Y-m-d'));

        $ordersQuery = Order::where('team_id', $team->id)
            ->where('status', 'completed')
            ->whereDate('created_at', '>=', $startDate)
            ->whereDate('created_at', '<=', $endDate);

        $totalRevenue = (clone $ordersQuery)->sum('grand_total');
        $totalSubtotal = (clone $ordersQuery)->sum('subtotal');
        $totalDiscount = (clone $ordersQuery)->sum('discount_amount');
        $totalTax = (clone $ordersQuery)->sum('tax_amount');
        $ordersCount = (clone $ordersQuery)->count();

        $orderIds = (clone $ordersQuery)->pluck('id');
        $totalCogs = OrderItem::whereIn('order_id', $orderIds)
            ->selectRaw('SUM(unit_cost_price * quantity) as total_cogs')
            ->value('total_cogs') ?? 0;

        $totalExpense = CashFlow::where('team_id', $team->id)
            ->where('type', 'expense')
            ->whereDate('flow_date', '>=', $startDate)
            ->whereDate('flow_date', '<=', $endDate)
            ->sum('amount');

        $grossProfit = $totalSubtotal - $totalCogs;
        $netProfit = $grossProfit - $totalExpense;

        $topProducts = OrderItem::whereIn('order_id', $orderIds)
            ->select('product_name')
            ->selectRaw('SUM(quantity) as total_qty')
            ->selectRaw('SUM(total_price) as total_amount')
            ->groupBy('product_name')
            ->orderByDesc('total_qty')
            ->limit(5)
            ->get();

        $paymentMethods = Payment::whereIn('order_id', $orderIds)
            ->select('payment_method')
            ->selectRaw('COUNT(*) as count')
            ->selectRaw('SUM(amount_paid) as total_amount')
            ->groupBy('payment_method')
            ->orderByDesc('total_amount')
            ->get();

        $dailySales = (clone $ordersQuery)
            ->selectRaw('DATE(created_at) as date')
            ->selectRaw('SUM(grand_total) as total')
            ->groupByRaw('DATE(created_at)')
            ->orderBy('date')
            ->get();

        $orders = Order::where('team_id', $team->id)
            ->where('status', 'completed')
            ->whereDate('created_at', '>=', $startDate)
            ->whereDate('created_at', '<=', $endDate)
            ->with(['diningTable', 'user', 'payment', 'items'])
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('reports/index', [
            'metrics' => [
                'totalRevenue' => $totalRevenue,
                'totalSubtotal' => $totalSubtotal,
                'totalCogs' => $totalCogs,
                'totalExpense' => $totalExpense,
                'grossProfit' => $grossProfit,
                'netProfit' => $netProfit,
                'totalDiscount' => $totalDiscount,
                'totalTax' => $totalTax,
                'ordersCount' => $ordersCount,
            ],
            'topProducts' => $topProducts,
            'paymentMethods' => $paymentMethods,
            'dailySales' => $dailySales,
            'orders' => $orders,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'team' => ['id' => $team->id, 'name' => $team->name, 'slug' => $team->slug],
        ]);
    }
}
