import { Head, router, usePage } from '@inertiajs/react';
import {
    Banknote,
    Clock,
    CreditCard,
    Minus,
    Plus,
    Printer,
    QrCode,
    Search,
    ShoppingBag,
    Trash2,
    Utensils,
    X,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import ReceiptModal, { type ReceiptData } from '@/components/receipt-modal';
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
    icon?: string | null;
    products_count?: number;
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
    category?: { id: number; name: string; slug: string } | null;
};

type DiningTable = {
    id: number;
    table_number: string;
    capacity: number;
    status: 'available' | 'occupied' | 'reserved';
};

type OrderItem = {
    id?: number;
    product_id: number;
    product_name: string;
    unit_cost_price?: number | string;
    unit_selling_price: number | string;
    quantity: number;
    total_price: number | string;
};

type Order = {
    id: number;
    invoice_number: string;
    customer_name?: string | null;
    order_type: 'dine_in' | 'take_away' | 'delivery';
    status: 'pending' | 'kitchen' | 'wait_list' | 'ready' | 'completed' | 'cancelled';
    subtotal: number | string;
    tax_amount: number | string;
    discount_amount: number | string;
    grand_total: number | string;
    notes?: string | null;
    created_at: string;
    dining_table?: DiningTable | null;
    items?: OrderItem[];
    payment?: {
        payment_method: string;
        amount_paid: number | string;
        change_given: number | string;
    } | null;
};

type CashierShift = {
    id: number;
    opened_at: string;
    initial_cash: number | string;
    system_total_cash: number | string;
    status: string;
};

type Props = {
    categories: Category[];
    products: Product[];
    tables: DiningTable[];
    activeOrders: Order[];
    currentShift: CashierShift | null;
    team: { id: number; name: string; slug: string };
};

type CartItem = {
    product: Product;
    quantity: number;
};

