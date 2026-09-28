import { Head, Link, router } from '@inertiajs/react';
import {
    DollarSign,
    Filter,
    Printer,
    ShoppingBag,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import React, { useState } from 'react';
import ReceiptModal, { type ReceiptData } from '@/components/receipt-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';

type Order = {
    id: number;
    invoice_number: string;
    customer_name?: string | null;
    order_type: string;
    status: string;
    subtotal: number | string;
    tax_amount: number | string;
    discount_amount: number | string;
    grand_total: number | string;
    created_at: string;
    dining_table?: { table_number: string } | null;
    user?: { id: number; name: string } | null;
    payment?: {
        payment_method: string;
        amount_paid: number | string;
        change_given: number | string;
    } | null;
    items?: Array<{
        product_name: string;
        unit_cost_price?: number | string;
        unit_selling_price: number | string;
        quantity: number;
        total_price: number | string;
    }>;
};

type Props = {
    metrics: {
        totalRevenue: number;
        totalSubtotal: number;
        totalCogs: number;
        totalExpense: number;
        grossProfit: number;
        netProfit: number;
        totalDiscount: number;
        totalTax: number;
        ordersCount: number;
    };
    topProducts: Array<{
        product_name: string;
        total_qty: number;
        total_amount: number;
    }>;
    paymentMethods: Array<{
        payment_method: string;
        count: number;
        total_amount: number;
    }>;
    dailySales: Array<{
        date: string;
        total: number;
    }>;
    orders: {
        data: Order[];
        current_page: number;
        last_page: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    filters: {
        start_date: string;
        end_date: string;
    };
    team: {
        id: number;
        name: string;
        slug: string;
    };
};

export default function ReportsIndex({
    metrics,
    topProducts = [],
    paymentMethods = [],
    dailySales = [],
    orders,
    filters,
    team,
}: Props) {
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);
    const [receiptModalOpen, setReceiptModalOpen] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);

    const formatIDR = (val: number | string) => {
        const num = typeof val === 'string' ? parseFloat(val) : val;
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(num || 0);
    };

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            `/${team.slug}/reports`,
            { start_date: startDate, end_date: endDate },
            { preserveState: true }
        );
    };

    const setQuickRange = (range: 'today' | 'week' | 'month') => {
        const today = new Date().toISOString().split('T')[0];
        let start = today;

        if (range === 'week') {
            const d = new Date();
            d.setDate(d.getDate() - 7);
            start = d.toISOString().split('T')[0];
        } else if (range === 'month') {
            const d = new Date();
            d.setDate(1);
            start = d.toISOString().split('T')[0];
        }

        setStartDate(start);
        setEndDate(today);
        router.get(
            `/${team.slug}/reports`,
            { start_date: start, end_date: today },
            { preserveState: true }
        );
    };

    const openPrintModal = (order: Order) => {
        setSelectedReceipt({
            invoice_number: order.invoice_number,
            customer_name: order.customer_name,
            order_type: order.order_type,
            dining_table: order.dining_table,
            created_at: order.created_at,
            user: order.user,
            subtotal: order.subtotal,
            tax_amount: order.tax_amount,
            discount_amount: order.discount_amount,
            grand_total: order.grand_total,
            items: order.items,
            payment: order.payment,
        });
        setReceiptModalOpen(true);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <Head title="Laporan Penjualan & Laba Rugi - Kasir Cerdas" />

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-100">
                        Laporan Penjualan & Keuangan
                    </h1>
                    <p className="text-sm text-neutral-500">
                        Analitik laba rugi bersih, omzet penjualan kotor, HPP produk, dan riwayat transaksi
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex rounded-lg border border-neutral-200 bg-white p-1 text-xs dark:border-neutral-800 dark:bg-neutral-900">
                        <button
                            type="button"
                            onClick={() => setQuickRange('today')}
                            className="rounded-md px-3 py-1 font-semibold text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                        >
                            Hari Ini
                        </button>
                        <button
                            type="button"
                            onClick={() => setQuickRange('week')}
                            className="rounded-md px-3 py-1 font-semibold text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                        >
                            7 Hari Terakhir
                        </button>
                        <button
                            type="button"
                            onClick={() => setQuickRange('month')}
                            className="rounded-md px-3 py-1 font-semibold text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                        >
                            Bulan Ini
                        </button>
                    </div>

                    <form onSubmit={handleFilter} className="flex items-center gap-1.5">
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="h-8 w-32 text-xs bg-white dark:bg-neutral-900"
                        />
                        <span className="text-neutral-400 text-xs">-</span>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="h-8 w-32 text-xs bg-white dark:bg-neutral-900"
                        />
                        <Button type="submit" size="sm" variant="outline" className="h-8">
                            <Filter className="size-3.5" />
                        </Button>
                    </form>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-neutral-500">Omzet Penjualan (Gross)</span>
                        <div className="flex size-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400">
                            <ShoppingBag className="size-4" />
                        </div>
                    </div>
                    <div className="mt-2 text-2xl font-extrabold text-neutral-900 dark:text-neutral-100">
                        {formatIDR(metrics.totalRevenue)}
                    </div>
                    <div className="mt-1 text-xs text-neutral-500">
                        Dari total {metrics.ordersCount} transaksi sukses
                    </div>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-neutral-500">Total HPP (Modal Barang)</span>
                        <div className="flex size-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                            <DollarSign className="size-4" />
                        </div>
                    </div>
                    <div className="mt-2 text-2xl font-extrabold text-neutral-800 dark:text-neutral-200">
                        {formatIDR(metrics.totalCogs)}
                    </div>
                    <div className="mt-1 text-xs text-neutral-500">
                        Modal pokok barang terjual
                    </div>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-neutral-500">Biaya Kas Operasional</span>
                        <div className="flex size-8 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400">
                            <TrendingDown className="size-4" />
                        </div>
                    </div>
                    <div className="mt-2 text-2xl font-extrabold text-red-600 dark:text-red-400">
                        {formatIDR(metrics.totalExpense)}
                    </div>
                    <div className="mt-1 text-xs text-neutral-500">
                        Listrik, air, gaji, belanja mendesak
                    </div>
                </div>

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 shadow-sm dark:border-emerald-900/60 dark:bg-emerald-950/20">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                            Laba Bersih (Net Profit)
                        </span>
                        <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                            <TrendingUp className="size-4" />
                        </div>
                    </div>
                    <div className="mt-2 text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">
                        {formatIDR(metrics.netProfit)}
                    </div>
                    <div className="mt-1 text-xs text-emerald-800/80 dark:text-emerald-400/80 font-medium">
                        Laba Kotor: {formatIDR(metrics.grossProfit)}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <h3 className="font-extrabold text-base text-neutral-900 dark:text-neutral-100 mb-3 flex items-center justify-between">
                        <span>Top 5 Menu Paling Laris</span>
                        <Badge variant="outline" className="text-teal-700 bg-teal-50 border-teal-200">
                            Terlaris
                        </Badge>
                    </h3>

                    {topProducts.length === 0 ? (
                        <p className="text-xs text-neutral-400 py-6 text-center">Belum ada data penjualan.</p>
                    ) : (
                        <div className="space-y-3">
                            {topProducts.map((p, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2.5">
                                        <span className="flex size-6 items-center justify-center rounded-full bg-neutral-100 font-bold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                                            #{idx + 1}
                                        </span>
                                        <div>
                                            <div className="font-bold text-neutral-900 dark:text-neutral-100">
                                                {p.product_name}
                                            </div>
                                            <div className="text-[11px] text-neutral-500">
                                                Terjual {p.total_qty} porsi
                                            </div>
                                        </div>
                                    </div>
                                    <span className="font-extrabold text-neutral-900 dark:text-neutral-100 font-mono">
                                        {formatIDR(p.total_amount)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <h3 className="font-extrabold text-base text-neutral-900 dark:text-neutral-100 mb-3">
                        Distribusi Metode Pembayaran
                    </h3>

                    {paymentMethods.length === 0 ? (
                        <p className="text-xs text-neutral-400 py-6 text-center">Belum ada data pembayaran.</p>
                    ) : (
                        <div className="space-y-3">
                            {paymentMethods.map((pm, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800/60"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-9 items-center justify-center rounded-lg bg-teal-600 text-white font-bold text-xs uppercase">
                                            {pm.payment_method.slice(0, 2)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-xs uppercase text-neutral-900 dark:text-neutral-100">
                                                {pm.payment_method}
                                            </div>
                                            <div className="text-[11px] text-neutral-500">
                                                {pm.count} Transaksi
                                            </div>
                                        </div>
                                    </div>
                                    <span className="font-extrabold font-mono text-sm text-neutral-900 dark:text-neutral-100">
                                        {formatIDR(pm.total_amount)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                    <div>
                        <h3 className="font-extrabold text-base text-neutral-900 dark:text-neutral-100">
                            Riwayat Transaksi Penjualan
                        </h3>
                        <p className="text-xs text-neutral-500">
                            Daftar seluruh nota transaksi yang selesai, klik ikon printer untuk cetak ulang struk
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-neutral-600 dark:text-neutral-400">
                        <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-bold uppercase tracking-wider text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-300">
                            <tr>
                                <th className="px-6 py-4">No. Invoice</th>
                                <th className="px-6 py-4">Waktu</th>
                                <th className="px-6 py-4">Pelanggan / Meja</th>
                                <th className="px-6 py-4">Kasir</th>
                                <th className="px-6 py-4">Metode Bayar</th>
                                <th className="px-6 py-4 text-right">Total Transaksi</th>
                                <th className="px-6 py-4 text-center">Struk</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                            {orders.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-neutral-400">
                                        Belum ada riwayat transaksi pada rentang tanggal ini.
                                    </td>
                                </tr>
                            ) : (
                                orders.data.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="hover:bg-neutral-50/80 transition-colors dark:hover:bg-neutral-800/40"
                                    >
                                        <td className="px-6 py-4 font-mono font-bold text-xs text-neutral-900 dark:text-neutral-100">
                                            {order.invoice_number}
                                        </td>

                                        <td className="px-6 py-4 text-xs">
                                            {new Date(order.created_at).toLocaleString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-neutral-800 dark:text-neutral-200">
                                                {order.customer_name || 'Pelanggan Umum'}
                                            </div>
                                            <div className="text-[11px] text-neutral-400">
                                                {order.dining_table ? order.dining_table.table_number : 'Take Away'}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-xs">
                                            {order.user?.name || 'Kasir'}
                                        </td>

                                        <td className="px-6 py-4">
                                            <Badge
                                                variant="outline"
                                                className="uppercase text-[10px] font-bold tracking-wider"
                                            >
                                                {order.payment?.payment_method || 'CASH'}
                                            </Badge>
                                        </td>

                                        <td className="px-6 py-4 text-right font-mono font-bold text-neutral-900 dark:text-neutral-100">
                                            {formatIDR(order.grand_total)}
                                        </td>

                                        <td className="px-6 py-4 text-center">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => openPrintModal(order)}
                                                className="size-8 p-0 text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-950"
                                                title="Cetak Ulang Struk"
                                            >
                                                <Printer className="size-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {orders.links && orders.links.length > 3 && (
                    <div className="flex items-center justify-between border-t border-neutral-200 px-6 py-3 dark:border-neutral-800">
                        <div className="text-xs text-neutral-500">
                            Halaman {orders.current_page} dari {orders.last_page}
                        </div>
                        <div className="flex gap-1">
                            {orders.links.map((link, idx) => (
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

            <ReceiptModal
                open={receiptModalOpen}
                onOpenChange={setReceiptModalOpen}
                receipt={selectedReceipt}
                storeName={team.name}
            />
        </div>
    );
}

ReportsIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
