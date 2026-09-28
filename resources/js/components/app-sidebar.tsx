import { Link, usePage } from '@inertiajs/react';
import {
    Armchair,
    ArrowLeftRight,
    BarChart3,
    BookOpen,
    FolderGit2,
    LayoutGrid,
    ShoppingBag,
    UtensilsCrossed,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { TeamSwitcher } from '@/components/team-switcher';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const page = usePage();
    const slug = (page.props.currentTeam as { slug?: string } | undefined)?.slug;
    const dashboardUrl = slug ? dashboard(slug) : '/';

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboardUrl,
            icon: LayoutGrid,
        },
        {
            title: 'Order Line (POS)',
            href: slug ? `/${slug}/pos` : '/pos',
            icon: ShoppingBag,
        },
        {
            title: 'Kelola Meja',
            href: slug ? `/${slug}/tables` : '/tables',
            icon: Armchair,
        },
        {
            title: 'Produk & Menu',
            href: slug ? `/${slug}/products` : '/products',
            icon: UtensilsCrossed,
        },
        {
            title: 'Buku Kas (Arus Kas)',
            href: slug ? `/${slug}/cash-flows` : '/cash-flows',
            icon: ArrowLeftRight,
        },
        {
            title: 'Laporan Penjualan',
            href: slug ? `/${slug}/reports` : '/reports',
            icon: BarChart3,
        },
    ];

    const footerNavItems: NavItem[] = [
        {
            title: 'Repository',
            href: 'https://github.com/laravel/react-starter-kit',
            icon: FolderGit2,
        },
        {
            title: 'Documentation',
            href: 'https://laravel.com/docs/starter-kits#react',
            icon: BookOpen,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboardUrl} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <TeamSwitcher />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
