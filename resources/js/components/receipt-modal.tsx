import { Printer } from 'lucide-react';
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export type ReceiptData = {
    invoice_number: string;
    customer_name?: string | null;
    order_type?: string;
    dining_table?: { table_number: string } | null;
    created_at: string;
    user?: { name: string } | null;
    subtotal: number | string;
    tax_amount: number | string;
    discount_amount: number | string;
    grand_total: number | string;
    notes?: string | null;
    items?: Array<{
        product_name: string;
        unit_selling_price: number | string;
        quantity: number;
        total_price: number | string;
    }>;
    payment?: {
        payment_method: string;
        amount_paid: number | string;
        change_given: number | string;
        reference_no?: string | null;
    } | null;
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    receipt: ReceiptData | null;
    storeName?: string;
};

export default function ReceiptModal({
    open,
    onOpenChange,
    receipt,
    storeName = 'Tasty Station POS',
}: Props) {
    const printRef = useRef<HTMLDivElement>(null);

    if (!receipt) return null;

    const formatCurrency = (val: number | string) => {
        const num = typeof val === 'string' ? parseFloat(val) : val;
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(num || 0);
    };

    const handlePrint = () => {
        window.print();
    };

    const orderTypeLabel = {
        dine_in: 'Dine In',
        take_away: 'Take Away',
        delivery: 'Delivery',
    }[receipt.order_type || 'dine_in'] || receipt.order_type;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md p-6">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Struk Transaksi Pembayaran</span>
                    </DialogTitle>
                </DialogHeader>

                <div
                    ref={printRef}
                    id="receipt-print-area"
                    className="my-2 rounded-lg border border-dashed border-neutral-300 bg-white p-5 font-mono text-xs text-black shadow-inner dark:border-neutral-700 dark:bg-neutral-50 dark:text-neutral-900"
                >
                    <div className="text-center">
                        <h2 className="text-base font-bold tracking-wider uppercase">
                            {storeName}
                        </h2>
                        <p className="text-[11px] text-neutral-600">
                            Modern Point of Sale System
                        </p>
                        <p className="text-[11px] text-neutral-500">
                            Telp: 0812-3456-7890
                        </p>
                    </div>

                    <div className="my-3 border-b border-dashed border-neutral-400" />

                    <div className="space-y-1 text-[11px]">
                        <div className="flex justify-between">
                            <span>No. Nota</span>
                            <span className="font-semibold">{receipt.invoice_number}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tanggal</span>
                            <span>{new Date(receipt.created_at).toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Kasir</span>
                            <span>{receipt.user?.name || 'Kasir'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Pelanggan</span>
                            <span>{receipt.customer_name || 'Pelanggan Umum'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tipe</span>
                            <span>
                                {orderTypeLabel}{' '}
                                {receipt.dining_table
                                    ? `(${receipt.dining_table.table_number})`
                                    : ''}
                            </span>
                        </div>
                    </div>

                    <div className="my-3 border-b border-dashed border-neutral-400" />

                    <div className="space-y-2">
                        {receipt.items?.map((item, idx) => (
                            <div key={idx} className="text-[11px]">
                                <div className="font-medium text-neutral-800">
                                    {item.product_name}
                                </div>
                                <div className="flex justify-between text-neutral-600">
                                    <span>
                                        {item.quantity} x{' '}
                                        {formatCurrency(item.unit_selling_price)}
                                    </span>
                                    <span className="font-semibold text-neutral-800">
                                        {formatCurrency(item.total_price)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="my-3 border-b border-dashed border-neutral-400" />

                    <div className="space-y-1 text-[11px]">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>{formatCurrency(receipt.subtotal)}</span>
                        </div>
                        {Number(receipt.tax_amount) > 0 && (
                            <div className="flex justify-between">
                                <span>Pajak (PPN)</span>
                                <span>{formatCurrency(receipt.tax_amount)}</span>
                            </div>
                        )}
                        {Number(receipt.discount_amount) > 0 && (
                            <div className="flex justify-between text-emerald-700">
                                <span>Diskon</span>
                                <span>-{formatCurrency(receipt.discount_amount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between pt-1 text-sm font-bold border-t border-dashed border-neutral-300">
                            <span>TOTAL</span>
                            <span>{formatCurrency(receipt.grand_total)}</span>
                        </div>
                    </div>

                    <div className="my-3 border-b border-dashed border-neutral-400" />

                    <div className="space-y-1 text-[11px]">
                        <div className="flex justify-between">
                            <span>Metode Bayar</span>
                            <span className="font-semibold uppercase">
                                {receipt.payment?.payment_method || 'CASH'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Bayar</span>
                            <span>
                                {formatCurrency(
                                    receipt.payment?.amount_paid || receipt.grand_total
                                )}
                            </span>
                        </div>
                        <div className="flex justify-between font-bold text-neutral-900">
                            <span>Kembalian</span>
                            <span>
                                {formatCurrency(receipt.payment?.change_given || 0)}
                            </span>
                        </div>
                    </div>

                    <div className="mt-5 text-center text-[10px] text-neutral-500">
                        <p>Terima kasih atas kunjungan Anda!</p>
                        <p>Barang yang sudah dibeli tidak dapat ditukar/dikembalikan</p>
                    </div>
                </div>

                <DialogFooter className="flex sm:justify-between gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Tutup
                    </Button>
                    <Button
                        type="button"
                        onClick={handlePrint}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        <Printer className="mr-2 size-4" /> Cetak Struk (Print)
                    </Button>
                </DialogFooter>

                <style dangerouslySetInnerHTML={{
                    __html: `
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        #receipt-print-area, #receipt-print-area * {
                            visibility: visible;
                        }
                        #receipt-print-area {
                            position: fixed;
                            left: 0;
                            top: 0;
                            width: 80mm;
                            margin: 0;
                            padding: 10px;
                            border: none !important;
                            box-shadow: none !important;
                        }
                    }
                    `
                }} />
            </DialogContent>
        </Dialog>
    );
}
