import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowDownLeft,
    ArrowUpRight,
    FileText,
    Filter,
    Plus,
    Receipt,
    Trash2,
    Wallet,
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

type CashFlow = {
    id: number;
    type: 'income' | 'expense';
    category: string;
    amount: number | string;
    description: string;
    receipt_image?: string | null;
    flow_date: string;
    user?: { id: number; name: string } | null;
};

type Props = {
    cashFlows: {
        data: CashFlow[];
        current_page: number;
        last_page: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    summary: {
        totalIncome: number;
        totalExpense: number;
        netBalance: number;
    };
    filters: {
        type?: string;
        start_date?: string;
        end_date?: string;
    };
    team: {
        id: number;
        name: string;
        slug: string;
    };
};

export default function CashFlowsIndex({ cashFlows, summary, filters = {}, team }: Props) {
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [typeFilter, setTypeFilter] = useState(filters.type || '');

    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        type: 'expense',
        category: 'belanja_bahan',
        amount: '',
        description: '',
        flow_date: new Date().toISOString().split('T')[0],
    });
    const [receiptFile, setReceiptFile] = useState<File | null>(null);

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
            `/${team.slug}/cash-flows`,
            {
                start_date: startDate || undefined,
                end_date: endDate || undefined,
                type: typeFilter || undefined,
            },
            { preserveState: true }
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const form = new FormData();
        form.append('type', formData.type);
        form.append('category', formData.category);
        form.append('amount', formData.amount);
        form.append('description', formData.description);
        form.append('flow_date', formData.flow_date);
        if (receiptFile) form.append('receipt', receiptFile);

        router.post(`/${team.slug}/cash-flows`, form as any, {
            onSuccess: () => {
                setModalOpen(false);
                setFormData({
                    type: 'expense',
                    category: 'belanja_bahan',
                    amount: '',
                    description: '',
                    flow_date: new Date().toISOString().split('T')[0],
                });
                setReceiptFile(null);
            },
        });
    };

    const handleDelete = (entry: CashFlow) => {
        if (confirm(`Hapus catatan kas "${entry.description}"?`)) {
            router.delete(`/${team.slug}/cash-flows/${entry.id}`);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <Head title="Buku Kas Operasional (Pemasukan & Pengeluaran) - Kasir Cerdas" />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-100">
                        Pemasukan & Pengeluaran Kas
                    </h1>
                    <p className="text-sm text-neutral-500">
                        Catat arus kas operasional toko (listrik, belanja bahan mendesak, modal kas, dll)
                    </p>
                </div>

                <Button
                    onClick={() => setModalOpen(true)}
                    className="bg-teal-700 hover:bg-teal-800 text-white font-bold"
                >
                    <Plus className="mr-2 size-4" /> Catat Kas Masuk / Keluar
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-neutral-500">Total Pemasukan Kas</span>
                        <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                            <ArrowDownLeft className="size-4" />
                        </div>
                    </div>
                    <div className="mt-2 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                        {formatIDR(summary.totalIncome)}
                    </div>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-neutral-500">Total Pengeluaran Kas</span>
                        <div className="flex size-8 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
                            <ArrowUpRight className="size-4" />
                        </div>
                    </div>
                    <div className="mt-2 text-2xl font-extrabold text-red-600 dark:text-red-400">
                        {formatIDR(summary.totalExpense)}
                    </div>
                </div>

                <div className="rounded-2xl border border-teal-200 bg-teal-50/50 p-5 shadow-sm dark:border-teal-900/50 dark:bg-teal-950/20">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-teal-800 dark:text-teal-300">Saldo Kas Bersih</span>
                        <div className="flex size-8 items-center justify-center rounded-lg bg-teal-600 text-white">
                            <Wallet className="size-4" />
                        </div>
                    </div>
                    <div className="mt-2 text-2xl font-extrabold text-teal-700 dark:text-teal-300">
                        {formatIDR(summary.netBalance)}
                    </div>
                </div>
            </div>

            <form onSubmit={handleFilter} className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500">Dari:</span>
                    <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="h-9 w-36 bg-white dark:bg-neutral-900 text-xs"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500">Sampai:</span>
                    <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="h-9 w-36 bg-white dark:bg-neutral-900 text-xs"
                    />
                </div>

                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-xs text-neutral-800 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
                >
                    <option value="">Semua Jenis (Masuk & Keluar)</option>
                    <option value="income">Pemasukan Saja</option>
                    <option value="expense">Pengeluaran Saja</option>
                </select>

                <Button type="submit" variant="outline" size="sm" className="h-9">
                    <Filter className="mr-1.5 size-3.5" /> Terapkan Filter
                </Button>
            </form>

            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-neutral-600 dark:text-neutral-400">
                        <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-bold uppercase tracking-wider text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-300">
                            <tr>
                                <th className="px-6 py-4">Tanggal</th>
                                <th className="px-6 py-4">Kategori</th>
                                <th className="px-6 py-4">Keterangan</th>
                                <th className="px-6 py-4">Dicatat Oleh</th>
                                <th className="px-6 py-4 text-right">Nominal</th>
                                <th className="px-6 py-4 text-center">Bukti Nota</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                            {cashFlows.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-neutral-400">
                                        <FileText className="mx-auto mb-2 size-8 text-neutral-300 dark:text-neutral-600" />
                                        Belum ada catatan kas pada rentang tanggal ini.
                                    </td>
                                </tr>
                            ) : (
                                cashFlows.data.map((entry) => {
                                    const isIncome = entry.type === 'income';

                                    return (
                                        <tr
                                            key={entry.id}
                                            className="hover:bg-neutral-50/80 transition-colors dark:hover:bg-neutral-800/40"
                                        >
                                            <td className="px-6 py-4 font-mono text-xs">
                                                {new Date(entry.flow_date).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </td>

                                            <td className="px-6 py-4">
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        isIncome
                                                            ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                                                            : 'border-red-300 bg-red-50 text-red-700'
                                                    }
                                                >
                                                    {isIncome ? 'Kas Masuk' : 'Pengeluaran'} • {entry.category}
                                                </Badge>
                                            </td>

                                            <td className="px-6 py-4 font-semibold text-neutral-900 dark:text-neutral-100">
                                                {entry.description}
                                            </td>

                                            <td className="px-6 py-4 text-xs">
                                                {entry.user?.name || 'Kasir'}
                                            </td>

                                            <td
                                                className={`px-6 py-4 text-right font-mono font-bold text-sm ${
                                                    isIncome
                                                        ? 'text-emerald-600 dark:text-emerald-400'
                                                        : 'text-red-600 dark:text-red-400'
                                                }`}
                                            >
                                                {isIncome ? '+' : '-'}
                                                {formatIDR(entry.amount)}
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                {entry.receipt_image ? (
                                                    <a
                                                        href={entry.receipt_image}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center text-xs font-semibold text-teal-600 hover:underline"
                                                    >
                                                        <Receipt className="mr-1 size-3.5" /> Lihat Struk
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-neutral-400">-</span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleDelete(entry)}
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

                {cashFlows.links && cashFlows.links.length > 3 && (
                    <div className="flex items-center justify-between border-t border-neutral-200 px-6 py-3 dark:border-neutral-800">
                        <div className="text-xs text-neutral-500">
                            Halaman {cashFlows.current_page} dari {cashFlows.last_page}
                        </div>
                        <div className="flex gap-1">
                            {cashFlows.links.map((link, idx) => (
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
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Catat Pemasukan / Pengeluaran Toko</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="flow_type">Jenis Transaksi</Label>
                                <select
                                    id="flow_type"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                    className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3 text-xs dark:border-neutral-700 dark:bg-neutral-900"
                                >
                                    <option value="expense">Pengeluaran (Kas Keluar)</option>
                                    <option value="income">Pemasukan (Kas Masuk)</option>
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="flow_cat">Kategori</Label>
                                <select
                                    id="flow_cat"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3 text-xs dark:border-neutral-700 dark:bg-neutral-900"
                                >
                                    <option value="belanja_bahan">Belanja Bahan & Stok</option>
                                    <option value="listrik">Listrik & Utilitas</option>
                                    <option value="air">Air & Kebersihan</option>
                                    <option value="gaji">Gaji / Upah Harian</option>
                                    <option value="modal_awal">Suntikan Modal Kasir</option>
                                    <option value="operasional">Operasional Lainnya</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="flow_amount">Nominal Uang (IDR)</Label>
                            <Input
                                id="flow_amount"
                                type="number"
                                min="1"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                placeholder="Contoh: 150000"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="flow_desc">Keterangan Keperluan</Label>
                            <Input
                                id="flow_desc"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Contoh: Beli minyak goreng 2 jerigen & sabun cuci"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="flow_date">Tanggal Transaksi</Label>
                            <Input
                                id="flow_date"
                                type="date"
                                value={formData.flow_date}
                                onChange={(e) => setFormData({ ...formData, flow_date: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="flow_receipt">Upload Foto Struk / Nota Fisik (Opsional)</Label>
                            <Input
                                id="flow_receipt"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" className="bg-teal-700 hover:bg-teal-800 text-white">
                                Simpan Catatan Kas
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

CashFlowsIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
