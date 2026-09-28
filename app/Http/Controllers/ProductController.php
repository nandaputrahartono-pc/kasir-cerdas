<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Team;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $team = Team::where('slug', $request->route('current_team'))->firstOrFail();

        $products = Product::where('team_id', $team->id)
            ->with('category')
            ->when($request->input('search'), fn ($q, $search) => $q->where(fn ($q2) => $q2
                ->where('name', 'like', "%{$search}%")
                ->orWhere('sku', 'like', "%{$search}%")))
            ->when($request->input('category_id'), fn ($q, $catId) => $q->where('category_id', $catId))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        $categories = Category::where('team_id', $team->id)->get();

        return Inertia::render('products/index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category_id']),
            'team' => ['id' => $team->id, 'name' => $team->name, 'slug' => $team->slug],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'selling_price' => ['required', 'numeric', 'min:0'],
            'cost_price' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
        ]);

        $team = Team::where('slug', $request->route('current_team'))->firstOrFail();

        $data = $request->only(['name', 'category_id', 'sku', 'cost_price', 'selling_price', 'stock', 'min_stock_alert']);
        $data['team_id'] = $team->id;
        $data['is_active'] = $request->boolean('is_active', true);

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('products', 'public');
        } elseif ($request->input('image_url')) {
            $data['image_path'] = $request->input('image_url');
        }

        Product::create($data);

        return redirect()->back()->with('success', 'Produk berhasil ditambahkan.');
    }

    public function update(Request $request, Product $product)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'selling_price' => ['required', 'numeric', 'min:0'],
            'cost_price' => ['required', 'numeric', 'min:0'],
        ]);

        $data = $request->only(['name', 'category_id', 'sku', 'cost_price', 'selling_price', 'stock', 'min_stock_alert']);
        $data['is_active'] = $request->boolean('is_active', true);

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('products', 'public');
        } elseif ($request->input('image_url')) {
            $data['image_path'] = $request->input('image_url');
        }

        $product->update($data);

        return redirect()->back()->with('success', 'Produk berhasil diperbarui.');
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return redirect()->back()->with('success', 'Produk berhasil dihapus.');
    }
}
