<?php

namespace Database\Seeders;

use App\Enums\TeamRole;
use App\Models\Category;
use App\Models\DiningTable;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class KasirCerdasSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Buat User Kasir / Owner Demo jika belum ada
        $user = User::firstOrCreate(
            ['email' => 'admin@kasir.com'],
            [
                'name' => 'Kasir Admin',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // 2. Buat Team / Toko POS
        $team = Team::firstOrCreate(
            ['slug' => 'tasty-station'],
            [
                'name' => 'Tasty Station Resto & Cafe',
                'is_personal' => false,
            ]
        );

        // Hubungkan user ke team sebagai Owner via members()
        if (! $team->members()->where('user_id', $user->id)->exists()) {
            $team->members()->attach($user, ['role' => TeamRole::Owner->value]);
        }
        $user->forceFill(['current_team_id' => $team->id])->save();

        // 3. Buat Kategori Makanan & Minuman
        $categories = [
            ['name' => 'Special Menu', 'slug' => 'special', 'icon' => 'Star'],
            ['name' => 'Soups', 'slug' => 'soups', 'icon' => 'Soup'],
            ['name' => 'Main Dishes', 'slug' => 'main-dishes', 'icon' => 'Utensils'],
            ['name' => 'Desserts', 'slug' => 'desserts', 'icon' => 'Cake'],
            ['name' => 'Drinks & Coffee', 'slug' => 'drinks', 'icon' => 'Coffee'],
        ];

        $catModels = [];
        foreach ($categories as $cat) {
            $catModels[$cat['slug']] = Category::firstOrCreate(
                ['team_id' => $team->id, 'slug' => $cat['slug']],
                ['name' => $cat['name'], 'icon' => $cat['icon']]
            );
        }

        // 4. Buat Meja Restoran (Dine-in Tables)
        for ($i = 1; $i <= 10; $i++) {
            DiningTable::firstOrCreate(
                ['team_id' => $team->id, 'table_number' => 'Table ' . str_pad($i, 2, '0', STR_PAD_LEFT)],
                ['capacity' => ($i % 2 === 0 ? 4 : 2), 'status' => 'available']
            );
        }

        // 5. Buat Produk Menu
        $products = [
            [
                'category_id' => $catModels['special']->id,
                'sku' => 'SPEC-01',
                'name' => 'Salmon Steak Teriyaki',
                'cost_price' => 50000,
                'selling_price' => 85000,
                'stock' => 25,
                'min_stock_alert' => 5,
                'image_path' => 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80',
            ],
            [
                'category_id' => $catModels['special']->id,
                'sku' => 'SPEC-02',
                'name' => 'Wagyu Beef Ribeye 200g',
                'cost_price' => 90000,
                'selling_price' => 145000,
                'stock' => 15,
                'min_stock_alert' => 3,
                'image_path' => 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&auto=format&fit=crop&q=80',
            ],
            [
                'category_id' => $catModels['soups']->id,
                'sku' => 'SOUP-01',
                'name' => 'Creamy Mushroom Soup',
                'cost_price' => 15000,
                'selling_price' => 32000,
                'stock' => 30,
                'min_stock_alert' => 5,
                'image_path' => 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=300&auto=format&fit=crop&q=80',
            ],
            [
                'category_id' => $catModels['soups']->id,
                'sku' => 'SOUP-02',
                'name' => 'Tom Yum Seafood Bowl',
                'cost_price' => 22000,
                'selling_price' => 45000,
                'stock' => 4,
                'min_stock_alert' => 5,
                'image_path' => 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&auto=format&fit=crop&q=80',
            ],
            [
                'category_id' => $catModels['main-dishes']->id,
                'sku' => 'MAIN-01',
                'name' => 'Spaghetti Bolognese Premium',
                'cost_price' => 20000,
                'selling_price' => 42000,
                'stock' => 40,
                'min_stock_alert' => 8,
                'image_path' => 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=300&auto=format&fit=crop&q=80',
            ],
            [
                'category_id' => $catModels['main-dishes']->id,
                'sku' => 'MAIN-02',
                'name' => 'Crispy Chicken Katsu Curry',
                'cost_price' => 18000,
                'selling_price' => 38000,
                'stock' => 35,
                'min_stock_alert' => 5,
                'image_path' => 'https://images.unsplash.com/photo-1562967914-608f82629710?w=300&auto=format&fit=crop&q=80',
            ],
            [
                'category_id' => $catModels['desserts']->id,
                'sku' => 'DESS-01',
                'name' => 'Japanese Chiffon Pancake',
                'cost_price' => 12000,
                'selling_price' => 28000,
                'stock' => 20,
                'min_stock_alert' => 5,
                'image_path' => 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=300&auto=format&fit=crop&q=80',
            ],
            [
                'category_id' => $catModels['drinks']->id,
                'sku' => 'DRK-01',
                'name' => 'Iced Caramel Macchiato',
                'cost_price' => 10000,
                'selling_price' => 26000,
                'stock' => 50,
                'min_stock_alert' => 10,
                'image_path' => 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=300&auto=format&fit=crop&q=80',
            ],
        ];

        foreach ($products as $p) {
            Product::firstOrCreate(
                ['team_id' => $team->id, 'sku' => $p['sku']],
                array_merge($p, ['team_id' => $team->id, 'is_active' => true])
            );
        }

        // 6. Buat Contoh Transaksi Order Aktif di POS (Queue Line)
        $t1 = DiningTable::where('team_id', $team->id)->where('table_number', 'Table 01')->first();
        if ($t1) {
            $t1->update(['status' => 'occupied']);
            $order1 = Order::firstOrCreate(
                ['team_id' => $team->id, 'invoice_number' => 'INV-DEMO001'],
                [
                    'user_id' => $user->id,
                    'dining_table_id' => $t1->id,
                    'customer_name' => 'Pak Bambang (Dine In)',
                    'order_type' => 'dine_in',
                    'status' => 'kitchen',
                    'subtotal' => 85000,
                    'tax_amount' => 8500,
                    'discount_amount' => 0,
                    'grand_total' => 93500,
                ]
            );
            $pSalmon = Product::where('team_id', $team->id)->where('sku', 'SPEC-01')->first();
            if ($pSalmon && $order1->items()->count() === 0) {
                $order1->items()->create([
                    'product_id' => $pSalmon->id,
                    'product_name' => $pSalmon->name,
                    'unit_cost_price' => $pSalmon->cost_price,
                    'unit_selling_price' => $pSalmon->selling_price,
                    'quantity' => 1,
                    'total_price' => 85000,
                ]);
            }
        }
    }
}