<?php

namespace App\Http\Controllers;

use App\Models\CashierShift;
use App\Models\Category;
use App\Models\DiningTable;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PosController extends Controller
{
    public function index(Request $request): Response
    {
        $team = Team::where('slug', $request->route('current_team'))->firstOrFail();

        $categories = Category::where('team_id', $team->id)
            ->withCount('products')
            ->get();

        $products = Product::where('team_id', $team->id)
            ->where('is_active', true)
            ->with('category')
            ->orderBy('name')
            ->get();

        $tables = DiningTable::where('team_id', $team->id)
            ->orderBy('table_number')
            ->get();

        $activeOrders = Order::where('team_id', $team->id)
            ->whereIn('status', ['pending', 'kitchen', 'wait_list', 'ready'])
            ->with(['diningTable', 'items'])
            ->latest()
            ->get();

        $currentShift = CashierShift::where('team_id', $team->id)
            ->where('status', 'open')
            ->latest()
            ->first();

        return Inertia::render('pos/index', [
            'categories' => $categories,
            'products' => $products,
            'tables' => $tables,
            'activeOrders' => $activeOrders,
            'currentShift' => $currentShift,
            'team' => [
                'id' => $team->id,
                'name' => $team->name,
                'slug' => $team->slug,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'payment_method' => ['required', 'string', 'in:cash,card,qris,transfer'],
            'amount_paid' => ['required', 'numeric', 'min:0'],
            'order_type' => ['nullable', 'string', 'in:dine_in,take_away,delivery'],
            'status' => ['nullable', 'string', 'in:pending,kitchen,wait_list,ready,completed'],
        ]);

        $team = Team::where('slug', $request->route('current_team'))->firstOrFail();

        $order = DB::transaction(function () use ($request, $team) {
            $subtotal = 0;
            $itemsData = [];

            foreach ($request->input('items') as $item) {
                $product = Product::findOrFail($item['product_id']);
                $qty = $item['quantity'];
                $lineTotal = $product->selling_price * $qty;

                $subtotal += $lineTotal;

                $itemsData[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'unit_cost_price' => $product->cost_price,
                    'unit_selling_price' => $product->selling_price,
                    'quantity' => $qty,
                    'total_price' => $lineTotal,
                ];

                $product->decrement('stock', $qty);
            }

            $taxAmount = $request->input('tax_amount', 0);
            $discountAmount = $request->input('discount_amount', 0);
            $grandTotal = max(0, $subtotal + $taxAmount - $discountAmount);

            $invoiceNumber = 'INV-'.strtoupper(Str::random(8));

            $order = Order::create([
                'team_id' => $team->id,
                'invoice_number' => $invoiceNumber,
                'user_id' => $request->user()->id,
                'dining_table_id' => $request->input('dining_table_id'),
                'customer_name' => $request->input('customer_name', 'Pelanggan Umum'),
                'order_type' => $request->input('order_type', 'dine_in'),
                'status' => $request->input('status', 'completed'),
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'discount_amount' => $discountAmount,
                'grand_total' => $grandTotal,
                'notes' => $request->input('notes'),
            ]);

            foreach ($itemsData as $itemData) {
                $order->items()->create($itemData);
            }

            $amountPaid = $request->input('amount_paid', $grandTotal);
            $changeGiven = max(0, $amountPaid - $grandTotal);

            Payment::create([
                'order_id' => $order->id,
                'payment_method' => $request->input('payment_method', 'cash'),
                'amount_paid' => $amountPaid,
                'change_given' => $changeGiven,
                'status' => 'paid',
            ]);

            if ($request->input('dining_table_id') && $request->input('status') !== 'completed') {
                DiningTable::where('id', $request->input('dining_table_id'))
                    ->update(['status' => 'occupied']);
            }

            if ($request->input('payment_method') === 'cash') {
                CashierShift::where('team_id', $team->id)
                    ->where('status', 'open')
                    ->latest()
                    ->first()
                    ?->increment('system_total_cash', $grandTotal);
            }

            return $order->load(['items', 'payment', 'diningTable', 'user']);
        });

        return redirect()->back()->with('success', 'Pesanan berhasil dibuat!')->with('recentOrder', [
            'invoice_number' => $order->invoice_number,
            'customer_name' => $order->customer_name,
            'order_type' => $order->order_type,
            'dining_table' => $order->diningTable,
            'created_at' => $order->created_at->toISOString(),
            'user' => $order->user ? ['name' => $order->user->name] : null,
            'subtotal' => $order->subtotal,
            'tax_amount' => $order->tax_amount,
            'discount_amount' => $order->discount_amount,
            'grand_total' => $order->grand_total,
            'items' => $order->items->map(fn ($i) => [
                'product_name' => $i->product_name,
                'unit_selling_price' => $i->unit_selling_price,
                'quantity' => $i->quantity,
                'total_price' => $i->total_price,
            ]),
            'payment' => $order->payment ? [
                'payment_method' => $order->payment->payment_method,
                'amount_paid' => $order->payment->amount_paid,
                'change_given' => $order->payment->change_given,
            ] : null,
        ]);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $request->validate([
            'status' => ['required', 'string', 'in:pending,kitchen,wait_list,ready,completed,cancelled'],
        ]);

        $order->update(['status' => $request->input('status')]);

        if ($request->input('status') === 'completed' && $order->dining_table_id) {
            DiningTable::where('id', $order->dining_table_id)
                ->update(['status' => 'available']);
        }

        return redirect()->back()->with('success', 'Status pesanan diperbarui.');
    }
}
