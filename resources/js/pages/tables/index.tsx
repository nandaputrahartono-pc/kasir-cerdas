import { Head, router } from '@inertiajs/react';
import { Armchair, Edit2, Plus, Trash2, Users } from 'lucide-react';
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

type Order = {
    id: number;
    invoice_number: string;
    customer_name?: string | null;
    status: string;
    grand_total: number | string;
    created_at: string;
};

type DiningTable = {
    id: number;
    table_number: string;
    capacity: number;
    status: 'available' | 'occupied' | 'reserved';
    orders?: Order[];
};

type Props = {
    tables: DiningTable[];
    team: {
        id: number;
        name: string;
        slug: string;
    };
};

export default function TablesIndex({ tables = [], team }: Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTable, setEditingTable] = useState<DiningTable | null>(null);
    const [formData, setFormData] = useState({
        table_number: '',
        capacity: '4',
        status: 'available',
    });

    const openAddModal = () => {
        setEditingTable(null);
        setFormData({
            table_number: `Table ${String(tables.length + 1).padStart(2, '0')}`,
            capacity: '4',
            status: 'available',
        });
        setModalOpen(true);
    };

    const openEditModal = (table: DiningTable) => {
        setEditingTable(table);
        setFormData({
            table_number: table.table_number,
            capacity: String(table.capacity),
            status: table.status,
        });
        setModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingTable) {
            router.put(`/${team.slug}/tables/${editingTable.id}`, formData, {
                onSuccess: () => setModalOpen(false),
            });
        } else {
            router.post(`/${team.slug}/tables`, formData, {
                onSuccess: () => setModalOpen(false),
            });
        }
    };

    const handleDelete = (table: DiningTable) => {
        if (confirm(`Hapus meja "${table.table_number}"?`)) {
            router.delete(`/${team.slug}/tables/${table.id}`);
        }
    };

    const formatIDR = (val: number | string) => {
        const num = typeof val === 'string' ? parseFloat(val) : val;
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(num || 0);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <Head title="Kelola Meja Restoran - Kasir Cerdas" />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-100">
                        Manajemen Meja Makan
                    </h1>
                    <p className="text-sm text-neutral-500">
                        Atur nomor meja, kapasitas duduk, dan pantau status keterisian meja secara langsung
                    </p>
                </div>

                <Button
                    onClick={openAddModal}
                    className="bg-teal-700 hover:bg-teal-800 text-white font-bold"
                >
                    <Plus className="mr-2 size-4" /> Tambah Meja Baru
                </Button>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                    <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                        Meja Kosong (Tersedia)
                    </span>
                    <div className="mt-1 text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">
                        {tables.filter((t) => t.status === 'available').length} Meja
                    </div>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
                    <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                        Meja Terisi (Sedang Makan)
                    </span>
                    <div className="mt-1 text-2xl font-extrabold text-amber-700 dark:text-amber-400">
                        {tables.filter((t) => t.status === 'occupied').length} Meja
                    </div>
                </div>

                <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900/50 dark:bg-blue-950/20">
                    <span className="text-xs font-semibold text-blue-800 dark:text-blue-300">
                        Reservasi
                    </span>
                    <div className="mt-1 text-2xl font-extrabold text-blue-700 dark:text-blue-400">
                        {tables.filter((t) => t.status === 'reserved').length} Meja
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {tables.map((table) => {
                    const isAvailable = table.status === 'available';
                    const isOccupied = table.status === 'occupied';
                    const activeOrder = table.orders?.[0];

                    const borderCol = isAvailable
                        ? 'border-emerald-200 hover:border-emerald-400 bg-white dark:bg-neutral-900'
                        : isOccupied
                        ? 'border-amber-300 bg-amber-50/30 dark:bg-amber-950/20'
                        : 'border-blue-300 bg-blue-50/30 dark:bg-blue-950/20';

                    return (
                        <div
                            key={table.id}
                            className={`flex flex-col justify-between rounded-2xl border p-4 shadow-sm transition hover:shadow-md ${borderCol}`}
                        >
                            <div>
                                <div className="flex items-center justify-between">
                                    <div className="flex size-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 font-bold">
                                        <Armchair className="size-4" />
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className={
                                            isAvailable
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                                : isOccupied
                                                ? 'bg-amber-50 text-amber-700 border-amber-300'
                                                : 'bg-blue-50 text-blue-700 border-blue-300'
                                        }
                                    >
                                        {isAvailable ? 'Tersedia' : isOccupied ? 'Terisi' : 'Reservasi'}
                                    </Badge>
                                </div>

                                <div className="mt-3">
                                    <h3 className="text-base font-extrabold text-neutral-900 dark:text-neutral-100">
                                        {table.table_number}
                                    </h3>
                                    <div className="flex items-center gap-1 text-xs text-neutral-500 mt-0.5">
                                        <Users className="size-3" />
                                        <span>Kapasitas {table.capacity} Orang</span>
                                    </div>
                                </div>

                                {isOccupied && activeOrder && (
                                    <div className="mt-3 rounded-lg bg-white/80 p-2 text-xs border border-amber-200 dark:bg-neutral-800/80 dark:border-neutral-700">
                                        <div className="font-bold text-neutral-800 dark:text-neutral-200">
                                            {activeOrder.customer_name || 'Pelanggan'}
                                        </div>
                                        <div className="flex justify-between text-neutral-500 text-[11px] mt-0.5">
                                            <span>#{activeOrder.invoice_number.slice(-4)}</span>
                                            <span className="font-bold text-teal-600">
                                                {formatIDR(activeOrder.grand_total)}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3 dark:border-neutral-800">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => openEditModal(table)}
                                    className="h-7 text-xs text-neutral-600 hover:text-teal-600"
                                >
                                    <Edit2 className="mr-1 size-3" /> Edit
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDelete(table)}
                                    className="h-7 text-xs text-red-500 hover:text-red-700"
                                >
                                    <Trash2 className="size-3" />
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingTable ? 'Edit Informasi Meja' : 'Tambah Meja Baru'}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="tbl_num">Nomor / Nama Meja</Label>
                            <Input
                                id="tbl_num"
                                value={formData.table_number}
                                onChange={(e) => setFormData({ ...formData, table_number: e.target.value })}
                                placeholder="Contoh: Table 10 / VIP 01"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="tbl_cap">Kapasitas Tempat Duduk (Orang)</Label>
                            <Input
                                id="tbl_cap"
                                type="number"
                                min="1"
                                value={formData.capacity}
                                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                required
                            />
                        </div>

                        {editingTable && (
                            <div>
                                <Label htmlFor="tbl_status">Status Meja</Label>
                                <select
                                    id="tbl_status"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                                >
                                    <option value="available">Tersedia (Kosong)</option>
                                    <option value="occupied">Terisi (Sedang Makan)</option>
                                    <option value="reserved">Reservasi</option>
                                </select>
                            </div>
                        )}

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" className="bg-teal-700 hover:bg-teal-800 text-white">
                                {editingTable ? 'Simpan Perubahan' : 'Tambah Meja'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

TablesIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
