'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3, Bell, Boxes, BriefcaseBusiness, ChevronRight, CircleDollarSign,
  ClipboardList, FileText, Gift, LayoutDashboard, Megaphone, Package,
  Settings2, ShoppingBag, Sparkles, Tags, Users,
} from 'lucide-react';

const GROUPS = [
  {
    label: 'Commerce',
    items: [
      { icon: LayoutDashboard, label: 'Overview', href: '/admin' },
      { icon: ShoppingBag, label: 'Orders', href: '/admin/orders', badge: '24' },
      { icon: Package, label: 'Products', href: '/admin/products' },
      { icon: Boxes, label: 'Inventory', href: '/admin/products' },
      { icon: Users, label: 'Customers', href: '/admin/users' },
    ],
  },
  {
    label: 'Growth',
    items: [
      { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
      { icon: Megaphone, label: 'Campaigns', href: '/admin/deals' },
      { icon: Gift, label: 'Bundle Deals', href: '/admin/bundles' },
      { icon: Sparkles, label: 'AI Studio', href: '/admin/ai' },
      { icon: CircleDollarSign, label: 'Coupons', href: '/admin/coupons' },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { icon: Tags, label: 'Categories', href: '/admin/categories' },
      { icon: ClipboardList, label: 'Homepage Builder', href: '/admin/cms' },
      { icon: Bell, label: 'Notifications', href: '/admin/notifications' },
      { icon: FileText, label: 'Audit Log', href: '/admin/audit' },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-[#111827] text-white lg:flex">
      <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-lg font-black">N</span>
        <span><strong className="block text-sm">NexMart</strong><small className="text-[10px] text-slate-400">COMMERCE OS</small></span>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-6">
        {GROUPS.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">{group.label}</p>
            <div className="space-y-1">
              {group.items.map(({ icon: Icon, label, href, badge }) => {
                const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
                return (
                  <Link
                    key={`${group.label}-${label}`}
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                  >
                    <Icon className="h-[17px] w-[17px] shrink-0" />
                    <span className="flex-1">{label}</span>
                    {badge && <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${active ? 'bg-white/15 text-white' : 'bg-white/10 text-slate-400'}`}>{badge}</span>}
                    {!active && <ChevronRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-60" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 px-4 py-4">
        <Link href="/admin/settings" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white">
          <Settings2 className="h-[17px] w-[17px]" /> Settings
        </Link>
        <p className="px-3 pt-3 text-[10px] text-slate-600">NexMart Commerce OS · v2.0</p>
      </div>
    </aside>
  );
}
