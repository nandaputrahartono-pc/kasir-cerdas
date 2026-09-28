import { Head, Link, usePage } from '@inertiajs/react';
import {
    Armchair,
    BarChart3,
    LogIn,
    Printer,
    ShoppingBag,
    Sparkles,
    UtensilsCrossed,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { dashboard, login, register } from '@/routes';

export default function Welcome() {
    const { auth, currentTeam } = usePage().props as {
        auth?: { user?: { name: string; email: string } | null };
        currentTeam?: { name: string; slug: string } | null;
    };

    const dashboardUrl = currentTeam ? dashboard(currentTeam.slug) : '/';
    const posUrl = currentTeam ? `/${currentTeam.slug}/pos` : '/tasty-station/pos';

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col justify-between selection:bg-teal-500 selection:text-white font-sans">
            <Head title="Kasir Cerdas - Modern POS & Store Management" />

            <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-neutral-900/80 border-b border-neutral-200/80 dark:border-neutral-800">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md shadow-teal-500/20">
                            <ShoppingBag className="size-5" />
                        </div>
                        <div>
                            <span className="font-black text-lg tracking-tight bg-gradient-to-r from-teal-700 to-emerald-600 bg-clip-text text-transparent dark:from-teal-400 dark:to-emerald-400">
                                Kasir Cerdas
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider block text-neutral-400">
                                Enterprise POS
                            </span>
                        </div>
                    </div>

                    <nav className="flex items-center gap-3">
                        {auth?.user ? (
                            <div className="flex items-center gap-2">
                                <Button asChild variant="outline" className="text-xs h-9">
                                    <Link href={dashboardUrl}>Dashboard</Link>
                                </Button>
                                <Button asChild className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs h-9 shadow-md">
                                    <Link href={posUrl}>
                                        <ShoppingBag className="mr-1.5 size-3.5" /> Buka Mesin Kasir
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Button asChild variant="ghost" className="text-xs font-semibold h-9">
                                    <Link href={login()}>
                                        <LogIn className="mr-1.5 size-3.5" /> Log in
                                    </Link>
                                </Button>
                                <Button asChild className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs h-9 shadow-md">
                                    <Link href={register()}>
                                        Daftar Akun Baru
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </nav>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto px-6 py-12 flex flex-col justify-center">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    <div className="lg:col-span-7 space-y-6">
                        <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1 text-xs font-semibold text-teal-800 dark:border-teal-900/60 dark:bg-teal-950/40 dark:text-teal-300">
                            <Sparkles className="size-3.5 text-teal-600 animate-pulse" />
                            <span>Solusi Transaksi Kasir & Resto Berkecepatan Tinggi</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-neutral-950 dark:text-white leading-[1.15]">
                            Aplikasi Kasir Pintar Modern, Cepat & Akurat.
                        </h1>

                        <p className="text-base text-neutral-600 dark:text-neutral-400 max-w-xl leading-relaxed">
                            Kelola pesanan pelanggan (Dine In & Take Away), antrian dapur (Order Line), katalog produk & stok, pembukuan arus kas, hingga cetak struk pembayaran thermal instan.
                        </p>

                        <div className="flex flex-wrap items-center gap-3 pt-2">
                            {auth?.user ? (
                                <>
                                    <Button asChild size="lg" className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm h-12 px-6 rounded-xl shadow-lg shadow-teal-700/20">
                                        <Link href={posUrl}>
                                            <ShoppingBag className="mr-2 size-4" /> Masuk ke Terminal Kasir (POS)
                                        </Link>
                                    </Button>
                                    <Button asChild size="lg" variant="outline" className="font-semibold text-sm h-12 px-6 rounded-xl">
                                        <Link href={dashboardUrl}>
                                            Buka Dashboard Ringkasan
                                        </Link>
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button asChild size="lg" className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm h-12 px-6 rounded-xl shadow-lg shadow-teal-700/20">
                                        <Link href={login()}>
                                            <LogIn className="mr-2 size-4" /> Masuk Aplikasi Kasir
                                        </Link>
                                    </Button>
                                    <Button asChild size="lg" variant="outline" className="font-semibold text-sm h-12 px-6 rounded-xl">
                                        <Link href={register()}>
                                            Registrasi Pengguna Baru
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </div>

                        <div className="mt-8 rounded-2xl border border-neutral-200/80 bg-white p-4.5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 max-w-md">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                                    Akun Demo Siap Pakai:
                                </span>
                                <span className="rounded bg-teal-100 text-teal-800 px-2 py-0.5 text-[10px] font-bold dark:bg-teal-950 dark:text-teal-300">
                                    Instant Access
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-neutral-50 dark:bg-neutral-800 p-2.5 rounded-lg border border-neutral-200/50 dark:border-neutral-700">
                                <div>
                                    <span className="text-neutral-400 block text-[10px]">Email:</span>
                                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">admin@kasir.com</span>
                                </div>
                                <div>
                                    <span className="text-neutral-400 block text-[10px]">Password:</span>
                                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">password</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 hover:border-teal-300 transition-colors">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 mb-3">
                                <ShoppingBag className="size-5" />
                            </div>
                            <h3 className="font-extrabold text-sm text-neutral-900 dark:text-neutral-100 mb-1">
                                Order Line (POS)
                            </h3>
                            <p className="text-xs text-neutral-500 leading-relaxed">
                                Terminal kasir responsif dengan antrian pesanan, katalog kategori, keranjang, dan kalkulator kembalian.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 hover:border-teal-300 transition-colors">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 mb-3">
                                <Printer className="size-5" />
                            </div>
                            <h3 className="font-extrabold text-sm text-neutral-900 dark:text-neutral-100 mb-1">
                                Cetak Struk Instan
                            </h3>
                            <p className="text-xs text-neutral-500 leading-relaxed">
                                Struk pembayaran otomatis siap cetak ke printer kasir thermal 58mm/80mm atau printer biasa.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 hover:border-teal-300 transition-colors">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 mb-3">
                                <UtensilsCrossed className="size-5" />
                            </div>
                            <h3 className="font-extrabold text-sm text-neutral-900 dark:text-neutral-100 mb-1">
                                Produk & Kelola Meja
                            </h3>
                            <p className="text-xs text-neutral-500 leading-relaxed">
                                CRUD produk, harga modal HPP, margin untung, peringatan stok tipis, serta status meja resto.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 hover:border-teal-300 transition-colors">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 mb-3">
                                <BarChart3 className="size-5" />
                            </div>
                            <h3 className="font-extrabold text-sm text-neutral-900 dark:text-neutral-100 mb-1">
                                Laporan & Buku Kas
                            </h3>
                            <p className="text-xs text-neutral-500 leading-relaxed">
                                Analitik omzet kotor, laba rugi bersih, buku kas operasional, dan top produk paling laris.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="border-t border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900 py-6 text-center text-xs text-neutral-500">
                <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p>© 2026 Kasir Cerdas POS • Didesain untuk Efisiensi & Produktivitas Kasir</p>
                    <p className="text-[11px] text-neutral-400">Laravel 12 • Inertia v3 • React 19 • Tailwind CSS</p>
                </div>
            </footer>
        </div>
    );
}