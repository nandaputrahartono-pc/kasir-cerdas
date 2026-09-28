import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    Clock,
    DollarSign,
    Package,
    ShoppingBag,
    TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import PendingInvitationsModal from '@/components/pending-invitations-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import type { DashboardInvitation } from '@/types';

type Order = {
    id: number;
    invoice_number: string;
    customer_name?: string | null;
    order_type: string;
    status: string;
    grand_total: number | string;
    created_at: string;
    dining_table?: { table_number: string } | null;
    items?: Array<{
        product_name: string;
        quantity: number;
    }>;
};

type Product = {
    id: number;
    name: string;
    sku?: string | null;
    stock: number;
    min_stock_alert: number;
    selling_price: number | string;
    category?: { name: string } | null;
};

type CashierShift = {
    id: number;
    system_total_cash: number | string;
    status: string;
};

type Props = {
    pendingInvitations?: DashboardInvitation[];
    stats?: {
        todaySales: number;
        todayOrdersCount: number;
        activeOrdersCount: number;
        lowStockCount: number;
    };
    lowStockProducts?: Product[];
    recentOrders?: Order[];
    currentShift?: CashierShift | null;
    team?: {
        name: string;
        slug: string;
    };
};

export default function Dashboard({
    pendingInvitations = [],
    stats = {
        todaySales: 0,
        todayOrdersCount: 0,
        activeOrdersCount: 0,
        lowStockCount: 0,
    },
    lowStockProducts = [],
    recentOrders = [],
    currentShift,
    team = { name: 'Tasty Station', slug: 'tasty-station' },
}: Props) {
    const [showInvitations, setShowInvitations] = useState(
        pendingInvitations.length > 0
    );

    const formatIDR = (val: number | string) => {
        const num = typeof val === 'string' ? parseFloat(val) : val;
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(num || 0);
    };

    return (
        <>
            <Head title="Dashboard Ringkasan Kasir - Tasty Station" />
            <PendingInvitationsModal
                invitations={pendingInvitations}
                open={pendingInvitations.length > 0 && showInvitations}
                onOpenChange={setShowInvitations}
            />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto p-6 max-w-7xl mx-auto w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-teal-800 to-teal-950 p-6 text-white shadow-md">
                    <div>
                        <span className="rounded-full bg-teal-700/60 px-3 py-1 text-xs font-semibold text-teal-200 uppercase tracking-wider">
                            Enterprise POS System
                        </span>
                        <h1 className="mt-2 text-2xl font-black">
                            Selamat Datang di {team.name}!
                        </h1>
                        <p className="mt-1 text-xs text-teal-200">
                            Kelola transaksi kasir, antrian dapur, pantau stok barang, dan arus kas dengan efisien.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            asChild
                            size="lg"
                            className="bg-white text-teal-900 font-bold hover:bg-neutral-100 shadow-md"
                        >
                            <Link href={`/${team.slug}/pos`}>
                                <ShoppingBag className="mr-2 size-5 text-teal-700" /> Buka Mesin Kasir (POS)
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-neutral-500">Penjualan Hari Ini</span>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400">
                                <TrendingUp className="size-4" />
                            </div>
                        </div>
                        <div className="mt-2 text-2xl font-extrabold text-neutral-900 dark:text-neutral-100">
                            {formatIDR(stats.todaySales)}
                        </div>
                        <div className="mt-1 text-xs text-neutral-500">
                            Dari {stats.todayOrdersCount} transaksi selesai hari ini
                        </div>
                    </div>

                    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-neutral-500">Pesanan Selesai</span>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                                <DollarSign className="size-4" />
                            </div>
                        </div>
                        <div className="mt-2 text-2xl font-extrabold text-neutral-900 dark:text-neutral-100">
                            {stats.todayOrdersCount} Nota
                        </div>
                        <div className="mt-1 text-xs text-neutral-500">
                            Rata-rata order: {stats.todayOrdersCount > 0 ? formatIDR(stats.todaySales / stats.todayOrdersCount) : 'Rp 0'}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-neutral-500">Antrian Berjalan</span>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                                <Clock className="size-4" />
                            </div>
                        </div>
                        <div className="mt-2 text-2xl font-extrabold text-purple-700 dark:text-purple-400">
                            {stats.activeOrdersCount} Pesanan
                        </div>
                        <div className="mt-1 text-xs text-neutral-500">
                            Sedang dimasak atau menunggu diantar
                        </div>
                    </div>

                    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-neutral-500">Peringatan Stok</span>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400">
                                <AlertTriangle className="size-4" />
                            </div>
                        </div>
                        <div className="mt-2 text-2xl font-extrabold text-red-600 dark:text-red-400">
                            {stats.lowStockCount} Produk
                        </div>
                        <div className="mt-1 text-xs text-neutral-500">
                            Stok berada di bawah batas minimum
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-extrabold text-base text-neutral-900 dark:text-neutral-100">
                                    Pesanan Terkini
                                </h3>
                                <p className="text-xs text-neutral-500">Aktivitas transaksi order line terbaru</p>
                            </div>

                            <Button asChild size="sm" variant="outline" className="text-xs">
                                <Link href={`/${team.slug}/reports`}>
                                    Lihat Semua <ArrowRight className="ml-1 size-3" />
                                </Link>
                            </Button>
                        </div>

                        {recentOrders.length === 0 ? (
                            <p className="text-xs text-neutral-400 py-8 text-center">Belum ada pesanan hari ini.</p>
                        ) : (
                            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {recentOrders.map((order) => {
                                    const isCompleted = order.status === 'completed';
                                    const isKitchen = order.status === 'kitchen';
                                    const totalItems = order.items?.reduce((s, i) => s + i.quantity, 0) || 0;

                                    return (
                                        <div key={order.id} className="py-3 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex size-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700 font-mono font-bold text-xs dark:bg-teal-950 dark:text-teal-300">
                                                    #{order.invoice_number.slice(-4)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-xs text-neutral-900 dark:text-neutral-100">
                                                        {order.customer_name || 'Pelanggan Umum'} • {order.dining_table ? order.dining_table.table_number : 'Take Away'}
                                                    </div>
                                                    <div className="text-[11px] text-neutral-500">
                                                        {totalItems} item • {new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        isCompleted
                                                            ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                                                            : isKitchen
                                                            ? 'border-teal-300 bg-teal-50 text-teal-700'
                                                            : 'border-amber-300 bg-amber-50 text-amber-700'
                                                    }
                                                >
                                                    {isCompleted ? 'Selesai' : isKitchen ? 'Di Dapur' : 'Antrian'}
                                                </Badge>
                                                <span className="font-mono font-extrabold text-xs text-neutral-900 dark:text-neutral-100">
                                                    {formatIDR(order.grand_total)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-extrabold text-base text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                                    <AlertTriangle className="size-4 text-red-500" />
                                    <span>Peringatan Stok</span>
                                </h3>
                                <Badge variant="secondary" className="text-red-700 bg-red-50">
                                    {lowStockProducts.length} Item
                                </Badge>
                            </div>

                            {lowStockProducts.length === 0 ? (
                                <p className="text-xs text-neutral-400 py-6 text-center">
                                    Semua stok produk dalam kondisi aman.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {lowStockProducts.map((p) => (
                                        <div
                                            key={p.id}
                                            className="flex items-center justify-between rounded-xl bg-red-50/50 p-2.5 border border-red-100 dark:bg-red-950/20 dark:border-red-900/30"
                                        >
                                            <div>
                                                <div className="font-bold text-xs text-neutral-900 dark:text-neutral-100">
                                                    {p.name}
                                                </div>
                                                <div className="text-[11px] text-neutral-500">
                                                    Batas minimal: {p.min_stock_alert} pcs
                                                </div>
                                            </div>
                                            <span className="font-extrabold text-xs text-red-600 dark:text-red-400">
                                                Sisa {p.stock}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 mt-4">
                            <Button asChild variant="outline" className="w-full text-xs">
                                <Link href={`/${team.slug}/products`}>
                                    <Package className="mr-1.5 size-3.5" /> Kelola Stok & Produk
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: props.currentTeam ? dashboard(props.currentTeam.slug) : '/',
        },
    ],
});