export default function PosIndex({
    categories = [],
    products = [],
    tables = [],
    activeOrders = [],
    currentShift,
    team,
}: Props) {
    const { flash } = usePage().props as { flash?: { success?: string; error?: string; recentOrder?: ReceiptData } };

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [orderQueueFilter, setOrderQueueFilter] = useState<string>('all');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedTableId, setSelectedTableId] = useState<number | ''>('');
    const [customerName, setCustomerName] = useState('');
    const [orderType, setOrderType] = useState<'dine_in' | 'take_away' | 'delivery'>('dine_in');
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'qris' | 'transfer'>('cash');
    const [cashGiven, setCashGiven] = useState<string>('');
    const [applyTax, setApplyTax] = useState(true);
    const [discountAmount, setDiscountAmount] = useState<number>(0);
    const [orderNotes, setOrderNotes] = useState('');

    const [receiptModalOpen, setReceiptModalOpen] = useState(false);
    const [currentReceipt, setCurrentReceipt] = useState<ReceiptData | null>(null);
    const [shiftModalOpen, setShiftModalOpen] = useState(false);
    const [closeShiftModalOpen, setCloseShiftModalOpen] = useState(false);
    const [initialCashInput, setInitialCashInput] = useState('500000');
    const [actualCashInput, setActualCashInput] = useState('');
    const [shiftNotes, setShiftNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formatIDR = (val: number | string) => {
        const num = typeof val === 'string' ? parseFloat(val) : val;
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(num || 0);
    };

    const filteredProducts = useMemo(() => {
        return products.filter((p) => {
            const matchesSearch =
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesCategory =
                selectedCategory === 'all' ||
                p.category?.slug === selectedCategory ||
                p.category_id?.toString() === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [products, searchQuery, selectedCategory]);

    const filteredOrders = useMemo(() => {
        return activeOrders.filter((order) => {
            if (orderQueueFilter === 'all') return true;
            if (orderQueueFilter === 'dine_in') return order.order_type === 'dine_in';
            if (orderQueueFilter === 'take_away') return order.order_type === 'take_away';
            if (orderQueueFilter === 'wait_list') return order.status === 'wait_list';
            if (orderQueueFilter === 'kitchen') return order.status === 'kitchen';
            if (orderQueueFilter === 'ready') return order.status === 'ready';
            return true;
        });
    }, [activeOrders, orderQueueFilter]);

    const cartSubtotal = useMemo(() => {
        return cart.reduce((sum, item) => {
            const price = Number(item.product.selling_price) || 0;
            return sum + price * item.quantity;
        }, 0);
    }, [cart]);

    const taxAmount = useMemo(() => {
        return applyTax ? Math.round(cartSubtotal * 0.1) : 0;
    }, [applyTax, cartSubtotal]);

    const grandTotal = useMemo(() => {
        return Math.max(0, cartSubtotal + taxAmount - discountAmount);
    }, [cartSubtotal, taxAmount, discountAmount]);

    const changeDue = useMemo(() => {
        const paid = parseFloat(cashGiven) || 0;
        return Math.max(0, paid - grandTotal);
    }, [cashGiven, grandTotal]);

    const addToCart = (product: Product) => {
        setCart((prev) => {
            const exists = prev.find((item) => item.product.id === product.id);
            if (exists) {
                return prev.map((item) =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: number) => {
        setCart((prev) => {
            const exists = prev.find((item) => item.product.id === productId);
            if (!exists) return prev;
            if (exists.quantity === 1) {
                return prev.filter((item) => item.product.id !== productId);
            }
            return prev.map((item) =>
                item.product.id === productId
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            );
        });
    };

    const deleteFromCart = (productId: number) => {
        setCart((prev) => prev.filter((item) => item.product.id !== productId));
    };

    const clearCart = () => {
        setCart([]);
        setCashGiven('');
        setOrderNotes('');
        setSelectedTableId('');
        setCustomerName('');
    };

    const getProductQtyInCart = (productId: number) => {
        return cart.find((i) => i.product.id === productId)?.quantity || 0;
    };

    const handleCheckout = (customStatus: 'completed' | 'kitchen' | 'wait_list' = 'completed') => {
        if (cart.length === 0) return;

        const paid = paymentMethod === 'cash' ? parseFloat(cashGiven) || grandTotal : grandTotal;

        if (paymentMethod === 'cash' && paid < grandTotal && customStatus === 'completed') {
            alert('Jumlah uang bayar kurang dari total belanja!');
            return;
        }

        setIsSubmitting(true);

        const payload = {
            customer_name: customerName || (selectedTableId ? `Meja ${tables.find((t) => t.id === Number(selectedTableId))?.table_number}` : 'Pelanggan Umum'),
            dining_table_id: selectedTableId ? Number(selectedTableId) : null,
            order_type: orderType,
            notes: orderNotes,
            tax_amount: taxAmount,
            discount_amount: discountAmount,
            payment_method: paymentMethod,
            amount_paid: paid,
            status: customStatus,
            items: cart.map((i) => ({
                product_id: i.product.id,
                quantity: i.quantity,
            })),
        };

        router.post(`/${team.slug}/pos/order`, payload, {
            onSuccess: (page) => {
                setIsSubmitting(false);
                const orderData = page.props.flash?.recentOrder as ReceiptData | undefined;
                if (orderData) {
                    setCurrentReceipt(orderData);
                    setReceiptModalOpen(true);
                }
                clearCart();
            },
            onError: (err) => {
                setIsSubmitting(false);
                alert('Gagal memproses pesanan: ' + JSON.stringify(err));
            },
        });
    };

    const handleUpdateOrderStatus = (orderId: number, status: string) => {
        router.patch(`/${team.slug}/pos/orders/${orderId}/status`, { status });
    };

    const handleOpenShift = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(
            `/${team.slug}/shifts/start`,
            {
                initial_cash: parseFloat(initialCashInput) || 0,
                notes: shiftNotes,
            },
            {
                onSuccess: () => setShiftModalOpen(false),
            }
        );
    };

    const handleCloseShift = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentShift) return;
        router.patch(
            `/${team.slug}/shifts/${currentShift.id}/close`,
            {
                actual_cash: parseFloat(actualCashInput) || 0,
                notes: shiftNotes,
            },
            {
                onSuccess: () => setCloseShiftModalOpen(false),
            }
        );
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#F6F8FA] dark:bg-neutral-950">
            <Head title="Order Line & POS Kasir - Tasty Station" />

            <div className="flex flex-1 flex-col overflow-y-auto">
                <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-3 dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400">
                            <ShoppingBag className="size-5" />
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                                {team.name} • Kasir Pintar
                            </h1>
                            <p className="text-xs text-neutral-500">
                                Terminal Kasir & Antrian Pesanan Cepat
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {currentShift ? (
                            <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span>Shift Aktif: Kas {formatIDR(currentShift.system_total_cash)}</span>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setCloseShiftModalOpen(true)}
                                    className="h-6 text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 p-1"
                                >
                                    Tutup Kas
                                </Button>
                            </div>
                        ) : (
                            <Button
                                size="sm"
                                onClick={() => setShiftModalOpen(true)}
                                className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-8"
                            >
                                <Banknote className="mr-1.5 size-3.5" /> Buka Shift Kasir
                            </Button>
                        )}
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                                    Order Line
                                </h2>
                                <p className="text-xs text-neutral-500">
                                    Pantau antrian dapur dan status pesanan berjalan
                                </p>
                            </div>

                            <div className="relative w-full sm:w-80">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari menu, SKU, atau barang..."
                                    className="h-10 pl-9 rounded-full bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-sm"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                                    >
                                        <X className="size-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                            {[
                                { key: 'all', label: 'All', count: activeOrders.length, color: 'bg-teal-700 text-white' },
                                { key: 'dine_in', label: 'Dine in', count: activeOrders.filter((o) => o.order_type === 'dine_in').length, color: 'bg-emerald-600 text-white' },
                                { key: 'wait_list', label: 'Wait List', count: activeOrders.filter((o) => o.status === 'wait_list').length, color: 'bg-amber-600 text-white' },
                                { key: 'take_away', label: 'Take Away', count: activeOrders.filter((o) => o.order_type === 'take_away').length, color: 'bg-purple-600 text-white' },
                                { key: 'ready', label: 'Ready', count: activeOrders.filter((o) => o.status === 'ready').length, color: 'bg-blue-600 text-white' },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setOrderQueueFilter(tab.key)}
                                    className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                                        orderQueueFilter === tab.key
                                            ? `${tab.color} shadow-sm`
                                            : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-800'
                                    }`}
                                >
                                    <span>{tab.label}</span>
                                    <span
                                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                                            orderQueueFilter === tab.key
                                                ? 'bg-white/20 text-white'
                                                : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                                        }`}
                                    >
                                        {String(tab.count).padStart(2, '0')}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {filteredOrders.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {filteredOrders.slice(0, 3).map((order) => {
                                    const totalItems = order.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
                                    const isKitchen = order.status === 'kitchen';
                                    const isWait = order.status === 'wait_list';
                                    const isReady = order.status === 'ready';

                                    const cardBg = isKitchen
                                        ? 'bg-[#EAF9F5] border-teal-200 dark:bg-teal-950/20 dark:border-teal-800/40'
                                        : isWait
                                        ? 'bg-[#FEF3EE] border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/40'
                                        : 'bg-[#F5EFFE] border-purple-200 dark:bg-purple-950/20 dark:border-purple-800/40';

                                    return (
                                        <div
                                            key={order.id}
                                            className={`rounded-2xl border p-4 shadow-sm transition hover:shadow-md ${cardBg}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-sm text-neutral-800 dark:text-neutral-200">
                                                    Order #{order.invoice_number.slice(-4)}
                                                </span>
                                                <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                                                    {order.dining_table ? order.dining_table.table_number : 'Take Away'}
                                                </span>
                                            </div>

                                            <div className="mt-2 text-xs font-bold text-neutral-700 dark:text-neutral-300">
                                                Item: {totalItems}X
                                            </div>

                                            <div className="mt-3 flex items-center justify-between">
                                                <span className="flex items-center gap-1 text-[11px] text-neutral-500">
                                                    <Clock className="size-3" />
                                                    {new Date(order.created_at).toLocaleTimeString('id-ID', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>

                                                <button
                                                    onClick={() =>
                                                        handleUpdateOrderStatus(
                                                            order.id,
                                                            isKitchen ? 'ready' : isReady ? 'completed' : 'kitchen'
                                                        )
                                                    }
                                                    className={`rounded-full px-3 py-1 text-[11px] font-bold shadow-xs transition ${
                                                        isKitchen
                                                            ? 'bg-teal-700 text-white hover:bg-teal-800'
                                                            : isWait
                                                            ? 'bg-amber-600 text-white hover:bg-amber-700'
                                                            : 'bg-purple-600 text-white hover:bg-purple-700'
                                                    }`}
                                                >
                                                    {isKitchen ? 'In Kitchen ➔ Ready' : isWait ? 'Wait List ➔ Kitchen' : 'Ready ➔ Selesai'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                                Foodies Menu
                            </h2>
                            <span className="text-xs text-neutral-500">
                                Menampilkan {filteredProducts.length} produk siap jual
                            </span>
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto pb-2">
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                                    selectedCategory === 'all'
                                        ? 'bg-teal-600 text-white shadow-sm'
                                        : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-800'
                                }`}
                            >
                                <Utensils className="size-3.5" />
                                <span>All Menu</span>
                                <span className="opacity-80">({products.length})</span>
                            </button>

                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.slug)}
                                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                                        selectedCategory === cat.slug
                                            ? 'bg-teal-600 text-white shadow-sm'
                                            : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-800'
                                    }`}
                                >
                                    <span>{cat.name}</span>
                                    {cat.products_count !== undefined && (
                                        <span className="opacity-80">({cat.products_count})</span>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {filteredProducts.map((product) => {
                                const qty = getProductQtyInCart(product.id);
                                const isLowStock = product.stock <= product.min_stock_alert;

                                return (
                                    <div
                                        key={product.id}
                                        className="group flex flex-col justify-between rounded-2xl border border-neutral-200/80 bg-white p-3.5 shadow-sm transition-all hover:border-teal-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
                                    >
                                        <div className="flex flex-col items-center text-center">
                                            <div className="relative mb-3 size-24 overflow-hidden rounded-full border-2 border-neutral-100 shadow-inner group-hover:scale-105 transition-transform dark:border-neutral-800">
                                                <img
                                                    src={
                                                        product.image_path ||
                                                        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop&q=80'
                                                    }
                                                    alt={product.name}
                                                    className="size-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src =
                                                            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop&q=80';
                                                    }}
                                                />
                                                {isLowStock && (
                                                    <span className="absolute bottom-0 inset-x-0 bg-red-600/90 text-white text-[9px] font-bold py-0.5">
                                                        Sisa {product.stock}
                                                    </span>
                                                )}
                                            </div>

                                            <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                                                {product.category?.name || 'Dish'}
                                            </span>

                                            <h3 className="line-clamp-1 text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                                {product.name}
                                            </h3>

                                            <div className="mt-1 text-sm font-extrabold text-neutral-900 dark:text-neutral-100">
                                                {formatIDR(product.selling_price)}
                                            </div>
                                        </div>

                                        <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-neutral-50 p-1 dark:bg-neutral-800/60">
                                            <button
                                                type="button"
                                                disabled={qty === 0}
                                                onClick={() => removeFromCart(product.id)}
                                                className="flex size-7 items-center justify-center rounded-lg bg-white text-neutral-600 shadow-xs transition hover:bg-neutral-100 disabled:opacity-30 dark:bg-neutral-700 dark:text-neutral-300"
                                            >
                                                <Minus className="size-3" />
                                            </button>

                                            <span className="w-6 text-center text-xs font-bold text-neutral-800 dark:text-neutral-200">
                                                {qty}
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() => addToCart(product)}
                                                className="flex size-7 items-center justify-center rounded-lg bg-teal-600 text-white shadow-xs transition hover:bg-teal-700"
                                            >
                                                <Plus className="size-3" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex w-96 flex-col border-l border-neutral-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
                <div className="border-b border-neutral-200 p-5 dark:border-neutral-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-extrabold text-sm text-neutral-900 dark:text-neutral-100">
                                    {selectedTableId
                                        ? tables.find((t) => t.id === Number(selectedTableId))?.table_number
                                        : 'Take Away / Umum'}
                                </span>
                            </div>
                            <p className="text-[11px] text-neutral-500">
                                Order #{team.slug.toUpperCase().slice(0, 3)}-{String(activeOrders.length + 1).padStart(4, '0')}
                            </p>
                        </div>

                        <div className="flex items-center gap-1">
                            {cart.length > 0 && (
                                <button
                                    onClick={clearCart}
                                    title="Bersihkan Keranjang"
                                    className="p-1.5 text-neutral-400 hover:text-red-500 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                >
                                    <Trash2 className="size-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                        <select
                            value={orderType}
                            onChange={(e) => setOrderType(e.target.value as any)}
                            className="h-8 rounded-lg border border-neutral-200 bg-neutral-50 px-2 text-xs font-semibold text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
                        >
                            <option value="dine_in">Dine In (Makan Sini)</option>
                            <option value="take_away">Take Away (Bungkus)</option>
                            <option value="delivery">Delivery</option>
                        </select>

                        <select
                            value={selectedTableId}
                            onChange={(e) => setSelectedTableId(e.target.value ? Number(e.target.value) : '')}
                            className="h-8 rounded-lg border border-neutral-200 bg-neutral-50 px-2 text-xs font-semibold text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
                        >
                            <option value="">Pilih Meja...</option>
                            {tables.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.table_number} ({t.capacity} org) {t.status === 'occupied' ? '• Terisi' : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Input
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Nama Pelanggan (opsional)"
                        className="mt-2 h-8 text-xs bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                    />
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-neutral-600 dark:text-neutral-400">
                        <span>Ordered Items</span>
                        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-bold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                            {String(cart.reduce((sum, i) => sum + i.quantity, 0)).padStart(2, '0')}
                        </span>
                    </div>

                    {cart.length === 0 ? (
                        <div className="flex h-44 flex-col items-center justify-center text-center text-neutral-400">
                            <ShoppingBag className="mb-2 size-8 stroke-1 text-neutral-300 dark:text-neutral-600" />
                            <p className="text-xs">Keranjang masih kosong</p>
                            <p className="text-[11px] text-neutral-400">Pilih menu dari daftar sebelah kiri</p>
                        </div>
                    ) : (
                        cart.map((item) => {
                            const lineTotal = Number(item.product.selling_price) * item.quantity;
                            return (
                                <div
                                    key={item.product.id}
                                    className="flex items-center justify-between rounded-xl bg-neutral-50 p-2.5 transition hover:bg-neutral-100/70 dark:bg-neutral-800/50 dark:hover:bg-neutral-800"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => removeFromCart(item.product.id)}
                                                className="text-neutral-400 hover:text-red-500"
                                            >
                                                <Minus className="size-3" />
                                            </button>
                                            <span className="text-xs font-bold text-teal-600">
                                                {item.quantity}x
                                            </span>
                                            <button
                                                onClick={() => addToCart(item.product)}
                                                className="text-neutral-400 hover:text-teal-600"
                                            >
                                                <Plus className="size-3" />
                                            </button>
                                        </div>
                                        <div className="ml-1">
                                            <p className="line-clamp-1 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                                                {item.product.name}
                                            </p>
                                            <p className="text-[10px] text-neutral-400">
                                                @{formatIDR(item.product.selling_price)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                            {formatIDR(lineTotal)}
                                        </span>
                                        <button
                                            onClick={() => deleteFromCart(item.product.id)}
                                            className="text-neutral-300 hover:text-red-500"
                                        >
                                            <X className="size-3.5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="border-t border-neutral-200 bg-neutral-50/50 p-4 space-y-3 dark:border-neutral-800 dark:bg-neutral-950/40">
                    <div className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                                {formatIDR(cartSubtotal)}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={applyTax}
                                    onChange={(e) => setApplyTax(e.target.checked)}
                                    className="rounded border-neutral-300 text-teal-600 size-3.5"
                                />
                                <span>Pajak (PPN 10%)</span>
                            </label>
                            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                                {formatIDR(taxAmount)}
                            </span>
                        </div>

                        <div className="flex justify-between items-center text-emerald-700 dark:text-emerald-400">
                            <span>Diskon</span>
                            <div className="flex items-center gap-1">
                                <span>-</span>
                                <Input
                                    type="number"
                                    value={discountAmount || ''}
                                    onChange={(e) => setDiscountAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                                    placeholder="0"
                                    className="h-6 w-20 text-right text-xs p-1 bg-white dark:bg-neutral-900"
                                />
                            </div>
                        </div>

                        <div className="flex justify-between pt-2 border-t border-neutral-200 text-sm font-extrabold text-neutral-900 dark:border-neutral-800 dark:text-neutral-100">
                            <span>Total Payable</span>
                            <span className="text-teal-600 dark:text-teal-400">
                                {formatIDR(grandTotal)}
                            </span>
                        </div>
                    </div>

                    <div>
                        <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                            Payment Method
                        </span>
                        <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                            {[
                                { key: 'cash', label: 'Cash', icon: Banknote },
                                { key: 'card', label: 'Card', icon: CreditCard },
                                { key: 'qris', label: 'Scan', icon: QrCode },
                            ].map((pm) => {
                                const Icon = pm.icon;
                                const isSelected = paymentMethod === pm.key;
                                return (
                                    <button
                                        key={pm.key}
                                        type="button"
                                        onClick={() => setPaymentMethod(pm.key as any)}
                                        className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold transition ${
                                            isSelected
                                                ? 'border-teal-600 bg-teal-50 text-teal-700 dark:border-teal-500 dark:bg-teal-950/40 dark:text-teal-300'
                                                : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400'
                                        }`}
                                    >
                                        <Icon className="size-3.5" />
                                        <span>{pm.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {paymentMethod === 'cash' && (
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-[11px]">
                                <span className="text-neutral-500 font-semibold">Uang Diterima:</span>
                                <span className="font-bold text-neutral-800 dark:text-neutral-200">
                                    Kembalian: {formatIDR(changeDue)}
                                </span>
                            </div>
                            <Input
                                type="number"
                                value={cashGiven}
                                onChange={(e) => setCashGiven(e.target.value)}
                                placeholder={`Nominal bayar (min ${formatIDR(grandTotal)})`}
                                className="h-8 text-xs font-bold bg-white dark:bg-neutral-900"
                            />
                            <div className="flex gap-1 overflow-x-auto">
                                {[grandTotal, 50000, 100000, 200000, 500000]
                                    .filter((v, i, arr) => arr.indexOf(v) === i && v >= grandTotal)
                                    .slice(0, 3)
                                    .map((preset) => (
                                        <button
                                            key={preset}
                                            type="button"
                                            onClick={() => setCashGiven(String(preset))}
                                            className="rounded bg-neutral-200/60 px-2 py-0.5 text-[10px] font-bold text-neutral-700 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-300"
                                        >
                                            {preset === grandTotal ? 'Uang Pas' : formatIDR(preset)}
                                        </button>
                                    ))}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                if (cart.length === 0) return;
                                setCurrentReceipt({
                                    invoice_number: `PREVIEW-${Date.now().toString().slice(-4)}`,
                                    customer_name: customerName || 'Pelanggan Umum',
                                    order_type: orderType,
                                    dining_table: selectedTableId ? tables.find((t) => t.id === Number(selectedTableId)) : null,
                                    created_at: new Date().toISOString(),
                                    subtotal: cartSubtotal,
                                    tax_amount: taxAmount,
                                    discount_amount: discountAmount,
                                    grand_total: grandTotal,
                                    items: cart.map((i) => ({
                                        product_name: i.product.name,
                                        unit_selling_price: i.product.selling_price,
                                        quantity: i.quantity,
                                        total_price: Number(i.product.selling_price) * i.quantity,
                                    })),
                                    payment: {
                                        payment_method: paymentMethod,
                                        amount_paid: cashGiven ? parseFloat(cashGiven) : grandTotal,
                                        change_given: changeDue,
                                    },
                                });
                                setReceiptModalOpen(true);
                            }}
                            className="h-11 px-3 border-neutral-300 dark:border-neutral-700"
                            title="Preview & Cetak Struk"
                        >
                            <Printer className="size-4" />
                        </Button>

                        <Button
                            type="button"
                            disabled={cart.length === 0 || isSubmitting}
                            onClick={() => handleCheckout('completed')}
                            className="flex-1 h-11 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-md transition"
                        >
                            <Clock className="mr-1.5 size-4" />
                            {isSubmitting ? 'Memproses...' : 'Place Order & Bayar'}
                        </Button>
                    </div>

                    {cart.length > 0 && (
                        <button
                            type="button"
                            onClick={() => handleCheckout('kitchen')}
                            className="w-full text-center text-[11px] font-bold text-amber-600 hover:underline pt-1"
                        >
                            + Tahan Pesanan (Kirim ke Dapur / Hold Order)
                        </button>
                    )}
                </div>
            </div>

            <ReceiptModal
                open={receiptModalOpen}
                onOpenChange={setReceiptModalOpen}
                receipt={currentReceipt}
                storeName={team.name}
            />

            <Dialog open={shiftModalOpen} onOpenChange={setShiftModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Buka Shift Kasir Baru</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleOpenShift} className="space-y-4">
                        <div>
                            <Label htmlFor="initial_cash">Modal Kas Awal di Laci (IDR)</Label>
                            <Input
                                id="initial_cash"
                                type="number"
                                value={initialCashInput}
                                onChange={(e) => setInitialCashInput(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="shift_notes">Catatan Shift (Opsional)</Label>
                            <Input
                                id="shift_notes"
                                value={shiftNotes}
                                onChange={(e) => setShiftNotes(e.target.value)}
                                placeholder="Contoh: Shift Pagi Kasir 1"
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white">
                                Buka Kasir Sekarang
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={closeShiftModalOpen} onOpenChange={setCloseShiftModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tutup Shift & Rekonsiliasi Kas</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCloseShift} className="space-y-4">
                        <div className="rounded-lg bg-neutral-100 p-3 text-xs dark:bg-neutral-800 space-y-1">
                            <div className="flex justify-between">
                                <span>Kas Awal:</span>
                                <span className="font-semibold">{formatIDR(currentShift?.initial_cash || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Total Menurut Sistem:</span>
                                <span className="font-bold text-teal-600">{formatIDR(currentShift?.system_total_cash || 0)}</span>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="actual_cash">Hitungan Uang Fisik di Laci (IDR)</Label>
                            <Input
                                id="actual_cash"
                                type="number"
                                value={actualCashInput}
                                onChange={(e) => setActualCashInput(e.target.value)}
                                placeholder="Masukkan jumlah uang fisik di laci"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="close_notes">Catatan Rekonsiliasi</Label>
                            <Input
                                id="close_notes"
                                value={shiftNotes}
                                onChange={(e) => setShiftNotes(e.target.value)}
                                placeholder="Contoh: Selisih Rp 0, aman"
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">
                                Tutup Shift Kasir
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

PosIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
