import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    Edit2,
    Package,
    Plus,
    Search,
    Trash2,
} from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';

type Category = {
    id: number;
    name: string;
    slug: string;
};

type Product = {
    id: number;
    category_id?: number | null;
    sku?: string | null;
    name: string;
    cost_price: number | string;
    selling_price: number | string;
    stock: number;
    min_stock_alert: number;
    image_path?: string | null;
    is_active: boolean;
    category?: Category | null;
};

type Props = {
    products: {
        data: Product[];
        current_page: number;
        last_page: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    categories: Category[];
    filters: {
        search?: string;
        category_id?: string;
    };
    team: {
        id: number;
        name: string;
        slug: string;
    };
};

export default function ProductsIndex({ products, categories = [], filters = {}, team }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || '');

    const [modalOpen, setModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        category_id: '',
        sku: '',
        cost_price: '',
        selling_price: '',
        stock: '10',
        min_stock_alert: '5',
        image_url: '',
        is_active: true,
    });
    const [imageFile, setImageFile] = useState<File | null>(null);

    const formatIDR = (val: number | string) => {
        const num = typeof val === 'string' ? parseFloat(val) : val;
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(num || 0);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            `/${team.slug}/products`,
            { search: search || undefined, category_id: categoryId || undefined },
            { preserveState: true }
        );
    };

    const openAddModal = () => {
        setEditingProduct(null);
        setFormData({
            name: '',
            category_id: categories[0]?.id?.toString() || '',
            sku: `SKU-${Date.now().toString().slice(-4)}`,
            cost_price: '',
            selling_price: '',
            stock: '10',
            min_stock_alert: '5',
            image_url: '',
            is_active: true,
        });
        setImageFile(null);
        setModalOpen(true);
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            category_id: product.category_id ? product.category_id.toString() : '',
            sku: product.sku || '',
            cost_price: String(product.cost_price),
            selling_price: String(product.selling_price),
            stock: String(product.stock),
            min_stock_alert: String(product.min_stock_alert),
            image_url: product.image_path || '',
            is_active: product.is_active,
        });
        setImageFile(null);
        setModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const form = new FormData();
        form.append('name', formData.name);
        if (formData.category_id) form.append('category_id', formData.category_id);
        if (formData.sku) form.append('sku', formData.sku);
        form.append('cost_price', formData.cost_price);
        form.append('selling_price', formData.selling_price);
        form.append('stock', formData.stock);
        form.append('min_stock_alert', formData.min_stock_alert);
        if (formData.image_url) form.append('image_url', formData.image_url);
        form.append('is_active', formData.is_active ? '1' : '0');
        if (imageFile) form.append('image', imageFile);

        if (editingProduct) {
            form.append('_method', 'PUT');
            router.post(`/${team.slug}/products/${editingProduct.id}`, form as any, {
                onSuccess: () => setModalOpen(false),
            });
        } else {
            router.post(`/${team.slug}/products`, form as any, {
                onSuccess: () => setModalOpen(false),
            });
        }
    };

    const handleDelete = (product: Product) => {
        if (confirm(`Hapus produk "${product.name}"?`)) {
            router.delete(`/${team.slug}/products/${product.id}`);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <Head title="Manajemen Menu & Produk - Kasir Cerdas" />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-100">
                        Manajemen Produk & Menu
                    </h1>
                    <p className="text-sm text-neutral-500">
                        Kelola katalog barang, HPP modal, harga jual, dan stok barang toko Anda
                    </p>
                </div>

                <Button
                    onClick={openAddModal}
                    className="bg-teal-700 hover:bg-teal-800 text-white font-bold"
                >
                    <Plus className="mr-2 size-4" /> Tambah Produk Baru
                </Button>
            </div>

            <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[240px]">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari berdasarkan nama atau kode SKU..."
                        className="pl-9 bg-white dark:bg-neutral-900"
                    />
                </div>

                <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
                >
                    <option value="">Semua Kategori</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>

                <Button type="submit" variant="outline">
                    Filter
                </Button>
            </form>

            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-neutral-600 dark:text-neutral-400">
                        <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-bold uppercase tracking-wider text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-300">
                            <tr>
                                <th className="px-6 py-4">Produk</th>
                                <th className="px-6 py-4">Kategori</th>
                                <th className="px-6 py-4">Harga Modal (HPP)</th>
                                <th className="px-6 py-4">Harga Jual</th>
                                <th className="px-6 py-4">Stok</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                            {products.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-neutral-400">
                                        <Package className="mx-auto mb-2 size-8 text-neutral-300 dark:text-neutral-600" />
                                        Belum ada produk yang ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                products.data.map((product) => {
                                    const isLow = product.stock <= product.min_stock_alert;
                                    const margin = Number(product.selling_price) - Number(product.cost_price);

                                    return (
                                        <tr
                                            key={product.id}
                                            className="hover:bg-neutral-50/80 transition-colors dark:hover:bg-neutral-800/40"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={
                                                            product.image_path ||
                                                            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=80'
                                                        }
                                                        alt={product.name}
                                                        className="size-11 rounded-xl object-cover border border-neutral-200 dark:border-neutral-700"
                                                    />
                                                    <div>
                                                        <div className="font-bold text-neutral-900 dark:text-neutral-100">
                                                            {product.name}
                                                        </div>
                                                        <div className="text-xs text-neutral-400">
                                                            {product.sku || 'No SKU'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                                                    {product.category?.name || 'Umum'}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 font-mono text-neutral-600 dark:text-neutral-400">
                                                {formatIDR(product.cost_price)}
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="font-bold font-mono text-neutral-900 dark:text-neutral-100">
                                                    {formatIDR(product.selling_price)}
                                                </div>
                                                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                                    +{formatIDR(margin)} untung
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 font-bold">
                                                    <span className={isLow ? 'text-red-600 dark:text-red-400' : 'text-neutral-800 dark:text-neutral-200'}>
                                                        {product.stock} pcs
                                                    </span>
                                                    {isLow && (
                                                        <span title="Stok Menipis!">
                                                            <AlertCircle className="size-4 text-red-500" />
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <Badge
                                                    variant={product.is_active ? 'default' : 'secondary'}
                                                    className={product.is_active ? 'bg-emerald-600 text-white' : ''}
                                                >
                                                    {product.is_active ? 'Aktif' : 'Non-aktif'}
                                                </Badge>
                                            </td>

                                            <td className="px-6 py-4 text-right space-x-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => openEditModal(product)}
                                                    className="size-8 p-0"
                                                >
                                                    <Edit2 className="size-4 text-neutral-500 hover:text-teal-600" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleDelete(product)}
                                                    className="size-8 p-0 text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {products.links && products.links.length > 3 && (
                    <div className="flex items-center justify-between border-t border-neutral-200 px-6 py-3 dark:border-neutral-800">
                        <div className="text-xs text-neutral-500">
                            Halaman {products.current_page} dari {products.last_page}
                        </div>
                        <div className="flex gap-1">
                            {products.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    preserveState
                                    className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                                        link.active
                                            ? 'bg-teal-600 text-white'
                                            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
                                    } ${!link.url ? 'opacity-40 pointer-events-none' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editingProduct ? 'Edit Informasi Produk' : 'Tambah Produk Baru'}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="prod_name">Nama Produk / Makanan</Label>
                            <Input
                                id="prod_name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Contoh: Salmon Steak Teriyaki"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="prod_category">Kategori</Label>
                                <select
                                    id="prod_category"
                                    value={formData.category_id}
                                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                    className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3 text-xs dark:border-neutral-700 dark:bg-neutral-900"
                                >
                                    <option value="">Pilih Kategori...</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="prod_sku">Kode SKU / Barcode</Label>
                                <Input
                                    id="prod_sku"
                                    value={formData.sku}
                                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                    placeholder="SKU-XXXX"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="prod_cost">Harga Modal (HPP)</Label>
                                <Input
                                    id="prod_cost"
                                    type="number"
                                    value={formData.cost_price}
                                    onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                                    placeholder="50000"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="prod_selling">Harga Jual Kasir</Label>
                                <Input
                                    id="prod_selling"
                                    type="number"
                                    value={formData.selling_price}
                                    onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                                    placeholder="85000"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="prod_stock">Jumlah Stok</Label>
                                <Input
                                    id="prod_stock"
                                    type="number"
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="prod_min_stock">Peringatan Stok Tipis</Label>
                                <Input
                                    id="prod_min_stock"
                                    type="number"
                                    value={formData.min_stock_alert}
                                    onChange={(e) => setFormData({ ...formData, min_stock_alert: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="prod_img_url">URL Foto Produk (atau upload file di bawah)</Label>
                            <Input
                                id="prod_img_url"
                                value={formData.image_url}
                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>

                        <div>
                            <Label htmlFor="prod_file">Upload File Gambar (Opsional)</Label>
                            <Input
                                id="prod_file"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                            />
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <input
                                id="is_active"
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                className="rounded text-teal-600 size-4"
                            />
                            <Label htmlFor="is_active" className="cursor-pointer">
                                Produk Aktif dan Tampil di Mesin Kasir
                            </Label>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" className="bg-teal-700 hover:bg-teal-800 text-white">
                                {editingProduct ? 'Simpan Perubahan' : 'Tambah Produk'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

ProductsIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
