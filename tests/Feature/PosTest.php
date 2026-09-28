<?php

use App\Models\CashierShift;
use App\Models\Category;
use App\Models\DiningTable;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;

test('authenticated user can view the POS screen', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $response = $this
        ->actingAs($user)
        ->get("/{$team->slug}/pos");

    $response->assertOk();
});

test('cashier can create an order and payment through POS', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $category = Category::create([
        'team_id' => $team->id,
        'name' => 'Food',
        'slug' => 'food',
    ]);

    $product = Product::create([
        'team_id' => $team->id,
        'category_id' => $category->id,
        'name' => 'Burger Deluxe',
        'cost_price' => 20000,
        'selling_price' => 35000,
        'stock' => 50,
        'min_stock_alert' => 5,
        'is_active' => true,
    ]);

    $table = DiningTable::create([
        'team_id' => $team->id,
        'table_number' => 'Table 99',
        'capacity' => 4,
        'status' => 'available',
    ]);

    $response = $this
        ->actingAs($user)
        ->post("/{$team->slug}/pos/order", [
            'customer_name' => 'Budi Customer',
            'dining_table_id' => $table->id,
            'order_type' => 'dine_in',
            'tax_amount' => 3500,
            'discount_amount' => 0,
            'payment_method' => 'cash',
            'amount_paid' => 40000,
            'status' => 'completed',
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 1,
                ],
            ],
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $this->assertDatabaseHas('orders', [
        'team_id' => $team->id,
        'customer_name' => 'Budi Customer',
        'subtotal' => 35000,
        'grand_total' => 38500,
        'status' => 'completed',
    ]);

    expect($product->fresh()->stock)->toBe(49);

    $order = Order::where('team_id', $team->id)->latest()->first();
    $this->assertDatabaseHas('payments', [
        'order_id' => $order->id,
        'payment_method' => 'cash',
        'amount_paid' => 40000,
        'change_given' => 1500,
    ]);
});

test('user can access products, tables, cash-flows and reports', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $this->actingAs($user)->get("/{$team->slug}/products")->assertOk();
    $this->actingAs($user)->get("/{$team->slug}/tables")->assertOk();
    $this->actingAs($user)->get("/{$team->slug}/cash-flows")->assertOk();
    $this->actingAs($user)->get("/{$team->slug}/reports")->assertOk();
});

test('cashier can open and close a shift', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $startResponse = $this
        ->actingAs($user)
        ->post("/{$team->slug}/shifts/start", [
            'initial_cash' => 200000,
            'notes' => 'Pagi shift',
        ]);

    $startResponse->assertSessionHasNoErrors();
    $this->assertDatabaseHas('cashier_shifts', [
        'team_id' => $team->id,
        'user_id' => $user->id,
        'status' => 'open',
        'initial_cash' => 200000,
    ]);

    $shift = CashierShift::where('team_id', $team->id)->first();

    $closeResponse = $this
        ->actingAs($user)
        ->patch("/{$team->slug}/shifts/{$shift->id}/close", [
            'actual_cash' => 200000,
            'notes' => 'Tutup aman',
        ]);

    $closeResponse->assertSessionHasNoErrors();
    expect($shift->fresh()->status)->toBe('closed');
});
